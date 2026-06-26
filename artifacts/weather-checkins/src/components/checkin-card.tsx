import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Checkin } from "@workspace/api-client-react/src/generated/api.schemas";
import { useAgreeWithCheckin, getListCheckinsQueryKey } from "@workspace/api-client-react";
import { MapPin, ThumbsUp } from "lucide-react";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";

interface CheckinCardProps {
  checkin: Checkin;
}

export function CheckinCard({ checkin }: CheckinCardProps) {
  const queryClient = useQueryClient();
  const agreeMutation = useAgreeWithCheckin();
  const [hasAgreedLocal, setHasAgreedLocal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAgree = () => {
    if (hasAgreedLocal || agreeMutation.isPending) return;
    
    setIsAnimating(true);
    setHasAgreedLocal(true);
    
    // Play animation then remove class
    setTimeout(() => setIsAnimating(false), 400);

    agreeMutation.mutate({ id: checkin.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCheckinsQueryKey() });
      },
      onError: () => {
        setHasAgreedLocal(false);
      }
    });
  };

  const totalAgrees = checkin.agrees + (hasAgreedLocal ? 1 : 0);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-card-border hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex gap-4">
        {/* Left column - Icon */}
        <div className="flex-shrink-0">
          <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center border border-border">
            <WeatherIcon weatherType={checkin.weatherType} className="w-8 h-8" />
          </div>
        </div>

        {/* Right column - Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                It's {getWeatherLabel(checkin.weatherType)}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-0.5 space-x-3">
                <span className="flex items-center gap-1">
                  {formatDistanceToNow(new Date(checkin.createdAt), { addSuffix: true })}
                </span>
                {checkin.locationName && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1 text-foreground/70 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{checkin.locationName}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {checkin.description && (
            <p className="mt-3 text-foreground/90 text-base leading-relaxed">
              "{checkin.description}"
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <button
              onClick={handleAgree}
              disabled={hasAgreedLocal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                hasAgreedLocal 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              } ${isAnimating ? "animate-bounce-slight" : ""}`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasAgreedLocal ? "fill-primary" : ""}`} />
              {hasAgreedLocal ? "Agreed!" : "Agree"}
            </button>

            {totalAgrees > 0 && (
              <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <span className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold">1</div>
                  {totalAgrees > 1 && <div className="w-6 h-6 rounded-full bg-primary border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary-foreground">+{totalAgrees - 1}</div>}
                </span>
                <span className="ml-1">{totalAgrees === 1 ? "1 person agrees" : `${totalAgrees} people agree`}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
