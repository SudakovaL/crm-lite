export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-border rounded" />
      <div className="h-10 w-full max-w-md bg-border rounded" />
      <div className="h-48 w-full bg-border rounded-lg" />
    </div>
  );
}
