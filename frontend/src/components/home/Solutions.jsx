import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Layers, ShieldCheck } from 'lucide-react';

const SOLUTIONS = [
  {
    img: '/images/sol-ai.jpg',
    icon: ShieldCheck,
    title: 'AI & Machine Learning',
    text: 'GPUs and infrastructure for training, inference, and AI-driven applications.',
    to: '/solutions/ai-machine-learning',
  },
  {
    img: '/images/sol-hpc.jpg',
    icon: Layers,
    title: 'High-Performance Computing',
    text: 'Scalable solutions for complex workloads and research.',
    to: '/solutions/hpc',
  },
  {
    img: '/images/sol-datacenter.jpg',
    icon: Building2,
    title: 'Enterprise Data Centers',
    text: 'Servers, storage, networking and complete infrastructure solutions.',
    to: '/solutions/data-center',
  },
];

export default function Solutions() {
  return (
    <section className="bg-[#f7f9fd] text-navy-900">
      <div className="container-site grid gap-10 py-14 lg:grid-cols-[1fr_2.25fr] lg:items-center lg:gap-12">
        <div>
          <p className="eyebrow text-slate-500">Solutions for your business</p>
          <h2 className="mt-4 font-serif text-[32px] font-medium leading-[1.12] text-[#0b1f44] sm:text-[38px]">
            Infrastructure Built Around Your Requirements
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
            We help you source and configure the right hardware for your specific use case — from AI training and inference to
            high-performance computing and enterprise data centers.
          </p>
          <Link to="/solutions/ai-machine-learning" className="link-blue mt-5">
            Explore All Solutions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {SOLUTIONS.map(({ img, icon: Icon, title, text, to }) => (
            <Link
              key={title}
              to={to}
              className="group overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="overflow-hidden">
                <img src={img} alt="" className="h-[84px] w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="flex gap-4 p-5">
                <Icon className="mt-0.5 h-8 w-8 shrink-0 text-brand" strokeWidth={1.5} />
                <div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{text}</p>
                  <span className="link-blue mt-4 text-[13px]">
                    Learn More <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
