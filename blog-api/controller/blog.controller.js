import * as blogService from "../services/blog.services.js";

export const createBlog = async (req, res) => {
    try {
        const blog = await blogService.createBlog(req.user.id, req.body);
        res.status(201).json({ message: "Blog created successfully", blog });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await blogService.getAllBlogs(req.query);
        res.status(200).json(blogs);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await blogService.getBlogById(req.params.id);
        res.status(200).json(blog);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await blogService.updateBlog(req.params.id, req.user, req.body);
        res.status(200).json({ message: "Blog updated successfully", blog });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        await blogService.deleteBlog(req.params.id, req.user);
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
