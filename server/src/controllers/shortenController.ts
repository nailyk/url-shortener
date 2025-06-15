import { Router, Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { shortenRequestValidator } from "../validators/shortenRequestValidator.js";
import urlService from "../services/urlService.js";

const apiRouter = Router();

apiRouter.post(
  "/shorten",
  shortenRequestValidator,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { url, alias, expiresIn } = req.body;
    try {
      const shortCode = await urlService.createShortUrl(url, alias, expiresIn);
      res.json({ shortUrl: `${process.env.BASE_URL}/${shortCode}` });
    } catch (err) {
      next(err);
    }
  },
);

export default apiRouter;
