import { Pool } from "pg";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UrlMappingDbRepository } from "../../src/repositories/urlMappingDbRepository.js";

vi.mock("pg", () => {
  const mClient = { query: vi.fn() };
  return { Pool: vi.fn(() => mClient) };
});

const mockedPoolInstance = new Pool() as unknown as {
  query: ReturnType<typeof vi.fn>;
};

let urlMappingRepository: UrlMappingDbRepository;

describe("UrlMappingDbRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BASE_URL = "https://short.ly";
    urlMappingRepository = new UrlMappingDbRepository(
      mockedPoolInstance as unknown as Pool,
    );
  });

  afterEach(() => {
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
      mockedPoolInstance.query.mockResolvedValueOnce({ rows: [fakeRow] });

      const result = await urlMappingRepository.findByAlias("abc");

      expect(mockedPoolInstance.query).toHaveBeenCalledWith(
        "SELECT * FROM url_mappings WHERE alias = $1 LIMIT 1",
        ["abc"],
      );
      expect(result).toEqual({
        id: 1,
        originalUrl: "https://example.com",
        alias: "abc",
        expiresAt: null,
      });
    });

    it("returns null if not found", async () => {
      mockedPoolInstance.query.mockResolvedValueOnce({ rows: [] });

      const result = await urlMappingRepository.findByAlias("missing");

      expect(result).toBeNull();
    });
  });

  describe("doesAliasExist", () => {
    it("returns true if alias exists", async () => {
      mockedPoolInstance.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await urlMappingRepository.doesAliasExist("abc");

      expect(result).toBe(true);
    });

    it("returns false if alias does not exist", async () => {
      mockedPoolInstance.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await urlMappingRepository.doesAliasExist("missing");

      expect(result).toBe(false);
    });
  });

  describe("save", () => {
    it("inserts a new url mapping with expiration", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      await urlMappingRepository.save("https://example.com", "abc", 60000);

      expect(mockedPoolInstance.query).toHaveBeenCalledWith(
        "INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)",
        ["https://example.com", "abc", new Date(now + 60000)],
      );
    });

    it("inserts a new url mapping without expiration", async () => {
      await urlMappingRepository.save("https://example.com", "abc");

      expect(mockedPoolInstance.query).toHaveBeenCalledWith(
        "INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)",
        ["https://example.com", "abc", null],
      );
    });
  });

  describe("getAll", () => {
    it("returns all url mappings formatted", async () => {
      mockedPoolInstance.query.mockResolvedValueOnce({
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
          alias: "abc",
          expiresAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          originalUrl: "https://test.com",
          alias: "xyz",
          expiresAt: null,
        },
      ]);
    });
  });
});
