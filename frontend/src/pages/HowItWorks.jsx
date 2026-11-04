import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, FileText, Globe, Headphones, MapPin, Package, ShieldCheck, UserRound, Users } from 'lucide-react';
import PageHero from '../components/ui/PageHero.jsx';
import CtaSection from '../components/ui/CtaSection.jsx';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const STEPS = [
  {
    title: ['Submit', 'Your Request'],
    img: '/images/hiw-step1.jpg',
    text: 'Tell us what you need — GPU models, servers, networking, storage, quantities and your destination country. Our team can help with configuration recommendations.',
  },
  {
    title: ['KYB Verification'],
    img: '/images/hiw-step2.jpg',
    text: 'For high-technology equipment, we conduct a Know Your Business (KYB) verification, including company details, end-user information and the physical location where the equipment will be installed.',
  },
  {
    title: ['Quote & Payment'],
    img: '/images/hiw-step3.jpg',
    text: 'You will receive a detailed written quotation with pricing, estimated timeline, shipping terms and applicable conditions.',
    note: { strong: '100% upfront payment', text: 'is required before the order is placed with the supplier.' },
  },
  {
    title: ['Procurement &', 'Preparation'],
    img: '/images/hiw-step4.jpg',
    text: 'We place the order with the supplier. Depending on the product, this may include manufacturing, configuration, assembly, testing and packaging.',
  },
  {
    title: ['Export & Shipping'],
    img: '/images/hiw-step5.jpg',
    text: 'We coordinate export documentation, compliance checks, freight arrangements and international shipping. Additional licenses or approvals may be required depending on the product and destination.',
  },
  {
    title: ['Delivery'],
    img: '/images/hiw-step6.jpg',
    text: 'Your equipment is delivered to your specified location. We share tracking information where available and keep you updated throughout the process.',
  },
  {
    title: ['Ongoing Support'],
    img: '/images/hiw-step7.jpg',
    text: 'After delivery, we assist with order-related questions, supplier communication and warranty or service coordination based on the manufacturer’s terms and your location.',
  },
];

const KYB_ITEMS = [
  { icon: FileText, text: 'Company registration documents' },
  { icon: UserRound, text: 'End-user information' },
  { icon: Users, text: 'Intended use of the equipment' },
  { icon: MapPin, text: 'Physical location where the equipment will be installed' },
  { icon: ShieldCheck, text: 'Additional compliance information if required' },
];

const PHASES = [
  { range: '1–2 Weeks', title: 'Quote & payment', items: ['Requirement review', 'KYB verification', 'Quote preparation', 'Payment confirmation'] },
  { range: '2–6 Weeks', title: 'Manufacturing or supplier preparation', items: ['Order placement', 'Configuration / assembly', 'Testing and packaging', 'Supplier workload dependent'] },
  { range: '1–3 Weeks', title: 'International shipping and customs', items: ['Export documentation', 'Freight to destination', 'Customs clearance', 'Local delivery arrangements'] },
  { range: 'Varies', title: 'Delivery to your location', items: ['Delivery to specified address', 'Tracking and updates', 'Post-delivery support'] },
];

const SERVICES = [
  { icon: Globe, title: 'Global Sourcing', text: 'Access to leading manufacturers and established supply channels.' },
  { icon: Package, title: 'Export & Logistics Coordination', text: 'Complete support with export requirements and international shipping.' },
  { icon: FileText, title: 'Documentation Support', text: 'Commercial invoice, packing list and other required documents.' },
  { icon: Headphones, title: 'After-Sales Assistance', text: 'Support with warranty and service options based on the manufacturer’s terms and your location.' },
];

export default function HowItWorks() {
  useDocumentTitle('How It Works', 'How SPARK X Technology sources AI GPUs, servers and data center infrastructure — from request to global delivery.');
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Resources', to: '/resources/how-it-works' }, { label: 'How It Works' }]}
        eyebrow="How it works"
        title="From Sourcing to"
        highlight="Global Delivery"
        intro="We make it simple to source AI GPUs, servers and data center infrastructure from leading manufacturers and deliver them to your location anywhere in the world — with full compliance, secure transactions and end-to-end support."
        image="/images/hiw-hero.jpg"
        badges={[
          { icon: 'ShieldCheck', title: 'Trusted Supply Chain', text: 'Vetted supplier channels' },
          { icon: 'Globe', title: 'Global Delivery', text: 'Worldwide shipping' },
          { icon: 'BadgeCheck', title: 'Secure & Compliant', text: 'KYB, export control, documentation' },
        ]}
      />

      {/* Process */}
      <section className="bg-white text-navy-900">
        <div className="container-site py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-slate-500">The process</p>
              <h2 className="mt-2 font-serif text-[32px] font-medium leading-tight text-[#0b1f44] sm:text-[38px]">A Clear and Secure Procurement Process</h2>
              <p className="mt-2 text-[15px] text-slate-600">From initial request to final delivery, we manage the entire process so you can focus on your business.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs text-slate-600">7 steps</span>
              <button type="button" aria-label="Scroll steps left" onClick={() => scroll(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 hover:border-brand xl:hidden">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Scroll steps right" onClick={() => scroll(1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 hover:border-brand xl:hidden">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ol ref={scroller} className="mt-8 grid snap-x auto-cols-[230px] grid-flow-col gap-0 overflow-x-auto pb-3 [scrollbar-width:thin] xl:auto-cols-fr xl:overflow-visible">
            {STEPS.map((s, i) => (
              <li key={s.img} className={`relative snap-start px-3 ${i > 0 ? 'border-l border-slate-200' : ''}`}>
                <div className="flex min-h-[44px] items-center gap-3">
                  <span className="grid h-8 w-9 shrink-0 place-items-center rounded-md bg-brand/10 text-sm font-semibold text-brand">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[13px] font-semibold leading-tight">
                    {s.title.map((t) => (
                      <span key={t} className="block">
                        {t}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="relative mt-3">
                  <img src={s.img} alt="" className="h-[110px] w-full rounded object-cover" loading="lazy" />
                  {i < STEPS.length - 1 && <ChevronRight className="absolute -right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{s.text}</p>
                {s.note && (
                  <p className="mt-3 rounded bg-brand/10 p-2.5 text-xs leading-relaxed text-slate-700">
                    <span className="font-semibold text-brand">{s.note.strong}</span> {s.note.text}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* KYB band */}
      <section className="bg-white pb-4">
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-5">
          <div className="relative grid overflow-hidden rounded-lg bg-navy-900 lg:grid-cols-2">
            <img src="/images/hiw-globe.jpg" alt="" className="absolute inset-y-0 right-0 h-full w-[40%] object-cover opacity-90" loading="lazy" />
            <div className="absolute inset-y-0 right-[25%] w-[30%] bg-gradient-to-r from-navy-900 to-transparent" />
            <div className="relative flex gap-6 p-7 lg:border-r lg:border-white/10 lg:p-10">
              <ShieldCheck className="hidden h-16 w-16 shrink-0 text-brand sm:block" strokeWidth={1.2} />
              <div>
                <p className="eyebrow text-brand-sky">Compliance</p>
                <h2 className="mt-2 font-serif text-[30px] font-medium leading-tight">KYB Verification for High-Technology Equipment</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
                  Due to export control regulations and the sensitive nature of AI GPUs and related infrastructure, we conduct a Know Your Business (KYB)
                  verification before orders proceed. The information required depends on the product, destination and transaction.
                </p>
                <Link to="/resources/kyb-verification" className="btn-blue mt-6 h-10 px-5 text-sm">
                  Learn More About KYB <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative p-7 lg:p-10">
              <p className="eyebrow text-brand-sky">Typical KYB information includes:</p>
              <ul className="mt-5 space-y-4">
                {KYB_ITEMS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-4 text-sm text-slate-100">
                    <Icon className="h-5 w-5 shrink-0 text-brand-sky" strokeWidth={1.5} /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white text-navy-900">
        <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow text-slate-500">Timeline</p>
            <h2 className="mt-2 font-serif text-3xl font-medium text-[#0b1f44]">Typical Planning Estimate</h2>
            <p className="mt-1 font-serif text-[52px] font-semibold leading-none text-brand">8–12+ Weeks</p>
            <p className="mt-2 text-lg text-slate-700">for configured or build-to-order systems</p>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-600">
              Lead times vary depending on the product, supplier, configuration, availability and destination. Ready-to-ship products may be available
              sooner, while high-demand GPUs, custom configurations, export checks and international logistics can extend the timeline.
            </p>
            <p className="mt-2 text-[13px] text-slate-600">The exact lead time will be confirmed in your written quotation.</p>
            <Link to="/resources/lead-times-delivery" className="mt-5 inline-flex h-10 items-center gap-2 rounded border border-brand px-5 text-sm font-semibold text-brand hover:bg-brand hover:text-white">
              View Detailed Timeline <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            {PHASES.map((p, i) => (
              <li key={p.range + p.title} className="relative">
                <div className="flex items-center">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-brand ring-4 ring-brand/15" />
                  {i < PHASES.length - 1 && <span className="ml-1 hidden h-0.5 flex-1 bg-brand/60 xl:block" />}
                </div>
                <p className="mt-4 text-sm font-semibold uppercase text-brand">{p.range}</p>
                <p className="mt-0.5 text-sm font-semibold">{p.title}</p>
                <ul className="mt-4 space-y-1.5 text-[13px] text-slate-600">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-500" /> {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-slate-100 bg-white text-navy-900">
        <div className="container-site py-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-slate-500">Our services</p>
              <h2 className="mt-2 font-serif text-[32px] font-medium text-[#0b1f44] sm:text-[36px]">More Than Just Equipment</h2>
              <p className="mt-1 text-[15px] text-slate-600">We support you throughout the entire process — from sourcing to post-delivery.</p>
            </div>
            <Link to="/company/global-sourcing" className="link-blue">
              View All Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-md border border-slate-200 p-5 shadow-sm">
                <Icon className="h-8 w-8 shrink-0 text-brand" strokeWidth={1.4} />
                <div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
