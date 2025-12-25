<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const api = useApi()
const { success, error } = useNotification()

// TypeScript Interfaces
interface PriceList {
  id: number
  name: string
  translations?: {
    name: {
      en: string
      ar: string
    }
  }
  is_active: boolean
  created_at: string
}

interface PriceListsResponse {
  success: boolean
  message: string
  data: PriceList[]
}

// Price Lists icon
const priceListsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="40" height="40" rx="4" stroke="#1570EF" stroke-width="3"/>
<path d="M14 16H38" stroke="#1570EF" stroke-width="3"/>
<path d="M14 24H38" stroke="#1570EF" stroke-width="3"/>
<path d="M14 32H30" stroke="#1570EF" stroke-width="3"/>
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

// Table headers
const tableHeaders = [
  { key: 'name', title: 'اسم القائمة', width: '200px' },
  { key: 'createdAt', title: 'تاريخ الإنشاء', width: '160px' },
  { key: 'status', title: 'الحالة', width: '120px' },
]

// Data
const tableItems = ref<PriceList[]>([])
const loading = ref(false)
const deleteLoading = ref(false)

// Selection state
const selectedRows = ref<number[]>([])
const hasSelected = computed(() => selectedRows.value.length > 0)

// Filters
const showAdvancedFilters = ref(false)
const filterStatus = ref<string | null>(null)
const filterCreatedAt = ref('')
const filterListName = ref('')

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// API Functions
const fetchPriceLists = async () => {
  try {
    loading.value = true
    const response = await api.get<PriceListsResponse>('/api/price-lists')
    tableItems.value = response.data
  } catch (err: any) {
    console.error('Error fetching price lists:', err)
    error(err?.response?.data?.message || 'فشل في جلب قوائم الأسعار')
  } finally {
    loading.value = false
  }
}

const deletePriceList = async (priceListId: number) => {
  try {
    deleteLoading.value = true
    await api.delete(`/api/price-lists/${priceListId}`)
    success('تم حذف قائمة الأسعار بنجاح')
    await fetchPriceLists()
  } catch (err: any) {
    console.error('Error deleting price list:', err)
    error(err?.response?.data?.message || 'فشل في حذف قائمة الأسعار')
  } finally {
    deleteLoading.value = false
  }
}

// Handlers
const handleEdit = (item: any) => {
  router.push({ name: 'ProductPriceListEdit', params: { id: item.id } })
}

const handleDelete = async (item: any) => {
  if (confirm('هل أنت متأكد من حذف هذه القارمة؟')) {
    await deletePriceList(item.id)
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
  router.push({ name: 'ProductPriceListCreate' })
}

// Lifecycle
onMounted(() => {
  fetchPriceLists()
})
</script>

<template>
  <default-layout>
    <div class="price-lists-page">
      <PageHeader :icon="priceListsIcon" title-key="pages.ProductsPriceLists.title" description-key="pages.ProductsPriceLists.description" />

      <div class="flex justify-end pb-2 gap-3">
        <v-btn variant="outlined" height="40" class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900">
          <template #prepend>
            <span v-html="importIcon" />
          </template>
          استيراد
        </v-btn>
        <v-btn variant="outlined" height="40" class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900">
          <template #prepend>
            <span v-html="exportIcon" />
          </template>
          تصدير
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
              <span>تعديل</span>
            </v-btn>
            <div class="w-px bg-gray-200"></div>
            <v-btn class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none">
              <template #prepend>
                <span v-html="trash_1_icon" />
              </template>
              <span>حذف</span>
            </v-btn>
            <div class="w-px bg-gray-200"></div>
            <v-btn class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none">
              <template #prepend>
                <span v-html="trash_2_icon" />
              </template>
              <span>حذف الجميع</span>
            </v-btn>
          </div>

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <v-btn variant="outlined" append-icon="mdi-chevron-down" color="gray-500" height="40" class="font-semibold text-base border-gray-400">
              <template #prepend>
                <span v-html="columnIcon" />
              </template>
              الأعمدة
            </v-btn>

            <v-btn variant="outlined" color="primary-50" height="40" class="px-7 font-semibold text-base text-primary-700" prepend-icon="mdi-magnify" @click="toggleAdvancedFilters">
              بحث متقدم
            </v-btn>

            <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base" prepend-icon="mdi-plus-circle-outline" @click="openCreate">
              أضف قائمة
            </v-btn>
          </div>
        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters" class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap gap-3 flex-1 order-1 sm:order-2 justify-end sm:justify-start">
            <v-select v-model="filterStatus" :items="['فعال', 'غير فعال']" density="comfortable" variant="outlined" hide-details placeholder="الحالة" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterCreatedAt" type="date" density="comfortable" variant="outlined" hide-details placeholder="تاريخ الانشاء" class="w-full sm:w-40 bg-white" />
            <v-text-field v-model="filterListName" density="comfortable" variant="outlined" hide-details placeholder="اسم القائمة" class="w-full sm:w-40 bg-white" />
          </div>
        </div>

        <!-- Price Lists Table -->
        <DataTable
          :headers="tableHeaders"
          :items="tableItems"
          :loading="loading"
          show-checkbox
          show-actions
          @edit="handleEdit"
          @delete="handleDelete"
          @select="handleSelect"
          @selectAll="handleSelectAll"
        >
          <template #item.name="{ item }">
            <span class="text-sm font-semibold text-gray-900">{{ item.name }}</span>
          </template>

          <template #item.createdAt="{ item }">
            <span class="text-sm text-gray-600">{{ new Date(item.created_at).toLocaleDateString('ar-SA') }}</span>
          </template>

          <template #item.status="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary" disabled />
          </template>
        </DataTable>
      </div>
    </div>
  </default-layout>
</template>

<style scoped></style>

