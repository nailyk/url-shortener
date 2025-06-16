import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.status ?? 500;
  const message = status === 500 ? "Internal Server Error" : err.message;
  console.error(message);
  res.status(status).json({ error: message });
};
