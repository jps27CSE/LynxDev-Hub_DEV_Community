import { ShieldCheck, Clock } from "lucide-react";

const timeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function AdminHeader({ name }: { name: string }) {
  return (
    <div className="relative w-full rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 p-4 sm:p-6 lg:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid-paper pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-red-500/20 bg-red-500/5 text-[10px] text-red-400 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span>Admin Access</span>
        </div>

        <h1 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold tracking-tight leading-snug sm:leading-tight">
          {timeGreeting()},{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            {name}
          </span>
        </h1>

        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
          Platform overview and management dashboard
        </p>

        <div className="flex items-center gap-4 mt-3 sm:mt-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Admin</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Last login: just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
