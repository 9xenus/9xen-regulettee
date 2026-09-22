export interface VerificationRecord {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientRole: 'client' | 'regulator' | 'lawyer_consultant' | 'enterprise_admin' | 'dpo';
  tenantId: string;
  tenantName: string;
  channel: 'EMAIL' | 'SMS' | 'MULTI_FACTOR_HYBRID';
  otpCode: string;
  verificationToken: string;
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'REVOKED' | 'BOUNCED';
  purpose: 'SIGNUP_ACTIVATION' | 'DPO_ATTESTATION' | 'PASSWORDLESS_LOGIN' | 'HIGH_PRIVILEGE_ACTION' | 'PHONE_BINDING';
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  attemptsCount: number;
  maxAttempts: number;
  ipAddress: string;
  smsGateway?: string;
  deliveryStatus: 'DELIVERED' | 'QUEUED' | 'SENDING' | 'FAILED';
  verificationHash: string;
}

export interface VerificationPolicySettings {
  emailVerificationMandatory: boolean;
  smsVerificationMandatory: boolean;
  otpLength: 6 | 8;
  otpType: 'NUMERIC' | 'ALPHANUMERIC' | 'TOTP_RFC6238';
  otpExpiryMinutes: number;
  maxRetryAttempts: number;
  cooldownPeriodSeconds: number;
  allowAdminManualBypass: boolean;
  magicLinkExpiryHours: number;
  smsProvider: 'TWILIO' | 'AWS_SNS' | 'MESSAGEBIRD' | 'SOVEREIGN_GATEWAY';
  smsSenderId: string;
  emailSenderAddress: string;
  emailSenderName: string;
  allowedCountryCodes: string[];
}

export const DEFAULT_VERIFICATION_POLICY: VerificationPolicySettings = {
  emailVerificationMandatory: true,
  smsVerificationMandatory: true,
  otpLength: 6,
  otpType: 'NUMERIC',
  otpExpiryMinutes: 10,
  maxRetryAttempts: 5,
  cooldownPeriodSeconds: 60,
  allowAdminManualBypass: true,
  magicLinkExpiryHours: 24,
  smsProvider: 'TWILIO',
  smsSenderId: 'LEXSHIELD',
  emailSenderAddress: 'verify@regulettee.eu',
  emailSenderName: '9Xen Regulettee Sovereign Auth',
  allowedCountryCodes: ['+49', '+33', '+44', '+1', '+966', '+971', '+65', '+41']
};

export const INITIAL_VERIFICATION_RECORDS: VerificationRecord[] = [
  {
    id: 'VFY-2026-9001',
    recipientId: 'USR-DE-101',
    recipientName: 'Dr. Klaus Lindemann',
    recipientEmail: 'k.lindemann@euro-enclave.eu',
    recipientPhone: '+49 170 9823145',
    recipientRole: 'enterprise_admin',
    tenantId: 'TNT-FRA-01',
    tenantName: 'Frankfurt Financial Enclave GmbH',
    channel: 'EMAIL',
    otpCode: '849201',
    verificationToken: 'lx_vfy_9a8f23c7b12d4e5f',
    status: 'VERIFIED',
    purpose: 'SIGNUP_ACTIVATION',
    createdAt: '2026-08-22 10:15:00',
    expiresAt: '2026-08-22 10:25:00',
    verifiedAt: '2026-08-22 10:17:32',
    attemptsCount: 1,
    maxAttempts: 5,
    ipAddress: '194.12.44.18 (Frankfurt, DE)',
    smsGateway: 'TWILIO',
    deliveryStatus: 'DELIVERED',
    verificationHash: '0x9a8f23c7b12d4e5f6a7b8c9d0e1f2a3b'
  },
  {
    id: 'VFY-2026-9002',
    recipientId: 'USR-FR-204',
    recipientName: 'Camille Dubois',
    recipientEmail: 'c.dubois@anssi-secure.fr',
    recipientPhone: '+33 6 12 34 56 78',
    recipientRole: 'regulator',
    tenantId: 'TNT-PAR-02',
    tenantName: 'French Data Protection Taskforce',
    channel: 'SMS',
    otpCode: '517392',
    verificationToken: 'lx_vfy_33445566778899aa',
    status: 'PENDING',
    purpose: 'HIGH_PRIVILEGE_ACTION',
    createdAt: '2026-08-22 14:40:00',
    expiresAt: '2026-08-22 14:50:00',
    attemptsCount: 0,
    maxAttempts: 5,
    ipAddress: '185.24.12.90 (Paris, FR)',
    smsGateway: 'MESSAGEBIRD',
    deliveryStatus: 'DELIVERED',
    verificationHash: '0x33445566778899aabbccddeeff001122'
  },
  {
    id: 'VFY-2026-9003',
    recipientId: 'USR-SA-308',
    recipientName: 'Tariq Al-Ghamdi',
    recipientEmail: 't.ghamdi@sdaia-residency.sa',
    recipientPhone: '+966 50 123 4567',
    recipientRole: 'dpo',
    tenantId: 'TNT-RUH-03',
    tenantName: 'Saudi National Data Sovereignty Hub',
    channel: 'MULTI_FACTOR_HYBRID',
    otpCode: '903481',
    verificationToken: 'lx_vfy_abcdef0123456789',
    status: 'VERIFIED',
    purpose: 'DPO_ATTESTATION',
    createdAt: '2026-08-22 13:00:00',
    expiresAt: '2026-08-22 13:10:00',
    verifiedAt: '2026-08-22 13:02:11',
    attemptsCount: 1,
    maxAttempts: 5,
    ipAddress: '212.118.142.10 (Riyadh, SA)',
    smsGateway: 'SOVEREIGN_GATEWAY',
    deliveryStatus: 'DELIVERED',
    verificationHash: '0xabcdef0123456789abcdef01234567'
  },
  {
    id: 'VFY-2026-9004',
    recipientId: 'USR-UK-412',
    recipientName: 'Victoria Sterling',
    recipientEmail: 'v.sterling@lexconsult.co.uk',
    recipientPhone: '+44 7911 123456',
    recipientRole: 'lawyer_consultant',
    tenantId: 'TNT-LON-04',
    tenantName: 'Sterling & Partners Regulatory Legal',
    channel: 'EMAIL',
    otpCode: '319804',
    verificationToken: 'lx_vfy_ffeeddccbbaa9988',
    status: 'EXPIRED',
    purpose: 'SIGNUP_ACTIVATION',
    createdAt: '2026-08-21 09:00:00',
    expiresAt: '2026-08-21 09:10:00',
    attemptsCount: 0,
    maxAttempts: 5,
    ipAddress: '82.165.197.1 (London, UK)',
    smsGateway: 'TWILIO',
    deliveryStatus: 'DELIVERED',
    verificationHash: '0xffeeddccbbaa998877665544332211'
  }
];

// Helper: Generate Random Numeric OTP
export function generateNumericOtp(length: number = 6): string {
  let code = '';
  const digits = '0123456789';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

// Helper: Generate Alphanumeric Security Token
export function generateAlphanumericToken(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Helper: Simulated TOTP (RFC 6238) calculation with 30s period
export function computeSimulatedTotp(secret: string = 'LEXSHIELDSOVEREIGNSECRETKEY2026', period: number = 30): { code: string; secondsRemaining: number; step: number } {
  const now = Math.floor(Date.now() / 1000);
  const step = Math.floor(now / period);
  const secondsRemaining = period - (now % period);
  
  // Deterministic seed simulation based on secret & step
  let hash = 0;
  const combined = `${secret}:${step}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const code = (positiveHash % 1000000).toString().padStart(6, '0');
  
  return { code, secondsRemaining, step };
}

// Storage Helpers
export function loadVerificationRecords(): VerificationRecord[] {
  try {
    const saved = localStorage.getItem('9xen-regulettee_admin_verifications');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load verification records', e);
  }
  return INITIAL_VERIFICATION_RECORDS;
}

export function saveVerificationRecords(records: VerificationRecord[]): void {
  try {
    localStorage.setItem('9xen-regulettee_admin_verifications', JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save verification records', e);
  }
}

export function loadVerificationPolicy(): VerificationPolicySettings {
  try {
    const saved = localStorage.getItem('9xen-regulettee_verification_settings');
    if (saved) {
      return { ...DEFAULT_VERIFICATION_POLICY, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load verification policy', e);
  }
  return DEFAULT_VERIFICATION_POLICY;
}

export function saveVerificationPolicy(policy: VerificationPolicySettings): void {
  try {
    localStorage.setItem('9xen-regulettee_verification_settings', JSON.stringify(policy));
  } catch (e) {
    console.error('Failed to save verification policy', e);
  }
}
