import { randomUUID } from 'node:crypto';
import { createError, getCookie, setCookie, type H3Event } from 'h3';
import type { Alert } from '../../types';

// Alerts are scoped to an anonymous browser session, never shared among visitors.
// Storage remains process-local and resets on redeploy.
const sessions = new Map<string, { alerts: Alert[]; expires: number }>();
const TTL = 30 * 24 * 60 * 60 * 1000;
export function sessionAlerts(event: H3Event): Alert[] {
  const now = Date.now();
  for (const [key, value] of sessions) if (value.expires <= now) sessions.delete(key);
  let id = getCookie(event, 'skycrawler-session');
  if (!id || !sessions.has(id)) {
    id = randomUUID();
    setCookie(event, 'skycrawler-session', id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: TTL / 1000,
    });
    sessions.set(id, { alerts: [], expires: now + TTL });
  }
  const session = sessions.get(id)!;
  session.expires = now + TTL;
  return session.alerts;
}
export function validateAlert(body: any) {
  const query = body?.searchQuery;
  const validQuery =
    body?.type === 'flight'
      ? typeof query?.from === 'string' &&
        typeof query?.to === 'string' &&
        typeof query?.date === 'string' &&
        query.from &&
        query.to &&
        query.date
      : body?.type === 'hotel' &&
        typeof query?.destination === 'string' &&
        typeof query?.checkIn === 'string' &&
        typeof query?.checkOut === 'string' &&
        query.destination &&
        query.checkIn &&
        query.checkOut;
  if (
    !validQuery ||
    typeof body.thresholdPrice !== 'number' ||
    !Number.isFinite(body.thresholdPrice) ||
    body.thresholdPrice < 0 ||
    typeof body.active !== 'boolean' ||
    !SUPPORTED_CURRENCIES.includes(body.currency)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid price alert' });
  }
}
