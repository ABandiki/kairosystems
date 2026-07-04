import type { Metadata } from 'next';
import { CookieBanner } from '@/components/cookie-banner';
import { RequestDemoButton } from '@/components/request-demo-dialog';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Kairo | Practice Management Software for Healthcare Practices in Zimbabwe',
  description:
    'Kairo is a modern practice management system for private healthcare practices in Zimbabwe. Manage appointments, patient records, billing, prescriptions, clinical notes, and WhatsApp notifications in one platform. Start your free trial today.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Kairo | Practice Management Software for Zimbabwe',
    description:
      'All-in-one practice management for private clinics. Appointments, patient records, billing, prescriptions, and WhatsApp notifications.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairo | Practice Management Software',
    description:
      'Modern practice management for healthcare practices in Zimbabwe. Appointments, records, billing, prescriptions.',
  },
  keywords: [
    'practice management software',
    'practice management software Zimbabwe',
    'healthcare software Zimbabwe',
    'medical practice management',
    'appointment scheduling',
    'patient records',
    'clinical notes',
    'medical billing software',
    'private clinic software',
    'electronic health records',
    'EHR Zimbabwe',
    'GP practice management',
    'WhatsApp appointment reminders',
    'clinic management system',
  ],
};
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  Shield,
  CheckCircle,
  BarChart3,
  Pill,
  ClipboardList,
  Heart,
  ChevronRight,
  Star,
  Lock,
  KeyRound,
  Globe,
  MessageSquare
} from 'lucide-react';

/* Inline Kairo "K" logo mark — Option B (Geometric K) */
function KairoLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#03989E" />
          <stop offset="100%" stopColor="#4CBD90" />
        </linearGradient>
      </defs>
      <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#kLogo)" />
      <rect x="32" y="32" width="448" height="448" rx="96" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="4" />
      <rect x="152" y="136" width="42" height="240" rx="21" fill="white" />
      <rect x="194" y="136" width="42" height="165" rx="21" fill="white" transform="rotate(42, 194, 256)" />
      <rect x="194" y="211" width="42" height="165" rx="21" fill="white" transform="rotate(-42, 194, 256)" />
      <circle cx="358" cy="152" r="22" fill="white" opacity="0.5" />
    </svg>
  );
}

/* Small white K mark for dark backgrounds */
function KairoLogoWhite({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="152" y="136" width="42" height="240" rx="21" fill="white" />
      <rect x="194" y="136" width="42" height="165" rx="21" fill="white" transform="rotate(42, 194, 256)" />
      <rect x="194" y="211" width="42" height="165" rx="21" fill="white" transform="rotate(-42, 194, 256)" />
      <circle cx="358" cy="152" r="22" fill="white" opacity="0.5" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: 'Kairo',
                applicationCategory: 'HealthApplication',
                operatingSystem: 'Web',
                description:
                  'Modern practice management system for private healthcare practices in Zimbabwe. Manage appointments, patient records, billing, prescriptions, and clinical notes.',
                url: 'https://kairo.clinic',
                image: 'https://kairo.clinic/og-image.png',
                offers: [
                  {
                    '@type': 'Offer',
                    name: 'Starter',
                    price: '49',
                    priceCurrency: 'USD',
                    url: 'https://kairo.clinic/#pricing',
                  },
                  {
                    '@type': 'Offer',
                    name: 'Professional',
                    price: '99',
                    priceCurrency: 'USD',
                    url: 'https://kairo.clinic/#pricing',
                  },
                ],
                featureList: [
                  'Appointment Scheduling',
                  'Patient Records',
                  'Clinical Notes (SOAP)',
                  'Billing & Invoicing',
                  'Prescriptions',
                  'WhatsApp & SMS Notifications',
                  'Forms & Questionnaires',
                  'Staff Management',
                  'Analytics Dashboard',
                ],
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '5.0',
                  reviewCount: '3',
                  bestRating: '5',
                  worstRating: '1',
                },
              },
              {
                '@type': 'Organization',
                name: 'Kairo',
                legalName: 'Medpro Essentials Ltd',
                url: 'https://kairo.clinic',
                logo: 'https://kairo.clinic/og-image.png',
                sameAs: [
                  'https://www.facebook.com/profile.php?id=61587922967714',
                  'https://www.instagram.com/kair.osystems/',
                  'https://x.com/kairosystems',
                  'https://www.linkedin.com/company/kairo-clinic/',
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+263-785-767-099',
                  contactType: 'sales',
                  email: 'ashley@kairo.clinic',
                  areaServed: 'ZW',
                  availableLanguage: 'English',
                },
                foundingDate: '2025',
              },
              {
                '@type': 'WebSite',
                name: 'Kairo',
                url: 'https://kairo.clinic',
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://kairo.clinic',
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is Kairo?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Kairo is an all-in-one practice management platform built for private healthcare practices in Zimbabwe. It combines appointment scheduling, patient records, clinical notes (SOAP), billing, prescriptions, and WhatsApp notifications in one easy-to-use system.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How long does it take to set up Kairo?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Kairo can be set up in under 10 minutes. There is no complex implementation required — simply create your account, add your practice details, and start seeing patients the same day.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is my patient data secure with Kairo?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. Kairo uses end-to-end AES-256 encryption for all data in transit and at rest. We implement role-based access controls, maintain full audit trails, and comply with local healthcare data regulations including Zimbabwe data protection requirements.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How do WhatsApp appointment reminders work?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Kairo integrates with WhatsApp to send automated appointment reminders and custom messages to your patients. This helps reduce no-shows and keeps patients engaged through Zimbabwe\'s most popular communication channel. WhatsApp & SMS notifications are available as an optional add-on for all plans.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How much does Kairo cost?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Kairo offers two plans: Starter at $49/month (up to 3 staff, scheduling, records, clinical notes, email support) and Professional at $99/month (up to 10 staff, billing & invoicing, advanced analytics, and everything in Starter). Custom pricing is available for larger practices. All plans include a free 2-day trial.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Can I try Kairo before committing?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. Kairo offers a free 2-day trial with no credit card required. You can explore all features and start managing your practice right away. If you need more time or a personalised walkthrough, you can also request a demo.',
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Navigation — floating centered pills */}
      <nav role="navigation" aria-label="Main navigation" className="fixed top-0 inset-x-0 z-50">
        <div className="flex items-center justify-center pt-4 sm:pt-6 px-4 sm:px-8 gap-2 sm:gap-3">
          <Link
            href="/"
            aria-label="Kairo home"
            className="flex items-center justify-center rounded-full w-10 h-10 sm:w-11 sm:h-11 shrink-0 bg-white/90 backdrop-blur-md shadow-sm"
          >
            <KairoLogo className="w-6 h-6 sm:w-7 sm:h-7" />
          </Link>
          <div className="hidden md:flex items-center gap-8 rounded-xl px-7 py-3 bg-white/90 backdrop-blur-md shadow-sm">
            <a href="#features" className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">How It Works</a>
            <a href="#security" className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Security</a>
            <a href="#pricing" className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">Pricing</a>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 bg-white/90 backdrop-blur-md shadow-sm">
            <Link
              href="/login"
              className="text-[12px] sm:text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-[12px] sm:text-[13px] font-medium text-[#03989E] hover:text-[#027A7F] transition-colors duration-200"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      <main>
      {/* Hero Section — fullscreen photo */}
      <section aria-label="Hero" className="relative min-h-screen overflow-hidden bg-[#f0f0ee]">
        <Image
          src="/hero-consultation.jpg"
          alt="A doctor in consultation with a patient at a healthcare practice"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Legibility overlays — strong only near the bottom-left copy */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-3/5 bg-gradient-to-r from-white/60 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-[30rem] sm:h-72 bg-gradient-to-t from-white via-white/60 to-transparent sm:from-white/90 sm:via-white/50" aria-hidden="true" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1 flex items-end pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-12 md:px-20 lg:px-28">
            <div className="max-w-sm">
              <a
                href="#traditional-medicine"
                className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#03989E] hover:text-[#027A7F] transition-colors mb-3 group"
              >
                New — Traditional medicine, finally on the record
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </a>
              <h1 className="text-[1.6rem] sm:text-[1.9rem] leading-[1.15] font-medium text-gray-900 tracking-tight mb-3">
                Simple, smart practice management for African healthcare.
              </h1>
              <p className="text-[13px] text-gray-500 font-normal mb-4">
                Appointments, records, billing and clinical notes for practices in
                Zimbabwe — with traditional medicine recorded alongside conventional care.
              </p>
              <div className="flex items-center gap-4 mb-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#03989E] border border-[#03989E]/60 rounded-full px-5 py-2.5 bg-white/70 backdrop-blur-sm hover:bg-[#03989E] hover:text-white hover:border-[#03989E] transition-all duration-200 group"
                >
                  Start your free trial
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
                <RequestDemoButton className="text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Request a demo
                </RequestDemoButton>
              </div>
              <p className="text-[11.5px] text-gray-400">
                No credit card required · Setup in minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Social Proof Bar */}
      <section aria-label="Trusted by healthcare professionals" className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Trusted by healthcare practices
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
            {['Private Clinics', 'GP Surgeries', 'Specialist Practices', 'Health Centres', 'Medical Groups'].map((name) => (
              <div key={name} className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traditional Medicine — full-bleed story section */}
      <section
        id="traditional-medicine"
        aria-label="Traditional medicine records"
        className="relative min-h-[85vh] overflow-hidden bg-gray-900"
      >
        <Image
          src="/herbs-market.jpg"
          alt="Traditional herbal medicines and remedies at an African market stall"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Legibility overlays — dark counterpart to the hero */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-3/5 bg-gradient-to-r from-black/75 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-[28rem] sm:h-80 bg-gradient-to-t from-black/95 via-black/60 to-transparent" aria-hidden="true" />

        {/* Inset — remedies are identified leaf by leaf, name by name */}
        <div className="hidden lg:block absolute right-16 bottom-20 z-10 w-[280px] rounded-3xl overflow-hidden border border-white/20 shadow-2xl rotate-1">
          <Image
            src="/herb-leaves.jpg"
            alt="Hands holding medicinal leaves"
            width={560}
            height={373}
            className="object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col min-h-[85vh]">
          <div className="flex-1 flex items-end pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-12 md:px-20 lg:px-28">
            <div className="max-w-md">
              <p className="text-[11.5px] font-medium text-[#4CBD90] mb-3">
                Traditional medicine, on the record
              </p>
              <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-white tracking-tight mb-3">
                Most patients see a traditional practitioner before they ever
                reach your rooms.
              </h2>
              <p className="text-[13px] text-gray-300 font-normal mb-5">
                Kairo is the first practice management system built to record
                traditional and complementary medicine alongside conventional
                care — remedies, local names, practitioners and interaction
                risks, all visible before you prescribe.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-[12.5px] text-gray-200">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90] mt-0.5 shrink-0" />
                  Record remedies by their local names — zumbani, umhlonyane, African potato
                </li>
                <li className="flex items-start gap-2 text-[12.5px] text-gray-200">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90] mt-0.5 shrink-0" />
                  Automatic high-priority alerts when a remedy risks interacting with treatment
                </li>
                <li className="flex items-start gap-2 text-[12.5px] text-gray-200">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90] mt-0.5 shrink-0" />
                  The full picture of every kind of care your patients actually seek
                </li>
              </ul>
              <RequestDemoButton className="inline-flex items-center gap-2 text-[13px] font-medium text-white border border-white/60 rounded-full px-5 py-2.5 hover:bg-white hover:text-gray-900 hover:border-white transition-all duration-200 group">
                See it in action
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </RequestDemoButton>
              <p className="mt-4 text-[11px] text-gray-400">
                Aligned with the WHO Traditional Medicine Strategy and UN SDG 3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" aria-label="Features" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
              Features
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight">
              Everything your practice needs,{' '}
              <span className="text-[#03989E]">all in one place</span>
            </h2>
            <p className="mt-3 text-[13px] text-gray-500">
              From appointment scheduling to clinical notes, Kairo streamlines every aspect of your practice workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Intuitive appointment booking with drag-and-drop, room management, and real-time availability across your whole team.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: Users,
                title: 'Patient Records',
                description: 'Comprehensive electronic health records with medical history, demographics, allergies, and medications all in one view.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: FileText,
                title: 'Clinical Notes',
                description: 'Structured consultation templates, SOAP notes, and clinical documentation that saves you time on every patient encounter.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: CreditCard,
                title: 'Billing & Invoicing',
                description: 'Generate invoices, track payments, and manage your practice revenue with integrated billing workflows.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: Pill,
                title: 'Prescriptions',
                description: 'Manage pharmacies, generate prescriptions, and maintain a complete medication history for every patient.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: ClipboardList,
                title: 'Forms & Questionnaires',
                description: 'Create custom patient intake forms, consent forms, and health questionnaires with a drag-and-drop builder.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Real-time insights into patient flow, staff utilisation, appointment trends, and practice performance.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: MessageSquare,
                title: 'WhatsApp & SMS Notifications',
                description: 'Reach patients where they are. Send appointment reminders, confirmations, and custom messages via WhatsApp, SMS, or email.',
                color: 'bg-gray-50 text-[#03989E]',
              },
              {
                icon: Users,
                title: 'Staff Management',
                description: 'Manage your team with role-based access, individual schedules, and granular permissions for every staff member.',
                color: 'bg-gray-50 text-[#03989E]',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color} mb-4`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" aria-label="How it works" className="py-20 sm:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
              How It Works
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight">
              Up and running in <span className="text-[#03989E]">under 10 minutes</span>
            </h2>
            <p className="mt-3 text-[13px] text-gray-500">
              Getting started with Kairo is straightforward. No lengthy onboarding or complex migrations.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Register Your Practice',
                description: 'Sign up with your practice details and invite your team. It takes less than 2 minutes.',
              },
              {
                step: '02',
                title: 'Configure Settings',
                description: 'Set up your opening hours, rooms, appointment types, and practice preferences.',
              },
              {
                step: '03',
                title: 'Add Your Patients',
                description: 'Import existing patient records or start adding patients as they come in.',
              },
              {
                step: '04',
                title: 'Start Seeing Patients',
                description: 'Book appointments, write notes, and manage your practice — all from one dashboard.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-2 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gray-200" />
                )}
                <div className="text-center">
                  <div className="text-[11.5px] font-medium text-[#03989E] mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-[15px] font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight - Split Section */}
      <section aria-label="Feature highlights" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Highlight 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
                Save 2+ Hours Daily
              </p>
              <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight mb-3">
                Less admin, more time for what matters — quality patient care
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                Kairo automates the repetitive tasks that eat into your clinical time.
                From quick-fill appointment slots to templated clinical notes, everything is designed
                to keep your focus where it belongs — on your patients.
              </p>
              <ul className="space-y-3">
                {[
                  'Pre-built consultation templates for common presentations',
                  'One-click appointment booking and rescheduling',
                  'Automated invoice generation from consultations',
                  'Instant access to full patient history during consultations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90] mt-0.5 flex-shrink-0" />
                    <span className="text-[13px] text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 relative">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#03989E]" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium text-gray-900">New Consultation Note</h4>
                    <p className="text-[11.5px] text-gray-500">Sarah Johnson — Follow-up</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[11.5px] font-medium text-gray-500 mb-1">Presenting Complaint</p>
                    <p className="text-[13px] text-gray-600">Persistent headache for 3 days, not responding to paracetamol...</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[11.5px] font-medium text-gray-500 mb-1">Examination</p>
                    <p className="text-[13px] text-gray-600">BP 128/82, Temp 36.8°C, neuro exam NAD...</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[11.5px] font-medium text-gray-500 mb-1">Plan</p>
                    <p className="text-[13px] text-gray-600">Trial of sumatriptan 50mg PRN. Review in 2 weeks...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-gray-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[13px] font-medium text-gray-900">Practice Overview</h4>
                  <span className="text-[11.5px] text-gray-400">This Week</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-medium tracking-tight text-gray-900">142</p>
                    <p className="text-[11.5px] text-gray-500">Appointments</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-medium tracking-tight text-gray-900">97%</p>
                    <p className="text-[11.5px] text-gray-500">Attendance</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-medium tracking-tight text-gray-900">$18.4k</p>
                    <p className="text-[11.5px] text-gray-500">Revenue</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-medium tracking-tight text-gray-900">4.9</p>
                    <p className="text-[11.5px] text-gray-500">Satisfaction</p>
                  </div>
                </div>
                {/* Mini Bar Chart */}
                <div className="mt-4">
                  <p className="text-[11.5px] font-medium text-gray-500 mb-2">Daily Appointments</p>
                  <div className="flex items-end gap-1 h-16">
                    {[60, 75, 85, 45, 90, 70, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#03989E]/20 rounded-t-sm relative">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-[#03989E] rounded-t-sm"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <span key={day} className="text-[10px] text-gray-400 flex-1 text-center">{day}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
                Data-Driven Insights
              </p>
              <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight mb-3">
                Understand your practice like never before
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                Track patient flow, monitor revenue, analyse appointment trends, and identify opportunities
                to grow your practice — all from a real-time analytics dashboard.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time appointment and revenue tracking',
                  'Staff utilisation and performance insights',
                  'Patient attendance and DNA rate monitoring',
                  'Customisable reports for practice meetings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90] mt-0.5 flex-shrink-0" />
                    <span className="text-[13px] text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" aria-label="Security and compliance" className="py-20 sm:py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-[11.5px] font-medium text-[#4CBD90] uppercase tracking-wide mb-3">
              Security & Compliance
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-white tracking-tight">
              Your patient data is{' '}
              <span className="text-[#4CBD90]">safe with us</span>
            </h2>
            <p className="mt-3 text-[13px] text-gray-400">
              Healthcare data demands the highest level of protection. Kairo is built with security at its core.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Lock,
                title: 'End-to-End Encryption',
                description: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.',
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Granular permissions ensure staff only see the data they need. Full audit trail on all actions.',
              },
              {
                icon: KeyRound,
                title: 'Sign in with Google',
                description: 'Staff can sign in with their Google account — OAuth 2.0 with no extra passwords to phish or reuse, backed by Google’s 2-Step Verification.',
              },
              {
                icon: Globe,
                title: 'Data Sovereignty',
                description: 'Your data stays in your region. We comply with local healthcare data regulations.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[#4CBD90]" />
                </div>
                <h3 className="text-[15px] font-medium text-white mb-2">{item.title}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — infinite marquee, pauses on hover */}
      <section aria-label="Testimonials" className="py-20 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
              Testimonials
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight">
              Loved by healthcare professionals
            </h2>
          </div>
        </div>

        <div
          className="marquee relative overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="marquee-track flex w-max">
            {(() => {
              const testimonials = [
                {
                  quote: 'Kairo has completely transformed how we run our practice. Appointment management alone has saved us hours every week.',
                  name: 'Dr. T. Moyo',
                  role: 'General Practitioner',
                  rating: 5,
                },
                {
                  quote: 'The clinical notes system is exactly what we needed. I can focus on the patient without worrying about documentation.',
                  name: 'Sr. N. Chigumba',
                  role: 'Practice Nurse',
                  rating: 5,
                },
                {
                  quote: 'Finally, a practice management system that doesn\'t require a manual to use. The team was up and running in a day.',
                  name: 'Dr. R. Mutasa',
                  role: 'Practice Owner',
                  rating: 5,
                },
              ];
              // Rendered twice for a seamless -50% translate loop
              return [...testimonials, ...testimonials].map((testimonial, i) => (
                <div
                  key={`${testimonial.name}-${i}`}
                  aria-hidden={i >= testimonials.length}
                  className="w-[340px] sm:w-[380px] shrink-0 mr-6 p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#03989E] font-medium text-[13px]">
                      {testimonial.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-[11.5px] text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" aria-label="Pricing plans" className="py-20 sm:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
              Pricing
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-[13px] text-gray-500">
              No hidden fees, no surprises. Pick the plan that fits your practice.
            </p>
            <p className="mt-2 text-[11.5px] text-gray-400">
              WhatsApp &amp; SMS notifications available as an optional add-on on all plans.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '49',
                description: 'Perfect for solo practitioners',
                features: [
                  'Up to 3 staff members',
                  'Appointment scheduling',
                  'Patient records',
                  'Clinical notes',
                  'Basic reporting',
                  'Email support',
                ],
                cta: 'Start Free Trial',
                highlighted: false,
              },
              {
                name: 'Professional',
                price: '99',
                description: 'For growing practices',
                features: [
                  'Up to 10 staff members',
                  'Everything in Starter',
                  'Billing & invoicing',
                  'Forms & questionnaires',
                  'Advanced analytics',
                  'Priority support',
                  'Custom templates',
                ],
                cta: 'Start Free Trial',
                highlighted: true,
              },
              {
                name: 'Custom',
                price: 'Custom',
                description: 'For large practices & groups',
                features: [
                  'Custom staff limit',
                  'Everything in Professional',
                  'Multi-location support',
                  'API access',
                  'Dedicated account manager',
                  'Custom integrations',
                  'SLA guarantee',
                ],
                cta: 'Contact Sales',
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`group relative p-8 rounded-2xl border bg-white transition-all duration-300 hover:scale-[1.03] hover:bg-gray-900 hover:border-gray-900 hover:shadow-2xl hover:z-10 ${
                  plan.highlighted
                    ? 'border-[#03989E]/40'
                    : 'border-gray-100'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white border border-[#03989E]/40 text-[#03989E] text-[11px] font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-white transition-colors duration-300">{plan.name}</h3>
                <p className="text-[13px] text-gray-500 mt-1 group-hover:text-gray-300 transition-colors duration-300">{plan.description}</p>
                <div className="mt-4 mb-6">
                  {plan.price === 'Custom' ? (
                    <span className="text-[2rem] font-medium tracking-tight text-gray-900 group-hover:text-white transition-colors duration-300">Custom</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-[2rem] font-medium tracking-tight text-gray-900 group-hover:text-white transition-colors duration-300">${plan.price}</span>
                      <span className="text-[13px] text-gray-500 group-hover:text-gray-300 transition-colors duration-300">/month</span>
                    </div>
                  )}
                </div>
                <Link
                  href={plan.price === 'Custom' ? 'mailto:ashley@kairo.clinic' : '/register'}
                  className={`inline-flex w-full items-center justify-center gap-2 text-[13px] font-medium rounded-full px-5 py-2.5 transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-[#03989E] text-white hover:bg-[#027A7F]'
                      : 'text-[#03989E] border border-[#03989E]/60 group-hover:bg-[#03989E] group-hover:text-white group-hover:border-[#03989E] hover:!bg-[#027A7F]'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[13px] text-gray-600 group-hover:text-gray-200 transition-colors duration-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Messaging Add-On */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#03989E]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-gray-900 mb-1">WhatsApp &amp; SMS Notifications</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
                    Add automated appointment reminders, confirmations, and custom patient messages via WhatsApp and SMS.
                    Available on all plans as an optional add-on.
                  </p>
                  <div className="flex flex-wrap gap-4 text-[13px]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90]" />
                      <span className="text-gray-600">Pay-per-message pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90]" />
                      <span className="text-gray-600">No monthly minimum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#4CBD90]" />
                      <span className="text-gray-600">WhatsApp + SMS + Email</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-label="Frequently asked questions" className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[11.5px] font-medium text-[#03989E] uppercase tracking-wide mb-3">
              FAQ
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-gray-900 tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'What is Kairo?',
                answer: 'Kairo is an all-in-one practice management platform built for private healthcare practices in Zimbabwe. It combines appointment scheduling, patient records, clinical notes (SOAP), billing, prescriptions, and WhatsApp notifications in one easy-to-use system.',
              },
              {
                question: 'How long does it take to set up Kairo?',
                answer: 'Kairo can be set up in under 10 minutes. There is no complex implementation required — simply create your account, add your practice details, and start seeing patients the same day.',
              },
              {
                question: 'Is my patient data secure with Kairo?',
                answer: 'Yes. Kairo uses end-to-end AES-256 encryption for all data in transit and at rest. We implement role-based access controls, maintain full audit trails, and comply with local healthcare data regulations including Zimbabwe data protection requirements.',
              },
              {
                question: 'How do WhatsApp appointment reminders work?',
                answer: 'Kairo integrates with WhatsApp to send automated appointment reminders and custom messages to your patients. This helps reduce no-shows and keeps patients engaged through Zimbabwe\'s most popular communication channel. WhatsApp & SMS notifications are available as an optional add-on for all plans.',
              },
              {
                question: 'How much does Kairo cost?',
                answer: 'Kairo offers two plans: Starter at $49/month (up to 3 staff, scheduling, records, clinical notes, email support) and Professional at $99/month (up to 10 staff, billing & invoicing, advanced analytics, and everything in Starter). Custom pricing is available for larger practices. All plans include a free 2-day trial.',
              },
              {
                question: 'Can I try Kairo before committing?',
                answer: 'Yes! Kairo offers a free 2-day trial with no credit card required. You can explore all features and start managing your practice right away. If you need more time or a personalised walkthrough, you can also request a demo.',
              },
            ].map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-gray-100 bg-white">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left text-[14px] font-medium text-gray-900 hover:text-[#03989E] transition-colors [&::-webkit-details-marker]:hidden list-none">
                  {faq.question}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-[13px] text-gray-500 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-label="Get started" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gray-900 p-12 sm:p-16 text-center overflow-hidden">
            <Image
              src="/notes-writing.jpg"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover opacity-60"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/55 to-gray-900/25" aria-hidden="true" />
            <div className="relative z-10">
              <h2 className="text-[1.5rem] sm:text-[1.75rem] leading-[1.15] font-medium text-white tracking-tight">
                Ready to transform your practice?
              </h2>
              <p className="mt-3 text-[13px] text-gray-400 max-w-2xl mx-auto">
                Join healthcare practices that have already made the switch to Kairo.
                Start your free 2-day trial today — no credit card required.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-white border border-white/60 rounded-full px-5 py-2.5 hover:bg-white hover:text-gray-900 hover:border-white transition-all duration-200 group"
                >
                  Start Free Trial
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
                <RequestDemoButton variant="outline" className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-300 hover:text-white transition-colors duration-200">
                  Request a Demo
                </RequestDemoButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <KairoLogo className="w-8 h-8" />
                <span className="text-[15px] font-medium">Kairo</span>
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed">
                Modern practice management software for healthcare professionals. Built to simplify your workflow.
              </p>
              <div className="flex items-center gap-4 mt-5">
                <a href="https://www.facebook.com/profile.php?id=61587922967714" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/kair.osystems/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://x.com/kairosystems" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="X (Twitter)">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/kairo-clinic/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-[12px] text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-[12px] text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#security" className="text-[12px] text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><Link href="/legal" className="text-[12px] text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="text-[12px] text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-[12px] text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-[12px] text-gray-400 hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/data-processing-agreement" className="text-[12px] text-gray-400 hover:text-white transition-colors">Data Processing Agreement</Link></li>
                <li><Link href="/patient-consent-form" className="text-[12px] text-gray-400 hover:text-white transition-colors">Patient Consent Form</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-medium text-gray-400 uppercase tracking-wide mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:ashley@kairo.clinic" className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    ashley@kairo.clinic
                  </a>
                </li>
                <li>
                  <a href="tel:+263785767099" className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    +263 785 767 099
                  </a>
                </li>
                <li>
                  <a href="mailto:support@kairo.clinic" className="text-[12px] text-gray-400 hover:text-white transition-colors">
                    support@kairo.clinic
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11.5px] text-gray-500">
              &copy; {new Date().getFullYear()} Kairo Systems. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-[11.5px] text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[11.5px] text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/legal" className="text-[11.5px] text-gray-500 hover:text-white transition-colors">Legal</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}
