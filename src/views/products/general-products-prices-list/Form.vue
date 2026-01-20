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
  priceMin: string | null
  priceMax: string | null
  isActive: boolean
  isAvailable: boolean
  originalData?: PriceListItem
}

interface PriceListData {
  id: number
  name: string
  translations: {
    name: {
      ar: string
      en: string
    }
  }
  notes: string | null
  is_active: boolean
  is_assigned: boolean
  user_id: number
  item_price_lists: Array<{
    id: number
    item_id: number
    price_list_id: number
    price_m3: string | null
    price_ton: string | null
    price_rd: string | null
    price_min: string | null
    price_max: string | null
    is_active: boolean
    item: {
      id: number
      name: string
      translations: {
        name: {
          ar: string
          en: string
        }
      }
      code: string
      category: ItemCategory
      unit: ItemUnit
    }
  }>
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

const priceListId = computed(() => route.params.id ? Number(route.params.id) : null)
const supplierId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)

// Categories for filtering
const categories = ref<ItemCategory[]>([])
const selectedCategory = ref<number | null>(null)

const priceListIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8485 26H36.4822C37.6244 26 38.6097 25.9999 39.4213 26.0662C40.2778 26.1362 41.1298 26.2907 41.9496 26.7085C43.1727 27.3316 44.1671 28.326 44.7902 29.5491C45.208 30.3689 45.3625 31.2209 45.4325 32.0774C45.4988 32.889 45.4987 33.8743 45.4987 35.0164V36.4836C45.4987 37.6257 45.4988 38.611 45.4325 39.4226C45.3625 40.2791 45.208 41.1311 44.7902 41.9509C44.1671 43.174 43.1727 44.1684 41.9496 44.7915C41.1298 45.2093 40.2778 45.3638 39.4213 45.4338C38.6097 45.5001 37.6243 45.5 36.4822 45.5H32.8486C31.7064 45.5 30.7211 45.5001 29.9095 45.4338C29.0529 45.3638 28.2009 45.2093 27.3811 44.7915C26.158 44.1684 25.1637 43.174 24.5405 41.9509C24.1228 41.1311 23.9683 40.2791 23.8983 39.4226C23.832 38.611 23.832 37.6257 23.832 36.4835V35.0165C23.832 33.8743 23.832 32.889 23.8983 32.0774C23.9683 31.2209 24.1228 30.3689 24.5405 29.5491C25.1637 28.326 26.158 27.3316 27.3811 26.7085C28.2009 26.2907 29.0529 26.1362 29.9095 26.0662C30.721 25.9999 31.7064 26 32.8485 26ZM30.2623 30.3852C29.6737 30.4333 29.4555 30.5149 29.3484 30.5695C28.9407 30.7772 28.6092 31.1087 28.4015 31.5164C28.3469 31.6235 28.2653 31.8417 28.2172 32.4303C28.1671 33.0442 28.1654 33.8508 28.1654 35.1V36.4C28.1654 37.6492 28.1671 38.4558 28.2172 39.0697C28.2653 39.6583 28.3469 39.8765 28.4015 39.9836C28.6092 40.3913 28.9407 40.7228 29.3484 40.9305C29.4555 40.9851 29.6737 41.0667 30.2623 41.1148C30.8762 41.165 31.6828 41.1667 32.932 41.1667H36.3987C37.6479 41.1667 38.4545 41.165 39.0684 41.1148C39.657 41.0667 39.8752 40.9851 39.9823 40.9305C40.39 40.7228 40.7215 40.3913 40.9292 39.9836C40.9838 39.8765 41.0654 39.6583 41.1135 39.0697C41.1637 38.4558 41.1654 37.6492 41.1654 36.4V35.1C41.1654 33.8508 41.1637 33.0442 41.1135 32.4303C41.0654 31.8417 40.9838 31.6235 40.9292 31.5164C40.7215 31.1087 40.39 30.7772 39.9823 30.5695C39.8752 30.5149 39.657 30.4333 39.0684 30.3852C38.4545 30.335 37.6479 30.3333 36.3987 30.3333H32.932C31.6828 30.3333 30.8762 30.335 30.2623 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9018 6.4996C13.0769 6.49895 12.3666 6.49838 11.7321 6.6246C9.15361 7.13749 7.13798 9.15312 6.62508 11.7316C6.49887 12.3661 6.49944 13.0764 6.50009 13.9013L6.50019 14.083L6.50009 14.2648C6.49944 15.0896 6.49887 15.7999 6.62508 16.4345C7.13798 19.0129 9.15361 21.0286 11.7321 21.5415C12.3666 21.6677 13.0769 21.6671 13.9018 21.6665H38.0986C38.9235 21.6671 39.6338 21.6677 40.2683 21.5415C42.8468 21.0286 44.8624 19.0129 45.3753 16.4345C45.5015 15.8 45.5009 15.0897 45.5003 14.2649L45.5002 14.083L45.5003 13.9013C45.5009 13.0765 45.5015 12.3661 45.3753 11.7316C44.8624 9.15312 42.8468 7.13749 40.2683 6.6246C39.6338 6.49838 38.9235 6.49895 38.0986 6.4996H13.9018ZM12.5775 10.8747C12.734 10.8435 12.9729 10.833 14.0835 10.833H37.9169C39.0275 10.833 39.2663 10.8435 39.4229 10.8747C40.2824 11.0456 40.9543 11.7175 41.1252 12.577C41.1564 12.7335 41.1669 12.9724 41.1669 14.083C41.1669 15.1936 41.1564 15.4325 41.1252 15.5891C40.9543 16.4486 40.2824 17.1204 39.4229 17.2914C39.2663 17.3225 39.0275 17.333 37.9169 17.333H14.0835C12.9729 17.333 12.734 17.3225 12.5775 17.2914C11.718 17.1204 11.0461 16.4486 10.8752 15.5891C10.844 15.4325 10.8335 15.1936 10.8335 14.083C10.8335 12.9724 10.844 12.7335 10.8752 12.577C11.0461 11.7175 11.718 11.0456 12.5775 10.8747Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.0002 25.9998C9.41035 25.9998 6.5002 28.9099 6.5002 32.4998V38.9998C6.5002 42.5896 9.41035 45.4998 13.0002 45.4998C16.59 45.4998 19.5002 42.5896 19.5002 38.9998V32.4998C19.5002 28.9099 16.5901 25.9998 13.0002 25.9998ZM10.8335 32.4998C10.8335 31.3032 11.8036 30.3331 13.0002 30.3331C14.1968 30.3331 15.1669 31.3032 15.1669 32.4998V38.9998C15.1669 40.1964 14.1968 41.1664 13.0002 41.1664C11.8036 41.1664 10.8335 40.1964 10.8335 38.9998V32.4998Z" fill="#1570EF"/>
</svg>
`;

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8334 15.8333L12.9168 12.9166M15 7.91659C15 11.8286 11.8287 14.9999 7.91671 14.9999C4.00469 14.9999 0.833374 11.8286 0.833374 7.91659C0.833374 4.00457 4.00469 0.833252 7.91671 0.833252C11.8287 0.833252 15 4.00457 15 7.91659Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16536 0.833496H10.5608C10.9684 0.833496 11.1723 0.833496 11.3641 0.879546C11.5341 0.920374 11.6967 0.987715 11.8458 1.0791C12.014 1.18217 12.1582 1.32629 12.4464 1.61454L15.051 4.21911C15.3392 4.50737 15.4834 4.65149 15.5864 4.81969C15.6778 4.96881 15.7452 5.13138 15.786 5.30144C15.832 5.49326 15.832 5.69708 15.832 6.10473V12.5002M8.7487 6.66683H5.4987C5.03199 6.66683 4.79863 6.66683 4.62037 6.576C4.46357 6.49611 4.33609 6.36862 4.25619 6.21182C4.16536 6.03356 4.16536 5.80021 4.16536 5.3335V3.75016M9.58203 15.8335V12.1668C9.58203 11.7001 9.58203 11.4668 9.4912 11.2885C9.41131 11.1317 9.28383 11.0042 9.12702 10.9243C8.94876 10.8335 8.71541 10.8335 8.2487 10.8335H5.4987C5.03199 10.8335 4.79863 10.8335 4.62037 10.9243C4.46357 11.0042 4.33609 11.1317 4.25619 11.2885C4.16536 11.4668 4.16536 11.7001 4.16536 12.1668V15.8335M12.9154 6.80245V13.1668C12.9154 14.1002 12.9154 14.567 12.7337 14.9235C12.5739 15.2371 12.319 15.4921 12.0053 15.6518C11.6488 15.8335 11.1821 15.8335 10.2487 15.8335H3.4987C2.56528 15.8335 2.09857 15.8335 1.74205 15.6518C1.42844 15.4921 1.17348 15.2371 1.01369 14.9235C0.832031 14.567 0.832031 14.1003 0.832031 13.1668V6.41683C0.832031 5.48341 0.832031 5.0167 1.01369 4.66018C1.17348 4.34658 1.42844 4.09161 1.74205 3.93182C2.09857 3.75016 2.56528 3.75016 3.4987 3.75016H9.86308C10.0669 3.75016 10.1688 3.75016 10.2647 3.77319C10.3498 3.7936 10.431 3.82727 10.5056 3.87296C10.5897 3.9245 10.6618 3.99656 10.8059 4.14069L12.5248 5.85964C12.669 6.00376 12.741 6.07583 12.7926 6.15993C12.8383 6.23449 12.8719 6.31577 12.8923 6.4008C12.9154 6.49671 12.9154 6.59862 12.9154 6.80245Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

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
    const response = await api.get<ApiResponse<ItemCategory[]>>('/admin/settings/categories/list')
    categories.value = response.data
  } catch (err: any) {
    console.error('Error fetching categories:', err)
    error(err?.response?.data?.message || 'فشل في جلب التصنيفات')
  }
}

const fetchPriceListItems = async (priceListId: number) => {
  try {
    loading.value = true
    const response = await api.get<ApiResponse<PriceListData>>(
      `/admin/price-lists/${priceListId}`,
      { params: { is_building_material: 0 } }
    )
    const priceListData = response.data

    // Store supplier ID for sync operation
    if (priceListData.item_price_lists && priceListData.item_price_lists.length > 0) {
      supplierId.value = priceListData.user_id
    }

    if (priceListData.item_price_lists && priceListData.item_price_lists.length > 0) {
      allRows.value = priceListData.item_price_lists.map((itemPrice) => ({
        id: itemPrice.id,
        itemId: itemPrice.item_id,
        name: itemPrice.item.translations?.name?.ar || itemPrice.item.name,
        code: itemPrice.item.code,
        image: null,
        category: itemPrice.item.category,
        unit: itemPrice.item.unit,
        priceMin: itemPrice.price_min,
        priceMax: itemPrice.price_max,
        isActive: itemPrice.is_active,
        isAvailable: true,
        originalData: {
          id: itemPrice.id,
          item_id: itemPrice.item_id,
          name: itemPrice.item.name,
          code: itemPrice.item.code,
          image: null,
          category: itemPrice.item.category,
          unit: itemPrice.item.unit,
          is_active: itemPrice.is_active,
          is_available: true,
          prices: {
            price_m3: itemPrice.price_m3,
            price_ton: itemPrice.price_ton,
            price_rd: itemPrice.price_rd,
            price_min: itemPrice.price_min,
            price_max: itemPrice.price_max,
            is_active: itemPrice.is_active
          }
        }
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

      // For general products, send price_min and price_max
      if (row.priceMin !== null && row.priceMin !== '') {
        item.price_min = parseFloat(row.priceMin)
      }
      if (row.priceMax !== null && row.priceMax !== '') {
        item.price_max = parseFloat(row.priceMax)
      }

      return item
    })
  }

  return await api.put(`/admin/suppliers/${supplierId}/price-list/items/sync`, payload)
}

// Track price changes
const handlePriceChange = (row: PriceListRow) => {
  modifiedItemIds.value.add(row.itemId)
}

const tableHeaders = [
  { key: "itemId", title: "المنتج" },
  { key: "salePrice", title: "سعر البيع", width: "420px" },
  { key: "actions", title: "الإجراءات", width: "100px" },
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
    r.priceMin = applyToValue(r.priceMin)
    r.priceMax = applyToValue(r.priceMax)
    modifiedItemIds.value.add(r.itemId)
  })
}

// Category filter items
const categoryItems = computed(() => [
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
  await fetchCategories()
  if (priceListId.value) {
    await fetchPriceListItems(priceListId.value)
  }
})
</script>

<template>
  <default-layout>
    <div class="price-list-page">
      <PageHeader :icon="priceListIcon" title-key="pages.GeneralProductPriceList.title"
        description-key="pages.GeneralProductPriceList.description" />

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
                <ButtonWithIcon variant="flat" rounded="4" color="primary-500" border="sm" height="40"
                  custom-class="px-7 !border-primary-200 text-white font-semibold text-base" label="تطبيق"
                  @click="applyBulkEdit" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 justify-between flex-wrap items-center border-y border-y-gray-200 py-2 px-4 sm:!px-6">
          <div class="text-gray-900 text-lg font-bold">قائمة اسعار المنتجات العامة</div>

          <div class="flex items-center gap-3">
            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
              custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
              label="تحديث" prepend-icon="mdi-refresh"  />

            <TextInput v-model="productName" placeholder="ابحث بالكود" :hide-details="true"
              :input-props="{ class: 'bg-white min-w-60' }">
              <template #prepend-inner>
                <span v-html="searchIcon"></span>
              </template>
            </TextInput>
          </div>
        </div>
        <div class="border-y border-y border-y-primary-100 bg-primary-50 px-4 sm:!px-6 py-3">
          <div class="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div class="flex flex-wrap gap-3 flex-1">
              <div class="min-w-[200px]">
                <SelectInput v-model="selectedCategory" :items="categoryItems" placeholder="جلب المنتجات عن طريق تصنيف محدد"
                  :hide-details="true" :input-props="{ class: 'bg-white min-w-[200px] md:min-w-[300px]' }" />
              </div>
            </div>

            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
              custom-class="px-5 font-semibold !text-white text-sm sm:text-base" :prepend-icon="plusIcon"
              label="إضافة منتج"  />
          </div>
        </div>
        <EditableDataTable :headers="tableHeaders" :items="rows" :loading="loading" show-checkbox>
          <template #item.itemId="{ item }">
            <div class="flex items-center gap-3">
              <v-avatar v-if="(item as PriceListRow).image" size="40" rounded>
                <v-img :src="(item as PriceListRow).image || undefined" :alt="(item as PriceListRow).name" />
              </v-avatar>
              <div>
                <div class="text-sm font-semibold text-gray-900">{{ (item as PriceListRow).name }}</div>
                <div class="text-xs text-gray-500">{{ (item as PriceListRow).code }} • {{ (item as
                  PriceListRow).category.name }}</div>
              </div>
            </div>
          </template>

          <template #item.salePrice="{ item }">
            <div class="flex items-center gap-2">
              <div class="w-[180px]">
                <PriceInput v-model="(item as PriceListRow).priceMin" currency="الحد الأدنى" keep-currency-visible
                  placeholder="0" :hide-details="true" :input-props="{ class: 'bg-white' }"
                  @update:model-value="handlePriceChange(item as PriceListRow)" />
              </div>
              <div class="w-[180px]">
                <PriceInput v-model="(item as PriceListRow).priceMax" currency="الحد الأقصى" keep-currency-visible
                  placeholder="0" :hide-details="true" :input-props="{ class: 'bg-white' }"
                  @update:model-value="handlePriceChange(item as PriceListRow)" />
              </div>
            </div>
          </template>
        </EditableDataTable>

        <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6">
          <ButtonWithIcon variant="flat" rounded="4" color="primary" height="44"
            custom-class="font-semibold text-base sm:min-w-[200px]" :prepend-icon="saveIcon" label="حفظ"
            @click="handleSave" :loading="saving" :disabled="loading" />

          <ButtonWithIcon variant="flat" rounded="4" color="primary-50" height="44"
            custom-class="font-semibold text-base text-primary-700 sm:min-w-[200px]" label="إغلاق" @click="handleClose"
            :disabled="saving">
            <template #prepend>
              <v-icon>mdi-close</v-icon>
            </template>
          </ButtonWithIcon>
        </div>

      </div>
    </div>
  </default-layout>
</template>
