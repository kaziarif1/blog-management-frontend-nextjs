export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    } catch {
        return "N/A";
    }
};

export const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch {
        return "N/A";
    }
};

export const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-avatar.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    return `${backendUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

export const getUserFullName = (user) => {
    if (!user) return "Anonymous";
    const first = user.firstname || "";
    const last = user.lastname || "";
    const full = `${first} ${last}`.trim();
    return full || user.email || "User";
};
