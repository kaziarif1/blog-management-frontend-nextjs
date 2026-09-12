"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    BookOpen,
    Search,
    Menu,
    X,
    LogOut,
    ChevronDown,
    PlusCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getImageUrl, getUserFullName } from "../utils/formatters";

const NavbarContent = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("title") || "");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Sync search input with URL params
    useEffect(() => {
        setSearchQuery(searchParams.get("title") || "");
    }, [searchParams]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsDropdownOpen(false);
    }, [pathname]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        const searchKey = /^\d+$/.test(trimmed) ? "id" : "title";
        if (pathname === "/") {
            const currentCat = searchParams.get("category");
            const params = new URLSearchParams();
            if (trimmed) params.set(searchKey, trimmed);
            if (currentCat) params.set("category", currentCat);
            router.push(`/?${params.toString()}`);
        } else {
            router.push(trimmed ? `/?${searchKey}=${encodeURIComponent(trimmed)}` : "/");
        }
    };

    const avatarUrl = getImageUrl(user?.profileImage);
    const fullName = getUserFullName(user);

    return (
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-100 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Brand / Logo */}
                    <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
                                Blog<span className="text-emerald-600">Hub</span>
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-4">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title or blog ID..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/dashboard/blogs/create"
                                    className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/60"
                                >
                                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Write Blog
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                                            <img
                                                src={avatarUrl}
                                                alt={fullName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/default-avatar.svg";
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                                            {fullName}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in">
                                            <div className="px-4 py-2.5 border-b border-gray-100">
                                                <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {user?.email}
                                                </p>
                                                <span
                                                    className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${isAdmin
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                                        }`}
                                                >
                                                    {user?.role || "user"}
                                                </span>
                                            </div>

                                            <div className="pt-1 border-t border-gray-100">
                                                <button
                                                    onClick={logout}
                                                    className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2.5" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center space-x-2">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden pb-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title or blog ID..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </form>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-6 space-y-3">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-200 shrink-0">
                                    <img
                                        src={avatarUrl}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/default-avatar.svg";
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl text-left"
                                >
                                    <LogOut className="w-4 h-4 mr-3 text-rose-500" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="pt-2 flex flex-col space-y-2">
                            <Link
                                href="/login"
                                className="w-full py-2.5 text-center text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export const Navbar = (props) => {
    return (
        <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100" />}>
            <NavbarContent {...props} />
        </Suspense>
    );
};

export default Navbar;
