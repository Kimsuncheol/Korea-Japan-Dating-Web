// Use the global mocks from jest.setup.js
import { sendMessage, translateMessage, isChatAccessible } from '@/lib/chatService';

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('is a function', () => {
      expect(typeof sendMessage).toBe('function');
    });
  });

  describe('translateMessage', () => {
    it('translates Hello to Korean', async () => {
      const result = await translateMessage('Hello', 'ko');
      expect(result).toBe('안녕하세요');
    });

    it('translates Hello to Japanese', async () => {
      const result = await translateMessage('Hello', 'ja');
      expect(result).toBe('こんにちは');
    });

    it('returns prefixed text for unknown phrases', async () => {
      const result = await translateMessage('Random text', 'ko');
      expect(result).toContain('[KO]');
    });
  });

  describe('isChatAccessible', () => {
    it('is a function', () => {
      expect(typeof isChatAccessible).toBe('function');
    });
  });
});
