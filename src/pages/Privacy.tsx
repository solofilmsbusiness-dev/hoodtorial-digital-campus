import { PageLayout } from "@/components/layout/PageLayout";

export default function Privacy() {
  return (
    <PageLayout>
      <div className="container-wide max-w-3xl py-16 md:py-24">
        <h1 className="heading-1 text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground/70">Last updated: March 3, 2026</p>

          <h2 className="heading-3 text-foreground mt-10">1. Introduction</h2>
          <p>
            Welcome to Hoodtorial University ("we," "us," or "our"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>

          <h2 className="heading-3 text-foreground mt-10">2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-foreground">Account Information:</strong> Name, email address, display name, and profile details you provide when registering.</li>
            <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our platform, including courses accessed, quiz results, and progress data.</li>
            <li><strong className="text-foreground">Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
            <li><strong className="text-foreground">User-Generated Content:</strong> Posts, comments, images, and other content you share on our community features.</li>
          </ul>

          <h2 className="heading-3 text-foreground mt-10">3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our educational services.</li>
            <li>Personalize your learning experience and recommend courses.</li>
            <li>Communicate with you about updates, support, and promotions.</li>
            <li>Monitor platform usage and enforce our community guidelines.</li>
            <li>Protect against fraud, abuse, and unauthorized access.</li>
          </ul>

          <h2 className="heading-3 text-foreground mt-10">4. Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We may share data with trusted third-party service providers who assist us in operating our platform, subject to confidentiality agreements. We may also disclose information if required by law or to protect our legal rights.
          </p>

          <h2 className="heading-3 text-foreground mt-10">5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="heading-3 text-foreground mt-10">6. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access, correct, or delete your personal data.</li>
            <li>Withdraw consent for data processing.</li>
            <li>Request a copy of your data in a portable format.</li>
            <li>Object to or restrict certain processing activities.</li>
          </ul>

          <h2 className="heading-3 text-foreground mt-10">7. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can manage cookie settings through your browser.
          </p>

          <h2 className="heading-3 text-foreground mt-10">8. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we learn that we have collected data from a child, we will delete it promptly.
          </p>

          <h2 className="heading-3 text-foreground mt-10">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised "Last updated" date.
          </p>

          <h2 className="heading-3 text-foreground mt-10">10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or your personal data, please contact us through the support feature on our platform.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
