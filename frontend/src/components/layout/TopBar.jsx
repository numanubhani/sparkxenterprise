import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, X } from 'lucide-react';

export default function TopBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="relative bg-brand-bar text-white">
      <div className="container-site flex min-h-[41px] items-center justify-center gap-3 py-2 pr-10 text-center text-[13px]">
        <Truck className="hidden h-[18px] w-[18px] shrink-0 sm:block" strokeWidth={1.6} />
        <span>Global supply of AI GPUs, servers, and infrastructure. Worldwide delivery.</span>
        <Link to="/resources/how-it-works" className="hidden shrink-0 items-center gap-1.5 pl-3 font-medium hover:underline sm:inline-flex">
          Learn More <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => setOpen(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-white/15 lg:right-12"
      >
        <X className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
