import ms from "ms";
import { ValidationError } from "express-validator";

/** Semantic aliases */
export type OriginalUrl = string;
type ShortUrl = string;
export type Alias = string;

/** Request body for POST /urls */
export type ShortenUrlRequestBody = {
  url: OriginalUrl;
  customAlias: Alias;
  expiresIn?: ms.StringValue;
};

/** Success response for POST /urls */
export type ShortenUrlSuccessResponseBody = {
  shortUrl: ShortUrl;
};

/** General API error */
export type ApiErrorResponseBody = {
  error: string;
};

/** Validation error item (compatible with express-validator) */
export type ApiValidationErrorItem = {
  msg: string;
  param: string;
  location: string;
  value?: unknown;
};

/** Validation error response */
export type ApiValidationErrorResponseBody = {
  errors: ValidationError[];
};

/** Union of all error types for this endpoint */
export type ShortenUrlErrorResponseBody =
  | ApiErrorResponseBody
  | ApiValidationErrorResponseBody;

/** Final union type for all responses */
export type ShortenUrlResponseBody =
  | ShortenUrlSuccessResponseBody
  | ShortenUrlErrorResponseBody;

/** A single shortened URL entry */
export type ShortenedUrlEntry = {
  id: string;
  originalUrl: OriginalUrl;
  shortUrl: ShortUrl;
  expiresAt: Date | null;
};

/** Response body for GET /api/urls */
export type GetAllUrlsResponseBody = ShortenedUrlEntry[];
