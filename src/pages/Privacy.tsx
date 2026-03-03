import { PageLayout } from "@/components/layout/PageLayout";

export default function Privacy() {
  return (
    <PageLayout>
      <div className="container-wide max-w-3xl py-16 md:py-24">
        <h1 className="heading-1 text-foreground mb-4">Hoodtorial University Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>
            We respect your privacy. This policy describes how Hoodtorial University ("we") collects and uses information when you use our creator tools and TikTok integration.
          </p>

          <h2 className="heading-3 text-foreground mt-10">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>OAuth credentials provided by TikTok to upload your videos.</li>
            <li>Video files and related metadata you choose to upload.</li>
            <li>Basic analytics (upload timestamps, error logs) to maintain the service.</li>
          </ul>

          <h2 className="heading-3 text-foreground mt-10">2. How We Use Data</h2>
          <p>
            We use OAuth tokens solely to authenticate uploads you initiate. Video files are stored temporarily on secure systems for processing and are deleted after delivery or when requested.
          </p>

          <h2 className="heading-3 text-foreground mt-10">3. Sharing</h2>
          <p>
            We do not sell or share your data with third parties. Access is limited to the Hoodtorial University team responsible for distributing your content.
          </p>

          <h2 className="heading-3 text-foreground mt-10">4. Security</h2>
          <p>
            Credentials and files are stored on encrypted systems. Access is restricted to authenticated devices controlled by Hoodtorial University.
          </p>

          <h2 className="heading-3 text-foreground mt-10">5. Data Retention</h2>
          <p>
            We keep OAuth tokens and analytics while your integration is active. You can disconnect at any time, which revokes our access. Video files are removed once uploads are complete.
          </p>

          <h2 className="heading-3 text-foreground mt-10">6. Your Rights</h2>
          <p>
            You may request deletion or export of your data by emailing{" "}
            <a href="mailto:privacy@hoodtorialuniversity.com" className="text-primary hover:underline">
              privacy@hoodtorialuniversity.com
            </a>.
          </p>

          <h2 className="heading-3 text-foreground mt-10">7. Updates</h2>
          <p>
            We may update this policy and will post changes on this page.
          </p>

          <h2 className="heading-3 text-foreground mt-10">8. Contact</h2>
          <p>
            If you have questions regarding this Privacy Policy, contact{" "}
            <a href="mailto:privacy@hoodtorialuniversity.com" className="text-primary hover:underline">
              privacy@hoodtorialuniversity.com
            </a>.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
