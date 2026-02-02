<template>
  <default-layout>
    <div class="pickup-view-page -mx-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="flex flex-col items-center justify-center py-20">
        <p class="text-error-600 mb-4">{{ errorMessage }}</p>
        <ButtonWithIcon variant="flat" color="primary" @click="fetchPickupDetail">
          {{ t('pages.SalesSoPickups.viewPage.retry') }}
        </ButtonWithIcon>
      </div>

      <div v-else>
        <!-- Breadcrumb -->
        <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
          <router-link to="/" class="text-gray-500 hover:text-primary-600">
            <span v-html="homeIcon"></span>
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <router-link to="/sales/so-pickups/list" class="text-gray-600 hover:text-primary-600">
            {{ t('pages.SalesSoPickups.viewPage.breadcrumb.sales') }}
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <router-link to="/sales/so-pickups/list" class="text-gray-600 hover:text-primary-600">
            {{ t('pages.SalesSoPickups.viewPage.breadcrumb.pickupsList') }}
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md" dir="ltr">#{{ detail?.code ?? pickupId }}</span>
        </div>

        <!-- Header Card -->
        <div class="bg-white px-6 py-4 border-y border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 flex items-center justify-center">
                <span v-html="orderIcon" class="text-primary-600"></span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-gray-900 mb-1 rtl:text-right ltr:text-left" dir="ltr">#{{ detail?.code ?? pickupId }}</h1>
                <p class="text-sm text-gray-900">{{ t('pages.SalesSoPickups.viewPage.headerSubtitle') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Information Section -->
        <div class="p-6 border-b !border-gray-200">
          <h2 class="text-xl font-bold text-primary-900 mb-6">{{ t('pages.SalesSoPickups.viewPage.orderInfo.title') }}</h2>
          
          <!-- Row 1 -->
          <div class="flex flex-wrap gap-4">
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.transportCompany') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.transport_company_name ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.date') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ formatDate(detail?.so_pickup_date) }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.coordinatesSendCount') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.coordinates_send_count ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.tripTiming') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.am_pm_interval ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.loadingResponsible') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.loading_responsible_party ?? '—' }}</p>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="flex flex-wrap gap-4 mt-4">
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.driver') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.driver_name ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.tripCost') }}</label>
              <p class="text-base font-semibold text-gray-800">
                <span v-if="detail?.trip_cost">{{ detail.trip_cost }} {{ t('common.sar') }}</span>
                <span v-else>—</span>
              </p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.unloadingLocation') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.unloading_location ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.loadingLocation') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.loading_location ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.unloadingResponsible') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.downloading_responsible_party ?? '—' }}</p>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="flex flex-wrap gap-4 mt-4">
            <div class="info-item-bordered px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.vehicleCount') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.vehicle_count ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.vehicleType') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.vehicle_type ?? '—' }}</p>
            </div>
            <v-divider vertical class="my-6"></v-divider>
            <div class="info-item-bordered flex-1 px-6 py-4">
              <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('pages.SalesSoPickups.viewPage.orderInfo.notes') }}</label>
              <p class="text-base font-semibold text-gray-800">{{ detail?.notes ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Products Table Section -->
        <div class="mb-8">
          <div class="bg-primary-50 px-6 py-3">
            <div class="flex items-center gap-2">
              <span v-html="packageIcon"></span>
              <h2 class="text-lg font-bold text-qallab-blue-light">{{ t('pages.SalesSoPickups.viewPage.productsTable.title') }}</h2>
            </div>
          </div>
          <div class="mb-4">
            <DataTable :headers="productsHeaders" :items="productsTableData" :show-actions="false" cell-class="text-sm text-gray-900">
              <template #item.product_image="{ item }">
                <div class="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img v-if="item.product_image" :src="item.product_image" :alt="item.product_name" class="w-full h-full object-cover" />
                  <span v-else class="text-gray-400 text-xs">—</span>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { homeIcon, packageIcon, orderIcon } from '@/components/icons/globalIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const pickupId = computed(() => route.params.id ?? '')
const detail = ref<any>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)

// Format date helper - always use Western numerals (DD/MM/YYYY)
const formatDate = (val: string | undefined | null) => {
  if (!val) return '—'
  try {
    const datePart = val.split(' ')[0]
    const parts = datePart.split('-')
    
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD format -> DD/MM/YYYY
        return `${parts[2]}/${parts[1]}/${parts[0]}`
      } else {
        // DD-MM-YYYY format -> DD/MM/YYYY
        return `${parts[0]}/${parts[1]}/${parts[2]}`
      }
    }
    
    // Fallback: parse and format manually
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    return val
  } catch {
    return val
  }
}

// Fetch pickup detail
const fetchPickupDetail = async () => {
  if (!pickupId.value) return
  
  loading.value = true
  errorMessage.value = null
  
  try {
    const res = await api.get(`/sales/so-pickups/${pickupId.value}`)
    const data = res?.data ?? res
    detail.value = data
  } catch (err: any) {
    console.error('Error fetching pickup detail:', err)
    errorMessage.value = err?.response?.data?.message || t('pages.SalesSoPickups.viewPage.errors.loadFailed')
    error(errorMessage.value as string)
  } finally {
    loading.value = false
  }
}

// Products table headers
const productsHeaders = computed(() => [
  { title: t('pages.SalesSoPickups.viewPage.productsTable.productImage'), key: 'product_image', width: '80px' },
  { title: t('pages.SalesSoPickups.viewPage.productsTable.productName'), key: 'product_name' },
  { title: t('pages.SalesSoPickups.viewPage.productsTable.quantity'), key: 'quantity' },
  { title: t('pages.SalesSoPickups.viewPage.productsTable.unit'), key: 'unit' },
  { title: t('pages.SalesSoPickups.viewPage.productsTable.vehicleType'), key: 'vehicle_type' },
  { title: t('pages.SalesSoPickups.viewPage.productsTable.tripsCount'), key: 'trips_count' },
  { title: t('pages.SalesSoPickups.viewPage.productsTable.notes'), key: 'notes' },
])

// Products table data
const productsTableData = computed(() => {
  const products = detail.value?.items ?? detail.value?.products ?? []
  return products.map((item: any, index: number) => ({
    id: item.id ?? index,
    product_image: item.product_image ?? item.image ?? null,
    product_name: item.item_name ?? item.product_name ?? '—',
    quantity: item.quantity ?? '—',
    unit: item.unit_name ?? item.unit ?? '—',
    vehicle_type: item.vehicle_type ?? item.transport_type ?? '—',
    trips_count: item.trips_count ?? item.number_of_trips ?? '—',
    notes: item.notes ?? item.note ?? '—',
  }))
})

onMounted(() => {
  fetchPickupDetail()
})
</script>

<style scoped>
.info-item-bordered {
  min-width: 150px;
}
</style>
