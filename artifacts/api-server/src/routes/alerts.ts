import { Router } from "express";

const router = Router();

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  instruction: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";
  urgency: string;
  areaDesc: string;
  effective: string;
  expires: string;
}

router.get("/alerts", async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  // NWS only covers US territory — return empty outside bounding box
  if (lat < 17 || lat > 72 || lon < -180 || lon > -60) {
    return res.json({ alerts: [], count: 0 });
  }

  try {
    const nwsRes = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
      {
        headers: {
          "User-Agent": "WeatherAxis/1.0 (contact@weatheraxis.app)",
          Accept: "application/geo+json",
        },
      }
    );

    if (!nwsRes.ok) {
      return res.json({ alerts: [], count: 0 });
    }

    const data = await nwsRes.json() as Record<string, unknown>;
    const features = (data.features as Array<Record<string, unknown>>) ?? [];

    const alerts: WeatherAlert[] = features.map((f) => {
      const p = f.properties as Record<string, unknown>;
      return {
        id: (f.id as string) ?? String(Math.random()),
        event: (p.event as string) ?? "Weather Alert",
        headline: ((p.headline as string) ?? "").replace(/\s+/g, " ").trim(),
        description: ((p.description as string) ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 600),
        instruction: ((p.instruction as string) ?? "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 400),
        severity: (p.severity as WeatherAlert["severity"]) ?? "Unknown",
        urgency: (p.urgency as string) ?? "Unknown",
        areaDesc: (p.areaDesc as string) ?? "",
        effective: (p.effective as string) ?? "",
        expires: (p.expires as string) ?? "",
      };
    });

    return res.json({ alerts, count: alerts.length });
  } catch {
    return res.json({ alerts: [], count: 0 });
  }
});

export default router;
