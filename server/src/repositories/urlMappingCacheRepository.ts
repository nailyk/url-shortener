import { Alias, OriginalUrl } from "@url-shortener/shared-types";
import { Redis as RedisClient } from "ioredis";

export class UrlMappingCacheRepository {
  private client: RedisClient;
  private readonly KEY_PREFIX = "url";
  private readonly COUNTER_KEY = `${this.KEY_PREFIX}:counter`;

  constructor(client?: RedisClient) {
    this.client =
      client ??
      new RedisClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      });
  }

  private getKey(alias: Alias): string {
    return `${this.KEY_PREFIX}:${alias}`;
  }

  async getOriginalUrl(alias: Alias): Promise<OriginalUrl | null> {
    return await this.client.get(this.getKey(alias));
  }

  async cacheUrlMapping(
    originalUrl: OriginalUrl,
    alias: Alias,
    expiresInMs?: number,
  ): Promise<void> {
    if (expiresInMs) {
      const expiresInSeconds = Math.floor(expiresInMs / 1000);
      await this.client.setex(
        this.getKey(alias),
        expiresInSeconds,
        originalUrl,
      );
    } else {
      await this.client.set(this.getKey(alias), originalUrl);
    }
  }

  async deleteUrlMapping(alias: Alias): Promise<void> {
    await this.client.del(this.getKey(alias));
  }

  async incr(): Promise<number> {
    return await this.client.incr(this.COUNTER_KEY);
  }
}

export const urlMappingCacheRepository = new UrlMappingCacheRepository();
