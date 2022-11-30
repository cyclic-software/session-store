import {
  DEFAULT_HASH_KEY,
  DEFAULT_TTL,
  DEFAULT_TOUCH_INTERVAL,
  DEFAULT_KEEP_EXPIRED_POLICY,
} from '../src/constants';

describe('constants', () => {
  it('should have all the constants', () => {
    expect(DEFAULT_TOUCH_INTERVAL).toBeDefined();
    expect(DEFAULT_TTL).toBeDefined();
    expect(DEFAULT_HASH_KEY).toBeDefined();
    expect(DEFAULT_KEEP_EXPIRED_POLICY).toBeDefined();
  });
});
