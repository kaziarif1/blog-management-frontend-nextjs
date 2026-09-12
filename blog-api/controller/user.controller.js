import * as userService from "../services/user.services.js";

export const getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const user = await userService.updateUserStatus(req.params.id, req.body.isActive);
        res.status(200).json({
            message: `User has been ${user.isActive ? "activated" : "deactivated"}`,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                isActive: user.isActive,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                isActive: user.isActive,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        await userService.updatePassword(req.user.id, req.body.password);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        const user = await userService.updateProfileImage(req.user.id, imageUrl);
        res.status(200).json({
            message: "Profile image uploaded successfully",
            profileImage: imageUrl,
            user,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
