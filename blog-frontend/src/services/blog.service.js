import api from "../utils/api";

export const blogService = {
    getAllBlogs: async ({ title, category } = {}) => {
        const params = new URLSearchParams();
        if (title && title.trim()) {
            params.append("title", title.trim());
        }
        if (category && category.trim() && category !== "All") {
            params.append("category", category.trim());
        }
        const queryString = params.toString();
        const endpoint = queryString ? `/blogs?${queryString}` : "/blogs";
        return await api.get(endpoint);
    },

    getBlogById: async (id) => {
        return await api.get(`/blogs/${id}`);
    },

    createBlog: async ({ blogTitle, blog, category }) => {
        // Do NOT send userId; backend gets it from JWT!
        return await api.post("/blogs/create", {
            blogTitle,
            blog,
            category,
        });
    },

    updateBlog: async (id, { blogTitle, blog, category }) => {
        return await api.put(`/blogs/update/${id}`, {
            blogTitle,
            blog,
            category,
        });
    },

    deleteBlog: async (id) => {
        return await api.delete(`/blogs/delete/${id}`);
    },
};

export default blogService;
