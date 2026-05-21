import Link from "next/link"

export const metadata = {
  title: "Terms of Use — MAFS",
  description: "MAFS Terms of Use (EULA), including subscription terms for Pro and Elite auto-renewable subscriptions.",
}

export default function TermsOfUsePage() {
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
            Terms of Use
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: May 21, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose-policy space-y-10 text-sm leading-relaxed text-gray-300">
          <p>
            These Terms of Use (the &quot;Terms&quot; or &quot;EULA&quot;) govern your use of the MAFS
            (Multi-Agent Fight Simulator) application and services. By creating an account or using
            the app, you agree to these Terms.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MAFS, you confirm that you are at least 18 years old and agree to
              be bound by these Terms. If you do not agree, do not use the app.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">2. The Service</h2>
            <p>
              MAFS provides analytical simulations, statistical insights, and predictions related to
              combat sports for educational and entertainment purposes only. MAFS does not facilitate,
              enable, or accept any form of wagering. All outputs are hypothetical and based on
              historical data; past performance does not guarantee future results. You are solely
              responsible for any decisions you make outside the app.
            </p>
          </section>

          {/* Section 3 — Subscriptions (required by Guideline 3.1.2(c)) */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">3. Subscriptions</h2>
            <p className="mb-3">
              MAFS offers optional auto-renewable subscriptions that unlock premium features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>
                <span className="text-gray-300 font-medium">MAFS Pro</span> — auto-renewing monthly
                subscription. Unlocks unlimited fight analyses, advanced metrics &amp; edges, and early
                access to models. Price is shown in the app on the subscription screen at the time of
                purchase (and varies by region).
              </li>
              <li>
                <span className="text-gray-300 font-medium">MAFS Elite</span> — auto-renewing monthly
                subscription. Includes everything in Pro plus automated weekly simulations and the AI
                Gameplan. Price is shown in the app on the subscription screen at the time of purchase
                (and varies by region).
              </li>
            </ul>
            <p className="mt-4 mb-3">
              The following terms apply to subscriptions purchased through the iOS app:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Payment is charged to your Apple ID account at confirmation of purchase.</li>
              <li>
                The subscription automatically renews for the same period unless auto-renew is turned
                off at least 24 hours before the end of the current period.
              </li>
              <li>
                Your account is charged for renewal within 24 hours prior to the end of the current
                period at the price of the selected plan.
              </li>
              <li>
                You can manage or cancel your subscription, and turn off auto-renewal, in your device
                Settings → Apple ID → Subscriptions after purchase.
              </li>
              <li>
                Any unused portion of a free trial period (if offered) is forfeited when you purchase
                a subscription.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">4. Account &amp; Deletion</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You
              may permanently delete your account at any time from{" "}
              <span className="text-gray-300 font-medium">Settings → Delete Account</span> inside the
              app. Deletion is immediate and removes your account and associated data.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">5. Acceptable Use</h2>
            <p>
              You agree not to misuse the service, attempt to disrupt it, reverse engineer it, or use
              it for any unlawful purpose. We may suspend or terminate access for violations of these
              Terms.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">6. Disclaimers &amp; Limitation of Liability</h2>
            <p>
              The service is provided &quot;as is&quot; without warranties of any kind. MAFS is not
              liable for any losses or damages arising from your use of the app or any decisions made
              based on its content. Simulations are for informational purposes only.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">7. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the app after changes take
              effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">8. Contact</h2>
            <p>
              For questions about these Terms, contact:{" "}
              <a href="mailto:support@mafs.ai" className="text-[#64FFDA] hover:underline">
                support@mafs.ai
              </a>
            </p>
          </section>

          <p className="text-xs text-muted-foreground/60">
            See also our{" "}
            <Link href="/privacy" className="text-[#64FFDA] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
