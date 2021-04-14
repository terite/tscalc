declare module 'pako' {
  export function inflate(data: Uint8Array, options: { to: 'string' }): string;
  export function inflate(data: Uint8Array): Uint8Array;
  export function deflate(data: Uint8Array | string): Uint8Array;
}
