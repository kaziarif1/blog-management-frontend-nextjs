import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import SiteFooter from "../components/SiteFooter";

export const metadata = {
    title: "BlogHub — Blog Management",
    description: "A simple, modern blog management application.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen bg-[#f8fafc] text-gray-900">
                <AuthProvider>
                    <div className="flex-1 flex flex-col">{children}</div>
                    <SiteFooter />
                </AuthProvider>
            </body>
        </html>
    );
}
