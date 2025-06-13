import ms from 'ms';
import Sqids from 'sqids'
import postgresClient from '../storage/postgresClient.js';
import redisClient from '../storage/redisClient.js';

import { AliasAlreadyExistsError, AliasIsExpiredError, AliasDoesNotExistError } from '../errors/errors.js';

const sqids = new Sqids({ minLength: 6 })

async function createShortUrl(originalUrl, customAlias, expiresIn) {

  if (customAlias && await postgresClient.isAliasExists(customAlias)) {
    throw new AliasAlreadyExistsError(customAlias);
  }

  let alias = customAlias;
  if (!alias) {
    const nextShortCode = await redisClient.incr();
    /*
    we use sqids.encode to ensure that the generated aliases are compact / hard to guess,
    and do not reveal the underlying numeric sequence, which is important
    for both usability and security in URL shortener projects.
    */
    alias = sqids.encode([nextShortCode]);
  }

  const expiresInMs = expiresIn ? ms(expiresIn) : null;
  const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs) : null;

  await postgresClient.saveUrl(alias, originalUrl, expiresAt);

  try {
    // Only set TTL in Redis if expiration is set
    await redisClient.cacheUrl(
      alias,
      originalUrl,
      expiresAt ? Math.floor(expiresInMs / 1000) : null
    );
  } catch (err) {
    console.error('Redis cache failed:', err.message);
    // Proceed anyway — Postgres DB is source of truth
  }

  return alias;
}

async function resolveShortUrl(alias) {
  // Try cache first
  let url = await redisClient.getCachedUrl(alias);
  if (url) return url;

  // Fallback to DB
  const data = await postgresClient.getUrlByAlias(alias);
  if (!data) throw new AliasDoesNotExistError();

  const { original_url, expires_at } = data;
  if (expires_at && new Date() > new Date(expires_at)) throw new AliasIsExpiredError();

  // Cache it for future
  const ttl = expires_at ? Math.floor((new Date(expires_at) - new Date()) / 1000) : null;
  await redisClient.cacheUrl(alias, original_url, ttl);

  return original_url;
}

export default {
  createShortUrl,
  resolveShortUrl,
};
