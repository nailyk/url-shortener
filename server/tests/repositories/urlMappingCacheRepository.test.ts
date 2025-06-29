import { beforeEach, describe, expect, it, vi } from "vitest";
import { UrlMappingCacheRepository } from "../../src/repositories/urlMappingCacheRepository.js";

const mockRedisClient = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  incr: vi.fn(),
  del: vi.fn(),
};

describe("UrlMappingCacheRepository", () => {
  let repo: UrlMappingCacheRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new UrlMappingCacheRepository(mockRedisClient as any);
  });

  describe("getOriginalUrl", () => {
    it("calls redis.get with correct key and returns result", async () => {
      mockRedisClient.get.mockResolvedValueOnce("https://example.com");

      const result = await repo.getOriginalUrl("alias123");

      expect(mockRedisClient.get).toHaveBeenCalledWith("url:alias123");
      expect(result).toBe("https://example.com");
    });
  });

  describe("cacheUrlMapping", () => {
    it("calls redis.setex if expiresInMs provided", async () => {
      await repo.cacheUrlMapping("https://example.com", "alias123", 15000);

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        "url:alias123",
        15, // 15000 ms / 1000 = 15 seconds
        "https://example.com",
      );
      expect(mockRedisClient.set).not.toHaveBeenCalled();
    });

    it("calls redis.set if expiresInMs not provided", async () => {
      await repo.cacheUrlMapping("https://example.com", "alias123");

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "url:alias123",
        "https://example.com",
      );
      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe("incr", () => {
    it("calls redis.incr with the counter key and returns result", async () => {
      mockRedisClient.incr.mockResolvedValueOnce(42);

      const result = await repo.incr();

      expect(mockRedisClient.incr).toHaveBeenCalledWith("url:counter");
      expect(result).toBe(42);
    });
  });

  describe("deleteUrlMapping", () => {
    it("calls redis.del with the correct key", async () => {
      await repo.deleteUrlMapping("alias123");

      expect(mockRedisClient.del).toHaveBeenCalledWith("url:alias123");
    });
  });
});
