/** Shared credential patterns + masking (no dependencies, safe to import anywhere). */

export const SECRET_REGEXES: RegExp[] = [
  /sk-ant-[A-Za-z0-9_-]{16,}/g,
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g,
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /glpat-[A-Za-z0-9_-]{16,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /xox[abprs]-[A-Za-z0-9-]{10,}/g,
  /hf_[A-Za-z0-9]{20,}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g
];

export function maskSecrets(text: string): string {
  let out = text;
  for (const re of SECRET_REGEXES) out = out.replace(re, m => `${m.slice(0, 4)}…[REDACTED]`);
  return out;
}

/** Provider-token formats. (A PEM header alone is NOT here: see PRIVATE_KEY_BODY — redacted/demo headers are common.) */
export const SECRET_TEST = /(sk-ant-[A-Za-z0-9_-]{16,}|sk-(?:proj-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|glpat-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|hf_[A-Za-z0-9]{20,})/;

/** A private key with a real base64 body: inline (with literal \n escapes) or as consecutive PEM lines. */
export const PRIVATE_KEY_BODY = /-----BEGIN [A-Z ]*PRIVATE KEY-----(?:\\n|\s)*[A-Za-z0-9+\/=]{40,}/;
