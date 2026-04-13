import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
      <div className="text-amber-400 text-8xl font-bold mb-4">404</div>
      <h1 className="text-white text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-amber-400 text-black font-bold px-8 py-3 rounded-lg hover:bg-amber-300 transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
