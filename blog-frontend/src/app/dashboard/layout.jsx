"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import { PageLoader } from "../../components/Loader";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardLayout({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <PageLoader text="Verifying your credentials..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Navbar />
            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
                <Sidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
            </div>
        </div>
    );
}
