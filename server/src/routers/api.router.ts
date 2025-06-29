import express, { Router, Request, Response, NextFunction } from "express";
import {
  GetAllUrlMappingsResponseBody,
  CreateUrlMappingRequestBody,
  CreateUrlMappingResponseBody,
  DeleteUrlMappingResponseBody,
} from "@url-shortener/shared-types";
import {
  createUrlMappingValidators,
  deleteUrlMappingValidators,
} from "../middlewares/requestValidators.js";
import { validateRequestHandler } from "../middlewares/validateRequestHandler.js";
import urlMappingService from "../services/urlMappingService.js";

const router = Router();
router.use(express.json());

router.post(
  "/urls",
  createUrlMappingValidators,
  validateRequestHandler,
  async (
    req: Request<{}, any, CreateUrlMappingRequestBody>,
    res: Response<CreateUrlMappingResponseBody>,
    next: NextFunction,
  ) => {
    const { url, customAlias, expiresIn } = req.body;
    try {
      const shortUrl = await urlMappingService.createShortUrl(
        url,
        customAlias,
        expiresIn,
      );
      res.json({ shortUrl: shortUrl });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/urls",
  async (
    _,
    res: Response<GetAllUrlMappingsResponseBody>,
    next: NextFunction,
  ) => {
    try {
      const result = await urlMappingService.getAll();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/urls/:id",
  deleteUrlMappingValidators,
  validateRequestHandler,
  async (
    req: Request<{ id: string }>,
    res: Response<DeleteUrlMappingResponseBody>,
    next: NextFunction,
  ) => {
    const id = Number(req.params.id);
    try {
      await urlMappingService.deleteById(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
