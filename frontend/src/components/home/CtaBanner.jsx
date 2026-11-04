import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-[#01010c]">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[52%]">
        <img src="/images/cta-bg.jpg" alt="" className="h-full w-full object-cover object-right" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#01010c] via-[#01010c]/60 to-transparent" />
        <div className="absolute inset-0 bg-[#01010c]/60 lg:hidden" />
      </div>
      <div className="container-site relative flex flex-col gap-6 py-12 lg:flex-row lg:items-center lg:gap-10">
        <div className="lg:max-w-md">
          <h2 className="text-[26px] font-bold leading-tight">Ready to Source Your AI Infrastructure?</h2>
          <p className="mt-2 text-sm text-slate-300">
            Tell us what you need and where it needs to go. Our team will review your requirements and provide a tailored quotation.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/quote" className="btn-blue h-11 px-6 text-sm">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/company/contact" className="btn-outline h-11 px-6 text-sm">
            Contact Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
