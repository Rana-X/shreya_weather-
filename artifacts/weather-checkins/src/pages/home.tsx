import { OfficialWeather } from "@/components/official-weather";
import { CorrectionFeed } from "@/components/correction-feed";
import { CreateCorrectionForm, CreateCorrectionDialog } from "@/components/create-correction-form";

export function Home() {
  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20 selection:text-primary pb-24">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Neighbor Weather
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        <section>
          <OfficialWeather />
        </section>

        <section className="space-y-6">
          <CorrectionFeed />
        </section>
        
        <section className="hidden md:block bg-muted/30 rounded-3xl p-6 border border-border mt-12">
          <h2 className="text-2xl font-display font-bold mb-6 text-foreground text-center">See something different?</h2>
          <CreateCorrectionForm />
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <CreateCorrectionDialog />
        </div>
      </div>
    </div>
  );
}
