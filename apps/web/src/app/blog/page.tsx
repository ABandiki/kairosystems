import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Healthcare Practice Management Insights',
  description:
    'Tips, guides, and insights for running a modern healthcare practice in Zimbabwe. Learn about clinic digitization, reducing no-shows, clinical documentation, and more.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Kairo Blog | Healthcare Practice Management Insights',
    description:
      'Tips, guides, and insights for running a modern healthcare practice in Zimbabwe.',
    url: '/blog',
    type: 'website',
  },
  keywords: [
    'healthcare blog Zimbabwe',
    'practice management tips',
    'clinic digitization',
    'medical practice advice',
    'GP practice management',
  ],
};

const posts = [
  {
    slug: 'digitize-your-clinic-zimbabwe',
    title: 'How to Digitize Your Clinic in Zimbabwe: A Step-by-Step Guide',
    description:
      'Moving from paper-based records to a digital system can transform your practice. Here is a practical guide for Zimbabwean clinics ready to make the switch.',
    date: '2026-03-15',
    readTime: '5 min read',
  },
  {
    slug: 'reduce-no-shows-whatsapp-reminders',
    title: 'How WhatsApp Reminders Can Reduce No-Shows at Your Practice',
    description:
      'No-shows cost clinics time and revenue. Learn how automated WhatsApp appointment reminders help Zimbabwean practices reduce missed appointments by up to 40%.',
    date: '2026-03-10',
    readTime: '4 min read',
  },
  {
    slug: 'soap-notes-guide-gp',
    title: 'SOAP Notes for GPs: A Complete Guide to Clinical Documentation',
    description:
      'Master the SOAP note format to improve your clinical documentation. A practical guide for general practitioners with templates and examples.',
    date: '2026-03-05',
    readTime: '6 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-16">
          <Link
            href="/"
            className="text-sm text-[#03989E] hover:underline mb-6 inline-block"
          >
            &larr; Back to Kairo
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Blog
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Insights and guides for running a modern healthcare practice in
            Zimbabwe.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-[#03989E]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>&middot;</span>
                <span>{post.readTime}</span>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#03989E] transition-colors mb-3">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 leading-relaxed mb-4">
                {post.description}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-sm font-medium text-[#03989E] hover:underline"
              >
                Read more
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
