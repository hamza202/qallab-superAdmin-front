<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

interface ItemCategory {
  id: number
  name: string
  is_building_material: boolean
}

interface ServiceOption {
  id: number
  name: string
  code: string
  category: ItemCategory
}

interface ServicePriceRow {
  id: number
  itemId: number | null
  item?: ServiceOption
  priceMin: number | null
  priceMax: number | null
  isActive: boolean
  priceListItemId?: number
}

type EditableTableItem = {
  id: string | number
  [key: string]: any
}

type BulkEditMode = "percentage" | "value"
type BulkEditDirection = "increase" | "decrease"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface ItemsListResponse {
  id: number
  name: string
  code: string
  category: ItemCategory
}

const route = useRoute()
const router = useRouter()
const api = useApi()
const { success, error } = useNotification()

const priceListId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEditing = computed(() => !!priceListId.value)
const loading = ref(false)
const saving = ref(false)

const priceListIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 6.5C8.4401 6.5 6.5 8.4401 6.5 10.8333V41.1667C6.5 43.5599 8.4401 45.5 10.8333 45.5H41.1667C43.5599 45.5 45.5 43.5599 45.5 41.1667V10.8333C45.5 8.4401 43.5599 6.5 41.1667 6.5H10.8333ZM15.1667 18.4167C15.1667 17.2201 16.1367 16.25 17.3333 16.25H34.6667C35.8633 16.25 36.8333 17.2201 36.8333 18.4167C36.8333 19.6133 35.8633 20.5833 34.6667 20.5833H17.3333C16.1367 20.5833 15.1667 19.6133 15.1667 18.4167ZM15.1667 29.25C15.1667 28.0534 16.1367 27.0833 17.3333 27.0833H34.6667C35.8633 27.0833 36.8333 28.0534 36.8333 29.25C36.8333 30.4466 35.8633 31.4167 34.6667 31.4167H17.3333C16.1367 31.4167 15.1667 30.4466 15.1667 29.25Z" fill="#1570EF"/>
</svg>`;

const serviceName = ref("")
const serviceItems = ref<{ title: string; value: number; item: ServiceOption }[]>([])

const nextRowId = ref(1)

const createEmptyRow = (): ServicePriceRow => ({
  id: nextRowId.value++,
  itemId: null,
  priceMin: null,
  priceMax: null,
  isActive: true,
})

const rows = ref<ServicePriceRow[]>([createEmptyRow()])

// API Functions
const fetchAvailableItems = async () => {
  try {
    const response = await api.get<ApiResponse<ItemsListResponse[]>>('/api/items/list')
    // Filter only non-building materials (services)
    const services = response.data.filter(item => !item.category.is_building_material)
    serviceItems.value = services.map(item => ({
      title: `${item.name} (${item.code})`,
      value: item.id,
      item: item
    }))
  } catch (err: any) {
    console.error('Error fetching services:', err)
    error(err?.response?.data?.message || 'فشل في جلب قائمة الخدمات')
  }
}

const fetchPriceListItems = async (priceListId: number) => {
  try {
    loading.value = true
    const response = await api.get(`/api/suppliers/${priceListId}/price-list/items`)
    const items = response.data

    if (items && items.length > 0) {
      rows.value = items.map((item: any, index: number) => ({
        id: index + 1,
        itemId: item.item_id,
        item: item.item,
        priceMin: item.price_min ? parseFloat(item.price_min) : null,
        priceMax: item.price_max ? parseFloat(item.price_max) : null,
        isActive: item.is_active,
        priceListItemId: item.id
      }))
      nextRowId.value = items.length + 1
    }
  } catch (err: any) {
    console.error('Error fetching price list items:', err)
    error(err?.response?.data?.message || 'فشل في جلب عناصر قائمة الأسعار')
  } finally {
    loading.value = false
  }
}

const updatePriceListItem = async (priceListId: number, itemId: number, row: ServicePriceRow) => {
  const payload: any = {
    is_active: row.isActive
  }

  if (row.priceMin !== null) payload.price_min = row.priceMin
  if (row.priceMax !== null) payload.price_max = row.priceMax

  return await api.put(`/api/suppliers/${priceListId}/price-list/items/${itemId}`, payload)
}

const bulkCreateItems = async (priceListId: number, items: ServicePriceRow[]) => {
  const payload = {
    items: items.map(row => {
      const item: any = {
        item_id: row.itemId,
        is_active: row.isActive
      }

      if (row.priceMin) item.price_min = row.priceMin
      if (row.priceMax) item.price_max = row.priceMax

      return item
    })
  }

  return await api.post(`/api/suppliers/${priceListId}/price-list/items/bulk`, payload)
}

// Watch for item selection
const handleItemChange = (row: any) => {
  const selectedItem = serviceItems.value.find(p => p.value === row.itemId)
  if (selectedItem) {
    row.item = selectedItem.item
  }
}

const tableHeaders = [
  { key: "rowNumber", title: "#", width: "70px" },
  { key: "itemId", title: "الخدمة" },
  { key: "maxPrice", title: "أعلى سعر", width: "150px" },
  { key: "minPrice", title: "أدنى سعر", width: "150px" },
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

const addRow = () => {
  rows.value.push(createEmptyRow())
}

const removeRow = (rowId: number) => {
  rows.value = rows.value.filter((r) => r.id !== rowId)
  if (rows.value.length === 0) {
    rows.value.push(createEmptyRow())
  }
}

const handleDeleteRow = (item: EditableTableItem) => {
  const rowId = typeof item.id === "number" ? item.id : Number(item.id)
  if (Number.isNaN(rowId)) return
  removeRow(rowId)
}

const validateRow = (row: ServicePriceRow): string | null => {
  if (!row.itemId) return 'يجب اختيار الخدمة'

  if (!row.priceMin && !row.priceMax) {
    return 'يجب إدخال سعر أدنى أو أعلى'
  }

  if (row.priceMin && row.priceMax && row.priceMax < row.priceMin) {
    return 'السعر الأعلى يجب أن يكون أكبر من أو يساوي السعر الأدنى'
  }

  return null
}

const handleSave = async () => {
  try {
    saving.value = true

    if (!priceListId.value) {
      error('معرف قائمة الأسعار غير موجود')
      return
    }

    // Validate all rows
    for (const row of rows.value) {
      const validationError = validateRow(row)
      if (validationError) {
        error(validationError)
        return
      }
    }

    if (isEditing.value) {
      // Update items in price list
      const updatePromises = rows.value.map(row => {
        if (row.priceListItemId) {
          return updatePriceListItem(priceListId.value!, row.itemId!, row)
        }
        return null
      }).filter(Boolean)

      await Promise.all(updatePromises)
      success('تم تحديث قائمة الأسعار بنجاح')
    } else {
      // Bulk create items for new price list
      const response = await bulkCreateItems(priceListId.value, rows.value)
      const data = response.data

      if (data.error_count > 0) {
        const errorMessages = data.errors.map((e: any) => e.error).join(', ')
        error(`تم إضافة ${data.success_count} عنصر، فشل ${data.error_count}: ${errorMessages}`)
      } else {
        success(`تم إضافة ${data.success_count} عنصر بنجاح`)
      }
    }

    router.push({ name: 'ServicesPriceListsList' })
  } catch (err: any) {
    console.error('Error saving service price list:', err)
    error(err?.response?.data?.message || 'فشل في حفظ قائمة الأسعار')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  router.push({ name: 'ServicesPriceListsList' })
}

// Lifecycle
onMounted(async () => {
  await fetchAvailableItems()

  if (isEditing.value && priceListId.value) {
    await fetchPriceListItems(priceListId.value)
  }
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
            <div class="min-w-[250px]">
              <TextInput v-model="serviceName" placeholder="اسم قائمة السعر" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>

            <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base"
              prepend-icon="mdi-plus" @click="addRow">
              إضافة خدمة
            </v-btn>
          </div>
        </div>
        <EditableDataTable :headers="tableHeaders" :items="rows" :show-actions="true" :show-delete="true" show-checkbox
          @delete="handleDeleteRow">
          <template #item.rowNumber="{ rowIndex }">
            <span class="text-sm text-gray-600">{{ rowIndex + 1 }}</span>
          </template>

          <template #item.itemId="{ item }">
            <div class="sm:max-w-[350px]">
              <SelectInput v-model="item.itemId" :items="serviceItems" placeholder="اختر الخدمة" :hide-details="true"
                :input-props="{ class: 'bg-white' }" @update:model-value="handleItemChange(item)" />
            </div>
          </template>

          <template #item.maxPrice="{ item }">
            <div class="w-[180px]">
              <PriceInput v-model="item.priceMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>
          <template #item.minPrice="{ item }">
            <div class="w-[180px]">
              <PriceInput v-model="item.priceMin" placeholder="0" :hide-details="true"
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
