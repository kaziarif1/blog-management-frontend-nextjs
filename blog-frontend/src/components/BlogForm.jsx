"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Spinner } from "./Loader";
import { Alert } from "./Alert";

const COMMON_CATEGORIES = [
    "Testing",
    "Playwright",
    "Development",
    "JavaScript",
    "React",
    "Node.js",
    "DevOps",
    "General",
];

export const BlogForm = ({
    initialData = { blogTitle: "", blog: "", category: "" },
    onSubmit,
    isSubmitting = false,
    titleText = "Create New Blog",
    submitButtonText = "Publish Blog",
    submittingText = "Saving...",
    serverError = null,
}) => {
    const [formData, setFormData] = useState({
        blogTitle: "",
        category: "",
        blog: "",
    });
    const [clientError, setClientError] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData({
                blogTitle: initialData.blogTitle ?? "",
                category: initialData.category ?? "",
                blog: initialData.blog ?? "",
            });
        }
    }, [initialData?.blogTitle, initialData?.category, initialData?.blog]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (clientError) setClientError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientError("");

        if (!formData.blogTitle.trim()) {
            setClientError("Blog title is required");
            return;
        }

        if (!formData.category.trim()) {
            setClientError("Please choose or enter a category");
            return;
        }

        if (!formData.blog.trim()) {
            setClientError("Blog content is required");
            return;
        }

        if (formData.blog.trim().length < 10) {
            setClientError("Blog content should be at least 10 characters long");
            return;
        }

        // Submitting only blogTitle, category, blog. userId is NOT sent!
        onSubmit({
            blogTitle: formData.blogTitle.trim(),
            category: formData.category.trim(),
            blog: formData.blog.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                    <Link
                        href="/dashboard/blogs"
                        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                        Back to Blogs
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{titleText}</h1>
                </div>

                <div className="flex items-center space-x-3">
                    <Link
                        href="/dashboard/blogs"
                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" className="mr-2 text-white" />
                                {submittingText}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {submitButtonText}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {clientError && <Alert type="error" message={clientError} onClose={() => setClientError("")} />}
            {serverError && <Alert type="error" message={serverError} />}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="blogTitle" className="block text-sm font-bold text-gray-700 mb-2">
                        Blog Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                        id="blogTitle"
                        type="text"
                        value={formData.blogTitle}
                        onChange={(e) => handleChange("blogTitle", e.target.value)}
                        placeholder="e.g. Getting Started with End-to-End Testing in Playwright"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Category */}
                <div>
                    <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">
                        Category <span className="text-rose-500">*</span>
                    </label>
                    <input
                        id="category"
                        type="text"
                        value={formData.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                        placeholder="Choose a suggestion below or type your own"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all mb-3"
                    />
                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-400 font-medium py-1">Suggestions:</span>
                        {COMMON_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleChange("category", cat)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${formData.category.toLowerCase() === cat.toLowerCase()
                                        ? "bg-emerald-600 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label htmlFor="blog" className="block text-sm font-bold text-gray-700 mb-2">
                        Blog Content <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        id="blog"
                        rows={12}
                        value={formData.blog}
                        onChange={(e) => handleChange("blog", e.target.value)}
                        placeholder="Write your article content here..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all leading-relaxed"
                    />
                    <p className="mt-2 text-xs text-gray-400 text-right">
                        {formData.blog.length} characters
                    </p>
                </div>
            </div>
        </form>
    );
};

export default BlogForm;
