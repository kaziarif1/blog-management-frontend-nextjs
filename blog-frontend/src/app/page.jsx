"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Navbar } from "../components/Navbar";
import { BlogCard } from "../components/BlogCard";
import { SearchBar } from "../components/SearchBar";
import { CategoryFilter } from "../components/CategoryFilter";
import { CardSkeleton } from "../components/Loader";
import { Alert } from "../components/Alert";
import { blogService } from "../services/blog.service";
import { BookOpen, Sparkles, RefreshCw } from "lucide-react";

function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const titleParam = searchParams.get("title") || "";
    const categoryParam = searchParams.get("category") || "";

    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState(titleParam);

    // Sync input with searchParam
    useEffect(() => {
        setSearchTerm(titleParam);
    }, [titleParam]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await blogService.getAllBlogs();
                const extracted = Array.from(
                    new Set((Array.isArray(data) ? data : []).map((b) => b.category).filter(Boolean))
                );
                setCategories(extracted);
            } catch {
                // Category chips are optional; blog listing still reports its own error.
            }
        };
        loadCategories();
    }, []);

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await blogService.getAllBlogs({
                title: titleParam,
                category: categoryParam,
            });
            setBlogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to load blogs. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, [titleParam, categoryParam]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleSearch = (term) => {
        const params = new URLSearchParams();
        if (term && term.trim()) params.set("title", term.trim());
        if (categoryParam) params.set("category", categoryParam);
        router.push(`/?${params.toString()}`);
    };

    const handleSelectCategory = (cat) => {
        const params = new URLSearchParams();
        if (titleParam) params.set("title", titleParam);
        if (cat && cat !== "All") params.set("category", cat);
        router.push(`/?${params.toString()}`);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        router.push("/");
    };

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-emerald-50/50 via-white to-transparent pt-12 pb-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-4">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Explore & Learn
                    </span>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        Insights, Stories & Engineering Tutorials
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
                        Discover insightful articles written by our community on software engineering, testing, automation, and modern web development.
                    </p>

                    {/* Integrated Search Bar */}
                    <div className="mt-8 max-w-xl mx-auto shadow-sm">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSearch={handleSearch}
                            placeholder="Search by blog title (e.g. Playwright, Testing)..."
                        />
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                {/* Category Filter Chips */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                            Categories
                        </h2>
                        {(titleParam || categoryParam) && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
                            >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Clear Filters
                            </button>
                        )}
                    </div>
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={categoryParam || "All"}
                        onSelectCategory={handleSelectCategory}
                    />
                </div>

                {/* Filter info banner */}
                {(titleParam || categoryParam) && (
                    <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200/70 flex items-center justify-between text-xs text-gray-600">
                        <span>
                            Showing results for:{" "}
                            {titleParam && <strong className="text-gray-900 mr-2">&quot;{titleParam}&quot;</strong>}
                            {categoryParam && (
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                                    {categoryParam}
                                </span>
                            )}
                        </span>
                        <span className="font-semibold">{blogs.length} article(s)</span>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="mb-8">
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    </div>
                )}

                {/* Blog Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-100 max-w-md mx-auto shadow-sm my-8">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No blogs found</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            {titleParam || categoryParam
                                ? "We couldn't find any articles matching your search or category filter. Try clearing filters or searching for something else."
                                : "There are currently no blogs published yet. Be the first to share your thoughts!"}
                        </p>
                        {(titleParam || categoryParam) && (
                            <button
                                onClick={handleResetFilters}
                                className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading blogs...</div>}>
            <HomeContent />
        </Suspense>
    );
}
