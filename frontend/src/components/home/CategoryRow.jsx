import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    img: '/images/cat-gpus.png',
    imgW: 140,
    title: 'GPUs',
    text: ['Latest generation accelerators', 'for AI and HPC workloads.'],
    cta: 'Explore GPUs',
    to: '/products?category=gpus',
  },
  {
    img: '/images/cat-servers.png',
    imgW: 116,
    title: 'AI Servers',
    text: ['High-performance servers', 'for AI training and inference.'],
    cta: 'Explore Servers',
    to: '/products?category=servers',
  },
  {
    img: '/images/cat-networking.png',
    imgW: 144,
    title: 'Networking',
    text: ['High-speed, low-latency', 'networking solutions.'],
    cta: 'Explore Networking',
    to: '/products?category=networking',
  },
  {
    img: '/images/cat-datacenter.png',
    imgW: 102,
    title: 'Data Center Infrastructure',
    text: ['Complete infrastructure', 'for modern AI data centers.'],
    cta: 'Explore Infrastructure',
    to: '/solutions/data-center',
  },
];

export default function CategoryRow() {
  return (
    <section className="bg-light text-navy-900">
      <div className="container-site grid gap-8 py-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.title}
            to={c.to}
            className={`group flex items-center gap-4 py-2 xl:px-5 ${i > 0 ? 'xl:border-l xl:border-slate-200' : 'xl:pl-0'}`}
          >
            <div className="flex h-[118px] w-[130px] shrink-0 items-center justify-center">
              <img src={c.img} alt={c.title} style={{ maxWidth: c.imgW }} className="w-full transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold">{c.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.45] text-slate-500">{c.text.join(' ')}</p>
              <span className="link-blue mt-3 whitespace-nowrap text-[13px]">
                {c.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
