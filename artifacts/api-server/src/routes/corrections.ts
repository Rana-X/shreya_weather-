import { Router } from "express";
import { db, correctionsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import {
  CreateCorrectionBody,
  ListCorrectionsQueryParams,
  AgreeWithCorrectionParams,
} from "@workspace/api-zod";

const router = Router();

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
      description: description ?? null,
      locationName: locationName ?? null,
    })
    .returning();
  return res.status(201).json(formatCorrection(row));
});

router.get("/corrections/summary", async (_req, res) => {
  const recentCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // last 2 hours

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
    totalCorrections: totalResult[0]?.count ?? 0,
    activeDisagreements: disagreements[0]?.count ?? 0,
    mostReportedActual: topActual[0]?.actualWeatherType ?? null,
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
    id: row.id,
    actualWeatherType: row.actualWeatherType,
    officialWeatherType: row.officialWeatherType,
    description: row.description ?? null,
    locationName: row.locationName ?? null,
    agrees: row.agrees,
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
