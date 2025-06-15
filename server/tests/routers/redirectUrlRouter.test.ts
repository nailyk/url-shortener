import express from "express";
import request from "supertest";
import { vi, describe, it, beforeEach, expect, Mock } from "vitest";
import urlService from "../../src/services/urlService.js";
import redirectUrlRouter from "../../src/routers/redirectUrlRouter.js";

vi.mock("../../src/services/urlService.js", () => ({
  default: {
    resolveShortUrl: vi.fn(),
  },
}));

const resolveShortUrlMock = urlService.resolveShortUrl as Mock;

const app = express();
app.use("/", redirectUrlRouter);
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    res.status(404).json({ error: err.message });
  },
);

describe("redirectUrlRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to the resolved URL", async () => {
    resolveShortUrlMock.mockResolvedValue("https://example.com");
    const res = await request(app).get("/abc123");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com");
  });

  it("should call next(err) if urlService throws an error", async () => {
    resolveShortUrlMock.mockRejectedValue(new Error("Not found"));

    const res = await request(app).get("/notfound");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});
