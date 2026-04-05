import { cn } from "@/lib/utils";

interface OnlineDotProps {
  online: boolean;
  className?: string;
}

export function OnlineDot({ online, className }: OnlineDotProps) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full flex-shrink-0",
        online
          ? "bg-emerald-500"
          : "bg-muted-foreground/30",
        className
      )}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}
