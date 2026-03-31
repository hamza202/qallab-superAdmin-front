<template>
  <default-layout>
    <div class="logistics-order-view-page -mx-6 bg-qallab-dashboard-bg">
      <div class="flex flex-wrap items-center gap-3 mb-3 text-sm px-6 pt-4">
        <router-link to="/" class="text-gray-500 hover:text-primary-600">
          <span v-html="homeIcon"></span>
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <router-link to="/sales" class="text-gray-600 hover:text-primary-600">
          {{ t('sales.forms.viewPages.breadcrumb.sales') }}
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <router-link to="/sales/orders/logistics/list" class="text-gray-600 hover:text-primary-600">
          {{ t('sales.forms.viewPages.lists.logisticsOrders') }}
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ orderCode }}</span>
      </div>

      <div class="bg-white px-6 py-4 border-y border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
              <span v-html="fileCheckIcon" class="text-primary-600"></span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 mb-1">{{ orderCode }}</h1>
              <p class="text-sm text-gray-600">{{ t('sales.forms.viewPages.subtitles.orderDetail') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white rounded-3xl border !border-gray-100 mb-6 mt-3">
        <div class="flex items-center mb-6 gap-2 text-primary-600">
          <span v-html="fileCheckIcon"></span>
          <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.basicData') }}</h2>
        </div>
        <div class="flex flex-wrap gap-x-2 gap-y-4">
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportCompanyName') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ customerName }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.orderDate') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ orderDateTime }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.responsibleName') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ responsiblePerson }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.orderCreatedDate') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ orderCreationDate }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.responsiblePhone') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ responsiblePhone }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.orderTypeLabel') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ orderTypeLabel }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.tripLoadingLocation') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ sourceLocation }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.tripUnloadingLocation') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ targetLocation }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.projectName') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ projectName }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.viewPages.sections.priceCode') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ priceCode }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.paymentMethod') }}</label>
            <p class="text-base font-semibold text-gray-900">{{ paymentMethodLabel }}</p>
          </div>
          <v-divider vertical class="my-6"></v-divider>
          <div class="info-item-bordered px-4 py-2">
            <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.advancePayment') }}</label>
            <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
              {{ upfrontPaymentFormatted }} <span v-html="rialIcon"></span>
            </p>
          </div>
        </div>
      </div>

      <div class="mb-6 bg-white rounded-3xl border !border-gray-100">
        <div class="flex items-center gap-2 px-6 py-3 text-primary-600">
          <span v-html="busIcon"></span>
          <h2 class="text-base font-bold">{{ t('sales.forms.viewPages.tabs.logisticsRequestTransport') }}</h2>
        </div>
        <div class="px-6 pb-6 space-y-4">
          <div
            v-for="(detail, index) in logisticsDetailsList"
            :key="detail.id ?? index"
            class="border !border-gray-200 rounded-3xl p-6"
          >
            <div class="flex flex-wrap gap-x-2 gap-y-0">
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.materialCarriedType') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.material_type_display }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.tripsCount') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.trip_no ?? '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.executionDuration') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.actual_execution_display }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.viewPages.sections.workHours') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.am_pm_display }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportStart') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.from_date_formatted }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportEnd') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.to_date_formatted }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportAmount') }}</label>
                <p class="text-base font-semibold text-gray-900 flex items-center gap-1">
                  {{ detail.transport_amount_formatted }} <span v-html="rialIcon"></span>
                </p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportVehicleCount') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.transport_no_display }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.transportVehicleType') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.transport_type_display }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.loadingOfficer') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.loading_responsible_party || '—' }}</p>
              </div>
              <v-divider vertical class="my-6"></v-divider>
              <div class="info-item-bordered px-4 py-2">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.unloadingOfficer') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.downloading_responsible_party || '—' }}</p>
              </div>
              <v-divider vertical class="my-6" v-if="detail.source_location"></v-divider>
              <div class="info-item-bordered px-4 py-2" v-if="detail.source_location">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.pickupLocationShort') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.source_location }}</p>
              </div>
              <v-divider vertical class="my-6" v-if="detail.target_location"></v-divider>
              <div class="info-item-bordered px-4 py-2" v-if="detail.target_location">
                <label class="font-semibold text-sm text-gray-500 mb-2 block">{{ t('sales.forms.common.labels.deliveryLocationShort') }}</label>
                <p class="text-base font-semibold text-gray-900">{{ detail.target_location }}</p>
              </div>
            </div>
          </div>
          <div v-if="logisticsDetailsList.length === 0" class="text-center py-8 text-gray-500">
            {{ t('sales.forms.viewPages.sections.noTransportDetails') }}
          </div>
        </div>
      </div>

      <div class="mb-6 bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-4">
          <div class="flex items-center gap-2 text-primary-600">
            <span v-html="packageIcon"></span>
            <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.products') }}</h2>
          </div>
        </div>
        <DataTable :headers="productHeaders" :items="productItems" />
      </div>

      <div class="mb-6 bg-white rounded-3xl border !border-gray-100">
        <div class="px-6 py-4">
          <div class="flex items-center gap-2 text-primary-600">
            <span v-html="busIcon"></span>
            <h2 class="text-base font-bold">{{ t('sales.forms.viewPages.sections.tripsSection') }}</h2>
          </div>
        </div>
        <DataTable :headers="tripHeaders" :items="tripItems" />
      </div>
    </div>

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
import DataTable from '@/components/common/tables/DataTable.vue'
import { homeIcon, rialIcon } from '@/components/icons/globalIcons'
import { busIcon, packageIcon, fileCheckIcon } from '@/components/icons/priceOffersIcons'

const { t } = useI18n()
const route = useRoute()
const api = useApi()
const { error } = useNotification()

const isLoading = ref(false)
const orderData = ref<any>(null)

const routeId = computed(() => route.params.id as string)

const fetchOrderData = async () => {
  if (!routeId.value) return
  isLoading.value = true
  try {
    const res = await api.get<any>(`/sales/orders/logistics/${routeId.value}`)
    orderData.value = res?.data ?? res
  } catch (e: any) {
    console.error('Error fetching order data:', e)
    error(e?.response?.data?.message || t('sales.forms.common.messages.loadSalesOrderViewFailed'))
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrderData()
})

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const orderCode = computed(() => orderData.value?.code || '—')
const customerName = computed(() => orderData.value?.customer_name ?? '—')
const projectName = computed(() => orderData.value?.project_name || '—')
const responsiblePerson = computed(() => orderData.value?.responsible_person || '—')
const responsiblePhone = computed(() => orderData.value?.responsible_phone || '—')
const orderDateTime = computed(() => formatDate(orderData.value?.so_datetime) || '—')
const orderCreationDate = computed(() => formatDate(orderData.value?.so_datetime) || '—')
const sourceLocation = computed(() => orderData.value?.source_location || '—')
const targetLocation = computed(() => orderData.value?.target_location || '—')
const priceCode = computed(() => {
  const code = orderData.value?.code
  return code ? `#${code}` : '—'
})

const orderTypeLabel = computed(() => {
  const soType = orderData.value?.so_type
  if (soType === 'so_with_logistics') return t('sales.forms.viewPages.orderKind.logisticsOnly')
  if (soType === 'so_without_logistics') return t('sales.forms.viewPages.orderKind.saleNoTransport')
  return soType || '—'
})

const paymentMethodLabel = computed(() => {
  const m = orderData.value?.payment_method
  if (m === 'cash') return t('sales.forms.paymentsDemo.cash')
  if (m === 'deferred') return t('sales.forms.paymentsDemo.deferred')
  if (m === 'network') return t('sales.forms.paymentsDemo.network')
  return m || '—'
})

const upfrontPaymentFormatted = computed(() => {
  const v = orderData.value?.upfront_payment
  if (v == null || v === '') return '0'
  return Number(v).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const getAmPmLabel = (val: string | null | undefined): string => {
  if (val === 'am') return t('sales.forms.common.intervals.morning')
  if (val === 'pm') return t('sales.forms.common.intervals.evening')
  if (val === 'both') return t('sales.forms.common.intervals.morningAndEvening')
  return val || '—'
}

const logisticsDetailsList = computed(() => {
  const list = orderData.value?.so_logistics_details
  if (!Array.isArray(list)) return []
  return list.map((d: any) => {
    const materialType = Array.isArray(d.material_type) ? d.material_type : [d.material_type].filter(Boolean)
    const transportType = Array.isArray(d.transport_type) ? d.transport_type : [d.transport_type].filter(Boolean)
    return {
      id: d.id,
      material_type_display: d.material_type_label
        ? (Array.isArray(d.material_type_label) ? d.material_type_label.join(', ') : d.material_type_label)
        : materialType.join(', ') || '—',
      trip_no: d.trip_no,
      actual_execution_interval: d.actual_execution_interval,
      actual_execution_display: d.actual_execution_interval != null
        ? `${d.actual_execution_interval} ${t('sales.forms.viewPages.sections.dayUnit')}`
        : '—',
      am_pm_interval: d.am_pm_interval,
      am_pm_display: getAmPmLabel(d.am_pm_interval),
      from_date: d.from_date,
      from_date_formatted: formatDate(d.from_date),
      to_date: d.to_date,
      to_date_formatted: formatDate(d.to_date),
      transport_type: transportType,
      transport_type_display: d.transport_type_label
        ? (Array.isArray(d.transport_type_label) ? d.transport_type_label.join(', ') : d.transport_type_label)
        : transportType.join(', ') || '—',
      transport_no: d.transport_no,
      transport_no_display: d.transport_no != null ? `${d.transport_no} ${t('sales.forms.viewPages.sections.vehicleCountUnit')}` : '—',
      loading_responsible_party: d.loading_responsible_party,
      downloading_responsible_party: d.downloading_responsible_party,
      source_location: d.source_location,
      target_location: d.target_location,
      transport_amount: d.transport_amount,
      transport_amount_formatted:
        d.transport_amount != null
          ? Number(d.transport_amount).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '0.00',
    }
  })
})

const productHeaders = computed(() => [
  { title: t('sales.forms.tables.tripProducts.itemName'), key: 'item_name' },
  { title: t('sales.forms.common.labels.unitCol'), key: 'unit_name' },
  { title: t('sales.forms.common.labels.quantityDisplay'), key: 'quantity' },
  { title: t('sales.forms.common.labels.transportStart'), key: 'from_date_formatted' },
  { title: t('sales.forms.common.labels.dailyTrips'), key: 'trip_no' },
  { title: t('sales.forms.common.labels.transportVehicleType'), key: 'transport_type_display' },
])

const productItems = computed(() => {
  const items = orderData.value?.so_product_details ?? orderData.value?.items
  if (!Array.isArray(items)) return []
  return items.map((item: any) => {
    const transportType = item.transport_type != null ? [item.transport_type] : []
    return {
      id: item.id,
      item_id: item.item_id,
      item_name: item.item_name || '—',
      unit_name: item.unit_name || '—',
      quantity: item.quantity ?? '—',
      from_date: item.from_date,
      from_date_formatted: formatDate(item.from_date),
      trip_no: item.trip_no ?? '—',
      transport_type_display: item.transport_type_name ?? (transportType.length ? transportType.join(', ') : '—'),
    }
  })
})

const tripHeaders = computed(() => [
  { title: t('sales.forms.common.labels.product'), key: 'item_name' },
  { title: t('sales.forms.common.labels.quantityDisplay'), key: 'quantity_display' },
  { title: t('sales.forms.common.labels.date'), key: 'trip_date_formatted' },
  { title: t('sales.forms.common.labels.transportVehicleType'), key: 'transport_type_display' },
  { title: t('sales.forms.common.labels.tripPriceCol'), key: 'trip_price_formatted' },
  { title: t('sales.forms.viewPages.sections.totalPriceCol'), key: 'trip_price_formatted' },
])

const tripItems = computed(() => {
  const items = orderData.value?.so_trip_details
  if (!Array.isArray(items)) return []
  return items.map((item: any) => {
    const transportType = Array.isArray(item.transport_type) ? item.transport_type : [item.transport_type].filter(Boolean)
    const price = item.trip_price != null ? Number(item.trip_price) : 0
    const priceFormatted = price.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + t('sales.forms.paymentsDemo.currencySar')
    return {
      id: item.id,
      item_id: item.item_id,
      item_name: item.item_name || '—',
      quantity: item.quantity,
      quantity_display: item.unit_name ? `${item.quantity ?? '—'} ${item.unit_name}` : (item.quantity ?? '—'),
      trip_date: item.trip_date,
      trip_date_formatted: formatDate(item.trip_date),
      transport_type_display: item.transport_type_label
        ? (Array.isArray(item.transport_type_label) ? item.transport_type_label.join(', ') : item.transport_type_label)
        : transportType.join(', ') || '—',
      trip_price: item.trip_price,
      trip_price_formatted: priceFormatted,
    }
  })
})
</script>

<style scoped>
.info-item-bordered {
  min-width: 120px;
}
</style>
