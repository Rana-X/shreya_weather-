import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import type { InsertUser } from "@workspace/db";

export class Storage {
  async getUserById(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user ?? null;
  }

  async upsertUser(data: InsertUser) {
    const [user] = await db
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: data.email,
          stripeCustomerId: data.stripeCustomerId,
          stripeSubscriptionId: data.stripeSubscriptionId,
        },
      })
      .returning();
    return user;
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] ?? null;
  }

  async listProductsWithPrices() {
    const result = await db.execute(sql`
      WITH paginated_products AS (
        SELECT id, name, description, metadata, active
        FROM stripe.products
        WHERE active = true
        ORDER BY id
      )
      SELECT
        p.id          AS product_id,
        p.name        AS product_name,
        p.description AS product_description,
        p.metadata    AS product_metadata,
        pr.id         AS price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active     AS price_active
      FROM paginated_products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      ORDER BY p.id, pr.unit_amount
    `);
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] ?? null;
  }

  async getActiveSubscriptionForCustomer(customerId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE customer = ${customerId} AND status = 'active' LIMIT 1`
    );
    return result.rows[0] ?? null;
  }
}

export const storage = new Storage();
