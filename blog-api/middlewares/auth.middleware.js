import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

// Verifies the "Authorization: Bearer <token>" header, decodes the JWT,
// loads the current user from the database, and attaches it to req.user
// so downstream controllers/middleware know who is making the request.
const authMiddleWare = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
        return res.status(401).json({ message: "User belonging to this token no longer exists" });
    }

    if (!user.isActive) {
        return res.status(401).json({ message: "This account has been deactivated" });
    }

    req.user = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
    };

    next();
};

// Must run AFTER authMiddleWare, since it relies on req.user being set.
export const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only" });
    }
    next();
};

export default authMiddleWare;
