import { ExternalLink, Newspaper } from "lucide-react";
import { useLocalNews } from "@/hooks/use-local-news";

interface Props {
  lat: number;
  lon: number;
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-muted rounded-md w-full" />
            <div className="h-3.5 bg-muted rounded-md w-4/5" />
            <div className="h-3 bg-muted/60 rounded-md w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LocalNews({ lat, lon }: Props) {
  const { city, region, articles, loading, error, timeAgo } = useLocalNews(lat, lon);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-foreground text-base">
            {city && region ? `${city}, ${region}` : "Local News"}
          </h3>
        </div>
        {city && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            via Google News
          </span>
        )}
      </div>

      <div className="px-5 pb-5">
        {loading && <Skeleton />}

        {error && (
          <p className="text-sm text-muted-foreground py-4 text-center">{error}</p>
        )}

        {!loading && !error && articles.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent stories found.</p>
        )}

        {!loading && !error && articles.length > 0 && (
          <ul className="divide-y divide-border">
            {articles.map((article, i) => (
              <li key={i}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 py-3.5 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </p>
                    {article.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      {article.source && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-primary/80">
                          {article.source}
                        </span>
                      )}
                      {article.source && article.pubDate && (
                        <span className="text-[10px] text-muted-foreground">·</span>
                      )}
                      {article.pubDate && (
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(article.pubDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
