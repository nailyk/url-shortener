import express, { Router, Request, Response, NextFunction } from "express";
import {
  ShortenUrlRequestBody,
  ShortenUrlResponseBody,
} from "@shared/types.js";
import { shortenUrlRequestValidators } from "../middlewares/shortenUrlRequestValidators.js";
import urlService from "../services/urlService.js";
import { validateRequestHandler } from "../middlewares/validateRequestHandler.js";

const router = Router();
router.use(express.json());

router.post(
  "/",
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

export default router;
