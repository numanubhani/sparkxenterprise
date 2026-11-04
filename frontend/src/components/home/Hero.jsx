import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Globe2, Server } from 'lucide-react';

const FEATURE_POINTS = [
  { icon: Cpu, text: 'Highest AI performance' },
  { icon: Server, text: 'Optimized for large-scale deployments' },
  { icon: Globe2, text: 'Available for global delivery' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-850">
      {/* Background visual (right side) */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[58%]">
        <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover object-left" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-850 via-navy-850/30 to-transparent lg:via-transparent" />
        <div className="absolute inset-y-0 left-0 hidden w-48 bg-gradient-to-r from-navy-850 to-transparent lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-850 to-transparent" />
        <div className="absolute inset-0 bg-navy-850/70 lg:hidden" />
      </div>

      <div className="container-site relative pb-4 pt-10 lg:pt-10">
        <p className="eyebrow text-slate-200">Global sourcing for a higher compute tomorrow</p>

        <h1 className="mt-5 text-[42px] font-bold leading-[1.04] tracking-[-0.01em] sm:text-[56px] lg:text-[62px]">
          Enterprise
          <br />
          AI Infrastructure.
          <br />
          <span className="bg-gradient-to-r from-[#6cc0f7] to-[#3a8ef0] bg-clip-text text-transparent">Delivered Worldwide.</span>
        </h1>

        <p className="mt-6 max-w-[470px] text-lg leading-[1.55] text-slate-200 sm:text-[19px]">
          GPUs, servers, and complete infrastructure solutions for AI, HPC, and data center deployments.
        </p>

        <div className="mt-7 flex flex-wrap gap-5">
          <Link to="/quote" className="btn-white h-12 min-w-[246px] px-6 text-[15px]">
            Request a Quote <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/products" className="btn-outline h-12 min-w-[198px] px-6 text-[15px]">
            Explore Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Featured product card */}
        <div className="mt-6 max-w-[1060px] rounded-xl border border-[#2a5bd7]/60 bg-navy-900/95 shadow-[0_0_30px_rgba(0,60,200,0.25)] backdrop-blur-sm">
          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-0 md:py-4 md:pl-4 md:pr-5">
            <div className="flex min-w-0 items-center gap-5 md:pr-6">
              <img
                src="/images/featured-b300.png"
                alt="NVIDIA Blackwell B300 GPU"
                className="w-[140px] shrink-0 sm:w-[170px]"
                style={{ maskImage: 'radial-gradient(ellipse 72% 70% at 50% 50%, #000 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 72% 70% at 50% 50%, #000 60%, transparent 100%)' }}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-label">Featured Product</p>
                <h2 className="mt-1.5 whitespace-nowrap text-[19px] font-bold sm:text-[21px]">NVIDIA Blackwell B300</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
                  Next-generation GPU for AI and accelerated computing.
                </p>
              </div>
            </div>

            <ul className="space-y-2 border-white/15 md:shrink-0 md:border-l md:px-6">
              {FEATURE_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-200 lg:whitespace-nowrap">
                  <Icon className="h-4 w-4 shrink-0 text-brand-sky" />
                  {text}
                </li>
              ))}
            </ul>

            <div className="border-white/15 md:ml-auto md:shrink-0 md:border-l md:pl-6">
              <Link to="/products/nvidia-blackwell-b300" className="btn-blue h-[54px] w-full whitespace-nowrap px-8 text-base md:w-auto">
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
