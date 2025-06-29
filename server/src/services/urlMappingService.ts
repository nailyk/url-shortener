import ms from "ms";
import Sqids from "sqids";
import urlMappingCacheRepository from "../repositories/urlMappingCacheRepository.js";
import urlMappingRepository from "../repositories/urlMappingDbRepository.js";

import {
  Alias,
  OriginalUrl,
  ShortUrl,
  UrlMapping,
} from "@url-shortener/shared-types";
import {
  AliasAlreadyExistsError,
  AliasDoesNotExistError,
  AliasIsExpiredError,
  UrlMappingNotFoundError,
} from "../errors/errors.js";

// TODO create service which can be easily unit tested

const SQIDS = new Sqids({ minLength: 6 });

export async function createShortUrl(
  originalUrl: OriginalUrl,
  customAlias?: Alias,
  expiresIn?: ms.StringValue,
): Promise<ShortUrl> {
  if (customAlias && (await urlMappingRepository.doesAliasExist(customAlias))) {
    throw new AliasAlreadyExistsError(customAlias);
  }

  const alias: Alias = customAlias ?? (await generateAlias());
  const expiresInMs = expiresIn ? ms(expiresIn) : undefined;

  await urlMappingRepository.save(originalUrl, alias, expiresInMs);
  await urlMappingCacheRepository
    .cacheUrlMapping(originalUrl, alias, expiresInMs)
    .catch((err) => {
      console.error(
        "[Redis] Failed to cache alias:",
        err instanceof Error ? err.message : err,
      );
    });

  return `${process.env.BASE_URL}/${alias}` as ShortUrl;
}

async function generateAlias(): Promise<Alias> {
  const nextId = await urlMappingCacheRepository.incr();
  return SQIDS.encode([nextId]) as Alias;
}

async function resolveOriginalUrl(alias: Alias): Promise<OriginalUrl> {
  const cachedOriginalUrl =
    await urlMappingCacheRepository.getOriginalUrl(alias);
  if (cachedOriginalUrl) return cachedOriginalUrl;

  const urlMapping = await urlMappingRepository.findByAlias(alias);
  if (!urlMapping) throw new AliasDoesNotExistError(alias);

  const { originalUrl, expiresAt } = urlMapping;
  if (expiresAt && new Date() > new Date(expiresAt))
    throw new AliasIsExpiredError(alias);

  const ttl = expiresAt
    ? Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    : undefined;
  await urlMappingCacheRepository.cacheUrlMapping(alias, originalUrl, ttl);

  return originalUrl;
}

async function getAll(): Promise<UrlMapping[]> {
  return await urlMappingRepository.getAll().then((urlMappings) => {
    return urlMappings.map(({ id, originalUrl, alias, expiresAt }) => ({
      id,
      originalUrl,
      shortUrl: `${process.env.BASE_URL}/${alias}`,
      expiresAt: expiresAt,
    }));
  });
}

async function deleteById(id: number): Promise<void> {
  const urlMapping = await urlMappingRepository.findById(id);
  if (!urlMapping) throw new UrlMappingNotFoundError(id);

  await Promise.all([
    urlMappingRepository.deleteById(id),
    urlMappingCacheRepository.deleteUrlMapping(urlMapping.alias),
  ]);
}

export default {
  createShortUrl,
  resolveOriginalUrl,
  getAll,
  deleteById,
};
