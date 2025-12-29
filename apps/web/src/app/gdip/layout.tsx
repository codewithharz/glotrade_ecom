"use client";
import { RequireDistributor } from "@/components/auth/Guards";

export default function GDIPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireDistributor
            title="Distributor Access Restricted"
            message="This area is exclusively for authenticated distributors. Please contact support if you believe this is an error."
            cancelRedirect="/"
        >
            {children}
        </RequireDistributor>
    );
}
