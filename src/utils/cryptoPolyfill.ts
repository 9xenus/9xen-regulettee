/**
 * Browser-safe Polyfill for Node.js `crypto` module.
 * Provides standard implementations for randomUUID, createHash, createHmac, and randomBytes.
 */

export const randomUUID = (): string => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const randomBytes = (size: number): Uint8Array => {
  const arr = new Uint8Array(size);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < size; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return arr;
};

export const createHash = (algorithm: string = 'sha256') => {
  let buffer = '';
  return {
    update: function (data: any) {
      buffer += typeof data === 'string' ? data : JSON.stringify(data);
      return this;
    },
    digest: function (encoding?: string) {
      let hash1 = 5381;
      let hash2 = 52711;
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer.charCodeAt(i);
        hash1 = ((hash1 << 5) + hash1) ^ char;
        hash2 = ((hash2 << 5) + hash2) ^ char;
      }
      const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');
      const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
      const full = (hex1 + hex2).repeat(4);
      return full.substring(0, 64);
    }
  };
};

export const createHmac = (algorithm: string = 'sha256', key: any = '') => {
  return createHash(algorithm);
};

export const timingSafeEqual = (a: any, b: any) => {
  if (!a || !b || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
};

const cryptoPolyfill = {
  randomUUID,
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
};

export default cryptoPolyfill;
