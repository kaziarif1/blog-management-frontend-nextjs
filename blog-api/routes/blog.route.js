import { Router } from "express";
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
} from "../controller/blog.controller.js";
import authMiddleWare from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/blogs/create", authMiddleWare, createBlog);
router.get("/blogs", getAllBlogs); // public — supports ?title= and ?category=
router.put("/blogs/update/:id", authMiddleWare, updateBlog);
router.delete("/blogs/delete/:id", authMiddleWare, deleteBlog);
router.delete("/blogs/:id", authMiddleWare, deleteBlog); // matches the original assignment doc
router.get("/blogs/:id", getBlogById); // public — kept below /update and /delete

export default router;
