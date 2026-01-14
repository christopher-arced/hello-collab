/**
 * Extracts initials from a name (max 2 characters)
 * "John Doe" → "JD"
 * "John Michael Smith" → "JS" (first + last)
 * "Alice" → "AL"
 */
export const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
