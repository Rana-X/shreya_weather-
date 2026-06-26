import { formatDistanceToNow } from "date-fns";
import { Correction, useAgreeWithCorrection, getListCorrectionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";
import { MapPin, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CorrectionCardProps {
  correction: Correction;
}

export function CorrectionCard({ correction }: CorrectionCardProps) {
  const queryClient = useQueryClient();
  const agreeMutation = useAgreeWithCorrection();

  const handleAgree = () => {
    agreeMutation.mutate(
      { id: correction.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCorrectionsQueryKey() });
        },
      }
    );
  };

  const timeAgo = formatDistanceToNow(new Date(correction.createdAt), { addSuffix: true });

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="bg-primary/10 p-3 rounded-full">
            <WeatherIcon weatherType={correction.actualWeatherType} className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-display font-bold text-lg text-foreground truncate">
              It's actually {getWeatherLabel(correction.actualWeatherType)}
            </h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-md line-through">
              Official said: {getWeatherLabel(correction.officialWeatherType)}
            </span>
          </div>

          {correction.description && (
            <p className="text-foreground text-sm leading-relaxed mb-3">"{correction.description}"</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {correction.locationName || "Somewhere nearby"}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs rounded-lg flex items-center gap-1.5"
              onClick={handleAgree}
              disabled={agreeMutation.isPending}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${agreeMutation.isPending ? 'animate-pulse' : ''}`} />
              <span>Agree ({correction.agrees})</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
