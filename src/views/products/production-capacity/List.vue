<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { useTableColumns } from '@/composables/useTableColumns'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue'

const { t } = useI18n()
const router = useRouter()
const api = useApi()
const { success, error: showError } = useNotification()

// === TypeScript Interfaces ===
interface ProductionCapacity {
  id: number
  name: string
  supplier: string
  is_active: boolean
  created_at: string
  actions?: {
    can_update: boolean
    can_delete: boolean
    can_change_status: boolean
  }
}

interface TableHeader {
  key: string
  title: string
  width?: string
  sortable?: boolean
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
  data: ProductionCapacity[]
  pagination: Pagination
  header_table: string
  headers: Record<string, { label: string; sortable: boolean }>
  shownHeaders: Record<string, { label: string; sortable: boolean }>
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
} = useTableColumns('admin_production_capacities')

// === State ===
const tableItems = ref<ProductionCapacity[]>([])
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
// const hasSelected = computed(() => selectedRows.value.length > 0)

// Status change dialog
const showStatusChangeDialog = ref(false)
const statusChangeLoading = ref(false)
const itemToChangeStatus = ref<ProductionCapacity | null>(null)

// Delete dialog
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)
const itemToDelete = ref<ProductionCapacity | null>(null)

// Filters
const showAdvancedFilters = ref(false)
const filterStatus = ref<string | null>(null)
const statusOptions = [
  { title: 'فعال', value: 'فعال' },
  { title: 'غير فعال', value: 'غير فعال' }
]
const filterCreatedAt = ref('')
const filterName = ref('')

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

// Production Capacity icon
const productionCapacityIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8485 26H36.4822C37.6244 26 38.6097 25.9999 39.4213 26.0662C40.2778 26.1362 41.1298 26.2907 41.9496 26.7085C43.1727 27.3316 44.1671 28.326 44.7902 29.5491C45.208 30.3689 45.3625 31.2209 45.4325 32.0774C45.4988 32.889 45.4987 33.8743 45.4987 35.0164V36.4836C45.4987 37.6257 45.4988 38.611 45.4325 39.4226C45.3625 40.2791 45.208 41.1311 44.7902 41.9509C44.1671 43.174 43.1727 44.1684 41.9496 44.7915C41.1298 45.2093 40.2778 45.3638 39.4213 45.4338C38.6097 45.5001 37.6243 45.5 36.4822 45.5H32.8486C31.7064 45.5 30.7211 45.5001 29.9095 45.4338C29.0529 45.3638 28.2009 45.2093 27.3811 44.7915C26.158 44.1684 25.1637 43.174 24.5405 41.9509C24.1228 41.1311 23.9683 40.2791 23.8983 39.4226C23.832 38.611 23.832 37.6257 23.832 36.4835V35.0165C23.832 33.8743 23.832 32.889 23.8983 32.0774C23.9683 31.2209 24.1228 30.3689 24.5405 29.5491C25.1637 28.326 26.158 27.3316 27.3811 26.7085C28.2009 26.2907 29.0529 26.1362 29.9095 26.0662C30.721 25.9999 31.7064 26 32.8485 26ZM30.2623 30.3852C29.6737 30.4333 29.4555 30.5149 29.3484 30.5695C28.9407 30.7772 28.6092 31.1087 28.4015 31.5164C28.3469 31.6235 28.2653 31.8417 28.2172 32.4303C28.1671 33.0442 28.1654 33.8508 28.1654 35.1V36.4C28.1654 37.6492 28.1671 38.4558 28.2172 39.0697C28.2653 39.6583 28.3469 39.8765 28.4015 39.9836C28.6092 40.3913 28.9407 40.7228 29.3484 40.9305C29.4555 40.9851 29.6737 41.0667 30.2623 41.1148C30.8762 41.165 31.6828 41.1667 32.932 41.1667H36.3987C37.6479 41.1667 38.4545 41.165 39.0684 41.1148C39.657 41.0667 39.8752 40.9851 39.9823 40.9305C40.39 40.7228 40.7215 40.3913 40.9292 39.9836C40.9838 39.8765 41.0654 39.6583 41.1135 39.0697C41.1637 38.4558 41.1654 37.6492 41.1654 36.4V35.1C41.1654 33.8508 41.1637 33.0442 41.1135 32.4303C41.0654 31.8417 40.9838 31.6235 40.9292 31.5164C40.7215 31.1087 40.39 30.7772 39.9823 30.5695C39.8752 30.5149 39.657 30.4333 39.0684 30.3852C38.4545 30.335 37.6479 30.3333 36.3987 30.3333H32.932C31.6828 30.3333 30.8762 30.335 30.2623 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9018 6.4996C13.0769 6.49895 12.3666 6.49838 11.7321 6.6246C9.15361 7.13749 7.13798 9.15312 6.62508 11.7316C6.49887 12.3661 6.49944 13.0764 6.50009 13.9013L6.50019 14.083L6.50009 14.2648C6.49944 15.0896 6.49887 15.7999 6.62508 16.4345C7.13798 19.0129 9.15361 21.0286 11.7321 21.5415C12.3666 21.6677 13.0769 21.6671 13.9018 21.6665H38.0986C38.9235 21.6671 39.6338 21.6677 40.2683 21.5415C42.8468 21.0286 44.8624 19.0129 45.3753 16.4345C45.5015 15.8 45.5009 15.0897 45.5003 14.2649L45.5002 14.083L45.5003 13.9013C45.5009 13.0765 45.5015 12.3661 45.3753 11.7316C44.8624 9.15312 42.8468 7.13749 40.2683 6.6246C39.6338 6.49838 38.9235 6.49895 38.0986 6.4996H13.9018ZM12.5775 10.8747C12.734 10.8435 12.9729 10.833 14.0835 10.833H37.9169C39.0275 10.833 39.2663 10.8435 39.4229 10.8747C40.2824 11.0456 40.9543 11.7175 41.1252 12.577C41.1564 12.7335 41.1669 12.9724 41.1669 14.083C41.1669 15.1936 41.1564 15.4325 41.1252 15.5891C40.9543 16.4486 40.2824 17.1204 39.4229 17.2914C39.2663 17.3225 39.0275 17.333 37.9169 17.333H14.0835C12.9729 17.333 12.734 17.3225 12.5775 17.2914C11.718 17.1204 11.0461 16.4486 10.8752 15.5891C10.844 15.4325 10.8335 15.1936 10.8335 14.083C10.8335 12.9724 10.844 12.7335 10.8752 12.577C11.0461 11.7175 11.718 11.0456 12.5775 10.8747Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.0002 25.9998C9.41035 25.9998 6.5002 28.9099 6.5002 32.4998V38.9998C6.5002 42.5896 9.41035 45.4998 13.0002 45.4998C16.59 45.4998 19.5002 42.5896 19.5002 38.9998V32.4998C19.5002 28.9099 16.5901 25.9998 13.0002 25.9998ZM10.8335 32.4998C10.8335 31.3032 11.8036 30.3331 13.0002 30.3331C14.1968 30.3331 15.1669 31.3032 15.1669 32.4998V38.9998C15.1669 40.1964 14.1968 41.1664 13.0002 41.1664C11.8036 41.1664 10.8335 40.1964 10.8335 38.9998V32.4998Z" fill="#1570EF"/>
</svg>
`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const importIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 11V12C16 13.4001 16 14.1002 15.7275 14.635C15.4878 15.1054 15.1054 15.4878 14.635 15.7275C14.1002 16 13.4001 16 12 16H5C3.59987 16 2.8998 16 2.36502 15.7275C1.89462 15.4878 1.51217 15.1054 1.27248 14.635C1 14.1002 1 13.4001 1 12V11M12.6667 6.83333L8.5 11M8.5 11L4.33333 6.83333M8.5 11V1" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// Default headers (fallback)
const defaultTableHeaders: TableHeader[] = [
  { key: 'name', title: 'الاسم', width: '180px' },
  { key: 'supplier', title: 'المورد', width: '150px' },
  { key: 'created_at', title: 'تاريخ الانشاء', width: '160px' },
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

// === Helper Functions ===
// Convert headers object to array format
const convertHeadersToArray = (headersObj: Record<string, { label: string; sortable: boolean }>): TableHeader[] => {
  return Object.keys(headersObj)
    .filter(key => key !== 'id' && key !== 'actions')
    .map(key => ({
      key,
      title: headersObj[key].label,
      sortable: headersObj[key].sortable,
    }))
}

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
    if (filterCreatedAt.value) params.append('created_at', filterCreatedAt.value)
    if (filterName.value) params.append('name', filterName.value)
    if (filterStatus.value) {
      params.append('status', filterStatus.value === 'فعال' ? '1' : '0')
    }

    const response = await api.get<ApiResponse>(`/production-capacities?${params}`)

    if (append) {
      tableItems.value = [...tableItems.value, ...response.data]
    } else {
      tableItems.value = response.data

      // Initialize headers if available from API
      if (response.headers && response.shownHeaders) {
        const headersArray = convertHeadersToArray(response.headers)
        const shownHeadersArray = convertHeadersToArray(response.shownHeaders)
        initHeaders(headersArray, shownHeadersArray)
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
    console.error('Error fetching production capacities:', err)
  } finally {
    isLoading.value = false
    loadingMore.value = false
  }
}

// === Handlers ===
const handleEdit = (item: any) => {
  router.push({ name: 'ProductsProductionCapacityEdit', params: { id: item.id } })
}

// Unified Delete Logic
const deleteMode = ref<'single' | 'bulk'>('single')

const handleDelete = (item: any) => {
  deleteMode.value = 'single'
  itemToDelete.value = item
  showDeleteDialog.value = true
}

// const handleBulkDelete = () => {
//   if (selectedRows.value.length === 0) return
//   deleteMode.value = 'bulk'
//   itemToDelete.value = null
//   showDeleteDialog.value = true
// }

const confirmDelete = async () => {
  try {
    deleteLoading.value = true
    
    if (deleteMode.value === 'single') {
      if (!itemToDelete.value) return
      await api.delete(`/production-capacities/${itemToDelete.value.id}`)
      tableItems.value = tableItems.value.filter(t => t.id !== itemToDelete.value!.id)
      success('تم حذف الطاقة الإنتاجية بنجاح')
    } else {
      // Bulk delete
      if (selectedRows.value.length === 0) return
      await Promise.all(selectedRows.value.map(id => api.delete(`/production-capacities/${id}`)))
      tableItems.value = tableItems.value.filter(t => !selectedRows.value.includes(t.id))
      selectedRows.value = []
      success('تم حذف الطاقات الإنتاجية المحددة بنجاح')
    }
  } catch (err: any) {
    showError(err?.response?.data?.message || 'حدث خطأ أثناء الحذف')
    console.error('Error deleting production capacities:', err)
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

    await api.patch(`/production-capacities/${itemToChangeStatus.value.id}/change-status`, { is_active: newStatus })
    success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} القدرة الإنتاجية بنجاح`)
    toast.success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} القدرة الإنتاجية بنجاح`)

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

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const handleSearch = () => {
  fetchData()
}

const resetFilters = () => {
  filterStatus.value = null
  filterCreatedAt.value = ''
  filterName.value = ''
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
    <div class="production-capacity-page">
      <PageHeader :icon="productionCapacityIcon" title-key="pages.productionCapacityLists.title"
        description-key="pages.productionCapacityLists.description" />

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
        <div class="flex flex-wrap items-center gap-3 justify-end border-y border-y-slate-300 px-4 sm:px-6 py-3">
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

            <!-- <v-btn variant="flat" color="primary-100" height="40" rounded="4"
              class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200" @click="openCreate">
              <template #prepend>
                <span v-html="plusIcon"></span>
              </template>
             أضف سجل
            </v-btn> -->
          </div>

        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap lg:!flex-nowrap gap-3 flex-1 order-1 sm:order-2 justify-end sm:justify-start">
            <v-select v-model="filterStatus" :items="statusOptions" item-title="title" item-value="value"
              density="comfortable" variant="outlined" hide-details :placeholder="t('common.status')"
              class="w-full sm:w-40 bg-white" clearable />
            <DatePickerInput v-model="filterCreatedAt" density="comfortable" hide-details
              :placeholder="t('common.createdAt')" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterName" density="comfortable" variant="outlined" hide-details
              :placeholder="t('common.name')" class="w-full sm:w-40 bg-white" />
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

        <!-- Production Capacity Table -->
        <DataTable :show-view="false" :headers="tableHeaders" :items="tableItems" :loading="isLoading" show-actions
          @edit="handleEdit" @delete="handleDelete">
          <template #item.is_active="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
              class="small-switch" @update:model-value="() => handleStatusChange(item)" />
          </template>
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
      :title="deleteMode === 'single' ? 'حذف الطاقة الإنتاجية' : 'حذف الطاقات الإنتاجية'"
      :message="deleteMode === 'single' ? `هل أنت متأكد من حذف ${itemToDelete?.name}؟` : `هل أنت متأكد من حذف ${selectedRows.length} طاقة إنتاجية؟`" 
      @confirm="confirmDelete" />

    <!-- Status Change Confirmation Dialog -->
    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="itemToChangeStatus?.name" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />
  </default-layout>
</template>

<style scoped></style>
