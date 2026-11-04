import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CtaSection({
  eyebrow = 'Ready to get started?',
  title = 'Request a Quote or Speak with Our Team',
  text = 'Tell us what equipment you need and where it should be delivered. Our team will provide a detailed quotation and guide you through the next steps.',
  showProducts = true,
}) {
  return (
    <section className="relative overflow-hidden bg-[#020611]">
      <div className="absolute inset-y-0 right-0 hidden w-[45%] md:block">
        <img src="/images/hiw-cta.jpg" alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020611] via-[#020611]/50 to-transparent" />
      </div>
      <div className="container-site relative py-14">
        <p className="eyebrow text-brand-sky">{eyebrow}</p>
        <h2 className="mt-3 max-w-2xl font-serif text-[32px] font-medium leading-tight sm:text-[38px]">{title}</h2>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">{text}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/quote" className="btn-blue h-12 px-7 text-[15px]">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/company/contact" className="btn-outline h-12 px-7 text-[15px]">
            Ask a Question
          </Link>
          {showProducts && (
            <Link to="/products" className="inline-flex h-12 items-center gap-2 px-2 text-[15px] font-semibold text-brand-sky hover:text-white">
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
