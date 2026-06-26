import { Router } from "express";
import { storage } from "../storage";
import { stripeService } from "../stripeService";

const router = Router();

// GET /api/stripe/products — list all active products with prices
router.get("/stripe/products", async (_req, res) => {
  const rows = await storage.listProductsWithPrices();
  const map = new Map<string, { id: string; name: string; description: string; prices: unknown[] }>();
  for (const row of rows as Record<string, unknown>[]) {
    const pid = row.product_id as string;
    if (!map.has(pid)) {
      map.set(pid, {
        id: pid,
        name: row.product_name as string,
        description: (row.product_description as string) ?? "",
        prices: [],
      });
    }
    if (row.price_id) {
      map.get(pid)!.prices.push({
        id: row.price_id,
        unit_amount: row.unit_amount,
        currency: row.currency,
        recurring: row.recurring,
      });
    }
  }
  res.json({ data: Array.from(map.values()) });
});

// GET /api/stripe/subscription — current user's subscription status
router.get("/stripe/subscription", async (req: any, res) => {
  const userId = req.auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await storage.getUserById(userId);
  if (!user?.stripeCustomerId) { res.json({ isPremium: false, subscription: null }); return; }

  const subscription = await storage.getActiveSubscriptionForCustomer(user.stripeCustomerId);
  res.json({ isPremium: !!subscription, subscription: subscription ?? null });
});

// POST /api/stripe/checkout — start Stripe Checkout
router.post("/stripe/checkout", async (req: any, res) => {
  const userId = req.auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { priceId } = req.body as { priceId: string };
  if (!priceId) { res.status(400).json({ error: "priceId required" }); return; }

  const email = (req.auth?.sessionClaims?.email as string) ?? undefined;

  let user = await storage.getUserById(userId);
  let customerId = user?.stripeCustomerId ?? undefined;

  if (!customerId && email) {
    const customer = await stripeService.createCustomer(email, userId);
    user = await storage.upsertUser({ id: userId, email, stripeCustomerId: customer.id });
    customerId = customer.id;
  }

  const host = `${req.protocol}://${req.get("host")}`;
  const session = await stripeService.createCheckoutSession(
    customerId,
    email,
    priceId,
    `${host}/premium?success=true`,
    `${host}/premium?cancelled=true`
  );

  res.json({ url: session.url });
});

// POST /api/stripe/portal — manage subscription
router.post("/stripe/portal", async (req: any, res) => {
  const userId = req.auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const user = await storage.getUserById(userId);
  if (!user?.stripeCustomerId) { res.status(400).json({ error: "No billing account found" }); return; }

  const host = `${req.protocol}://${req.get("host")}`;
  const session = await stripeService.createPortalSession(user.stripeCustomerId, `${host}/premium`);
  res.json({ url: session.url });
});

export default router;
