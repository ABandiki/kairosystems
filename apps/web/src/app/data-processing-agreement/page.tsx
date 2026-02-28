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

export default function DataProcessingAgreementPage() {
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Data Processing Agreement</h1>
          <p className="mt-4 text-lg text-teal-100">Kairo GP Practice Management System</p>
          <p className="mt-2 text-sm text-teal-200">Effective Date: 1 February 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-8">Operated by: Medpro Essentials Ltd</p>

          <p className="text-gray-700 leading-relaxed">
            This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the agreement between the GP Practice (&ldquo;Controller&rdquo;) and Medpro Essentials Ltd (Company Number: 16569098), registered in England and Wales, trading as Kairo (&ldquo;Processor&rdquo;), and sets out the terms on which Kairo processes personal data on behalf of the Practice. This DPA complies with UK GDPR, the Data Protection Act 2018, and the Zimbabwe Data Protection Act.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>&ldquo;Personal Data&rdquo;</strong> means any information relating to an identified or identifiable natural person</li>
            <li><strong>&ldquo;Patient Data&rdquo;</strong> means personal data and protected health information relating to patients of the Practice</li>
            <li><strong>&ldquo;Processing&rdquo;</strong> means any operation performed on personal data including collection, storage, use, and deletion</li>
            <li><strong>&ldquo;Data Breach&rdquo;</strong> means a breach of security leading to accidental or unlawful destruction, loss, alteration, or unauthorised disclosure of personal data</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Scope of Processing</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo processes the following categories of personal data on behalf of the Practice, as detailed in the <Link href="/privacy-policy" className="text-[#03989E] hover:underline">Privacy Policy</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Kairo&apos;s Obligations as Processor</h2>
          <p className="text-gray-700 leading-relaxed">Kairo agrees to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Process personal data only on documented instructions from the Practice, as set out in the Terms &amp; Conditions and this DPA</li>
            <li>Ensure all Kairo staff with access to Practice data are bound by confidentiality obligations</li>
            <li>Implement and maintain appropriate technical and organisational security measures including: bcrypt password hashing, JWT authentication, role-based access control, device fingerprinting and approval, SSL/TLS encryption in transit, multi-tenant data isolation via practiceId scoping</li>
            <li>Not engage sub-processors without the Practice&apos;s knowledge; current sub-processors are listed in the Privacy Policy (Twilio, SMTP provider, PostgreSQL)</li>
            <li>Assist the Practice in responding to data subject rights requests within legally required timeframes</li>
            <li>Notify the Practice of a data breach within 72 hours of becoming aware of it</li>
            <li>Delete or return all personal data upon termination of the subscription, at the Practice&apos;s choice, within 30 days</li>
            <li>Make available all information necessary to demonstrate compliance with this DPA</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Practice&apos;s Obligations as Controller</h2>
          <p className="text-gray-700 leading-relaxed">The Practice agrees to:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Ensure there is a lawful basis for processing patient personal data within Kairo</li>
            <li>Obtain appropriate patient consent for data collection and processing</li>
            <li>Maintain and publish their own Privacy Notice to patients referencing Kairo as a data processor</li>
            <li>Ensure staff are trained on data protection obligations when using Kairo</li>
            <li>Manage device approvals and promptly revoke access for departing staff</li>
            <li>Notify Kairo immediately of any suspected data breach or security incident</li>
            <li>Ensure billing PIN access control is managed appropriately</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Security Measures</h2>
          <p className="text-gray-700 leading-relaxed">Kairo maintains the following security controls:</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.1 Access Controls</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>JWT-based authentication with 7-day token expiry</li>
            <li>Seven defined staff roles with role-based access enforcement</li>
            <li>Device registration, fingerprinting, and mandatory admin approval before access</li>
            <li>Billing PIN protection (bcrypt hashed) for financial data</li>
            <li>Three-layer security: JwtAuthGuard, RolesGuard, DeviceGuard</li>
            <li>Super Admin accounts with 2FA support and separate authentication</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.2 Data Isolation</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>All patient and practice data scoped by practiceId at every database query</li>
            <li>Service layer enforces practiceId from authenticated JWT on all operations</li>
            <li>No cross-practice data access except by authorised Super Admins</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5.3 Encryption</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Passwords and PINs stored as bcrypt hashes &mdash; never in plain text</li>
            <li>Data in transit protected by SSL/TLS via Let&apos;s Encrypt (managed by Nginx)</li>
            <li>Database encryption at rest dependent on infrastructure configuration</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Sub-Processors</h2>
          <p className="text-gray-700 leading-relaxed">
            Kairo currently uses the following sub-processors that may process Practice data. Full details are available in the <Link href="/privacy-policy" className="text-[#03989E] hover:underline">Privacy Policy</Link>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Data Breach Procedure</h2>
          <p className="text-gray-700 leading-relaxed">In the event of a confirmed or suspected data breach:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Kairo will notify the affected Practice within 72 hours</li>
            <li>Notification will include: nature of the breach, approximate number of records affected, likely consequences, and measures taken or proposed</li>
            <li>Kairo will cooperate fully with any investigation and provide all relevant information</li>
            <li>The Practice is responsible for notifying their patients and relevant authorities as required by the Zimbabwe Data Protection Act</li>
            <li>Kairo will maintain a record of all data breaches regardless of whether notification was required</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Audit Rights</h2>
          <p className="text-gray-700 leading-relaxed">The Practice may request evidence of Kairo&apos;s compliance with this DPA, including:</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Security policy documentation</li>
            <li>Records of sub-processor agreements</li>
            <li>Evidence of security control implementation</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Audit requests should be submitted in writing to the contact details below. Kairo may charge a reasonable fee for extensive audit support.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Duration &amp; Termination</h2>
          <p className="text-gray-700 leading-relaxed">
            This DPA is effective for the duration of the subscription agreement. Upon termination, Kairo will delete all Practice data within 30 days unless a longer retention period is required by law. A deletion confirmation will be provided in writing.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            This DPA is governed by the laws of England and Wales. Medpro Essentials Ltd is incorporated in England and Wales (Company Number: 16569098). The parties agree to the exclusive jurisdiction of the courts of England and Wales for any disputes arising from this DPA.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Contact</h2>
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
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link href="/data-processing-agreement" className="text-sm text-white font-medium">DPA</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
