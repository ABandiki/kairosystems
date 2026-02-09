/**
 * Device Fingerprinting Utility
 * Generates a unique fingerprint for the device to support practice machine restrictions
 */

interface FingerprintComponents {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  colorDepth: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  canvas?: string;
  webgl?: string;
}

/**
 * Get basic canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw some shapes and text
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('KairoHealth', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device', 4, 17);

    return canvas.toDataURL().slice(-50);
  } catch (e) {
    return '';
  }
}

/**
 * Get WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch (e) {
    return '';
  }
}

/**
 * Collect all fingerprint components
 */
function collectComponents(): FingerprintComponents {
  const components: FingerprintComponents = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}x${screen.availWidth}x${screen.availHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    colorDepth: screen.colorDepth,
  };

  // Optional components (may not be available in all browsers)
  if ('deviceMemory' in navigator) {
    components.deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  }

  if ('hardwareConcurrency' in navigator) {
    components.hardwareConcurrency = navigator.hardwareConcurrency;
  }

  // Canvas and WebGL fingerprints
  if (typeof document !== 'undefined') {
    components.canvas = getCanvasFingerprint();
    components.webgl = getWebGLFingerprint();
  }

  return components;
}

/**
 * Generate a SHA-256 hash of the fingerprint components
 */
async function hashComponents(components: FingerprintComponents): Promise<string> {
  const componentString = JSON.stringify(components);
  const encoder = new TextEncoder();
  const data = encoder.encode(componentString);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Generate a device fingerprint
 * Returns a unique identifier for this device
 */
export async function generateDeviceFingerprint(): Promise<string> {
  try {
    const components = collectComponents();
    const fingerprint = await hashComponents(components);
    return fingerprint;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to a simpler fingerprint
    const fallback = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(fallback);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Get device type based on user agent and screen size
 */
export function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  const width = screen.width;

  if (/tablet|ipad/i.test(ua) || (width > 600 && width <= 1024)) {
    return 'Tablet';
  }
  if (/mobile|android|iphone/i.test(ua) || width <= 600) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Get a friendly device name
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;
  const deviceType = getDeviceType();

  // Try to extract OS info
  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';

  // Try to extract browser info
  let browser = 'Unknown Browser';
  if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edge/i.test(ua)) browser = 'Edge';

  return `${os} ${deviceType} - ${browser}`;
}

/**
 * Store device fingerprint in local storage
 */
export function storeDeviceFingerprint(fingerprint: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('device_fingerprint', fingerprint);
  }
}

/**
 * Get stored device fingerprint
 */
export function getStoredDeviceFingerprint(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('device_fingerprint');
  }
  return null;
}

/**
 * Initialize device fingerprint (generate if not stored)
 */
export async function initDeviceFingerprint(): Promise<string> {
  let fingerprint = getStoredDeviceFingerprint();

  if (!fingerprint) {
    fingerprint = await generateDeviceFingerprint();
    storeDeviceFingerprint(fingerprint);
  }

  return fingerprint;
}
