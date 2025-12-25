"use client";
import { RequireAuth } from "@/components/auth/Guards";

export default function GDIPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAuth
            title="Partner Access Required"
            message="Please login to access the Trusted Insured Partners platform and manage your TPIAs."
            cancelRedirect="/"
        >
            {children}
        </RequireAuth>
    );
}
