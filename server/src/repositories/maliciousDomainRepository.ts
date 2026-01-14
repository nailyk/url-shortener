import { Pool } from "pg";

export class MaliciousDomainRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool =
      pool ??
      new Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      });
  }

  async getAllDomains(): Promise<string[]> {
    const { rows } = await this.pool.query(
      "SELECT domain FROM malicious_domains",
    );
    return rows.map((row) => row.domain);
  }

  async isDomainMalicious(domain: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      "SELECT 1 FROM malicious_domains WHERE domain = $1 LIMIT 1",
      [domain],
    );
    return (rowCount ?? 0) > 0;
  }

  async addDomain(domain: string): Promise<void> {
    await this.pool.query(
      "INSERT INTO malicious_domains (domain) VALUES ($1) ON CONFLICT DO NOTHING",
      [domain],
    );
  }
}

export const maliciousDomainRepository = new MaliciousDomainRepository();
