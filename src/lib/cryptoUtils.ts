/**
 * 9Xen Regulettee Cryptographic Utilities
 * 
 * Implements AES-GCM (256-bit) encryption for localStorage data at rest.
 * Uses Web Crypto API for secure key derivation (PBKDF2) and encryption.
 */

const ENCRYPTION_PREFIX = 'ENC_AES_GCM:';
const ITERATIONS = 100000;
const KEY_LEN = 256;
const SALT = new TextEncoder().encode('9xen-regulettee_system_salt_v1');

async function getEncryptionKey(): Promise<CryptoKey> {
  const password = '9xen-regulettee_internal_secure_system_key'; // In prod, this should be derived from user session or secure enclave
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string using AES-GCM
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Combine IV and Encrypted Data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Convert to Base64
    const base64 = btoa(String.fromCharCode(...combined));
    return ENCRYPTION_PREFIX + base64;
  } catch (err) {
    console.error('[CryptoUtils] Encryption failed:', err);
    throw new Error('Encryption failure');
  }
}

/**
 * Decrypts an AES-GCM encrypted string
 */
export async function decryptData(encryptedData: string): Promise<string> {
  if (!encryptedData.startsWith(ENCRYPTION_PREFIX)) {
    return encryptedData; // Not encrypted
  }

  try {
    const key = await getEncryptionKey();
    const base64 = encryptedData.substring(ENCRYPTION_PREFIX.length);
    const combined = new Uint8Array(
      atob(base64).split('').map(char => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('[CryptoUtils] Decryption failed:', err);
    throw new Error('Decryption failure');
  }
}

/**
 * Checks if a string is encrypted with 9Xen Regulettee AES-GCM
 */
export function isEncrypted(data: string | null): boolean {
  if (!data) return false;
  return data.startsWith(ENCRYPTION_PREFIX);
}
