import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { calcDday, calcStatus } from '@/features/visitor/utils';

describe('visitor utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-11T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates status', () => {
    expect(calcStatus('2026-02-10')).toBe('expired');
    expect(calcStatus('2026-02-12')).toBe('active');
  });

  it('calculates d-day', () => {
    expect(calcDday('2026-02-12')).toBe(1);
  });
});
