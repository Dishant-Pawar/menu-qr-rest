/**
 * Security Utilities
 * 
 * Centralized security helpers for authentication, authorization,
 * input sanitization, and data protection.
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 60,
  LOGIN_ATTEMPTS_PER_HOUR: 5,
  MENU_CREATES_PER_DAY: 10,
} as const;

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const;

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate slug format to prevent injection attacks
 */
export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 100;
};

/**
 * Validate UUID format
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Check if user owns a resource
 */
export const checkOwnership = (resourceUserId: string, currentUserId: string): void => {
  if (resourceUserId !== currentUserId) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    });
  }
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: { size: number; type: string },
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): void => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `File size exceeds ${maxSizeMB}MB limit`,
    });
  }

  if (!allowedTypes.includes(file.type)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `File type ${file.type} is not allowed`,
    });
  }
};

/**
 * Sanitize filename to prevent directory traversal
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/\.\./g, '_..') // Replace .. with _.. first (path traversal)
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Then replace other invalid chars
    .substring(0, 255);
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid URL format',
    });
  }
};

/**
 * Prevent SQL injection in raw queries
 */
export const escapeSQL = (value: string): string => {
  return value
    .replace(/[\0\n\r\b\t\\'"\x1a]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '\b': return '\\b';
        case '\t': return '\\t';
        case '\\': return '\\\\';
        case "'": return "\\'";
        case '"': return '\\"';
        case '\x1a': return '\\Z';
        default: return char;
      }
    });
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data: Record<string, any>): Record<string, any> => {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apiKey', 'accessToken'];
  const masked = { ...data };

  for (const key in masked) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      masked[key] = '***REDACTED***';
    }
  }

  return masked;
};

/**
 * Secure random string generator
 */
export const generateSecureToken = (length: number = 32): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 */
export const emailSchema = z.string().email().max(255);

/**
 * Validate phone number format (international)
 */
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

/**
 * Common validation schemas
 */
export const securitySchemas = {
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  uuid: z.string().uuid(),
  url: z.string().url().max(2048),
  filename: z.string().max(255).regex(/^[a-zA-Z0-9._-]+$/),
  text: z.string().max(10000),
  email: emailSchema,
  phone: phoneSchema,
};

/**
 * Check for potential SQL injection patterns
 */
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b)/i,
    /(-{2}|\/\*|\*\/)/,
    /(;|\||&)/,
    /('\s*(OR|AND)\s*')/i,
    /('\s*=\s*')/,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Create audit log (to be implemented with your logging service)
 */
export const createAuditLog = (entry: AuditLogEntry): void => {
  // TODO: Implement actual logging to database or logging service
  console.log('[AUDIT]', JSON.stringify(maskSensitiveData(entry)));
};
