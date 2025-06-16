import { body } from "express-validator";
import ms from "ms";

export const shortenUrlRequestValidators = [
  body("url")
    .exists()
    .withMessage("url field is required")
    .bail()
    .isURL()
    .withMessage("Invalid URL")
    .trim(),

  body("customAlias")
    .optional()
    .isAlphanumeric()
    .withMessage("Alias must be alphanumeric")
    .isLength({ max: 20 })
    .withMessage("Alias must be at most 20 characters long"),

  body("expiresIn")
    .optional()
    .custom((value) => ms(value))
    .withMessage(
      'Invalid duration format. Use something like "5m", "2h", "1d", etc...',
    ),
];
