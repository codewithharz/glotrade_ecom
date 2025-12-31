"use client";
import { RequireDistributor } from "@/components/auth/Guards";
import { translate } from "@/utils/translate";

export default function GDIPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireDistributor
            title={translate("gdip.layout.restricted.title")}
            message={translate("gdip.layout.restricted.message")}
            cancelRedirect="/"
        >
            {children}
        </RequireDistributor>
    );
}
