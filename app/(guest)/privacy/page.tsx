import Link from "next/link"

export const metadata = {
  title: "Privacy Policy — MAFS",
  description: "MAFS Privacy Policy. Learn about what data we collect, how we use it, and your rights.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: February 17, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose-policy space-y-10 text-sm leading-relaxed text-gray-300">
          <p>
            MAFS respects your privacy and is committed to protecting your information. This Privacy Policy explains what data we collect, how we use it, and your rights.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-3">We may collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><span className="text-gray-300 font-medium">Account Information</span> — name, email address, login credentials</li>
              <li><span className="text-gray-300 font-medium">Usage Data</span> — app interactions, feature usage, analytics</li>
              <li><span className="text-gray-300 font-medium">Device Information</span> — device type, operating system, diagnostics</li>
              <li><span className="text-gray-300 font-medium">Subscription Information</span> — purchase and billing status via Apple In-App Purchase or payment processors</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              2. How We Use Information
            </h2>
            <p className="mb-3">We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Provide and maintain app functionality</li>
              <li>Manage user accounts</li>
              <li>Process subscriptions and payments</li>
              <li>Improve performance and user experience</li>
              <li>Monitor security and prevent abuse</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              3. Payments
            </h2>
            <p>
              Subscriptions purchased within the iOS app are processed through Apple In-App Purchase. We do not store full payment details.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              4. Analytics
            </h2>
            <p>
              We may use analytics tools to understand usage patterns and improve the application.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              5. Data Sharing
            </h2>
            <p>
              We do not sell personal data. Information may be shared with trusted service providers solely to operate and improve the service.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              6. Data Security
            </h2>
            <p>
              We implement reasonable security measures to protect user data.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              7. User Rights
            </h2>
            <p>
              Users may request access, correction, or deletion of their data by contacting us.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              8. Contact
            </h2>
            <p>
              For privacy-related questions, contact:{" "}
              <a
                href="mailto:support@mafs.ai"
                className="text-[#64FFDA] hover:underline"
              >
                support@mafs.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
