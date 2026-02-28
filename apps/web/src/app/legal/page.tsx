import Link from 'next/link';
import { ArrowLeft, Shield, FileText, ClipboardList, ArrowRight } from 'lucide-react';

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

const legalDocuments = [
  {
    title: 'Privacy Policy',
    description: 'Learn how Kairo collects, uses, stores, and protects your personal data and health information. Covers data controller roles, retention periods, and your rights.',
    href: '/privacy-policy',
    icon: Shield,
    color: 'bg-[#E6F7F7] text-[#03989E]',
  },
  {
    title: 'Terms & Conditions',
    description: 'The legally binding agreement governing use of the Kairo platform. Covers subscription plans, payment terms, practice responsibilities, and acceptable use.',
    href: '/terms',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Data Processing Agreement',
    description: 'Defines how Kairo processes personal data on behalf of GP practices. Covers processor obligations, security measures, breach procedures, and audit rights.',
    href: '/data-processing-agreement',
    icon: Shield,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Patient Consent Form',
    description: 'Reference consent form for practices to use with patients. Covers data collection, usage, access controls, communications, and patient rights.',
    href: '/patient-consent-form',
    icon: ClipboardList,
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <KairoLogo className="w-9 h-9" />
              <span className="text-xl font-bold text-gray-900">Kairo</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#03989E] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-[#03989E] to-[#027A7F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Legal &amp; Documentation</h1>
          <p className="mt-4 text-lg text-teal-100">Kairo GP Practice Management System</p>
          <p className="mt-2 text-sm text-teal-200">All legal documents &mdash; effective 1 February 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Below you will find all legal documentation relating to the Kairo platform. These documents outline how we handle your data, our terms of service, and resources for GP practices.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {legalDocuments.map((doc) => (
            <Link
              key={doc.title}
              href={doc.href}
              className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#03989E]/20 hover:shadow-lg hover:shadow-[#03989E]/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.color} mb-4`}>
                <doc.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#03989E] transition-colors">{doc.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{doc.description}</p>
              <div className="inline-flex items-center gap-1 text-sm font-medium text-[#03989E]">
                Read document
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions about our legal documents?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about our policies or need further information, please get in touch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:ashley@kairo.clinic" className="inline-flex items-center px-6 py-2.5 bg-[#03989E] text-white text-sm font-medium rounded-lg hover:bg-[#027A7F] transition-colors">
              ashley@kairo.clinic
            </a>
            <a href="tel:+263785767099" className="inline-flex items-center px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:border-[#03989E]/30 hover:text-[#03989E] transition-colors">
              +263 785 767 099
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KairoLogo className="w-7 h-7" />
              <span className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Kairo Systems (Medpro Essentials Ltd). All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link href="/data-processing-agreement" className="text-sm text-gray-400 hover:text-white transition-colors">DPA</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
