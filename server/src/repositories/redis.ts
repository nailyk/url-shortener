import { Redis as RedisClient } from "ioredis";
import "../loadEnv.js";

export const redis = new RedisClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on("error", (err) => {
  console.error("[Redis Client Error]", err);
});
