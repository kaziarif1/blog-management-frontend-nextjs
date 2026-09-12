"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    User,
    KeyRound,
    Users,
    LogOut,
    Menu,
    X,
    Shield,
    BookOpen,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, getUserFullName } from "../utils/formatters";

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, isAdmin, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            exact: true,
        },
        {
            label: isAdmin ? "All Blogs" : "My Blogs",
            href: "/dashboard/blogs",
            icon: FileText,
            exact: true,
        },
        {
            label: "Create Blog",
            href: "/dashboard/blogs/create",
            icon: PlusCircle,
            exact: true,
        },
        ...(isAdmin
            ? [
                  {
                      label: "Users",
                      href: "/admin/users",
                      icon: Users,
                      badge: "Admin",
                      exact: false,
                  },
              ]
            : []),
        {
            label: "Profile",
            href: "/dashboard/profile",
            icon: User,
            exact: true,
        },
        {
            label: "Change Password",
            href: "/dashboard/change-password",
            icon: KeyRound,
            exact: true,
        },
    ];

    const isLinkActive = (item) => {
        if (item.exact) {
            return pathname === item.href;
        }
        return pathname.startsWith(item.href);
    };

    const avatarUrl = getImageUrl(user?.profileImage);
    const fullName = getUserFullName(user);

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* User quick card in sidebar */}
            <div className="p-4 border-b border-gray-100 mb-2">
                <div className="flex items-center space-x-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-100 bg-gray-100 shrink-0 shadow-sm">
                        <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/default-avatar.svg";
                            }}
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{fullName}</h4>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isAdmin
                                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                            >
                                {isAdmin && <Shield className="w-2.5 h-2.5 mr-1" />}
                                {user?.role || "user"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                    const active = isLinkActive(item);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                active
                                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon
                                    className={`w-4 h-4 ${
                                        active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                                    }`}
                                />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && (
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                        active
                                            ? "bg-white/20 text-white"
                                            : "bg-purple-100 text-purple-700"
                                    }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout bottom button */}
            <div className="p-3 border-t border-gray-100 mt-auto">
                <button
                    onClick={() => {
                        setIsMobileOpen(false);
                        logout();
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
                >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Drawer Trigger Bar */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-700 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <Menu className="w-4 h-4" />
                    <span>Dashboard Menu</span>
                </button>
                <span className="text-xs font-medium text-gray-500">
                    Logged in as <strong className="text-gray-800">{fullName}</strong>
                </span>
            </div>

            {/* Mobile Overlay & Drawer */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-slide-right">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <span className="font-extrabold text-base text-gray-900">Dashboard Menu</span>
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {sidebarContent}
                    </div>
                </div>
            )}

            {/* Desktop Fixed Sidebar */}
            <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;
