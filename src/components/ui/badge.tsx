"use client";

import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "assignment"
  | "exam_prep"
  | "reading"
  | "project"
  | "other"
  | "done"
  | "in_progress"
  | "todo";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  assignment:  "bg-blue-50   text-blue-800   dark:bg-blue-950  dark:text-blue-200",
  exam_prep:   "bg-red-50    text-red-800    dark:bg-red-950   dark:text-red-200",
  reading:     "bg-teal-50   text-teal-800   dark:bg-teal-950  dark:text-teal-200",
  project:     "bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  other:       "bg-gray-100  text-gray-700   dark:bg-gray-800  dark:text-gray-300",
  done:        "bg-green-50  text-green-800  dark:bg-green-950 dark:text-green-200",
  in_progress: "bg-amber-50  text-amber-800  dark:bg-amber-950 dark:text-amber-200",
  todo:        "bg-gray-100  text-gray-600   dark:bg-gray-800  dark:text-gray-400",
};

const VARIANT_LABELS: Record<BadgeVariant, string> = {
  assignment:  "Assignment",
  exam_prep:   "Exam Prep",
  reading:     "Reading",
  project:     "Project",
  other:       "Other",
  done:        "Done",
  in_progress: "In Progress",
  todo:        "To Do",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className }: BadgeProps) {
  const activeClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.other;
  const activeLabel = label ?? (VARIANT_LABELS[variant] || "Other");

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
        activeClass,
        className
      )}
    >
      {activeLabel}
    </span>
  );
}