import { Router } from "express";
import urlService from "../services/urlService.js";

const router = Router();

router.get("/:alias", async (req, res, next) => {
  try {
    const originalUrl = await urlService.resolveOriginalUrl(req.params.alias);
    res.redirect(originalUrl);
  } catch (err) {
    next(err);
  }
});

export default router;
