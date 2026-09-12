import { Op } from "sequelize";
import { Blog, User } from "../models/index.js";
import { isNonEmptyString } from "../utils/validateFields.js";

const AUTHOR_ATTRIBUTES = ["id", "firstname", "lastname", "profileImage"];

export const createBlog = async (userId, { blogTitle, blog, category }) => {
    if (!isNonEmptyString(blogTitle) || !isNonEmptyString(blog) || !isNonEmptyString(category)) {
        const error = new Error("blogTitle, blog and category are all required");
        error.statusCode = 400;
        throw error;
    }

    // userId always comes from the authenticated user, never from the request body.
    return Blog.create({ userId, blogTitle, blog, category });
};

export const getAllBlogs = async ({ title, category }) => {
    const where = {};

    if (title) {
        where.blogTitle = { [Op.like]: `%${title}%` };
    }

    if (category) {
        where.category = { [Op.like]: `%${category}%` };
    }

    return Blog.findAll({
        where,
        include: [{ model: User, as: "author", attributes: AUTHOR_ATTRIBUTES }],
        order: [["createAt", "DESC"]],
    });
};

export const getBlogById = async (id) => {
    if (!id || isNaN(Number(id))) {
        const error = new Error("Invalid blog id");
        error.statusCode = 400;
        throw error;
    }

    const blog = await Blog.findByPk(id, {
        include: [{ model: User, as: "author", attributes: AUTHOR_ATTRIBUTES }],
    });

    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    return blog;
};

const assertCanModify = (existingBlog, currentUser) => {
    const isOwner = existingBlog.userId === currentUser.id;
    const isAdmin = currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
        const error = new Error("You are not authorized to modify this blog.");
        error.statusCode = 403;
        throw error;
    }
};

export const updateBlog = async (id, currentUser, { blogTitle, blog: blogContent, category }) => {
    if (!id || isNaN(Number(id))) {
        const error = new Error("Invalid blog id");
        error.statusCode = 400;
        throw error;
    }

    const existingBlog = await Blog.findByPk(id);
    if (!existingBlog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    try {
        assertCanModify(existingBlog, currentUser);
    } catch (error) {
        error.message = "You are not authorized to update this blog.";
        throw error;
    }

    if (blogTitle !== undefined) {
        if (!isNonEmptyString(blogTitle)) {
            const error = new Error("blogTitle cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        existingBlog.blogTitle = blogTitle;
    }

    if (blogContent !== undefined) {
        if (!isNonEmptyString(blogContent)) {
            const error = new Error("blog content cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        existingBlog.blog = blogContent;
    }

    if (category !== undefined) {
        if (!isNonEmptyString(category)) {
            const error = new Error("category cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        existingBlog.category = category;
    }

    await existingBlog.save();
    return existingBlog;
};

export const deleteBlog = async (id, currentUser) => {
    if (!id || isNaN(Number(id))) {
        const error = new Error("Invalid blog id");
        error.statusCode = 400;
        throw error;
    }

    const existingBlog = await Blog.findByPk(id);
    if (!existingBlog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    try {
        assertCanModify(existingBlog, currentUser);
    } catch (error) {
        error.message = "You are not authorized to delete this blog.";
        throw error;
    }

    await existingBlog.destroy();
};
