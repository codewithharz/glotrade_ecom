import Link from "next/link";
import { Shield, Phone, Mail, Globe, Briefcase, AlertTriangle, CheckCircle } from "lucide-react";

export default function FraudCasesPage() {
  return (
    <div className="mx-auto w-[95%] px-4 md:px-6 py-6 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:underline text-neutral-600">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/security" className="hover:underline text-neutral-600">Security</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-700">Common Fraud Cases</span>
      </nav>

      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Common Fraud Cases</h1>

      {/* Introductory Text */}
      <div className="mb-8 text-lg text-neutral-700 leading-relaxed">
        <p>
          Stay informed about common fraud tactics used by scammers. Knowledge is your best defense against fraud. If you encounter any of these situations, report them immediately.
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
            <h2 className="text-xl font-semibold text-neutral-800">Communication Fraud</h2>
          </div>
          
          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Fake SMS/Email:</strong> Messages claiming to be from AfriTrade asking for payment verification or account updates</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Urgent Payment Requests:</strong> Demands for immediate payment via unusual methods (gift cards, cryptocurrency)</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Account Suspension Threats:</strong> False warnings about account suspension requiring immediate action</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800">
                <strong>Remember:</strong> AfriTrade will never ask for your password, payment information, or personal details via SMS or email.
              </span>
            </div>
          </div>
        </div>

        {/* Website/App Impersonation */}
        <div className="border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800">Website & App Impersonation</h2>
          </div>
          
          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Fake Websites:</strong> Sites that look like AfriTrade but have slightly different URLs</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Copycat Apps:</strong> Mobile apps in app stores that mimic our platform</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Phishing Pages:</strong> Pages designed to steal login credentials and payment information</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800">
                <strong>Always verify:</strong> Check the URL carefully. Our official website is always afritrade.com
              </span>
            </div>
          </div>
        </div>

        {/* Job Scams */}
        <div className="border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800">Job & Opportunity Scams</h2>
          </div>
          
          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Fake Job Postings:</strong> Job offers claiming to be from AfriTrade with unrealistic salaries</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Investment Schemes:</strong> Promises of high returns using AfriTrade's name</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span><strong>Partnership Scams:</strong> Fake business opportunities claiming affiliation with AfriTrade</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-800">
                <strong>Verify employment:</strong> All legitimate AfriTrade job postings are listed on our official careers page.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-3 text-emerald-800">Suspicious Activity Detected?</h3>
          <p className="text-sm text-emerald-700 mb-4">
            Don't hesitate to report any suspicious activity. Your reports help protect our entire community.
          </p>
          <Link 
            href="/security/report"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Report Suspicious Activity
          </Link>
        </div>
      </div>
    </div>
  );
} 