import React, { useEffect } from "react";
import { X, Shield, Mail, Calendar, CheckCircle, AlertCircle, Hash, User } from "lucide-react";
import { formatDate, formatDateTime, getImageUrl, getUserFullName } from "../utils/formatters";
import { Spinner } from "./Loader";

export const UserModal = ({ isOpen, onClose, user, isLoading = false }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const avatarUrl = getImageUrl(user?.profileImage);
    const fullName = getUserFullName(user);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 transform transition-all animate-scale-up"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">User Profile Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <Spinner size="lg" className="text-emerald-600" />
                    </div>
                ) : user ? (
                    <div className="py-6 space-y-6">
                        {/* Header with avatar */}
                        <div className="flex items-center space-x-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100 bg-gray-100 shrink-0 shadow-sm">
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
                                <h4 className="text-lg font-bold text-gray-900">{fullName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            user.role === "admin"
                                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                        }`}
                                    >
                                        <Shield className="w-3 h-3 mr-1" />
                                        {user.role}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            user.isActive
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-rose-50 text-rose-700 border border-rose-200"
                                        }`}
                                    >
                                        {user.isActive ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Deactivated
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed information rows */}
                        <div className="bg-gray-50 rounded-xl p-4 divide-y divide-gray-200/60 text-sm">
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-gray-500 flex items-center">
                                    <Hash className="w-4 h-4 mr-2 text-gray-400" />
                                    User ID
                                </span>
                                <span className="font-semibold text-gray-800">#{user.id}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-gray-500 flex items-center">
                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                    Email Address
                                </span>
                                <span className="font-semibold text-gray-800">{user.email}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-gray-500 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    Joined Date
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {formatDateTime(user.createAt || user.createdAt)}
                                </span>
                            </div>
                            {(user.updateAt || user.updatedAt) && (
                                <div className="py-2.5 flex items-center justify-between">
                                    <span className="text-gray-500 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        Last Updated
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        {formatDateTime(user.updateAt || user.updatedAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">No user information available.</div>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
