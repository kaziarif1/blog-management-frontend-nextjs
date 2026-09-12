import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { validateEmail } from "../utils/validateEmail.js";
import { validatePassword, isNonEmptyString, MIN_PASSWORD_LENGTH } from "../utils/validateFields.js";

const SALT_ROUNDS = 10;

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

    return {
        message: "Password reset link generated successfully. In production this link would be sent to the user's email.",
        resetToken,
        resetLink,
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
