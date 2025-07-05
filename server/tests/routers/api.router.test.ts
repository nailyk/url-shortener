import { UrlMapping } from "@url-shortener/shared-types";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AliasAlreadyExistsError,
  UrlMappingNotFoundError,
} from "../../src/errors/errors.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";
import apiRouter from "../../src/routers/api.router.js";
import { UrlMappingService } from "../../src/services/urlMappingService.js";

const mockedUrlMappingService: Partial<Record<keyof UrlMappingService, any>> = {
  createShortUrl: vi.fn(),
  getAll: vi.fn(),
  deleteById: vi.fn(),
};

const app = express();
app.use(express.json());
app.use("/api/", apiRouter(mockedUrlMappingService as any), errorHandler);

const createUrlMapping = (body: object) =>
  request(app).post("/api/urls").send(body);
const getUrlMappings = () => request(app).get("/api/urls");
const deleteUrlMapping = (id: number) => request(app).delete(`/api/urls/${id}`);

describe("POST /api/urls", () => {
  const expectValidationError = async (
    body: object,
    expectedError: { path: string; msg: string | RegExp },
  ) => {
    const res = await createUrlMapping(body);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining(expectedError)]),
    );
  };

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
    mockedUrlMappingService.createShortUrl.mockResolvedValue(
      "http://short.ly/myalias",
    );

    const res = await createUrlMapping({
      url: "https://example.com",
      customAlias: "myalias",
      expiresIn: "5m",
    });

    expect(res.status).toBe(200);
    expect(res.body.shortUrl).toBe("http://short.ly/myalias");
    expect(mockedUrlMappingService.createShortUrl).toHaveBeenCalledWith(
      "https://example.com",
      "myalias",
      "5m",
    );
  });

  it("should return 409 if alias already exists", async () => {
    mockedUrlMappingService.createShortUrl.mockRejectedValue(
      new AliasAlreadyExistsError("taken"),
    );

    const res = await createUrlMapping({
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
    id: number,
    alias: string,
    originalUrl: string,
    msFromNow: number,
  ): UrlMapping => {
    const now = new Date();
    return {
      id,
      originalUrl,
      expiresAt: new Date(now.getTime() + msFromNow),
      shortUrl: `${process.env.BASE_URL}/${alias}`,
    };
  };

  it("should return 200 and an empty array", async () => {
    mockedUrlMappingService.getAll.mockResolvedValue([]);

    const res = await getUrlMappings();
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return 200 and a single URL entry", async () => {
    const url = buildUrlEntry(1, "one", "https://one.com", 3600000);
    mockedUrlMappingService.getAll.mockResolvedValue([url]);

    const res = await getUrlMappings();
    expect(res.status).toBe(200);
    expect(res.body).toEqual([JSON.parse(JSON.stringify(url))]);
  });

  it("should return 200 and multiple URL entries", async () => {
    const urls: UrlMapping[] = [
      buildUrlEntry(1, "abc", "https://abc.com", 60000),
      buildUrlEntry(2, "def", "https://def.com", 120000),
    ];
    mockedUrlMappingService.getAll.mockResolvedValue(urls);

    const res = await getUrlMappings();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.parse(JSON.stringify(urls)));
  });
});

describe("DELETE /api/urls/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 204 when deletion is successful", async () => {
    mockedUrlMappingService.deleteById.mockResolvedValue(undefined);

    const res = await deleteUrlMapping(123);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("should return 400 for invalid ID param", async () => {
    const res = await request(app).delete("/api/urls/not-a-number");
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "id", msg: "ID must be an integer" }),
      ]),
    );
  });

  it("should return 404 if the URL mapping does not exist", async () => {
    mockedUrlMappingService.deleteById.mockRejectedValue(
      new UrlMappingNotFoundError(999),
    );

    const res = await deleteUrlMapping(999);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("URL mapping with id 999 does not exist");
  });

  it("should return 500 for unexpected errors", async () => {
    mockedUrlMappingService.deleteById.mockRejectedValue(
      new Error("Unexpected DB failure"),
    );

    const res = await deleteUrlMapping(999);
    expect(res.status).toBe(500);
    console.log(res.body);
    expect(res.body.error).toBe("Internal Server Error");
  });
});
