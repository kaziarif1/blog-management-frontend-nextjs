"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { UserModal } from "../../../components/UserModal";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Alert } from "../../../components/Alert";
import { PageLoader, Spinner } from "../../../components/Loader";
import { userService } from "../../../services/user.service";
import { useAuth } from "../../../contexts/AuthContext";
import { formatDate, formatDateTime, getImageUrl, getUserFullName } from "../../../utils/formatters";
import {
    Users,
    Shield,
    CheckCircle2,
    AlertCircle,
    Eye,
    Power,
    Search,
    ShieldAlert,
    UserCheck,
    UserX,
} from "lucide-react";

export default function AdminUsersPage() {
    const router = useRouter();
    const { user: currentUser, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [alert, setAlert] = useState(null);

    // View Modal state
    const [viewingUser, setViewingUser] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);

    // Status toggle confirmation state
    const [statusUser, setStatusUser] = useState(null); // user whose status is being changed
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);

    // Role-based protection check
    useEffect(() => {
        if (!isAuthLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            } else if (!isAdmin) {
                // If user is logged in but NOT admin, redirect to /dashboard
                router.push("/dashboard");
            }
        }
    }, [isAuthLoading, isAuthenticated, isAdmin, router]);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setAlert({
                type: "error",
                message: err.message || "Failed to retrieve users. Ensure you have admin rights.",
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin, loadUsers]);

    // View user details
    const handleViewUser = async (user) => {
        setIsViewModalOpen(true);
        setIsLoadingUserDetail(true);
        try {
            const detail = await userService.getUserById(user.id);
            setViewingUser(detail);
        } catch (err) {
            setViewingUser(user); // fallback to table data
        } finally {
            setIsLoadingUserDetail(false);
        }
    };

    // Trigger status change confirmation
    const handleStatusClick = (user) => {
        setStatusUser(user);
    };

    // Execute status change
    const handleConfirmStatusChange = async () => {
        if (!statusUser) return;
        const newStatus = !statusUser.isActive;
        setIsTogglingStatus(true);
        try {
            const res = await userService.updateUserStatus(statusUser.id, newStatus);
            // Update table state immediately
            setUsers((prev) =>
                prev.map((u) => (u.id === statusUser.id ? { ...u, isActive: newStatus } : u))
            );
            setAlert({
                type: "success",
                message: res.message || `User #${statusUser.id} status updated successfully!`,
            });
            setStatusUser(null);
        } catch (err) {
            setAlert({
                type: "error",
                message: err.message || "Failed to update user status",
            });
        } finally {
            setIsTogglingStatus(false);
        }
    };

    // Filter users by search term
    const filteredUsers = users.filter((u) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const fullName = getUserFullName(u).toLowerCase();
        const email = (u.email || "").toLowerCase();
        const role = (u.role || "").toLowerCase();
        return fullName.includes(term) || email.includes(term) || role.includes(term);
    });

    if (isAuthLoading || (!isAdmin && isAuthenticated)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <PageLoader text="Verifying administrative privileges..." />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Navbar />
            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
                <Sidebar />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin Only
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">
                                User Management
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Inspect registered accounts, view profiles, and activate or deactivate platform access
                            </p>
                        </div>
                    </div>

                    {alert && (
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            onClose={() => setAlert(null)}
                        />
                    )}

                    {/* Filter & Stats bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-700">
                            Total Accounts: <span className="text-emerald-600">{users.length}</span>
                        </div>

                        <div className="relative flex-1 max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email, role..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Users Table */}
                    {isLoading ? (
                        <PageLoader text="Loading user records..." />
                    ) : filteredUsers.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-sm">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-gray-900">No users found</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {searchTerm
                                    ? "No users matched your query. Try a different search term."
                                    : "No registered accounts found in the database."}
                            </p>
                        </div>
                    ) : (
                        <>
                        <div className="md:hidden space-y-3">
                            {filteredUsers.map((u) => {
                                const fullName = getUserFullName(u);
                                const avatarUrl = getImageUrl(u.profileImage);
                                const isSelf = u.id === currentUser?.id;
                                return (
                                    <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                                <img
                                                    src={avatarUrl}
                                                    alt={fullName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/default-avatar.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{fullName}</p>
                                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">{u.role}</span>
                                            <span className={u.isActive ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                                                {u.isActive ? "Active" : "Deactivated"}
                                            </span>
                                            <span className="text-gray-500">{formatDate(u.createAt || u.createdAt)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewUser(u)}
                                                className="flex-1 py-2 text-xs font-semibold bg-gray-100 rounded-lg"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleStatusClick(u)}
                                                disabled={isSelf}
                                                className={`flex-1 py-2 text-xs font-semibold rounded-lg disabled:opacity-40 ${
                                                    u.isActive ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                                                }`}
                                            >
                                                {u.isActive ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
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
                                                User
                                            </th>
                                            <th scope="col" className="px-3 py-3.5">
                                                Email
                                            </th>
                                            <th scope="col" className="px-3 py-3.5">
                                                Role
                                            </th>
                                            <th scope="col" className="px-3 py-3.5">
                                                Status
                                            </th>
                                            <th scope="col" className="px-3 py-3.5">
                                                Joined Date
                                            </th>
                                            <th scope="col" className="py-3.5 pl-3 pr-6 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {filteredUsers.map((u) => {
                                            const fullName = getUserFullName(u);
                                            const avatarUrl = getImageUrl(u.profileImage);
                                            const isSelf = u.id === currentUser?.id;

                                            return (
                                                <tr
                                                    key={u.id}
                                                    className="hover:bg-gray-50/60 transition-colors"
                                                >
                                                    {/* User & Avatar */}
                                                    <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0 shadow-sm">
                                                                <img
                                                                    src={avatarUrl}
                                                                    alt={fullName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src =
                                                                            "/default-avatar.svg";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-gray-900 block">
                                                                    {fullName}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    ID: #{u.id}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Email */}
                                                    <td className="px-3 py-3.5 whitespace-nowrap text-gray-600 font-medium">
                                                        {u.email}
                                                    </td>

                                                    {/* Role */}
                                                    <td className="px-3 py-3.5 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                                u.role === "admin"
                                                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                            }`}
                                                        >
                                                            {u.role === "admin" && (
                                                                <Shield className="w-2.5 h-2.5 mr-1" />
                                                            )}
                                                            {u.role}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-3 py-3.5 whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                                u.isActive
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                                            }`}
                                                        >
                                                            {u.isActive ? (
                                                                <>
                                                                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                                                                    Active
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
                                                                    Deactivated
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Created Date */}
                                                    <td className="px-3 py-3.5 whitespace-nowrap text-gray-500 font-medium">
                                                        {formatDate(u.createAt || u.createdAt)}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => handleViewUser(u)}
                                                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                                View
                                                            </button>

                                                            {/* Activate / Deactivate button */}
                                                            <button
                                                                onClick={() => handleStatusClick(u)}
                                                                disabled={isSelf}
                                                                className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                                                    u.isActive
                                                                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                                                }`}
                                                                title={
                                                                    isSelf
                                                                        ? "Cannot deactivate your own account"
                                                                        : u.isActive
                                                                        ? "Deactivate User"
                                                                        : "Activate User"
                                                                }
                                                            >
                                                                {u.isActive ? (
                                                                    <>
                                                                        <UserX className="w-3.5 h-3.5 mr-1" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
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

                    {/* View User Modal */}
                    <UserModal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        user={viewingUser}
                        isLoading={isLoadingUserDetail}
                    />

                    {/* Status Change Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={!!statusUser}
                        title={
                            statusUser?.isActive
                                ? "Deactivate User Account"
                                : "Activate User Account"
                        }
                        message={
                            statusUser?.isActive
                                ? `Are you sure you want to deactivate ${getUserFullName(
                                      statusUser
                                  )} (${statusUser?.email})? They will immediately be blocked from logging into the platform.`
                                : `Are you sure you want to re-activate ${getUserFullName(
                                      statusUser
                                  )} (${statusUser?.email})? They will regain access to the platform.`
                        }
                        confirmText={statusUser?.isActive ? "Deactivate" : "Activate"}
                        cancelText="Cancel"
                        isDestructive={statusUser?.isActive}
                        isLoading={isTogglingStatus}
                        onConfirm={handleConfirmStatusChange}
                        onCancel={() => setStatusUser(null)}
                    />
                </main>
            </div>
        </div>
    );
}
