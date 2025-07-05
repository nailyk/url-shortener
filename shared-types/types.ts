import { ValidationError } from "express-validator";
import ms from "ms";

export type OriginalUrl = string;
export type ShortUrl = string;
export type Alias = string;

export type UrlMapping = {
  id: number;
  originalUrl: OriginalUrl;
  shortUrl: ShortUrl;
  expiresAt?: Date;
};

export type CreateUrlMappingRequestBody = {
  url: OriginalUrl;
  customAlias: Alias;
  expiresIn?: ms.StringValue;
};

export type CreateUrlMappingSuccessResponseBody = {
  shortUrl: ShortUrl;
};

export type ApiErrorResponseBody = {
  error: string;
};

export type ApiValidationErrorItem = {
  msg: string;
  param: string;
  location: string;
  value?: unknown;
};

export type ApiValidationErrorResponseBody = {
  errors: ValidationError[];
};

export type CreateUrlMappingErrorResponseBody =
  | ApiErrorResponseBody
  | ApiValidationErrorResponseBody;

export type CreateUrlMappingResponseBody =
  | CreateUrlMappingSuccessResponseBody
  | CreateUrlMappingErrorResponseBody;

export type GetAllUrlMappingsResponseBody = UrlMapping[];

export type DeleteUrlMappingErrorResponseBody =
  | ApiErrorResponseBody
  | ApiValidationErrorResponseBody;

export type DeleteUrlMappingResponseBody =
  | undefined
  | DeleteUrlMappingErrorResponseBody;
