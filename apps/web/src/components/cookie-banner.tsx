'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, ChevronDown, ChevronUp } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const COOKIE_CONSENT_KEY = 'kairo_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'kairo_cookie_preferences';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[9998] transition-opacity duration-300" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-200 overflow-hidden">
          {/* Main content */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#E6F7F7] rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-[#03989E]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">We value your privacy</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to enhance your experience, analyse site traffic, and for marketing purposes.
                  You can choose which cookies you&apos;d like to allow. Necessary cookies are always enabled
                  as they are essential for the site to function.
                </p>
              </div>
            </div>

            {/* Expandable cookie details */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1.5 mt-4 text-sm font-medium text-[#03989E] hover:text-[#027A7F] transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide cookie settings
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Manage cookie preferences
                </>
              )}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                {/* Necessary */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Necessary</p>
                    <p className="text-xs text-gray-500">
                      Essential for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-6 bg-[#03989E] rounded-full opacity-60 cursor-not-allowed">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className="relative w-10 h-6 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: preferences.analytics ? '#03989E' : '#d1d5db' }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
                      style={{ transform: preferences.analytics ? 'translateX(18px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>

                {/* Functional */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Functional</p>
                    <p className="text-xs text-gray-500">
                      Enable enhanced functionality like saved preferences and personalised content.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, functional: !preferences.functional })}
                    className="relative w-10 h-6 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: preferences.functional ? '#03989E' : '#d1d5db' }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
                      style={{ transform: preferences.functional ? 'translateX(18px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Marketing</p>
                    <p className="text-xs text-gray-500">
                      Used to deliver relevant ads and measure campaign effectiveness.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className="relative w-10 h-6 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: preferences.marketing ? '#03989E' : '#d1d5db' }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
                      style={{ transform: preferences.marketing ? 'translateX(18px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 mt-5">
              <button
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Reject All
              </button>
              {showDetails && (
                <button
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-[#03989E] bg-[#E6F7F7] border border-[#03989E]/20 rounded-xl hover:bg-[#d5f0f0] transition-all"
                >
                  Save Preferences
                </button>
              )}
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#03989E] rounded-xl hover:bg-[#027A7F] transition-all shadow-sm"
              >
                Accept All Cookies
              </button>
            </div>

            {/* Privacy policy link */}
            <p className="mt-3 text-xs text-gray-400">
              By using our site, you agree to our{' '}
              <a href="#" className="text-[#03989E] hover:underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="#" className="text-[#03989E] hover:underline">Cookie Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
