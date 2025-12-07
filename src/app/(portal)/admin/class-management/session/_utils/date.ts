export const parseDate = (dateStr: string): Date => {
  return new Date(`${dateStr}T00:00:00`)
}

export const isDateAfter = (laterDate: string, earlierDate: string): boolean => {
  if (!laterDate || !earlierDate) return false
  return parseDate(laterDate) > parseDate(earlierDate)
}
