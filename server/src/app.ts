import cors from "cors";
import express from "express";
import { urlMappingCacheRepository } from "./repositories/urlMappingCacheRepository.js";
import { urlMappingDbRepository } from "./repositories/urlMappingDbRepository.js";

import apiRouter from "./routers/api.router.js";
import redirectUrlRouter from "./routers/redirectUrl.router.js";
import { UrlMappingService } from "./services/urlMappingService.js";

import { loadEnv } from "./loadEnv.js";
import { errorHandler } from "./middlewares/errorHandler.js";

loadEnv();

const app = express();

const urlMappingService = new UrlMappingService(
  urlMappingDbRepository,
  urlMappingCacheRepository,
  process.env.BASE_URL,
);

app.use(cors());

app.use("/api/", apiRouter(urlMappingService));
app.use("/", redirectUrlRouter(urlMappingService));

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});
