import { reactive } from 'vue';

export const backendStatus = reactive({
  isOffline: false,
  isRetrying: false,
});

export function markBackendOffline() {
  backendStatus.isOffline = true;
}

export function markBackendOnline() {
  backendStatus.isOffline = false;
}
