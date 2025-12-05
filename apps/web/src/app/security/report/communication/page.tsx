"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageSquare, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { apiPost } from "@/utils/api";

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
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Report Submitted Successfully</h1>
          <p className="text-neutral-600 mb-6">
            Thank you for reporting this suspicious activity. Our security team will review your report and take appropriate action.
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
        <span className="text-neutral-700">Communication Fraud</span>
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
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800">Report Suspicious Communication</h1>
        </div>
        <p className="text-lg text-neutral-600">
          Report any suspicious phone calls, emails, or SMS/text messages that claim to be from AfriTrade.
        </p>
      </div>

      {/* Security Warning */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <strong>Important:</strong> If you've already provided personal information or made a payment, contact your bank immediately and consider changing your passwords.
          </div>
        </div>
      </div>

      {/* Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Communication Type */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Type of Communication *
          </label>
          <div className="space-y-3">
            {[
              { value: "phone", label: "Phone Call", icon: Phone },
              { value: "email", label: "Email", icon: Mail },
              { value: "sms", label: "SMS/Text Message", icon: MessageSquare }
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
              Sender Name/Organization
            </label>
            <input
              type="text"
              value={formData.sender}
              onChange={(e) => handleInputChange("sender", e.target.value)}
              placeholder="Who claimed to contact you?"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Date of Communication *
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
                Phone Number
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
                Email Address
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
              Time of Communication
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
            What did they say or ask for? *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            placeholder="Describe the suspicious communication in detail..."
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Suspicious Elements */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            What made this communication suspicious? (Select all that apply)
          </label>
          <div className="space-y-2">
            {[
              "Asked for personal information (passwords, SSN, etc.)",
              "Demanded immediate payment",
              "Threatened account suspension",
              "Asked for gift cards or cryptocurrency",
              "Claimed to be from AfriTrade but seemed unprofessional",
              "Had poor grammar or spelling",
              "Created sense of urgency",
              "Asked to click on suspicious links"
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
            <option value="ignored">Ignored the communication</option>
            <option value="blocked">Blocked the sender</option>
            <option value="reported">Reported to authorities</option>
            <option value="contacted_bank">Contacted my bank</option>
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
            placeholder="Any other information that might be helpful..."
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
        <h3 className="text-lg font-semibold mb-3 text-emerald-800">Security Tips</h3>
        <div className="space-y-2 text-sm text-emerald-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>AfriTrade will never ask for your password or payment information via phone, email, or SMS</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>We will never threaten to suspend your account for immediate action</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>Official communications always come from verified @afritrade.com addresses</span>
          </div>
        </div>
      </div>
    </div>
  );
} 