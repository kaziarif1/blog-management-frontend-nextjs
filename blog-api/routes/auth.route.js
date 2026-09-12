import { Router } from "express";
import { signup, login, forgotPassword, resetPassword } from "../controller/auth.controller.js";

const router = Router();

router.post("/auth/register", signup);
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.patch("/auth/reset-password/:token", resetPassword);

export default router;
