import { Router } from "express";

const router = Router();

function extractCdata(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.*?)\\]\\]></${tag}>`, "s").exec(xml);
  if (cdata) return cdata[1].trim();
  const plain = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "s").exec(xml);
  return plain ? plain[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const m = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i").exec(xml);
  return m ? m[1] : "";
}

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")      // strip HTML tags
    .replace(/&lt;/g, "<")         // decode entities
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")      // strip again after entity decode
    .replace(/https?:\/\/\S+/g, "") // remove bare URLs
    .replace(/\s{2,}/g, " ")       // collapse whitespace
    .trim();
}

function parseRssItems(xml: string) {
  const items: string[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) items.push(m[1]);

  return items.slice(0, 8).map((item) => {
    const rawTitle = extractCdata(item, "title");
    // Google News appends " - Source Name" to titles — strip it
    const title = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim();
    const rawDesc = extractCdata(item, "description");
    // Description is usually another copy of the headline link — skip it if it
    // matches the title, otherwise clean and show a snippet
    const desc = cleanText(rawDesc);
    const descSnippet = desc.startsWith(title.slice(0, 20)) ? "" : desc.slice(0, 180);

    return {
      title,
      url: extractCdata(item, "link") || extractAttr(item, "link", "href"),
      source: extractCdata(item, "source") || extractAttr(item, "source", ""),
      pubDate: extractCdata(item, "pubDate"),
      description: descSnippet,
    };
  });
}

router.get("/news", async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  try {
    // Step 1: reverse geocode (free, no key)
    const geoRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const geo = await geoRes.json() as Record<string, string>;
    const city = geo.city || geo.locality || geo.principalSubdivision || "local";
    const region = geo.principalSubdivision || "";

    // Step 2: Google News RSS — weather-focused query for the location
    const query = encodeURIComponent(`weather ${city} ${region} storm forecast`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    const rssRes = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Strata/1.0)" },
    });
    const xml = await rssRes.text();
    const articles = parseRssItems(xml);

    return res.json({ city, region, articles });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});

export default router;
