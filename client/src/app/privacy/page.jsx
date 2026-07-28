import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { ShieldCheck, Calendar } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — FileCloud",
  description: "How FileCloud collects, uses, and protects your data.",
};

export default function PrivacyPage() {
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
            <ShieldCheck size={12} /> Privacy
          </span>
          <h1
            className="text-4xl md:text-5xl font-extrabold fc-text tracking-tight mb-4"
            style={{ letterSpacing: "-0.025em" }}
          >
            Privacy Policy
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
                Your privacy matters. This Privacy Policy explains what data
                FileCloud collects, how we use it, and the choices you have.
                By using FileCloud, you agree to the practices described here.
              </p>

              <h2>1. Information we collect</h2>
              <h3>1.1 Account information</h3>
              <ul>
                <li>Full name</li>
                <li>Email address (verified via OTP)</li>
                <li>Hashed password (never stored in plain text)</li>
                <li>Account creation timestamp</li>
              </ul>

              <h3>1.2 Subscription data</h3>
              <ul>
                <li>Plan selected (Free, Silver, Gold, Diamond)</li>
                <li>Subscription status (active, expired, canceled)</li>
                <li>Stripe payment tokens (we never see your card number)</li>
                <li>Billing history dates</li>
              </ul>

              <h3>1.3 File & folder metadata</h3>
              <ul>
                <li>File names, sizes, formats, and upload timestamps</li>
                <li>Folder structure and nesting levels</li>
                <li>Cloudinary storage URLs for uploaded content</li>
              </ul>

              <h3>1.4 Technical data</h3>
              <ul>
                <li>IP address (for security)</li>
                <li>Browser type and device information</li>
                <li>Session tokens (JWT)</li>
              </ul>

              <h2>2. How we use your data</h2>
              <ul>
                <li>Provide, operate, and maintain the Service</li>
                <li>Enforce subscription rules at the backend</li>
                <li>Process payments through Stripe</li>
                <li>Send verification and password reset emails</li>
                <li>Detect and prevent abuse or fraud</li>
                <li>Improve the Service and diagnose technical issues</li>
              </ul>

              <h2>3. Third-party services</h2>
              <p>We rely on trusted providers to run the platform:</p>
              <ul>
                <li>
                  <strong>Stripe</strong> — payment processing and subscription
                  billing
                </li>
                <li>
                  <strong>Cloudinary</strong> — encrypted media storage and
                  delivery
                </li>
                <li>
                  <strong>SMTP provider</strong> — transactional emails (OTP,
                  password reset)
                </li>
              </ul>
              <p>
                Each of these vendors has its own privacy practices. We
                recommend reviewing their policies for details.
              </p>

              <h2>4. Data security</h2>
              <p>
                We use industry-standard practices to safeguard your data:
                bcrypt password hashing, JWT-signed sessions, HTTPS transport
                encryption, and strict backend validation on every request. No
                system is 100% secure, but we work hard to protect your data.
              </p>

              <h2>5. Data retention</h2>
              <p>
                We retain your account data as long as your account remains
                active. If you delete your account, your files, folders, and
                subscription history are removed within a reasonable grace
                period, except where retention is required by law.
              </p>

              <h2>6. Your rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Export your file metadata</li>
                <li>Withdraw consent for optional processing</li>
              </ul>

              <h2>7. Children's privacy</h2>
              <p>
                FileCloud is not directed to children under 13. We do not
                knowingly collect data from anyone under that age. If you
                believe we have, please contact us so we can remove it.
              </p>

              <h2>8. Changes to this policy</h2>
              <p>
                We may update this policy periodically. Material changes will
                be announced within the app or via email. Continued use of the
                Service after changes take effect constitutes acceptance.
              </p>

              <h2>9. Contact</h2>
              <p>
                For privacy-related questions, reach out through the{" "}
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
