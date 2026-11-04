import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="container-site flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="eyebrow text-brand-sky">404</p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-xl text-slate-300">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link to="/" className="btn-white h-12 px-6 text-sm">
          Back to Home
        </Link>
        <Link to="/products" className="btn-outline h-12 px-6 text-sm">
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
