import { CheckinFeed } from "@/components/checkin-feed";
import { CheckinSummaryBar } from "@/components/checkin-summary-bar";
import { CreateCheckinForm, CreateCheckinDialog } from "@/components/create-checkin-form";

export function Home() {
  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20 selection:text-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="text-xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <span className="text-primary text-2xl">Neighbor</span> Weather
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        
        {/* Desktop Create Form (Hidden on mobile, mobile uses FAB) */}
        <section className="hidden md:block bg-card rounded-3xl p-6 shadow-sm border border-card-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <h2 className="text-2xl font-display font-bold mb-6 text-foreground relative">What's it like outside right now?</h2>
          <div className="relative">
            <CreateCheckinForm />
          </div>
        </section>

        {/* Summary Bar */}
        <section>
          <CheckinSummaryBar />
        </section>

        {/* Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Latest Reports</h2>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <CheckinFeed />
        </section>

      </main>

      {/* Mobile FAB Dialog */}
      <CreateCheckinDialog />
    </div>
  );
}
