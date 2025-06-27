import { Router } from "express";
import urlMappingService from "../services/urlMappingService.js";

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

export default router;
