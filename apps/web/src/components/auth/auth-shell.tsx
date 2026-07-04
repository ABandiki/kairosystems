import Image from 'next/image';
import Link from 'next/link';

/* Shared dark two-column shell for the auth pages (login, register,
   forgot-password). Left: photo hero with brand + optional step list.
   Right: whatever form the page renders as children. */

// Shared field styles so every auth form matches
export const authLabel = 'text-sm font-medium text-white';
export const authInput =
  'w-full bg-[#1A1A1A] border-none rounded-xl h-11 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 transition-shadow';
export const authPrimaryBtn =
  'w-full h-12 inline-flex items-center justify-center gap-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none';
export const authSecondaryBtn =
  'inline-flex items-center justify-center gap-2 h-11 px-5 bg-black border border-white/10 text-sm font-medium text-white rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50';
export const authError =
  'flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20';

function KairoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kAuthLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#03989E" />
          <stop offset="100%" stopColor="#4CBD90" />
        </linearGradient>
      </defs>
      <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#kAuthLogo)" />
      <rect x="152" y="136" width="42" height="240" rx="21" fill="white" />
      <rect x="194" y="136" width="42" height="165" rx="21" fill="white" transform="rotate(42, 194, 256)" />
      <rect x="194" y="211" width="42" height="165" rx="21" fill="white" transform="rotate(-42, 194, 256)" />
      <circle cx="358" cy="152" r="22" fill="white" opacity="0.5" />
    </svg>
  );
}

export function StepItem({
  number,
  text,
  active = false,
}: {
  number: number;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-300 ${
        active
          ? 'bg-white text-black border border-white'
          : 'bg-[#1A1A1A] text-white border-none'
      }`}
    >
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 ${
          active ? 'bg-black text-white' : 'bg-white/10 text-white/40'
        }`}
      >
        {number}
      </span>
      <span className={`text-sm font-medium ${active ? '' : 'text-white/60'}`}>{text}</span>
    </div>
  );
}

interface AuthShellProps {
  image: string;
  imageAlt: string;
  heading: string;
  description: string;
  steps?: { number: number; text: string; active?: boolean }[];
  children: React.ReactNode;
}

export function AuthShell({
  image,
  imageAlt,
  heading,
  description,
  steps,
  children,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen w-full bg-black text-white antialiased selection:bg-white/30 p-2 lg:h-screen lg:overflow-hidden lg:p-4 transition-all duration-500">
      {/* Left — photo hero */}
      <div className="hidden lg:flex w-[52%] relative flex-col items-center justify-end pb-24 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="52vw"
          className="object-cover"
        />
        {/* Soft bottom fade so the hero copy stays readable over photos */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-xs space-y-8 animate-in fade-in duration-700">
          <Link
            href="/"
            className="flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-both"
          >
            <KairoMark className="w-8 h-8" />
            <span className="text-xl font-semibold tracking-tight">Kairo</span>
          </Link>

          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
            <h1 className="text-4xl font-medium tracking-tight">{heading}</h1>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </div>

          {steps && steps.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-500 fill-mode-both">
              {steps.map((step) => (
                <StepItem
                  key={step.number}
                  number={step.number}
                  text={step.text}
                  active={step.active}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-xl space-y-8 animate-in fade-in duration-700">
          {/* Mobile-only brand row (left panel is hidden below lg) */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5">
            <KairoMark className="w-8 h-8" />
            <span className="text-xl font-semibold tracking-tight">Kairo</span>
          </Link>

          {children}
        </div>
      </div>
    </main>
  );
}
