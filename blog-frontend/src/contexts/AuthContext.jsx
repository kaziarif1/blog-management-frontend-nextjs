"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken, clearAuth, getStoredUser, setStoredUser } from "../utils/auth";
import { userService } from "../services/user.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const logout = useCallback(() => {
        clearAuth();
        setUser(null);
        setTokenState(null);
        router.push("/login");
    }, [router]);

    const refreshProfile = useCallback(async () => {
        try {
            const profile = await userService.getProfile();
            setUser(profile);
            setStoredUser(profile);
            return profile;
        } catch (error) {
            if (error.statusCode === 401) {
                logout();
            }
            throw error;
        }
    }, [logout]);

    const login = useCallback(async (newToken, initialUser = null) => {
        setToken(newToken);
        setTokenState(newToken);
        if (initialUser) {
            setUser(initialUser);
            setStoredUser(initialUser);
        }
        try {
            const profile = await userService.getProfile();
            setUser(profile);
            setStoredUser(profile);
        } catch (err) {
            // Keep initialUser if profile fetch fails
            if (initialUser) {
                setUser(initialUser);
            }
        }
    }, []);

    const updateUser = useCallback((userData) => {
        setUser((prev) => {
            const updated = { ...prev, ...userData };
            setStoredUser(updated);
            return updated;
        });
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = getToken();
            const cachedUser = getStoredUser();

            if (storedToken) {
                setTokenState(storedToken);
                if (cachedUser) {
                    setUser(cachedUser);
                }
                try {
                    const freshProfile = await userService.getProfile();
                    setUser(freshProfile);
                    setStoredUser(freshProfile);
                } catch (error) {
                    if (error.statusCode === 401) {
                        clearAuth();
                        setUser(null);
                        setTokenState(null);
                    }
                }
            }
            setIsLoading(false);
        };

        initAuth();

        const handleUnauthorized = () => {
            clearAuth();
            setUser(null);
            setTokenState(null);
            router.push("/login");
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => {
            window.removeEventListener("auth:unauthorized", handleUnauthorized);
        };
    }, [router]);

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        logout,
        refreshProfile,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
