import { useState, useRef, useCallback } from "react";

export type NotifStatus = "default" | "granted" | "denied" | "unsupported";

export function useNotifications() {
  const [status, setStatus] = useState<NotifStatus>(() => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission as NotifStatus;
  });
  const lastTypeRef = useRef<string | null>(null);

  const request = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setStatus(result as NotifStatus);
  };

  const watchWeather = useCallback((type: string | null, locationName: string) => {
    if (status !== "granted" || !type) return;
    const prev = lastTypeRef.current;
    lastTypeRef.current = type;
    if (prev === null || prev === type) return;

    if (type === "stormy") {
      new Notification("⚡ Thunderstorm starting!", {
        body: `Storm detected near ${locationName}. Stay safe!`,
        icon: "/favicon.svg",
        tag: "strata-storm",
      });
    } else if (type === "rainy" && prev !== "rainy") {
      new Notification("🌧️ Rain is starting", {
        body: `It's beginning to rain near ${locationName}.`,
        icon: "/favicon.svg",
        tag: "strata-rain",
      });
    } else if ((prev === "rainy" || prev === "stormy") && type === "sunny") {
      new Notification("☀️ It cleared up!", {
        body: `Looks like the weather improved near ${locationName}.`,
        icon: "/favicon.svg",
        tag: "strata-clear",
      });
    }
  }, [status]);

  return { status, request, watchWeather };
}
