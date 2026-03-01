import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Tz Blog",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: March 2, 2026</p>
      </div>

      <Separator className="mb-10" />

      <div className="space-y-8 text-[15px] leading-relaxed text-ink-700 dark:text-ink-300">
        {/* Acceptance */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Tz Blog (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service.
            If you do not agree with any part of these terms, please do not use the Service.
          </p>
        </section>

        {/* Description */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">2. Description of Service</h2>
          <p>
            Tz Blog is a personal blog platform that provides articles, tutorials, and discussions on technology topics.
            The Service includes features such as reading blog posts, leaving comments, and reacting to content.
          </p>
        </section>

        {/* User Accounts */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">3. User Accounts</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              You may sign in using third-party authentication providers (Google, GitHub). You are responsible for
              maintaining the security of your account.
            </li>
            <li>You must provide accurate information during the authentication process.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        {/* User Content */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">4. User Content</h2>
          <p className="mb-3">When you post comments or interact with the Service:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>You retain ownership of your content but grant us a license to display it on the platform.</li>
            <li>
              You agree not to post content that is illegal, harmful, threatening, abusive, harassing, defamatory, or
              otherwise objectionable.
            </li>
            <li>We reserve the right to remove any content that violates these terms without prior notice.</li>
          </ul>
        </section>

        {/* Acceptable Use */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">5. Acceptable Use</h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or its servers</li>
            <li>Use automated tools to scrape or collect data from the Service</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">6. Intellectual Property</h2>
          <p>
            All blog content, design, and code of the Service are the property of Tz Blog unless otherwise stated. You
            may not reproduce, distribute, or create derivative works without explicit permission.
          </p>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">7. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties of any
            kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or
            error-free.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Tz Blog shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        {/* Changes */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting
            to this page. Your continued use of the Service constitutes acceptance of the modified terms.
          </p>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-3 text-lg font-medium text-foreground">10. Contact</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{" "}
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
