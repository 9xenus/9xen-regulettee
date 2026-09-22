/**
 * Form Validation & Input Sanitization Utility
 * Implements strict validation aligned with OWASP Top 10 security standards
 * for emails, passphrases, organization identifiers, and input sanitization.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  if (!email || typeof email !== 'string') {
    errors.push('Email address is required.');
    return { isValid: false, errors };
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    errors.push('Invalid email address format.');
  }
  if (trimmed.length > 254) {
    errors.push('Email address exceeds maximum length of 254 characters.');
  }

  return { isValid: errors.length === 0, errors };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
    return { isValid: false, errors };
  }

  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long (OWASP standard).');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one numeric digit (0-9)./n');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...).');
  }

  return { isValid: errors.length === 0, errors };
}

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateOrganizationName(orgName: string): ValidationResult {
  const errors: string[] = [];
  if (!orgName || orgName.trim().length < 2) {
    errors.push('Organization name must be at least 2 characters long.');
  }
  if (/[<>{}]/.test(orgName)) {
    errors.push('Organization name contains forbidden characters.');
  }
  return { isValid: errors.length === 0, errors };
}
