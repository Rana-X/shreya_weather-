import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── Security headers (helmet) ─────────────────────────────────────────────────
// Protects against XSS reflection, clickjacking, MIME sniffing, etc.
// cross-origin-resource-policy is set to cross-origin so the Replit proxy can
// serve assets; everything else uses helmet's safe defaults.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // CSP is omitted here — the front-end Vite app manages its own headers.
    contentSecurityPolicy: false,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true }));

// Hard cap on request body size — prevents payload-flooding attacks.
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api", router);

export default app;
