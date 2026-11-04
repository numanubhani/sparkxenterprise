import { ArrowRight, Clock, FileText, Receipt, Search, Truck } from 'lucide-react';

const STEPS = [
  { n: '01', icon: FileText, title: 'Tell Us What You Need', text: 'Share your requirements, quantities and destination country.' },
  { n: '02', icon: Search, title: 'KYB & Requirements Review', text: 'We review your company information, end use and export requirements.' },
  {
    n: '03',
    icon: Receipt,
    title: 'Quote & Procurement',
    text: "You'll receive a detailed quotation. 100% upfront payment is required before the order is placed.",
  },
  { n: '04', icon: Truck, title: 'Export & Delivery', text: 'We coordinate export documentation, shipping and delivery to your location.' },
];

export default function Process() {
  return (
    <section className="bg-[#001325]">
      <div className="container-site grid gap-10 py-12 xl:grid-cols-[1.15fr_3fr_1.2fr] xl:items-center xl:gap-8">
        <div>
          <p className="eyebrow text-brand-sky">The process</p>
          <h2 className="mt-3 font-serif text-[30px] font-medium leading-tight sm:text-[34px]">From Request to Global Delivery</h2>
          <p className="mt-3 text-sm text-slate-300">A clear and secure procurement process from initial inquiry to final delivery.</p>
        </div>

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 xl:border-l xl:border-white/15 xl:pl-8">
          {STEPS.map(({ n, icon: Icon, title, text }, i) => (
            <li key={n} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-brand-sky/60 bg-brand/20 text-xs font-semibold">{n}</span>
                <Icon className="h-7 w-7 text-brand-sky" strokeWidth={1.4} />
                {i < STEPS.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-slate-400 lg:block" />}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-snug text-slate-300">{text}</p>
            </li>
          ))}
        </ol>

        <div className="flex gap-4 xl:border-l xl:border-white/15 xl:pl-8">
          <Clock className="mt-6 h-10 w-10 shrink-0 text-brand-sky" strokeWidth={1.3} />
          <div>
            <p className="text-xs text-slate-300">Typical Planning Estimate</p>
            <p className="mt-1 whitespace-nowrap text-[30px] font-bold leading-none text-brand-bright 2xl:text-[34px]">8–12+ Weeks</p>
            <p className="mt-3 text-[13px] leading-snug text-slate-300">
              Lead times vary based on product, configuration, supplier and destination.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
