"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { userService } from "../../../services/user.service";
import { Alert } from "../../../components/Alert";
import { Spinner, PageLoader } from "../../../components/Loader";
import { getImageUrl, getUserFullName, formatDateTime } from "../../../utils/formatters";
import {
    User,
    Camera,
    Mail,
    Shield,
    CheckCircle2,
    Calendar,
    Save,
    Upload,
    AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
    const { user, refreshProfile, updateUser } = useAuth();

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [profileAlert, setProfileAlert] = useState(null); // { type, message }
    const [imageAlert, setImageAlert] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFirstname(user.firstname || "");
            setLastname(user.lastname || "");
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileAlert(null);

        if (!firstname.trim() || !lastname.trim()) {
            setProfileAlert({
                type: "error",
                message: "Both First Name and Last Name are required.",
            });
            return;
        }

        setIsSavingProfile(true);
        try {
            // Note: Never sending role or isActive!
            const res = await userService.updateProfile({
                firstname: firstname.trim(),
                lastname: lastname.trim(),
            });
            updateUser({
                firstname: res.user?.firstname || firstname.trim(),
                lastname: res.user?.lastname || lastname.trim(),
            });
            setProfileAlert({
                type: "success",
                message: res.message || "Profile information updated successfully!",
            });
        } catch (err) {
            setProfileAlert({
                type: "error",
                message: err.message || "Failed to update profile.",
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleImageChange = async (e) => {
        setImageAlert(null);
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset file input value so the same file can be selected again if needed
        e.target.value = "";

        // Validate image format
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setImageAlert({
                type: "error",
                message: "Invalid file format. Please upload a JPEG, PNG, WEBP, or GIF image.",
            });
            return;
        }

        // Validate image size (2MB max)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            setImageAlert({
                type: "error",
                message: "File size exceeds 2MB limit. Please upload a smaller image.",
            });
            return;
        }

        setIsUploadingImage(true);
        try {
            const data = await userService.uploadProfileImage(file);
            const newImageUrl = data.profileImage || data.user?.profileImage;

            // Immediately update state in AuthContext so profile and navbar avatars update without relogging
            updateUser({ profileImage: newImageUrl });
            await refreshProfile();

            setImageAlert({
                type: "success",
                message: "Profile image updated successfully!",
            });
        } catch (err) {
            setImageAlert({
                type: "error",
                message: err.message || "Failed to upload profile image.",
            });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const avatarUrl = getImageUrl(user?.profileImage);
    const fullName = getUserFullName(user);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Profile Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Manage your personal account details, avatar photo, and preferences
                </p>
            </div>

            {/* Profile Avatar Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-2">Profile Avatar</h2>
                <p className="text-xs text-gray-500 mb-6">
                    Upload a high quality photo to identify yourself across the platform (JPEG, PNG, WEBP, max 2MB).
                </p>

                {imageAlert && (
                    <div className="mb-6">
                        <Alert
                            type={imageAlert.type}
                            message={imageAlert.message}
                            onClose={() => setImageAlert(null)}
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar preview container */}
                    <div className="relative group">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-50 shadow-md bg-gray-100">
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/default-avatar.svg";
                                }}
                            />
                            {isUploadingImage && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                    <Spinner size="md" className="text-white mb-1" />
                                    <span className="text-[10px] font-bold">Uploading...</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="absolute bottom-1 right-1 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                            title="Upload new photo"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Upload actions & instructions */}
                    <div className="space-y-3 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingImage}
                                className="inline-flex items-center px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200/60 transition-colors disabled:opacity-50"
                            >
                                <Upload className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                {isUploadingImage ? "Uploading Photo..." : "Choose New Photo"}
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-400">
                            Accepted formats: JPEG, PNG, WEBP, GIF. File size up to 2MB.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Information Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-xs text-gray-500 mb-6">
                    Update your display name. Email and system role are restricted by system policy.
                </p>

                {profileAlert && (
                    <div className="mb-6">
                        <Alert
                            type={profileAlert.type}
                            message={profileAlert.message}
                            onClose={() => setProfileAlert(null)}
                        />
                    </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                First Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                Last Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Read-only system fields (Do NOT provide controls for changing role or isActive) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Email Address (Read-only)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    disabled
                                    value={user?.email || ""}
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed select-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                System Role & Status (Read-only)
                            </label>
                            <div className="flex items-center space-x-2 py-1">
                                <span
                                    className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                        user?.role === "admin"
                                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                                            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    }`}
                                >
                                    <Shield className="w-3.5 h-3.5 mr-1" />
                                    {user?.role || "user"}
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                                    Active Account
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                            {isSavingProfile ? (
                                <>
                                    <Spinner size="sm" className="mr-2 text-white" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Profile Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
