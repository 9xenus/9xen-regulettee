/**
 * Redis-alternative cache module type shim.
 * `ioredis-mock` mirrors the `ioredis` API (get/set/setex/del/keys/NX-EX locks)
 * and is used as an in-memory Redis replacement when no external Redis is configured.
 */
declare module 'ioredis-mock' {
  import Redis from 'ioredis';
  const ioredisMock: typeof Redis;
  export default ioredisMock;
}