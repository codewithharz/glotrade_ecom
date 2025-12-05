"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Smartphone, AlertTriangle, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { apiPost } from "@/utils/api";

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
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Report Submitted Successfully</h1>
          <p className="text-neutral-600 mb-6">
            Thank you for reporting this suspicious website/app. Our security team will investigate and take appropriate action.
          </p>
          <div className="space-y-3">
            <Link 
              href="/security/report"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Report Another Issue
            </Link>
            <div>
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Return to Homepage
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
        <Link href="/" className="hover:underline text-neutral-600">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/security/report" className="hover:underline text-neutral-600">Report Suspicious Activity</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-700">Website & App Impersonation</span>
      </nav>

      {/* Back Button */}
      <Link 
        href="/security/report"
        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reporting Options
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">Report Fake Website or App</h1>
        </div>
        <p className="text-lg text-neutral-600">
          Report websites or mobile apps that impersonate AfriTrade or try to steal user information.
        </p>
      </div>

      {/* Security Warning */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Important:</strong> If you've already entered personal information or made a payment on a suspicious site, contact your bank immediately and change your passwords.
          </div>
        </div>
      </div>

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type of Impersonation */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Type of Impersonation *
          </label>
          <div className="space-y-3">
            {[
              { value: "website", label: "Fake Website", icon: Globe },
              { value: "mobile_app", label: "Fake Mobile App", icon: Smartphone }
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
              Website URL *
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
                App Name *
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
                App Store *
              </label>
              <select
                value={formData.appStore}
                onChange={(e) => handleInputChange("appStore", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select app store</option>
                <option value="google_play">Google Play Store</option>
                <option value="app_store">Apple App Store</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Describe the suspicious website/app *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what you saw, what made it suspicious, and any other details..."
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Suspicious Elements */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            What made this website/app suspicious? (Select all that apply)
          </label>
          <div className="space-y-2">
            {[
              "URL looks similar but slightly different from afritrade.com",
              "Asked for login credentials or personal information",
              "Requested payment information",
              "Had poor design or looked unprofessional",
              "Contained spelling or grammar errors",
              "Created sense of urgency",
              "Offered unrealistic deals or prices",
              "Asked to download suspicious files",
              "Redirected to other suspicious websites",
              "Had fake security certificates or warnings"
            ].map((element) => (
              <label key={element} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.suspiciousElements.includes(element)}
                  onChange={() => handleCheckboxChange(element)}
                  className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500"
                />
                <span className="text-neutral-700">{element}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Taken */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            What action did you take?
          </label>
          <select
            value={formData.actionTaken}
            onChange={(e) => handleInputChange("actionTaken", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select an option</option>
            <option value="left_immediately">Left the website immediately</option>
            <option value="closed_app">Closed the app</option>
            <option value="reported_store">Reported to app store</option>
            <option value="contacted_bank">Contacted my bank</option>
            <option value="changed_passwords">Changed my passwords</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Additional Details */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            value={formData.additionalDetails}
            onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
            placeholder="Any screenshots, error messages, or other information that might be helpful..."
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
            Submit Report
          </button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-12 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">How to Spot Fake Websites & Apps</h3>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Always check the URL carefully - our official website is afritrade.com</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Look for the padlock icon in your browser's address bar</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Be wary of sites with poor design, spelling errors, or unrealistic offers</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Only download apps from official app stores (Google Play, Apple App Store)</span>
          </div>
        </div>
      </div>
    </div>
  );
} 