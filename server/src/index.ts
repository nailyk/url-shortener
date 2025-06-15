import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import shortenController from "./controllers/shortenController.js";
import redirectController from "./controllers/redirectController.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

const PORT = process.env.PORT || 3000;

// Allow requests from the frontend
app.use(
  cors({
    origin: "http://localhost:8080",
  }),
);

app.use(bodyParser.json());

app.use("/api", shortenController);
app.use("/", redirectController);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
