const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Check whether a date string is a canonical calendar date.
 * @param dateString - Date in YYYY-MM-DD format
 */
export function isValidDate(dateString: string): boolean {
  const match = DATE_PATTERN.exec(dateString);
  if (!match) {
    return false;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const date = new Date(0);
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/**
 * Format date string to a readable format
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "March 15, 2024")
 */
export function formatDate(dateString: string): string {
  if (!isValidDate(dateString)) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  };
  return createDate(dateString).toLocaleDateString('en-US', options);
}

/**
 * Parse date string to timestamp
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Timestamp in milliseconds
 */
export function parseDate(dateString: string): number {
  return createDate(dateString).getTime();
}

/**
 * Create a Date object from a date string with consistent timezone handling
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date object
 */
export function createDate(dateString: string): Date {
  if (!isValidDate(dateString)) {
    return new Date(NaN);
  }
  return new Date(`${dateString}T12:00:00Z`);
}
