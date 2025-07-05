import { Router } from "express";
import type { UrlMappingService } from "../services/urlMappingService.js";

export default function redirectUrlRouter(
  urlMappingService: UrlMappingService,
) {
  const router = Router();

  router.get("/:alias", async (req, res, next) => {
    try {
      const originalUrl = await urlMappingService.resolveOriginalUrl(
        req.params.alias,
      );
      res.redirect(originalUrl);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
