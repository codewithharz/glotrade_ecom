"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, AlertTriangle, Shield, CheckCircle, Building, DollarSign, Users } from "lucide-react";
import { apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export default function ReportJobsPage() {
  const [formData, setFormData] = useState({
    type: "",
    companyName: "",
    jobTitle: "",
    contactInfo: "",
    platform: "",
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
        reportType: 'jobs',
        type: formData.type,
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        contactInfo: formData.contactInfo,
        platform: formData.platform,
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
            {translate("security.jobs.success.desc")}
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
        <span className="text-neutral-700">{translate("security.jobs.breadcrumb")}</span>
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
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">{translate("security.jobs.title")}</h1>
        </div>
        <p className="text-lg text-neutral-600">
          {translate("security.jobs.desc")}
        </p>
      </div>

      {/* Security Warning */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <span dangerouslySetInnerHTML={{ __html: translate("security.jobs.warning") }} />
          </div>
        </div>
      </div>

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type of Scam */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.jobs.form.typeLabel")}
          </label>
          <div className="space-y-3">
            {[
              { value: "fake_job", label: translate("security.jobs.form.types.fake_job.label"), icon: Briefcase, description: translate("security.jobs.form.types.fake_job.desc") },
              { value: "investment_scheme", label: translate("security.jobs.form.types.investment_scheme.label"), icon: DollarSign, description: translate("security.jobs.form.types.investment_scheme.desc") },
              { value: "business_opportunity", label: translate("security.jobs.form.types.business_opportunity.label"), icon: Building, description: translate("security.jobs.form.types.business_opportunity.desc") },
              { value: "recruitment_scam", label: translate("security.jobs.form.types.recruitment_scam.label"), icon: Users, description: translate("security.jobs.form.types.recruitment_scam.desc") }
            ].map(({ value, label, icon: Icon, description }) => (
              <label key={value} className="flex items-start gap-3 cursor-pointer p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50">
                <input
                  type="radio"
                  name="type"
                  value={value}
                  checked={formData.type === value}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-4 h-4 text-emerald-600 border-neutral-300 focus:ring-emerald-500 mt-1"
                  required
                />
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-neutral-500" />
                  <div>
                    <div className="font-medium text-neutral-800">{label}</div>
                    <div className="text-sm text-neutral-600">{description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.jobs.form.companyLabel")}
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              placeholder="e.g., AfriTrade Solutions Inc."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.jobs.form.jobTitleLabel")}
            </label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              placeholder="e.g., Senior Developer"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.jobs.form.contactLabel")}
            </label>
            <input
              type="text"
              value={formData.contactInfo}
              onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              placeholder="Email, phone, or website"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.jobs.form.platformLabel")}
            </label>
            <select
              value={formData.platform}
              onChange={(e) => handleInputChange("platform", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">{translate("common.select")}</option>
              <option value="linkedin">{translate("security.jobs.form.platforms.linkedin")}</option>
              <option value="indeed">{translate("security.jobs.form.platforms.indeed")}</option>
              <option value="glassdoor">{translate("security.jobs.form.platforms.glassdoor")}</option>
              <option value="email">{translate("security.jobs.form.platforms.email")}</option>
              <option value="social_media">{translate("security.jobs.form.platforms.social")}</option>
              <option value="website">{translate("security.jobs.form.platforms.website")}</option>
              <option value="other">{translate("security.jobs.form.platforms.other")}</option>
            </select>
          </div>
        </div>

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
              { key: "salary", label: translate("security.jobs.form.elements.salary") },
              { key: "upfront", label: translate("security.jobs.form.elements.upfront") },
              { key: "urgency", label: translate("security.jobs.form.elements.urgency") },
              { key: "documents", label: translate("security.jobs.form.elements.documents") },
              { key: "wfh", label: translate("security.jobs.form.elements.wfh") },
              { key: "money", label: translate("security.jobs.form.elements.money") },
              { key: "investment", label: translate("security.jobs.form.elements.investment") },
              { key: "grammar", label: translate("security.jobs.form.elements.grammar") },
              { key: "bank", label: translate("security.jobs.form.elements.bank") },
              { key: "unprofessional", label: translate("security.jobs.form.elements.unprofessional") },
              { key: "commission", label: translate("security.jobs.form.elements.commission") },
              { key: "recruit", label: translate("security.jobs.form.elements.recruit") }
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
            <option value="ignored">{translate("security.jobs.form.actions.ignored")}</option>
            <option value="blocked">{translate("security.jobs.form.actions.blocked")}</option>
            <option value="reported_platform">{translate("security.jobs.form.actions.reported_platform")}</option>
            <option value="contacted_bank">{translate("security.communication.form.actions.bank")}</option>
            <option value="reported_authorities">{translate("security.jobs.form.actions.reported_authorities")}</option>
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
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">{translate("security.jobs.tips.title")}</h3>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.jobs.tips.noFees")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.jobs.tips.tooGood")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.jobs.tips.research")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.jobs.tips.noShare")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.jobs.tips.careers")}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 