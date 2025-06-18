import { checkSchema } from "express-validator";
import ms from "ms";

export const shortenUrlRequestValidators = checkSchema({
  url: {
    in: ["body"],
    exists: {
      errorMessage: "url field is required",
    },
    isURL: {
      errorMessage: "Invalid URL",
    },
    trim: true,
  },

  customAlias: {
    in: ["body"],
    optional: true,
    isAlphanumeric: {
      errorMessage: "Alias must be alphanumeric",
    },
    isLength: {
      options: { max: 20 },
      errorMessage: "Alias must be at most 20 characters long",
    },
  },

  expiresIn: {
    in: ["body"],
    optional: true,
    custom: {
      options: (value) => !!ms(value),
      errorMessage:
        'Invalid duration format. Use something like "5m", "2h", "1d", etc...',
    },
  },
});
