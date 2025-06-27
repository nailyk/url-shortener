import { Alias, OriginalUrl, UrlMapping } from "@url-shortener/shared-types";
import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });
  }
  return pool;
}

async function findByAlias(alias: Alias): Promise<UrlMapping | null> {
  const { rows } = await getPool().query(
    `SELECT * FROM url_mappings WHERE alias = $1 LIMIT 1`,
    [alias],
  );
  return rows[0] || null;
}

async function doesAliasExist(alias: Alias): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `SELECT 1 FROM url_mappings WHERE alias = $1 LIMIT 1`,
    [alias],
  );
  return (rowCount ?? 0) > 0;
}

async function save(
  originalUrl: OriginalUrl,
  alias: Alias,
  expiresInMs?: number,
): Promise<void> {
  const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs) : null;
  await getPool().query(
    `INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)`,
    [originalUrl, alias, expiresAt],
  );
}

async function getAll(): Promise<UrlMapping[]> {
  const { rows } = await getPool().query(`SELECT * FROM url_mappings`);
  const baseUrl = (process.env.BASE_URL ?? "").replace(/\/$/, "");

  return rows.map(({ id, original_url, alias, expires_at }) => ({
    id,
    originalUrl: original_url,
    shortUrl: `${baseUrl}/${alias}`,
    expiresAt: expires_at ? new Date(expires_at) : null,
  }));
}

async function deleteById(id: number): Promise<boolean> {
  const { rowCount } = await getPool().query(
    `DELETE FROM url_mappings WHERE id = $1`,
    [id],
  );
  return (rowCount ?? 0) > 0;
}

export default {
  findByAlias,
  doesAliasExist,
  save,
  getAll,
  deleteById,
};
