"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { RequireGuest } from "@/components/auth/Guards";
import { Mail, User, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Building2, Briefcase, FileText, Globe } from "lucide-react";

export default function RegisterBusinessPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Business fields
    const [companyName, setCompanyName] = useState("");
    const [businessType, setBusinessType] = useState("Wholesaler");
    const [taxId, setTaxId] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [website, setWebsite] = useState("");
    const [industry, setIndustry] = useState("");
    const [referralCode, setReferralCode] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !username || !password) {
            setError("Please fill in all account details");
            return;
        }
        setError(null);
        setStep(2);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMsg(null);
        setIsLoading(true);

        try {
            const payload: any = {
                email,
                username,
                password,
                accountType: "business",
                businessInfo: {
                    companyName,
                    businessType,
                    taxId,
                    registrationNumber,
                    website,
                    industry
                }
            };

            // Add referral code if provided
            if (referralCode.trim()) {
                payload.referralCode = referralCode.trim().toUpperCase();
            }

            await apiPost<{ status: string; data?: any }>("/api/v1/auth/register", payload);
            setMsg("Business account created! Please check your email to verify your account.");
            toast("Verification email sent", "success");

            // Clear form fields
            setEmail("");
            setUsername("");
            setPassword("");
            setCompanyName("");

            // Redirect to login
            setTimeout(() => router.push("/auth/login"), 3000);
        } catch (e: any) {
            setError(e.message || "Registration failed");
            toast(e.message || "Registration failed", "error");
            setIsLoading(false); // Only stop loading on error, keep loading on success until redirect
        }
    };

    return (
        <RequireGuest>
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Business Registration
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">Create a wholesale account for your business</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8 gap-4">
                        <div className={`flex items-center gap-2 ${step === 1 ? "text-blue-600 font-semibold" : "text-neutral-500"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${step === 1 ? "border-blue-600 bg-blue-50" : "border-neutral-300"}`}>1</div>
                            <span>Account</span>
                        </div>
                        <div className="w-12 h-px bg-neutral-300"></div>
                        <div className={`flex items-center gap-2 ${step === 2 ? "text-blue-600 font-semibold" : "text-neutral-500"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${step === 2 ? "border-blue-600 bg-blue-50" : "border-neutral-300"}`}>2</div>
                            <span>Business Info</span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
                        <form onSubmit={step === 1 ? handleNextStep : onSubmit} className="space-y-5">

                            {step === 1 ? (
                                /* Step 1: Account Details */
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Work Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Choose a username"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Create a strong password"
                                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        Next Step
                                    </button>
                                </>
                            ) : (
                                /* Step 2: Business Details */
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Company Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Building2 className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                placeholder="Legal Business Name"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                Business Type
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Briefcase className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <select
                                                    value={businessType}
                                                    onChange={(e) => setBusinessType(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                                                >
                                                    <option value="Wholesaler">Wholesaler</option>
                                                    {/* <option value="Retailer">Retailer</option> */}
                                                    <option value="Distributor">Distributor</option>
                                                    <option value="Sales Agent">Sales Agent</option>
                                                    {/* <option value="Other">Other</option> */}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Conditionally show Industry field - hide for Sales Agents */}
                                        {businessType !== "Sales Agent" && (
                                            <div>
                                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                    Industry
                                                </label>
                                                <input
                                                    type="text"
                                                    value={industry}
                                                    onChange={(e) => setIndustry(e.target.value)}
                                                    placeholder="e.g. Electronics"
                                                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                Tax ID / TIN (Optional)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FileText className="h-5 w-5 text-neutral-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={taxId}
                                                    onChange={(e) => setTaxId(e.target.value)}
                                                    placeholder="Tax Identification Number"
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                Reg Number (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={registrationNumber}
                                                onChange={(e) => setRegistrationNumber(e.target.value)}
                                                placeholder="RC Number"
                                                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Website (Optional)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Globe className="h-5 w-5 text-neutral-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                placeholder="https://example.com"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Referral Code Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Referral Code (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                            placeholder="Enter referral code if you have one"
                                            className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none uppercase"
                                        />
                                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            If you were referred by a Sales Agent, enter their code here
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-1/3 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Creating...</span>
                                                </>
                                            ) : (
                                                <span>Complete Registration</span>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Success Message */}
                            {msg && (
                                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 rounded-lg">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                    <span>{msg}</span>
                                </div>
                            )}
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Already have an account?{" "}
                                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                    Sign in
                                </Link>
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </RequireGuest>
    );
}
