<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

interface ItemCategory {
  id: number
  name: string
  is_building_material: boolean
  sup_category?: any[]
}

interface ItemUnit {
  id: number
  name: string
}

interface ItemPrices {
  price_m3: string | null
  price_ton: string | null
  price_rd: string | null
  price_min: string | null
  price_max: string | null
  is_active: boolean
}

interface PriceListItem {
  id: number
  item_id: number
  name: string
  code: string
  image: string | null
  category: ItemCategory
  unit: ItemUnit
  is_active: boolean
  is_available: boolean
  prices: ItemPrices
}

interface PriceListRow {
  id: number
  itemId: number
  name: string
  code: string
  image: string | null
  category: ItemCategory
  unit: ItemUnit
  salePriceTon: string | null
  salePriceM3: string | null
  salePriceRd: string | null
  isActive: boolean
  isAvailable: boolean
  originalData?: PriceListItem
}

type BulkEditMode = "percentage" | "value"
type BulkEditDirection = "increase" | "decrease"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const route = useRoute()
const router = useRouter()
const api = useApi()
const { success, error } = useNotification()

const supplierId = computed(() => route.params.id ? Number(route.params.id) : null)
const loading = ref(false)
const saving = ref(false)

// Categories for filtering
const categories = ref<ItemCategory[]>([])
const selectedCategory = ref<number | null>(null)

const priceListIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 6.5C8.4401 6.5 6.5 8.4401 6.5 10.8333V41.1667C6.5 43.5599 8.4401 45.5 10.8333 45.5H41.1667C43.5599 45.5 45.5 43.5599 45.5 41.1667V10.8333C45.5 8.4401 43.5599 6.5 41.1667 6.5H10.8333ZM15.1667 18.4167C15.1667 17.2201 16.1367 16.25 17.3333 16.25H34.6667C35.8633 16.25 36.8333 17.2201 36.8333 18.4167C36.8333 19.6133 35.8633 20.5833 34.6667 20.5833H17.3333C16.1367 20.5833 15.1667 19.6133 15.1667 18.4167ZM15.1667 29.25C15.1667 28.0534 16.1367 27.0833 17.3333 27.0833H34.6667C35.8633 27.0833 36.8333 28.0534 36.8333 29.25C36.8333 30.4466 35.8633 31.4167 34.6667 31.4167H17.3333C16.1367 31.4167 15.1667 30.4466 15.1667 29.25Z" fill="#1570EF"/>
</svg>`;

const productName = ref("")
const allRows = ref<PriceListRow[]>([])
const modifiedItemIds = ref<Set<number>>(new Set())

// Filtered rows based on search and category
const rows = computed(() => {
  let filtered = allRows.value

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(row => row.category.id === selectedCategory.value)
  }

  // Filter by name/code search
  if (productName.value.trim()) {
    const search = productName.value.trim().toLowerCase()
    filtered = filtered.filter(row => 
      row.name.toLowerCase().includes(search) || 
      row.code.toLowerCase().includes(search)
    )
  }

  return filtered
})

// API Functions
const fetchCategories = async () => {
  try {
    const response = await api.get<ApiResponse<ItemCategory[]>>('/api/settings/categories/list')
    categories.value = response.data
  } catch (err: any) {
    console.error('Error fetching categories:', err)
    error(err?.response?.data?.message || 'فشل في جلب التصنيفات')
  }
}

const fetchPriceListItems = async (supplierId: number) => {
  try {
    loading.value = true
    const response = await api.get<ApiResponse<PriceListItem[]>>(`/api/suppliers/${supplierId}/price-list/items`)
    const items = response.data

    if (items && items.length > 0) {
      allRows.value = items.map((item: PriceListItem) => ({
        id: item.id,
        itemId: item.item_id,
        name: item.name,
        code: item.code,
        image: item.image,
        category: item.category,
        unit: item.unit,
        salePriceTon: item.prices.price_ton,
        salePriceM3: item.prices.price_m3,
        salePriceRd: item.prices.price_rd,
        isActive: item.prices.is_active,
        isAvailable: item.is_available,
        originalData: item
      }))
    }
  } catch (err: any) {
    console.error('Error fetching price list items:', err)
    error(err?.response?.data?.message || 'فشل في جلب عناصر قائمة الأسعار')
  } finally {
    loading.value = false
  }
}

const bulkSyncItems = async (supplierId: number, items: PriceListRow[]) => {
  const payload = {
    items: items.map(row => {
      const item: any = {
        item_id: row.itemId,
        is_active: row.isActive
      }

      if (row.salePriceM3) item.price_m3 = parseFloat(row.salePriceM3)
      if (row.salePriceTon) item.price_ton = parseFloat(row.salePriceTon)
      if (row.salePriceRd) item.price_rd = parseFloat(row.salePriceRd)

      return item
    })
  }

  return await api.put(`/api/suppliers/${supplierId}/price-list/items/sync`, payload)
}

// Track price changes
const handlePriceChange = (row: PriceListRow) => {
  modifiedItemIds.value.add(row.itemId)
}

const tableHeaders = [
  { key: "rowNumber", title: "#", width: "70px" },
  { key: "itemId", title: "المنتج" },
  { key: "salePrice", title: "سعر البيع", width: "420px" },
]

const bulkEditMode = ref<BulkEditMode>("percentage")
const bulkEditDirection = ref<BulkEditDirection>("increase")
const bulkEditAmount = ref<number | null>(10)

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

  // Apply to filtered rows only
  rows.value.forEach((r) => {
    r.salePriceTon = applyToValue(r.salePriceTon)
    r.salePriceM3 = applyToValue(r.salePriceM3)
    r.salePriceRd = applyToValue(r.salePriceRd)
    modifiedItemIds.value.add(r.itemId)
  })
}

// Category filter items
const categoryItems = computed(() => [
  { title: 'جميع التصنيفات', value: null },
  ...categories.value.map(cat => ({
    title: cat.name,
    value: cat.id
  }))
])

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

    // Send ALL items (API will determine what to add/update/remove)
    const response = await bulkSyncItems(supplierId.value, allRows.value)
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
    await fetchPriceListItems(supplierId.value)
  } catch (err: any) {
    console.error('Error saving price list:', err)
    error(err?.response?.data?.message || 'فشل في حفظ قائمة الأسعار')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  router.push({ name: 'ProductPriceListsList' })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    supplierId.value ? fetchPriceListItems(supplierId.value) : Promise.resolve()
  ])
})
</script>

<template>
  <default-layout>
    <div class="price-list-page">
      <PageHeader :icon="priceListIcon" title-key="pages.ProductsBuildingMaterialPriceList.title"
        description-key="pages.ProductsBuildingMaterialPriceList.description" />

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
            <div class="flex flex-wrap gap-3 flex-1">
              <div class="min-w-[250px]">
                <TextInput v-model="productName" placeholder="ابحث باسم المنتج أو الكود" :hide-details="true"
                  :input-props="{ class: 'bg-white' }" prepend-inner-icon="mdi-magnify" />
              </div>
              
              <div class="min-w-[200px]">
                <SelectInput v-model="selectedCategory" :items="categoryItems" placeholder="التصنيف" :hide-details="true"
                  :input-props="{ class: 'bg-white' }" />
              </div>
            </div>

            <div class="text-sm font-semibold text-gray-700">
              عدد المنتجات: {{ rows.length }} / {{ allRows.length }}
            </div>
          </div>
        </div>
        <EditableDataTable :headers="tableHeaders" :items="rows" :loading="loading" show-checkbox>
          <template #item.rowNumber="{ rowIndex }">
            <span class="text-sm text-gray-600">{{ rowIndex + 1 }}</span>
          </template>

          <template #item.itemId="{ item }">
            <div class="flex items-center gap-3">
              <v-avatar v-if="(item as PriceListRow).image" size="40" rounded>
                <v-img :src="(item as PriceListRow).image || undefined" :alt="(item as PriceListRow).name" />
              </v-avatar>
              <div>
                <div class="text-sm font-semibold text-gray-900">{{ (item as PriceListRow).name }}</div>
                <div class="text-xs text-gray-500">{{ (item as PriceListRow).code }} • {{ (item as PriceListRow).category.name }}</div>
              </div>
            </div>
          </template>

          <template #item.salePrice="{ item }">
            <div class="flex items-center gap-2">
              <div class="w-[130px]">
                <PriceInput v-model="(item as PriceListRow).salePriceTon" currency="طن" keep-currency-visible placeholder="0"
                  :hide-details="true" :input-props="{ class: 'bg-white' }" 
                  @update:model-value="handlePriceChange(item as PriceListRow)" />
              </div>
              <div class="w-[130px]">
                <PriceInput v-model="(item as PriceListRow).salePriceM3" currency="م^3" keep-currency-visible placeholder="0"
                  :hide-details="true" :input-props="{ class: 'bg-white' }" 
                  @update:model-value="handlePriceChange(item as PriceListRow)" />
              </div>
              <div class="w-[130px]">
                <PriceInput v-model="(item as PriceListRow).salePriceRd" currency="رد" keep-currency-visible placeholder="0"
                  :hide-details="true" :input-props="{ class: 'bg-white' }" 
                  @update:model-value="handlePriceChange(item as PriceListRow)" />
              </div>
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
