import { useRef, useState, useEffect } from "react";
import { MapPin, Search, X, LocateFixed, Loader2 } from "lucide-react";
import { useCitySearch, type CityResult } from "@/hooks/use-city-search";

interface Props {
  selectedCity: CityResult | null;
  onSelect: (city: CityResult) => void;
  onMyLocation: () => void;
}

export function CitySearch({ selectedCity, onSelect, onMyLocation }: Props) {
  const { query, setQuery, results, searching, clear } = useCitySearch();
  const [open, setOpen] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchMode(false);
        clear();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (results.length > 0) setOpen(true);
    else setOpen(false);
  }, [results]);

  const handleSelect = (city: CityResult) => {
    onSelect(city);
    setOpen(false);
    setSearchMode(false);
    clear();
  };

  const handleMyLocation = () => {
    onMyLocation();
    setOpen(false);
    setSearchMode(false);
    clear();
  };

  if (searchMode) {
    return (
      <div ref={containerRef} className="relative w-full max-w-sm">
        <div className="flex items-center gap-2 bg-muted/80 rounded-full px-3 py-2 border border-border focus-within:border-primary/50 focus-within:bg-background transition-colors">
          {searching
            ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
            : <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          }
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any city…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          />
          <button
            onClick={() => { setSearchMode(false); clear(); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden">
            {selectedCity && (
              <button
                onClick={handleMyLocation}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left hover:bg-muted transition-colors border-b border-border"
              >
                <LocateFixed className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-primary">Use my location</span>
              </button>
            )}
            {results.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelect(city)}
                className="w-full flex items-start gap-2.5 px-4 py-3 text-sm text-left hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">{city.name}</span>
                  {(city.admin1 || city.country) && (
                    <span className="text-muted-foreground ml-1">
                      {[city.admin1, city.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pill showing current location — tap to search
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setSearchMode(true)}
        className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted rounded-full px-3 py-1.5 transition-colors group max-w-[200px]"
      >
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground truncate">
          {selectedCity ? selectedCity.name : "My location"}
        </span>
        <Search className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </button>

      {selectedCity && (
        <button
          onClick={handleMyLocation}
          title="Go back to my location"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">My location</span>
        </button>
      )}
    </div>
  );
}
