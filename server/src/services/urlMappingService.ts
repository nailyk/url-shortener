import {
  Alias,
  OriginalUrl,
  ShortUrl,
  UrlMapping,
} from "@url-shortener/shared-types";
import ms from "ms";
import Sqids from "sqids";
import {
  AliasAlreadyExistsError,
  AliasDoesNotExistError,
  AliasIsExpiredError,
  UrlMappingNotFoundError,
} from "../errors/errors.js";
import { UrlMappingCacheRepository } from "../repositories/urlMappingCacheRepository.js";
import { UrlMappingDbRepository } from "../repositories/urlMappingDbRepository.js";

export class UrlMappingService {
  constructor(
    private readonly urlMappingDbRepository: UrlMappingDbRepository,
    private readonly urlMappingCacheRepository: UrlMappingCacheRepository,
    private readonly baseUrl: string,
    private readonly sqids: Sqids = new Sqids({ minLength: 6 }),
  ) {}

  async createShortUrl(
    originalUrl: OriginalUrl,
    customAlias?: Alias,
    expiresIn?: ms.StringValue,
  ): Promise<ShortUrl> {
    if (customAlias) {
      await this.validateAliasDoesNotExist(customAlias);
    }

    const alias = customAlias ?? (await this.generateAlias());
    const expiresInMs = expiresIn ? ms(expiresIn) : undefined;

    await this.saveUrlMapping(originalUrl, alias, expiresInMs);
    return this.buildShortUrl(alias);
  }

  private async validateAliasDoesNotExist(alias: Alias): Promise<void> {
    if (await this.urlMappingDbRepository.doesAliasExist(alias)) {
      throw new AliasAlreadyExistsError(alias);
    }
  }

  private async saveUrlMapping(
    originalUrl: OriginalUrl,
    alias: Alias,
    expiresInMs?: number,
  ): Promise<void> {
    await this.urlMappingDbRepository.save(originalUrl, alias, expiresInMs);
    try {
      await this.urlMappingCacheRepository.cacheUrlMapping(
        originalUrl,
        alias,
        expiresInMs,
      );
    } catch (err) {
      console.error(
        "[Redis] Failed to cache alias:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  private buildShortUrl(alias: Alias): ShortUrl {
    return `${this.baseUrl}/${alias}`;
  }

  private async generateAlias(): Promise<Alias> {
    const nextId = await this.urlMappingCacheRepository.incr();
    return this.sqids.encode([nextId]);
  }

  async resolveOriginalUrl(alias: Alias): Promise<OriginalUrl> {
    const cachedOriginalUrl =
      await this.urlMappingCacheRepository.getOriginalUrl(alias);
    if (cachedOriginalUrl) return cachedOriginalUrl;

    const urlMapping = await this.getAndValidateUrlMapping(alias);
    await this.cacheUrlMapping(
      alias,
      urlMapping.originalUrl,
      urlMapping.expiresAt,
    );

    return urlMapping.originalUrl;
  }

  private async getAndValidateUrlMapping(alias: Alias): Promise<UrlMapping> {
    const urlMapping = await this.urlMappingDbRepository.findByAlias(alias);
    if (!urlMapping) throw new AliasDoesNotExistError(alias);

    if (urlMapping.expiresAt && new Date() > new Date(urlMapping.expiresAt)) {
      throw new AliasIsExpiredError(alias);
    }

    return {
      ...urlMapping,
      shortUrl: this.buildShortUrl(urlMapping.alias),
    };
  }

  private async cacheUrlMapping(
    alias: Alias,
    originalUrl: OriginalUrl,
    expiresAt?: Date,
  ): Promise<void> {
    const ttl = expiresAt
      ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      : undefined;
    await this.urlMappingCacheRepository.cacheUrlMapping(
      alias,
      originalUrl,
      ttl,
    );
  }

  async getAll(): Promise<UrlMapping[]> {
    const urlMappings = await this.urlMappingDbRepository.getAll();
    return urlMappings.map(({ id, originalUrl, alias, expiresAt }) => ({
      id,
      originalUrl,
      shortUrl: this.buildShortUrl(alias),
      expiresAt,
    }));
  }

  async deleteById(id: number): Promise<void> {
    const urlMapping = await this.urlMappingDbRepository.findById(id);
    if (!urlMapping) throw new UrlMappingNotFoundError(id);

    await Promise.all([
      this.urlMappingDbRepository.deleteById(id),
      this.urlMappingCacheRepository.deleteUrlMapping(urlMapping.alias),
    ]);
  }
}
