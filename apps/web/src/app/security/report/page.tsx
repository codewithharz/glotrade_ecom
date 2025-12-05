import Link from "next/link";
import { ArrowRight, Shield, AlertTriangle } from "lucide-react";

export default function ReportSuspiciousPage() {
  return (
    <div className="mx-auto w-[95%] px-4 md:px-6 py-6 max-w-4xl">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:underline text-neutral-600">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/support" className="hover:underline text-neutral-600">Support center</Link>
        <span className="mx-2">›</span>
        <span className="text-neutral-700">Report Something Suspicious</span>
      </nav>

      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Report something suspicious</h1>

      {/* Introductory Text */}
      <div className="mb-8 text-lg text-neutral-700 leading-relaxed">
        <p>
          We promise to protect your privacy and data. If you come across any suspicious activity or have any concerns, please report them to us immediately through the options provided below. We will treat your report seriously. Thank you for your support and cooperation!
        </p>
      </div>

      {/* Important Note */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <strong>Important:</strong> If you have any non-suspicious reports, such as official activities and order after-sales, please contact{" "}
            <Link href="/support" className="text-yellow-700 underline hover:text-yellow-800 font-medium">
              AfriTrade customer service
            </Link>
            .
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-800">
          Select a suspicious situation you encountered
        </h2>
      </div>

      {/* Reporting Options */}
      <div className="space-y-4">
        <Link 
          href="/security/report/communication"
          className="block w-full p-6 border border-neutral-200 hover:border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-red-600 transition-colors">
                  Report a suspicious phone call, email, or SMS/text message
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Report any suspicious communication claiming to be from AfriTrade
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link 
          href="/security/report/website"
          className="block w-full p-6 border border-neutral-200 hover:border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-blue-600 transition-colors">
                  Report a fake website or app similar to AfriTrade
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Report websites or apps that impersonate our platform
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link 
          href="/security/report/jobs"
          className="block w-full p-6 border border-neutral-200 hover:border-neutral-300 rounded-lg bg-white hover:bg-neutral-50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800 group-hover:text-green-600 transition-colors">
                  Report fake job opportunities and other activities that impersonate AfriTrade
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Report fake job postings or activities using our brand name
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Additional Security Information */}
      <div className="mt-12 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
        <h3 className="text-lg font-semibold mb-3 text-neutral-800">How we protect you:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>24/7 security monitoring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Immediate threat response</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Secure data protection</span>
          </div>
        </div>
      </div>
    </div>
  );
} 