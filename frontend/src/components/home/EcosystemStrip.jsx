const LOGOS = [
  { src: '/images/logo-nvidia.png', alt: 'NVIDIA', w: 134 },
  { src: '/images/logo-amd.png', alt: 'AMD', w: 90 },
  { src: '/images/logo-dell.png', alt: 'Dell Technologies', w: 140 },
  { src: '/images/logo-hpe.png', alt: 'Hewlett Packard Enterprise', w: 118 },
  { src: '/images/logo-supermicro.png', alt: 'Supermicro', w: 98 },
  { src: '/images/logo-lenovo.png', alt: 'Lenovo', w: 96 },
  { src: '/images/logo-asus.png', alt: 'ASUS', w: 94 },
  { src: '/images/logo-nokia.png', alt: 'Nokia', w: 98 },
];

export default function EcosystemStrip() {
  return (
    <section className="bg-navy-900 pb-6 pt-1">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-11">
        <div className="flex flex-col gap-6 rounded-xl border-2 border-[#2f74ff] bg-[#000f29] px-6 py-5 shadow-glow lg:flex-row lg:items-center lg:gap-0 lg:px-10">
          <p className="shrink-0 text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-label lg:border-r lg:border-white/15 lg:pr-7 lg:text-left">
            Supported Technology
            <br className="hidden lg:block" /> Ecosystem
          </p>
          <ul className="grid flex-1 grid-cols-2 items-center justify-items-center gap-x-4 gap-y-5 sm:grid-cols-4 lg:flex lg:justify-between lg:pl-8">
            {LOGOS.map((l) => (
              <li key={l.alt}>
                <img src={l.src} alt={l.alt} style={{ width: l.w }} className="h-auto max-w-full" loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
