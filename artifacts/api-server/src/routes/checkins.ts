import { Router } from "express";
import { db, checkinsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { CreateCheckinBody, ListCheckinsQueryParams, AgreeWithCheckinParams } from "@workspace/api-zod";

const router = Router();

router.get("/checkins", async (req, res) => {
  const parsed = ListCheckinsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }
  const { limit = 20, weatherType } = parsed.data;
  let query = db
    .select()
    .from(checkinsTable)
    .orderBy(desc(checkinsTable.createdAt))
    .limit(limit ?? 20);

  if (weatherType) {
    const rows = await db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.weatherType, weatherType))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limit ?? 20);
    return res.json(rows.map(formatCheckin));
  }

  const rows = await query;
  return res.json(rows.map(formatCheckin));
});

router.post("/checkins", async (req, res) => {
  const parsed = CreateCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body" });
  }
  const { weatherType, description, locationName } = parsed.data;
  const [row] = await db
    .insert(checkinsTable)
    .values({
      weatherType,
      description: description ?? null,
      locationName: locationName ?? null,
    })
    .returning();
  return res.status(201).json(formatCheckin(row));
});

router.get("/checkins/summary", async (_req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const allCounts = await db
    .select({
      weatherType: checkinsTable.weatherType,
      count: sql<number>`count(*)::int`,
    })
    .from(checkinsTable)
    .groupBy(checkinsTable.weatherType)
    .orderBy(desc(sql`count(*)`));

  const todayCounts = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(checkinsTable)
    .where(sql`${checkinsTable.createdAt} >= ${startOfDay}`);

  const totalToday = todayCounts[0]?.count ?? 0;
  const mostCommon = allCounts[0]?.weatherType ?? null;

  return res.json({
    items: allCounts,
    totalToday,
    mostCommon,
  });
});

router.post("/checkins/:id/agree", async (req, res) => {
  const parsed = AgreeWithCheckinParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const { id } = parsed.data;
  const [updated] = await db
    .update(checkinsTable)
    .set({ agrees: sql`${checkinsTable.agrees} + 1` })
    .where(eq(checkinsTable.id, id))
    .returning();
  if (!updated) {
    return res.status(404).json({ error: "Check-in not found" });
  }
  return res.json(formatCheckin(updated));
});

function formatCheckin(row: typeof checkinsTable.$inferSelect) {
  return {
    id: row.id,
    weatherType: row.weatherType,
    description: row.description ?? null,
    locationName: row.locationName ?? null,
    agrees: row.agrees,
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
