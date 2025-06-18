import { Alias, OriginalUrl } from "@url-shortener/shared-types";
import { Pool } from "pg";

let pool: Pool | null = null;

function initPool() {
  if (pool) return pool;

  pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  return pool;
}
async function getOriginalUrl(alias: Alias) {
  const res = await initPool().query(
    "SELECT original_url, expires_at FROM url_mappings WHERE alias = $1",
    [alias],
  );
  return res.rows[0];
}

async function doesAliasExist(alias: Alias) {
  const res = await initPool().query(
    "SELECT 1 FROM url_mappings WHERE alias = $1",
    [alias],
  );
  return res.rows.length > 0;
}

async function saveUrl(
  originalUrl: OriginalUrl,
  alias: Alias,
  expiresInMs?: number,
) {
  const expiresAt = expiresInMs
    ? new Date(Date.now() + expiresInMs)
    : undefined;
  await initPool().query(
    "INSERT INTO url_mappings (original_url, alias, expires_at) VALUES ($1, $2, $3)",
    [originalUrl, alias, expiresAt],
  );
}

export default {
  getOriginalUrl,
  doesAliasExist,
  saveUrl,
};
