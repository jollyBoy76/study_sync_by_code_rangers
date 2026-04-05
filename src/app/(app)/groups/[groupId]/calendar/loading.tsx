export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-[600px] w-full animate-pulse rounded-xl bg-muted/50" />
    </div>
  );
}