import { describe, expect, it } from 'vitest';
import { isVersionAtLeast } from './version';

describe('isVersionAtLeast', () => {
  it('accepts Node versions equal to or newer than the required version', () => {
    expect(isVersionAtLeast('v20.18.3', '20.18.3')).toBe(true);
    expect(isVersionAtLeast('v22.14.0', '20.18.3')).toBe(true);
    expect(isVersionAtLeast('24.11.1', '20.18.3')).toBe(true);
  });

  it('rejects Node versions older than the required version', () => {
    expect(isVersionAtLeast('v20.18.2', '20.18.3')).toBe(false);
    expect(isVersionAtLeast('v18.20.0', '20.18.3')).toBe(false);
  });
});
