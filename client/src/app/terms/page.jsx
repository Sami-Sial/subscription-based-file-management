import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { FileText, Calendar } from "lucide-react";

export const metadata = {
  title: "Terms of Service — FileCloud",
  description: "The terms and conditions for using the FileCloud platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen fc-canvas">
      <PublicHeader />

      <section className="pt-16 pb-10">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] mb-5"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent-ring)",
            }}
          >
            <FileText size={12} /> Legal
          </span>
          <h1
            className="text-4xl md:text-5xl font-extrabold fc-text tracking-tight mb-4"
            style={{ letterSpacing: "-0.025em" }}
          >
            Terms of Service
          </h1>
          <div className="flex items-center gap-2 fc-text-muted text-xs">
            <Calendar size={12} />
            Last updated: January 1, 2026
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <div className="fc-card p-8 md:p-10">
            <div className="fc-prose">
              <p>
                Welcome to FileCloud. These Terms of Service ("Terms") govern
                your access to and use of the FileCloud file & folder management
                platform (the "Service"). By creating an account or using the
                Service, you agree to be bound by these Terms.
              </p>

              <h2>1. Accounts</h2>
              <p>
                You must be at least 13 years old to create an account. You are
                responsible for maintaining the confidentiality of your
                credentials and for all activities that occur under your
                account. Notify us immediately of any unauthorized use.
              </p>

              <h2>2. Subscription plans & quotas</h2>
              <p>
                FileCloud offers subscription-based storage capabilities. Each
                plan defines specific limits including:
              </p>
              <ul>
                <li>Maximum number of folders</li>
                <li>Maximum nesting depth</li>
                <li>Allowed file types (images, videos, audio, PDFs)</li>
                <li>Maximum file size (in MB)</li>
                <li>Total file limit</li>
                <li>Files per folder limit</li>
              </ul>
              <p>
                All limits are enforced at the backend on every request. If you
                exceed your plan, actions may be rejected. Upgrading or
                downgrading your plan changes future limits but does not delete
                existing files or folders.
              </p>

              <h3>2.1 Payments</h3>
              <p>
                Paid plans are billed monthly through Stripe. By subscribing,
                you authorize FileCloud to charge your selected payment method
                on a recurring basis until you cancel. All fees are
                non-refundable except as required by law.
              </p>

              <h2>3. Acceptable use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Upload illegal, infringing, or malicious content</li>
                <li>Bypass or attempt to bypass subscription enforcement</li>
                <li>Distribute malware, viruses, or harmful code</li>
                <li>Harass, threaten, or harm others</li>
                <li>Attempt unauthorized access to other user accounts</li>
              </ul>

              <h2>4. Your content</h2>
              <p>
                You retain ownership of all files and folders you upload. By
                uploading content, you grant FileCloud a limited license to
                store, process, and display your content solely to operate the
                Service.
              </p>

              <h2>5. Termination</h2>
              <p>
                We may suspend or terminate your account if you violate these
                Terms. You may cancel your account at any time from the
                Settings page. Upon termination, your data may be deleted after
                a reasonable grace period.
              </p>

              <h2>6. Disclaimers</h2>
              <p>
                The Service is provided "as is" without warranties of any kind,
                whether express or implied. FileCloud does not guarantee
                uninterrupted or error-free operation.
              </p>

              <h2>7. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, FileCloud shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of the Service.
              </p>

              <h2>8. Changes to these Terms</h2>
              <p>
                We may update these Terms from time to time. Continued use of
                the Service after changes take effect constitutes acceptance of
                the revised Terms.
              </p>

              <h2>9. Contact</h2>
              <p>
                Questions about these Terms? Reach out through the{" "}
                <a
                  href="https://sami-sial-portfolio.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  contact page
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
