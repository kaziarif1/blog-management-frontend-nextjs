import React from "react";

export const CategoryFilter = ({
    categories = [],
    selectedCategory = "All",
    onSelectCategory,
    className = "",
}) => {
    const allCategories = Array.from(new Set(["All", ...categories.filter(Boolean)]));

    return (
        <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
            {allCategories.map((cat) => {
                const isSelected = (selectedCategory || "All").toLowerCase() === cat.toLowerCase();
                return (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat === "All" ? "" : cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                            isSelected
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                        {cat}
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;
