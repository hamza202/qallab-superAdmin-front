<template>
    <default-layout>
        <div class="category-view-page -mx-6">
            <!-- Content -->
            <div>
                <!-- Breadcrumb -->
                <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales" class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.breadcrumb.sales') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/sales/trips" class="text-gray-600 hover:text-primary-600">
                        {{ t('sales.forms.viewPages.lists.tripsList') }}
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ tripCode
                        }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="archiveIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ tripCode }}</h1>
                                <p class="text-sm text-gray-600">{{ t('sales.forms.viewPages.subtitles.tripDetail') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab Content -->
                <!-- General Information Section -->
                <div class="p-6">
                    <h2 class="text-lg font-bold text-primary-900 mb-6">{{ t('sales.forms.common.sections.basicData') }}</h2>

                    <div class="flex flex-wrap gap-4">
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.logisticsCompany') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{
                                tripData?.supplier_logistic_name || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.tripLoadingLocation') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.source_location || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.loadingDateTime') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.planned_arrival_loading || '—'
                                }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.viewPages.sections.tripUnloadSite') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.target_location || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.unloadingDateTime') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.planned_arrival_downloading ||
                                '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.loadingOfficer') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.loading_responsible_party ||
                                '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.cardUnloadingOfficer') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.downloading_responsible_party
                                || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.totalQtyTon') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.total_quantity_ton || 0 }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.totalQtyM3') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.total_quantity_m3 || 0 }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.billOfLading') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.bill_of_lading || '—' }}</p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.viewPages.sections.coordSendCountLabel') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.tracking_no_point || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.viewPages.sections.timeWindow') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.am_pm_interval_label || '—' }}
                            </p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.viewPages.sections.tripValue') }}</label>
                            <p class="text-base font-semibold text-gray-900 flex gap-1 items-center">{{
                                tripData?.trip_value || 0 }} <span v-html="rialIcon"></span></p>
                        </div>
                        <v-divider vertical class="my-6"></v-divider>
                        <div class="info-item-bordered flex-1 px-6 py-4">
                            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.notes') }}</label>
                            <p class="text-base font-semibold text-gray-900">{{ tripData?.notes || t('sales.forms.common.misc.none') }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="bg-primary-50 px-6 py-4">
                        <div class="flex items-center gap-2 text-primary-900 font-bold">
                            <span class="w-[18px]" v-html="packageIcon"></span>
                            <h2 class="text-base">{{ t('sales.forms.common.sections.products') }}</h2>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="mb-8">
                        <DataTable :headers="itemHeaders" :items="itemsData" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <v-overlay :model-value="isLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { rialIcon, archiveIcon, homeIcon } from '@/components/icons/globalIcons'
import { packageIcon } from '@/components/icons/priceOffersIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const tripData = ref<any>(null)

// Get route ID
const routeId = computed(() => route.params.id as string)

// Fetch trip data
const fetchTripData = async () => {
    if (!routeId.value) return

    isLoading.value = true
    try {
        const res = await api.get<any>(`/sales/trips/${routeId.value}`)
        tripData.value = res.data
    } catch (e: any) {
        console.error('Error fetching trip data:', e)
        error(e?.response?.data?.message || t('sales.forms.common.messages.loadTripFailed'))
    } finally {
        isLoading.value = false
    }
}

// Computed properties for display
const tripCode = computed(() => tripData.value?.code || '—')

// Items table
const itemsData = computed(() => {
    if (!tripData.value?.items) return []
    return tripData.value.items.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || '—',
        quantity: item.quantity || 0,
        transport_type_label: item.transport_type_label || '—',
        transport_no: item.transport_no || '—',
        notes: item.notes || '—',
    }))
})

const itemHeaders = computed(() => [
    { title: t('sales.forms.tables.tripProducts.itemName'), key: 'item_name' },
    { title: t('sales.forms.common.labels.quantityDisplay'), key: 'quantity' },
    { title: t('sales.forms.viewPages.sections.transportType'), key: 'transport_type_label' },
    { title: t('sales.forms.common.labels.tripTransportCount'), key: 'transport_no' },
    { title: t('sales.forms.common.labels.notes'), key: 'notes' },
])

onMounted(() => {
    fetchTripData()
})

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
