// Navigation structure from the "Main Navigation Menus" spec.
export const NAV = [
  {
    label: 'Products',
    to: '/products',
    items: [
      { label: 'GPUs / Accelerators', to: '/products?category=gpus', desc: 'Latest generation accelerators for AI and HPC.' },
      { label: 'AI Server Systems', to: '/products?category=servers', desc: 'High-performance servers for training and inference.' },
      { label: 'Networking & Switches', to: '/products?category=networking', desc: 'High-speed, low-latency networking.' },
      { label: 'Storage', to: '/products?category=storage', desc: 'Data center storage for AI workloads.' },
      { label: 'Cooling & Power', to: '/products?category=cooling', desc: 'Power and thermal infrastructure.' },
      { label: 'Components & Accessories', to: '/products?category=components', desc: 'Cables, transceivers and more.' },
    ],
  },
  {
    label: 'Solutions',
    to: '/solutions/ai-machine-learning',
    items: [
      { label: 'AI & Machine Learning', to: '/solutions/ai-machine-learning', desc: 'GPU infrastructure for training and inference.' },
      { label: 'High-Performance Computing', to: '/solutions/hpc', desc: 'Systems and accelerators for complex workloads.' },
      { label: 'Enterprise GPU Servers', to: '/solutions/gpu-servers', desc: 'Server categories and configuration options.' },
      { label: 'Data Center Infrastructure', to: '/solutions/data-center', desc: 'Servers, storage, power and cooling.' },
      { label: 'Networking & Storage', to: '/solutions/networking-storage', desc: 'Switching, storage and connectivity.' },
      { label: 'Custom Hardware Sourcing', to: '/solutions/custom-sourcing', desc: 'Specialized or large-quantity requests.' },
    ],
  },
  {
    label: 'Company',
    to: '/company/about',
    items: [
      { label: 'About SPARK X', to: '/company/about', desc: 'Who we are and how we work.' },
      { label: 'Global Sourcing & Trade', to: '/company/global-sourcing', desc: 'Sourcing, procurement and delivery coordination.' },
      { label: 'Compliance & KYB', to: '/company/compliance-kyb', desc: 'Verification for high-technology equipment.' },
      { label: 'Contact Us', to: '/company/contact', desc: 'Email, inquiry form and call options.' },
    ],
  },
  {
    label: 'Resources',
    to: '/resources/how-it-works',
    items: [
      { label: 'How It Works', to: '/resources/how-it-works', desc: 'From inquiry to delivery and support.' },
      { label: 'How to Order AI Hardware', to: '/resources/how-to-order', desc: 'Step-by-step ordering guide.' },
      { label: 'Lead Times & Delivery', to: '/resources/lead-times-delivery', desc: 'What affects your timeline.' },
      { label: 'Export & Import Requirements', to: '/resources/export-import', desc: 'Documentation and customs overview.' },
      { label: 'KYB Verification Process', to: '/resources/kyb-verification', desc: 'What information may be required.' },
      { label: 'FAQ', to: '/resources/faq', desc: 'Answers to common questions.' },
    ],
  },
];

export const FOOTER_COLS = [
  {
    title: 'Products',
    links: [
      { label: 'GPUs', to: '/products?category=gpus' },
      { label: 'Servers', to: '/products?category=servers' },
      { label: 'Networking', to: '/products?category=networking' },
      { label: 'Infrastructure', to: '/solutions/data-center' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'AI & Machine Learning', to: '/solutions/ai-machine-learning' },
      { label: 'High-Performance Computing', to: '/solutions/hpc' },
      { label: 'Enterprise Data Centers', to: '/solutions/data-center' },
      { label: 'Custom Sourcing', to: '/solutions/custom-sourcing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About SPARK X', to: '/company/about' },
      { label: 'Global Sourcing & Trade', to: '/company/global-sourcing' },
      { label: 'Compliance & KYB', to: '/company/compliance-kyb' },
      { label: 'Contact Us', to: '/company/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'How It Works', to: '/resources/how-it-works' },
      { label: 'Lead Times & Delivery', to: '/resources/lead-times-delivery' },
      { label: 'Export & Import Requirements', to: '/resources/export-import' },
      { label: 'FAQ', to: '/resources/faq' },
    ],
  },
];
