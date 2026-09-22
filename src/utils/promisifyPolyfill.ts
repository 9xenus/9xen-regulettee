/**
 * Global Browser Polyfill for Node's `util.promisify` and `promisify`.
 * Prevents "TypeError: promisify is not a function" when Node-oriented or bundled dependencies execute in browser context.
 */

// --- Process Polyfill ---
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = {
      cwd: () => '/',
      nextTick: (fn: Function) => setTimeout(fn, 0),
      env: {},
      browser: true,
      platform: 'browser',
      version: 'v18.0.0',
    };
  } else {
    const p = (window as any).process;
    if (typeof p.cwd !== 'function') p.cwd = () => '/';
    if (typeof p.nextTick !== 'function') p.nextTick = (fn: Function) => setTimeout(fn, 0);
  }

  // --- Path Polyfill ---
  if (!(window as any).path || typeof (window as any).path.join !== 'function') {
    const joinFn = (...args: string[]) => args.filter(Boolean).join('/').replace(/\/+/g, '/');
    const resolveFn = (...args: string[]) => joinFn(...args);
    const dirnameFn = (p: string) => {
      if (!p) return '.';
      const parts = p.split('/').filter(Boolean);
      if (parts.length <= 1) return '.';
      parts.pop();
      return '/' + parts.join('/');
    };
    (window as any).path = {
      join: joinFn,
      resolve: resolveFn,
      dirname: dirnameFn,
      basename: (p: string) => p ? p.split('/').pop() || '' : '',
      extname: (p: string) => {
        if (!p) return '';
        const b = p.split('/').pop() || '';
        const idx = b.lastIndexOf('.');
        return idx <= 0 ? '' : b.slice(idx);
      },
      sep: '/',
      delimiter: ':',
      posix: { join: joinFn, resolve: resolveFn, dirname: dirnameFn },
      win32: { join: joinFn, resolve: resolveFn, dirname: dirnameFn },
    };
  }
}

if (typeof globalThis !== 'undefined') {
  if (!(globalThis as any).process) {
    (globalThis as any).process = {
      cwd: () => '/',
      nextTick: (fn: Function) => setTimeout(fn, 0),
      env: {},
      browser: true,
      platform: 'browser',
      version: 'v18.0.0',
    };
  } else {
    const p = (globalThis as any).process;
    if (typeof p.cwd !== 'function') p.cwd = () => '/';
    if (typeof p.nextTick !== 'function') p.nextTick = (fn: Function) => setTimeout(fn, 0);
  }

  // --- Path Polyfill ---
  if (!(globalThis as any).path) {
    (globalThis as any).path = {
      join: (...args: string[]) => args.filter(Boolean).join('/').replace(/\/+/g, '/'),
      resolve: (...args: string[]) => args.filter(Boolean).join('/'),
    };
  }
}

export const isAsyncFunction = (fn: any) => typeof fn === 'function' && fn.constructor?.name === 'AsyncFunction';
export const isDate = (obj: any) => Object.prototype.toString.call(obj) === '[object Date]';

export const types = {
  isAsyncFunction,
  isDate,
};

export const promisify = function (fn: any) {
  if (typeof fn !== 'function') {
    return function () {
      return Promise.resolve(fn);
    };
  }

  return function (...args: any[]) {
    return new Promise((resolve, reject) => {
      try {
        fn(...args, (err: any, result: any) => {
          if (err) return reject(err);
          resolve(result !== undefined ? result : err);
        });
      } catch (e) {
        reject(e);
      }
    });
  };
};

(promisify as any).custom = Symbol.for('nodejs.util.promisify.custom');

export const inherits = function (ctor: any, superCtor: any) {
  if (superCtor) {
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  }
};

export const inspect = function (obj: any) {
  return typeof obj === 'string' ? obj : JSON.stringify(obj);
};

const utilObj = {
  promisify,
  inherits,
  types,
  inspect,
};

const g = (typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}) as any;

if (typeof g.promisify !== 'function') {
  Object.defineProperty(g, 'promisify', {
    value: promisify,
    writable: true,
    configurable: true
  });
}

if (!g.util) {
  g.util = utilObj;
} else {
  g.util.promisify = promisify;
  g.util.inherits = inherits;
  g.util.types = types;
  g.util.inspect = inspect;
}

export default utilObj;
