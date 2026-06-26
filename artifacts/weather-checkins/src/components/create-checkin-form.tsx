import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateCheckin, 
  getListCheckinsQueryKey, 
  getGetCheckinSummaryQueryKey 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";
import { Loader2, MapPin, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const WEATHER_TYPES = ["sunny", "cloudy", "rainy", "stormy", "windy", "snowy", "foggy"] as const;

const formSchema = z.object({
  weatherType: z.enum(WEATHER_TYPES, {
    required_error: "Please select how it feels outside.",
  }),
  description: z.string().optional(),
  locationName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCheckinForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCheckin = useCreateCheckin();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      locationName: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createCheckin.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCheckinsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCheckinSummaryQueryKey() });
        toast({
          title: "Check-in posted!",
          description: "Thanks for sharing the weather with your neighbors.",
        });
        form.reset();
        onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Failed to post check-in",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="weatherType"
          render={({ field }) => (
            <FormItem className="space-y-3">
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
                          : "border-transparent bg-muted hover:bg-muted/80 hover:scale-105"
                      }`}
                      data-testid={`btn-weather-${type}`}
                    >
                      <WeatherIcon weatherType={type} className="w-8 h-8 mb-2" />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
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
                      placeholder="Neighborhood or area (e.g. Downtown, Westside)..." 
                      className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
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
                    placeholder="Add a personal note... (e.g. Grab a jacket, it's freezing!)" 
                    className="resize-none bg-muted/50 border-transparent focus-visible:bg-background h-24"
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
          disabled={createCheckin.isPending}
          data-testid="btn-submit-checkin"
        >
          {createCheckin.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Posting...
            </>
          ) : (
            "Share Weather"
          )}
        </Button>
      </form>
    </Form>
  );
}

export function CreateCheckinDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all md:hidden z-50">
          <div className="flex flex-col items-center">
            <Sun className="h-6 w-6" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center mb-4">What's it like outside?</DialogTitle>
        </DialogHeader>
        <CreateCheckinForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
