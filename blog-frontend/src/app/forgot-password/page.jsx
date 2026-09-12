"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Spinner } from "../../components/Loader";
import { Alert } from "../../components/Alert";
import { authService } from "../../services/auth.service";
import { KeyRound, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);

        if (!email.trim()) {
            setError("Please enter your registered email address");
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.forgotPassword(email.trim().toLowerCase());
            setResult(data);
        } catch (err) {
            setError(err.message || "Failed to process forgot password request.");
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
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Forgot Password</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Enter your registered email address to receive password reset instructions
                        </p>
                    </div>

                    {error && <Alert type="error" message={error} onClose={() => setError("")} className="mb-6" />}

                    {result ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm">
                                <div className="flex items-center space-x-2 font-bold mb-1">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>Reset link generated!</span>
                                </div>
                                <p className="leading-relaxed text-xs text-emerald-700">
                                    {result.message || "Password reset token created successfully."}
                                </p>
                            </div>

                            {/* Secure reset link flow: this is the link that would normally be emailed */}
                            {result.resetLink && (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                                    <p className="text-xs font-semibold text-gray-600">
                                        Password reset link (this is what should be sent to the user's email in production):
                                    </p>
                                    <a
                                        href={result.resetLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                                    >
                                        Open Reset Page
                                        <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </a>
                                    <div className="mt-2 rounded-xl border border-gray-200 bg-white p-2 text-[11px] text-gray-600 break-all">
                                        {result.resetLink}
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                    Registered Email <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError("");
                                        }}
                                        placeholder="you@example.com"
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
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <span>Request Password Reset</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>

                            <div className="pt-4 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}
