import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { describe, it, beforeEach, expect, vi } from "vitest";
import redirectUrlRouter from "../../src/routers/redirectUrl.router.js";
import urlService from "../../src/services/urlService.js";
import { AliasDoesNotExistError } from "../../src/errors/errors.js";

vi.mock("../../src/services/urlService.js", () => ({
  default: {
    resolveOriginalUrl: vi.fn(),
  },
}));

const mockedUrlService = vi.mocked(urlService);

const app = express();
app.use("/", redirectUrlRouter);
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: err.message });
});

const getRedirect = (path: string) => request(app).get(path);

describe("GET /:alias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to the original URL", async () => {
    mockedUrlService.resolveOriginalUrl.mockResolvedValue(
      "https://example.com",
    );

    const res = await getRedirect("/abc123");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com");
    expect(mockedUrlService.resolveOriginalUrl).toHaveBeenCalledWith("abc123");
  });

  it("should respond with 404 if urlService throws an error", async () => {
    mockedUrlService.resolveOriginalUrl.mockRejectedValue(
      new AliasDoesNotExistError(),
    );

    const res = await getRedirect("/toto");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Alias does not exist");
    expect(mockedUrlService.resolveOriginalUrl).toHaveBeenCalledWith("toto");
  });
});
