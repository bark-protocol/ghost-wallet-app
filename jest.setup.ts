import '@testing-library/jest-native/extend-expect';

jest.mock('expo-secure-store', () => {
  const store: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (k: string) => (k in store ? store[k] : null)),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      delete store[k];
    }),
  };
});

jest.mock('expo-crypto', () => {
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA256' },
    digestStringAsync: jest.fn(async (_alg: string, input: string) => {
      let hash = 2166136261;
      for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return `mock_sha256_${hash.toString(16)}`;
    }),
    getRandomBytesAsync: jest.fn(async (len: number) => new Uint8Array(Array.from({ length: len }, (_, i) => (i * 17) % 256))),
  };
});
