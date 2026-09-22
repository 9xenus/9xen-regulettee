/**
 * Browser-safe Polyfill for Node.js `fs` module.
 */

export const readFileSync = (path: string, options?: any) => '';
export const writeFileSync = (path: string, data: any, options?: any) => {};
export const existsSync = (path: string) => false;
export const mkdirSync = (path: string, options?: any) => {};
export const readdirSync = (path: string, options?: any) => [];
export const statSync = (path: string) => ({ isDirectory: () => false, isFile: () => true, size: 0 });
export const unlinkSync = (path: string) => {};
export const promises = {
  readFile: async () => '',
  writeFile: async () => {},
  mkdir: async () => {},
  readdir: async () => [],
  stat: async () => ({ isDirectory: () => false, isFile: () => true, size: 0 }),
  unlink: async () => {},
};

const fsPolyfill = {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  promises,
};

export default fsPolyfill;
