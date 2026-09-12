"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BlogForm } from "../../../../components/BlogForm";
import { blogService } from "../../../../services/blog.service";

export default function CreateBlogPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Note: We do NOT send userId; backend gets it from req.user.id!
            await blogService.createBlog({
                blogTitle: formData.blogTitle,
                category: formData.category,
                blog: formData.blog,
            });
            router.push("/dashboard/blogs?created=1");
        } catch (err) {
            setError(err.message || "Failed to create blog. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <BlogForm
            titleText="Create New Article"
            submitButtonText="Publish Article"
            submittingText="Publishing..."
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            serverError={error}
        />
    );
}
