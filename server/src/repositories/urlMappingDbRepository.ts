import { Alias, OriginalUrl } from "@url-shortener/shared-types";
import { Pool } from "pg";
import { UrlMappingDB } from "../models/dbTypes.js";

export class UrlMappingDbRepository {
  private pool: Pool;

  constructor(pool?: Pool) {
    this.pool =
      pool ??
      new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      });
  }

  private mapRowToUrlMappingDB(row: any): UrlMappingDB {
    return {
      id: row.id,
      originalUrl: row.original_url,
      alias: row.alias,
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    };
  }

  async findByAlias(alias: Alias): Promise<UrlMappingDB | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM url_mappings WHERE alias = $1 LIMIT 1`,
      [alias],
    );
    return rows[0] ? this.mapRowToUrlMappingDB(rows[0]) : null;
  }

  async findById(id: number): Promise<UrlMappingDB | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM url_mappings WHERE id = $1 LIMIT 1`,
      [id],
    );
    return rows[0] ? this.mapRowToUrlMappingDB(rows[0]) : null;
  }

  async doesAliasExist(alias: Alias): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `SELECT 1 FROM url_mappings WHERE alias = $1 LIMIT 1`,
      [alias],
    );
    return (rowCount ?? 0) > 0;
  }

  async save(
    originalUrl: OriginalUrl,
    alias: Alias,
    expiresInMs?: number,
  ): Promise<void> {
    const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs) : null;
    await this.pool.query(
      `INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)`,
      [originalUrl, alias, expiresAt],
    );
  }

  async getAll(): Promise<UrlMappingDB[]> {
    const { rows } = await this.pool.query(`SELECT * FROM url_mappings`);
    return rows.map(this.mapRowToUrlMappingDB);
  }

  async deleteById(id: number): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `DELETE FROM url_mappings WHERE id = $1`,
      [id],
    );
    return (rowCount ?? 0) > 0;
  }
}

// Optionally export a default instance
const urlMappingDbRepository = new UrlMappingDbRepository();
export default urlMappingDbRepository;
