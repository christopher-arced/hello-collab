/**
 * Formats a due date into a human-readable string.
 * @param date - The due date to format
 * @returns A formatted string like "Overdue", "Today", "Tomorrow", or "Jan 15"
 */
export function formatDueDate(date: Date): string {
  const now = new Date()
  const dueDate = new Date(date)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Returns Tailwind CSS classes for styling a due date badge based on urgency.
 * @param date - The due date to evaluate
 * @returns Tailwind CSS classes for background and text color
 */
export function getDueDateColor(date: Date): string {
  const now = new Date()
  const dueDate = new Date(date)
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (diffDays <= 1)
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
}
