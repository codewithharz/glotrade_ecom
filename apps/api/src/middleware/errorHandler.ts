// src/middleware/errorHandler.ts
// Express types handled by any
import { AppError } from "../utils/errors";

export const errorHandler = (
  err: Error | AppError,
  req: any,
  res: any,
  next: any
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // MongoDB duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(400).json({
      status: "fail",
      message: `${field} already exists`,
    });
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }

  console.error("ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};
