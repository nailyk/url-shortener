import ms from "ms";
import Sqids from "sqids";
import urlMappingRepository from "../repositories/urlMappingRepository.js";
import urlMappingCacheRepository from "../repositories/urlMappingCacheRepository.js";

import {
  AliasAlreadyExistsError,
  AliasIsExpiredError,
  AliasDoesNotExistError,
  UrlMappingNotFoundError,
} from "../errors/errors.js";
import { Alias, OriginalUrl, UrlMapping } from "@url-shortener/shared-types";

// TODO create service which can be easily unit tested

const SQIDS = new Sqids({ minLength: 6 });

export async function createAlias(
  originalUrl: OriginalUrl,
  customAlias?: Alias,
  expiresIn?: ms.StringValue,
): Promise<Alias> {
  if (customAlias && (await urlMappingRepository.doesAliasExist(customAlias))) {
    throw new AliasAlreadyExistsError(customAlias);
  }

  const alias: Alias = customAlias ?? (await generateAlias());
  const expiresInMs = expiresIn ? ms(expiresIn) : undefined;

  await urlMappingRepository.save(originalUrl, alias, expiresInMs);
  await urlMappingCacheRepository
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
  const nextId = await urlMappingCacheRepository.incr();
  return SQIDS.encode([nextId]) as Alias;
}

async function resolveOriginalUrl(alias: Alias): Promise<OriginalUrl> {
  const cachedOriginalUrl =
    await urlMappingCacheRepository.getOriginalUrl(alias);
  if (cachedOriginalUrl) return cachedOriginalUrl;

  const data = await urlMappingRepository.findByAlias(alias);
  if (!data) throw new AliasDoesNotExistError(alias);

  const { originalUrl, expiresAt } = data;
  if (expiresAt && new Date() > new Date(expiresAt))
    throw new AliasIsExpiredError(alias);

  const ttl = expiresAt
    ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    : undefined;
  await urlMappingCacheRepository.cacheOriginalUrl(alias, originalUrl, ttl);

  return originalUrl;
}

async function getAll(): Promise<UrlMapping[]> {
  return await urlMappingRepository.getAll();
}

async function deleteById(id: number): Promise<void> {
  const deleted = await urlMappingRepository.deleteById(id);

  if (!deleted) {
    throw new UrlMappingNotFoundError(id);
  }
}

export default {
  createAlias,
  resolveOriginalUrl,
  getAll,
  deleteById,
};
