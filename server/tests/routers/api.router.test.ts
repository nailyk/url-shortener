import express from "express";
import request from "supertest";
import { describe, it, beforeEach, expect, vi } from "vitest";
import urlService from "../../src/services/urlService.js";
import apiRouter from "../../src/routers/api.router.js";
import { AliasAlreadyExistsError } from "../../src/errors/errors.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";
import { ShortenedUrlEntry } from "@url-shortener/shared-types";

vi.mock("../../src/services/urlService.js", () => ({
  default: {
    createAlias: vi.fn(),
    getAllShortenedUrls: vi.fn(),
  },
}));

const mockedUrlService = vi.mocked(urlService);

const app = express();
app.use(express.json());
app.use("/api/", apiRouter, errorHandler);

const postShorten = (body: object) => request(app).post("/api/urls").send(body);
const getUrls = () => request(app).get("/api/urls");

const expectValidationError = async (
  body: object,
  expectedError: { path: string; msg: string | RegExp },
) => {
  const res = await postShorten(body);
  expect(res.status).toBe(400);
  expect(res.body.errors).toEqual(
    expect.arrayContaining([expect.objectContaining(expectedError)]),
  );
};

describe("POST /api/urls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BASE_URL = "http://localhost:3000";
  });

  describe("Validation errors", () => {
    it("should return 400 if url is missing", async () => {
      await expectValidationError(
        {},
        { path: "url", msg: "url field is required" },
      );
    });

    it("should return 400 if url is invalid", async () => {
      await expectValidationError(
        { url: "not-a-url" },
        { path: "url", msg: "Invalid URL" },
      );
    });

    it("should return 400 if alias is not alphanumeric", async () => {
      await expectValidationError(
        { url: "https://example.com", customAlias: "bad-alias!" },
        { path: "customAlias", msg: "Alias must be alphanumeric" },
      );
    });

    it("should return 400 if alias is too long", async () => {
      await expectValidationError(
        { url: "https://example.com", customAlias: "a".repeat(21) },
        {
          path: "customAlias",
          msg: "Alias must be at most 20 characters long",
        },
      );
    });

    it("should return 400 if expiresIn is invalid", async () => {
      await expectValidationError(
        { url: "https://example.com", expiresIn: "notaduration" },
        {
          path: "expiresIn",
          msg: expect.stringMatching(
            /Invalid duration format.*"5m", "2h", "1d"/,
          ),
        },
      );
    });
  });

  it("should return 200 and shortUrl for valid input", async () => {
    mockedUrlService.createAlias.mockResolvedValue("abc123");

    const res = await postShorten({
      url: "https://example.com",
      customAlias: "myalias",
      expiresIn: "5m",
    });

    expect(res.status).toBe(200);
    expect(res.body.shortUrl).toBe(`${process.env.BASE_URL}/abc123`);
    expect(mockedUrlService.createAlias).toHaveBeenCalledWith(
      "https://example.com",
      "myalias",
      "5m",
    );
  });

  it("should return 409 if alias already exists", async () => {
    mockedUrlService.createAlias.mockRejectedValue(
      new AliasAlreadyExistsError("taken"),
    );

    const res = await postShorten({
      url: "https://example.com",
      customAlias: "taken",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Alias "taken" already exists');
  });
});

describe("GET /api/urls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const buildUrlEntry = (
    id: string,
    alias: string,
    originalUrl: string,
    msFromNow: number,
  ): ShortenedUrlEntry => {
    const now = new Date();
    return {
      id,
      originalUrl,
      expiresAt: new Date(now.getTime() + msFromNow),
      shortUrl: `${process.env.BASE_URL}/${alias}`,
    };
  };

  it("should return 200 and an empty array", async () => {
    mockedUrlService.getAllShortenedUrls.mockResolvedValue([]);

    const res = await getUrls();
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return 200 and a single URL entry", async () => {
    const url = buildUrlEntry("1", "one", "https://one.com", 3600000);
    mockedUrlService.getAllShortenedUrls.mockResolvedValue([url]);

    const res = await getUrls();
    expect(res.status).toBe(200);
    expect(res.body).toEqual([JSON.parse(JSON.stringify(url))]);
  });

  it("should return 200 and multiple URL entries", async () => {
    const urls: ShortenedUrlEntry[] = [
      buildUrlEntry("1", "abc", "https://abc.com", 60000),
      buildUrlEntry("2", "def", "https://def.com", 120000),
    ];
    mockedUrlService.getAllShortenedUrls.mockResolvedValue(urls);

    const res = await getUrls();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.parse(JSON.stringify(urls)));
  });
});
