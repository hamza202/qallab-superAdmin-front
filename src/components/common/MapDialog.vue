<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import AppDialog from './AppDialog.vue';

interface Props {
  modelValue: boolean;
  latitude?: string | null;
  longitude?: string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'location-selected': [data: { latitude: string; longitude: string }];
}>();

// Default to Riyadh, Saudi Arabia
const markerPosition = ref<{ lat: number; lng: number }>({ lat: 24.7136, lng: 46.6753 });
const mapCenter = ref<{ lat: number; lng: number }>({ lat: 24.7136, lng: 46.6753 });
const isMapReady = ref(false);

const closeDialog = () => {
  emit('update:modelValue', false);
};

const selectLocation = () => {
  emit('location-selected', {
    latitude: markerPosition.value.lat.toFixed(6),
    longitude: markerPosition.value.lng.toFixed(6)
  });
  closeDialog();
};

const handleMapClick = (event: any) => {
  if (event.latLng) {
    markerPosition.value = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    // Auto-select location on click
    selectLocation();
  }
};

const handleMarkerDrag = (event: any) => {
  if (event.latLng) {
    markerPosition.value = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    // Auto-select location on drag end
    selectLocation();
  }
};

// Initialize position - always focus on Saudi Arabia (Riyadh) by default
const initializeLocation = () => {
  if (props.latitude && props.longitude) {
    const lat = parseFloat(props.latitude);
    const lng = parseFloat(props.longitude);
    markerPosition.value = { lat, lng };
    mapCenter.value = { lat, lng };
  }
  // Always ready, default to Saudi Arabia
  isMapReady.value = true;
};

// Watch for dialog to open and initialize map
watch(() => props.modelValue, (newValue) => {
  if (newValue && !isMapReady.value) {
    setTimeout(() => {
      initializeLocation();
    }, 300);
  }
}, { immediate: true });
</script>

<template>
  <AppDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"
    title="اختر الموقع الجغرافي" max-width="800" hide-actions>
      <!-- Map Container -->
      <div class="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 relative mb-4">
        <div v-if="!isMapReady" class="absolute inset-0 flex items-center justify-center bg-gray-100">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <GMapMap v-if="isMapReady" :center="mapCenter" :zoom="15" map-type-id="roadmap"
          style="width: 100%; height: 400px" @click="handleMapClick" :options="{
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }">
          <GMapMarker :position="markerPosition" :draggable="true" @dragend="handleMarkerDrag" />
        </GMapMap>
      </div>
    <!-- No action buttons needed - auto-select on click -->
  </AppDialog>
</template>

<style scoped>
/* Google Maps container styles */
</style>
