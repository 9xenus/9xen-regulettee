/**
 * Browser-safe Polyfill / Stub for `express` module.
 */

export interface Request {
  body?: any;
  params?: any;
  query?: any;
  headers?: Record<string, string>;
  header?: (name: string) => string | undefined;
  get?: (name: string) => string | undefined;
  path?: string;
  url?: string;
  method?: string;
  ip?: string;
}

export interface Response {
  status?: (code: number) => Response;
  json?: (body: any) => Response;
  send?: (body: any) => Response;
  setHeader?: (name: string, value: string) => Response;
  sendFile?: (path: string) => Response;
}

export type NextFunction = (err?: any) => void;

export const Router = () => ({
  get: () => {},
  post: () => {},
  put: () => {},
  delete: () => {},
  use: () => {},
});

const expressPolyfill = {
  Router,
};

export default expressPolyfill;
