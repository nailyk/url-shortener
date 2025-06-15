import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { describe, it, beforeEach, expect, vi } from "vitest";
import urlService from "../../src/services/urlService.js";
import shortenUrlRouter from "../../src/routers/shortenUrlRouter.js";

vi.mock("../../src/services/urlService.js", () => ({
  default: {
    createShortUrl: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use("/", shortenUrlRouter);

describe("shortenUrlRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BASE_URL = "http://localhost:3000";
  });

  it("should return 400 if url is missing", async () => {
    const res = await request(app).post("/shorten").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "url", msg: "url field is required" }),
      ]),
    );
  });

  it("should return 400 if url is invalid", async () => {
    const res = await request(app).post("/shorten").send({ url: "not-a-url" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "url", msg: "Invalid URL" }),
      ]),
    );
  });

  it("should return 400 if alias is not alphanumeric", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com", alias: "bad-alias!" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "alias",
          msg: "Alias must be alphanumeric",
        }),
      ]),
    );
  });

  it("should return 400 if alias is too long", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com", alias: "a".repeat(21) });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "alias",
          msg: "Alias must be at most 20 characters long",
        }),
      ]),
    );
  });

  it("should return 400 if expiresIn is invalid", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com", expiresIn: "notaduration" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "expiresIn",
          msg: expect.stringMatching(
            'Invalid duration format. Use something like "5m", "2h", "1d", etc...',
          ),
        }),
      ]),
    );
  });

  it("should return 200 and shortUrl for valid input", async () => {
    (urlService.createShortUrl as any).mockResolvedValue("abc123");
    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com", alias: "myalias", expiresIn: "5m" });
    expect(res.status).toBe(200);
    expect(res.body.shortUrl).toBe("http://localhost:3000/abc123");
    expect(urlService.createShortUrl).toHaveBeenCalledWith(
      "https://example.com",
      "myalias",
      "5m",
    );
  });

  it("should handle errors from urlService", async () => {
    (urlService.createShortUrl as any).mockRejectedValue(
      new Error("Alias exists"),
    );

    // Add a custom error handler for this test
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).json({ error: err.message });
    });

    const res = await request(app)
      .post("/shorten")
      .send({ url: "https://example.com", alias: "taken" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Alias exists");
  });
});
