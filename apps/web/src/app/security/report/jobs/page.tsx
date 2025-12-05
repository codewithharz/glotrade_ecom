"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, AlertTriangle, Shield, CheckCircle, Building, DollarSign, Users } from "lucide-react";
import { apiPost } from "@/utils/api";

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
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Report Submitted Successfully</h1>
          <p className="text-neutral-600 mb-6">
            Thank you for reporting this suspicious job opportunity. Our security team will investigate and take appropriate action.
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
        <span className="text-neutral-700">Job & Opportunity Scams</span>
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
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">Report Fake Job Opportunities</h1>
        </div>
        <p className="text-lg text-neutral-600">
          Report fake job postings, investment schemes, or business opportunities that falsely claim to be from AfriTrade.
        </p>
      </div>

      {/* Security Warning */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Important:</strong> If you've already provided personal information, sent money, or shared documents, contact your bank immediately and consider reporting to local authorities.
          </div>
        </div>
      </div>

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type of Scam */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Type of Suspicious Activity *
          </label>
          <div className="space-y-3">
            {[
              { value: "fake_job", label: "Fake Job Posting", icon: Briefcase, description: "Job offers claiming to be from AfriTrade" },
              { value: "investment_scheme", label: "Investment Scheme", icon: DollarSign, description: "Promises of high returns using AfriTrade's name" },
              { value: "business_opportunity", label: "Business Partnership", icon: Building, description: "Fake business opportunities or partnerships" },
              { value: "recruitment_scam", label: "Recruitment Scam", icon: Users, description: "Fake recruitment or hiring processes" }
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
              Company/Organization Name *
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
              Job Title (if applicable)
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
              Contact Information *
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
              Platform Where Found
            </label>
            <select
              value={formData.platform}
              onChange={(e) => handleInputChange("platform", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select platform</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="email">Email</option>
              <option value="social_media">Social Media</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Describe the suspicious opportunity *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what was offered, what made it suspicious, and any other details..."
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Suspicious Elements */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            What made this opportunity suspicious? (Select all that apply)
          </label>
          <div className="space-y-2">
            {[
              "Unrealistically high salary or benefits",
              "Asked for upfront payment or fees",
              "Required immediate action or decision",
              "Asked for personal documents (passport, SSN, etc.)",
              "Offered work-from-home with minimal requirements",
              "Asked to process payments or handle money",
              "Required investment or purchase of equipment",
              "Had poor grammar or spelling in communications",
              "Asked for bank account or payment information",
              "Claimed affiliation with AfriTrade but seemed unprofessional",
              "Offered commission-based work with high promises",
              "Asked to recruit others or build a team"
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
            <option value="ignored">Ignored the opportunity</option>
            <option value="blocked">Blocked the sender</option>
            <option value="reported_platform">Reported to the platform</option>
            <option value="contacted_bank">Contacted my bank</option>
            <option value="reported_authorities">Reported to authorities</option>
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
            placeholder="Any screenshots, emails, job descriptions, or other information that might be helpful..."
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
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">How to Spot Fake Job Opportunities</h3>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Legitimate companies never ask for upfront payment or fees</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Be wary of opportunities that seem too good to be true</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Research the company thoroughly before applying</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Never share personal documents or bank information</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>All legitimate AfriTrade job postings are listed on our official careers page</span>
          </div>
        </div>
      </div>
    </div>
  );
} 