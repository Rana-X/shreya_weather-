import { Router } from "express";
import { db, correctionsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  CreateCorrectionBody,
  ListCorrectionsQueryParams,
  AgreeWithCorrectionParams,
} from "@workspace/api-zod";

const router = Router();

// ── IP-based rate limiting ────────────────────────────────────────────────────
// Keeps a list of submission timestamps per IP address.
// Automatically cleans up entries older than the window on every request.
const RATE_WINDOW_MS  = 60 * 60 * 1000; // 1 hour
const RATE_MAX_HITS   = 5;              // max 5 reports per IP per hour
const ipTimestamps    = new Map<string, number[]>();

function getClientIp(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ??
    req.socket?.remoteAddress ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now    = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const hits   = (ipTimestamps.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_MAX_HITS) return true;
  hits.push(now);
  ipTimestamps.set(ip, hits);
  return false;
}

// Periodically purge entries that are entirely outside the window to avoid unbounded growth.
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, times] of ipTimestamps) {
    const fresh = times.filter((t) => t > cutoff);
    if (fresh.length === 0) ipTimestamps.delete(ip);
    else ipTimestamps.set(ip, fresh);
  }
}, 10 * 60 * 1000); // clean up every 10 minutes

// ── Routes ───────────────────────────────────────────────────────────────────

router.get("/corrections", async (req, res) => {
  const parsed = ListCorrectionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }
  const { limit = 20 } = parsed.data;

  const rows = await db
    .select()
    .from(correctionsTable)
    .orderBy(desc(correctionsTable.createdAt))
    .limit(limit ?? 20);

  return res.json(rows.map(formatCorrection));
});

router.post("/corrections", async (req, res) => {
  // ── Rate limit check ──────────────────────────────────────────────────────
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    req.log.warn({ ip }, "Rate limit hit on POST /corrections");
    return res.status(429).json({
      error: "Too many reports from this address. Please wait before submitting again.",
    });
  }

  const parsed = CreateCorrectionBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body" });
  }

  const { actualWeatherType, officialWeatherType, description, locationName } = parsed.data;
  const [row] = await db
    .insert(correctionsTable)
    .values({
      actualWeatherType,
      officialWeatherType,
      description:  description  ?? null,
      locationName: locationName ?? null,
    })
    .returning();

  return res.status(201).json(formatCorrection(row));
});

router.get("/corrections/summary", async (_req, res) => {
  const recentCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(correctionsTable);

  const disagreements = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(correctionsTable)
    .where(
      sql`${correctionsTable.actualWeatherType} != ${correctionsTable.officialWeatherType} AND ${correctionsTable.createdAt} >= ${recentCutoff}`
    );

  const topActual = await db
    .select({
      actualWeatherType: correctionsTable.actualWeatherType,
      count: sql<number>`count(*)::int`,
    })
    .from(correctionsTable)
    .where(sql`${correctionsTable.createdAt} >= ${recentCutoff}`)
    .groupBy(correctionsTable.actualWeatherType)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  return res.json({
    totalCorrections:    totalResult[0]?.count ?? 0,
    activeDisagreements: disagreements[0]?.count ?? 0,
    mostReportedActual:  topActual[0]?.actualWeatherType ?? null,
  });
});

router.post("/corrections/:id/agree", async (req, res) => {
  const parsed = AgreeWithCorrectionParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const { id } = parsed.data;
  const [updated] = await db
    .update(correctionsTable)
    .set({ agrees: sql`${correctionsTable.agrees} + 1` })
    .where(eq(correctionsTable.id, id))
    .returning();
  if (!updated) {
    return res.status(404).json({ error: "Correction not found" });
  }
  return res.json(formatCorrection(updated));
});

function formatCorrection(row: typeof correctionsTable.$inferSelect) {
  return {
    id:                  row.id,
    actualWeatherType:   row.actualWeatherType,
    officialWeatherType: row.officialWeatherType,
    description:         row.description  ?? null,
    locationName:        row.locationName ?? null,
    agrees:              row.agrees,
    createdAt:           row.createdAt.toISOString(),
  };
}

export default router;
