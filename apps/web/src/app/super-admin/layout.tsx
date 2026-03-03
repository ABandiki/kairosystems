import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Kairo Admin',
    template: '%s | Kairo Admin',
  },
  description: 'Kairo System Administration Dashboard',
  manifest: '/admin.webmanifest',
  icons: {
    icon: [
      { url: '/admin-icon.svg', type: 'image/svg+xml' },
      { url: '/admin-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/admin-apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kairo Admin',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/admin-sw.js', { scope: '/super-admin/' })
                  .then(function(reg) { console.log('Admin SW registered:', reg.scope); })
                  .catch(function(err) { console.log('Admin SW registration failed:', err); });
              });
            }
          `,
        }}
      />
      {children}
    </>
  );
}
