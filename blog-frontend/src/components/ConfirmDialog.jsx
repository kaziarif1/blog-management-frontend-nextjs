import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Spinner } from "./Loader";

export const ConfirmDialog = ({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen && !isLoading) {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all animate-scale-up"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`p-2.5 rounded-full ${
                                isDestructive ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                            }`}
                        >
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-600 leading-relaxed">{message}</div>

                <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
                            isDestructive
                                ? "bg-rose-600 hover:bg-rose-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                    >
                        {isLoading && <Spinner size="sm" className="mr-2 text-white" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
