"use client";

import { usePathname } from "next/navigation";

export default function SiteFooter() {
    const pathname = usePathname();
    const hideFooter = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

    if (hideFooter) return null;

    return (
        <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>© {new Date().getFullYear()} BlogHub. All rights reserved.</p>
                <p className="text-gray-400">A simple blog management platform</p>
            </div>
        </footer>
    );
}
