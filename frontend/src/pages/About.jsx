import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Eye, Lightbulb, Mail, MessageSquare, Receipt, Rocket, ShieldCheck } from 'lucide-react';
import PageHero from '../components/ui/PageHero.jsx';
import CtaSection from '../components/ui/CtaSection.jsx';
import { PUBLIC_EMAIL } from '../lib/site.js';
import { useDocumentTitle } from '../lib/useDocumentTitle.js';

const PORTFOLIO = [
  {
    name: 'SPARK FLOW',
    text: 'A technology venture focused on digital products and innovative solutions.',
    href: 'https://spark-flow.io/',
    label: 'Visit spark-flow.io',
    accent: 'from-[#1b3c8f] to-[#0b1f44]',
  },
  {
    name: 'SPARK SMS',
    text: 'A digital communications venture providing online SMS-related services.',
    href: 'https://www.sparksms.io/',
    label: 'Visit sparksms.io',
    accent: 'from-[#4a2a9b] to-[#0b1f44]',
  },
  {
    name: 'SPARK X TECHNOLOGY',
    text: 'Our AI infrastructure initiative, focused on sourcing advanced AI GPUs, high-performance servers and enterprise computing infrastructure for businesses around the world.',
    to: '/products',
    label: 'Explore AI hardware',
    accent: 'from-brand to-[#0b1f44]',
  },
];

const COMMITMENTS = [
  { icon: Receipt, title: 'Transparent quotations', text: 'Written quotes with pricing, estimated timelines and terms — no hidden steps.' },
  { icon: ShieldCheck, title: 'Compliance checks', text: 'KYB verification and export-control screening for high-technology equipment.' },
  { icon: MessageSquare, title: 'Clear communication', text: 'Updates from request to delivery, and help after the equipment arrives.' },
];

export default function About() {
  useDocumentTitle('About SPARK X', 'SPARK is a technology-driven group building digital ventures, including SPARK X Technology — AI infrastructure sourcing.');

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Company', to: '/company/about' }, { label: 'About SPARK X' }]}
        eyebrow="About SPARK"
        title="Built on Technology."
        highlight="Driven by Ideas."
        intro="SPARK is a technology-driven group focused on building, developing and growing innovative digital businesses."
        image="/images/hero-gpu.jpg"
      />

      <section className="bg-white text-navy-900">
        <div className="container-site grid gap-10 py-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-slate-500">Our story</p>
            <h2 className="mt-2 font-serif text-[34px] font-medium leading-tight text-[#0b1f44]">Technology is a way to solve problems</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              We believe technology is more than a tool — it is a way to solve problems, unlock new opportunities, and build products that make a meaningful
              difference.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              Our portfolio brings together ventures across different areas of technology, united by a shared entrepreneurial mindset, a passion for innovation,
              and a commitment to continuous improvement. We are always exploring new ideas, emerging technologies, and opportunities to turn ambitious concepts
              into practical solutions.
            </p>
          </div>
          <div className="rounded-xl bg-navy-900 p-8 text-white">
            <p className="eyebrow text-brand-sky">SPARK X Technology</p>
            <h3 className="mt-2 text-2xl font-semibold">What we do</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
              SPARK X Technology focuses on AI infrastructure — GPUs, servers, networking and related data center technology. We work as a sourcing and
              procurement partner: we identify supply options for your requirements, prepare quotations, coordinate procurement with suppliers, and manage
              documentation and international delivery.
            </p>
            <ul className="mt-6 space-y-4">
              {COMMITMENTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-sky" strokeWidth={1.5} />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-slate-300">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-light-50 text-navy-900">
        <div className="container-site py-14">
          <p className="eyebrow text-slate-500">Our portfolio</p>
          <h2 className="mt-2 font-serif text-[34px] font-medium text-[#0b1f44]">A group of ventures</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {PORTFOLIO.map((p) => {
              const inner = (
                <>
                  <div className={`flex h-36 items-end rounded-t-xl bg-gradient-to-br ${p.accent} p-6`}>
                    {p.to ? (
                      <img src="/images/logo.png" alt="SPARK X Technology" className="h-10 w-auto" />
                    ) : (
                      <span className="text-2xl font-bold tracking-wide text-white">{p.name}</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{p.text}</p>
                    <span className="link-blue mt-5">
                      {p.label} {p.href ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </span>
                  </div>
                </>
              );
              const cls = 'flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg';
              return p.href ? (
                <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {inner}
                </a>
              ) : (
                <Link key={p.name} to={p.to} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white text-navy-900">
        <div className="container-site grid gap-6 py-14 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-8">
            <Lightbulb className="h-8 w-8 text-brand" strokeWidth={1.4} />
            <h2 className="mt-4 font-serif text-2xl font-medium text-[#0b1f44]">Our Philosophy</h2>
            <p className="mt-2 text-lg font-semibold">Think boldly. Build intelligently. Keep moving forward.</p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              We are passionate about technology, curious about what comes next, and motivated by the challenge of building useful products in rapidly evolving
              markets. Great businesses begin with ideas — and grow through execution, adaptability, and a willingness to explore new possibilities.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-8">
            <Eye className="h-8 w-8 text-brand" strokeWidth={1.4} />
            <h2 className="mt-4 font-serif text-2xl font-medium text-[#0b1f44]">Looking Ahead</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Our ambition is to continue expanding our portfolio, exploring emerging technology sectors, and building businesses that create value for customers
              and partners. We see AI, computing infrastructure, automation, and digital platforms as important parts of the next generation of technology-driven
              businesses.
            </p>
          </div>
        </div>
        <div className="container-site pb-14">
          <div className="flex flex-col items-start justify-between gap-5 rounded-xl bg-light p-7 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Rocket className="h-8 w-8 shrink-0 text-brand" strokeWidth={1.4} />
              <p className="font-serif text-xl text-[#0b1f44]">SPARK — A group of ventures. One entrepreneurial mindset. A future built through technology.</p>
            </div>
            <a href={`mailto:${PUBLIC_EMAIL}`} className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand hover:underline">
              <Mail className="h-4 w-4" /> {PUBLIC_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
