// Content for template-driven pages (Solutions, Company, Resources).
// Wording follows the spec: no claims of inventory ownership, guaranteed availability,
// authorized-reseller status or guaranteed export approval.

const AVAILABILITY_NOTE = {
  type: 'note',
  title: 'Availability is confirmed per request',
  text: 'Configurations shown here are examples of what can be sourced. Specific models, quantities and lead times are confirmed with suppliers and stated in your written quotation.',
};

export const PAGES = {
  /* ------------------------------ SOLUTIONS ------------------------------ */
  '/solutions/ai-machine-learning': {
    crumb: 'AI & Machine Learning',
    metaTitle: 'AI & Machine Learning Infrastructure',
    description: 'Sourcing GPU infrastructure for AI training, inference and machine learning workloads.',
    hero: {
      eyebrow: 'Solutions',
      title: 'AI & Machine Learning',
      highlight: 'Infrastructure',
      intro: 'Source the GPU accelerators, AI servers and networking you need for model training, fine-tuning and production inference — configured around your workload.',
      image: '/images/hero-gpu.jpg',
    },
    sections: [
      {
        type: 'split',
        eyebrow: 'Your use case',
        title: 'Compute for every stage of the AI lifecycle',
        body: [
          'Training large models requires dense GPU clusters with high-bandwidth memory and fast interconnects. Inference at scale prioritizes throughput, latency and efficiency. Many teams need both.',
          'We help you translate your workload into a hardware specification, identify supply options from manufacturers and supply channels, and coordinate procurement and delivery to your data center.',
        ],
        bulletsTitle: 'Typical requirements we source for',
        bullets: ['LLM pre-training and fine-tuning clusters', 'High-throughput inference servers', 'Computer vision and multimodal workloads', 'Research and development environments', 'Expansion of existing GPU clusters'],
      },
      {
        type: 'cards',
        eyebrow: 'Equipment categories',
        title: 'What we can source',
        items: [
          { icon: 'Cpu', title: 'GPU Accelerators', text: 'NVIDIA Blackwell, Hopper, Ampere and Ada-generation GPUs in PCIe and SXM form factors.', to: '/products?category=gpus', cta: 'Browse GPUs' },
          { icon: 'Server', title: 'AI Server Systems', text: '4- and 8-GPU servers and integrated AI systems from major OEMs.', to: '/products?category=servers', cta: 'Browse Servers' },
          { icon: 'Network', title: 'Cluster Networking', text: 'InfiniBand and high-speed Ethernet switches, NICs, cables and transceivers.', to: '/products?category=networking', cta: 'Browse Networking' },
          { icon: 'Database', title: 'Storage', text: 'High-performance NVMe and all-flash storage for datasets and checkpoints.', to: '/products?category=storage', cta: 'Browse Storage' },
        ],
      },
      {
        type: 'cards',
        eyebrow: 'Configuration considerations',
        title: 'What to decide before you request a quote',
        items: [
          { icon: 'Gauge', title: 'Workload profile', text: 'Training vs. inference, model size, precision and target throughput drive GPU choice and count.' },
          { icon: 'Layers', title: 'Memory & interconnect', text: 'HBM capacity per GPU and NVLink / InfiniBand topology determine how models scale across nodes.' },
          { icon: 'Thermometer', title: 'Power & cooling', text: 'High-density GPU systems may require liquid cooling and significant rack power — check site capacity early.' },
          { icon: 'Globe2', title: 'Destination & compliance', text: 'Export controls on advanced GPUs depend on product and destination and can affect timelines.' },
          { icon: 'Server', title: 'Form factor', text: 'PCIe cards for flexibility, SXM / HGX platforms for maximum performance per node.' },
          { icon: 'CalendarClock', title: 'Timeline', text: 'Configured systems typically take 8–12+ weeks; ready-to-ship items may be faster.' },
        ],
      },
      AVAILABILITY_NOTE,
    ],
  },

  '/solutions/hpc': {
    crumb: 'High-Performance Computing',
    metaTitle: 'High-Performance Computing (HPC)',
    description: 'Sourcing HPC systems, accelerators and related infrastructure.',
    hero: {
      eyebrow: 'Solutions',
      title: 'High-Performance',
      highlight: 'Computing',
      intro: 'Accelerated compute, high-speed fabrics and storage for simulation, scientific research, engineering and data-intensive workloads.',
      image: '/images/hiw-step7.jpg',
    },
    sections: [
      {
        type: 'split',
        eyebrow: 'Your use case',
        title: 'Scalable systems for complex workloads',
        body: [
          'HPC environments combine GPU or CPU compute nodes, low-latency interconnects and parallel storage. Getting the balance right matters as much as the individual components.',
          'We help research institutions, engineering teams and enterprises source compute nodes, accelerators and fabric components that fit their architecture and budget.',
        ],
        bulletsTitle: 'Common HPC workloads',
        bullets: ['Computational fluid dynamics and simulation', 'Genomics and life-science research', 'Weather, climate and energy modelling', 'Financial risk and quantitative analysis', 'Rendering and media processing'],
      },
      {
        type: 'cards',
        eyebrow: 'Equipment categories',
        title: 'HPC infrastructure we source',
        items: [
          { icon: 'Cpu', title: 'Accelerators', text: 'Data center GPUs for double-precision and AI-accelerated HPC.', to: '/products?category=gpus', cta: 'Browse GPUs' },
          { icon: 'ServerCog', title: 'Compute Nodes', text: 'Dense GPU and CPU servers in rack and multi-node chassis.', to: '/products?category=servers', cta: 'Browse Servers' },
          { icon: 'Network', title: 'Low-Latency Fabric', text: 'InfiniBand switches, adapters and cabling for tightly coupled jobs.', to: '/products?category=networking', cta: 'Browse Networking' },
          { icon: 'HardDrive', title: 'Parallel Storage', text: 'High-throughput storage for scratch and project data.', to: '/products?category=storage', cta: 'Browse Storage' },
        ],
      },
      {
        type: 'cards',
        eyebrow: 'Configuration considerations',
        title: 'Planning an HPC deployment',
        items: [
          { icon: 'Gauge', title: 'Precision requirements', text: 'FP64-heavy simulations and AI-assisted workflows favour different accelerators.' },
          { icon: 'Network', title: 'Fabric topology', text: 'Node count and communication patterns determine switch radix and cabling.' },
          { icon: 'Thermometer', title: 'Facility readiness', text: 'Rack density, power distribution and cooling capacity at your site.' },
        ],
      },
      AVAILABILITY_NOTE,
    ],
  },

  '/solutions/gpu-servers': {
    crumb: 'Enterprise GPU Servers',
    metaTitle: 'Enterprise GPU Servers',
    description: 'GPU server categories, configuration considerations and sourcing options.',
    hero: {
      eyebrow: 'Solutions',
      title: 'Enterprise',
      highlight: 'GPU Servers',
      intro: 'From single inference servers to rack-scale 8-GPU systems — we help you choose and source the right platform from leading OEMs.',
      image: '/images/hiw-step4.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'Server categories',
        title: 'GPU server platforms',
        items: [
          { icon: 'Server', title: '8-GPU HGX / SXM Systems', text: 'Maximum performance per node for large-scale training, with NVLink-connected GPUs.', to: '/products?category=servers' },
          { icon: 'ServerCog', title: '4-GPU PCIe Servers', text: 'Flexible platforms for inference, fine-tuning and mixed workloads.', to: '/products?category=servers' },
          { icon: 'Boxes', title: 'Integrated AI Systems', text: 'Turnkey systems such as NVIDIA DGX with validated hardware and software stacks.', to: '/products/nvidia-dgx-b300' },
          { icon: 'Zap', title: 'Edge & Compact Servers', text: 'Short-depth and lower-power GPU servers for edge and branch deployments.', to: '/solutions/custom-sourcing', cta: 'Request sourcing' },
          { icon: 'Thermometer', title: 'Liquid-Cooled Servers', text: 'Direct-to-chip liquid cooling for the highest-density GPU configurations.', to: '/products?category=servers' },
          { icon: 'Building2', title: 'Rack-Scale Builds', text: 'Fully configured racks with servers, networking and power — planned to your layout.', to: '/solutions/data-center' },
        ],
      },
      {
        type: 'split',
        eyebrow: 'Configuration considerations',
        title: 'Building the right server specification',
        body: [
          'Beyond the GPU model, a server configuration includes CPUs, system memory, local NVMe storage, network adapters, power supplies and cooling. Each choice affects performance, cost and lead time.',
          'Share your workload and constraints and our team will help assemble a configuration request that suppliers can quote accurately.',
        ],
        bulletsTitle: 'Information that helps us quote',
        bullets: ['GPU model and quantity per server', 'Number of servers / nodes', 'Preferred OEM (if any)', 'CPU, RAM and storage requirements', 'Network adapters (InfiniBand / Ethernet)', 'Rack power and cooling limits'],
      },
      AVAILABILITY_NOTE,
    ],
  },

  '/solutions/data-center': {
    crumb: 'Data Center Infrastructure',
    metaTitle: 'Data Center Infrastructure',
    description: 'Servers, storage, networking, power and cooling for modern data centers.',
    hero: {
      eyebrow: 'Solutions',
      title: 'Data Center',
      highlight: 'Infrastructure',
      intro: 'Complete infrastructure for modern AI and enterprise data centers — servers, storage, networking, power and cooling, sourced and coordinated in one request.',
      image: '/images/hiw-hero.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'Equipment categories',
        title: 'Everything inside the rack — and around it',
        items: [
          { icon: 'Server', title: 'Compute', text: 'GPU and general-purpose servers from major manufacturers.', to: '/products?category=servers' },
          { icon: 'Database', title: 'Storage', text: 'All-flash arrays, NVMe drives and scale-out storage.', to: '/products?category=storage' },
          { icon: 'Network', title: 'Networking', text: 'Spine/leaf Ethernet, InfiniBand, NICs and optics.', to: '/products?category=networking' },
          { icon: 'Zap', title: 'Power', text: 'Rack PDUs and power distribution for high-density racks.', to: '/products?category=cooling' },
          { icon: 'Fan', title: 'Cooling', text: 'Air and liquid cooling components, including rear-door and direct-to-chip options.', to: '/products?category=cooling' },
          { icon: 'Cable', title: 'Cabling & Accessories', text: 'DAC/AOC cables, transceivers, rails and rack accessories.', to: '/products?category=components' },
        ],
      },
      {
        type: 'split',
        eyebrow: 'Configuration considerations',
        title: 'Plan the facility with the hardware',
        body: [
          'AI-era racks can draw many times the power of traditional enterprise racks. Power delivery, cooling method, floor loading and network cabling should be planned alongside the server order.',
          'We coordinate multi-category orders so components arrive with consistent documentation and shipping arrangements.',
        ],
        bulletsTitle: 'Before requesting a quote',
        bullets: ['Available power per rack (kW)', 'Cooling method: air, rear-door or liquid', 'Rack count and layout', 'Network architecture and port counts', 'Delivery site access and timing'],
      },
      AVAILABILITY_NOTE,
    ],
  },

  '/solutions/networking-storage': {
    crumb: 'Networking & Storage',
    metaTitle: 'Networking & Storage',
    description: 'Networking, switching, storage and connectivity equipment for AI and enterprise.',
    hero: {
      eyebrow: 'Solutions',
      title: 'Networking',
      highlight: '& Storage',
      intro: 'High-speed, low-latency fabrics and high-performance storage that keep GPUs fed with data.',
      image: '/images/catalog-hero.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'Networking',
        title: 'Switching and connectivity',
        items: [
          { icon: 'Network', title: 'InfiniBand Switches', text: 'NDR / XDR-class switches for AI and HPC cluster fabrics.', to: '/products/nvidia-quantum-2' },
          { icon: 'Globe2', title: 'Ethernet Switches', text: '100–400GbE+ spine and leaf switching for AI and enterprise networks.', to: '/products/data-center-switch' },
          { icon: 'Cpu', title: 'Network Adapters', text: 'High-speed NICs and DPUs for GPU servers.', to: '/solutions/custom-sourcing', cta: 'Request sourcing' },
          { icon: 'Cable', title: 'Cables & Optics', text: 'DAC, AOC and optical transceivers in the lengths your rack plan needs.', to: '/products/infiniband-cables' },
        ],
      },
      {
        type: 'cards',
        eyebrow: 'Storage',
        title: 'Storage for AI pipelines',
        items: [
          { icon: 'Database', title: 'All-Flash Arrays', text: 'Enterprise all-flash platforms for performance and reliability.', to: '/products/dell-powerstore' },
          { icon: 'HardDrive', title: 'NVMe Drives', text: 'Data center NVMe SSDs for servers and storage nodes.', to: '/products/enterprise-ssd' },
          { icon: 'Layers', title: 'Scale-Out Storage', text: 'Parallel and object storage for large datasets and checkpoints.', to: '/solutions/custom-sourcing', cta: 'Request sourcing' },
        ],
      },
      {
        type: 'split',
        eyebrow: 'Configuration considerations',
        title: 'Matching fabric and storage to compute',
        body: [
          'Cluster performance depends on how quickly data moves between GPUs and from storage to GPUs. Port speeds, oversubscription ratios and storage throughput should be sized together.',
        ],
        bullets: ['Number of nodes and GPUs per node', 'Required port speed and topology', 'Dataset size and throughput targets', 'Existing network vendor or standards'],
      },
      AVAILABILITY_NOTE,
    ],
  },

  '/solutions/custom-sourcing': {
    crumb: 'Custom Hardware Sourcing',
    metaTitle: 'Custom Hardware Sourcing',
    description: 'Submit requirements for specialized hardware, large quantities or unlisted configurations.',
    ctaTitle: 'Prefer to talk it through?',
    hero: {
      eyebrow: 'Solutions',
      title: 'Custom Hardware',
      highlight: 'Sourcing',
      intro: 'Need something that isn’t in our catalog — a specific part number, a large quantity or a custom configuration? Tell us and we’ll look for supply options.',
      image: '/images/hiw-step1.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'What we can help with',
        title: 'Requests we handle',
        items: [
          { icon: 'Search', title: 'Specific part numbers', text: 'Exact manufacturer part numbers (MPNs) or SKUs you already know you need.' },
          { icon: 'Boxes', title: 'Large quantities', text: 'Volume orders of GPUs, servers or networking for cluster builds.' },
          { icon: 'Wrench', title: 'Custom configurations', text: 'Servers built to a specific CPU, memory, storage and network spec.' },
          { icon: 'Package', title: 'Hard-to-find items', text: 'Previous-generation, spare or specialized components.' },
        ],
      },
      { type: 'form' },
      {
        type: 'note',
        title: 'What happens next',
        text: 'We review your request, contact suppliers to check options, and reply with questions or a quotation. High-technology orders may require KYB verification before a quote is finalized.',
        link: { label: 'How it works', to: '/resources/how-it-works' },
      },
    ],
  },

  /* ------------------------------- COMPANY ------------------------------- */
  '/company/global-sourcing': {
    crumb: 'Global Sourcing & Trade',
    metaTitle: 'Global Sourcing & Trade',
    description: 'How SPARK X Technology identifies supply options and coordinates procurement and international delivery.',
    hero: {
      eyebrow: 'Company',
      title: 'Global Sourcing',
      highlight: '& Trade',
      intro: 'We help customers identify equipment supply options and coordinate procurement, documentation and international delivery — from first inquiry to after delivery.',
      image: '/images/hiw-step5.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'Our services',
        title: 'How we support your procurement',
        items: [
          { icon: 'Search', title: 'Product & supplier sourcing', text: 'We identify suitable products and supply channels for your requirements.' },
          { icon: 'ClipboardCheck', title: 'Availability & configuration checks', text: 'We confirm configurations, compatibility and indicative availability with suppliers.' },
          { icon: 'Receipt', title: 'Quotation & procurement', text: 'We prepare a written quotation and coordinate the order with the supplier.' },
          { icon: 'FileCheck2', title: 'Export documentation', text: 'Where applicable, we coordinate export documentation and compliance steps.' },
          { icon: 'Plane', title: 'International shipping', text: 'We arrange freight and shipping to your destination country.' },
          { icon: 'LifeBuoy', title: 'Delivery updates & after-sales', text: 'We keep you informed and assist with post-delivery questions and warranty coordination.' },
        ],
      },
      {
        type: 'note',
        title: 'Our sourcing model',
        text: 'SPARK X Technology works as a sourcing and procurement partner. We do not claim to hold inventory or operate warehouses, and availability is confirmed with suppliers for each request.',
      },
    ],
  },

  '/company/compliance-kyb': {
    crumb: 'Compliance & KYB',
    metaTitle: 'Compliance & KYB',
    description: 'Compliance review process for high-technology equipment, including KYB verification and export-control checks.',
    hero: {
      eyebrow: 'Company',
      title: 'Compliance',
      highlight: '& KYB',
      intro: 'Advanced GPUs and AI infrastructure are subject to export-control and sanctions rules. Our compliance review helps ensure every transaction can proceed lawfully.',
      image: '/images/hiw-step2.jpg',
    },
    sections: [
      {
        type: 'steps',
        eyebrow: 'Our review process',
        title: 'What a compliance review includes',
        items: [
          { title: 'Know Your Business (KYB) verification', text: 'Legal company name, registration number, registered address, website and a responsible contact person.' },
          { title: 'Business identity checks', text: 'We verify the company through the official business registry of its country and may request registration documents.' },
          { title: 'End user & intended use', text: 'Who will actually use the equipment and for what purpose (e.g. AI training, inference, HPC).' },
          { title: 'Installation location & destination', text: 'The destination country and the full physical address where the equipment will be installed.' },
          { title: 'Additional information when required', text: 'For higher-risk transactions we may ask about ownership structure or request further documentation.' },
          { title: 'Export-control, sanctions & licensing checks', text: 'Parties are screened against applicable lists, and we assess whether an export license or other authorization is needed.' },
        ],
      },
      {
        type: 'split',
        eyebrow: 'Outcomes',
        title: 'How decisions are recorded',
        body: [
          'Each review results in one of three statuses: Approved, Additional Information Required, or On Hold / Declined.',
          '“Approved” means the review has been passed. It does not replace any export license or government authorization that may be required.',
        ],
        bullets: [
          'Requirements depend on the product, destination, transaction and applicable laws',
          'Orders proceed only after required checks and approvals are complete',
          'Not every order can be approved or exported',
          'Sensitive documents are requested through a secure channel — not through public web forms',
        ],
      },
      {
        type: 'note',
        title: 'Want the step-by-step version?',
        text: 'See what information you may be asked for and how to prepare.',
        link: { label: 'KYB Verification Process', to: '/resources/kyb-verification' },
      },
    ],
  },

  /* ------------------------------ RESOURCES ------------------------------ */
  '/resources/how-to-order': {
    crumb: 'How to Order AI Hardware',
    metaTitle: 'How to Order AI Hardware',
    description: 'Step-by-step guide to ordering AI GPUs, servers and infrastructure from SPARK X Technology.',
    hero: {
      eyebrow: 'Resources',
      title: 'How to Order',
      highlight: 'AI Hardware',
      intro: 'A step-by-step guide from submitting your requirements to receiving your equipment.',
      image: '/images/hiw-step3.jpg',
    },
    sections: [
      {
        type: 'note',
        title: 'Payment policy: 100% advance payment',
        text: 'Orders require 100% payment in advance before the order is placed with the supplier. Payment terms are stated in your written quotation, and no online payment is taken through this website.',
      },
      {
        type: 'steps',
        eyebrow: 'Ordering steps',
        title: 'Seven steps to your order',
        items: [
          { title: 'Submit equipment requirements', text: 'Add products to your quote cart or send a custom request with models, quantities and destination.' },
          { title: 'Complete KYB and compliance checks', text: 'Provide company, end-user and installation-location details as required for the product and destination.' },
          { title: 'Receive and review the quotation', text: 'We send a written quotation with pricing, estimated timeline, shipping terms and conditions.' },
          { title: 'Confirm payment terms', text: 'Accept the quotation and complete the 100% advance payment as stated in the quote.' },
          { title: 'Procurement or production', text: 'We place the order with the supplier; configured systems may be built, tested and packed.' },
          { title: 'Export documentation & shipping', text: 'We coordinate export paperwork, freight and customs documentation for your destination.' },
          { title: 'Delivery updates & post-delivery assistance', text: 'We share updates through delivery and help with warranty or service coordination afterwards.' },
        ],
      },
    ],
  },

  '/resources/lead-times-delivery': {
    crumb: 'Lead Times & Delivery',
    metaTitle: 'Lead Times & Delivery',
    description: 'What affects lead times for AI hardware and how delivery estimates are provided.',
    hero: {
      eyebrow: 'Resources',
      title: 'Lead Times',
      highlight: '& Delivery',
      intro: 'Lead times for AI hardware vary widely. Here is what affects them and how we provide estimates.',
      image: '/images/hiw-step6.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'What affects lead time',
        title: 'Factors that shape your timeline',
        items: [
          { icon: 'PackageCheck', title: 'Product availability', text: 'High-demand GPUs can have long allocation queues; other items may ship quickly.' },
          { icon: 'Building2', title: 'Manufacturer workload', text: 'Factory schedules and supplier backlogs change over time.' },
          { icon: 'Wrench', title: 'Configuration', text: 'Custom and build-to-order systems need assembly and testing time.' },
          { icon: 'ShieldCheck', title: 'Export requirements', text: 'KYB reviews and any required licenses can add time before shipping.' },
          { icon: 'Ship', title: 'Shipping method', text: 'Air freight is faster; sea freight costs less but takes longer.' },
          { icon: 'MapPin', title: 'Destination', text: 'Customs procedures and local delivery vary by country.' },
        ],
      },
      {
        type: 'split',
        eyebrow: 'Indicative estimate',
        title: '8–12+ weeks for configured or build-to-order systems',
        body: [
          'As a general planning guide: quote and payment take around 1–2 weeks, manufacturing or supplier preparation 2–6 weeks, and international shipping and customs 1–3 weeks. Final delivery depends on your location.',
          'These figures are indicative only. Your actual estimated timeline — and its source — will be confirmed in the written quotation.',
        ],
        bulletsTitle: 'How we report estimates',
        bullets: ['Supplier-confirmed delivery date, when available', 'Supplier-provided lead-time range', 'Estimated arrival for items already ordered', 'Clearly marked when confirmation is still needed'],
      },
    ],
  },

  '/resources/export-import': {
    crumb: 'Export & Import Requirements',
    metaTitle: 'Export & Import Requirements',
    description: 'General overview of export and import processes, documentation, customs, duties and taxes.',
    hero: {
      eyebrow: 'Resources',
      title: 'Export & Import',
      highlight: 'Requirements',
      intro: 'A general overview of the documentation, customs and responsibilities involved in shipping AI hardware internationally.',
      image: '/images/hiw-step5.jpg',
    },
    sections: [
      {
        type: 'cards',
        eyebrow: 'Export side',
        title: 'Before the equipment leaves',
        items: [
          { icon: 'ShieldCheck', title: 'Export classification & licensing', text: 'Some products need an export license depending on their classification, destination and end use.' },
          { icon: 'UserCheck', title: 'Screening', text: 'All parties are screened against applicable sanctions and restricted-party lists.' },
          { icon: 'FileText', title: 'Export documents', text: 'Commercial invoice, packing list and any required end-user statements.' },
        ],
      },
      {
        type: 'cards',
        eyebrow: 'Import side',
        title: 'When it arrives in your country',
        items: [
          { icon: 'Scale', title: 'Customs clearance', text: 'Shipments are cleared by customs in the destination country, often via a broker.' },
          { icon: 'CreditCard', title: 'Duties & taxes', text: 'Import duties, VAT/GST and fees are set by the destination country.' },
          { icon: 'ClipboardList', title: 'Local requirements', text: 'Some countries require import permits, certifications or registrations.' },
        ],
      },
      {
        type: 'split',
        eyebrow: 'Responsibilities',
        title: 'Who handles what',
        body: [
          'Responsibility for freight, insurance, customs clearance, duties and taxes depends on the agreed delivery terms (Incoterms), which are stated in your quotation.',
        ],
        bullets: ['Delivery terms are agreed per quotation', 'Import duties and taxes are usually the importer’s responsibility unless agreed otherwise', 'We coordinate documentation and can work with your customs broker'],
      },
      {
        type: 'note',
        title: 'Not legal advice',
        text: 'Requirements vary by destination, product and transaction. This page is general information and is not legal advice or a guarantee of export eligibility.',
      },
    ],
  },

  '/resources/kyb-verification': {
    crumb: 'KYB Verification Process',
    metaTitle: 'KYB Verification Process',
    description: 'Why KYB verification is required for high-technology equipment and what information customers may need to provide.',
    hero: {
      eyebrow: 'Resources',
      title: 'KYB Verification',
      highlight: 'Process',
      intro: 'Why verification may be required for high-technology equipment, and what information you may be asked to provide.',
      image: '/images/hiw-step2.jpg',
    },
    sections: [
      {
        type: 'split',
        eyebrow: 'Why it’s required',
        title: 'Responsible trade in advanced computing',
        body: [
          'Advanced GPUs and AI systems are subject to export-control regulations. Knowing who our customers are, who the end user is and where equipment will be installed helps ensure each order can be fulfilled lawfully.',
          'At the request stage, basic information is enough — we don’t ask for documents up front.',
        ],
      },
      {
        type: 'steps',
        eyebrow: 'Step by step',
        title: 'How verification works',
        items: [
          { title: 'You send your equipment request', text: 'Company name, country of registration, required GPUs or servers, quantities and the expected destination country.' },
          { title: 'We verify your company', text: 'Legal name, registration number, address, website and responsible contact — checked against the official business registry.' },
          { title: 'You confirm end user & installation site', text: 'Who will use the equipment, for what purpose, the full installation address, and whether it will be transferred or relocated.' },
          { title: 'We run export & sanctions checks', text: 'Screening of all parties and assessment of licensing requirements for the product and destination.' },
          { title: 'We record a decision', text: 'Approved, Additional Information Required, or On Hold / Declined.' },
          { title: 'We confirm the order', text: 'After required checks, we send the final quotation, 100% advance-payment terms and order documents.' },
        ],
      },
      {
        type: 'note',
        title: 'More about our compliance approach',
        text: 'Read how compliance reviews are handled and how decisions are made.',
        link: { label: 'Compliance & KYB', to: '/company/compliance-kyb' },
      },
    ],
  },

  '/resources/faq': {
    crumb: 'FAQ',
    metaTitle: 'Frequently Asked Questions',
    description: 'Answers to common questions about ordering AI hardware from SPARK X Technology.',
    hero: {
      eyebrow: 'Resources',
      title: 'Frequently Asked',
      highlight: 'Questions',
      intro: 'Answers to common questions about quotes, payment, verification, lead times and delivery.',
      image: '/images/hiw-hero.jpg',
    },
    sections: [
      {
        type: 'faq',
        items: [
          { q: 'Is there a minimum order quantity?', a: 'It depends on the product and supplier. Some items can be sourced individually, while others are only available in set quantities. We’ll tell you in the quotation.' },
          { q: 'Do you have products in stock?', a: 'We work as a sourcing partner and do not claim to hold inventory. Availability is checked with suppliers for every request and confirmed in your quotation.' },
          { q: 'What are the payment terms?', a: '100% advance payment is required before the order is placed with the supplier. Exact terms and accepted payment methods are stated in your written quotation. No payment is taken on this website.' },
          { q: 'Why do you need KYB verification?', a: 'Advanced GPUs and AI infrastructure are subject to export-control rules. We verify the buyer, end user, intended use and installation location so orders can proceed lawfully.' },
          { q: 'How long will delivery take?', a: 'Configured or build-to-order systems typically take 8–12+ weeks; ready-to-ship items may be faster. Your estimated timeline is confirmed in the quotation.' },
          { q: 'Do you ship internationally?', a: 'Yes, we coordinate international shipping to many destinations, subject to export-control and sanctions checks for the specific product and country.' },
          { q: 'Who pays customs duties and import taxes?', a: 'This depends on the delivery terms agreed in your quotation. In most cases, import duties and taxes are the importer’s responsibility.' },
          { q: 'What warranty applies?', a: 'Warranty and service follow the manufacturer’s terms, which can vary by product and region. We help coordinate warranty or service requests after delivery.' },
          { q: 'How do I request a quotation?', a: 'Add products to your quote cart and submit the form, or send a custom sourcing request. No account or payment is needed to request a quote.' },
        ],
      },
    ],
  },
};
