import type { Alert } from '~/types';

// In-memory storage for alerts
let alerts: Alert[] = [];

// Generate a simple ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default defineEventHandler((event) => {
  const method = event.method;

  switch (method) {
    case 'GET':
      // Return all alerts
      return alerts;

    case 'POST':
      // Create a new alert
      return readBody(event).then(async (body) => {
        const alert = {
          ...body,
          id: generateId(),
          createdAt: new Date().toISOString(),
        } as Alert;
        alerts.push(alert);
        return alert;
      });

    case 'PUT':
      // Update an alert
      return readBody(event).then(async (body) => {
        const { id, ...updates } = body as Alert;
        const index = alerts.findIndex((a) => a.id === id);
        if (index !== -1) {
          alerts[index] = { ...alerts[index], ...updates };
          return alerts[index];
        }
        throw createError({
          statusCode: 404,
          message: 'Alert not found',
        });
      });

    case 'DELETE':
      // Delete an alert
      const id = getRouterParam(event, 'id');
      const index = alerts.findIndex((a) => a.id === id);
      if (index !== -1) {
        const deleted = alerts.splice(index, 1);
        return deleted[0];
      }
      throw createError({
        statusCode: 404,
        message: 'Alert not found',
      });

    default:
      throw createError({
        statusCode: 405,
        message: 'Method not allowed',
      });
  }
});