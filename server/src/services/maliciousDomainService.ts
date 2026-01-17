import bf from "bloom-filters";
import {
  MaliciousDomainRepository,
  maliciousDomainRepository,
} from "../repositories/maliciousDomainRepository.js";
const { BloomFilter } = bf;

export class MaliciousDomainService {
  private bloomFilter: InstanceType<typeof BloomFilter>;
  private initPromise: Promise<void>;

  constructor(private readonly repository: MaliciousDomainRepository) {
    const expectedItems = process.env.BLOOM_FILTER_EXPECTED_ITEMS ?? 10000;
    const falsePositiveRate =
      process.env.BLOOM_FILTER_FALSE_POSITIVE_RATE ?? 0.01;

    this.bloomFilter = BloomFilter.create(expectedItems, falsePositiveRate);
    this.initPromise = this.initialize();
  }

  async initialize(): Promise<void> {
    const domains = await this.repository.getAllDomains();
    for (const domain of domains) {
      this.bloomFilter.add(domain);
    }
  }

  async isMalicious(domain: string): Promise<boolean> {
    await this.initPromise;

    if (!this.bloomFilter.has(domain)) {
      return false;
    }

    return await this.repository.isDomainMalicious(domain);
  }

  async add(domain: string): Promise<void> {
    await this.initPromise;
    await this.repository.addDomain(domain);
    this.bloomFilter.add(domain);
  }
}

export const maliciousDomainService = new MaliciousDomainService(
  maliciousDomainRepository,
);
