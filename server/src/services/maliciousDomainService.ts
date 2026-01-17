import bf from "bloom-filters";
import {
  MaliciousDomainRepository,
  maliciousDomainRepository,
} from "../repositories/maliciousDomainRepository.js";
const { BloomFilter } = bf;

export class MaliciousDomainService {
  private bloomFilter: InstanceType<typeof BloomFilter>;
  private initialized = false;

  constructor(private readonly repository: MaliciousDomainRepository) {
    const expectedItems = process.env.BLOOM_FILTER_EXPECTED_ITEMS ?? 10000;
    const falsePositiveRate =
      process.env.BLOOM_FILTER_FALSE_POSITIVE_RATE ?? 0.01;

    this.bloomFilter = BloomFilter.create(expectedItems, falsePositiveRate);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    const domains = await this.repository.getAllDomains();
    for (const domain of domains) {
      this.bloomFilter.add(domain);
    }
    this.initialized = true;
  }

  async isMalicious(domain: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.bloomFilter.has(domain)) {
      return false;
    }

    return await this.repository.isDomainMalicious(domain);
  }

  async add(domain: string): Promise<void> {
    await this.repository.addDomain(domain);
    this.bloomFilter.add(domain);
  }
}

export const maliciousDomainService = new MaliciousDomainService(
  maliciousDomainRepository,
);
