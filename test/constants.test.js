import {
  DEFAULT_TABLE_NAME,
  DEFAULT_CALLBACK,
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
    expect(DEFAULT_CALLBACK).toBeDefined();
    expect(DEFAULT_TABLE_NAME).toBeDefined();
    expect(DEFAULT_KEEP_EXPIRED_POLICY).toBeDefined();
  });

  it('default callback raises the appropriate error', () =>
    expect(() => {
      DEFAULT_CALLBACK('AN ERROR');
    }).toThrow('AN ERROR'));

  it('default callback raises the appropriate error', () => {
    DEFAULT_CALLBACK(null);
  });
});
