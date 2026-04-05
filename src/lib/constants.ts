// src/lib/constants.ts
import { TaskTag } from "@/types";


// Group color options
export const GROUP_COLORS = [
  { label: "Red", hex: "#f87171" },
  { label: "Blue", hex: "#60a5fa" },
  { label: "Green", hex: "#34d399" },
  { label: "Yellow", hex: "#facc15" },
] as const

// Task tags (matches DB enum: task_tag)
export const TASK_TAGS = {
  assignment: {
    label: 'Assignment',
    color: 'bg-blue-100 text-blue-700',
  },
  exam_prep: {
    label: 'Exam Prep',
    color: 'bg-red-100 text-red-700',
  },
  reading: {
    label: 'Reading',
    color: 'bg-green-100 text-green-700',
  },
  project: {
    label: 'Project',
    color: 'bg-purple-100 text-purple-700',
  },
  other: {
    label: 'Other',
    color: 'bg-gray-100 text-gray-700',
  },
} as const

// Helper array for Select inputs and Loops
export const TASK_TAG_LIST = Object.entries(TASK_TAGS).map(([key, value]) => ({
  value: key as TaskTag,
  label: value.label,
}));

// App routes
export const ROUTES = {
  dashboard: '/dashboard',
  groups: '/groups',
  tasks: '/tasks',
  profile: '/profile',
} as const