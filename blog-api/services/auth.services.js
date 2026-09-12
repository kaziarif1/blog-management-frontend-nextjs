import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../models/index.js";
import { validateEmail } from "../utils/validateEmail.js";
import { validatePassword, isNonEmptyString, MIN_PASSWORD_LENGTH } from "../utils/validateFields.js";

const SALT_ROUNDS = 10;

const createMailer = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        const error = new Error("Gmail SMTP credentials are not configured. Set EMAIL_USER and EMAIL_PASS in your .env file.");
        error.statusCode = 500;
        throw error;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT || 587),
        secure: Number(process.env.EMAIL_PORT || 587) === 465,
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
};

const sendPasswordResetEmail = async (toEmail, resetLink) => {
    const transporter = createMailer();
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    await transporter.sendMail({
        from,
        to: toEmail,
        subject: "Reset your password",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
                <h2 style="margin-bottom: 12px;">Password reset request</h2>
                <p>You requested a password reset for your account.</p>
                <p>
                    <a href="${resetLink}" style="display: inline-block; background: #059669; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;">
                        Reset Password
                    </a>
                </p>
                <p>If the button does not work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #0f172a;">${resetLink}</p>
                <p>This link expires in 1 hour.</p>
            </div>
        `,
    });
};

// Registers a brand new user. Always forces role "user" and isActive true —
// the client can never assign themselves the admin role here, no matter
// what is sent in the request body.
export const registerUser = async ({ firstname, lastname, email, password }) => {
    if (!isNonEmptyString(firstname) || !isNonEmptyString(lastname) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
        const error = new Error("firstname, lastname, email and password are all required");
        error.statusCode = 400;
        throw error;
    }

    if (!validateEmail(email)) {
        const error = new Error("Please provide a valid email address");
        error.statusCode = 400;
        throw error;
    }

    if (!validatePassword(password)) {
        const error = new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        // role and isActive are intentionally NOT taken from the caller;
        // they always use the model defaults ("user" / true).
    });

    return user;
};

// Authenticates a user and issues a JWT. Rejects wrong credentials and
// deactivated accounts.
export const loginUser = async ({ email, password }) => {
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        const error = new Error("email and password are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Your account has been deactivated. Contact an administrator.");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
    );

    return { token, user };
};

export const forgotPassword = async (email) => {
    if (!isNonEmptyString(email)) {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
    }

    if (!validateEmail(email)) {
        const error = new Error("Please provide a valid email address");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        const error = new Error("No user found with this email address");
        error.statusCode = 404;
        throw error;
    }

    const resetToken = jwt.sign(
        { id: user.id, email: user.email, purpose: "password-reset" },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    try {
        await sendPasswordResetEmail(user.email, resetLink);
    } catch (error) {
        const mailError = new Error("Unable to send password reset email right now. Please try again later.");
        mailError.statusCode = error.statusCode || 500;
        throw mailError;
    }

    const includeResetLinkInResponse = process.env.SEND_RESET_LINK_IN_RESPONSE === "true";

    if (includeResetLinkInResponse) {
        return {
            message: "Password reset link generated and sent successfully.",
            resetToken,
            resetLink,
        };
    }

    return {
        message: "If an account exists for this email, a password reset link has been sent.",
    };
};

export const resetPassword = async (token, newPassword) => {
    if (!token) {
        const error = new Error("Reset token is required");
        error.statusCode = 400;
        throw error;
    }

    if (!validatePassword(newPassword)) {
        const error = new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        error.statusCode = 400;
        throw error;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        const error = new Error("Invalid or expired reset token");
        error.statusCode = 400;
        throw error;
    }

    if (decoded.purpose !== "password-reset") {
        const error = new Error("Invalid reset token purpose");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { message: "Password has been reset successfully" };
};
