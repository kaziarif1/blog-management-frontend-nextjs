"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BlogForm } from "../../../../../components/BlogForm";
import { PageLoader } from "../../../../../components/Loader";
import { Alert } from "../../../../../components/Alert";
import { blogService } from "../../../../../services/blog.service";
import { useAuth } from "../../../../../contexts/AuthContext";

export default function EditBlogPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const { user, isAdmin } = useAuth();

    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchBlog = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await blogService.getBlogById(id);
                // Check if allowed to edit
                const isOwner = data.author?.id === user?.id || data.userId === user?.id;
                if (!isOwner && !isAdmin) {
                    setError("You are not authorized to edit this blog post.");
                } else {
                    setInitialData({
                        blogTitle: data.blogTitle,
                        category: data.category,
                        blog: data.blog,
                    });
                }
            } catch (err) {
                setError(err.message || "Failed to load blog for editing");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlog();
    }, [id, user, isAdmin]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await blogService.updateBlog(id, {
                blogTitle: formData.blogTitle,
                category: formData.category,
                blog: formData.blog,
            });
            router.push("/dashboard/blogs?updated=1");
        } catch (err) {
            setError(err.message || "Failed to update blog post");
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <PageLoader text="Loading article details for editing..." />;
    }

    if (error && !initialData) {
        return (
            <div className="max-w-2xl mx-auto py-12">
                <Alert type="error" message={error} />
                <div className="mt-4 text-center">
                    <button
                        onClick={() => router.push("/dashboard/blogs")}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl text-gray-700"
                    >
                        Back to Blogs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <BlogForm
            initialData={initialData}
            titleText="Edit Article"
            submitButtonText="Save Changes"
            submittingText="Updating..."
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={error}
        />
    );
}
