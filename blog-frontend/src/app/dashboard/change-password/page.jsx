"use client";

import React, { useState } from "react";
import { userService } from "../../../services/user.service";
import { Alert } from "../../../components/Alert";
import { Spinner } from "../../../components/Loader";
import { KeyRound, Lock, Save, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlert(null);

        if (!password) {
            setAlert({ type: "error", message: "New password is required" });
            return;
        }

        if (password.length < 6) {
            setAlert({
                type: "error",
                message: "Password must be at least 6 characters long",
            });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({ type: "error", message: "Passwords do not match" });
            return;
        }

        setIsLoading(true);
        try {
            const res = await userService.updatePassword(password);
            setAlert({
                type: "success",
                message: res.message || "Password updated successfully!",
            });
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setAlert({
                type: "error",
                message: err.message || "Failed to update password. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Change Password
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Update your account password to maintain strong security
                </p>
            </div>

            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            New Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (alert) setAlert(null);
                                }}
                                placeholder="Minimum 6 characters"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                            Confirm New Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (alert) setAlert(null);
                                }}
                                placeholder="Re-type new password"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="mr-2 text-white" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    Update Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
