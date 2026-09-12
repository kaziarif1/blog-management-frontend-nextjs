import api from "../utils/api";

export const userService = {
    getProfile: async () => {
        return await api.get("/users/profile");
    },

    updateProfile: async ({ firstname, lastname }) => {
        return await api.put("/users/profile/update", { firstname, lastname });
    },

    updatePassword: async (password) => {
        return await api.patch("/users/password", { password });
    },

    uploadProfileImage: async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return await api.patch("/users/profile/image", formData);
    },

    // Admin endpoints
    getAllUsers: async () => {
        return await api.get("/users");
    },

    getUserById: async (id) => {
        return await api.get(`/users/${id}`);
    },

    updateUserStatus: async (id, isActive) => {
        return await api.patch(`/users/${id}/status`, { isActive });
    },
};

export default userService;
