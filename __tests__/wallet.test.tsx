import { __walletTestUtils } from '@/context/wallet';

describe('wallet security utils', () => {
  it('timingSafeEqual matches equality and rejects different values', () => {
    expect(__walletTestUtils.timingSafeEqual('abc', 'abc')).toBe(true);
    expect(__walletTestUtils.timingSafeEqual('abc', 'abd')).toBe(false);
    expect(__walletTestUtils.timingSafeEqual('abc', 'ab')).toBe(false);
  });

  it('normalizePersistedState applies defaults safely', () => {
    const s = __walletTestUtils.normalizePersistedState({ isLocked: false, failedAttempts: 2 });
    expect(s.v).toBe(2);
    expect(s.isLocked).toBe(false);
    expect(s.failedAttempts).toBe(2);
    expect(typeof s.pinIterations).toBe('number');
  });

  it('derivePinHash is deterministic for same inputs', async () => {
    const h1 = await __walletTestUtils.derivePinHash('123456', 'aabbcc', 10);
    const h2 = await __walletTestUtils.derivePinHash('123456', 'aabbcc', 10);
    const h3 = await __walletTestUtils.derivePinHash('123456', 'ddeeff', 10);
    expect(h1).toEqual(h2);
    expect(h1).not.toEqual(h3);
  });
});
