import api from "../utils/api";

export const authService = {
    register: async ({ firstname, lastname, email, password }) => {
        return await api.post("/auth/register", {
            firstname,
            lastname,
            email,
            password,
        });
    },

    login: async ({ email, password }) => {
        return await api.post("/auth/login", {
            email,
            password,
        });
    },

    forgotPassword: async (email) => {
        return await api.post("/auth/forgot-password", { email });
    },

    resetPassword: async (token, password) => {
        return await api.patch(`/auth/reset-password/${token}`, { password });
    },
};

export default authService;
