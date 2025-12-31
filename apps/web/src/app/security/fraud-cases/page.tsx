"use client";
import Link from "next/link";
import { Shield, Phone, Mail, Globe, Briefcase, AlertTriangle, CheckCircle } from "lucide-react";
import { translate } from "@/utils/translate";

export default function FraudCasesPage() {
  return (
    <div className="mx-auto w-[95%] px-4 md:px-6 py-6 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:underline text-neutral-600">{translate("usermenu.home")}</Link>
        <span className="mx-2">›</span>
        <Link href="/security" className="hover:underline text-neutral-600">{translate("security.security")}</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-700">{translate("security.fraudCases.breadcrumb")}</span>
      </nav>

      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{translate("security.fraudCases.title")}</h1>

      {/* Introductory Text */}
      <div className="mb-8 text-lg text-neutral-700 leading-relaxed">
        <p>
          {translate("security.fraudCases.intro")}
        </p>
      </div>

      {/* Fraud Categories */}
      <div className="space-y-6">
        {/* Communication Fraud */}
        <div className="border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800">{translate("security.fraudCases.categories.communication.title")}</h2>
          </div>

          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.communication.cases.fake") }} />
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.communication.cases.urgent") }} />
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.communication.cases.suspension") }} />
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800" dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.communication.remember") }} />
            </div>
          </div>
        </div>

        {/* Website/App Impersonation */}
        <div className="border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800">{translate("security.fraudCases.categories.impersonation.title")}</h2>
          </div>

          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.impersonation.cases.fake") }} />
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.impersonation.cases.copycat") }} />
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.impersonation.cases.phishing") }} />
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800" dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.impersonation.verify") }} />
            </div>
          </div>
        </div>

        {/* Job Scams */}
        <div className="border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800">{translate("security.fraudCases.categories.jobs.title")}</h2>
          </div>

          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.jobs.cases.postings") }} />
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.jobs.cases.schemes") }} />
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.jobs.cases.partnerships") }} />
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800" dangerouslySetInnerHTML={{ __html: translate("security.fraudCases.categories.jobs.verify") }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-3 text-emerald-800">{translate("security.fraudCases.action.title")}</h3>
          <p className="text-sm text-emerald-700 mb-4">
            {translate("security.fraudCases.action.desc")}
          </p>
          <Link
            href="/security/report"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            {translate("security.fraudCases.action.button")}
          </Link>
        </div>
      </div>
    </div>
  );
}