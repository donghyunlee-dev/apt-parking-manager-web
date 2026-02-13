import type { AuthSession } from './types';

const DEFAULT_APT_CODE = 'A0001';

export const buildMockSession = (aptName?: string): AuthSession => {
  const resolvedAptName = aptName?.trim() || 'Sample Apartment';

  return {
    token: 'mock-token-local',
    user: {
      bouncer_code: 'BNC-LOCAL',
      bouncer_name: 'Mock Bouncer',
      apt_code: DEFAULT_APT_CODE,
    },
    apartment: {
      apt_code: DEFAULT_APT_CODE,
      apt_name: resolvedAptName,
    },
  };
};
