"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { PageLoader } from "../../../components/Loader";
import { blogService } from "../../../services/blog.service";
import { formatDate, formatDateTime, getImageUrl, getUserFullName } from "../../../utils/formatters";
import {
    ArrowLeft,
    Calendar,
    Tag,
    User,
    AlertCircle,
    BookOpen,
    Clock,
    Share2,
    Check,
} from "lucide-react";

export default function BlogDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return;

        const loadBlog = async () => {
            setIsLoading(true);
            setNotFound(false);
            setError(null);
            try {
                const data = await blogService.getBlogById(id);
                setBlog(data);
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 400) {
                    setNotFound(true);
                } else {
                    setError(err.message || "Failed to load the blog post.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadBlog();
    }, [id]);

    const handleShare = async () => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            // ignore
        }
    };

    const authorName = getUserFullName(blog?.author);
    const authorImage = getImageUrl(blog?.author?.profileImage);
    const dateFormatted = formatDateTime(blog?.createAt || blog?.createdAt);

    return (
        <>
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back to Articles
                    </button>
                </div>

                {isLoading ? (
                    <PageLoader text="Loading article details..." />
                ) : notFound ? (
                    /* Blog Not Found State */
                    <div className="text-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto my-8">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900">Blog Not Found</h2>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                            The article you are looking for might have been deleted, had its ID changed, or is temporarily unavailable.
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                            <Link
                                href="/"
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                            >
                                Browse All Blogs
                            </Link>
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800">
                        <p className="font-semibold text-base mb-2">Unable to load blog</p>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : blog ? (
                    <article className="bg-white rounded-3xl border border-gray-100/90 p-6 sm:p-10 shadow-sm">
                        {/* Header metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <Tag className="w-3.5 h-3.5 mr-1.5" />
                                {blog.category || "General"}
                            </span>

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                                        <span>Link Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-3.5 h-3.5 mr-1.5" />
                                        <span>Share</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                            {blog.blogTitle}
                        </h1>

                        {/* Author Card */}
                        <div className="flex items-center space-x-3.5 pb-6 border-b border-gray-100 mb-8">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-100 bg-gray-100 shrink-0 shadow-sm">
                                <img
                                    src={authorImage}
                                    alt={authorName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/default-avatar.svg";
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">{authorName}</h3>
                                <div className="flex items-center text-xs text-gray-400 space-x-2 mt-0.5">
                                    <div className="flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                        <span>Published on {dateFormatted}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Blog Content */}
                        <div className="prose prose-emerald max-w-none text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
                            {blog.blog}
                        </div>
                    </article>
                ) : null}
            </main>
        </>
    );
}
