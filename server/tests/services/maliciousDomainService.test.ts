import { beforeEach, describe, expect, it, vi } from "vitest";
import { MaliciousDomainRepository } from "../../src/repositories/maliciousDomainRepository.js";
import { MaliciousDomainService } from "../../src/services/maliciousDomainService.js";

vi.mock("../../src/repositories/maliciousDomainRepository.js", () => {
  const mockRepo = {
    getAllDomains: vi.fn().mockResolvedValue([]),
    isDomainMalicious: vi.fn().mockResolvedValue(false),
    addDomain: vi.fn().mockResolvedValue(undefined),
  };
  return {
    MaliciousDomainRepository: vi.fn().mockImplementation(() => mockRepo),
    maliciousDomainRepository: mockRepo,
  };
});

describe("MaliciousDomainService", () => {
  let service: MaliciousDomainService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = new MaliciousDomainRepository();
    mockRepo.getAllDomains.mockResolvedValue([]);
    service = new MaliciousDomainService(mockRepo);
    await service.initialize();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should load domains from repository into bloom filter", async () => {
      const dbDomains = ["evil.com", "bad.com"];
      mockRepo.getAllDomains.mockResolvedValue(dbDomains);

      service = new MaliciousDomainService(mockRepo);
      await service.initialize();

      mockRepo.isDomainMalicious.mockResolvedValue(true);

      expect(await service.isMalicious("evil.com")).toBe(true);
      expect(await service.isMalicious("bad.com")).toBe(true);
    });
  });

  describe("isMalicious", () => {
    it("should return false immediately if not in bloom filter", async () => {
      const result = await service.isMalicious("safe.com");
      expect(result).toBe(false);
      expect(mockRepo.isDomainMalicious).not.toHaveBeenCalled();
    });

    it("should check repository if bloom filter returns true (True Positive)", async () => {
      mockRepo.getAllDomains.mockResolvedValue([]);
      await service.add("evil.com");
      vi.clearAllMocks();

      mockRepo.isDomainMalicious.mockResolvedValue(true);

      const result = await service.isMalicious("evil.com");
      expect(result).toBe(true);
      expect(mockRepo.isDomainMalicious).toHaveBeenCalledWith("evil.com");
    });

    it("should return false if repository check fails (False Positive)", async () => {
      mockRepo.getAllDomains.mockResolvedValue([]);
      await service.add("sort-of-evil.com");
      vi.clearAllMocks();

      mockRepo.isDomainMalicious.mockResolvedValue(false);

      const result = await service.isMalicious("sort-of-evil.com");
      expect(result).toBe(false);
      expect(mockRepo.isDomainMalicious).toHaveBeenCalled();
    });
  });

  describe("add", () => {
    it("should add to repository and bloom filter", async () => {
      mockRepo.getAllDomains.mockResolvedValue([]);

      await service.add("new-evil.com");

      expect(mockRepo.addDomain).toHaveBeenCalledWith("new-evil.com");

      vi.clearAllMocks();
      mockRepo.isDomainMalicious.mockResolvedValue(true);

      expect(await service.isMalicious("new-evil.com")).toBe(true);
      expect(mockRepo.isDomainMalicious).toHaveBeenCalled();
    });
  });
});
