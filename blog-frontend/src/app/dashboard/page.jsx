"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { blogService } from "../../services/blog.service";
import { BlogCard } from "../../components/BlogCard";
import { CardSkeleton } from "../../components/Loader";
import { Alert } from "../../components/Alert";
import { getUserFullName, getImageUrl, formatDate } from "../../utils/formatters";
import {
    PlusCircle,
    FileText,
    BookOpen,
    User,
    Shield,
    Calendar,
    ArrowRight,
    TrendingUp,
    Sparkles,
} from "lucide-react";

export default function DashboardPage() {
    const { user, isAdmin } = useAuth();
    const [allBlogs, setAllBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const data = await blogService.getAllBlogs();
                setAllBlogs(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const fullName = getUserFullName(user);
    const avatarUrl = getImageUrl(user?.profileImage);

    // Filter user's own blogs
    const myBlogs = allBlogs.filter(
        (b) => b.author?.id === user?.id || b.userId === user?.id
    );

    // Calculate categories count from user's blogs
    const myCategoriesCount = new Set(myBlogs.map((b) => b.category).filter(Boolean)).size;

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        {isAdmin ? "Administrator Workspace" : "Author Workspace"}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Welcome back, {fullName}!
                    </h1>
                    <p className="text-emerald-50 text-sm leading-relaxed">
                        Manage your published articles, monitor your content footprint, or craft your next story.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/dashboard/blogs/create"
                        className="inline-flex items-center px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 text-sm font-bold rounded-xl shadow-sm transition-all"
                    >
                        <PlusCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Quick Create Blog
                    </Link>
                    <Link
                        href="/dashboard/profile"
                        className="inline-flex items-center px-4 py-2.5 bg-emerald-800/40 hover:bg-emerald-800/60 text-white text-sm font-semibold rounded-xl backdrop-blur-sm transition-colors border border-white/20"
                    >
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                    </Link>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Statistics Cards (Calculated directly from real API data) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {isAdmin ? "Total Platform Blogs" : "Total Community Blogs"}
                        </p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-2">
                            {isLoading ? "..." : allBlogs.length}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                            Available in public catalog
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            My Published Blogs
                        </p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-2">
                            {isLoading ? "..." : myBlogs.length}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                            Authored by you
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Topics Covered
                        </p>
                        <p className="text-3xl font-extrabold text-gray-900 mt-2">
                            {isLoading ? "..." : myCategoriesCount}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                            Unique categories used
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Profile Information Snippet */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-100 bg-gray-100 shrink-0 shadow-sm">
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/default-avatar.svg";
                                }}
                            />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                isAdmin
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                        >
                            <Shield className="w-3.5 h-3.5 mr-1" />
                            {user?.role}
                        </span>
                        <Link
                            href="/dashboard/profile"
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                            Edit Profile & Avatar
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-gray-600">
                    <div>
                        <span className="text-gray-400 block font-medium">Account Status</span>
                        <span className="font-semibold text-emerald-600 flex items-center mt-0.5">
                            ● Active Account
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400 block font-medium">Member Since</span>
                        <span className="font-semibold text-gray-800 mt-0.5 block">
                            {formatDate(user?.createAt || user?.createdAt)}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-400 block font-medium">Author ID</span>
                        <span className="font-semibold text-gray-800 mt-0.5 block">#{user?.id}</span>
                    </div>
                </div>
            </div>

            {/* Recent Blogs Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {myBlogs.length > 0 ? "Your Recent Blogs" : "Recent Platform Blogs"}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {myBlogs.length > 0
                                ? "Articles you authored recently"
                                : "No articles published by you yet. Here are recent posts from the community:"}
                        </p>
                    </div>
                    <Link
                        href="/dashboard/blogs"
                        className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                        <span>Manage All</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : (myBlogs.length > 0 ? myBlogs : allBlogs).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {(myBlogs.length > 0 ? myBlogs : allBlogs).slice(0, 3).map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto">
                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800">No blogs yet</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Get started by publishing your very first article today!
                        </p>
                        <Link
                            href="/dashboard/blogs/create"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                            Write Your First Blog
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
