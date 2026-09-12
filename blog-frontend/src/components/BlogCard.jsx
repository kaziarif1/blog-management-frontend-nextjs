import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User as UserIcon, Tag, Edit3, Trash2 } from "lucide-react";
import { formatDate, truncateText, getImageUrl, getUserFullName } from "../utils/formatters";

export const BlogCard = ({
    blog,
    showActions = false,
    canEdit = false,
    canDelete = false,
    onEdit,
    onDelete,
}) => {
    if (!blog) return null;

    const authorName = getUserFullName(blog.author);
    const authorImage = getImageUrl(blog.author?.profileImage);
    const dateFormatted = formatDate(blog.createAt || blog.createdAt);

    return (
        <article className="group bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col justify-between">
            <div>
                {/* Header: Category and Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Tag className="w-3 h-3 mr-1" />
                        {blog.category || "General"}
                    </span>

                    {showActions && (
                        <div className="flex items-center space-x-1 opacity-90">
                            {canEdit && (
                                <button
                                    onClick={() => onEdit && onEdit(blog)}
                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Edit Blog"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete && onDelete(blog)}
                                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete Blog"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2 leading-snug">
                    <Link href={`/blogs/${blog.id}`}>{blog.blogTitle}</Link>
                </h3>

                {/* Short Preview */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {truncateText(blog.blog, 140)}
                </p>
            </div>

            {/* Footer: Author info & Read More */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        <img
                            src={authorImage}
                            alt={authorName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/default-avatar.svg";
                            }}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{authorName}</p>
                        <div className="flex items-center text-[11px] text-gray-400">
                            <Calendar className="w-3 h-3 mr-1 shrink-0" />
                            <span>{dateFormatted}</span>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/blogs/${blog.id}`}
                    className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 pl-2 shrink-0 group-hover:translate-x-0.5 transition-transform"
                >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
            </div>
        </article>
    );
};

export default BlogCard;
