/**
 * Security utilities: Input sanitization, XSS protection, 
 * timing-safe string comparison, and brute-force rate limiter.
 */

// Maximum failed login attempts allowed before lockout
export const MAX_LOGIN_ATTEMPTS = 5;
// Lockout duration in seconds (1 minute for initial lockout)
export const LOCKOUT_DURATION_SECONDS = 60;
export const ADMIN_SESSION_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

const LOGIN_ATTEMPTS_KEY = 'dimensi_sec_login_attempts_v1';
const LOCKOUT_UNTIL_KEY = 'dimensi_sec_lockout_until_v1';

/**
 * Sanitizes input string to prevent XSS and HTML injection attacks
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input) return '';
  let sanitized = String(input).slice(0, maxLength);
  // Replace HTML special characters with safe equivalents
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  return sanitized;
}

/**
 * Strips potential malicious script tags, event handlers, and javascript: protocols
 */
export function sanitizePlainText(input: string, maxLength = 2000): string {
  if (!input) return '';
  return String(input)
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Timing-safe string comparison to mitigate timing attacks on passwords / passcodes
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const strA = a.trim();
  const strB = b.trim();
  if (strA.length !== strB.length) {
    // Continue loop anyway to avoid leaking length via timing
    let mismatch = 1;
    for (let i = 0; i < strA.length; i++) {
      mismatch |= strA.charCodeAt(i) ^ (strB.charCodeAt(i % (strB.length || 1)) || 0);
    }
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < strA.length; i++) {
    mismatch |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Rate Limiting & Brute-Force defense state helpers
 */
export interface RateLimitStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsCount: number;
}

export function getLoginRateLimitStatus(): RateLimitStatus {
  try {
    const lockoutUntilStr = localStorage.getItem(LOCKOUT_UNTIL_KEY);
    const attemptsStr = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) || 0 : 0;

    if (lockoutUntilStr) {
      const lockoutUntil = parseInt(lockoutUntilStr, 10) || 0;
      const now = Date.now();
      if (now < lockoutUntil) {
        const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
        return { isLocked: true, remainingSeconds, attemptsCount: attempts };
      } else {
        // Lockout expired, reset lockout but keep attempts count until successful login
        localStorage.removeItem(LOCKOUT_UNTIL_KEY);
      }
    }
    return { isLocked: false, remainingSeconds: 0, attemptsCount: attempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
  }
}

export function recordFailedLoginAttempt(): RateLimitStatus {
  try {
    const current = getLoginRateLimitStatus();
    const newCount = current.attemptsCount + 1;
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, String(newCount));

    if (newCount >= MAX_LOGIN_ATTEMPTS) {
      // Exponential or progressive lockout: 60s for 5 attempts, 120s for 6, etc.
      const multiplier = Math.max(1, newCount - MAX_LOGIN_ATTEMPTS + 1);
      const lockDurationMs = LOCKOUT_DURATION_SECONDS * multiplier * 1000;
      const lockoutUntil = Date.now() + lockDurationMs;
      localStorage.setItem(LOCKOUT_UNTIL_KEY, String(lockoutUntil));
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(lockDurationMs / 1000),
        attemptsCount: newCount,
      };
    }
    return { isLocked: false, remainingSeconds: 0, attemptsCount: newCount };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 1 };
  }
}

export function resetLoginAttempts(): void {
  try {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
  } catch {
    // ignore
  }
}
