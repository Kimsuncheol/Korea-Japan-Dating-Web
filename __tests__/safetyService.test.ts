// Use the global mocks from jest.setup.js
import { blockUser, unblockUser, isBlocked, reportUser, REPORT_CATEGORIES } from '@/lib/safetyService';

describe('Safety Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('blockUser', () => {
    it('is a function', () => {
      expect(typeof blockUser).toBe('function');
    });
  });

  describe('unblockUser', () => {
    it('is a function', () => {
      expect(typeof unblockUser).toBe('function');
    });
  });

  describe('isBlocked', () => {
    it('is a function', () => {
      expect(typeof isBlocked).toBe('function');
    });
  });

  describe('reportUser', () => {
    it('is a function', () => {
      expect(typeof reportUser).toBe('function');
    });
  });

  describe('REPORT_CATEGORIES', () => {
    it('contains 5 categories', () => {
      expect(REPORT_CATEGORIES).toHaveLength(5);
    });

    it('includes spam category', () => {
      expect(REPORT_CATEGORIES.find(c => c.value === 'spam')).toBeDefined();
    });

    it('includes harassment category', () => {
      expect(REPORT_CATEGORIES.find(c => c.value === 'harassment')).toBeDefined();
    });

    it('includes inappropriate category', () => {
      expect(REPORT_CATEGORIES.find(c => c.value === 'inappropriate')).toBeDefined();
    });

    it('includes impersonation category', () => {
      expect(REPORT_CATEGORIES.find(c => c.value === 'impersonation')).toBeDefined();
    });

    it('includes other category', () => {
      expect(REPORT_CATEGORIES.find(c => c.value === 'other')).toBeDefined();
    });
  });
});
