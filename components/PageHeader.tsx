export function PageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border/40 bg-card pl-14 pr-4 sm:pr-6 lg:px-8 py-3 shrink-0">
      {children}
    </div>
  );
}
