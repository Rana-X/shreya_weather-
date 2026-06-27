import { useState, useEffect } from "react";
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
import { LocalNews } from "@/components/local-news";
import { CitySearch } from "@/components/city-search";
import { useWeather } from "@/hooks/use-weather";
import { useAlerts } from "@/hooks/use-alerts";
import { useAirQuality } from "@/hooks/use-air-quality";
import { useReverseGeocode } from "@/hooks/use-reverse-geocode";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useSavedLocations } from "@/hooks/use-saved-locations";
import { useNotifications } from "@/hooks/use-notifications";
import { type CityResult } from "@/hooks/use-city-search";
import {
  Sun, Moon, Star, StarOff, Bell, BellOff, MapPin, X,
} from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-muted/60 rounded-full px-3 py-1.5">
        {user?.imageUrl && (
          <img src={user.imageUrl} alt={user.firstName ?? "User"} className="w-5 h-5 rounded-full object-cover" />
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
        <button onClick={() => setLocation("/sign-in")}
          className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
          Sign in
        </button>
        <button onClick={() => setLocation("/sign-up")}
          className="px-5 py-2 rounded-full border border-border text-sm font-bold hover:bg-muted transition-colors">
          Create account
        </button>
      </div>
    </div>
  );
}

export function Home() {
  const [, setLocation] = useLocation();

  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const locationOverride = selectedCity ? { lat: selectedCity.lat, lon: selectedCity.lon } : null;

  const weather = useWeather(locationOverride);
  const { hourlyPrecip, precipitationChance, lat, lon, loading } = weather;
  const { alerts, supported: alertsSupported } = useAlerts(lat, lon);
  const airQuality = useAirQuality(lat, lon);

  const gpsName = useReverseGeocode(selectedCity ? 0 : lat, selectedCity ? 0 : lon);
  const locationName = selectedCity ? selectedCity.display : gpsName;

  // ── Feature hooks ────────────────────────────────────────────────────────
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { saved, isSaved, add: saveLocation, remove: removeLocation } = useSavedLocations();
  const { status: notifStatus, request: requestNotif, watchWeather } = useNotifications();

  // Fire notifications when weather type changes.
  useEffect(() => {
    if (!loading && weather.type) watchWeather(weather.type, locationName ?? "your area");
  }, [weather.type, loading]);

  const currentlySaved = isSaved(selectedCity);

  const handleStarClick = () => {
    if (!selectedCity) return;
    if (currentlySaved) removeLocation({ lat: selectedCity.lat, lon: selectedCity.lon, display: selectedCity.display, name: selectedCity.name });
    else saveLocation(selectedCity);
  };

  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20 selection:text-primary pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-2">

          {/* Left: logo + dark mode toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight">WeatherAxis</h1>
            <button
              onClick={toggleDark}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Centre: city search */}
          <div className="flex-1 flex justify-center">
            <CitySearch
              selectedCity={selectedCity}
              onSelect={(city) => setSelectedCity(city)}
              onMyLocation={() => setSelectedCity(null)}
            />
          </div>

          {/* Right: save star + notification bell + auth */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Star — only when a city is selected */}
            {selectedCity && (
              <button
                onClick={handleStarClick}
                title={currentlySaved ? "Remove saved location" : "Save this location"}
                className={`p-1.5 rounded-full transition-colors ${currentlySaved ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground hover:text-yellow-400"} hover:bg-muted`}
              >
                {currentlySaved ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
              </button>
            )}

            {/* Notification bell */}
            {notifStatus !== "unsupported" && notifStatus !== "denied" && (
              <button
                onClick={notifStatus === "default" ? requestNotif : undefined}
                title={notifStatus === "granted" ? "Notifications on" : "Turn on notifications"}
                className={`p-1.5 rounded-full transition-colors hover:bg-muted ${notifStatus === "granted" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              >
                {notifStatus === "granted" ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
            )}

            <Show when="signed-in"><UserMenu /></Show>
            <Show when="signed-out">
              <div className="flex items-center gap-1">
                <button onClick={() => setLocation("/sign-in")}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted">
                  Sign in
                </button>
                <button onClick={() => setLocation("/sign-up")}
                  className="text-sm font-bold px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Sign up
                </button>
              </div>
            </Show>
          </div>
        </div>

        {/* Saved locations pill bar */}
        {saved.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Saved</span>
            {saved.map((loc) => {
              const isActive = selectedCity && Math.abs(selectedCity.lat - loc.lat) < 0.01;
              return (
                <div key={`${loc.lat}-${loc.lon}`} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setSelectedCity({ id: 0, name: loc.name, admin1: "", country: "", lat: loc.lat, lon: loc.lon, display: loc.display })}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    {loc.name}
                  </button>
                  <button
                    onClick={() => removeLocation(loc)}
                    className="p-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <section>
          <OfficialWeather weather={weather} locationName={locationName} />
        </section>

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

        {!loading && weather.hourlyForecast.length > 0 && (
          <section><HourlyForecastStrip hours={weather.hourlyForecast} /></section>
        )}

        {!loading && weather.forecast.length > 0 && (
          <section><WeeklyForecast days={weather.forecast} /></section>
        )}

        {!loading && (
          <section className="bg-card rounded-2xl border border-border p-5">
            <WeatherDetails weather={weather} airQuality={airQuality} />
          </section>
        )}

        {!loading && (
          <section>
            <PrecipitationChart data={hourlyPrecip} currentChance={precipitationChance} />
          </section>
        )}

        <section>
          <WeatherRadar lat={lat} lon={lon} locationName={locationName} isStormy={weather.type === "stormy"} />
        </section>

        {!loading && (
          <section><LocalNews lat={lat} lon={lon} /></section>
        )}

        <section className="space-y-6 pt-4">
          <CorrectionFeed />
        </section>

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
