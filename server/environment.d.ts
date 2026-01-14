declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HOST: string;
      PORT: number;
      BASE_URL: string;
      PGHOST: string;
      PGPORT: number;
      PGUSER: string;
      PGPASSWORD: string;
      PGDATABASE: string;
      REDIS_HOST: string;
      REDIS_PORT: number;
      BLOOM_FILTER_EXPECTED_ITEMS: number;
      BLOOM_FILTER_FALSE_POSITIVE_RATE: number;
    }
  }
}

export {};
