import { getToken, clearAuth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiError extends Error {
    constructor(message, statusCode, data = null) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.data = data;
    }
}

const mapErrorMessage = (message) => {
    if (!message) return "Something went wrong. Please try again.";
    const normalized = message.toLowerCase();
    if (normalized.includes("already registered")) return "Email already exists.";
    if (normalized.includes("invalid email or password")) return "Invalid email or password.";
    if (normalized.includes("blog not found")) return "Blog not found.";
    if (normalized.includes("not authorized to update")) return "You are not authorized to update this blog.";
    if (normalized.includes("deactivated")) {
        if (normalized.includes("contact")) return "Your account has been deactivated.";
        return message;
    }
    return message;
};

const request = async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    
    const headers = {
        ...(options.headers || {}),
    };

    const token = getToken();
    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    // If body is FormData, do not set Content-Type (browser will set multipart boundary automatically)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = text ? { message: text } : null;
        }

        if (!response.ok) {
            // If unauthorized on protected resource, notify session expired
            if (response.status === 401 && typeof window !== "undefined") {
                // Only clear token if we had one and got 401 (avoid clearing on login failures)
                if (token && !endpoint.includes("/auth/login")) {
                    clearAuth();
                    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
                }
            }

            const errorMessage = data?.message || response.statusText || `Request failed with status ${response.status}`;
            throw new ApiError(mapErrorMessage(errorMessage), response.status, data);
        }

        return data;
    } catch (err) {
        if (err instanceof ApiError) {
            throw err;
        }
        throw new ApiError(err.message || "Network error. Please check your connection.", 0);
    }
};

export const api = {
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
    post: (endpoint, body, options = {}) =>
        request(endpoint, {
            ...options,
            method: "POST",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    put: (endpoint, body, options = {}) =>
        request(endpoint, {
            ...options,
            method: "PUT",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    patch: (endpoint, body, options = {}) =>
        request(endpoint, {
            ...options,
            method: "PATCH",
            body: body instanceof FormData ? body : JSON.stringify(body),
        }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};

export default api;
