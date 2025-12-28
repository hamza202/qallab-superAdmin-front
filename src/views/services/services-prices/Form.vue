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

const priceListIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 6.5C8.4401 6.5 6.5 8.4401 6.5 10.8333V41.1667C6.5 43.5599 8.4401 45.5 10.8333 45.5H41.1667C43.5599 45.5 45.5 43.5599 45.5 41.1667V10.8333C45.5 8.4401 43.5599 6.5 41.1667 6.5H10.8333ZM15.1667 18.4167C15.1667 17.2201 16.1367 16.25 17.3333 16.25H34.6667C35.8633 16.25 36.8333 17.2201 36.8333 18.4167C36.8333 19.6133 35.8633 20.5833 34.6667 20.5833H17.3333C16.1367 20.5833 15.1667 19.6133 15.1667 18.4167ZM15.1667 29.25C15.1667 28.0534 16.1367 27.0833 17.3333 27.0833H34.6667C35.8633 27.0833 36.8333 28.0534 36.8333 29.25C36.8333 30.4466 35.8633 31.4167 34.6667 31.4167H17.3333C16.1367 31.4167 15.1667 30.4466 15.1667 29.25Z" fill="#1570EF"/>
</svg>`;

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
                <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base"
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
          <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
            @click="handleSave" :loading="saving" :disabled="loading">
            <template #prepend>
              <v-icon>mdi-content-save-all-outline</v-icon>
            </template>
            حفظ
          </v-btn>
          <v-btn variant="flat" color="primary-50" height="44"
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
