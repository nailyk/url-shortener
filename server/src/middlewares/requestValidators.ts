import { checkSchema } from "express-validator";
import ms from "ms";

export const createUrlMappingValidators = checkSchema({
  url: {
    in: ["body"],
    exists: {
      errorMessage: "url field is required",
    },
    trim: true,
    isURL: {
      errorMessage: "Invalid URL",
    },
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

export const deleteUrlMappingValidators = checkSchema({
  id: {
    in: ["params"],
    exists: {
      errorMessage: "ID parameter is required",
      bail: true,
    },
    isInt: {
      errorMessage: "ID must be an integer",
      bail: true,
    },
    toInt: true,
    custom: {
      options: (value) => value > 0,
      errorMessage: "ID must be a positive integer",
    },
  },
});
