// urlMappingCacheRepository.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UrlMappingCacheRepository } from "../../src/repositories/urlMappingCacheRepository.js";

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockSetex = vi.fn();
const mockIncr = vi.fn();

const mockRedisClient = {
  get: mockGet,
  set: mockSet,
  setex: mockSetex,
  incr: mockIncr,
};

describe("UrlMappingCacheRepository", () => {
  let repo: UrlMappingCacheRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UrlMappingCacheRepository(mockRedisClient as any);
  });

  describe("getOriginalUrl", () => {
    it("calls redis.get with correct key and returns result", async () => {
      mockGet.mockResolvedValueOnce("https://example.com");

      const result = await repo.getOriginalUrl("alias123");

      expect(mockGet).toHaveBeenCalledWith("url:alias123");
      expect(result).toBe("https://example.com");
    });
  });

  describe("cacheOriginalUrl", () => {
    it("calls redis.setex if expiresInMs provided", async () => {
      await repo.cacheOriginalUrl("https://example.com", "alias123", 15000);

      expect(mockSetex).toHaveBeenCalledWith(
        "url:alias123",
        15, // 15000 ms / 1000 = 15 seconds
        "https://example.com",
      );
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("calls redis.set if expiresInMs not provided", async () => {
      await repo.cacheOriginalUrl("https://example.com", "alias123");

      expect(mockSet).toHaveBeenCalledWith(
        "url:alias123",
        "https://example.com",
      );
      expect(mockSetex).not.toHaveBeenCalled();
    });
  });

  describe("incr", () => {
    it("calls redis.incr with the counter key and returns result", async () => {
      mockIncr.mockResolvedValueOnce(42);

      const result = await repo.incr();

      expect(mockIncr).toHaveBeenCalledWith("url:counter");
      expect(result).toBe(42);
    });
  });
});
