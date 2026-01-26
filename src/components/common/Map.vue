<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import * as L from 'leaflet'
import AppDialog from './AppDialog.vue'
import TextInput from './forms/textInput.vue'
import ButtonWithIcon from './buttons/ButtonWithIcon.vue'

/* ================= PROPS ================= */
interface Props {
    modelValue: boolean
    latitude?: string | null
    longitude?: string | null
    address?: string | null
}

const props = defineProps<Props>()

/* ================= EMITS ================= */
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'location-selected': [data: {
        latitude: string
        longitude: string
        address: string
    }]
}>()

/* ================= STATE ================= */
// Default: Riyadh
const markerPosition = ref({ lat: 24.7136, lng: 46.6753 })
const mapCenter = ref({ lat: 24.7136, lng: 46.6753 })
const address = ref('')

const isMapReady = ref(false)
const isLoadingAddress = ref(false)
const mapRef = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let marker: L.Marker | null = null

/* ================= METHODS ================= */
const closeDialog = () => {
    emit('update:modelValue', false)
}

const resetState = () => {
    address.value = ''
    markerPosition.value = { lat: 24.7136, lng: 46.6753 }
    mapCenter.value = { lat: 24.7136, lng: 46.6753 }
}

const fetchAddress = async (lat: number, lng: number) => {
    isLoadingAddress.value = true
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        )
        const data = await res.json()
        address.value = data.display_name || ''
    } catch {
        address.value = ''
    } finally {
        isLoadingAddress.value = false
    }
}

const handleSave = () => {
    emit('location-selected', {
        latitude: markerPosition.value.lat.toFixed(6),
        longitude: markerPosition.value.lng.toFixed(6),
        address: address.value
    })

    closeDialog()
}

const cleanupMap = () => {
    if (map) {
        map.remove()
        map = null
        marker = null
        isMapReady.value = false
    }
}

const initializeLocation = async () => {
    if (props.latitude && props.longitude) {
        const lat = parseFloat(props.latitude)
        const lng = parseFloat(props.longitude)
        markerPosition.value = { lat, lng }
        mapCenter.value = { lat, lng }
        
        // Initialize address from props or fetch from location
        if (props.address) {
            address.value = props.address
        } else {
            await fetchAddress(lat, lng)
        }
    }
}

const initializeMap = async () => {
    await nextTick()
    if (!mapRef.value) return

    map = L.map(mapRef.value).setView(
        [mapCenter.value.lat, mapCenter.value.lng],
        15
    )

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    marker = L.marker(
        [markerPosition.value.lat, markerPosition.value.lng],
        { draggable: true }
    ).addTo(map)

    map.on('click', async (e: L.LeafletMouseEvent) => {
        markerPosition.value = {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }

        marker?.setLatLng(e.latlng)
        await fetchAddress(e.latlng.lat, e.latlng.lng)
    })

    marker.on('dragend', async (e: any) => {
        const pos = e.target.getLatLng()
        markerPosition.value = {
            lat: pos.lat,
            lng: pos.lng
        }
        await fetchAddress(pos.lat, pos.lng)
    })

    isMapReady.value = true
}

/* ================= WATCH ================= */
watch(
    () => props.modelValue,
    async (open) => {
        if (open) {
            cleanupMap()
            await initializeLocation()
            setTimeout(initializeMap, 300)
        } else {
            cleanupMap()
            resetState()
        }
    },
    { immediate: true }
)

watch(
    () => [props.latitude, props.longitude],
    () => {
        if (props.modelValue && map) {
            initializeLocation()
            if (marker) {
                marker.setLatLng([markerPosition.value.lat, markerPosition.value.lng])
            }
            map.setView([mapCenter.value.lat, mapCenter.value.lng], 15)
        }
    }
)
</script>

<template>
    <AppDialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"
        title="اختر الموقع الجغرافي" max-width="800">
        <div class="w-full h-[390px] rounded-lg overflow-hidden border border-gray-200 relative mb-4">
            <div v-if="!isMapReady" class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <v-progress-circular indeterminate color="primary" />
            </div>

            <!-- Address Loading Overlay -->
            <div v-if="isLoadingAddress" class="absolute inset-0 flex items-center justify-center bg-black/40 !z-[1000000]">
                <div class="bg-white rounded-lg px-6 py-4 flex items-center gap-3 shadow-lg">
                    <v-progress-circular indeterminate color="primary" size="24" />
                    <span class="text-sm font-medium">جاري تحميل العنوان...</span>
                </div>
            </div>

            <!-- Leaflet Map -->
            <div ref="mapRef" class="w-full h-full"></div>
        </div>

        <!-- Address Input -->
        <TextInput v-model="address" label="العنوان" placeholder="أدخل العنوان" class="mb-4" />

        <!-- Action Buttons -->
        <template #actions>
            <div class="flex justify-end gap-2 items-center flex-1">
                <v-btn variant="flat" color="primary" rounded="4" class="font-semibold px-6" @click="handleSave">
                    تأكيد
                </v-btn>
                <v-btn variant="outlined" color="gray-700" rounded="4" border="thin gray" class="font-semibold"
                    @click="closeDialog">
                    إلغاء
                </v-btn>
            </div>
        </template>
    </AppDialog>
</template>

<style scoped>
.leaflet-container {
    font-family: inherit;
}
</style>
