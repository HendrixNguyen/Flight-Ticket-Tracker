import { ref } from 'vue';
import { useCurrency } from './useCurrency';

export const useAlertChecking = () => {
  const { formatAmount } = useCurrency();
  const checking = ref(false);
  const lastChecked = ref<number>(0);
  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const checkAlertPrices = async (alerts: any[]) => {
    if (checking.value) return;
    checking.value = true;
    const now = Date.now();
    // Only check if enough time has passed since last check
    if (now - lastChecked.value < CHECK_INTERVAL) {
      checking.value = false;
      return;
    }

    try {
      // We'll check each alert
      for (const alert of alerts) {
        if (!alert.active) continue;

        let currentPrice: number | null = null;

        if (alert.type === 'flight') {
          // For flights, we need to search with the alert's search query
          const response = await $fetch<{ success: boolean; data: any[] }>('/api/flights', {
            params: {
              ...alert.searchQuery,
              currency: alert.currency,
            }
          });
          if (response.success && response.data.length > 0) {
            // For simplicity, we take the first result's price
            // In reality, we might want to match the exact flight or find the lowest price
            currentPrice = response.data[0].price;
          }
        } else if (alert.type === 'hotel') {
          // For hotels, we need to search with the alert's search query
          const response = await $fetch<{ success: boolean; data: any[] }>('/api/hotels', {
            params: {
              ...alert.searchQuery,
              currency: alert.currency,
            }
          });
          if (response.success && response.data.length > 0) {
            currentPrice = response.data[0].pricePerNight;
          }
        }

        if (currentPrice !== null && currentPrice <= alert.thresholdPrice) {
          // Trigger notification
          triggerAlertNotification(alert, currentPrice);
          // Optionally, we could deactivate the alert after notification to avoid repeated notifications
          // alert.active = false;
          // await updateAlertApi(alert.id, { active: false });
        }
      }
    } catch (e) {
      console.error('Error checking alert prices:', e);
    } finally {
      checking.value = false;
      lastChecked.value = now;
    }
  };

  const triggerAlertNotification = (alert: any, currentPrice: number) => {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      showNotification(alert, currentPrice);
    }
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showNotification(alert, currentPrice);
        }
      });
    }
  };

  const showNotification = (alert: any, currentPrice: number) => {
    const title = `Price Alert: ${alert.type === 'flight' ? 'Flight' : 'Hotel'} Price Dropped!`;
    const options: NotificationOptions = {
      body: `The price for your ${alert.type} search has dropped to ${formatAmount(currentPrice)}.`,
      icon: '/icon.png', // We would need to provide an icon
    };

    new Notification(title, options);
  };

  return {
    checking,
    checkAlertPrices,
  };
};