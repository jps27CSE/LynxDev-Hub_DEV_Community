import type { ReactNode } from "react";

export const authConnectionClass =
  "flex w-full items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm font-medium text-slate-200 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/5";

export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div className="neon-border rounded-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <div className="rounded-[calc(1rem-1px)] bg-[#0a0c12] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-2.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-lime-400/80" />
            <span className="ml-3 font-mono text-[11px] text-slate-500">
              {title}
            </span>
          </div>
          <div className="p-7">{children}</div>
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[11px] text-slate-600">
        &copy; {new Date().getFullYear()} lynxdev ·{" "}
        <span className="text-cyan-400/70">exit 0</span>
      </p>
    </div>
  );
}

export function AuthPageBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[#05060a]" />
      <div className="absolute -top-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
      <div className="neon-grid-floor opacity-40" />
    </>
  );
}
