import { Alias, OriginalUrl } from "@shared/types.js";
import { Redis as RedisClient } from "ioredis";

let redis: RedisClient | null = null;

function initRedis() {
  if (redis) return redis;

  redis = new RedisClient({ host: process.env.REDIS_HOST || "localhost" });
  return redis;
}

const KEY_PREFIX = "url";
const COUNTER_KEY = `${KEY_PREFIX}:counter`;

function getKey(alias: Alias): string {
  return `${KEY_PREFIX}:${alias}`;
}

async function getOriginalUrl(alias: Alias): Promise<OriginalUrl | null> {
  const client = initRedis();
  const result = await client.get(getKey(alias));
  return result;
}

async function cacheOriginalUrl(
  originalUrl: OriginalUrl,
  alias: Alias,
  expiresInMs?: number,
): Promise<void> {
  const client = initRedis();
  const expiresInSeconds = expiresInMs
    ? Math.floor(expiresInMs / 1000)
    : undefined;

  if (expiresInSeconds) {
    await client.setex(getKey(alias), expiresInSeconds, originalUrl);
  } else {
    await client.set(getKey(alias), originalUrl);
  }
}

async function incr(): Promise<number> {
  const client = initRedis();
  return await client.incr(COUNTER_KEY);
}

export default {
  getOriginalUrl,
  cacheOriginalUrl,
  incr,
};
