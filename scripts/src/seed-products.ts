import { getUncachableStripeClient } from "./stripeClient.js";

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  // Check if Premium already exists
  const existing = await stripe.products.search({
    query: "name:'Strata Premium' AND active:'true'",
  });

  if (existing.data.length > 0) {
    console.log("Strata Premium already exists:", existing.data[0].id);
    const prices = await stripe.prices.list({ product: existing.data[0].id, active: true });
    prices.data.forEach((p) =>
      console.log(`  Price: ${p.id} — $${(p.unit_amount! / 100).toFixed(2)} / ${(p.recurring?.interval ?? "one-time")}`)
    );
    return;
  }

  console.log("Creating Strata Premium product...");

  const product = await stripe.products.create({
    name: "Strata Premium",
    description: "Unlock wind & temperature radar, 14-day forecasts, saved locations, and more.",
    metadata: { tier: "premium" },
  });
  console.log("Created product:", product.id);

  const monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: 399,       // $3.99
    currency: "usd",
    recurring: { interval: "month" },
    nickname: "Premium Monthly",
  });
  console.log("Created monthly price:", monthly.id, "($3.99/mo)");

  const yearly = await stripe.prices.create({
    product: product.id,
    unit_amount: 2999,      // $29.99  (~37% savings)
    currency: "usd",
    recurring: { interval: "year" },
    nickname: "Premium Yearly",
  });
  console.log("Created yearly price:", yearly.id, "($29.99/yr)");

  console.log("\n✅ Done! Webhooks will sync these to your database automatically.");
  console.log(`Monthly price ID: ${monthly.id}`);
  console.log(`Yearly  price ID: ${yearly.id}`);
}

seedProducts().catch((err) => {
  console.error(err);
  process.exit(1);
});
