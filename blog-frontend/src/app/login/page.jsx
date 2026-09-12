"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Spinner } from "../../components/Loader";
import { Alert } from "../../components/Alert";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(
        searchParams.get("registered") ? "Account created successfully! Please log in." : ""
    );
    const [isLoading, setIsLoading] = useState(false);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!email.trim() || !password) {
            setError("Both email and password are required");
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.login({
                email: email.trim().toLowerCase(),
                password,
            });

            // Stores token safely and loads profile into state
            await login(data.token, data.user);
            router.push("/dashboard");
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-3">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to manage your blogs and profile</p>
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError("")} className="mb-6" />}
                {successMessage && <Alert type="success" message={successMessage} className="mb-6" />}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Email Address <span className="text-rose-500">*</span>
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

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                                Password <span className="text-rose-500">*</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
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
                                placeholder="••••••••"
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
                                Signing in...
                            </>
                        ) : (
                            <>
                                <span>Sign In to Dashboard</span>
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                    Don&apos;t have an account yet?{" "}
                    <Link
                        href="/register"
                        className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading login...</div>}>
                <LoginForm />
            </Suspense>
        </>
    );
}
