export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="h-9 w-64 bg-muted/40 rounded-lg animate-pulse" />
      <div className="h-4 w-96 bg-muted/30 rounded mt-3 animate-pulse" />
      <div className="mt-8 h-96 rounded-2xl bg-muted/20 animate-pulse" />
    </div>
  );
}