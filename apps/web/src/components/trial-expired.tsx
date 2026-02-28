'use client';

import { ShieldX, Mail, Phone, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

function KairoLogo({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kLogoExpired" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#03989E" />
          <stop offset="100%" stopColor="#4CBD90" />
        </linearGradient>
      </defs>
      <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#kLogoExpired)" />
      <rect x="32" y="32" width="448" height="448" rx="96" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="4" />
      <rect x="152" y="136" width="42" height="240" rx="21" fill="white" />
      <rect x="194" y="136" width="42" height="165" rx="21" fill="white" transform="rotate(42, 194, 256)" />
      <rect x="194" y="211" width="42" height="165" rx="21" fill="white" transform="rotate(-42, 194, 256)" />
      <circle cx="358" cy="152" r="22" fill="white" opacity="0.5" />
    </svg>
  );
}

export function TrialExpiredScreen() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <KairoLogo className="w-16 h-16 mx-auto mb-4" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Trial Period Ended
          </h1>

          <p className="text-gray-600 mb-6">
            Your free trial of Kairo has expired. To continue accessing your practice management system, please subscribe to a plan.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact us to subscribe:</h3>
            <div className="space-y-3">
              <a
                href="mailto:ashley@kairo.clinic"
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#03989E] hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 bg-[#E6F7F7] rounded-lg flex items-center justify-center group-hover:bg-[#03989E] transition-colors">
                  <Mail className="w-5 h-5 text-[#03989E] group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Email Us</p>
                  <p className="text-xs text-gray-500">ashley@kairo.clinic</p>
                </div>
              </a>

              <a
                href="tel:+263785767099"
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#03989E] hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 bg-[#E6F7F7] rounded-lg flex items-center justify-center group-hover:bg-[#03989E] transition-colors">
                  <Phone className="w-5 h-5 text-[#03989E] group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Call Us</p>
                  <p className="text-xs text-gray-500">+263 785 767 099</p>
                </div>
              </a>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Your data is safe and will be available once you subscribe.
        </p>
      </div>
    </div>
  );
}
