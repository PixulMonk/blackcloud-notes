import { Crypto } from '@peculiar/webcrypto';

const crypto = new Crypto();

Object.defineProperty(globalThis, 'crypto', {
  value: crypto,
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'crypto', {
  value: crypto,
  writable: true,
  configurable: true,
});
