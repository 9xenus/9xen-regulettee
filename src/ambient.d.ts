// Ambient type declarations for optional backend and utility packages
declare module 'archiver';
declare module 'socket.io-client' {
  export type Socket = any;
  export function io(...args: any[]): any;
}
declare module 'drizzle-orm/pg-core' {
  export const pgTable: any;
  export const serial: any;
  export const text: any;
  export const timestamp: any;
  export const integer: any;
  export const boolean: any;
  export const json: any;
  export const jsonb: any;
  export const uuid: any;
  export const varchar: any;
  export const primaryKey: any;
}
declare module 'postgres';
declare module '@prisma/client' {
  export class PrismaClient {
    constructor(...args: any[]);
    [key: string]: any;
  }
}
declare module '@sinclair/typebox' {
  export type Static<T> = any;
  export const Type: any;
}
declare module 'ajv' {
  export default class Ajv {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export type Options = any;
}
declare module 'ajv-formats' {
  export default function addFormats(...args: any[]): any;
}
declare module 'json-rules-engine' {
  export class Engine {
    constructor(...args: any[]);
    [key: string]: any;
  }
}
declare module 'chromadb' {
  export class ChromaClient {
    constructor(...args: any[]);
    [key: string]: any;
  }
}
declare module 'node-cron';
declare module 'tesseract.js';
declare module 'winston';
declare module 'axios' {
  export type AxiosRequestConfig = any;
  export type AxiosResponse<T = any> = any;
  export const AxiosError: any;
  const axios: any;
  export default axios;
}
declare module 'cheerio';
declare module 'winston-transport';
declare module 'supertest';
declare module 'redis';
declare module 'bullmq';
declare module 'ioredis';
declare module 'rxdb';
declare module 'ws';
declare module '@9xen-regulettee/caas-sdk';
declare module '@compliance-engine/node';
declare module '@9xen-regulettee/guardrail-sdk';
declare module 'helmet';
declare module '@aws-sdk/client-kms';
declare module '@aws-sdk/client-s3';

