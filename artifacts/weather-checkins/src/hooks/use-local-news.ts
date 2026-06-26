import { useState, useEffect } from "react";

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  pubDate: string;
  description: string;
}

export interface LocalNewsData {
  city: string;
  region: string;
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function useLocalNews(lat: number, lon: number) {
  const [data, setData] = useState<LocalNewsData>({
    city: "",
    region: "",
    articles: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!lat || !lon) return;
    setData((d) => ({ ...d, loading: true, error: null }));

    fetch(`/api/news?lat=${lat}&lon=${lon}`)
      .then((r) => r.json())
      .then((json) => {
        setData({
          city: json.city ?? "",
          region: json.region ?? "",
          articles: json.articles ?? [],
          loading: false,
          error: null,
        });
      })
      .catch(() =>
        setData((d) => ({ ...d, loading: false, error: "Could not load news" }))
      );
  }, [lat, lon]);

  return { ...data, timeAgo };
}
