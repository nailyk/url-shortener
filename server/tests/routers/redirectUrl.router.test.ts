import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { describe, it, beforeEach, expect, vi } from "vitest";
import redirectUrlRouter from "../../src/routers/redirectUrl.router.js";
import { AliasDoesNotExistError } from "../../src/errors/errors.js";
import urlMappingService from "../../src/services/urlMappingService.js";

vi.mock("../../src/services/urlMappingService.js", () => ({
  default: {
    resolveOriginalUrl: vi.fn(),
  },
}));

const mockedUrlMappingService = vi.mocked(urlMappingService);

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
    mockedUrlMappingService.resolveOriginalUrl.mockResolvedValue(
      "https://example.com",
    );

    const res = await getRedirect("/abc123");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com");
    expect(mockedUrlMappingService.resolveOriginalUrl).toHaveBeenCalledWith(
      "abc123",
    );
  });

  it("should respond with 404 if urlMappingService throws an error", async () => {
    mockedUrlMappingService.resolveOriginalUrl.mockRejectedValue(
      new AliasDoesNotExistError("toto"),
    );

    const res = await getRedirect("/toto");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Alias "toto" does not exist');
    expect(mockedUrlMappingService.resolveOriginalUrl).toHaveBeenCalledWith(
      "toto",
    );
  });
});
