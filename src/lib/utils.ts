// src/lib/utils.ts

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes safely
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

// Format date (e.g., 12 Apr)
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

// Get initials from name (e.g., "John Doe" → "JD")
export function getInitials(name: string) {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}