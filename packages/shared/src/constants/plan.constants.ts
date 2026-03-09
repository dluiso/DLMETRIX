import { PlanTier } from '../types/plan.types';

export const PLAN_LIMITS: Record<PlanTier | 'public', { auditsPerDay: number; historyDays: number }> = {
  public:  { auditsPerDay: 10,  historyDays: 0   },
  free:    { auditsPerDay: 10,  historyDays: 7   },
  pro:     { auditsPerDay: 50,  historyDays: 90  },
  premium: { auditsPerDay: -1,  historyDays: -1  },
};

export const AUDIT_RATE_LIMIT_WINDOW = 24 * 60 * 60; // 24 hours in seconds
export const ANONYMOUS_RATE_LIMIT_PREFIX = 'anon_audits:';
export const USER_RATE_LIMIT_PREFIX = 'user_audits:';
