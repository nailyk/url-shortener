import ms from "ms";
import Sqids from "sqids";
import postgresClient from "../storage/postgresClient.js";
import redisClient from "../storage/redisClient.js";

import {
  AliasAlreadyExistsError,
  AliasIsExpiredError,
  AliasDoesNotExistError,
} from "../errors/errors.js";
import { Alias, OriginalUrl } from "@url-shortener/shared-types";

// TODO create service which can be easily unit tested

const SQIDS = new Sqids({ minLength: 6 });

async function createAlias(
  originalUrl: OriginalUrl,
  customAlias?: Alias,
  expiresIn?: ms.StringValue,
): Promise<Alias> {
  if (customAlias && (await postgresClient.doesAliasExist(customAlias))) {
    throw new AliasAlreadyExistsError(customAlias);
  }

  const alias: Alias = customAlias ?? (await generateAlias());
  const expiresInMs = expiresIn ? ms(expiresIn) : undefined;

  await postgresClient.saveUrl(originalUrl, alias, expiresInMs);
  await redisClient
    .cacheOriginalUrl(originalUrl, alias, expiresInMs)
    .catch((err) => {
      console.error(
        "[Redis] Failed to cache alias:",
        err instanceof Error ? err.message : err,
      );
    });

  return alias;
}

async function generateAlias(): Promise<Alias> {
  const nextId = await redisClient.incr();
  return SQIDS.encode([nextId]) as Alias;
}

async function resolveOriginalUrl(alias: Alias): Promise<OriginalUrl> {
  let originalUrl = await redisClient.getOriginalUrl(alias);
  if (originalUrl) return originalUrl;

  const data = await postgresClient.getOriginalUrl(alias);
  if (!data) throw new AliasDoesNotExistError(alias);

  const { original_url, expires_at } = data;
  if (expires_at && new Date() > new Date(expires_at))
    throw new AliasIsExpiredError(alias);

  const ttl = expires_at
    ? Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000)
    : undefined;
  await redisClient.cacheOriginalUrl(alias, original_url, ttl);

  return original_url;
}

export default {
  createAlias,
  resolveOriginalUrl,
};
