<template>
  <section class="w-full min-w-0" aria-labelledby="alerts-heading">
      <h2 id="alerts-heading" class="text-2xl font-black mb-6">Price Alerts</h2>

      <div v-if="loading" class="flex flex-col justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest animate-pulse">Loading alerts...</p>
      </div>

      <div v-else-if="error" class="error-panel p-4 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-300">
        <CircleAlert class="w-5 h-5 flex-none mt-0.5" aria-hidden="true" />
        <div class="flex flex-col gap-1">
          <h4 class="font-bold text-sm">Error Loading Alerts</h4>
          <p class="text-xs">{{ error }}</p>
        </div>
      </div>

      <div v-else-if="alerts.length === 0" class="text-center py-20">
        <p class="text-xl font-medium text-slate-600 dark:text-slate-300">
          No alerts set yet. Search for flights or hotels and click "Set Price Alert" to create alerts.
        </p>
        <NuxtLink
          to="/"
          class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search Flights
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-for="alert in alerts" :key="alert.id" class="glass-card glass-grain p-6 rounded-xl border-l-4">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex flex-col flex-1 sm:basis-1/3">
              <h3 class="text-lg font-black mb-2">
                {{ alert.type === 'flight' ? 'Flight Alert' : 'Hotel Alert' }}
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-300 mb-1">
                {{ alert.type === 'flight'
                  ? `From: ${alert.searchQuery.from} To: ${alert.searchQuery.to} on ${alert.searchQuery.date}`
                  : `Destination: ${alert.searchQuery.destination}` }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {{ alert.type === 'flight'
                  ? `Date: ${alert.searchQuery.date} ${alert.searchQuery.returnDate ? `Return: ${alert.searchQuery.returnDate}` : ''}`
                  : `Check-in: ${alert.searchQuery.checkIn} Check-out: ${alert.searchQuery.checkOut}` }}
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ alert.type === 'flight'
                  ? `Passengers: ${alert.searchQuery.passengers}`
                  : `Adults: ${alert.searchQuery.adults} Rooms: ${alert.searchQuery.rooms}` }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full sm:w-2/3">
              <div class="flex flex-col items-start sm:items-center">
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Threshold Price:
                </p>
                <p class="text-2xl font-black">
                  {{ formatAmount(alert.thresholdPrice, alert.currency) }}
                </p>
              </div>
              <div class="flex flex-col items-start sm:items-center">
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Status:
                </p>
                <p class="text-2xl font-bold" :class="{
                  'text-green-600': alert.active,
                  'text-red-600': !alert.active
                }">
                  {{ alert.active ? 'Active' : 'Paused' }}
                </p>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button
                @click="toggleAlert(alert.id, !alert.active).catch(() => {})"
                class="px-3 py-1.5 text-sm font-medium"
                :class="{
                  'bg-green-500 hover:bg-green-600 text-white': alert.active,
                  'bg-red-500 hover:bg-red-600 text-white': !alert.active
                }"
              >
                {{ alert.active ? 'Pause' : 'Activate' }}
              </button>
              <button
                @click="deleteAlert(alert.id).catch(() => {})"
                class="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { CircleAlert } from 'lucide-vue-next';
import { useCurrency } from '~/composables/useCurrency';
import { useAlerts } from '~/composables/useAlerts';
import { useAlertChecking } from '~/composables/useAlertChecking';
const { formatAmount } = useCurrency();
const { alerts, loading, error, fetchAlerts, deleteAlert, updateAlert } = useAlerts();
const { checkAlertPrices } = useAlertChecking();
const toggleAlert = (id: string, active: boolean) => updateAlert(id, { active });
let interval: ReturnType<typeof setInterval> | undefined;
let disposed = false;
onMounted(async () => {
  await fetchAlerts();
  if (disposed) return;
  await checkAlertPrices(alerts.value);
  if (!disposed) interval = setInterval(() => checkAlertPrices(alerts.value), 5 * 60 * 1000);
});
onUnmounted(() => {
  disposed = true;
  if (interval) clearInterval(interval);
});
</script>
