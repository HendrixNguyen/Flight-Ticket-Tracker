import { createError } from 'h3';
export function queryText(value: unknown, name: string): string {
  if (value == null) return '';
  if (typeof value !== 'string')
    throw createError({ statusCode: 400, statusMessage: `Invalid ${name}` });
  return value.trim();
}
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function queryCount(value: unknown, name: string, fallback: number, max: number): number {
  if (value == null || value === '') return fallback;
  const text = queryText(value, name);
  const count = Number(text);
  if (!Number.isInteger(count) || count < 1 || count > max)
    throw createError({ statusCode: 400, statusMessage: `Invalid ${name}` });
  return count;
}
