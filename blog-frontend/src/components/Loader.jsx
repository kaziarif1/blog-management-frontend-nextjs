import React from "react";

export const Spinner = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-3",
        xl: "w-12 h-12 border-4",
    };

    return (
        <div
            className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size] || sizeClasses.md} ${className}`}
            role="status"
        >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
            </span>
        </div>
    );
};

export const PageLoader = ({ text = "Loading..." }) => {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <Spinner size="xl" className="text-emerald-600" />
            <p className="text-sm font-medium text-gray-500 animate-pulse">{text}</p>
        </div>
    );
};

export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse flex flex-col justify-between">
            <div className="space-y-3">
                <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                <div className="w-full h-6 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="space-y-2 pt-2">
                    <div className="w-full h-4 bg-gray-100 rounded"></div>
                    <div className="w-5/6 h-4 bg-gray-100 rounded"></div>
                </div>
            </div>
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200"></div>
                    <div className="space-y-1">
                        <div className="w-24 h-3.5 bg-gray-200 rounded"></div>
                        <div className="w-16 h-3 bg-gray-100 rounded"></div>
                    </div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
};

export default Spinner;
