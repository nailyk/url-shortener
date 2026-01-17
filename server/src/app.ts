import cors from "cors";
import express from "express";
import "./loadEnv.js";
import { urlMappingCacheRepository } from "./repositories/urlMappingCacheRepository.js";
import { urlMappingDbRepository } from "./repositories/urlMappingDbRepository.js";

import apiRouter from "./routers/api.router.js";
import redirectUrlRouter from "./routers/redirectUrl.router.js";
import { maliciousDomainService } from "./services/maliciousDomainService.js";
import { UrlMappingService } from "./services/urlMappingService.js";

import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const urlMappingService = new UrlMappingService(
  urlMappingDbRepository,
  urlMappingCacheRepository,
  maliciousDomainService,
  process.env.BASE_URL,
);

app.use(cors());

app.use("/api/", apiRouter(urlMappingService));
app.use("/", redirectUrlRouter(urlMappingService));

app.use(errorHandler);

const server = app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function shutdown() {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      const { pool } = await import("./repositories/pool.js");
      const { redis } = await import("./repositories/redis.js");
      await Promise.all([pool.end(), redis.quit()]);
      console.log("Database and Redis connections closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });
}
