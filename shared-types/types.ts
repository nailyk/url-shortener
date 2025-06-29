import ms from "ms";
import { ValidationError } from "express-validator";

/** Semantic aliases */
export type OriginalUrl = string;
export type ShortUrl = string;
export type Alias = string;

/** A single shortened URL entry */
export type UrlMapping = {
  id: number;
  originalUrl: OriginalUrl;
  shortUrl: ShortUrl;
  expiresAt: Date | null;
};

/** Request body for POST /urls */
export type CreateUrlMappingRequestBody = {
  url: OriginalUrl;
  customAlias: Alias;
  expiresIn?: ms.StringValue;
};

/** Success response for POST /urls */
export type CreateUrlMappingSuccessResponseBody = {
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
export type CreateUrlMappingErrorResponseBody =
  | ApiErrorResponseBody
  | ApiValidationErrorResponseBody;

/** Final union type for all responses */
export type CreateUrlMappingResponseBody =
  | CreateUrlMappingSuccessResponseBody
  | CreateUrlMappingErrorResponseBody;

/** Response body for GET /api/urls */
export type GetAllUrlMappingsResponseBody = UrlMapping[];

/** Error response for DELETE /urls/:id */
export type DeleteUrlMappingErrorResponseBody =
  | ApiErrorResponseBody
  | ApiValidationErrorResponseBody;

export type DeleteUrlMappingResponseBody =
  | undefined
  | DeleteUrlMappingErrorResponseBody;
