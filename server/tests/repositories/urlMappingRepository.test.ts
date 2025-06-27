// urlMappingRepository.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import urlMappingRepository from "../../src/repositories/urlMappingRepository.js";
import { Pool } from "pg";

// Mock the pg Pool
vi.mock("pg", () => {
  const mClient = { query: vi.fn() };
  return { Pool: vi.fn(() => mClient) };
});

const mockedPool = new Pool() as unknown as { query: ReturnType<typeof vi.fn> };

describe("urlMappingRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BASE_URL = "https://short.ly";
  });

  afterEach(() => {
    // Reset any Date.now mock after tests
    vi.restoreAllMocks();
  });

  describe("findByAlias", () => {
    it("returns UrlMapping if found", async () => {
      const fakeRow = {
        id: 1,
        original_url: "https://example.com",
        alias: "abc",
        expires_at: null,
      };
      mockedPool.query.mockResolvedValueOnce({ rows: [fakeRow] });

      const result = await urlMappingRepository.findByAlias("abc");

      expect(mockedPool.query).toHaveBeenCalledWith(
        "SELECT * FROM url_mappings WHERE alias = $1 LIMIT 1",
        ["abc"],
      );
      expect(result).toEqual(fakeRow);
    });

    it("returns null if not found", async () => {
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await urlMappingRepository.findByAlias("missing");

      expect(result).toBeNull();
    });
  });

  describe("doesAliasExist", () => {
    it("returns true if alias exists", async () => {
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await urlMappingRepository.doesAliasExist("abc");

      expect(result).toBe(true);
    });

    it("returns false if alias does not exist", async () => {
      mockedPool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await urlMappingRepository.doesAliasExist("missing");

      expect(result).toBe(false);
    });
  });

  describe("save", () => {
    it("inserts a new url mapping with expiration", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      await urlMappingRepository.save("https://example.com", "abc", 60000);

      expect(mockedPool.query).toHaveBeenCalledWith(
        "INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)",
        ["https://example.com", "abc", new Date(now + 60000)],
      );
    });

    it("inserts a new url mapping without expiration", async () => {
      await urlMappingRepository.save("https://example.com", "abc");

      expect(mockedPool.query).toHaveBeenCalledWith(
        "INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)",
        ["https://example.com", "abc", null],
      );
    });
  });

  describe("getAll", () => {
    it("returns all url mappings formatted", async () => {
      mockedPool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            original_url: "https://example.com",
            alias: "abc",
            expires_at: "2025-01-01T00:00:00.000Z",
          },
          {
            id: 2,
            original_url: "https://test.com",
            alias: "xyz",
            expires_at: null,
          },
        ],
      });

      const result = await urlMappingRepository.getAll();

      expect(result).toEqual([
        {
          id: 1,
          originalUrl: "https://example.com",
          shortUrl: "https://short.ly/abc",
          expiresAt: new Date("2025-01-01T00:00:00.000Z"),
        },
        {
          id: 2,
          originalUrl: "https://test.com",
          shortUrl: "https://short.ly/xyz",
          expiresAt: null,
        },
      ]);
    });
  });
});
