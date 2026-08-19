import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { hashPassword } from '../utils/password.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, '..', 'db.json');

const defaultData = {
  admins: [],
  products: [],
  services: [],
  androidApps: [],
  settings: {
    address: 'House No. 46, LKRB Path, Nabin Nagar, Guwahati, Assam 781024, India',
    email: 'info.reynrel@gmail.com',
    phone: '+91 94010 69337',
    whatsappNumber: '919864773099',
    businessHours: 'Mon-Sat: 9AM - 6PM IST · Saturday: 10AM - 4PM · Sunday: Closed',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/company/reynrel',
      instagram: 'https://www.instagram.com/reynrel_infotech',
      whatsapp: 'https://wa.me/+919864773099'
    }
  },
  clients: [],
  subscriptions: [],
  renewalRequests: [],
  leads: []
};

const seedProducts = [
  {
    name: 'Inventory Manager',
    category: 'Retail & Inventory',
    icon: 'Package',
    image: '',
    imageAlt: 'Inventory Manager POS and inventory dashboard for Indian kirana, FMCG and pharmacy stores',
    description: 'Complete offline POS & inventory management system for Indian kirana, FMCG and pharmacy stores. Handle fast billing, stock and batch/expiry tracking, purchases, and customer udhar (khatabook) — all from one desktop app with no monthly subscription.',
    features: [
      'Fast Billing & POS with Barcode Scanning',
      'Batch & Expiry Tracking',
      'Vendor & Purchase Order Management',
      'Customer Udhar (Khatabook) Ledger',
      'GST Invoice Printing & GSTR-1/3B Exports',
      'Multi-Store & Multi-Counter Support',
      'Thermal Receipt Printing (2"/3")',
      'Offline-First Desktop App',
      'Auto Backup & Data Security',
      'Real-time Sales & Inventory Reports'
    ],
    badges: ['Works Offline', 'No Monthly Fees'],
    metrics: [
      { label: 'Setup Time', value: '<10 min' },
      { label: 'Monthly Fees', value: '₹0' },
      { label: 'Works', value: 'Offline' }
    ],
    pricingAnnual: 4999,
    demoHighlights: [
      { title: 'Dashboard Overview', description: 'See sales, stock and business health at a glance from the main dashboard' },
      { title: 'POS / New Sale', description: 'Experience fast billing with barcode scanning and instant GST invoice printing' },
      { title: 'Customer Udhar (Khatabook)', description: 'Track customer credit and payments digitally, replacing the paper khatabook' },
      { title: 'Reports & Analytics', description: 'Explore sales, stock and GSTR-ready reports in real time' }
    ],
    introPage: 'inventory-manager/'
  },
  {
    name: 'CRM Software',
    category: 'Sales & Marketing',
    icon: 'Users',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_183be303d-1766470449787.png',
    imageAlt: 'Professional sales team collaborating around large digital screen displaying customer relationship management dashboard with sales pipeline, analytics graphs, and client interaction data',
    description: 'Advanced customer relationship management platform that automates sales processes, tracks customer interactions, and provides actionable insights to boost revenue and customer satisfaction.',
    features: [
      '360° Customer View & History',
      'Sales Pipeline Management',
      'Lead Scoring & Qualification',
      'Email Campaign Automation',
      'Task & Activity Tracking',
      'Custom Reporting & Forecasting',
      'Mobile CRM App',
      'Third-Party Integrations',
      'AI-Powered Sales Insights',
      'Team Collaboration Tools'
    ],
    badges: ['Best ROI', 'Enterprise Ready'],
    metrics: [
      { label: 'Productivity', value: '+75%' },
      { label: 'Deal Closure', value: '+45%' },
      { label: 'Revenue', value: '+120%' }
    ],
    pricingAnnual: 8400,
    demoHighlights: [
      { title: 'Lead Management', description: 'See how leads are automatically captured, scored, and assigned to sales reps' },
      { title: 'Sales Pipeline', description: 'Visualize your entire sales process with drag-and-drop deal management' },
      { title: 'Email Automation', description: 'Experience personalized email campaigns that nurture leads automatically' },
      { title: 'Sales Analytics', description: 'Discover predictive insights that help you close more deals faster' }
    ]
  },
  {
    name: 'Billing Software',
    category: 'Financial Services',
    icon: 'Receipt',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12ef293fe-1764661146653.png',
    imageAlt: 'Modern financial office workspace with dual monitors displaying billing software interface, invoice management system, and automated payment processing dashboard with professional accountant reviewing reports',
    description: 'Intelligent billing and invoicing solution that eliminates manual errors, accelerates payment cycles, and provides comprehensive financial reporting for businesses of all sizes.',
    features: [
      'Automated Invoice Generation',
      'Recurring Billing Management',
      'Multi-Currency Support',
      'Payment Gateway Integration',
      'Expense Tracking & Management',
      'Tax Calculation & Compliance',
      'Financial Reporting Suite',
      'Client Portal Access',
      'Late Payment Reminders',
      'Audit Trail & Compliance'
    ],
    badges: ['Error-Free', 'Fast Setup'],
    metrics: [
      { label: 'Error Rate', value: '-95%' },
      { label: 'Billing Cycle', value: '-80%' },
      { label: 'Collections', value: '+60%' }
    ],
    pricingAnnual: 6000,
    demoHighlights: [
      { title: 'Invoice Automation', description: 'Watch how invoices are generated automatically from project milestones' },
      { title: 'Payment Processing', description: 'See multiple payment methods integrated seamlessly with auto-reconciliation' },
      { title: 'Expense Management', description: 'Experience smart expense categorization and approval workflows' },
      { title: 'Financial Reports', description: 'Explore comprehensive financial dashboards with real-time insights' }
    ]
  }
];

const seedServices = [
  {
    title: 'Custom App Development',
    category: 'Mobile & Desktop',
    icon: 'Smartphone',
    description: 'Build powerful, scalable custom applications tailored to your unique business requirements. From native mobile apps to cross-platform solutions, we deliver exceptional user experiences with robust backend architecture.',
    keyFeatures: [
      'Native iOS and Android development',
      'Cross-platform solutions with React Native and Flutter',
      'Progressive Web Apps (PWA) development',
      'Desktop applications with Electron',
      'Real-time data synchronization',
      'Offline-first architecture',
      'Push notifications and background services',
      'Biometric authentication integration',
      'In-app payment gateway integration',
      'Analytics and crash reporting'
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Electron', 'Firebase'],
    timeline: '8-16 weeks',
    startingPrice: '$25,000'
  },
  {
    title: 'Web Development',
    category: 'Enterprise Solutions',
    icon: 'Globe',
    description: 'Create stunning, responsive websites and web applications that drive business growth. Our modern web development approach combines cutting-edge technologies with proven design principles for optimal performance and user engagement.',
    keyFeatures: [
      'Responsive design for all devices',
      'Server-side rendering (SSR) with Next.js',
      'Single Page Applications (SPA)',
      'E-commerce platform development',
      'Content Management Systems (CMS)',
      'API development and integration',
      'Real-time features with WebSockets',
      'SEO optimization and performance tuning',
      'Progressive enhancement strategies',
      'Accessibility compliance (WCAG 2.1)'
    ],
    technologies: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL'],
    timeline: '6-12 weeks',
    startingPrice: '$15,000'
  },
  {
    title: 'Tech Consultation',
    category: 'Strategic Advisory',
    icon: 'Lightbulb',
    description: 'Navigate complex technology decisions with confidence. Our expert consultants provide strategic guidance on technology selection, architecture design, digital transformation, and technical debt management to ensure your technology investments deliver maximum value.',
    keyFeatures: [
      'Technology stack evaluation and selection',
      'System architecture design and review',
      'Digital transformation roadmap',
      'Technical debt assessment',
      'Security audit and compliance review',
      'Performance optimization strategies',
      'Cloud migration planning',
      'DevOps and CI/CD implementation',
      'Team training and knowledge transfer',
      'Vendor evaluation and selection'
    ],
    technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
    timeline: '2-4 weeks',
    startingPrice: '$5,000'
  },
  {
    title: 'API Development & Integration',
    category: 'Backend Services',
    icon: 'Network',
    description: 'Design and implement robust RESTful and GraphQL APIs that power your digital ecosystem. We specialize in creating scalable, secure, and well-documented APIs with seamless third-party integrations.',
    keyFeatures: [
      'RESTful API design and development',
      'GraphQL API implementation',
      'API documentation with Swagger/OpenAPI',
      'Third-party API integration',
      'Microservices architecture',
      'API gateway implementation',
      'Rate limiting and throttling',
      'OAuth 2.0 and JWT authentication',
      'API versioning strategies',
      'Webhook implementation'
    ],
    technologies: ['Node.js', 'Express', 'GraphQL', 'MongoDB', 'Redis', 'AWS Lambda'],
    timeline: '4-8 weeks',
    startingPrice: '$12,000'
  },
  {
    title: 'Cloud Solutions',
    category: 'Infrastructure',
    icon: 'Cloud',
    description: 'Leverage the power of cloud computing with our comprehensive cloud solutions. From migration to optimization, we help you build scalable, cost-effective cloud infrastructure that grows with your business.',
    keyFeatures: [
      'Cloud migration strategy and execution',
      'Multi-cloud and hybrid cloud solutions',
      'Infrastructure as Code (IaC)',
      'Auto-scaling and load balancing',
      'Disaster recovery planning',
      'Cost optimization strategies',
      'Serverless architecture',
      'Container orchestration',
      'Cloud security implementation',
      'Monitoring and alerting setup'
    ],
    technologies: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
    timeline: '6-10 weeks',
    startingPrice: '$20,000'
  },
  {
    title: 'DevOps & CI/CD',
    category: 'Automation',
    icon: 'GitBranch',
    description: 'Accelerate your development lifecycle with modern DevOps practices and automated CI/CD pipelines. We implement robust automation strategies that improve code quality, reduce deployment time, and enhance team collaboration.',
    keyFeatures: [
      'CI/CD pipeline setup and optimization',
      'Automated testing frameworks',
      'Infrastructure automation',
      'Container orchestration',
      'Monitoring and logging solutions',
      'Security scanning and compliance',
      'Blue-green and canary deployments',
      'GitOps workflow implementation',
      'Performance monitoring',
      'Incident response automation'
    ],
    technologies: ['Jenkins', 'GitLab CI', 'GitHub Actions', 'Docker', 'Kubernetes', 'Prometheus'],
    timeline: '3-6 weeks',
    startingPrice: '$10,000'
  }
];

const seedAndroidApps = [
  {
    name: 'Clinic Management App',
    category: 'Healthcare Solutions',
    icon: 'Activity',
    badge: 'Companion App',
    description: 'Manage appointments, patient records, and billing on the go. The mobile companion to our Clinic Management platform keeps your front desk and clinicians connected from anywhere.',
    features: [
      'View & manage appointment schedule',
      'Access patient records securely',
      'Push notifications for reminders',
      'Offline mode for spotty connectivity'
    ],
    rating: '4.8',
    downloads: '1K+',
    size: '28 MB',
    version: '1.0.0',
    playStoreUrl: null,
    apkUrl: null,
    screenshots: []
  },
  {
    name: 'CRM Mobile',
    category: 'Sales & Marketing',
    icon: 'Users',
    badge: 'Companion App',
    description: 'Track leads, log calls, and close deals from your phone. CRM Mobile brings your full sales pipeline into your pocket with real-time sync.',
    features: [
      'Full sales pipeline on mobile',
      'Click-to-call & auto activity logging',
      'Lead scoring at a glance',
      'Works with your existing CRM data'
    ],
    rating: '4.7',
    downloads: '500+',
    size: '24 MB',
    version: '1.0.0',
    playStoreUrl: null,
    apkUrl: null,
    screenshots: []
  },
  {
    name: 'Billing Mobile',
    category: 'Financial Services',
    icon: 'Receipt',
    badge: 'Companion App',
    description: 'Generate invoices, track payments, and monitor expenses from anywhere. Billing Mobile keeps your finances in sync with the desktop platform.',
    features: [
      'Create & send invoices on the go',
      'Real-time payment tracking',
      'Expense capture with photo receipts',
      'Secure biometric login'
    ],
    rating: '4.9',
    downloads: '500+',
    size: '22 MB',
    version: '1.0.0',
    playStoreUrl: null,
    apkUrl: null,
    screenshots: []
  }
];

const adapter = new JSONFile(dbFile);
export const db = new Low(adapter, defaultData);

export async function initDb() {
  await db.read();
  db.data ||= structuredClone(defaultData);

  let changed = false;

  if (!db.data.admins || db.data.admins.length === 0) {
    db.data.admins = [
      {
        id: nanoid(),
        username: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
        passwordHash: hashPassword(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'),
        createdAt: new Date().toISOString()
      }
    ];
    changed = true;
    // eslint-disable-next-line no-console
    console.log(
      `Seeded default admin -> username: "${db.data.admins[0].username}", password: "${process.env.ADMIN_DEFAULT_PASSWORD || 'admin123'}" (change this after first login)`
    );
  }

  if (!db.data.products || db.data.products.length === 0) {
    const now = new Date().toISOString();
    db.data.products = seedProducts.map((p) => ({ id: nanoid(), ...p, createdAt: now, updatedAt: now }));
    changed = true;
  }

  if (!db.data.services || db.data.services.length === 0) {
    const now = new Date().toISOString();
    db.data.services = seedServices.map((s) => ({ id: nanoid(), ...s, createdAt: now, updatedAt: now }));
    changed = true;
  }

  if (!db.data.androidApps || db.data.androidApps.length === 0) {
    const now = new Date().toISOString();
    db.data.androidApps = seedAndroidApps.map((a) => ({ id: nanoid(), ...a, createdAt: now, updatedAt: now }));
    changed = true;
  }

  if (!db.data.settings) {
    db.data.settings = defaultData.settings;
    changed = true;
  }

  db.data.clients ||= [];
  db.data.subscriptions ||= [];
  db.data.renewalRequests ||= [];
  db.data.leads ||= [];

  if (changed) {
    await db.write();
  }
}
