import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How WhatsApp Reminders Can Reduce No-Shows at Your Practice',
  description:
    'No-shows cost clinics time and revenue. Learn how automated WhatsApp appointment reminders help Zimbabwean practices reduce missed appointments and improve patient engagement.',
  alternates: {
    canonical: '/blog/reduce-no-shows-whatsapp-reminders',
  },
  openGraph: {
    title: 'How WhatsApp Reminders Reduce No-Shows',
    description:
      'Learn how automated WhatsApp reminders help Zimbabwean clinics reduce missed appointments by up to 40%.',
    url: '/blog/reduce-no-shows-whatsapp-reminders',
    type: 'article',
  },
  keywords: [
    'WhatsApp appointment reminders',
    'reduce no-shows clinic',
    'patient reminders Zimbabwe',
    'automated appointment notifications',
    'WhatsApp healthcare Zimbabwe',
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
            headline: 'How WhatsApp Reminders Can Reduce No-Shows at Your Practice',
            description:
              'Learn how automated WhatsApp appointment reminders help Zimbabwean practices reduce missed appointments.',
            datePublished: '2026-03-10',
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
            mainEntityOfPage: 'https://kairo.clinic/blog/reduce-no-shows-whatsapp-reminders',
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
            How WhatsApp Reminders Can Reduce No-Shows at Your Practice
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime="2026-03-10">March 10, 2026</time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>4 min read</span>
            </div>
          </div>
        </header>

        <div className="prose prose-gray prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed text-lg">
            Missed appointments are one of the most common challenges facing private healthcare
            practices. Each no-show represents lost revenue, wasted time, and a slot that could have
            been given to another patient. For many Zimbabwean clinics, no-show rates can reach
            20&ndash;30% of scheduled appointments.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Why Patients Miss Appointments
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The most common reasons are simple: patients forget, their schedules change, or they lose
            the appointment card. In many cases, a timely reminder is all it takes to ensure they show
            up. The key is reaching patients through a channel they actually use — and in Zimbabwe,
            that channel is WhatsApp.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Why WhatsApp Works for Zimbabwe
          </h2>
          <p className="text-gray-600 leading-relaxed">
            WhatsApp is the dominant messaging platform in Zimbabwe, with the vast majority of
            smartphone users checking it multiple times daily. Unlike SMS (which can feel impersonal)
            or email (which many patients rarely check), WhatsApp messages are read quickly and feel
            familiar. This makes it the ideal channel for appointment reminders.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            How Automated Reminders Work
          </h2>
          <p className="text-gray-600 leading-relaxed">
            With a practice management system that integrates WhatsApp, reminders are sent
            automatically — no manual effort required from your staff. Here is a typical reminder flow:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Booking confirmation</strong> — Sent immediately when an appointment is scheduled</li>
            <li><strong>24-hour reminder</strong> — Sent the day before the appointment</li>
            <li><strong>Same-day reminder</strong> — Sent a few hours before the appointment</li>
            <li><strong>Custom messages</strong> — Pre-visit instructions, directions, or preparation notes</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            The Impact on Your Practice
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Practices using automated WhatsApp reminders typically see significant reductions in
            no-show rates. Beyond reducing missed appointments, the benefits extend to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 my-4">
            <li><strong>Improved revenue</strong> — More filled appointment slots means more consultations</li>
            <li><strong>Better patient relationships</strong> — Patients appreciate the professional, proactive communication</li>
            <li><strong>Less admin burden</strong> — Staff no longer need to make manual reminder calls</li>
            <li><strong>Fewer last-minute gaps</strong> — Earlier cancellations from reminders allow you to fill slots</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600 leading-relaxed">
            To implement WhatsApp reminders at your practice, you need a practice management system
            with built-in WhatsApp integration. Look for one that handles the automation for you —
            no technical setup required from your end. The system should allow you to customise
            message templates and control when reminders are sent.
          </p>

          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-[#E6F7F7] to-white border border-[#03989E]/10">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Reduce no-shows with Kairo
            </h3>
            <p className="text-gray-600 mb-4">
              Kairo includes WhatsApp & SMS notifications as an add-on for all plans. Set up
              automated reminders in minutes and start reducing missed appointments today.
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
