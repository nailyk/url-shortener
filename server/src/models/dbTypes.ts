import { Alias, OriginalUrl } from "@url-shortener/shared-types";

export type UrlMappingDB = {
  id: number;
  originalUrl: OriginalUrl;
  alias: Alias;
  expiresAt?: Date;
};
