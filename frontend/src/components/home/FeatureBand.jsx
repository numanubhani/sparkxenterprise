import { Cpu, Globe, Server, Settings } from 'lucide-react';

const FEATURES = [
  { icon: Cpu, title: 'AI GPU Systems', text: ['Latest generation GPUs', 'and accelerators.'] },
  { icon: Server, title: 'Server Infrastructure', text: ['Rack-scale and custom', 'configurations.'] },
  { icon: Globe, title: 'Global Sourcing', text: ['Worldwide delivery', 'and logistics support.'] },
  { icon: Settings, title: 'Enterprise Solutions', text: ['From single servers', 'to large-scale deployments.'] },
];

export default function FeatureBand() {
  return (
    <section className="border-t border-white/10 bg-navy-900">
      <div className="container-site grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className={`flex items-center gap-7 lg:px-8 ${i > 0 ? 'lg:border-l lg:border-white/15' : 'lg:pl-0'}`}>
            <Icon className="h-14 w-14 shrink-0 text-white" strokeWidth={1.1} />
            <div>
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {text[0]}
                <br />
                {text[1]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
