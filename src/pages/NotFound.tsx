import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <Helmet>
        <title>Page Not Found | Hoodtorial University</title>
        <meta name="description" content="The page you are looking for could not be found. Return to Hoodtorial University." />
        <meta property="og:title" content="Page Not Found | Hoodtorial University" />
        <meta property="og:description" content="The page you are looking for could not be found. Return to Hoodtorial University." />
        <meta property="og:image" content="https://hoodtorialuniversity.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="text-amber-400 text-8xl font-bold mb-4">404</div>
      <h1 className="text-white text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-amber-400 text-black font-bold px-8 py-3 rounded-lg hover:bg-amber-300 transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
