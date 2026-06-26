import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import app from "./app";
import { logger } from "./lib/logger";

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  try {
    logger.info("Initializing Stripe schema...");
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();

    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    await stripeSync.findOrCreateManagedWebhook(`${webhookBaseUrl}/api/stripe/webhook`);
    logger.info("Stripe webhook configured");

    // Non-blocking backfill
    stripeSync.syncBackfill()
      .then(() => logger.info("Stripe backfill complete"))
      .catch((err) => logger.error({ err }, "Stripe backfill error"));
  } catch (err) {
    logger.error({ err }, "Stripe init failed (continuing without Stripe)");
    // Don't crash the server if Stripe isn't connected yet
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
