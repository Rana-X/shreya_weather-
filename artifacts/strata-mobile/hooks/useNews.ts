import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/LocationContext";

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  pubDate: string;
  description: string;
}

export interface NewsData {
  city: string;
  region: string;
  articles: NewsArticle[];
}

const API_BASE =
  typeof process !== "undefined" && process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
    : "";

async function fetchNews(lat: number, lon: number): Promise<NewsData> {
  const res = await fetch(`${API_BASE}/api/news?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("News fetch failed");
  return res.json();
}

export function useNews() {
  const { lat, lon } = useLocation();

  return useQuery<NewsData>({
    queryKey: ["news", lat, lon],
    queryFn: () => fetchNews(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
