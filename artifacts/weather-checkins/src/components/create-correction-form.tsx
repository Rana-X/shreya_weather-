import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateCorrection, 
  getListCorrectionsQueryKey, 
  getGetCorrectionSummaryQueryKey,
  CorrectionInputActualWeatherType,
  CorrectionInputOfficialWeatherType
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";
import { Loader2, MapPin, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useWeather } from "@/hooks/use-weather";

const WEATHER_TYPES = ["sunny", "cloudy", "rainy", "stormy", "windy", "snowy", "foggy"] as const;

const formSchema = z.object({
  actualWeatherType: z.enum(WEATHER_TYPES, {
    required_error: "Please select what you actually see.",
  }),
  description: z.string().optional(),
  locationName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCorrectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCorrection = useCreateCorrection();
  const { type: officialWeatherType } = useWeather();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      locationName: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!officialWeatherType) return;
    
    createCorrection.mutate({ 
      data: {
        ...data,
        officialWeatherType: officialWeatherType as CorrectionInputOfficialWeatherType,
        actualWeatherType: data.actualWeatherType as CorrectionInputActualWeatherType,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCorrectionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCorrectionSummaryQueryKey() });
        toast({
          title: "Correction posted!",
          description: "Thanks for keeping your neighbors informed.",
        });
        form.reset();
        onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Failed to post correction",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted p-4 rounded-xl flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Official forecast:</span>
          <div className="flex items-center gap-2 font-bold text-foreground">
            <WeatherIcon weatherType={officialWeatherType} className="w-5 h-5 text-muted-foreground" />
            {getWeatherLabel(officialWeatherType || "cloudy")}
          </div>
        </div>

        <FormField
          control={form.control}
          name="actualWeatherType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <label className="text-sm font-bold text-foreground">What do you actually see outside?</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {WEATHER_TYPES.map((type) => {
                  const isSelected = field.value === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? "border-primary bg-primary/10 scale-105 shadow-sm" 
                          : "border-transparent bg-card hover:bg-muted/80 hover:scale-105"
                      }`}
                      data-testid={`btn-weather-${type}`}
                    >
                      <WeatherIcon weatherType={type} className="w-8 h-8 mb-2" />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                        {getWeatherLabel(type)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="locationName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Neighborhood (e.g. Northside, Downtown)..." 
                      className="pl-9 bg-card border-transparent focus-visible:bg-background"
                      {...field} 
                      value={field.value || ""}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Add a note... (e.g. It just started pouring!)" 
                    className="resize-none bg-card border-transparent focus-visible:bg-background h-24"
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-bold rounded-xl"
          disabled={createCorrection.isPending}
          data-testid="btn-submit-correction"
        >
          {createCorrection.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Posting...
            </>
          ) : (
            "Flag Forecast Error"
          )}
        </Button>
      </form>
    </Form>
  );
}

export function CreateCorrectionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="destructive" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg md:hidden">
          <Flag className="w-5 h-5 mr-2" />
          Flag Forecast Error
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-display text-center">Correct the Forecast</DialogTitle>
        </DialogHeader>
        <CreateCorrectionForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
