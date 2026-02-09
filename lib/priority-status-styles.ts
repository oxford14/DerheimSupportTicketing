/**
 * Shared labels and Tailwind class names for priority and status badges.
 * Use these for consistent, accessible color coding across the app.
 */

export const PRIORITY_LABEL: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

/** Background + text classes for priority badges. Low = calm, Urgent = alert. */
export function getPriorityBadgeClass(priority: string): string {
  const map: Record<string, string> = {
    low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  };
  return map[priority] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
}

/** Background + text classes for status badges. */
export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    closed: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  };
  return map[status] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
}

/** MUI Chip color for priority (for use with <Chip color={...} />). */
export function getPriorityChipColor(priority: string): "success" | "warning" | "error" | "default" {
  const map: Record<string, "success" | "warning" | "error" | "default"> = {
    low: "success",
    medium: "warning",
    high: "warning",
    urgent: "error",
  };
  return map[priority] ?? "default";
}

/** MUI Chip color for status. */
export function getStatusChipColor(status: string): "info" | "warning" | "success" | "default" {
  const map: Record<string, "info" | "warning" | "success" | "default"> = {
    open: "info",
    in_progress: "warning",
    resolved: "success",
    closed: "default",
  };
  return map[status] ?? "default";
}
