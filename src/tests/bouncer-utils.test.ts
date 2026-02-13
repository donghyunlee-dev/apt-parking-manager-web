import { describe, expect, it } from 'vitest';
import { generateFin, maskFin } from '@/features/bouncer/utils';

describe('bouncer utils', () => {
  it('masks fin number', () => {
    expect(maskFin('123456')).toBe('123***');
  });

  it('generates 6 digit fin', () => {
    const fin = generateFin();
    expect(fin).toMatch(/^[0-9]{6}$/);
  });
});
