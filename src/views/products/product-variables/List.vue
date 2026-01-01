<template>
  <default-layout>
    <div class="product-variables-page">
      <PageHeader :icon="variablesIcon" title-key="pages.productVariables.title" description-key="pages.productVariables.description" />

      <div class="flex justify-end pb-2 gap-3">
        <v-btn variant="outlined" height="40" class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900">
          <template #prepend>
            <span v-html="exportIcon" />
          </template>
          {{ t('common.export') }}
        </v-btn>
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div :class="hasSelected ? 'justify-between' : 'justify-end'" class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <!-- Actions when rows are selected -->
          <div v-if="hasSelected" class="flex flex-wrap items-stretch rounded-lg overflow-hidden border border-gray-200 bg-white text-sm">
            <v-btn class="px-4 font-semibold text-primary-600 hover:bg-primary-50 !rounded-none">
              <template #prepend>
                <span v-html="editIcon" />
              </template>
              <span>{{ t('common.edit') }}</span>
            </v-btn>
            <div class="w-px bg-gray-200"></div>
            <v-btn class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none" @click="handleDeleteSelected">
              <template #prepend>
                <span v-html="trash_1_icon" />
              </template>
              <span>{{ t('common.delete') }}</span>
            </v-btn>
            <div class="w-px bg-gray-200"></div>
            <v-btn class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none" @click="handleDeleteAll">
              <template #prepend>
                <span v-html="trash_2_icon" />
              </template>
              <span>{{ t('common.deleteAll') }}</span>
            </v-btn>
          </div>

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <v-btn variant="outlined" append-icon="mdi-chevron-down" color="gray-500" height="40" class="font-semibold text-base border-gray-400">
              <template #prepend>
                <span v-html="columnIcon" />
              </template>
              {{ t('common.columns') }}
            </v-btn>

            <v-btn variant="outlined" color="primary-50" height="40" class="px-7 font-semibold text-base text-primary-700" prepend-icon="mdi-magnify" @click="toggleAdvancedFilters">
              {{ t('common.advancedSearch') }}
            </v-btn>

            <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base" prepend-icon="mdi-plus-circle-outline" @click="openCreate">
              {{ t('common.addNew') }}
            </v-btn>
          </div>
        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters" class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap gap-3 flex-1 order-1 sm:order-2 justify-end sm:justify-start">
            <v-select v-model="filterStatus" :items="['فعال', 'غير فعال']" density="comfortable" variant="outlined" hide-details placeholder="الحالة" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterCreatedAt" type="date" density="comfortable" variant="outlined" hide-details placeholder="تاريخ الانشاء" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterName" density="comfortable" variant="outlined" hide-details placeholder="اسم المتغير" class="w-full sm:w-40 bg-white" />
          </div>
        </div>

        <!-- Product Variables Table -->
        <DataTable
          :headers="tableHeaders"
          :items="tableItems"
          show-checkbox
          show-actions
          @edit="handleEdit"
          @delete="handleDelete"
          @select="handleSelect"
          @selectAll="handleSelectAll"
        />

        <!-- Infinite Scroll Trigger & Loading Indicator -->
        <div ref="loadMoreTrigger" class="flex justify-center py-4">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
          <span v-else-if="!hasMoreData && tableItems.length > 0" class="text-gray-500 text-sm">
            لا توجد المزيد من البيانات
          </span>
        </div>
      </div>
    </div>
  </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const { t } = useI18n()
const api = useApi()

// Loading and error states
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)

// Pagination
const perPage = ref(15)
const nextCursor = ref<string | null>(null)
const previousCursor = ref<string | null>(null)
const hasMoreData = computed(() => nextCursor.value !== null)

// API Response interfaces
interface AspectValue {
  id: number
  name: string
  is_active: boolean
}

interface Aspect {
  id: number
  name: string
  is_active: boolean
  created_at: string
  values?: AspectValue[]
}

interface TableHeader {
  key: string
  title: string
}

interface ApiResponse {
  status: number
  code: number
  locale: string
  message: string
  data: Aspect[]
  pagination: {
    next_cursor: string | null
    previous_cursor: string | null
    per_page: number
  }
  headers: TableHeader[]
  shownHeaders: TableHeader[]
  header_table?: string
}

const variablesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.2 6.5H9.96667C8.75322 6.5 8.1465 6.5 7.68302 6.73615C7.27534 6.94388 6.94388 7.27534 6.73615 7.68302C6.5 8.1465 6.5 8.75322 6.5 9.96667V18.2C6.5 19.4134 6.5 20.0202 6.73615 20.4836C6.94388 20.8913 7.27534 21.2228 7.68302 21.4305C8.1465 21.6667 8.75322 21.6667 9.96667 21.6667H18.2C19.4134 21.6667 20.0202 21.6667 20.4836 21.4305C20.8913 21.2228 21.2228 20.8913 21.4305 20.4836C21.6667 20.0202 21.6667 19.4134 21.6667 18.2V9.96667C21.6667 8.75322 21.6667 8.1465 21.4305 7.68302C21.2228 7.27534 20.8913 6.94388 20.4836 6.73615C20.0202 6.5 19.4134 6.5 18.2 6.5Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42.0333 6.5H33.8C32.5866 6.5 31.9798 6.5 31.5164 6.73615C31.1087 6.94388 30.7772 7.27534 30.5695 7.68302C30.3333 8.1465 30.3333 8.75322 30.3333 9.96667V18.2C30.3333 19.4134 30.3333 20.0202 30.5695 20.4836C30.7772 20.8913 31.1087 21.2228 31.5164 21.4305C31.9798 21.6667 32.5866 21.6667 33.8 21.6667H42.0333C43.2468 21.6667 43.8535 21.6667 44.317 21.4305C44.7247 21.2228 45.0561 20.8913 45.2638 20.4836C45.5 20.0202 45.5 19.4134 45.5 18.2V9.96667C45.5 8.75322 45.5 8.1465 45.2638 7.68302C45.0561 7.27534 44.7247 6.94388 44.317 6.73615C43.8535 6.5 43.2468 6.5 42.0333 6.5Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42.0333 30.3333H33.8C32.5866 30.3333 31.9798 30.3333 31.5164 30.5695C31.1087 30.7772 30.7772 31.1087 30.5695 31.5164C30.3333 31.9798 30.3333 32.5866 30.3333 33.8V42.0333C30.3333 43.2468 30.3333 43.8535 30.5695 44.317C30.7772 44.7247 31.1087 45.0561 31.5164 45.2638C31.9798 45.5 32.5866 45.5 33.8 45.5H42.0333C43.2468 45.5 43.8535 45.5 44.317 45.2638C44.7247 45.0561 45.0561 44.7247 45.2638 44.317C45.5 43.8535 45.5 43.2468 45.5 42.0333V33.8C45.5 32.5866 45.5 31.9798 45.2638 31.5164C45.0561 31.1087 44.7247 30.7772 44.317 30.5695C43.8535 30.3333 43.2468 30.3333 42.0333 30.3333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.2 30.3333H9.96667C8.75322 30.3333 8.1465 30.3333 7.68302 30.5695C7.27534 30.7772 6.94388 31.1087 6.73615 31.5164C6.5 31.9798 6.5 32.5866 6.5 33.8V42.0333C6.5 43.2468 6.5 43.8535 6.73615 44.317C6.94388 44.7247 7.27534 45.0561 7.68302 45.2638C8.1465 45.5 8.75322 45.5 9.96667 45.5H18.2C19.4134 45.5 20.0202 45.5 20.4836 45.2638C20.8913 45.0561 21.2228 44.7247 21.4305 44.317C21.6667 43.8535 21.6667 43.2468 21.6667 42.0333V33.8C21.6667 32.5866 21.6667 31.9798 21.4305 31.5164C21.2228 31.1087 20.8913 30.7772 20.4836 30.5695C20.0202 30.3333 19.4134 30.3333 18.2 30.3333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_1_icon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.1247 5.00065L8.12467 10.0007M8.12467 5.00065L13.1247 10.0007M1.22467 8.30065L4.82467 13.1007C5.11801 13.4918 5.26467 13.6873 5.45055 13.8284C5.61518 13.9533 5.8016 14.0465 6.00032 14.1032C6.22468 14.1673 6.46912 14.1673 6.95801 14.1673H13.2913C14.6915 14.1673 15.3915 14.1673 15.9263 13.8948C16.3967 13.6552 16.7792 13.2727 17.0189 12.8023C17.2913 12.2675 17.2913 11.5674 17.2913 10.1673V4.83398C17.2913 3.43385 17.2913 2.73379 17.0189 2.19901C16.7792 1.7286 16.3967 1.34615 15.9263 1.10647C15.3915 0.833984 14.6915 0.833984 13.2913 0.833984H6.95801C6.46912 0.833984 6.22468 0.833984 6.00032 0.89806C5.8016 0.954812 5.61518 1.04802 5.45055 1.17294C5.26467 1.31399 5.11801 1.50954 4.82467 1.90065L1.22467 6.70065C1.00951 6.98753 0.901932 7.13097 0.860462 7.28851C0.823856 7.42757 0.823856 7.57373 0.860462 7.71279C0.901932 7.87033 1.00951 8.01377 1.22467 8.30065Z" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// Data from API
const tableItems = ref<Aspect[]>([])
const allHeaders = ref<TableHeader[]>([])
const shownHeaders = ref<TableHeader[]>([])

// Computed table headers for DataTable component
const tableHeaders = computed(() => {
  return shownHeaders.value.map(header => ({
    key: header.key,
    title: header.title,
    width: '140px'
  }))
})

// State
const selectedRows = ref<number[]>([])
const showAdvancedFilters = ref(false)
const searchQuery = ref('')
const filterName = ref('')
const filterCreatedAt = ref('')
const filterStatus = ref<string | null>(null)

// Computed
const hasSelected = computed(() => selectedRows.value.length > 0)

// Handlers
const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value
}

const openCreate = () => {
  router.push({ name: 'ProductVariableCreate' })
}

const handleEdit = (item: any) => {
    router.push({ name: 'ProductVariableEdit', params: { id: item.id } })
}

const handleDelete = async (item: any) => {
    if (confirm('هل أنت متأكد من حذف هذا المتغير؟')) {
        try {
            loading.value = true
            await api.del(`/api/aspects/${item.id}`)
            await fetchAspects()
        } catch (err: any) {
            error.value = err.message || 'فشل حذف المتغير'
            console.error('Delete error:', err)
        } finally {
            loading.value = false
        }
    }
}

const handleDeleteSelected = async () => {
    if (confirm(`هل أنت متأكد من حذف ${selectedRows.value.length} متغير؟`)) {
        try {
            loading.value = true
            // Delete each selected item
            await Promise.all(
                selectedRows.value.map(id => api.del(`/api/aspects/${id}`))
            )
            selectedRows.value = []
            await fetchAspects()
        } catch (err: any) {
            error.value = err.message || 'فشل حذف المتغيرات'
            console.error('Delete selected error:', err)
        } finally {
            loading.value = false
        }
    }
}

const handleDeleteAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع المتغيرات؟')) {
        tableItems.value = []
        selectedRows.value = []
    }
}

const handleSelect = (item: any, selected: boolean) => {
    if (selected) {
        selectedRows.value.push(item.id)
    } else {
        selectedRows.value = selectedRows.value.filter(id => id !== item.id)
    }
}

const handleSelectAll = (selected: boolean) => {
    selectedRows.value = selected ? tableItems.value.map(i => i.id) : []
}

const handleStatusChange = async (item: any) => {
    try {
        loading.value = true
        await api.post(`/api/aspects/${item.id}`, {
            ...item,
            is_active: item.is_active
        })
    } catch (err: any) {
        error.value = err.message || 'فشل تحديث الحالة'
        console.error('Status change error:', err)
        // Revert the change on error
        item.is_active = !item.is_active
    } finally {
        loading.value = false
    }
}

// Fetch aspects from API
const fetchAspects = async (cursor?: string | null, append = false) => {
    try {
        if (append) {
            loadingMore.value = true
        } else {
            loading.value = true
        }
        error.value = null
        
        const params = new URLSearchParams({
            per_page: perPage.value.toString(),
            paginate: 'true'
        })

        // Add cursor for pagination
        if (cursor) {
            params.append('cursor', cursor)
        }

        // Add filters if they exist
        if (filterName.value) {
            params.append('name', filterName.value)
        }
        if (filterStatus.value !== null) {
            params.append('status', filterStatus.value ? '1' : '0')
        }
        if (filterCreatedAt.value) {
            params.append('created_at', filterCreatedAt.value)
        }

        const response: ApiResponse = await api.get(`/api/aspects?${params.toString()}`)
        
        if (append) {
            // Append data for lazy loading
            tableItems.value = [...tableItems.value, ...response.data]
        } else {
            // Replace data for initial load or filter change
            tableItems.value = response.data
            allHeaders.value = response.headers
            shownHeaders.value = response.shownHeaders
        }
        
        nextCursor.value = response.pagination.next_cursor
        previousCursor.value = response.pagination.previous_cursor
        perPage.value = response.pagination.per_page
        
    } catch (err: any) {
        error.value = err.message || 'فشل تحميل البيانات'
        console.error('Fetch error:', err)
    } finally {
        loading.value = false
        loadingMore.value = false
    }
}

// Load more data (lazy loading)
const loadMore = () => {
    if (hasMoreData.value && !loadingMore.value) {
        fetchAspects(nextCursor.value, true)
    }
}

// Apply filters
const applyFilters = () => {
    fetchAspects()
}

// Infinite scroll with Intersection Observer
const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

const setupInfiniteScroll = () => {
    if (!loadMoreTrigger.value) return

    observer.value = new IntersectionObserver(
        (entries) => {
            const entry = entries[0]
            if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
                loadMore()
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

// Load data on mount
onMounted(() => {
    fetchAspects()
    nextTick(() => {
        setupInfiniteScroll()
    })
})

onBeforeUnmount(() => {
    cleanupInfiniteScroll()
})

</script>

<style scoped>
.product-variables-list-page {
    padding: 24px;
}
</style>
