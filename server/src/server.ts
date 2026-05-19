import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { squareRootRouter } from "@/routes/squareRootRoutes";

const logger = pino({ name: "server start" });
const app: Express = express();

// Parse CORS origins (supports comma-separated values)
const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: corsOrigins, credentials: false }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use("/square-root", squareRootRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
