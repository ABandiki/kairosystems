import { CookieBanner } from '@/components/cookie-banner';
import { RequestDemoButton } from '@/components/request-demo-dialog';
import Link from 'next/link';
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Pill,
  ClipboardList,
  Monitor,
  Heart,
  ChevronRight,
  Star,
  Zap,
  Lock,
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
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <KairoLogo className="w-9 h-9" />
              <span className="text-xl font-bold text-gray-900">Kairo</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-[#03989E] transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-[#03989E] transition-colors">How It Works</a>
              <a href="#security" className="text-sm text-gray-600 hover:text-[#03989E] transition-colors">Security</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-[#03989E] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-[#03989E] transition-colors"
              >
                Log in
              </Link>
              <RequestDemoButton
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-[#03989E] border border-[#03989E]/30 rounded-lg hover:bg-[#E6F7F7] transition-colors"
              >
                Request Demo
              </RequestDemoButton>
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 bg-[#03989E] text-white text-sm font-medium rounded-lg hover:bg-[#027A7F] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#03989E]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4CBD90]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E6F7F7] border border-[#03989E]/20 rounded-full text-sm text-[#03989E] font-medium mb-6">
              <Zap className="w-4 h-4" />
              Built for Healthcare Practices
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
              Practice management,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03989E] to-[#4CBD90]">
                simplified
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Kairo brings together appointments, patient records, billing, and clinical notes
              in one intuitive platform — so you can spend less time on admin and more time with patients.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3.5 bg-[#03989E] text-white text-base font-semibold rounded-xl hover:bg-[#027A7F] transition-all shadow-lg shadow-[#03989E]/25 hover:shadow-xl hover:shadow-[#03989E]/30 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <RequestDemoButton
                className="inline-flex items-center px-8 py-3.5 bg-white text-gray-700 text-base font-semibold rounded-xl border border-gray-200 hover:border-[#03989E]/30 hover:text-[#03989E] transition-all"
              >
                Request a Demo
              </RequestDemoButton>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#4CBD90]" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#4CBD90]" />
                2-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#4CBD90]" />
                Setup in minutes
              </div>
            </div>
          </div>

          {/* Multi-Device Showcase */}
          <div className="mt-20 max-w-6xl mx-auto relative" style={{ height: '520px' }}>

            {/* === MACBOOK (Centre) === */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20" style={{ width: '680px' }}>
              {/* Screen bezel */}
              <div className="bg-[#1a1a1a] rounded-t-xl pt-3 px-3 pb-0">
                {/* Camera dot */}
                <div className="flex justify-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#2a2a2a] ring-1 ring-[#333]" />
                </div>
                {/* Screen */}
                <div className="bg-white rounded-t-sm overflow-hidden">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#f5f5f5] border-b border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-3 py-0.5 bg-white rounded text-[10px] text-gray-400 border border-gray-200 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        kairo.clinic/dashboard
                      </div>
                    </div>
                  </div>
                  {/* Dashboard content */}
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white" style={{ height: '320px' }}>
                    {/* Sidebar + Main */}
                    <div className="flex gap-3 h-full">
                      {/* Mini Sidebar */}
                      <div className="w-12 bg-white rounded-lg border border-gray-100 p-2 flex flex-col items-center gap-3 flex-shrink-0">
                        <KairoLogo className="w-7 h-7" />
                        <div className="w-7 h-7 bg-[#E6F7F7] rounded-md flex items-center justify-center">
                          <BarChart3 className="w-3.5 h-3.5 text-[#03989E]" />
                        </div>
                        <div className="w-7 h-7 hover:bg-gray-50 rounded-md flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div className="w-7 h-7 hover:bg-gray-50 rounded-md flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div className="w-7 h-7 hover:bg-gray-50 rounded-md flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {[
                            { label: 'Patients', value: '24', color: 'text-[#03989E]', bg: 'bg-[#E6F7F7]' },
                            { label: 'Appointments', value: '18', color: 'text-[#4CBD90]', bg: 'bg-[#E8F8F2]' },
                            { label: 'Pending', value: '6', color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Revenue', value: '$2.8k', color: 'text-blue-600', bg: 'bg-blue-50' },
                          ].map((s) => (
                            <div key={s.label} className={`${s.bg} rounded-lg p-2 text-center`}>
                              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                              <p className="text-[9px] text-gray-500">{s.label}</p>
                            </div>
                          ))}
                        </div>
                        {/* Schedule */}
                        <div className="bg-white rounded-lg border border-gray-100 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold text-gray-900">Today&apos;s Schedule</span>
                            <span className="text-[9px] text-gray-400">Mon, 10 Feb</span>
                          </div>
                          {[
                            { time: '09:00', name: 'Sarah Johnson', type: 'Check-up', c: 'bg-[#03989E]' },
                            { time: '09:30', name: 'David Chen', type: 'Follow-up', c: 'bg-[#4CBD90]' },
                            { time: '10:00', name: 'Maria Garcia', type: 'New Patient', c: 'bg-amber-500' },
                            { time: '10:30', name: 'James Wilson', type: 'Consult', c: 'bg-[#03989E]' },
                            { time: '11:00', name: 'Emma Brown', type: 'Review', c: 'bg-[#4CBD90]' },
                          ].map((a) => (
                            <div key={a.time} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                              <span className="text-[9px] font-mono text-gray-400 w-7">{a.time}</span>
                              <div className={`w-0.5 h-5 rounded-full ${a.c}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-gray-900 truncate">{a.name}</p>
                                <p className="text-[8px] text-gray-400">{a.type}</p>
                              </div>
                              <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center">
                                <ChevronRight className="w-3 h-3 text-gray-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Macbook base/hinge */}
              <div className="relative">
                <div className="bg-gradient-to-b from-[#c0c0c0] to-[#a8a8a8] h-3 rounded-b-sm mx-3" />
                <div className="bg-gradient-to-b from-[#d4d4d4] to-[#b8b8b8] h-2 mx-auto rounded-b-lg" style={{ width: '40%' }} />
              </div>
            </div>

            {/* === IPAD (Right) === */}
            <div className="absolute right-0 sm:right-4 lg:-right-4 top-16 z-30 rotate-2" style={{ width: '220px' }}>
              {/* iPad frame */}
              <div className="bg-[#1a1a1a] rounded-[20px] p-2 shadow-2xl shadow-black/20">
                {/* Camera */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2a2a2a]" />
                {/* Screen */}
                <div className="bg-white rounded-[14px] overflow-hidden" style={{ height: '300px' }}>
                  {/* iPad Header Bar */}
                  <div className="px-3 py-2 bg-[#03989E]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <KairoLogoWhite className="w-3 h-3" />
                        <span className="text-[9px] font-bold text-white">Kairo</span>
                      </div>
                      <span className="text-[8px] text-teal-100">Appointments</span>
                    </div>
                  </div>
                  {/* Appointment List */}
                  <div className="p-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-semibold text-gray-900">Today</span>
                      <div className="px-1.5 py-0.5 bg-[#E6F7F7] rounded text-[7px] text-[#03989E] font-medium">8 slots</div>
                    </div>
                    {[
                      { time: '09:00', name: 'S. Johnson', type: 'Check-up', status: 'Confirmed', sc: 'bg-[#4CBD90]', stc: 'text-[#4CBD90]' },
                      { time: '09:30', name: 'D. Chen', type: 'Follow-up', status: 'Arrived', sc: 'bg-amber-500', stc: 'text-amber-600' },
                      { time: '10:00', name: 'M. Garcia', type: 'New Patient', status: 'Confirmed', sc: 'bg-[#4CBD90]', stc: 'text-[#4CBD90]' },
                      { time: '10:30', name: 'J. Wilson', type: 'Consult', status: 'Booked', sc: 'bg-[#03989E]', stc: 'text-[#03989E]' },
                      { time: '11:00', name: 'E. Brown', type: 'Review', status: 'Booked', sc: 'bg-[#03989E]', stc: 'text-[#03989E]' },
                      { time: '11:30', name: 'R. Taylor', type: 'Follow-up', status: 'Booked', sc: 'bg-[#03989E]', stc: 'text-[#03989E]' },
                    ].map((a) => (
                      <div key={a.time} className="flex items-center gap-2 py-1.5 border-b border-gray-50">
                        <span className="text-[8px] font-mono text-gray-400 w-6">{a.time}</span>
                        <div className={`w-0.5 h-6 rounded-full ${a.sc}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-medium text-gray-900">{a.name}</p>
                          <p className="text-[7px] text-gray-400">{a.type}</p>
                        </div>
                        <span className={`text-[7px] font-medium ${a.stc}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* === IPHONE (Left) === */}
            <div className="absolute left-0 sm:left-4 lg:-left-2 top-24 z-30 -rotate-3" style={{ width: '150px' }}>
              {/* iPhone frame */}
              <div className="bg-[#1a1a1a] rounded-[24px] p-1.5 shadow-2xl shadow-black/20">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-[#1a1a1a] rounded-b-xl z-10" />
                {/* Screen */}
                <div className="bg-white rounded-[20px] overflow-hidden relative" style={{ height: '310px' }}>
                  {/* Status bar */}
                  <div className="px-4 pt-3.5 pb-1 bg-[#03989E]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[7px] text-white font-medium">9:41</span>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-1.5 border border-white rounded-sm">
                          <div className="w-1.5 h-full bg-white rounded-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pb-2">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <KairoLogoWhite className="w-2.5 h-2.5" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-white">Good Morning</p>
                        <p className="text-[7px] text-teal-100">Dr. Moyo</p>
                      </div>
                    </div>
                  </div>
                  {/* Quick Stats */}
                  <div className="px-2 pt-2">
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      <div className="bg-[#E6F7F7] rounded-lg p-1.5 text-center">
                        <p className="text-xs font-bold text-[#03989E]">12</p>
                        <p className="text-[7px] text-gray-500">Today</p>
                      </div>
                      <div className="bg-[#E8F8F2] rounded-lg p-1.5 text-center">
                        <p className="text-xs font-bold text-[#4CBD90]">3</p>
                        <p className="text-[7px] text-gray-500">Waiting</p>
                      </div>
                    </div>
                    {/* Next appointment card */}
                    <div className="bg-gradient-to-r from-[#03989E] to-[#028a8f] rounded-lg p-2 mb-2">
                      <p className="text-[7px] text-teal-200 mb-0.5">NEXT UP</p>
                      <p className="text-[9px] font-semibold text-white">Sarah Johnson</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[7px] text-teal-100">09:00 — Check-up</p>
                        <div className="px-1 py-0.5 bg-white/20 rounded text-[6px] text-white">Room 1</div>
                      </div>
                    </div>
                    {/* Mini list */}
                    <p className="text-[8px] font-semibold text-gray-900 mb-1">Upcoming</p>
                    {[
                      { time: '09:30', name: 'D. Chen', c: 'bg-[#4CBD90]' },
                      { time: '10:00', name: 'M. Garcia', c: 'bg-amber-500' },
                      { time: '10:30', name: 'J. Wilson', c: 'bg-[#03989E]' },
                    ].map((a) => (
                      <div key={a.time} className="flex items-center gap-1.5 py-1 border-b border-gray-50">
                        <div className={`w-0.5 h-4 rounded-full ${a.c}`} />
                        <span className="text-[7px] font-mono text-gray-400">{a.time}</span>
                        <span className="text-[8px] text-gray-700">{a.name}</span>
                      </div>
                    ))}
                  </div>
                  {/* Bottom home indicator */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Subtle label below devices */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Desktop</span>
              <span className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg> Tablet</span>
              <span className="flex items-center gap-1"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg> Mobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Social Proof Bar */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
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

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F7F7] rounded-full text-sm text-[#03989E] font-medium mb-4">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything your practice needs,{' '}
              <span className="text-[#03989E]">all in one place</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From appointment scheduling to clinical notes, Kairo streamlines every aspect of your practice workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Intuitive appointment booking with drag-and-drop, room management, and real-time availability across your whole team.',
                color: 'bg-[#E6F7F7] text-[#03989E]',
              },
              {
                icon: Users,
                title: 'Patient Records',
                description: 'Comprehensive electronic health records with medical history, demographics, allergies, and medications all in one view.',
                color: 'bg-[#E8F8F2] text-[#4CBD90]',
              },
              {
                icon: FileText,
                title: 'Clinical Notes',
                description: 'Structured consultation templates, SOAP notes, and clinical documentation that saves you time on every patient encounter.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: CreditCard,
                title: 'Billing & Invoicing',
                description: 'Generate invoices, track payments, and manage your practice revenue with integrated billing workflows.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Pill,
                title: 'Prescriptions',
                description: 'Manage pharmacies, generate prescriptions, and maintain a complete medication history for every patient.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: ClipboardList,
                title: 'Forms & Questionnaires',
                description: 'Create custom patient intake forms, consent forms, and health questionnaires with a drag-and-drop builder.',
                color: 'bg-rose-50 text-rose-600',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Real-time insights into patient flow, staff utilisation, appointment trends, and practice performance.',
                color: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: MessageSquare,
                title: 'WhatsApp & SMS Notifications',
                description: 'Reach patients where they are. Send appointment reminders, confirmations, and custom messages via WhatsApp, SMS, or email.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Users,
                title: 'Staff Management',
                description: 'Manage your team with role-based access, individual schedules, and granular permissions for every staff member.',
                color: 'bg-teal-50 text-teal-600',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#03989E]/20 hover:shadow-lg hover:shadow-[#03989E]/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F7F7] rounded-full text-sm text-[#03989E] font-medium mb-4">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Up and running in <span className="text-[#03989E]">under 10 minutes</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
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
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-[#03989E]/30 to-[#03989E]/10" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#03989E] text-white text-xl font-bold mb-4 shadow-lg shadow-[#03989E]/20">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight - Split Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Highlight 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F7F7] rounded-full text-sm text-[#03989E] font-medium mb-4">
                <Clock className="w-4 h-4" />
                Save 2+ Hours Daily
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Less admin, more time for what matters — quality patient care
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
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
                    <CheckCircle className="w-5 h-5 text-[#4CBD90] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#E6F7F7] to-[#E8F8F2] rounded-2xl p-8 relative">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#03989E] rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">New Consultation Note</h4>
                    <p className="text-xs text-gray-500">Sarah Johnson — Follow-up</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Presenting Complaint</p>
                    <p className="text-sm text-gray-700">Persistent headache for 3 days, not responding to paracetamol...</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Examination</p>
                    <p className="text-sm text-gray-700">BP 128/82, Temp 36.8°C, neuro exam NAD...</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Plan</p>
                    <p className="text-sm text-gray-700">Trial of sumatriptan 50mg PRN. Review in 2 weeks...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-gray-900 text-sm">Practice Overview</h4>
                  <span className="text-xs text-gray-400">This Week</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#E6F7F7] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#03989E]">142</p>
                    <p className="text-xs text-gray-600">Appointments</p>
                  </div>
                  <div className="bg-[#E8F8F2] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[#4CBD90]">97%</p>
                    <p className="text-xs text-gray-600">Attendance</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">$18.4k</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">4.9</p>
                    <p className="text-xs text-gray-600">Satisfaction</p>
                  </div>
                </div>
                {/* Mini Bar Chart */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Daily Appointments</p>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-600 font-medium mb-4">
                <BarChart3 className="w-4 h-4" />
                Data-Driven Insights
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
                Understand your practice like never before
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
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
                    <CheckCircle className="w-5 h-5 text-[#4CBD90] mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-[#4CBD90] font-medium mb-4">
              <Shield className="w-4 h-4" />
              Security & Compliance
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Your patient data is{' '}
              <span className="text-[#4CBD90]">safe with us</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Healthcare data demands the highest level of protection. Kairo is built with security at its core.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                icon: Globe,
                title: 'Data Sovereignty',
                description: 'Your data stays in your region. We comply with local healthcare data regulations.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-[#4CBD90]/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#4CBD90]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F7F7] rounded-full text-sm text-[#03989E] font-medium mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Loved by healthcare professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#03989E] to-[#4CBD90] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.split(' ').slice(-1)[0][0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E6F7F7] rounded-full text-sm text-[#03989E] font-medium mb-4">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No hidden fees, no surprises. Pick the plan that fits your practice.
            </p>
            <p className="mt-2 text-sm text-gray-500">
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
                className={`relative p-8 rounded-2xl border ${
                  plan.highlighted
                    ? 'border-[#03989E] bg-white shadow-xl shadow-[#03989E]/10 scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#03989E] text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                <div className="mt-4 mb-6">
                  {plan.price === 'Custom' ? (
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                  )}
                </div>
                <Link
                  href={plan.price === 'Custom' ? 'mailto:ashley@kairo.clinic' : '/register'}
                  className={`block text-center px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-[#03989E] text-white hover:bg-[#027A7F] shadow-lg shadow-[#03989E]/25'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#4CBD90] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Messaging Add-On */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-[#E6F7F7] to-[#E8F8F2] rounded-2xl p-6 sm:p-8 border border-[#03989E]/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#03989E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#03989E]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp &amp; SMS Notifications</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    Add automated appointment reminders, confirmations, and custom patient messages via WhatsApp and SMS.
                    Available on all plans as an optional add-on.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#4CBD90]" />
                      <span className="text-gray-700">Pay-per-message pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#4CBD90]" />
                      <span className="text-gray-700">No monthly minimum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#4CBD90]" />
                      <span className="text-gray-700">WhatsApp + SMS + Email</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#03989E] to-[#027A7F] p-12 sm:p-16 text-center overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4CBD90] rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to transform your practice?
              </h2>
              <p className="mt-4 text-lg text-teal-100 max-w-2xl mx-auto">
                Join healthcare practices that have already made the switch to Kairo.
                Start your free 2-day trial today — no credit card required.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-3.5 bg-white text-[#03989E] text-base font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <RequestDemoButton variant="outline">
                  Request a Demo
                </RequestDemoButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <KairoLogo className="w-9 h-9" />
                <span className="text-xl font-bold">Kairo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Modern practice management software for healthcare professionals. Built to simplify your workflow.
              </p>
              <div className="flex items-center gap-4 mt-5">
                <a href="https://www.facebook.com/profile.php?id=61587922967714" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/kair.osystems/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://x.com/kairosystems" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="X (Twitter)">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/kairo-clinic/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#security" className="text-sm text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><Link href="/legal" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                <li><Link href="/data-processing-agreement" className="text-sm text-gray-400 hover:text-white transition-colors">Data Processing Agreement</Link></li>
                <li><Link href="/patient-consent-form" className="text-sm text-gray-400 hover:text-white transition-colors">Patient Consent Form</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:ashley@kairo.clinic" className="text-sm text-gray-400 hover:text-white transition-colors">
                    ashley@kairo.clinic
                  </a>
                </li>
                <li>
                  <a href="tel:+263785767099" className="text-sm text-gray-400 hover:text-white transition-colors">
                    +263 785 767 099
                  </a>
                </li>
                <li>
                  <a href="mailto:support@kairo.clinic" className="text-sm text-gray-400 hover:text-white transition-colors">
                    support@kairo.clinic
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Kairo Systems. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/legal" className="text-sm text-gray-500 hover:text-white transition-colors">Legal</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieBanner />
    </div>
  );
}
