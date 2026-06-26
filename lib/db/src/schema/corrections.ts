import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const correctionsTable = pgTable("corrections", {
  id: serial("id").primaryKey(),
  actualWeatherType: text("actual_weather_type").notNull(),
  officialWeatherType: text("official_weather_type").notNull(),
  description: text("description"),
  locationName: text("location_name"),
  agrees: integer("agrees").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCorrectionSchema = createInsertSchema(correctionsTable).omit({
  id: true,
  agrees: true,
  createdAt: true,
});
export type InsertCorrection = z.infer<typeof insertCorrectionSchema>;
export type Correction = typeof correctionsTable.$inferSelect;
