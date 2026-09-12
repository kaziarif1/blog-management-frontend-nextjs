import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Alert = ({ type = "info", message, onClose, className = "" }) => {
    if (!message) return null;

    const styles = {
        success: {
            container: "bg-emerald-50 border-emerald-200 text-emerald-800",
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        },
        error: {
            container: "bg-rose-50 border-rose-200 text-rose-800",
            icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
        },
        info: {
            container: "bg-blue-50 border-blue-200 text-blue-800",
            icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        },
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div
            className={`flex items-start justify-between p-4 rounded-xl border ${currentStyle.container} ${className}`}
            role="alert"
        >
            <div className="flex items-start space-x-3">
                {currentStyle.icon}
                <div className="text-sm font-medium">{message}</div>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="ml-3 inline-flex text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;
