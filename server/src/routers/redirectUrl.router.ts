import { Router } from "express";
import type { UrlMappingService } from "../services/urlMappingService.js";

export default function redirectUrlRouter(
  urlMappingService: UrlMappingService,
) {
  const router = Router();

  router.get("/:alias", async (req, res) => {
    const originalUrl = await urlMappingService.resolveOriginalUrl(
      req.params.alias,
    );
    res.redirect(originalUrl);
  });

  return router;
}
