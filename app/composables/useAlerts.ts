import { ref, computed } from 'vue';
import { useRuntimeConfig } from '#imports';

import type { Alert } from '~~/types';

export const useAlerts = () => {
  const config = useRuntimeConfig();
  const alerts = useState<Alert[]>('alerts', () => []);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchAlerts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Alert[]>('/api/alerts');
      alerts.value = data;
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch alerts';
      console.error('Failed to fetch alerts:', e);
    } finally {
      loading.value = false;
    }
  };

  const addAlert = async (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    loading.value = true;
    error.value = null;
    try {
      const newAlert = await $fetch<Alert>('/api/alerts', {
        method: 'POST',
        body: alert,
      });
      alerts.value.push(newAlert);
      return newAlert;
    } catch (e: any) {
      error.value = e.message || 'Failed to add alert';
      console.error('Failed to add alert:', e);
      throw e;
    } finally { loading.value = false; }
  };

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    try {
      const updatedAlert = await $fetch<Alert>(`/api/alerts/${id}`, {
        method: 'PUT',
        body: updates,
      });
      const index = alerts.value.findIndex((a) => a.id === id);
      if (index !== -1) {
        alerts.value[index] = updatedAlert;
      }
      return updatedAlert;
    } catch (e: any) {
      error.value = e.message || 'Failed to update alert';
      console.error('Failed to update alert:', e);
      throw e;
    } finally { loading.value = false; }
  };

  const deleteAlert = async (id: string) => {
    try {
      await $fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
      });
      alerts.value = alerts.value.filter((a) => a.id !== id);
    } catch (e: any) {
      error.value = e.message || 'Failed to delete alert';
      console.error('Failed to delete alert:', e);
      throw e;
    } finally { loading.value = false; }
  };

  // Initialize by fetching alerts
  // We'll call fetchAlerts in onMounted in the component that uses this composable

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    addAlert,
    updateAlert,
    deleteAlert,
  };
};