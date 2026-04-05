import { cn } from "@/lib/utils";

const COLOR_PAIRS: { bg: string; text: string }[] = [
  { bg: "bg-blue-100",   text: "text-blue-800"   },
  { bg: "bg-green-100",  text: "text-green-800"  },
  { bg: "bg-pink-100",   text: "text-pink-800"   },
  { bg: "bg-amber-100",  text: "text-amber-800"  },
  { bg: "bg-purple-100", text: "text-purple-800" },
  { bg: "bg-teal-100",   text: "text-teal-800"   },
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COLOR_PAIRS.length;
}

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ name, size = "sm", className }: AvatarProps) {
  const initials = getInitials(name || "?");
  const { bg, text } = COLOR_PAIRS[getColorIndex(name || "")];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium flex-shrink-0",
        SIZE_CLASSES[size],
        bg,
        text,
        className
      )}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
