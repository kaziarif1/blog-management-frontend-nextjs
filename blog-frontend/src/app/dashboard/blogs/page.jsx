"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { blogService } from "../../../services/blog.service";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Alert } from "../../../components/Alert";
import { PageLoader, Spinner } from "../../../components/Loader";
import { formatDate, getUserFullName, getImageUrl } from "../../../utils/formatters";
import {
    PlusCircle,
    Edit3,
    Trash2,
    FileText,
    ExternalLink,
    Search,
    Filter,
    Shield,
    Calendar,
    Tag,
} from "lucide-react";

function BlogManagementContent() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState(isAdmin ? "all" : "my");
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (searchParams.get("created") === "1") {
            setAlert({ type: "success", message: "Blog published successfully." });
        } else if (searchParams.get("updated") === "1") {
            setAlert({ type: "success", message: "Blog updated successfully." });
        }
    }, [searchParams]);

    // Deletion state
    const [blogToDelete, setBlogToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadBlogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await blogService.getAllBlogs();
            setBlogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setAlert({ type: "error", message: err.message || "Failed to load blogs" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBlogs();
    }, [loadBlogs]);

    // Determine blogs to display
    const displayedBlogs = blogs.filter((blog) => {
        // Tab filtering
        if (selectedTab === "my") {
            const isMyBlog = blog.author?.id === user?.id || blog.userId === user?.id;
            if (!isMyBlog) return false;
        }

        // Search filtering
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const matchTitle = blog.blogTitle?.toLowerCase().includes(term);
            const matchCategory = blog.category?.toLowerCase().includes(term);
            const matchAuthor = getUserFullName(blog.author)?.toLowerCase().includes(term);
            return matchTitle || matchCategory || matchAuthor;
        }

        return true;
    });

    const handleDeleteClick = (blog) => {
        setBlogToDelete(blog);
    };

    const handleConfirmDelete = async () => {
        if (!blogToDelete) return;
        setIsDeleting(true);
        try {
            await blogService.deleteBlog(blogToDelete.id);
            setAlert({
                type: "success",
                message: `Blog "${blogToDelete.blogTitle}" deleted successfully!`,
            });
            // Refresh list
            setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
            setBlogToDelete(null);
        } catch (err) {
            setAlert({
                type: "error",
                message: err.message || "Failed to delete blog. You might not have permission.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const canModify = (blog) => {
        if (isAdmin) return true;
        return blog.author?.id === user?.id || blog.userId === user?.id;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Blog Management
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {isAdmin
                            ? "View, edit, or delete all blogs across the platform as administrator"
                            : "Create, edit, and organize your published articles"}
                    </p>
                </div>

                <Link
                    href="/dashboard/blogs/create"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-colors shrink-0"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Write New Blog
                </Link>
            </div>

            {/* Alert Banner */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                {/* Admin Tabs */}
                {isAdmin ? (
                    <div className="flex items-center p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setSelectedTab("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTab === "all"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            All Platform Blogs ({blogs.length})
                        </button>
                        <button
                            onClick={() => setSelectedTab("my")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTab === "my"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            My Blogs (
                            {blogs.filter((b) => b.author?.id === user?.id || b.userId === user?.id).length}
                            )
                        </button>
                    </div>
                ) : (
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        My Published Blogs ({displayedBlogs.length})
                    </div>
                )}

                {/* Local search */}
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filter list by title, author, category..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* Table & Cards Content */}
            {isLoading ? (
                <PageLoader text="Loading blog catalog..." />
            ) : displayedBlogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                        {searchTerm
                            ? "No matching blogs found"
                            : selectedTab === "my"
                                ? "You haven't created any blogs yet"
                                : "No blogs found"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {searchTerm
                            ? "Try refining or clearing your search term above."
                            : "Start publishing informative content by clicking Create Blog."}
                    </p>
                    <Link
                        href="/dashboard/blogs/create"
                        className="mt-5 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                    >
                        <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                        Create Blog
                    </Link>
                </div>
            ) : (
                <>
                    <div className="md:hidden space-y-3">
                        {displayedBlogs.map((blog) => {
                            const authorName = getUserFullName(blog.author);
                            const isEditable = canModify(blog);
                            return (
                                <div key={blog.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <Link
                                                href={`/blogs/${blog.id}`}
                                                className="font-bold text-gray-900 hover:text-emerald-600"
                                            >
                                                {blog.blogTitle}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Blog #{blog.id} · {blog.category || "General"}
                                            </p>
                                        </div>
                                        {isEditable && (
                                            <div className="flex items-center space-x-1 shrink-0">
                                                <Link
                                                    href={`/dashboard/blogs/${blog.id}/edit`}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteClick(blog)}
                                                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {authorName} · {formatDate(blog.createAt || blog.createdAt)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-left">
                                <thead className="bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-6 pr-3">
                                            Title
                                        </th>
                                        <th scope="col" className="px-3 py-3.5">
                                            Category
                                        </th>
                                        <th scope="col" className="px-3 py-3.5">
                                            Author
                                        </th>
                                        <th scope="col" className="px-3 py-3.5">
                                            Created Date
                                        </th>
                                        <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs">
                                    {displayedBlogs.map((blog) => {
                                        const authorName = getUserFullName(blog.author);
                                        const authorImage = getImageUrl(blog.author?.profileImage);
                                        const isEditable = canModify(blog);

                                        return (
                                            <tr key={blog.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="py-4 pl-6 pr-3 max-w-xs sm:max-w-sm">
                                                    <p className="text-[11px] font-semibold text-gray-400 mb-0.5">
                                                        Blog #{blog.id}
                                                    </p>
                                                    <Link
                                                        href={`/blogs/${blog.id}`}
                                                        className="font-bold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1 flex items-center group"
                                                    >
                                                        <span>{blog.blogTitle}</span>
                                                        <ExternalLink className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                                                    </Link>
                                                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                                        {blog.blog}
                                                    </p>
                                                </td>

                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        {blog.category || "General"}
                                                    </span>
                                                </td>

                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                                            <img
                                                                src={authorImage}
                                                                alt={authorName}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = "/default-avatar.svg";
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="font-semibold text-gray-800 truncate">
                                                            {authorName}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-3 py-4 whitespace-nowrap text-gray-500 font-medium">
                                                    {formatDate(blog.createAt || blog.createdAt)}
                                                </td>

                                                <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                                                    {isEditable ? (
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <Link
                                                                href={`/dashboard/blogs/${blog.id}/edit`}
                                                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Edit Blog"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteClick(blog)}
                                                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Delete Blog"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 italic">
                                                            Read-only
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!blogToDelete}
                title="Delete Blog Post"
                message={`Are you sure you want to delete "${blogToDelete?.blogTitle}"? This action cannot be undone.`}
                confirmText="Delete Post"
                cancelText="Keep Post"
                isDestructive={true}
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setBlogToDelete(null)}
            />
        </div>
    );
}

export default function BlogManagementPage() {
    return (
        <Suspense fallback={<PageLoader text="Loading blogs..." />}>
            <BlogManagementContent />
        </Suspense>
    );
}
