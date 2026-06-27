import { formatDistanceToNow } from "date-fns";
import { Correction, useAgreeWithCorrection, getListCorrectionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";
import { MapPin, ThumbsUp } from "lucide-react";

interface CorrectionCardProps {
  correction: Correction;
}

const AVATAR_COLORS = [
  "bg-sky-400", "bg-violet-400", "bg-emerald-400",
  "bg-orange-400", "bg-pink-400", "bg-teal-400",
];

const WEATHER_EMOJI: Record<string, string> = {
  sunny: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️",
  stormy: "⛈️", foggy: "🌫️", windy: "💨",
};

function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function CorrectionCard({ correction }: CorrectionCardProps) {
  const queryClient = useQueryClient();
  const agreeMutation = useAgreeWithCorrection();

  const handleAgree = () => {
    agreeMutation.mutate(
      { id: correction.id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCorrectionsQueryKey() }) },
    );
  };

  const timeAgo = formatDistanceToNow(new Date(correction.createdAt), { addSuffix: true });
  const seed    = correction.locationName ?? "neighbor";
  const color   = AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
  const emoji   = WEATHER_EMOJI[correction.actualWeatherType] ?? "🌡️";

  return (
    <div className="bg-card rounded-2xl p-4 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${color} flex items-center justify-center text-lg shadow-sm`}>
          {emoji}
        </div>

        <div className="flex-grow min-w-0">
          {/* Name + time */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-bold text-foreground">
              A neighbor
              {correction.locationName ? (
                <span className="font-normal text-muted-foreground"> in {correction.locationName}</span>
              ) : null}
            </span>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{timeAgo}</span>
          </div>

          {/* Main message */}
          <p className="text-sm text-foreground mb-1">
            It's actually{" "}
            <span className="font-bold">{getWeatherLabel(correction.actualWeatherType)}</span>
            {" "}—{" "}
            <span className="text-muted-foreground line-through text-xs">
              forecast said {getWeatherLabel(correction.officialWeatherType)}
            </span>
          </p>

          {correction.description && (
            <p className="text-sm text-muted-foreground italic mb-2">"{correction.description}"</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {correction.locationName || "Nearby"}
            </div>

            <button
              onClick={handleAgree}
              disabled={agreeMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-border bg-muted hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50"
            >
              <ThumbsUp className={`w-3 h-3 ${agreeMutation.isPending ? "animate-bounce" : ""}`} />
              Same here! {correction.agrees > 0 && `(${correction.agrees})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
