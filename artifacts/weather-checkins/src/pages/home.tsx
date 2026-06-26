import { Show, useClerk, useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { OfficialWeather } from "@/components/official-weather";
import { CorrectionFeed } from "@/components/correction-feed";
import { CreateCorrectionForm, CreateCorrectionDialog } from "@/components/create-correction-form";
import { PrecipitationChart } from "@/components/precipitation-chart";
import { WeatherRadar } from "@/components/weather-radar";
import { WeatherAlerts } from "@/components/weather-alerts";
import { WeatherDetails } from "@/components/weather-details";
import { WeeklyForecast } from "@/components/weekly-forecast";
import { HourlyForecastStrip } from "@/components/hourly-forecast";
import { useWeather } from "@/hooks/use-weather";
import { useAlerts } from "@/hooks/use-alerts";
import { useAirQuality } from "@/hooks/use-air-quality";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1.5">
        {user?.imageUrl && (
          <img
            src={user.imageUrl}
            alt={user.firstName ?? "User"}
            className="w-5 h-5 rounded-full object-cover"
          />
        )}
        <span className="text-sm font-semibold text-foreground">
          {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "You"}
        </span>
      </div>
      <button
        onClick={() => signOut({ redirectUrl: basePath || "/" })}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
      >
        Sign out
      </button>
    </div>
  );
}

function SignInPrompt() {
  const [, setLocation] = useLocation();

  return (
    <div className="rounded-2xl border border-border bg-muted/30 px-5 py-5 text-center">
      <p className="text-base font-semibold text-foreground mb-1">See something different outside? 👀</p>
      <p className="text-sm text-muted-foreground mb-4">Sign in to report what the weather is really like in your neighborhood.</p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setLocation("/sign-in")}
          className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          Sign in
        </button>
        <button
          onClick={() => setLocation("/sign-up")}
          className="px-5 py-2 rounded-full border border-border text-sm font-bold hover:bg-muted transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
}

export function Home() {
  const weather = useWeather();
  const { hourlyPrecip, precipitationChance, lat, lon, loading } = weather;
  const { alerts, supported: alertsSupported } = useAlerts(lat, lon);
  const airQuality = useAirQuality(lat, lon);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20 selection:text-primary pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight">
            Neighbor Weather
          </h1>

          <Show when="signed-in">
            <UserMenu />
          </Show>

          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLocation("/sign-in")}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                Sign in
              </button>
              <button
                onClick={() => setLocation("/sign-up")}
                className="text-sm font-bold px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign up
              </button>
            </div>
          </Show>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Official forecast */}
        <section>
          <OfficialWeather />
        </section>

        {/* Severe weather alerts */}
        {alertsSupported && (
          alerts.length > 0
            ? <WeatherAlerts alerts={alerts} />
            : (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">No active weather alerts for your area</p>
              </div>
            )
        )}

        {/* Hourly forecast strip */}
        {!loading && weather.hourlyForecast.length > 0 && (
          <section>
            <HourlyForecastStrip hours={weather.hourlyForecast} />
          </section>
        )}

        {/* 7-day forecast */}
        {!loading && weather.forecast.length > 0 && (
          <section>
            <WeeklyForecast days={weather.forecast} />
          </section>
        )}

        {/* Weather details grid */}
        {!loading && (
          <section className="bg-card rounded-2xl border border-border p-5">
            <WeatherDetails weather={weather} airQuality={airQuality} />
          </section>
        )}

        {/* Precipitation chart */}
        {!loading && (
          <section>
            <PrecipitationChart data={hourlyPrecip} currentChance={precipitationChance} />
          </section>
        )}

        {/* Live radar map */}
        <section>
          <WeatherRadar lat={lat} lon={lon} />
        </section>

        {/* Neighbor corrections */}
        <section className="space-y-6 pt-4">
          <CorrectionFeed />
        </section>

        {/* Correction form — signed in: show form | signed out: prompt */}
        <section>
          <Show when="signed-in">
            <div className="hidden md:block bg-muted/30 rounded-3xl p-6 border border-border">
              <h2 className="text-2xl font-display font-bold mb-6 text-foreground text-center">See something different?</h2>
              <CreateCorrectionForm />
            </div>
          </Show>
          <Show when="signed-out">
            <SignInPrompt />
          </Show>
        </section>
      </main>

      {/* Mobile floating correction button — only when signed in */}
      <Show when="signed-in">
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <CreateCorrectionDialog />
          </div>
        </div>
      </Show>
    </div>
  );
}
