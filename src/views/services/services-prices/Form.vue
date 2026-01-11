<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

interface ItemCategory {
  id: number | null
  name: string | null
  is_building_material: boolean
}

interface ItemUnit {
  id: number | null
  name: string | null
}

interface ServicePriceData {
  id: number
  service_id: number
  service_code: string
  name: string
  description: string
  service_domain: string
  service_type: string
  unit_price: string
  category: ItemCategory
  unit: ItemUnit
  is_active: boolean
  is_available: boolean
  prices: any
}

interface ServicePriceRow {
  id: number
  serviceId: number
  serviceName: string
  serviceCode: string
  description: string
  serviceDomain: string
  serviceType: string
  unitPrice: number
  category: ItemCategory
  unit: ItemUnit
  priceMin: number | null
  priceMax: number | null
  isActive: boolean
  isAvailable: boolean
  originalData?: ServicePriceData
}

type EditableTableItem = {
  id: string | number
  [key: string]: any
}

type BulkEditMode = "percentage" | "value"
type BulkEditDirection = "increase" | "decrease"

interface ServicesListResponse {
  success: boolean
  message: string
  data: ServicePriceData[]
  count: number
}

const route = useRoute()
const router = useRouter()
const api = useApi()
const { success, error } = useNotification()

const loading = ref(false)
const saving = ref(false)

const priceListIcon = `<svg width="43" height="35" viewBox="0 0 43 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 8.5L28 8.5M28 8.5C28 12.0899 30.9102 15 34.5 15C38.0899 15 41 12.0899 41 8.5C41 4.91015 38.0899 2 34.5 2C30.9102 2 28 4.91015 28 8.5ZM15 25.8333L41 25.8333M15 25.8333C15 29.4232 12.0899 32.3333 8.5 32.3333C4.91015 32.3333 2 29.4232 2 25.8333C2 22.2435 4.91015 19.3333 8.5 19.3333C12.0899 19.3333 15 22.2435 15 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16536 0.833496H10.5608C10.9684 0.833496 11.1723 0.833496 11.3641 0.879546C11.5341 0.920374 11.6967 0.987715 11.8458 1.0791C12.014 1.18217 12.1582 1.32629 12.4464 1.61454L15.051 4.21911C15.3392 4.50737 15.4834 4.65149 15.5864 4.81969C15.6778 4.96881 15.7452 5.13138 15.786 5.30144C15.832 5.49326 15.832 5.69708 15.832 6.10473V12.5002M8.7487 6.66683H5.4987C5.03199 6.66683 4.79863 6.66683 4.62037 6.576C4.46357 6.49611 4.33609 6.36862 4.25619 6.21182C4.16536 6.03356 4.16536 5.80021 4.16536 5.3335V3.75016M9.58203 15.8335V12.1668C9.58203 11.7001 9.58203 11.4668 9.4912 11.2885C9.41131 11.1317 9.28383 11.0042 9.12702 10.9243C8.94876 10.8335 8.71541 10.8335 8.2487 10.8335H5.4987C5.03199 10.8335 4.79863 10.8335 4.62037 10.9243C4.46357 11.0042 4.33609 11.1317 4.25619 11.2885C4.16536 11.4668 4.16536 11.7001 4.16536 12.1668V15.8335M12.9154 6.80245V13.1668C12.9154 14.1002 12.9154 14.567 12.7337 14.9235C12.5739 15.2371 12.319 15.4921 12.0053 15.6518C11.6488 15.8335 11.1821 15.8335 10.2487 15.8335H3.4987C2.56528 15.8335 2.09857 15.8335 1.74205 15.6518C1.42844 15.4921 1.17348 15.2371 1.01369 14.9235C0.832031 14.567 0.832031 14.1003 0.832031 13.1668V6.41683C0.832031 5.48341 0.832031 5.0167 1.01369 4.66018C1.17348 4.34658 1.42844 4.09161 1.74205 3.93182C2.09857 3.75016 2.56528 3.75016 3.4987 3.75016H9.86308C10.0669 3.75016 10.1688 3.75016 10.2647 3.77319C10.3498 3.7936 10.431 3.82727 10.5056 3.87296C10.5897 3.9245 10.6618 3.99656 10.8059 4.14069L12.5248 5.85964C12.669 6.00376 12.741 6.07583 12.7926 6.15993C12.8383 6.23449 12.8719 6.31577 12.8923 6.4008C12.9154 6.49671 12.9154 6.59862 12.9154 6.80245Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const supplierId = computed(() => route.params.supplierId ? Number(route.params.supplierId) : 1)
const searchQuery = ref("")
const selectedCategory = ref<string | null>("all")
const categories = [
  { title: "جميع الفئات", value: "all" },
  { title: "النقل", value: "transport" },
  { title: "التحليل", value: "analysis" },
  { title: "أخرى", value: "other" },
]

const allRows = ref<ServicePriceRow[]>([])
const rows = ref<ServicePriceRow[]>([])

// API Functions
const fetchSupplierServices = async () => {
  try {
    loading.value = true
    const response = await api.get<ServicesListResponse>(`/api/suppliers/${supplierId.value}/price-list/services`)
    
    if (response.success && response.data) {
      allRows.value = response.data.map((service) => ({
        id: service.id,
        serviceId: service.service_id,
        serviceName: service.name,
        serviceCode: service.service_code,
        description: service.description,
        serviceDomain: service.service_domain,
        serviceType: service.service_type,
        unitPrice: parseFloat(service.unit_price),
        category: service.category,
        unit: service.unit,
        priceMin: service.prices?.price_min ? parseFloat(service.prices.price_min) : null,
        priceMax: service.prices?.price_max ? parseFloat(service.prices.price_max) : null,
        isActive: service.is_active,
        isAvailable: service.is_available,
        originalData: service
      }))
      
      applyFilters()
    }
  } catch (err: any) {
    console.error('Error fetching services:', err)
    error(err?.response?.data?.message || 'فشل في جلب قائمة الخدمات')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  let filtered = [...allRows.value]
  
  // Filter by category
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    filtered = filtered.filter(row => row.serviceDomain === selectedCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(row => 
      row.serviceName.toLowerCase().includes(query) ||
      row.serviceCode.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query)
    )
  }
  
  rows.value = filtered
}

const updateServicePrices = async (serviceId: number, row: ServicePriceRow) => {
  const payload: any = {}

  if (row.priceMin !== null) payload.price_min = row.priceMin
  if (row.priceMax !== null) payload.price_max = row.priceMax

  return await api.put(`/api/suppliers/${supplierId.value}/price-list/services/${serviceId}`, payload)
}

const tableHeaders = [
  { key: "rowNumber", title: "#", width: "70px" },
  { key: "serviceName", title: "اسم الخدمة" },
  { key: "serviceCode", title: "كود الخدمة", width: "150px" },
  { key: "unitPrice", title: "السعر الأساسي", width: "150px" },
  { key: "minPrice", title: "أدنى سعر", width: "150px" },
  { key: "maxPrice", title: "أعلى سعر", width: "150px" },
];

const bulkEditMode = ref<BulkEditMode>("percentage");
const bulkEditDirection = ref<BulkEditDirection>("increase");
const bulkEditAmount = ref<number | null>(10);

const applyBulkEdit = () => {
  const amount = Math.abs(Number(bulkEditAmount.value))
  if (!Number.isFinite(amount) || amount === 0) return

  const applyToValue = (value: number | null) => {
    const base = Number(value ?? 0)
    if (!Number.isFinite(base)) return 0

    let next = base
    if (bulkEditMode.value === "percentage") {
      const factor = amount / 100
      next = bulkEditDirection.value === "increase" ? base * (1 + factor) : base * (1 - factor)
    } else {
      next = bulkEditDirection.value === "increase" ? base + amount : base - amount
    }

    if (!Number.isFinite(next)) return base
    next = Math.max(0, Math.round(next * 100) / 100)
    return next
  }

  rows.value.forEach((r) => {
    r.priceMin = applyToValue(r.priceMin)
    r.priceMax = applyToValue(r.priceMax)
  })
}

const handleDeleteRow = (item: EditableTableItem) => {
  // Services cannot be deleted, only prices can be cleared
  const row = rows.value.find(r => r.id === item.id)
  if (row) {
    row.priceMin = null
    row.priceMax = null
  }
}

const validateRow = (row: ServicePriceRow): string | null => {
  if (row.priceMin !== null && row.priceMax !== null && row.priceMax < row.priceMin) {
    return `السعر الأعلى يجب أن يكون أكبر من أو يساوي السعر الأدنى للخدمة: ${row.serviceName}`
  }

  return null
}

const handleSave = async () => {
  try {
    saving.value = true

    // Validate all rows
    for (const row of allRows.value) {
      const validationError = validateRow(row)
      if (validationError) {
        error(validationError)
        return
      }
    }

    // Update only services that have price changes
    const rowsToUpdate = allRows.value.filter(row => 
      row.priceMin !== null || row.priceMax !== null
    )

    if (rowsToUpdate.length === 0) {
      error('لا توجد تغييرات للحفظ')
      return
    }

    const updatePromises = rowsToUpdate.map(row => 
      updateServicePrices(row.id, row)
    )

    await Promise.all(updatePromises)
    success(`تم تحديث أسعار ${rowsToUpdate.length} خدمة بنجاح`)

    // Refresh data
    await fetchSupplierServices()
  } catch (err: any) {
    console.error('Error saving service prices:', err)
    error(err?.response?.data?.message || 'فشل في حفظ أسعار الخدمات')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  router.push({ name: 'ServicesPriceListsList' })
}


// Lifecycle
onMounted(async () => {
  await fetchSupplierServices()
})
</script>

<template>
  <default-layout>
    <div class="services-price-list-page">
      <PageHeader :icon="priceListIcon" title-key="pages.servicePricesList.title"
        description-key="pages.servicePricesList.description" />

      <div class="-mx-6">
        <div class="pb-2">
          <div class="px-4 py-3">
            <div class="flex flex-col md:flex-row gap-5 md:items-center">
              <div class="text-lg font-bold text-gray-900">تعديل الكل</div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="p-1 bg-gray-50 border border-gray-100 rounded-lg">
                  <v-btn-toggle v-model="bulkEditMode" mandatory density="comfortable" color="primary" class="gap-2">
                    <v-btn value="percentage" variant="flat" class="px-6">نسبة</v-btn>
                    <v-btn value="value" variant="flat" class="px-6">قيمة</v-btn>
                  </v-btn-toggle>
                </div>

                <div class="w-[120px]">
                  <PriceInput v-model="bulkEditAmount" :hide-details="true" :input-props="{ class: 'bg-white' }"
                    :currency="bulkEditMode === 'percentage' ? '%' : ''" placeholder="10" />
                </div>
                <div class="p-1 bg-gray-50 border border-gray-100 rounded-lg">

                  <v-btn-toggle v-model="bulkEditDirection" mandatory density="comfortable" color="primary"
                    class="gap-2">
                    <v-btn value="increase" variant="flat" class="px-4">
                      <template #prepend>
                        <span class="w-5 h-4 rounded-full bg-white flex items-center justify-center">
                          <v-icon icon="mdi-plus" size="13" />
                        </span>
                      </template>
                      <span class="font-semibold">زيادة</span>
                    </v-btn>
                    <v-btn value="decrease" variant="flat" class="px-4">
                      <template #prepend>
                        <span class="w-5 h-4 rounded-full bg-white flex items-center justify-center">
                          <v-icon icon="mdi-minus" size="13" />
                        </span>
                      </template>

                      <span class="font-semibold">نقصان</span>
                    </v-btn>
                  </v-btn-toggle>
                </div>
                <v-btn variant="flat" rounded="4" color="primary-500" border="sm"  height="40" class="px-7 !border-primary-200 text-white font-semibold text-base"
                  @click="applyBulkEdit">
                  تطبيق
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3">
          <div class="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
              <div class="min-w-[250px]">
                <TextInput v-model="searchQuery" placeholder="بحث بالاسم أو الكود" :hide-details="true"
                  :input-props="{ class: 'bg-white' }" prepend-inner-icon="mdi-magnify"
                  @update:model-value="applyFilters" />
              </div>
              
              <div class="min-w-[200px]">
                <SelectInput v-model="selectedCategory" :items="categories" placeholder="فلتر بالفئة" 
                  :hide-details="true" :input-props="{ class: 'bg-white' }"
                  @update:model-value="applyFilters" />
              </div>
            </div>

            <div class="text-sm font-semibold text-gray-700">
              عدد الخدمات: {{ rows.length }}
            </div>
          </div>
        </div>
        <EditableDataTable :headers="tableHeaders" :items="rows" :show-actions="true" :show-delete="true" show-checkbox
          :loading="loading" @delete="handleDeleteRow">
          <template #item.rowNumber="{ rowIndex }">
            <span class="text-sm text-gray-600">{{ rowIndex + 1 }}</span>
          </template>

          <template #item.serviceName="{ item }">
            <div class="flex flex-col">
              <span class="font-semibold text-gray-900">{{ item.serviceName }}</span>
              <span class="text-xs text-gray-500">{{ item.description }}</span>
            </div>
          </template>

          <template #item.serviceCode="{ item }">
            <span class="text-sm font-mono text-gray-700">{{ item.serviceCode }}</span>
          </template>

          <template #item.unitPrice="{ item }">
            <span class="text-sm font-semibold text-gray-900">{{ item.unitPrice.toFixed(2) }} ر.س</span>
          </template>

          <template #item.minPrice="{ item }">
            <div class="w-[180px]">
              <PriceInput v-model="item.priceMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>
          
          <template #item.maxPrice="{ item }">
            <div class="w-[180px]">
              <PriceInput v-model="item.priceMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>
        </EditableDataTable>

        <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6">
          <v-btn variant="flat" rounded="4" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
            @click="handleSave" :loading="saving" :disabled="loading">
            <template #prepend>
              <span v-html="saveIcon"></span>
            </template>
            حفظ
          </v-btn>
          <v-btn variant="flat" rounded="4" color="primary-50" height="44"
            class="font-semibold text-base text-primary-700 sm:min-w-[200px]" @click="handleClose" :disabled="saving">
            <template #prepend>
              <v-icon>mdi-close</v-icon>
            </template>
            اغلاق
          </v-btn>
        </div>
      </div>
    </div>
  </default-layout>
</template>

<style scoped></style>
