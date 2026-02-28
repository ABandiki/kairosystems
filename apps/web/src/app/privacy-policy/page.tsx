import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

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

export default function PrivacyPolicyPage() {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-lg text-teal-100">Kairo GP Practice Management System</p>
          <p className="mt-2 text-sm text-teal-200">Last updated: 28 February 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-8">Operated by: Medpro Essentials Ltd</p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            Medpro Essentials Ltd (Company Number: 16569098), registered in England and Wales, trading as &ldquo;Kairo&rdquo; (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operates the Kairo GP Practice Management System &mdash; a multi-tenant Software-as-a-Service platform designed for private GP practices in Zimbabwe. This Privacy Policy explains how we collect, use, store, protect, and share personal data and protected health information when you use our platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            As a company registered in England and Wales, we comply with UK GDPR and the Data Protection Act 2018. As Kairo delivers services in Zimbabwe, we also comply with the Zimbabwe Data Protection Act. This Policy applies to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Healthcare practices and their staff who subscribe to Kairo</li>
            <li>Patients whose data is recorded within the system by a registered practice</li>
            <li>Visitors to our website and any related services</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            By using Kairo, you confirm that you have read, understood, and agree to this Privacy Policy. If you are a Practice Administrator, you are responsible for ensuring your staff and patients are informed of this Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Data Controller Information</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo operates as a data processor on behalf of each registered GP practice, which acts as the data controller for their patient data. For platform-level data, Kairo acts as the data controller.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Data We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.1 Practice &amp; Staff Data</h3>
          <p className="text-gray-700 leading-relaxed">When a practice registers and staff members use Kairo, we collect:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Full name, email address, phone number</li>
            <li>Role and professional registration numbers (GMC number for GPs, NMC number for Nurses)</li>
            <li>Password (stored as a bcrypt hash &mdash; never in plain text)</li>
            <li>Device fingerprint, IP address, and browser user agent for security purposes</li>
            <li>Login timestamps and activity logs</li>
            <li>Digital signature (uploaded by clinicians for prescriptions and clinical notes)</li>
            <li>Working hours and scheduling preferences</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.2 Patient Data</h3>
          <p className="text-gray-700 leading-relaxed">GP practices using Kairo record the following patient information:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Personal:</strong> full name, date of birth, gender, title, preferred language</li>
            <li><strong>Contact:</strong> email address, phone number, mobile number, full postal address</li>
            <li><strong>Identification:</strong> Patient number, Zimbabwe National ID</li>
            <li><strong>Medical:</strong> medical history, diagnoses, allergies, surgical history, chronic conditions</li>
            <li><strong>Clinical notes:</strong> SOAP-format consultation notes, examination findings, treatment plans</li>
            <li><strong>Prescriptions:</strong> medication names, dosages, frequencies, quantities, pharmacy details</li>
            <li><strong>Documents:</strong> lab results, referral letters, discharge summaries, scan reports, ECG results, consent forms, FIT notes</li>
            <li><strong>Billing:</strong> invoice history, payment methods, amounts</li>
            <li><strong>Alerts:</strong> allergy alerts, safeguarding alerts, medical alerts, communication preferences</li>
            <li><strong>Emergency contact:</strong> name, phone number, relationship</li>
            <li><strong>Appointments:</strong> appointment history, attendance records, consultation types</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3.3 Automatically Collected Data</h3>
          <p className="text-gray-700 leading-relaxed">We automatically collect:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Device fingerprint for registered device management</li>
            <li>IP addresses for security monitoring and audit logging</li>
            <li>Browser and operating system information</li>
            <li>Session activity and timestamps</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. How We Use Your Data</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.1 Providing Healthcare Services</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Enable GP practices to manage patient records, appointments, and consultations</li>
            <li>Support clinical workflows including prescriptions, referrals, and clinical documentation</li>
            <li>Process billing and invoice management for private practices</li>
            <li>Facilitate automated appointment reminders and confirmations via WhatsApp, SMS (Twilio), and email (SMTP/Nodemailer)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.2 Platform Security &amp; Operations</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Device registration and approval workflow to prevent unauthorised access</li>
            <li>Role-based access control to ensure staff only access appropriate data</li>
            <li>Audit logging of super admin actions for accountability</li>
            <li>Monitoring platform performance and reliability</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4.3 Communications</h3>
          <p className="text-gray-700 leading-relaxed">We send the following communications to patients (on behalf of practices):</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Appointment confirmation and reminder messages via WhatsApp, SMS, and/or email</li>
            <li>Appointment cancellation notices via WhatsApp, SMS, and/or email</li>
            <li>Practice-initiated custom messages using approved templates</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            WhatsApp and SMS messaging is an optional add-on feature. When enabled, patient phone numbers are transmitted to Twilio (our third-party messaging provider) for the purpose of delivering messages. All messages are logged in our MessageLog system with delivery status tracking.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Legal Basis for Processing</h2>
          <p className="text-gray-700 leading-relaxed">
            Medpro Essentials Ltd is registered in England and Wales and operates under UK GDPR and the Data Protection Act 2018. As Kairo delivers services in Zimbabwe, we also comply with the Zimbabwe Data Protection Act. We process personal data under the following legal bases.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo integrates the following third-party services. Each acts as a data sub-processor:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Twilio (WhatsApp &amp; SMS):</strong> Used to deliver WhatsApp messages and SMS to patients. Patient phone numbers and message content are transmitted to Twilio for delivery. Twilio acts as a data sub-processor under their <a href="https://www.twilio.com/en-us/legal/data-protection-addendum" className="text-[#03989E] hover:underline" target="_blank" rel="noopener noreferrer">Data Protection Addendum</a>. Twilio is based in the United States and maintains appropriate safeguards for international data transfers</li>
            <li><strong>SMTP/Nodemailer (Email):</strong> Used to deliver email notifications to patients and practice staff</li>
            <li><strong>DigitalOcean (Hosting):</strong> Cloud infrastructure provider hosting the Kairo platform and database</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            <strong>Note:</strong> No payment card data is transmitted to third parties. Kairo does not integrate a payment processing gateway. All payment transactions are recorded manually by practice staff.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">We retain data for the following periods:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Patient clinical records</strong> (consultations, prescriptions, documents): minimum 7 years from last entry, or until patient reaches age 25 (whichever is longer), in accordance with Zimbabwe medical records regulations</li>
            <li><strong>Staff account data:</strong> retained for the duration of employment plus 3 years</li>
            <li><strong>Audit logs and activity records:</strong> 7 years</li>
            <li><strong>Message logs</strong> (WhatsApp/SMS/email): 2 years</li>
            <li><strong>Billing and invoice records:</strong> 7 years for financial compliance</li>
            <li><strong>Device registration records:</strong> until device is revoked plus 1 year</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Practices are responsible for setting appropriate retention policies for their patient data within the platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Data Security</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.1 Technical Controls</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Password hashing using bcrypt with salt rounds &mdash; passwords are never stored in plain text</li>
            <li>Billing PIN hashing using bcrypt for additional financial data protection</li>
            <li>JWT tokens with 7-day expiry for session management</li>
            <li>Three-layer authentication: JWT validation, role-based access control, device approval</li>
            <li>SSL/TLS encryption in transit via Let&apos;s Encrypt certificates managed by Nginx</li>
            <li>Device fingerprinting and mandatory approval workflow before system access</li>
            <li>Multi-tenant data isolation: all data scoped by practiceId at the database query level</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8.2 Organisational Controls</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Role-based access control with 7 defined roles limiting data access to job requirements</li>
            <li>Super admin activity logging with IP address and timestamp tracking</li>
            <li>Separate Super Admin account model with 2FA support</li>
            <li>Device approval workflow requiring practice administrator authorisation</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">Under the Zimbabwe Data Protection Act and applicable law, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>Access:</strong> Request a copy of personal data we hold about you</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (subject to medical records retention obligations)</li>
            <li><strong>Restriction:</strong> Request we limit processing of your data</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            To exercise any of these rights, contact us at: <a href="mailto:support@kairo.clinic" className="text-[#03989E] hover:underline">support@kairo.clinic</a> or call <a href="tel:+263785767099" className="text-[#03989E] hover:underline">+263 785 767 099</a>
          </p>
          <p className="text-gray-700 leading-relaxed">
            Please note: patient data deletion requests may be limited by legal obligations to retain medical records for the required retention period.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Data Breach Notification</h2>
          <p className="text-gray-700 leading-relaxed">In the event of a personal data breach that poses a risk to individuals, Kairo will:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Notify affected practices within 72 hours of becoming aware of the breach</li>
            <li>Provide details of the nature of the breach, data affected, and likely consequences</li>
            <li>Recommend immediate steps practices should take</li>
            <li>Support practices in their obligations to notify patients where required</li>
            <li>Report to the relevant Zimbabwe regulatory authority as required by law</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Patient data is stored on servers located in our hosting region. Where data is transferred outside Zimbabwe (for example, via Twilio&apos;s WhatsApp and SMS infrastructure), we ensure appropriate safeguards are in place in accordance with the Zimbabwe Data Protection Act. Twilio processes message data in the United States and maintains compliance with applicable data protection frameworks.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo uses essential session cookies for authentication purposes only. No tracking, advertising, or analytics cookies are used. Cookies are required for the platform to function correctly and cannot be disabled without preventing login.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Children&apos;s Data</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo processes data relating to child patients (under 18) as part of normal GP practice operations. This data is subject to the same security controls as adult patient data, and practices are responsible for obtaining appropriate parental or guardian consent in accordance with their clinical and legal obligations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify registered practices by email and via an in-app notification at least 30 days before material changes take effect. Continued use of Kairo after the effective date constitutes acceptance of the updated Policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">15. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">For privacy-related queries, data subject requests, or to report a concern:</p>
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
              <Link href="/privacy-policy" className="text-sm text-white font-medium">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link href="/data-processing-agreement" className="text-sm text-gray-400 hover:text-white transition-colors">DPA</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
