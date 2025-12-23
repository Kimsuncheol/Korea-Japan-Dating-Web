// Use the global mocks from jest.setup.js
import { createLike, checkMutualLike, getMatches, unmatch, hasLiked } from '@/lib/matchService';

describe('Match Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLike', () => {
    it('should be a function', () => {
      expect(typeof createLike).toBe('function');
    });

    it('returns an object with matched property', async () => {
      const result = await createLike('user1', 'user2');
      expect(result).toHaveProperty('matched');
    });
  });

  describe('checkMutualLike', () => {
    it('is a function', () => {
      expect(typeof checkMutualLike).toBe('function');
    });
  });

  describe('getMatches', () => {
    it('is a function', () => {
      expect(typeof getMatches).toBe('function');
    });

    it('returns an array', async () => {
      const result = await getMatches('user1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('unmatch', () => {
    it('is a function', () => {
      expect(typeof unmatch).toBe('function');
    });
  });

  describe('hasLiked', () => {
    it('is a function', () => {
      expect(typeof hasLiked).toBe('function');
    });
  });
});
