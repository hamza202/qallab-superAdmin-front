<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { useTableColumns } from '@/composables/useTableColumns'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue'

const router = useRouter()
const { t } = useI18n()
const api = useApi()
const { success, error: showError } = useNotification()

// === TypeScript Interfaces ===
interface SimpleProduct {
  id: number
  name: string
  code: string
  category: string
  unit: string
  purchase_price: string
  sell_price: string
  min_quantity: number | null
  is_active: boolean
  update_at: string | null
  actions?: {
    can_update: boolean
    can_delete: boolean
    can_view: boolean
    can_change_status: boolean
  }
}

interface TableHeader {
  key: string
  title: string
  width?: string
}

interface Pagination {
  next_cursor: string | null
  previous_cursor: string | null
  per_page: number
}

interface ApiResponse {
  status: number
  code: number
  locale: string
  message: string
  data: SimpleProduct[]
  pagination: Pagination
  header_table: string
  headers: TableHeader[]
  shownHeaders: TableHeader[]
  actions?: { can_create: boolean }
}

// Table columns composable
const {
  allHeaders,
  visibleHeaders,
  updatingHeaders,
  showHeadersMenu,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns('admin_simple_items')

// === State ===
const tableItems = ref<SimpleProduct[]>([])
const isLoading = ref(false)
const loadingMore = ref(false)
const errorMessage = ref<string | null>(null)
const canCreate = ref(true)

// Pagination
const nextCursor = ref<string | null>(null)
const perPage = ref(15)
const hasMoreData = computed(() => nextCursor.value !== null)

// Selection state
const selectedRows = ref<number[]>([])
const hasSelected = computed(() => selectedRows.value.length > 0)

// Status change dialog
const showStatusChangeDialog = ref(false)
const statusChangeLoading = ref(false)
const itemToChangeStatus = ref<SimpleProduct | null>(null)

// Delete dialog
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)
const itemToDelete = ref<SimpleProduct | null>(null)

// Filters
const showAdvancedFilters = ref(false)
const filterStatus = ref<string | null>(null)
const statusOptions = [
  { title: 'فعال', value: 'فعال' },
  { title: 'غير فعال', value: 'غير فعال' }
]
const filterUpdatedAt = ref('')
const filterProductName = ref('')
const filterSkuCode = ref('')
const filterUnit = ref('')
const filterCategory = ref('')

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

// === Icons ===
const simpleProductsIcon = `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.7 2H5.46667C4.25322 2 3.6465 2 3.18302 2.23615C2.77534 2.44388 2.44388 2.77534 2.23615 3.18302C2 3.6465 2 4.25322 2 5.46667V13.7C2 14.9134 2 15.5202 2.23615 15.9836C2.44388 16.3913 2.77534 16.7228 3.18302 16.9305C3.6465 17.1667 4.25322 17.1667 5.46667 17.1667H13.7C14.9134 17.1667 15.5202 17.1667 15.9836 16.9305C16.3913 16.7228 16.7228 16.3913 16.9305 15.9836C17.1667 15.5202 17.1667 14.9134 17.1667 13.7V5.46667C17.1667 4.25322 17.1667 3.6465 16.9305 3.18302C16.7228 2.77534 16.3913 2.44388 15.9836 2.23615C15.5202 2 14.9134 2 13.7 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.5333 2H29.3C28.0866 2 27.4798 2 27.0164 2.23615C26.6087 2.44388 26.2772 2.77534 26.0695 3.18302C25.8333 3.6465 25.8333 4.25322 25.8333 5.46667V13.7C25.8333 14.9134 25.8333 15.5202 26.0695 15.9836C26.2772 16.3913 26.6087 16.7228 27.0164 16.9305C27.4798 17.1667 28.0866 17.1667 29.3 17.1667H37.5333C38.7468 17.1667 39.3535 17.1667 39.817 16.9305C40.2247 16.7228 40.5561 16.3913 40.7638 15.9836C41 15.5202 41 14.9134 41 13.7V5.46667C41 4.25322 41 3.6465 40.7638 3.18302C40.5561 2.77534 40.2247 2.44388 39.817 2.23615C39.3535 2 38.7468 2 37.5333 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.5333 25.8333H29.3C28.0866 25.8333 27.4798 25.8333 27.0164 26.0695C26.6087 26.2772 26.2772 26.6087 26.0695 27.0164C25.8333 27.4798 25.8333 28.0866 25.8333 29.3V37.5333C25.8333 38.7468 25.8333 39.3535 26.0695 39.817C26.2772 40.2247 26.6087 40.5561 27.0164 40.7638C27.4798 41 28.0866 41 29.3 41H37.5333C38.7468 41 39.3535 41 39.817 40.7638C40.2247 40.5561 40.5561 40.2247 40.7638 39.817C41 39.3535 41 38.7468 41 37.5333V29.3C41 28.0866 41 27.4798 40.7638 27.0164C40.5561 26.6087 40.2247 26.2772 39.817 26.0695C39.3535 25.8333 38.7468 25.8333 37.5333 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.7 25.8333H5.46667C4.25322 25.8333 3.6465 25.8333 3.18302 26.0695C2.77534 26.2772 2.44388 26.6087 2.23615 27.0164C2 27.4798 2 28.0866 2 29.3V37.5333C2 38.7468 2 39.3535 2.23615 39.817C2.44388 40.2247 2.77534 40.5561 3.18302 40.7638C3.6465 41 4.25322 41 5.46667 41H13.7C14.9134 41 15.5202 41 15.9836 40.7638C16.3913 40.5561 16.7228 40.2247 16.9305 39.817C17.1667 39.3535 17.1667 38.7468 17.1667 37.5333V29.3C17.1667 28.0866 17.1667 27.4798 16.9305 27.0164C16.7228 26.6087 16.3913 26.2772 15.9836 26.0695C15.5202 25.8333 14.9134 25.8333 13.7 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z" stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M15 13.5V3.5C15 2.72343 15 2.33515 14.8731 2.02886C14.704 1.62048 14.3795 1.29602 13.9711 1.12687C13.6649 1 13.2766 1 12.5 1C11.7234 1 11.3351 1 11.0289 1.12687C10.6205 1.29602 10.296 1.62048 10.1269 2.02886C10 2.33515 10 2.72343 10 3.5V13.5C10 14.2766 10 14.6649 10.1269 14.9711C10.296 15.3795 10.6205 15.704 11.0289 15.8731C11.3351 16 11.7234 16 12.5 16C13.2766 16 13.6649 16 13.9711 15.8731C14.3795 15.704 14.704 15.3795 14.8731 14.9711C15 14.6649 15 14.2766 15 13.5Z" stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const importIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 11V12C16 13.4001 16 14.1002 15.7275 14.635C15.4878 15.1054 15.1054 15.4878 14.635 15.7275C14.1002 16 13.4001 16 12 16H5C3.59987 16 2.8998 16 2.36502 15.7275C1.89462 15.4878 1.51217 15.1054 1.27248 14.635C1 14.1002 1 13.4001 1 12V11M12.6667 6.83333L8.5 11M8.5 11L4.33333 6.83333M8.5 11V1" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// Default headers (fallback)
const defaultTableHeaders: TableHeader[] = [
  { key: 'name', title: 'الاسم', width: '180px' },
  { key: 'code', title: 'الكود', width: '120px' },
  { key: 'unit', title: 'الوحدة', width: '100px' },
  { key: 'category', title: 'التصنيف', width: '100px' },
  { key: 'purchase_price', title: 'سعر الشراء', width: '100px' },
  { key: 'sell_price', title: 'سعر البيع', width: '100px' },
  { key: 'min_quantity', title: 'الحد الأدنى للكمية', width: '100px' },
  { key: 'update_at', title: 'تاريخ التحديث', width: '120px' },
  { key: 'is_active', title: 'الحالة', width: '100px' },
]

// === Computed ===
const tableHeaders = computed(() => {
  if (visibleHeaders.value.length > 0) {
    return visibleHeaders.value.map(header => ({
      key: header.key,
      title: header.title,
      width: '140px',
    }))
  }
  return defaultTableHeaders
})

// === API Functions ===
const fetchData = async (cursor?: string | null, append = false) => {
  try {
    if (append) {
      loadingMore.value = true
    } else {
      isLoading.value = true
    }
    errorMessage.value = null

    const params = new URLSearchParams()
    params.append('per_page', String(perPage.value))
    if (cursor) params.append('cursor', cursor)
    if (filterUpdatedAt.value) params.append('updated_at', filterUpdatedAt.value)
    if (filterProductName.value) params.append('name', filterProductName.value)
    if (filterSkuCode.value) params.append('code', filterSkuCode.value)
    if (filterUnit.value) params.append('unit', filterUnit.value)
    if (filterCategory.value) params.append('category', filterCategory.value)
    if (filterStatus.value) {
      params.append('status', filterStatus.value === 'فعال' ? '1' : '0')
    }

    const response = await api.get<ApiResponse>(`/items?${params}`)

    if (append) {
      tableItems.value = [...tableItems.value, ...response.data]
    } else {
      tableItems.value = response.data

      // Initialize headers if available from API
      if (response.headers && response.shownHeaders) {
        initHeaders(response.headers, response.shownHeaders)
      }

      // Set create permission
      if (response.actions) {
        canCreate.value = response.actions.can_create
      }
    }

    nextCursor.value = response.pagination.next_cursor
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات'
    showError(errorMessage.value || 'حدث خطأ')
    console.error('Error fetching items:', err)
  } finally {
    isLoading.value = false
    loadingMore.value = false
  }
}

// === Handlers ===
const handleView = (item: any) => {
  router.push({ name: 'SimpleProductView', params: { id: item.id } })
}

const handleEdit = (item: any) => {
  router.push({ name: 'SimpleProductsEdit', params: { id: item.id } })
}

// Unified Delete Logic
const deleteMode = ref<'single' | 'bulk'>('single')

const handleDelete = (item: any) => {
  deleteMode.value = 'single'
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const handleBulkDelete = () => {
  if (selectedRows.value.length === 0) return
  deleteMode.value = 'bulk'
  itemToDelete.value = null
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    deleteLoading.value = true
    
    if (deleteMode.value === 'single') {
      if (!itemToDelete.value) return
      await api.delete(`/items/${itemToDelete.value.id}`)
      tableItems.value = tableItems.value.filter(t => t.id !== itemToDelete.value!.id)
      success('تم حذف المنتج بنجاح')
    } else {
      // Bulk delete
      if (selectedRows.value.length === 0) return
      await Promise.all(selectedRows.value.map(id => api.delete(`/items/${id}`)))
      tableItems.value = tableItems.value.filter(t => !selectedRows.value.includes(t.id))
      selectedRows.value = []
      success('تم حذف المنتجات المحددة بنجاح')
    }
  } catch (err: any) {
    showError(err?.response?.data?.message || 'حدث خطأ أثناء الحذف')
    console.error('Error deleting items:', err)
  } finally {
    deleteLoading.value = false
    showDeleteDialog.value = false
    itemToDelete.value = null
  }
}

// Handle status change - open confirmation dialog
const handleStatusChange = (item: any) => {
  itemToChangeStatus.value = { ...item }
  showStatusChangeDialog.value = true
}

// Confirm status change after dialog
const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return

  try {
    statusChangeLoading.value = true
    const newStatus = !itemToChangeStatus.value.is_active

    await api.patch(`/items/${itemToChangeStatus.value.id}/change-status`, { is_active: newStatus })
    success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} المنتج بنجاح`)

    // Update local state
    const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id)
    if (index !== -1) {
      tableItems.value[index].is_active = newStatus
    }
  } catch (err: any) {
    showError(err?.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة')
    console.error('Error changing status:', err)
  } finally {
    statusChangeLoading.value = false
    showStatusChangeDialog.value = false
    itemToChangeStatus.value = null
  }
}

const handleSelect = (item: any, selected: boolean) => {
  if (selected) selectedRows.value.push(item.id)
  else selectedRows.value = selectedRows.value.filter(id => id !== item.id)
}

const handleSelectAll = (checked: boolean) => {
  selectedRows.value = checked ? tableItems.value.map(i => i.id) : []
}

const openCreate = () => {
  router.push({ name: 'SimpleProductsCreate' })
}

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const handleSearch = () => {
  fetchData()
}

const resetFilters = () => {
  filterStatus.value = null
  filterUpdatedAt.value = ''
  filterProductName.value = ''
  filterSkuCode.value = ''
  filterUnit.value = ''
  filterCategory.value = ''
  fetchData()
}

// === Infinite Scroll ===
const setupInfiniteScroll = () => {
  if (!loadMoreTrigger.value) return

  observer.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !isLoading.value) {
        fetchData(nextCursor.value, true)
      }
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }
  )

  observer.value.observe(loadMoreTrigger.value)
}

const cleanupInfiniteScroll = () => {
  if (observer.value && loadMoreTrigger.value) {
    observer.value.unobserve(loadMoreTrigger.value)
    observer.value.disconnect()
  }
}

// === Lifecycle ===
onMounted(() => {
  fetchData()
  nextTick(() => {
    setupInfiniteScroll()
  })
})

onBeforeUnmount(() => {
  cleanupInfiniteScroll()
})
</script>

<template>
  <default-layout>
    <div class="simple-products-page">
      <PageHeader :icon="simpleProductsIcon" title-key="pages.simpleProducts.title"
        description-key="pages.simpleProducts.description" />

      <div
        class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
          :prepend-icon="importIcon" :label="t('common.import')" />
        <ButtonWithIcon variant="flat" height="40" rounded="0"
          custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
          :prepend-icon="exportIcon" :label="t('common.export')" />
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelected ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:!px-6 py-3">
          <!-- Actions when rows are selected -->
          <div v-if="hasSelected"
            class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_1_icon" color="white" label="حذف المحدد" @click="handleBulkDelete" />
            <div class="w-px bg-gray-200"></div>
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_2_icon" color="white" label="حذف الجميع" @click="handleBulkDelete" />
          </div>

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <!-- Column Management -->
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500" height="40"
                  custom-class="font-semibold text-base border-gray-400"
                  :prepend-icon="columnIcon" :label="t('common.columns')" append-icon="mdi-chevron-down" />
              </template>
              <v-list>
                <v-list-item v-for="header in allHeaders" :key="header.key" @click="toggleHeader(header.key)">
                  <template v-slot:prepend>
                    <v-checkbox-btn :model-value="headerCheckStates[header.key]" :disabled="updatingHeaders"
                      @click.stop="toggleHeader(header.key)"></v-checkbox-btn>
                  </template>
                  <v-list-item-title>{{ header.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />
            <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" :label="t('common.addProduct')" @click="openCreate" />
          </div>
        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap xl:!flex-nowrap gap-3 flex-1 order-1 sm:order-2 justify-end sm:justify-start">
            <v-select v-model="filterStatus" :items="statusOptions" item-title="title" item-value="value"
              density="comfortable" variant="outlined" hide-details :placeholder="t('common.status')"
              class="w-full sm:w-40 bg-white" clearable />
            <DatePickerInput v-model="filterUpdatedAt" density="comfortable" hide-details
              :placeholder="t('common.updatedAt')" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterProductName" density="comfortable" variant="outlined" hide-details
              :placeholder="t('common.productName')" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterSkuCode" density="comfortable" variant="outlined" hide-details
              :placeholder="t('common.skuCode')" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterUnit" density="comfortable" variant="outlined" hide-details
              :placeholder="t('common.unit')" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterCategory" density="comfortable" variant="outlined" hide-details
              :placeholder="t('common.category')" class="w-full sm:w-40 bg-white" />
            <div class="flex gap-2 items-center">
              <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                :prepend-icon="searchIcon" label="ابحث الآن" @click="handleSearch" />
              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
            </div>

          </div>
        </div>

        <!-- Error State -->
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mx-6 my-4" closable>
          {{ errorMessage }}
        </v-alert>

        <!-- Simple Products Table -->
        <DataTable :headers="tableHeaders" :items="tableItems" :loading="isLoading" show-checkbox show-actions
          @edit="handleEdit" @delete="handleDelete" @view="handleView" @select="handleSelect"
          @selectAll="handleSelectAll">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
              class="small-switch" @update:model-value="() => handleStatusChange(item)" />
          </template>
          <!-- Fix mismatched key for updated_at -->
          <!-- <template #item.updated_at="{ item }">
            {{ item.updated_at || item.update_at }}
          </template> -->
        </DataTable>

        <!-- Infinite scroll trigger -->
        <div ref="loadMoreTrigger" class="h-4"></div>

        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="flex justify-center items-center py-4">
          <v-progress-circular indeterminate color="primary" size="32" />
          <span class="mr-2 text-gray-600">جاري تحميل المزيد...</span>
        </div>
      </div>
    </div>

    <!-- Unified Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" 
      :title="deleteMode === 'single' ? 'حذف المنتج' : 'حذف المنتجات'"
      :message="deleteMode === 'single' ? `هل أنت متأكد من حذف ${itemToDelete?.name}؟` : `هل أنت متأكد من حذف ${selectedRows.length} منتج؟`" 
      @confirm="confirmDelete" />

    <!-- Status Change Confirmation Dialog -->
    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.name" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />
  </default-layout>
</template>

<style scoped>
</style>