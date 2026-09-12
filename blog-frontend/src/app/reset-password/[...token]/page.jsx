"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Spinner } from "../../../components/Loader";
import { Alert } from "../../../components/Alert";
import { authService } from "../../../services/auth.service";
import { Lock, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();

    // JWT tokens contain dots. A catch-all route keeps /reset-password/[token]
    // working when the token is split across URL segments.
    const token = useMemo(() => {
        const raw = params?.token;
        if (!raw) return "";
        return Array.isArray(raw) ? raw.join(".") : String(raw);
    }, [params]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!token) {
            setError("Reset token is missing from the URL.");
            return;
        }

        if (!password) {
            setError("New password is required");
            return;
        }

        if (password.length < 6) {
            setError("New password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.resetPassword(token, password);
            setSuccessMessage(
                data.message || "Password has been reset successfully! Redirecting to login..."
            );
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || "Invalid or expired reset token. Please request a new link.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-3">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Reset Password
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Choose a strong new password for your account
                        </p>
                    </div>

                    {error && <Alert type="error" message={error} onClose={() => setError("")} className="mb-6" />}
                    {successMessage && <Alert type="success" message={successMessage} className="mb-6" />}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
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
                                        if (error) setError("");
                                    }}
                                    placeholder="At least 6 characters"
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                Confirm Password <span className="text-rose-500">*</span>
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
                                        if (error) setError("");
                                    }}
                                    placeholder="Re-type new password"
                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="sm" className="mr-2 text-white" />
                                    Updating password...
                                </>
                            ) : (
                                <>
                                    <span>Set New Password</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                        Remember your credentials?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
