import { randomUUID } from 'node:crypto';
import type { Alert } from '../../types';

export default defineEventHandler(async (event) => {
  const alerts = sessionAlerts(event);
  if (event.method === 'GET') return alerts;
  if (event.method === 'POST') {
    const body = await readBody(event);
    validateAlert(body);
    const alert: Alert = {
      type: body.type,
      searchQuery: body.searchQuery,
      thresholdPrice: body.thresholdPrice,
      currency: body.currency,
      active: body.active,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    alerts.push(alert);
    setResponseStatus(event, 201);
    return alert;
  }
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});
