import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Show, useUser } from "@clerk/react";
import { useSubscription } from "@/hooks/use-subscription";
import {
  Check, Star, Wind, Thermometer, Calendar, MapPin,
  Bell, Zap, ArrowLeft, Loader2, Crown, XCircle,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const FEATURES_FREE = [
  "Current location + city search",
  "7-day forecast",
  "Hourly forecast",
  "Rain radar",
  "Weather news",
  "Community corrections",
];

const FEATURES_PREMIUM = [
  { icon: Wind,        label: "Wind speed radar layer" },
  { icon: Thermometer, label: "Air temperature radar layer" },
  { icon: Calendar,    label: "14-day extended forecast" },
  { icon: MapPin,      label: "Save up to 10 locations" },
  { icon: Bell,        label: "Severe weather email alerts" },
  { icon: Zap,         label: "Radar updates every 5 minutes" },
];

type Interval = "month" | "year";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string };
}

interface Product {
  id: string;
  name: string;
  description: string;
  prices: Price[];
}

export function PremiumPage() {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useUser();
  const { isPremium, loading: subLoading } = useSubscription();
  const [interval, setInterval] = useState<Interval>("year");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  useEffect(() => {
    fetch("/api/stripe/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data.data ?? []); setLoadingProducts(false); })
      .catch(() => setLoadingProducts(false));
  }, []);

  const premium = products.find((p) =>
    p.name.toLowerCase().includes("premium") || p.name.toLowerCase().includes("strata")
  );

  const activePrice = premium?.prices.find((p) => p.recurring?.interval === interval);
  const otherPrice  = premium?.prices.find((p) => p.recurring?.interval !== interval);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const startCheckout = async () => {
    if (!activePrice) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: activePrice.id }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setCheckingOut(false);
    }
  };

  const openPortal = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setManagingBilling(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight">
            Strata <span className="text-primary">Premium</span>
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Success / cancelled banners */}
        {success && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 flex items-center gap-3">
            <Crown className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              🎉 Welcome to Premium! Your new features are active.
            </p>
          </div>
        )}
        {cancelled && (
          <div className="bg-muted rounded-2xl px-5 py-4">
            <p className="text-sm text-muted-foreground">Checkout cancelled — no charges were made.</p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-2">
            <Star className="w-4 h-4" />
            Strata Premium
          </div>
          <h2 className="text-3xl font-display font-extrabold text-foreground">
            See the full picture
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Wind speed maps, temperature radar, extended forecasts, and more — all in one beautiful app.
          </p>
        </div>

        {/* Billing interval toggle */}
        <div className="flex justify-center">
          <div className="flex bg-muted rounded-full p-1 gap-1">
            {(["month", "year"] as Interval[]).map((iv) => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  interval === iv
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {iv === "month" ? "Monthly" : "Yearly"}
                {iv === "year" && (
                  <span className="ml-1.5 text-[10px] bg-green-500 text-white rounded-full px-1.5 py-0.5">
                    SAVE 37%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing card */}
        <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Premium</p>
              {loadingProducts ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : activePrice ? (
                <div>
                  <span className="text-4xl font-display font-extrabold text-foreground">
                    {fmt(activePrice.unit_amount)}
                  </span>
                  <span className="text-muted-foreground ml-1 text-sm">
                    / {interval === "month" ? "month" : "year"}
                  </span>
                  {interval === "year" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      That's just {fmt(Math.round(activePrice.unit_amount / 12))}/month
                    </p>
                  )}
                  {otherPrice && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Or {fmt(otherPrice.unit_amount)}/{otherPrice.recurring.interval}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Loading pricing…</p>
              )}
            </div>
            <Crown className="w-8 h-8 text-primary" />
          </div>

          {/* Premium features */}
          <ul className="space-y-3 mb-6">
            {FEATURES_PREMIUM.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </li>
            ))}
            <li className="flex items-center gap-3 opacity-50">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Everything in Free</span>
            </li>
          </ul>

          {/* CTA */}
          {subLoading ? (
            <div className="w-full h-12 rounded-full bg-muted animate-pulse" />
          ) : isPremium ? (
            <div className="space-y-3">
              <div className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <Crown className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700 dark:text-green-400 text-sm">You're a Premium member!</span>
              </div>
              <button
                onClick={openPortal}
                disabled={managingBilling}
                className="w-full py-3 rounded-full border border-border text-sm font-bold hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                {managingBilling && <Loader2 className="w-4 h-4 animate-spin" />}
                Manage billing &amp; payment
              </button>
              <button
                onClick={openPortal}
                disabled={managingBilling}
                className="w-full py-2.5 rounded-full border border-red-200 dark:border-red-900 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel subscription
              </button>
            </div>
          ) : (
            <Show
              when="signed-in"
              fallback={
                <button
                  onClick={() => setLocation("/sign-in")}
                  className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors"
                >
                  Sign in to upgrade
                </button>
              }
            >
              <button
                onClick={startCheckout}
                disabled={checkingOut || !activePrice}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                {checkingOut ? "Redirecting to checkout…" : `Upgrade for ${activePrice ? fmt(activePrice.unit_amount) : "…"}/${interval === "month" ? "mo" : "yr"}`}
              </button>
            </Show>
          )}

          <p className="text-center text-xs text-muted-foreground mt-3">
            Cancel anytime · Secure checkout by Stripe
          </p>
        </div>

        {/* Free plan comparison */}
        <div className="bg-muted/40 border border-border rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Free — always</p>
          <ul className="space-y-2">
            {FEATURES_FREE.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Questions? Email us at help@strata.app
        </p>
      </main>
    </div>
  );
}
