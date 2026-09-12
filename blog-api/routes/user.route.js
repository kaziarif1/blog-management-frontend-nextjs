import { Router } from "express";
import {
    getUsers,
    getUserById,
    updateUserStatus,
    getProfile,
    updateProfile,
    updatePassword,
    uploadProfileImage,
} from "../controller/user.controller.js";
import authMiddleWare, { isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Specific routes are declared BEFORE the dynamic /:id route, otherwise
// Express would treat "profile" as an :id value.
router.get("/users/profile", authMiddleWare, getProfile);
router.put("/users/profile/update", authMiddleWare, updateProfile);
router.patch("/users/profile/image", authMiddleWare, upload.single("image"), uploadProfileImage);
router.patch("/users/password", authMiddleWare, updatePassword);

router.get("/users", authMiddleWare, isAdmin, getUsers);
router.get("/users/:id", authMiddleWare, isAdmin, getUserById);
router.patch("/users/:id/status", authMiddleWare, isAdmin, updateUserStatus);

export default router;
