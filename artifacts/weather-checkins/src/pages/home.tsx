import { OfficialWeather } from "@/components/official-weather";
import { CorrectionFeed } from "@/components/correction-feed";
import { CreateCorrectionForm, CreateCorrectionDialog } from "@/components/create-correction-form";
import { PrecipitationChart } from "@/components/precipitation-chart";
import { WeatherRadar } from "@/components/weather-radar";
import { WeatherAlerts } from "@/components/weather-alerts";
import { useWeather } from "@/hooks/use-weather";
import { useAlerts } from "@/hooks/use-alerts";

export function Home() {
  const { hourlyPrecip, precipitationChance, lat, lon, loading } = useWeather();
  const { alerts, supported: alertsSupported } = useAlerts(lat, lon);

  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20 selection:text-primary pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight">
            Neighbor Weather
          </h1>
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

        {/* Desktop correction form */}
        <section className="hidden md:block bg-muted/30 rounded-3xl p-6 border border-border mt-4">
          <h2 className="text-2xl font-display font-bold mb-6 text-foreground text-center">See something different?</h2>
          <CreateCorrectionForm />
        </section>
      </main>

      {/* Mobile floating correction button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <CreateCorrectionDialog />
        </div>
      </div>
    </div>
  );
}
