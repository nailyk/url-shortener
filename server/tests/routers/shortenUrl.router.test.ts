import express from "express";
import request from "supertest";
import { describe, it, beforeEach, expect, vi } from "vitest";
import urlService from "../../src/services/urlService.js";
import shortenUrlRouter from "../../src/routers/shortenUrl.router.js";
import { AliasAlreadyExistsError } from "../../src/errors/errors.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";

vi.mock("../../src/services/urlService.js", () => ({
  default: {
    createAlias: vi.fn(),
  },
}));

const mockedUrlService = vi.mocked(urlService);

const app = express();
app.use(express.json());
app.use("/api/shorten", shortenUrlRouter, errorHandler);

const postShorten = (body: object) =>
  request(app).post("/api/shorten").send(body);

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

describe("POST /api/shorten", () => {
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
