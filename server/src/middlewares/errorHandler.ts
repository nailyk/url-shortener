import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.status ?? 500;
  const message = status === 500 ? "Internal Server Error" : err.message;

  if (status === 500) {
    console.error("[Internal Server Error]", err);
  } else {
    console.warn(`[${err.name || "Error"}] ${message}`);
  }

  res.status(status).json({ error: message });
};
