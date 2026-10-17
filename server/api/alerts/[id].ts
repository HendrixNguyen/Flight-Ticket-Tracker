export default defineEventHandler(async (event) => {
  const alerts = sessionAlerts(event);
  const index = alerts.findIndex((a) => a.id === getRouterParam(event, 'id'));
  if (index < 0) throw createError({ statusCode: 404, statusMessage: 'Alert not found' });
  if (event.method === 'DELETE') return alerts.splice(index, 1)[0];
  if (event.method === 'PUT') {
    const body = await readBody(event);
    const current = alerts[index]!;
    const alert = {
      ...current,
      thresholdPrice: body?.thresholdPrice ?? current.thresholdPrice,
      active: body?.active ?? current.active,
    };
    validateAlert(alert);
    alerts[index] = alert;
    return alert;
  }
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});
