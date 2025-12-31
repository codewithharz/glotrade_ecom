"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageSquare, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { apiPost } from "@/utils/api";
import { translate } from "@/utils/translate";

export default function ReportCommunicationPage() {
  const [formData, setFormData] = useState({
    type: "",
    sender: "",
    content: "",
    date: "",
    time: "",
    phoneNumber: "",
    emailAddress: "",
    suspiciousElements: [] as string[],
    actionTaken: "",
    additionalDetails: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await apiPost<{ status: string; message?: string }>('/api/v1/security-reports/submit', {
        reportType: 'communication',
        type: formData.type,
        sender: formData.sender,
        date: formData.date,
        time: formData.time,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        description: formData.content,
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
            {translate("security.communication.success.desc")}
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
        <span className="text-neutral-700">{translate("security.communication.breadcrumb")}</span>
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
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">{translate("security.communication.title")}</h1>
        </div>
        <p className="text-lg text-neutral-600">
          {translate("security.communication.desc")}
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
        {/* Communication Type */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.communication.form.typeLabel")}
          </label>
          <div className="space-y-3">
            {[
              { value: "phone", label: translate("security.communication.form.types.phone"), icon: Phone },
              { value: "email", label: translate("security.communication.form.types.email"), icon: Mail },
              { value: "sms", label: translate("security.communication.form.types.sms"), icon: MessageSquare }
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

        {/* Sender Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.communication.form.senderLabel")}
            </label>
            <input
              type="text"
              value={formData.sender}
              onChange={(e) => handleInputChange("sender", e.target.value)}
              placeholder={translate("security.communication.form.senderPlaceholder")}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.communication.form.dateLabel")}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.type === "phone" && (
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {translate("security.communication.form.phoneLabel")}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}
          {formData.type === "email" && (
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {translate("security.communication.form.emailLabel")}
              </label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                placeholder="sender@example.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              {translate("security.communication.form.timeLabel")}
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Communication Content */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            {translate("security.communication.form.contentLabel")}
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder={translate("security.communication.form.contentPlaceholder")}
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
              { key: "personalInfo", label: translate("security.communication.form.elements.personalInfo") },
              { key: "immediatePayment", label: translate("security.communication.form.elements.immediatePayment") },
              { key: "suspension", label: translate("security.communication.form.elements.suspension") },
              { key: "crypto", label: translate("security.communication.form.elements.crypto") },
              { key: "unprofessional", label: translate("security.communication.form.elements.unprofessional") },
              { key: "grammar", label: translate("security.communication.form.elements.grammar") },
              { key: "urgency", label: translate("security.communication.form.elements.urgency") },
              { key: "links", label: translate("security.communication.form.elements.links") }
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
            <option value="ignored">{translate("security.communication.form.actions.ignored")}</option>
            <option value="blocked">{translate("security.communication.form.actions.blocked")}</option>
            <option value="reported">{translate("security.communication.form.actions.reported")}</option>
            <option value="contacted_bank">{translate("security.communication.form.actions.bank")}</option>
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
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">{translate("security.communication.tips.title")}</h3>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.communication.tips.neverAsk")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.communication.tips.noThreat")}</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{translate("security.communication.tips.official")}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 