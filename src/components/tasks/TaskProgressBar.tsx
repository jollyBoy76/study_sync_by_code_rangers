import { cn } from "@/lib/utils";

interface TaskProgressBarProps {
  progress: number; // 0–100
  className?: string;
}

function getBarColor(progress: number): string {
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 40) return "bg-blue-500";
  return "bg-red-400";
}

export function TaskProgressBar({ progress, className }: TaskProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums w-7 text-right">
        {clamped}%
      </span>
    </div>
  );
}
