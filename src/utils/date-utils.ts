/**
 * Format date string to a readable format
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "March 15, 2024")
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  // Add time to ensure consistent timezone handling
  const date = new Date(`${dateString}T12:00:00Z`);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Parse date string to timestamp
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Timestamp in milliseconds
 */
export function parseDate(dateString: string): number {
  return new Date(`${dateString}T12:00:00Z`).getTime();
}

/**
 * Create a Date object from a date string with consistent timezone handling
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object
 */
export function createDate(dateString: string): Date {
  return new Date(`${dateString}T12:00:00Z`);
}
