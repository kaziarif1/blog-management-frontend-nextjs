import React from "react";
import { Search, X } from "lucide-react";

export const SearchBar = ({
    value = "",
    onChange,
    onSearch,
    placeholder = "Search blogs by title...",
    className = "",
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleClear = () => {
        if (onChange) onChange("");
        if (onSearch) onSearch("");
    };

    return (
        <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </form>
    );
};

export default SearchBar;
