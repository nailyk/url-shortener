import { Router } from "express";
import urlService from "../services/urlService.js";

const router = Router();

router.get("/:code", async (req, res, next) => {
  try {
    const url = await urlService.resolveShortUrl(req.params.code);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
});

export default router;
