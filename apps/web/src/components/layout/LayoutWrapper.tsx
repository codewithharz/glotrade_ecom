"use client";
import { usePathname } from "next/navigation";
import UpperHeader from "@/components/layout/UpperHeader";
import Header from "@/components/layout/Header";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Hide headers on admin pages
    const isAdminPage = pathname?.startsWith("/admin");

    if (isAdminPage) {
        // Admin pages render full-screen without headers
        return <>{children}</>;
    }

    // Public pages render with headers and container
    return (
        <>
            <UpperHeader />
            <Header />
            <div className="mx-auto md:w-[95%] w-full px-4 md:px-6">{children}</div>
        </>
    );
}