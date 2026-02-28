import Link from 'next/link';
import { ArrowLeft, ClipboardList, Download } from 'lucide-react';

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

export default function PatientConsentFormPage() {
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
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Patient Consent Form</h1>
          <p className="mt-4 text-lg text-teal-100">For Use by Registered Kairo Practices</p>
          <p className="mt-2 text-sm text-teal-200">Effective Date: 1 February 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Notice */}
        <div className="bg-[#E6F7F7] border border-[#03989E]/20 rounded-xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-[#03989E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Reference Document</p>
              <p className="text-sm text-gray-700">
                This is a reference version of the Patient Data Consent Form. Practices should download and print this form for use with patients.
                To request a printable version, contact <a href="mailto:support@kairo.clinic" className="text-[#03989E] hover:underline">support@kairo.clinic</a>.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-8">Operated by: Medpro Essentials Ltd</p>

          <p className="text-gray-700 leading-relaxed">
            This form is to be completed by the patient (or their legal guardian) upon registration at a GP practice using the Kairo Practice Management System. Please read carefully before signing.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">About This Form</h2>
          <p className="text-gray-700 leading-relaxed">
            Your GP practice uses Kairo, a secure practice management system, to manage your medical records, appointments, prescriptions, and communications. This form explains what data we collect, how it is used, and your rights.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Practice Details</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Practice Name</p>
                <div className="h-8 border-b border-gray-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address</p>
                <div className="h-8 border-b border-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Data We Collect About You</h2>
          <p className="text-gray-700 leading-relaxed">Your practice will record the following information about you in the Kairo system:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Full name, date of birth, gender, and title</li>
            <li>Contact details: home address, phone number, mobile number, email address</li>
            <li>National ID number or passport number</li>
            <li>Preferred language and interpreter requirements</li>
            <li>Emergency contact details (name, phone number, relationship)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Medical Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Medical history including chronic conditions, past surgeries, and known allergies</li>
            <li>Consultation notes from each visit (SOAP format: subjective, objective, assessment, plan)</li>
            <li>Prescriptions issued including medication names, dosages, and instructions</li>
            <li>Documents: lab results, referral letters, discharge summaries, scan reports, ECG results</li>
            <li>Clinical alerts: allergy alerts, medical alerts, communication preferences</li>
            <li>Appointment history and attendance records</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Billing Information</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Invoice history and payment records for services received</li>
            <li>Medical aid or insurance membership details (where applicable)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. How Your Data Is Used</h2>
          <p className="text-gray-700 leading-relaxed">Your data is used by the practice for:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Providing and managing your healthcare, including appointments, consultations, and prescriptions</li>
            <li>Maintaining an accurate medical history to support your ongoing care</li>
            <li>Sending appointment confirmation and reminder messages by SMS and/or email</li>
            <li>Processing invoices and payment records for services rendered</li>
            <li>Referring you to other healthcare providers (with your knowledge)</li>
            <li>Meeting our legal obligations under Zimbabwe health and data protection regulations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Who Can See Your Data</h2>
          <p className="text-gray-700 leading-relaxed">Within the Kairo system, access to your data is restricted by role:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>GPs and Nurses:</strong> full access to clinical records, consultations, and prescriptions</li>
            <li><strong>Receptionists:</strong> limited access &mdash; can view basic information and manage appointments</li>
            <li><strong>Practice Managers:</strong> billing and administrative access</li>
            <li><strong>Practice Administrators:</strong> full administrative access for system management</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Kairo&apos;s technical team may access anonymised system data for maintenance purposes only and cannot access clinical record content.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. SMS &amp; Email Communications</h2>
          <p className="text-gray-700 leading-relaxed">Your practice may send you the following communications through Kairo:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Appointment confirmation messages (SMS and/or email)</li>
            <li>Appointment reminder messages (sent approximately 24 hours before your appointment)</li>
            <li>Practice notifications as directed by your GP</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            SMS messages are delivered via Twilio (a third-party service provider). Your phone number and message content are transmitted to Twilio for delivery purposes only.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            Your medical records will be retained for a minimum of 7 years from your last consultation, or until you reach age 25 (whichever is longer), in accordance with Zimbabwean medical records regulations. Billing records are retained for 7 years for financial compliance purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">Under the Zimbabwe Data Protection Act, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Access:</strong> request a copy of the personal data held about you</li>
            <li><strong>Rectification:</strong> request correction of inaccurate information</li>
            <li><strong>Erasure:</strong> request deletion of your data (subject to medical retention obligations)</li>
            <li><strong>Restriction:</strong> request we limit how we process your data</li>
            <li><strong>Objection:</strong> object to certain types of processing</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            To exercise any of these rights, please contact your practice directly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Consent Declaration</h2>
          <p className="text-gray-700 leading-relaxed mb-4">Please tick each box to confirm your consent:</p>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">I consent to my personal and medical data being recorded and stored in the Kairo system by my GP practice.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">I consent to receiving appointment confirmation and reminder messages via SMS and/or email.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">I understand that my data will be accessible to authorised practice staff based on their role, as described above.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 border-2 border-gray-400 rounded mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">I have read and understood the data retention, data usage, and rights information provided in this form.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Signature</h2>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Patient Full Name</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Signature</p>
                <div className="h-16 border-b border-gray-300" />
              </div>

              <p className="text-sm font-medium text-gray-700 mt-6">If signing on behalf of a child or person lacking capacity:</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Guardian/Parent Name</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Relationship</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Guardian Signature</p>
                <div className="h-16 border-b border-gray-300" />
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 border border-gray-200 mt-8">
            <p className="text-sm font-semibold text-gray-700 mb-4">For Office Use Only</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Processed By</p>
                <div className="h-8 border-b border-gray-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date Entered</p>
                <div className="h-8 border-b border-gray-300" />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Kairo Practice Management System | <a href="https://kairo.clinic" className="text-[#03989E] hover:underline">https://kairo.clinic</a> | <a href="mailto:support@kairo.clinic" className="text-[#03989E] hover:underline">support@kairo.clinic</a> | <a href="tel:+263785767099" className="text-[#03989E] hover:underline">+263 785 767 099</a></p>
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
