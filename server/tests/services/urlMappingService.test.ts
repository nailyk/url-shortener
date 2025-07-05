import { Alias, OriginalUrl } from "@url-shortener/shared-types";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import {
  AliasAlreadyExistsError,
  AliasDoesNotExistError,
  AliasIsExpiredError,
  UrlMappingNotFoundError,
} from "../../src/errors/errors.js";
import { UrlMappingCacheRepository } from "../../src/repositories/urlMappingCacheRepository.js";
import { UrlMappingDbRepository } from "../../src/repositories/urlMappingDbRepository.js";
import { UrlMappingService } from "../../src/services/urlMappingService.js";

describe("UrlMappingService", () => {
  let service: UrlMappingService;
  let mockDbRepo: Partial<UrlMappingDbRepository>;
  let mockCacheRepo: Partial<UrlMappingCacheRepository>;
  const baseUrl = "https://short.url";

  beforeEach(() => {
    mockDbRepo = {
      doesAliasExist: vi.fn(),
      save: vi.fn(),
      findByAlias: vi.fn(),
      getAll: vi.fn(),
      findById: vi.fn(),
      deleteById: vi.fn(),
    };

    mockCacheRepo = {
      cacheUrlMapping: vi.fn(),
      getOriginalUrl: vi.fn(),
      incr: vi.fn(),
      deleteUrlMapping: vi.fn(),
    };

    service = new UrlMappingService(
      mockDbRepo as UrlMappingDbRepository,
      mockCacheRepo as UrlMappingCacheRepository,
      baseUrl,
    );
  });

  describe("createShortUrl", () => {
    it("should create a short URL with generated alias", async () => {
      const originalUrl = "https://example.com" as OriginalUrl;
      (mockDbRepo.doesAliasExist as Mock).mockResolvedValue(false);
      (mockCacheRepo.incr as Mock).mockResolvedValue(1);
      (mockDbRepo.save as Mock).mockResolvedValue(undefined);

      const result = await service.createShortUrl(originalUrl);

      expect(result).toMatch(/^https:\/\/short\.url\/[a-zA-Z0-9]+$/);
      expect(mockDbRepo.save).toHaveBeenCalledWith(
        originalUrl,
        expect.any(String),
        undefined,
      );
    });

    it("should create a short URL with custom alias", async () => {
      const originalUrl = "https://example.com" as OriginalUrl;
      const customAlias = "custom" as Alias;
      (mockDbRepo.doesAliasExist as Mock).mockResolvedValue(false);

      const result = await service.createShortUrl(originalUrl, customAlias);

      expect(result).toBe("https://short.url/custom");
      expect(mockDbRepo.save).toHaveBeenCalledWith(
        originalUrl,
        customAlias,
        undefined,
      );
    });

    it("should throw error if custom alias exists", async () => {
      const originalUrl = "https://example.com" as OriginalUrl;
      const customAlias = "existing" as Alias;
      (mockDbRepo.doesAliasExist as Mock).mockResolvedValue(true);

      await expect(
        service.createShortUrl(originalUrl, customAlias),
      ).rejects.toThrow(AliasAlreadyExistsError);
    });

    it("should handle Redis cache errors gracefully", async () => {
      const originalUrl = "https://example.com" as OriginalUrl;
      (mockDbRepo.doesAliasExist as Mock).mockResolvedValue(false);
      (mockCacheRepo.incr as Mock).mockResolvedValue(1);
      (mockCacheRepo.cacheUrlMapping as Mock).mockRejectedValue(
        new Error("Redis error"),
      );

      const result = await service.createShortUrl(originalUrl);

      expect(result).toBeDefined(); // Should still succeed despite Redis error
    });
  });

  describe("resolveOriginalUrl", () => {
    it("should return cached original URL if available", async () => {
      const alias = "abc123" as Alias;
      const originalUrl = "https://example.com" as OriginalUrl;
      (mockCacheRepo.getOriginalUrl as Mock).mockResolvedValue(originalUrl);

      const result = await service.resolveOriginalUrl(alias);

      expect(result).toBe(originalUrl);
      expect(mockDbRepo.findByAlias).not.toHaveBeenCalled();
    });

    it("should fetch from DB and cache if not in cache", async () => {
      const alias = "abc123" as Alias;
      const originalUrl = "https://example.com" as OriginalUrl;
      const expiresAt = new Date(Date.now() + 3600000);
      (mockCacheRepo.getOriginalUrl as Mock).mockResolvedValue(null);
      (mockDbRepo.findByAlias as Mock).mockResolvedValue({
        originalUrl,
        expiresAt,
      });

      const result = await service.resolveOriginalUrl(alias);

      expect(result).toBe(originalUrl);
      expect(mockCacheRepo.cacheUrlMapping).toHaveBeenCalledWith(
        alias,
        originalUrl,
        expect.any(Number),
      );
    });

    it("should throw error if alias doesn't exist", async () => {
      const alias = "nonexistent" as Alias;
      (mockCacheRepo.getOriginalUrl as Mock).mockResolvedValue(null);
      (mockDbRepo.findByAlias as Mock).mockResolvedValue(null);

      await expect(service.resolveOriginalUrl(alias)).rejects.toThrow(
        AliasDoesNotExistError,
      );
    });

    it("should throw error if alias is expired", async () => {
      const alias = "expired" as Alias;
      const expiresAt = new Date(Date.now() - 3600000);
      (mockCacheRepo.getOriginalUrl as Mock).mockResolvedValue(null);
      (mockDbRepo.findByAlias as Mock).mockResolvedValue({
        originalUrl: "https://example.com" as OriginalUrl,
        expiresAt,
      });

      await expect(service.resolveOriginalUrl(alias)).rejects.toThrow(
        AliasIsExpiredError,
      );
    });
  });

  describe("getAll", () => {
    it("should return all URL mappings with short URLs", async () => {
      const dbMappings = [
        {
          id: 1,
          originalUrl: "https://example.com" as OriginalUrl,
          alias: "abc123" as Alias,
          expiresAt: null,
        },
        {
          id: 2,
          originalUrl: "https://another.com" as OriginalUrl,
          alias: "def456" as Alias,
          expiresAt: new Date(Date.now() + 3600000),
        },
      ];
      (mockDbRepo.getAll as Mock).mockResolvedValue(dbMappings);

      const result = await service.getAll();

      expect(result).toEqual([
        {
          id: 1,
          originalUrl: "https://example.com",
          shortUrl: "https://short.url/abc123",
          expiresAt: null,
        },
        {
          id: 2,
          originalUrl: "https://another.com",
          shortUrl: "https://short.url/def456",
          expiresAt: expect.any(Date),
        },
      ]);
    });
  });

  describe("deleteById", () => {
    it("should delete URL mapping by ID", async () => {
      const id = 1;
      const alias = "abc123" as Alias;
      (mockDbRepo.findById as Mock).mockResolvedValue({
        id,
        alias,
      });

      await service.deleteById(id);

      expect(mockDbRepo.deleteById).toHaveBeenCalledWith(id);
      expect(mockCacheRepo.deleteUrlMapping).toHaveBeenCalledWith(alias);
    });

    it("should throw error if ID doesn't exist", async () => {
      const id = 999;
      (mockDbRepo.findById as Mock).mockResolvedValue(null);

      await expect(service.deleteById(id)).rejects.toThrow(
        UrlMappingNotFoundError,
      );
    });
  });
});
