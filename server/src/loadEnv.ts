import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export function loadEnv() {
  const useLocal = process.env.USE_LOCAL_ENV === "true";
  const envPath = path.resolve(process.cwd(), useLocal ? ".env.local" : ".env");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    console.warn(`[env] File ${envPath} not found.`);
  }
}
