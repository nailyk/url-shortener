import {
  CreateUrlMappingRequestBody,
  CreateUrlMappingResponseBody,
  DeleteUrlMappingResponseBody,
  GetAllUrlMappingsResponseBody,
} from "@url-shortener/shared-types";
import express, { Request, Response, Router } from "express";
import {
  createUrlMappingValidators,
  deleteUrlMappingValidators,
} from "../middlewares/requestValidators.js";
import { validateRequestHandler } from "../middlewares/validateRequestHandler.js";
import type { UrlMappingService } from "../services/urlMappingService.js";

export default function apiRouter(urlMappingService: UrlMappingService) {
  const router = Router();
  router.use(express.json());

  router.post(
    "/urls",
    createUrlMappingValidators,
    validateRequestHandler,
    async (
      req: Request<{}, any, CreateUrlMappingRequestBody>,
      res: Response<CreateUrlMappingResponseBody>,
    ) => {
      const { url, customAlias, expiresIn } = req.body;
      const shortUrl = await urlMappingService.createShortUrl(
        url,
        customAlias,
        expiresIn,
      );
      res.json({ shortUrl: shortUrl });
    },
  );

  router.get(
    "/urls",
    async (_, res: Response<GetAllUrlMappingsResponseBody>) => {
      const result = await urlMappingService.getAll();
      res.json(result);
    },
  );

  router.delete(
    "/urls/:id",
    deleteUrlMappingValidators,
    validateRequestHandler,
    async (
      req: Request<{ id: string }>,
      res: Response<DeleteUrlMappingResponseBody>,
    ) => {
      const id = Number(req.params.id);
      await urlMappingService.deleteById(id);
      res.sendStatus(204);
    },
  );

  return router;
}
