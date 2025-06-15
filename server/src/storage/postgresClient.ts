import { Pool } from "pg";

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function getUrlByAlias(alias: string) {
  const res = await pool.query(
    "SELECT original_url, expires_at FROM urls WHERE alias = $1",
    [alias],
  );
  return res.rows[0];
}

async function isAliasExists(alias: string) {
  const res = await pool.query("SELECT 1 FROM urls WHERE alias = $1", [alias]);
  return res.rows.length > 0;
}

async function saveUrl(
  alias: string,
  originalUrl: string,
  expiresAt: Date | null,
) {
  await pool.query(
    "INSERT INTO urls (alias, original_url, expires_at) VALUES ($1, $2, $3)",
    [alias, originalUrl, expiresAt],
  );
}

export default {
  getUrlByAlias,
  isAliasExists,
  saveUrl,
};
