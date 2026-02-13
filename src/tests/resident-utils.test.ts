import { describe, expect, it } from 'vitest';
import { vehicleNumberRegex } from '@/features/resident/utils';

describe('resident utils', () => {
  it('validates vehicle number format', () => {
    expect(vehicleNumberRegex.test('12가3456')).toBe(true);
    expect(vehicleNumberRegex.test('ABC')).toBe(false);
  });
});
