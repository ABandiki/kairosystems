import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SOAP Notes for GPs: A Complete Guide to Clinical Documentation',
  description:
    'Master the SOAP note format to improve your clinical documentation. A practical guide for general practitioners with structure, examples, and tips for efficient note-taking.',
  alternates: {
    canonical: '/blog/soap-notes-guide-gp',
  },
  openGraph: {
    title: 'SOAP Notes for GPs: Complete Guide',
    description:
      'Master the SOAP note format for better clinical documentation. Practical guide for general practitioners.',
    url: '/blog/soap-notes-guide-gp',
    type: 'article',
  },
  keywords: [
    'SOAP notes template',
    'clinical documentation GP',
    'SOAP note format',
    'medical notes template',
    'clinical notes guide',
    'GP documentation',
  ],
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'SOAP Notes for GPs: A Complete Guide to Clinical Documentation',
            description:
              'Master the SOAP note format to improve your clinical documentation. A practical guide for general practitioners.',
            datePublished: '2026-03-05',
            author: {
              '@type': 'Organization',
              name: 'Kairo',
              url: 'https://kairo.clinic',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Kairo',
              url: 'https://kairo.clinic',
              logo: 'https://kairo.clinic/og-image.png',
            },
            mainEntityOfPage: 'https://kairo.clinic/blog/soap-notes-guide-gp',
          }),
        }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-[#03989E] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Blog
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            SOAP Notes for GPs: A Complete Guide to Clinical Documentation
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime="2026-03-05">March 5, 2026</time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>6 min read</span>
            </div>
          </div>
        </header>

        <div className="prose prose-gray prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed text-lg">
            Good clinical documentation is the foundation of quality patient care. The SOAP note
            format — Subjective, Objective, Assessment, Plan — provides a structured, consistent
            framework that helps general practitioners capture the right information during every
            consultation.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            What Are SOAP Notes?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            SOAP is an acronym that stands for four sections of a clinical note. Each section serves
            a specific purpose, creating a complete picture of the patient encounter. The format was
            developed by Dr. Lawrence Weed in the 1960s and has become the standard for clinical
            documentation worldwide.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            S — Subjective
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This section captures what the patient tells you. It includes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Chief complaint</strong> — The primary reason for the visit, in the patient&apos;s own words</li>
            <li><strong>History of present illness</strong> — Onset, duration, severity, location, and any aggravating or relieving factors</li>
            <li><strong>Review of systems</strong> — Related symptoms the patient reports</li>
            <li><strong>Past medical, family, and social history</strong> — Relevant background information</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            O — Objective
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This section records your clinical findings — the measurable, observable data from your
            examination:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Vital signs</strong> — Blood pressure, heart rate, temperature, respiratory rate, SpO2</li>
            <li><strong>Physical examination findings</strong> — What you observe and measure</li>
            <li><strong>Lab and imaging results</strong> — Any diagnostic test results</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            A — Assessment
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Your clinical judgement based on the subjective and objective information. This includes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Diagnosis or differential diagnoses</strong> — Your clinical impression</li>
            <li><strong>Problem list</strong> — Active and resolved issues</li>
            <li><strong>Clinical reasoning</strong> — Brief rationale for your assessment</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            P — Plan
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The plan outlines next steps for the patient:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Treatment</strong> — Medications prescribed, dosages, and duration</li>
            <li><strong>Investigations</strong> — Any tests or referrals ordered</li>
            <li><strong>Patient education</strong> — Advice and lifestyle recommendations given</li>
            <li><strong>Follow-up</strong> — When the patient should return</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Tips for Efficient SOAP Notes
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Use templates</strong> — Pre-built SOAP templates save time and ensure consistency across all consultations</li>
            <li><strong>Document during the consultation</strong> — Capture notes in real-time rather than reconstructing from memory later</li>
            <li><strong>Be concise but complete</strong> — Include all clinically relevant information without unnecessary detail</li>
            <li><strong>Use digital tools</strong> — Practice management software with built-in SOAP templates can reduce documentation time significantly</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Why Digital SOAP Notes Are Better
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Handwritten notes are time-consuming, difficult to search, and easy to lose. Digital SOAP
            notes in a practice management system give you searchable patient histories, pre-filled
            templates, automatic timestamps, and the ability to review past consultations instantly.
            This saves time during each visit and improves continuity of care.
          </p>

          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-[#E6F7F7] to-white border border-[#03989E]/10">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Write better notes, faster
            </h3>
            <p className="text-gray-600 mb-4">
              Kairo includes built-in SOAP note templates designed for general practitioners.
              Document consultations efficiently with structured fields and searchable patient
              histories.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-[#03989E] text-white text-sm font-semibold rounded-xl hover:bg-[#027A7F] transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
