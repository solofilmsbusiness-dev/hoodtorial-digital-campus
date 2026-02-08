import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { PageBackground } from "./PageBackground";

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  pageKey?: string;
}

export function PageLayout({ children, showFooter = true, pageKey }: PageLayoutProps) {
  const content = (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );

  if (pageKey) {
    return <PageBackground pageKey={pageKey}>{content}</PageBackground>;
  }

  return content;
}
