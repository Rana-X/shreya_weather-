import { getUncachableStripeClient } from "./stripeClient";

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.customers.create({ email, metadata: { userId } });
  }

  async createCheckoutSession(
    customerId: string | undefined,
    customerEmail: string | undefined,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.create({
      ...(customerId ? { customer: customerId } : {}),
      ...(customerEmail && !customerId ? { customer_email: customerEmail } : {}),
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  }
}

export const stripeService = new StripeService();
