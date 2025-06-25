import express, { Router, Request, Response, NextFunction } from "express";
import {
  GetAllUrlsResponseBody,
  ShortenUrlRequestBody,
  ShortenUrlResponseBody,
} from "@url-shortener/shared-types";
import { shortenUrlRequestValidators } from "../middlewares/shortenUrlRequestValidators.js";
import urlService from "../services/urlService.js";
import { validateRequestHandler } from "../middlewares/validateRequestHandler.js";

const router = Router();
router.use(express.json());

router.post(
  "/urls",
  shortenUrlRequestValidators,
  validateRequestHandler,
  async (
    req: Request<{}, any, ShortenUrlRequestBody>,
    res: Response<ShortenUrlResponseBody>,
    next: NextFunction,
  ) => {
    const { url, customAlias, expiresIn } = req.body;
    try {
      const alias = await urlService.createAlias(url, customAlias, expiresIn);
      res.json({ shortUrl: `${process.env.BASE_URL}/${alias}` });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/urls",
  async (_, res: Response<GetAllUrlsResponseBody>, next: NextFunction) => {
    try {
      const result = await urlService.getAllShortenedUrls();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
