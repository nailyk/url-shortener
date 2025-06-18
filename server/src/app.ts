import express from "express";
import cors from "cors";
import shortenUrlRouter from "./routers/shortenUrl.router.js";
import redirectUrlRouter from "./routers/redirectUrl.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { loadEnv } from "./loadEnv.js";

loadEnv();

const app = express();

app.use(cors());

app.use("/api/shorten", shortenUrlRouter);
app.use("/", redirectUrlRouter);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.BASE_URL}`);
});
