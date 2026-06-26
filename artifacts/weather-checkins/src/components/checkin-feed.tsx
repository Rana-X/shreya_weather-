import { useListCheckins } from "@workspace/api-client-react";
import { CheckinCard } from "./checkin-card";
import { Loader2, Sun, CloudRain } from "lucide-react";

export function CheckinFeed() {
  const { data: checkins, isLoading, isError } = useListCheckins(
    { limit: 50 },
    { query: { refetchInterval: 30000 } }
  );

  if (isLoading) {
    return (
      <div className="space-y-4 py-8 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading neighborhood reports...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-2xl text-center border border-destructive/20">
        <p className="font-semibold">Couldn't load check-ins.</p>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  if (!checkins || checkins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-3xl border border-dashed border-border shadow-sm">
        <div className="relative w-24 h-24 mb-6">
          <Sun className="w-16 h-16 text-yellow-400 absolute top-0 right-0 animate-pulse" />
          <CloudRain className="w-16 h-16 text-blue-400 absolute bottom-0 left-0" />
        </div>
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">It's quiet out there</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
          Be the first neighbor to report the weather today. Is it sweater weather or t-shirt weather?
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {checkins.map((checkin) => (
        <CheckinCard key={checkin.id} checkin={checkin} />
      ))}
    </div>
  );
}
