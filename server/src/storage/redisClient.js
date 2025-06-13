import Redis from 'ioredis';
const redis = new Redis({ host: process.env.REDIS_HOST || 'localhost' });
async function getCachedUrl(alias) {
  return await redis.get(`url:${alias}`);
}

async function cacheUrl(alias, url, expiresInSeconds) {
  if (expiresInSeconds) {
    await redis.setex(`url:${alias}`, expiresInSeconds, url);
  } else {
    await redis.set(`url:${alias}`, url);
  }
}

async function incr() {
  return await redis.incr('url:counter');
}

export default {
  getCachedUrl,
  cacheUrl,
  incr
};
