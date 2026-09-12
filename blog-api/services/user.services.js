import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { validatePassword, isNonEmptyString, MIN_PASSWORD_LENGTH } from "../utils/validateFields.js";

const SALT_ROUNDS = 10;

// Fields that are ever safe to return to a client. Password is always excluded.
const SAFE_ATTRIBUTES = ["id", "firstname", "lastname", "email", "isActive", "role", "profileImage", "createAt", "updateAt"];

export const getAllUsers = async () => {
    return User.findAll({ attributes: SAFE_ATTRIBUTES });
};

export const getUserById = async (id) => {
    if (!id || isNaN(Number(id))) {
        const error = new Error("Invalid user id");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findByPk(id, { attributes: SAFE_ATTRIBUTES });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

export const updateUserStatus = async (id, isActive) => {
    if (!id || isNaN(Number(id))) {
        const error = new Error("Invalid user id");
        error.statusCode = 400;
        throw error;
    }

    if (typeof isActive !== "boolean") {
        const error = new Error("isActive must be a boolean (true or false)");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findByPk(id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.isActive = isActive;
    await user.save();

    return user;
};

export const getProfile = async (userId) => {
    const user = await User.findByPk(userId, { attributes: SAFE_ATTRIBUTES });
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
};

// Only firstname/lastname may be changed here. role and isActive from the
// request body are always ignored, even if provided.
export const updateProfile = async (userId, { firstname, lastname }) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (firstname !== undefined) {
        if (!isNonEmptyString(firstname)) {
            const error = new Error("firstname cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        user.firstname = firstname;
    }

    if (lastname !== undefined) {
        if (!isNonEmptyString(lastname)) {
            const error = new Error("lastname cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        user.lastname = lastname;
    }

    await user.save();
    return user;
};

export const updatePassword = async (userId, password) => {
    if (!validatePassword(password)) {
        const error = new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    await user.save();
};

export const updateProfileImage = async (userId, imageUrl) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    user.profileImage = imageUrl;
    await user.save();

    return {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        profileImage: user.profileImage,
    };
};
