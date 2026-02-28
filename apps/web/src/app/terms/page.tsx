import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

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

export default function TermsPage() {
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Terms &amp; Conditions</h1>
          <p className="mt-4 text-lg text-teal-100">Kairo GP Practice Management System</p>
          <p className="mt-2 text-sm text-teal-200">Last updated: 28 February 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-8">Operated by: Medpro Essentials Ltd</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between Medpro Essentials Ltd (Company Number: 16569098), registered in England and Wales, trading as &ldquo;Kairo&rdquo; (&ldquo;we&rdquo;, &ldquo;us&rdquo;) and the GP practice or organisation (&ldquo;Practice&rdquo;, &ldquo;you&rdquo;) that registers to use the Kairo platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By registering a practice on Kairo, the Practice Administrator accepts these Terms on behalf of their organisation and all staff members who access the platform. If you do not agree to these Terms, do not use Kairo.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. The Kairo Platform</h2>
          <p className="text-gray-700 leading-relaxed">Kairo is a cloud-based, multi-tenant GP Practice Management System providing:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Patient registration, demographics management, and medical history tracking</li>
            <li>Appointment scheduling with 12 appointment types and room allocation</li>
            <li>Clinical notes and SOAP-format consultation documentation</li>
            <li>Prescription management (acute and repeat) with pharmacy nomination</li>
            <li>Document management (lab results, referrals, discharge summaries, and more)</li>
            <li>Billing and invoice management with manual payment recording</li>
            <li>Staff management across 7 roles with working hours configuration</li>
            <li>Automated appointment reminders via WhatsApp, SMS, and email (optional add-on &mdash; see Section 3)</li>
            <li>In-app notification system</li>
            <li>Practice settings including rooms, appointment types, and pharmacy links</li>
            <li>Forms and questionnaire builder</li>
            <li>Secure device registration and approval workflow</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Subscription Plans &amp; Messaging Add-On</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo is offered on the following subscription tiers. Pricing is in United States Dollars (USD). Kairo reserves the right to modify subscription pricing with 30 days&apos; written notice to registered practices.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.1 WhatsApp &amp; SMS Notifications (Optional Add-On)</h3>
          <p className="text-gray-700 leading-relaxed">
            Kairo offers an optional WhatsApp &amp; SMS Notifications add-on, available on all subscription plans. This add-on enables automated appointment reminders, confirmations, cancellation notices, and custom patient messages via WhatsApp, SMS, and email.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Pricing model:</strong> Pay-per-message. Practices are charged for each WhatsApp or SMS message sent. There is no monthly minimum</li>
            <li><strong>Message costs:</strong> WhatsApp and SMS message rates are based on the underlying third-party provider costs (Twilio) plus a service margin. Current rates will be displayed in the Kairo platform before a practice enables the add-on</li>
            <li><strong>Billing:</strong> Messaging costs are billed monthly in arrears, in addition to the practice&apos;s subscription fee</li>
            <li><strong>Opt-in:</strong> The messaging add-on must be explicitly enabled by the Practice Administrator. It is not included by default in any subscription plan</li>
            <li><strong>Patient consent:</strong> Practices are responsible for obtaining appropriate patient consent before sending WhatsApp or SMS messages. Kairo provides template consent language but the Practice remains the data controller for patient communications</li>
            <li><strong>Message content:</strong> All messages sent via the Kairo platform must relate to legitimate healthcare communications (appointments, reminders, practice updates). Marketing or promotional messages are not permitted</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Kairo uses Twilio as its third-party messaging provider. By enabling the messaging add-on, the Practice acknowledges that patient phone numbers will be transmitted to Twilio for the purpose of delivering WhatsApp and SMS messages. See our <Link href="/privacy-policy" className="text-[#03989E] hover:underline">Privacy Policy</Link> for full details on third-party data processing.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Subscription fees are payable monthly or annually in advance</li>
            <li>Accepted payment methods: cash, bank transfer, EcoCash, OneMoney (as available)</li>
            <li>Invoices unpaid after 14 days will result in account suspension</li>
            <li>Accounts suspended for more than 30 days may be terminated with data export provided</li>
            <li>No refunds are issued for partial months or unused subscription periods</li>
            <li>Kairo does not process patient payments or store card data</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Practice Responsibilities</h2>
          <p className="text-gray-700 leading-relaxed">By subscribing to Kairo, the Practice agrees to:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.1 Data Responsibilities</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Ensure all patient data entered into Kairo is accurate and up to date</li>
            <li>Obtain appropriate patient consent for the collection and processing of their personal and medical data</li>
            <li>Maintain their own data protection and information governance policies</li>
            <li>Train staff on the appropriate use of patient data within Kairo</li>
            <li>Notify patients of how their data is used in accordance with the Zimbabwe Data Protection Act</li>
            <li>Not enter data relating to patients of another practice into your Kairo account</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.2 Security Responsibilities</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Ensure only authorised staff members are registered as system users</li>
            <li>Manage device approvals and promptly revoke access for devices that should no longer be authorised</li>
            <li>Ensure staff protect their login credentials and do not share passwords</li>
            <li>Notify Kairo immediately if you suspect unauthorised access to your account</li>
            <li>Set appropriate billing PIN security and restrict access accordingly</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.3 Clinical Responsibilities</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Kairo is a practice management system &mdash; it is not a substitute for clinical judgement</li>
            <li>All clinical decisions remain the sole responsibility of the registered clinician</li>
            <li>Practices are responsible for the accuracy of clinical notes, prescriptions, and referrals</li>
            <li>Kairo does not validate drug interactions, clinical appropriateness, or prescribing decisions</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Acceptable Use Policy</h2>
          <p className="text-gray-700 leading-relaxed">You agree NOT to use Kairo to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Enter false, misleading, or fraudulent patient or clinical information</li>
            <li>Access data of patients not registered to your practice</li>
            <li>Attempt to access another practice&apos;s data through any means</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the platform</li>
            <li>Use the platform for any unlawful purpose or in violation of any applicable regulation</li>
            <li>Share login credentials between staff members</li>
            <li>Attempt to circumvent device registration or security controls</li>
            <li>Use automated bots, scrapers, or scripts to access the platform</li>
            <li>Upload malicious files, viruses, or harmful code</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            The Kairo platform, including all software, design, branding, documentation, and content, is owned by Medpro Essentials Ltd (Company Number: 16569098) and protected by applicable intellectual property laws including those of England and Wales.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Practices are granted a limited, non-exclusive, non-transferable licence to use Kairo solely for the management of their own GP practice during the subscription period.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Patient data entered by a practice remains the property of that practice. Kairo claims no ownership of patient clinical records.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Data Protection</h2>
          <p className="text-gray-700 leading-relaxed">
            In respect of patient data, the Practice is the data controller and Kairo acts as the data processor. Kairo will:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Process patient data only as instructed by the Practice and as described in the Privacy Policy</li>
            <li>Implement appropriate technical and organisational security measures</li>
            <li>Notify the Practice of any data breach affecting their patient data within 72 hours</li>
            <li>Assist the Practice in responding to data subject access requests</li>
            <li>Delete or return patient data upon termination of the subscription as agreed</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Full details of data handling are set out in the <Link href="/privacy-policy" className="text-[#03989E] hover:underline">Kairo Privacy Policy</Link> and <Link href="/data-processing-agreement" className="text-[#03989E] hover:underline">Data Processing Agreement</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Service Availability</h2>
          <p className="text-gray-700 leading-relaxed">Kairo aims to maintain high platform availability, however:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>We do not guarantee 100% uptime and may perform maintenance with advance notice</li>
            <li>Scheduled maintenance will be communicated via in-app notification where possible</li>
            <li>Emergency maintenance may occur without notice in the case of security incidents</li>
            <li>Kairo is not liable for losses arising from temporary service unavailability</li>
            <li>Data is backed up regularly; however, practices should maintain their own clinical records backups</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">To the maximum extent permitted by applicable law, Medpro Essentials Ltd shall not be liable for:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Any clinical outcomes, misdiagnoses, or patient harm arising from use of the platform</li>
            <li>Loss of patient data due to practice negligence, unauthorised access, or failure to maintain device security</li>
            <li>Indirect, consequential, special, or punitive damages</li>
            <li>Business interruption or loss of revenue</li>
            <li>Any loss arising from reliance on platform-generated reports or statistics</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Our total liability to any practice shall not exceed the total subscription fees paid by that practice in the 12 months preceding the claim.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Termination</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11.1 Termination by Practice</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Practices may cancel their subscription with 30 days&apos; written notice</li>
            <li>Upon cancellation, read-only access will be provided for 30 days for data export</li>
            <li>After 30 days, all practice data will be securely deleted from Kairo servers</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11.2 Termination by Kairo</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Kairo may suspend or terminate accounts immediately for material breach of these Terms</li>
            <li>Material breaches include: non-payment, security violations, unlawful use, or misuse of patient data</li>
            <li>Kairo will provide reasonable notice of termination except in cases of serious breach</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms are governed by the laws of England and Wales. Medpro Essentials Ltd is a company registered in England and Wales (Company Number: 16569098). Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales, without prejudice to any mandatory consumer protection rights applicable in Zimbabwe where services are delivered.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo reserves the right to update these Terms. Practices will be notified via email and in-app notification at least 30 days before material changes take effect. Continued use after the effective date constitutes acceptance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Contact</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Support:</strong> <a href="mailto:support@kairo.clinic" className="text-[#03989E] hover:underline">support@kairo.clinic</a></li>
            <li><strong>Sales &amp; General Enquiries:</strong> <a href="mailto:ashley@kairo.clinic" className="text-[#03989E] hover:underline">ashley@kairo.clinic</a></li>
            <li><strong>Phone:</strong> <a href="tel:+263785767099" className="text-[#03989E] hover:underline">+263 785 767 099</a></li>
            <li><strong>Website:</strong> <a href="https://kairo.clinic" className="text-[#03989E] hover:underline">https://kairo.clinic</a></li>
            <li><strong>Company:</strong> Medpro Essentials Ltd, Registered in England and Wales | Company Number: 16569098</li>
          </ul>
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
              <Link href="/terms" className="text-sm text-white font-medium">Terms &amp; Conditions</Link>
              <Link href="/data-processing-agreement" className="text-sm text-gray-400 hover:text-white transition-colors">DPA</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
