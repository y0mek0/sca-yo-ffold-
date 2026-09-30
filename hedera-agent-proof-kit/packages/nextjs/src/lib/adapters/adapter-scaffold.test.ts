import { describe, expect, it } from 'vitest';
import { buildAdapterTemplate, validateAdapterName, type AdapterKind } from './adapter-scaffold';

describe('validateAdapterName', () => {
  it('accepts snake_case names', () => {
    expect(validateAdapterName('my_adapter')).toBe('my_adapter');
    expect(validateAdapterName('price-alert')).toBe('price-alert');
  });

  it('rejects empty or invalid names', () => {
    expect(() => validateAdapterName('')).toThrow(/name/i);
    expect(() => validateAdapterName('MyAdapter')).toThrow(/name/i);
    expect(() => validateAdapterName('123-start')).toThrow(/name/i);
    expect(() => validateAdapterName('with space')).toThrow(/name/i);
  });
});

describe('buildAdapterTemplate', () => {
  it('returns a full TypeScript template with the right naming', () => {
    const source = buildAdapterTemplate('price-alert', 'ai_decision');
    expect(source).toContain("import { normalizeProofEvent");
    expect(source).toContain("export type PriceAlertInput");
    expect(source).toContain("export function priceAlert(input: PriceAlertInput)");
    expect(source).toContain("kind: 'ai_decision'");
    expect(source).toContain("metadata: { adapter: 'price-alert' }");
    expect(source).toContain("agent:price-alert");
  });
});
