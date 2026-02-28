/* eslint-disable @next/next/no-img-element */
export default function BrandPreview() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Kairo Brand Concepts</h1>
        <p className="text-lg text-gray-500 mb-12">Three logo directions for your review</p>

        {/* Option A */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#03989E] text-white text-sm font-bold rounded-lg">A</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pulse K — The Heartbeat Mark</h2>
              <p className="text-gray-500">The K with a pulse/heartbeat line on the lower stroke. Ties &quot;Kairos&quot; (right moment) to the rhythm of healthcare.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Icon on gradient */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center">
              <img src="/logo-option-a.svg" alt="Option A" className="w-32 h-32" />
            </div>
            {/* Icon on dark */}
            <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center">
              <img src="/logo-option-a.svg" alt="Option A dark" className="w-32 h-32" />
            </div>
            {/* Icon small */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center gap-4">
              <img src="/logo-option-a.svg" alt="Option A 64" className="w-16 h-16" />
              <img src="/logo-option-a.svg" alt="Option A 40" className="w-10 h-10" />
              <img src="/logo-option-a.svg" alt="Option A 24" className="w-6 h-6" />
            </div>
            {/* Wordmark */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-center col-span-1">
              <img src="/wordmark-a.svg" alt="Wordmark A" className="w-full" />
            </div>
          </div>
          {/* In-context mockup */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">In Context — Nav Bar</p>
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <img src="/logo-option-a.svg" alt="Nav A" className="w-9 h-9 rounded-lg" />
                <span className="text-xl font-bold text-gray-900">Kairo</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Features</span>
                <span>Pricing</span>
                <span>Security</span>
                <span className="px-4 py-2 bg-[#03989E] text-white rounded-lg text-sm font-medium">Get Started</span>
              </div>
            </div>
          </div>
        </section>

        {/* Option B */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#03989E] text-white text-sm font-bold rounded-lg">B</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Geometric K — The Clean Mark</h2>
              <p className="text-gray-500">Minimal geometric K with accent dot. The dot carries across to the &quot;i&quot; in &quot;kairo&quot; for brand consistency.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center">
              <img src="/logo-option-b.svg" alt="Option B" className="w-32 h-32" />
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center">
              <img src="/logo-option-b.svg" alt="Option B dark" className="w-32 h-32" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center gap-4">
              <img src="/logo-option-b.svg" alt="Option B 64" className="w-16 h-16" />
              <img src="/logo-option-b.svg" alt="Option B 40" className="w-10 h-10" />
              <img src="/logo-option-b.svg" alt="Option B 24" className="w-6 h-6" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-center">
              <img src="/wordmark-b.svg" alt="Wordmark B" className="w-full" />
            </div>
          </div>
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">In Context — Nav Bar</p>
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <img src="/logo-option-b.svg" alt="Nav B" className="w-9 h-9 rounded-lg" />
                <span className="text-xl font-bold text-gray-900">Kairo</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Features</span>
                <span>Pricing</span>
                <span>Security</span>
                <span className="px-4 py-2 bg-[#03989E] text-white rounded-lg text-sm font-medium">Get Started</span>
              </div>
            </div>
          </div>
        </section>

        {/* Option C */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#03989E] text-white text-sm font-bold rounded-lg">C</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stethoscope K — The Medical Mark</h2>
              <p className="text-gray-500">The lower stroke of the K curves into stethoscope tubing with a chest piece. Unmistakably healthcare.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center">
              <img src="/logo-option-c.svg" alt="Option C" className="w-32 h-32" />
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 flex items-center justify-center">
              <img src="/logo-option-c.svg" alt="Option C dark" className="w-32 h-32" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center gap-4">
              <img src="/logo-option-c.svg" alt="Option C 64" className="w-16 h-16" />
              <img src="/logo-option-c.svg" alt="Option C 40" className="w-10 h-10" />
              <img src="/logo-option-c.svg" alt="Option C 24" className="w-6 h-6" />
            </div>
            {/* No separate wordmark for C, use icon + text */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-center gap-3">
              <img src="/logo-option-c.svg" alt="C icon" className="w-14 h-14" />
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">kairo</p>
                <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase mt-1">Modern Care Starts Here</p>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">In Context — Nav Bar</p>
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <img src="/logo-option-c.svg" alt="Nav C" className="w-9 h-9 rounded-lg" />
                <span className="text-xl font-bold text-gray-900">Kairo</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Features</span>
                <span>Pricing</span>
                <span>Security</span>
                <span className="px-4 py-2 bg-[#03989E] text-white rounded-lg text-sm font-medium">Get Started</span>
              </div>
            </div>
          </div>
        </section>

        {/* Colour Palette Reference */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Colour Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Kairo Teal', hex: '#03989E', text: 'white' },
              { name: 'Teal Dark', hex: '#027A7F', text: 'white' },
              { name: 'Kairo Green', hex: '#4CBD90', text: 'white' },
              { name: 'Teal Light', hex: '#E6F7F7', text: '#03989E' },
              { name: 'Green Light', hex: '#E8F8F2', text: '#4CBD90' },
              { name: 'Ink', hex: '#111827', text: 'white' },
              { name: 'Slate', hex: '#6B7280', text: 'white' },
              { name: 'Mist', hex: '#F9FAFB', text: '#6B7280' },
              { name: 'Coral', hex: '#EF4444', text: 'white' },
              { name: 'Sunrise', hex: '#F59E0B', text: 'white' },
            ].map((c) => (
              <div key={c.name} className="rounded-xl overflow-hidden border border-gray-200">
                <div className="h-20" style={{ backgroundColor: c.hex }} />
                <div className="p-3 bg-white">
                  <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Side by side comparison */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Side by Side — App Sidebar</h2>
          <div className="grid grid-cols-3 gap-6">
            {['a', 'b', 'c'].map((opt) => (
              <div key={opt} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-white border-r border-gray-200 p-4 w-full">
                  <div className="flex items-center gap-2.5 mb-6">
                    <img src={`/logo-option-${opt}.svg`} alt={`Option ${opt}`} className="w-9 h-9 rounded-lg" />
                    <span className="text-lg font-bold text-gray-900">Kairo</span>
                  </div>
                  <div className="space-y-1">
                    {['Dashboard', 'Appointments', 'Patients', 'Notes', 'Billing'].map((item, i) => (
                      <div key={item} className={`px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-[#E6F7F7] text-[#03989E] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current vs New comparison */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Logo vs New Options</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <img src="/favicon.svg" alt="Current" className="w-24 h-24 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Current</p>
              <p className="text-xs text-gray-400">Medical cross</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-[#03989E]/20 p-8 text-center">
              <img src="/logo-option-a.svg" alt="A" className="w-24 h-24 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">Option A</p>
              <p className="text-xs text-gray-400">Pulse K</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-[#03989E]/20 p-8 text-center">
              <img src="/logo-option-b.svg" alt="B" className="w-24 h-24 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">Option B</p>
              <p className="text-xs text-gray-400">Geometric K</p>
            </div>
            <div className="bg-white rounded-2xl border-2 border-[#03989E]/20 p-8 text-center">
              <img src="/logo-option-c.svg" alt="C" className="w-24 h-24 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">Option C</p>
              <p className="text-xs text-gray-400">Stethoscope K</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
