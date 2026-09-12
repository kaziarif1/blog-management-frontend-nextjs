const TOKEN_KEY = "blog_auth_token";
const USER_KEY = "blog_auth_user";

export const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
};

export const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    try {
        const item = localStorage.getItem(USER_KEY);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export const setStoredUser = (user) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeStoredUser = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
};

export const clearAuth = () => {
    removeToken();
    removeStoredUser();
};
