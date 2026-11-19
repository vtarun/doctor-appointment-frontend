export function formatApplicationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value :
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(date);
}
