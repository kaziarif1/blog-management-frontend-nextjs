import { registerUser, loginUser, forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from "../services/auth.services.js";

export const signup = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    try {
        const user = await registerUser({ firstname, lastname, email, password });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, user } = await loginUser({ email, password });
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const result = await forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const result = await resetPasswordService(token, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
