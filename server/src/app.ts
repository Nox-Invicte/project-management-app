import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { ZodError } from "zod";
import { HttpError } from "./http";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";

export function startApi() {
  const app = express();
  const port = Number(process.env.PORT ?? 4000);
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new HttpError("Origin is not allowed.", 403));
    },
  }));
  app.use(express.json({ limit: "100kb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: { message: "Too many authentication attempts. Try again later." } },
  });

  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/refresh", authLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use((_request, _response, next) => next(new HttpError("Route not found.", 404)));

  const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, next) => {
    void next;
    if (error instanceof ZodError) {
      return response.status(400).json({ error: { message: error.issues[0]?.message ?? "Invalid request." } });
    }
    if (error instanceof HttpError) {
      if (error.status >= 500) console.error(error.message);
      return response.status(error.status).json({ error: { message: error.message } });
    }
    if (typeof error === "object" && error !== null && "status" in error && error.status === 400) {
      return response.status(400).json({ error: { message: "Malformed JSON request body." } });
    }
    console.error(error);
    return response.status(500).json({ error: { message: "An unexpected server error occurred." } });
  };
  app.use(errorHandler);

  return app.listen(port, "0.0.0.0", () => {
    console.log(`Taskflow API listening on port ${port}`);
  });
}
