import * as Redis from "ioredis";

const redis = new Redis.Redis({ host: process.env.REDIS_HOST || "localhost" });

async function getCachedUrl(alias: string) {
  return await redis.get(`url:${alias}`);
}

async function cacheUrl(alias: string, url: string, expiresInSeconds?: number) {
  if (expiresInSeconds) {
    await redis.setex(`url:${alias}`, expiresInSeconds, url);
  } else {
    await redis.set(`url:${alias}`, url);
  }
}

async function incr() {
  return await redis.incr("url:counter");
}

export default {
  getCachedUrl,
  cacheUrl,
  incr,
};
