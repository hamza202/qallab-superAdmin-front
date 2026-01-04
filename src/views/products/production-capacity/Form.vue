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

interface ItemUnit {
  id: number
  name: string
}

interface CapacityData {
  id?: number
  unit_type: string
  interval_unit: 'hour' | 'day' | 'week' | 'month'
  min_quantity: string | null
  max_quantity: string | null
  is_active: boolean
}

interface ProductionCapacityItem {
  id: number
  item_id: number
  name: string
  code: string
  image: string | null
  category: ItemCategory
  unit: ItemUnit
  is_active: boolean
  is_available: boolean
  capacity: CapacityData[]
}

interface ProductionCapacityRow {
  id: number
  itemId: number
  name: string
  code: string
  image: string | null
  category: ItemCategory
  unit: ItemUnit
  tonPerHourMin: string | null
  tonPerHourMax: string | null
  tonPerDayMin: string | null
  tonPerDayMax: string | null
  tonPerWeekMin: string | null
  tonPerWeekMax: string | null
  tonPerMonthMin: string | null
  tonPerMonthMax: string | null
  isActive: boolean
  originalData?: ProductionCapacityItem
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type ProductionCapacityNumericField = 
  | "tonPerHourMin"
  | "tonPerHourMax"
  | "tonPerDayMin"
  | "tonPerDayMax"
  | "tonPerWeekMin"
  | "tonPerWeekMax"
  | "tonPerMonthMin"
  | "tonPerMonthMax"

type BulkEditMode = "percentage" | "value"
type BulkEditDirection = "increase" | "decrease"

const route = useRoute()
const router = useRouter()
const api = useApi()
const { success, error } = useNotification()

const supplierId = computed(() => route.params.id ? Number(route.params.id) : null)
const loading = ref(false)
const saving = ref(false)
const modifiedItemIds = ref<Set<number>>(new Set())

const productionCapacityIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 6.5C8.4401 6.5 6.5 8.4401 6.5 10.8333V41.1667C6.5 43.5599 8.4401 45.5 10.8333 45.5H41.1667C43.5599 45.5 45.5 43.5599 45.5 41.1667V10.8333C45.5 8.4401 43.5599 6.5 41.1667 6.5H10.8333ZM15.1667 18.4167C15.1667 17.2201 16.1367 16.25 17.3333 16.25H34.6667C35.8633 16.25 36.8333 17.2201 36.8333 18.4167C36.8333 19.6133 35.8633 20.5833 34.6667 20.5833H17.3333C16.1367 20.5833 15.1667 19.6133 15.1667 18.4167ZM15.1667 29.25C15.1667 28.0534 16.1367 27.0833 17.3333 27.0833H34.6667C35.8633 27.0833 36.8333 28.0534 36.8333 29.25C36.8333 30.4466 35.8633 31.4167 34.6667 31.4167H17.3333C16.1367 31.4167 15.1667 30.4466 15.1667 29.25Z" fill="#1570EF"/>
</svg>`;

const rows = ref<ProductionCapacityRow[]>([])

// Fetch production capacity items
const fetchProductionCapacityItems = async (supplierId: number) => {
  try {
    loading.value = true
    const response = await api.get<ApiResponse<ProductionCapacityItem[]>>(
      `/api/suppliers/${supplierId}/production-capacity/items`
    )
    const items = response.data

    if (items && items.length > 0) {
      rows.value = items.map((item) => {
        // Find capacity data for each interval unit
        const hourCapacity = item.capacity.find(c => c.interval_unit === 'hour')
        const dayCapacity = item.capacity.find(c => c.interval_unit === 'day')
        const weekCapacity = item.capacity.find(c => c.interval_unit === 'week')
        const monthCapacity = item.capacity.find(c => c.interval_unit === 'month')

        return {
          id: item.id,
          itemId: item.item_id,
          name: item.name,
          code: item.code,
          image: item.image,
          category: item.category,
          unit: item.unit,
          tonPerHourMin: hourCapacity?.min_quantity || null,
          tonPerHourMax: hourCapacity?.max_quantity || null,
          tonPerDayMin: dayCapacity?.min_quantity || null,
          tonPerDayMax: dayCapacity?.max_quantity || null,
          tonPerWeekMin: weekCapacity?.min_quantity || null,
          tonPerWeekMax: weekCapacity?.max_quantity || null,
          tonPerMonthMin: monthCapacity?.min_quantity || null,
          tonPerMonthMax: monthCapacity?.max_quantity || null,
          isActive: item.is_active,
          originalData: item
        }
      })
    }
  } catch (err: any) {
    console.error('Error fetching production capacity items:', err)
    error(err?.response?.data?.message || 'فشل في جلب عناصر القدرة الإنتاجية')
  } finally {
    loading.value = false
  }
}

// Bulk sync production capacity
const bulkSyncItems = async (supplierId: number, items: ProductionCapacityRow[]) => {
  const capacityItems: any[] = []

  items.forEach(row => {
    // Create capacity entries for each interval unit that has data
    const intervals: Array<{ unit: 'hour' | 'day' | 'week' | 'month', min: string | null, max: string | null }> = [
      { unit: 'hour', min: row.tonPerHourMin, max: row.tonPerHourMax },
      { unit: 'day', min: row.tonPerDayMin, max: row.tonPerDayMax },
      { unit: 'week', min: row.tonPerWeekMin, max: row.tonPerWeekMax },
      { unit: 'month', min: row.tonPerMonthMin, max: row.tonPerMonthMax }
    ]

    intervals.forEach(interval => {
      // Only add if at least one value is provided
      if (interval.min !== null || interval.max !== null) {
        capacityItems.push({
          item_id: row.itemId,
          unit_type: row.unit.name.toLowerCase() || 'ton',
          interval_unit: interval.unit,
          min_quantity: interval.min ? parseFloat(interval.min) : 0,
          max_quantity: interval.max ? parseFloat(interval.max) : 0,
          is_active: row.isActive
        })
      }
    })
  })

  const payload = { items: capacityItems }
  return await api.put(`/api/suppliers/${supplierId}/production-capacity/items/sync`, payload)
}

// Track changes
const handleCapacityChange = (row: ProductionCapacityRow) => {
  modifiedItemIds.value.add(row.itemId)
}

const tableHeaders = [
  { key: "rowNumber", title: "#", width: "70px" },
  { key: "productId", title: "المنتج", width: "280px" },
  {
    key: "tonPerHour",
    title: "كمية الإنتاج بالطن / ساعة",
    children: [
      { key: "tonPerHourMin", title: "أدنى", width: "140px" },
      { key: "tonPerHourMax", title: "أعلى", width: "140px" },
    ],
  },
  {
    key: "tonPerDay",
    title: "كمية الإنتاج بالطن / باليوم",
    children: [
      { key: "tonPerDayMin", title: "أدنى", width: "140px" },
      { key: "tonPerDayMax", title: "أعلى", width: "140px" },
    ],
  },
  {
    key: "tonPerWeek",
    title: "كمية الإنتاج بالطن / بالاسبوع",
    children: [
      { key: "tonPerWeekMin", title: "أدنى", width: "140px" },
      { key: "tonPerWeekMax", title: "أعلى", width: "140px" },
    ],
  },
  {
    key: "tonPerMonth",
    title: "كمية الإنتاج بالطن / بالشهر",
    children: [
      { key: "tonPerMonthMin", title: "أدنى", width: "140px" },
      { key: "tonPerMonthMax", title: "أعلى", width: "140px" },
    ],
  },
];

const bulkEditMode = ref<BulkEditMode>("percentage");
const bulkEditDirection = ref<BulkEditDirection>("increase");
const bulkEditAmount = ref<number | null>(10);

const applyBulkEdit = () => {
  const amount = Math.abs(Number(bulkEditAmount.value))
  if (!Number.isFinite(amount) || amount === 0) return

  const applyToValue = (value: string | null) => {
    const base = parseFloat(value || '0')
    if (!Number.isFinite(base)) return '0'

    let next = base
    if (bulkEditMode.value === "percentage") {
      const factor = amount / 100
      next = bulkEditDirection.value === "increase" ? base * (1 + factor) : base * (1 - factor)
    } else {
      next = bulkEditDirection.value === "increase" ? base + amount : base - amount
    }

    if (!Number.isFinite(next)) return value || '0'
    next = Math.max(0, Math.round(next * 100) / 100)
    return next.toString()
  }

  const fields: ProductionCapacityNumericField[] = [
    "tonPerHourMin",
    "tonPerHourMax",
    "tonPerDayMin",
    "tonPerDayMax",
    "tonPerWeekMin",
    "tonPerWeekMax",
    "tonPerMonthMin",
    "tonPerMonthMax",
  ]

  rows.value.forEach((r) => {
    fields.forEach((f) => {
      r[f] = applyToValue(r[f])
    })
    modifiedItemIds.value.add(r.itemId)
  })
}

const handleSave = async () => {
  try {
    saving.value = true

    if (!supplierId.value) {
      error('معرف المورد غير موجود')
      return
    }

    // Check if any modifications were made
    if (modifiedItemIds.value.size === 0) {
      error('لم يتم تعديل أي عنصر')
      return
    }

    // Send ALL items with their capacity data
    const response = await bulkSyncItems(supplierId.value, rows.value)
    const data = response.data

    const summary = data.summary
    const messages = []
    
    if (summary.added > 0) messages.push(`تم إضافة ${summary.added} عنصر`)
    if (summary.updated > 0) messages.push(`تم تحديث ${summary.updated} عنصر`)
    if (summary.removed > 0) messages.push(`تم حذف ${summary.removed} عنصر`)
    if (summary.errors > 0) messages.push(`فشل ${summary.errors} عنصر`)

    if (summary.errors > 0 && data.errors.length > 0) {
      const errorMessages = data.errors.map((e: any) => e.error || e.message).join(', ')
      error(`${messages.join(', ')}. الأخطاء: ${errorMessages}`)
    } else {
      success(messages.join(', ') || 'تم حفظ التغييرات بنجاح')
    }

    // Refresh data
    modifiedItemIds.value.clear()
    await fetchProductionCapacityItems(supplierId.value)
  } catch (err: any) {
    console.error('Error saving production capacity:', err)
    error(err?.response?.data?.message || 'فشل في حفظ القدرة الإنتاجية')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  router.push({ name: 'ProductionCapacityList' })
}

// Lifecycle
onMounted(async () => {
  if (supplierId.value) {
    await fetchProductionCapacityItems(supplierId.value)
  }
})
</script>

<template>
  <default-layout>
    <div class="production-capacity-page">
      <PageHeader :icon="productionCapacityIcon" title-key="pages.productionCapacityList.title"
        description-key="pages.productionCapacityList.description" />

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
            <div class="text-sm font-semibold text-gray-700">
              عدد المنتجات: {{ rows.length }}
            </div>
          </div>
        </div>

        <EditableDataTable :headers="tableHeaders" :items="rows" :loading="loading" show-checkbox>
          <template #item.rowNumber="{ rowIndex }">
            <span class="text-sm text-gray-600">{{ rowIndex + 1 }}</span>
          </template>

          <template #item.productId="{ item }">
            <div class="flex items-center gap-3">
              <v-avatar v-if="(item as ProductionCapacityRow).image" size="40" rounded>
                <v-img :src="(item as ProductionCapacityRow).image || undefined" :alt="(item as ProductionCapacityRow).name" />
              </v-avatar>
              <div>
                <div class="text-sm font-semibold text-gray-900">{{ (item as ProductionCapacityRow).name }}</div>
                <div class="text-xs text-gray-500">{{ (item as ProductionCapacityRow).code }} • {{ (item as ProductionCapacityRow).category.name }}</div>
              </div>
            </div>
          </template>

          <template #item.tonPerHourMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerHourMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerHourMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerHourMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerDayMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerDayMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerDayMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerDayMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerWeekMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerWeekMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerWeekMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerWeekMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerMonthMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerMonthMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
            </div>
          </template>

          <template #item.tonPerMonthMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="(item as ProductionCapacityRow).tonPerMonthMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" 
                @update:model-value="handleCapacityChange(item as ProductionCapacityRow)" />
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
