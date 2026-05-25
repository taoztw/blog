import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Tz Blog",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 2, 2026
        </p>
      </div>

      <Separator className="mb-10" />

      <div className="space-y-8 text-[15px] leading-relaxed text-ink-700">
        {/* Introduction */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            1. Introduction
          </h2>
          <p>
            Welcome to Tz Blog (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
            &ldquo;us&rdquo;). We respect your privacy and are committed to
            protecting your personal data. This privacy policy explains how we
            collect, use, and safeguard your information when you visit our
            website.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            2. Information We Collect
          </h2>
          <p className="mb-3">
            We may collect the following types of information:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong className="text-foreground">Account Information:</strong>{" "}
              When you sign in via Google or GitHub, we receive your name, email
              address, and profile picture from the authentication provider.
            </li>
            <li>
              <strong className="text-foreground">Usage Data:</strong> We
              collect anonymous usage data such as page views and IP addresses
              to improve our services and prevent abuse.
            </li>
            <li>
              <strong className="text-foreground">
                Comments and Interactions:
              </strong>{" "}
              Content you post, such as comments and reactions, is stored to
              provide the blog&apos;s interactive features.
            </li>
            <li>
              <strong className="text-foreground">Cookies:</strong> We use
              essential cookies for authentication and session management. No
              third-party tracking cookies are used.
            </li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>To provide and maintain our blog service</li>
            <li>To manage your account and authentication</li>
            <li>To display your comments and interactions</li>
            <li>To analyze usage patterns and improve user experience</li>
            <li>To prevent spam and abusive behavior</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            4. Data Sharing
          </h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties. We may share data with service
            providers (such as Cloudflare for hosting) solely to operate and
            maintain our website.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            5. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction. Our application is hosted on Cloudflare
            Workers with encrypted connections.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            6. Your Rights
          </h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, please contact us at{" "}
            <a
              href="mailto:tztw4723@gmail.com"
              className="text-seal underline underline-offset-2 hover:text-seal/80"
            >
              tztw4723@gmail.com
            </a>
            .
          </p>
        </section>

        {/* Third-Party Services */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            7. Third-Party Services
          </h2>
          <p>
            We use the following third-party services:
          </p>
          <ul className="list-disc space-y-2 pl-6 mt-3">
            <li>
              <strong className="text-foreground">Google OAuth:</strong> For
              user authentication. Subject to{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-seal underline underline-offset-2 hover:text-seal/80"
              >
                Google&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">GitHub OAuth:</strong> For
              user authentication. Subject to{" "}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-seal underline underline-offset-2 hover:text-seal/80"
              >
                GitHub&apos;s Privacy Statement
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Cloudflare:</strong> For
              hosting and content delivery. Subject to{" "}
              <a
                href="https://www.cloudflare.com/privacypolicy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-seal underline underline-offset-2 hover:text-seal/80"
              >
                Cloudflare&apos;s Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Changes */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            8. Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Any changes
            will be posted on this page with an updated revision date. We
            encourage you to review this policy periodically.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">
            9. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a
              href="mailto:tztw4723@gmail.com"
              className="text-seal underline underline-offset-2 hover:text-seal/80"
            >
              tztw4723@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
