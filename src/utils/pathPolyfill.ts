export const join = (...args: string[]): string => {
  return args
    .filter((a) => typeof a === 'string' && a.length > 0)
    .join('/')
    .replace(/\/+/g, '/');
};

export const resolve = (...args: string[]): string => {
  return join(...args);
};

export const dirname = (p: string): string => {
  if (!p) return '.';
  const parts = p.split('/').filter(Boolean);
  if (parts.length <= 1) return '.';
  parts.pop();
  return '/' + parts.join('/');
};

export const basename = (p: string, ext?: string): string => {
  if (!p) return '';
  let b = p.split('/').pop() || '';
  if (ext && b.endsWith(ext)) {
    b = b.slice(0, -ext.length);
  }
  return b;
};

export const extname = (p: string): string => {
  if (!p) return '';
  const b = basename(p);
  const idx = b.lastIndexOf('.');
  return idx <= 0 ? '' : b.slice(idx);
};

export const sep = '/';
export const delimiter = ':';

export const posix = {
  join,
  resolve,
  dirname,
  basename,
  extname,
  sep,
  delimiter,
};

export const win32 = posix;

const pathPolyfill = {
  join,
  resolve,
  dirname,
  basename,
  extname,
  sep,
  delimiter,
  posix,
  win32,
  default: {
    join,
    resolve,
    dirname,
    basename,
    extname,
    sep,
    delimiter,
    posix,
    win32,
  },
};

export default pathPolyfill;
