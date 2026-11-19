export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-9 w-48 bg-muted/40 rounded-lg animate-pulse" />
      <div className="h-4 w-72 bg-muted/30 rounded mt-3 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
