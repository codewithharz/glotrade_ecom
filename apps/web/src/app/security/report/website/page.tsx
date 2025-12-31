"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Smartphone, AlertTriangle, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export default function ReportWebsitePage() {
  const [formData, setFormData] = useState({
    type: "",
    url: "",
    appName: "",
    appStore: "",
    description: "",
    suspiciousElements: [] as string[],
    actionTaken: "",
    additionalDetails: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await apiPost<{ status: string; message?: string }>('/api/v1/security-reports/submit', {
        reportType: 'website',
        type: formData.type,
        url: formData.url,
        appName: formData.appName,
        appStore: formData.appStore,
        description: formData.description,
        suspiciousElements: formData.suspiciousElements,
        actionTaken: formData.actionTaken,
        additionalDetails: formData.additionalDetails
      });

      if (result.status === 'success') {
        setSubmitted(true);
      } else {
        throw new Error(result.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      suspiciousElements: prev.suspiciousElements.includes(value)
        ? prev.suspiciousElements.filter(item => item !== value)
        : [...prev.suspiciousElements, value]
    }));
  };

  if (submitted) {
    return (
      <div className="mx-auto w-[95%] px-4 md:px-6 py-6 max-w-2xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">{translate("security.communication.success.title")}</h1>
          <p className="text-neutral-600 mb-6">
            {translate("security.website.success.desc")}
          </p>
          <div className="space-y-3">
            <Link
              href="/security/report"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              {translate("security.communication.success.another")}
            </Link>
            <div>
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
                {translate("security.communication.success.home")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[95%] px-4 md:px-6 py-6 max-w-3xl">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:underline text-neutral-600">{translate("usermenu.home")}</Link>
        <span className="mx-2">›</span>
        <Link href="/security/report" className="hover:underline text-neutral-600">{translate("security.report.breadcrumb")}</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-700">{translate("security.website.breadcrumb")}</span>
      </nav>

      {/* Back Button */}
      <Link
        href="/security/report"
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {translate("security.communication.backToOptions")}
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">{translate("security.website.title")}</h1>
        </div>
        <p className="text-lg text-neutral-600">
          {translate("security.website.desc")}
        </p>
      </div>

      {/* Security Warning */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <span dangerouslySetInnerHTML={{ __html: translate("security.communication.warning") }} />
          </div>
        </div>
      </div>

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type of Impersonation */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.website.form.typeLabel")}
          </label>
          <div className="space-y-3">
            {[
              { value: "website", label: translate("security.website.form.types.website"), icon: Globe },
              { value: "mobile_app", label: translate("security.website.form.types.mobile_app"), icon: Smartphone }
            ].map(({ value, label, icon: Icon }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={formData.type === value}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-4 h-4 text-emerald-600 border-neutral-300 focus:ring-emerald-500"
                  required
                />
                <Icon className="w-5 h-5 text-neutral-500" />
                <span className="text-neutral-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* URL or App Information */}
        {formData.type === "website" && (
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.website.form.urlLabel")}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => window.open(formData.url, '_blank')}
                disabled={!formData.url}
                className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Open URL in new tab (for verification)"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Include the full URL including http:// or https://
            </p>
          </div>
        )}

        {formData.type === "mobile_app" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {translate("security.website.form.appNameLabel")}
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => handleInputChange("appName", e.target.value)}
                placeholder="e.g., AfriTrade Shopping"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {translate("security.website.form.appStoreLabel")}
              </label>
              <select
                value={formData.appStore}
                onChange={(e) => handleInputChange("appStore", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">{translate("common.select")}</option>
                <option value="google_play">{translate("security.website.form.appStores.google")}</option>
                <option value="app_store">{translate("security.website.form.appStores.apple")}</option>
                <option value="other">{translate("security.website.form.appStores.other")}</option>
              </select>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.website.form.descLabel")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder={translate("security.website.form.descPlaceholder")}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Suspicious Elements */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.communication.form.suspiciousElementsLabel")}
          </label>
          <div className="space-y-2">
            {[
              { key: "url", label: translate("security.website.form.elements.url") },
              { key: "credentials", label: translate("security.website.form.elements.credentials") },
              { key: "payment", label: translate("security.website.form.elements.payment") },
              { key: "design", label: translate("security.website.form.elements.design") },
              { key: "grammar", label: translate("security.website.form.elements.grammar") },
              { key: "urgency", label: translate("security.website.form.elements.urgency") },
              { key: "deals", label: translate("security.website.form.elements.deals") },
              { key: "downloads", label: translate("security.website.form.elements.downloads") },
              { key: "redirects", label: translate("security.website.form.elements.redirects") },
              { key: "certificates", label: translate("security.website.form.elements.certificates") }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.suspiciousElements.includes(label)}
                  onChange={() => handleCheckboxChange(label)}
                  className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500"
                />
                <span className="text-neutral-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Taken */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.communication.form.actionLabel")}
          </label>
          <select
            value={formData.actionTaken}
            onChange={(e) => handleInputChange("actionTaken", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">{translate("common.select")}</option>
            <option value="left_immediately">{translate("security.website.form.actions.left")}</option>
            <option value="closed_app">{translate("security.website.form.actions.closed")}</option>
            <option value="reported_store">{translate("security.website.form.actions.reported")}</option>
            <option value="contacted_bank">{translate("security.communication.form.actions.bank")}</option>
            <option value="changed_passwords">{translate("security.website.form.actions.passwords")}</option>
            <option value="other">{translate("security.communication.form.actions.other")}</option>
          </select>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.communication.form.additionalLabel")}
          </label>
          <textarea
            value={formData.additionalDetails}
            onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
            placeholder={translate("security.communication.form.additionalPlaceholder")}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {translate("security.communication.form.submit")}
          </button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-12 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">{translate("security.website.tips.title")}</h3>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.website.tips.url")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.website.tips.padlock")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.website.tips.design")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.website.tips.stores")}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 