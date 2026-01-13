<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// Group Products icon (4 squares grid)
const groupProductsIcon = `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.7 2H5.46667C4.25322 2 3.6465 2 3.18302 2.23615C2.77534 2.44388 2.44388 2.77534 2.23615 3.18302C2 3.6465 2 4.25322 2 5.46667V13.7C2 14.9134 2 15.5202 2.23615 15.9836C2.44388 16.3913 2.77534 16.7228 3.18302 16.9305C3.6465 17.1667 4.25322 17.1667 5.46667 17.1667H13.7C14.9134 17.1667 15.5202 17.1667 15.9836 16.9305C16.3913 16.7228 16.7228 16.3913 16.9305 15.9836C17.1667 15.5202 17.1667 14.9134 17.1667 13.7V5.46667C17.1667 4.25322 17.1667 3.6465 16.9305 3.18302C16.7228 2.77534 16.3913 2.44388 15.9836 2.23615C15.5202 2 14.9134 2 13.7 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.5333 2H29.3C28.0866 2 27.4798 2 27.0164 2.23615C26.6087 2.44388 26.2772 2.77534 26.0695 3.18302C25.8333 3.6465 25.8333 4.25322 25.8333 5.46667V13.7C25.8333 14.9134 25.8333 15.5202 26.0695 15.9836C26.2772 16.3913 26.6087 16.7228 27.0164 16.9305C27.4798 17.1667 28.0866 17.1667 29.3 17.1667H37.5333C38.7468 17.1667 39.3535 17.1667 39.817 16.9305C40.2247 16.7228 40.5561 16.3913 40.7638 15.9836C41 15.5202 41 14.9134 41 13.7V5.46667C41 4.25322 41 3.6465 40.7638 3.18302C40.5561 2.77534 40.2247 2.44388 39.817 2.23615C39.3535 2 38.7468 2 37.5333 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.5333 25.8333H29.3C28.0866 25.8333 27.4798 25.8333 27.0164 26.0695C26.6087 26.2772 26.2772 26.6087 26.0695 27.0164C25.8333 27.4798 25.8333 28.0866 25.8333 29.3V37.5333C25.8333 38.7468 25.8333 39.3535 26.0695 39.817C26.2772 40.2247 26.6087 40.5561 27.0164 40.7638C27.4798 41 28.0866 41 29.3 41H37.5333C38.7468 41 39.3535 41 39.817 40.7638C40.2247 40.5561 40.5561 40.2247 40.7638 39.817C41 39.3535 41 38.7468 41 37.5333V29.3C41 28.0866 41 27.4798 40.7638 27.0164C40.5561 26.6087 40.2247 26.2772 39.817 26.0695C39.3535 25.8333 38.7468 25.8333 37.5333 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.7 25.8333H5.46667C4.25322 25.8333 3.6465 25.8333 3.18302 26.0695C2.77534 26.2772 2.44388 26.6087 2.23615 27.0164C2 27.4798 2 28.0866 2 29.3V37.5333C2 38.7468 2 39.3535 2.23615 39.817C2.44388 40.2247 2.77534 40.5561 3.18302 40.7638C3.6465 41 4.25322 41 5.46667 41H13.7C14.9134 41 15.5202 41 15.9836 40.7638C16.3913 40.5561 16.7228 40.2247 16.9305 39.817C17.1667 39.3535 17.1667 38.7468 17.1667 37.5333V29.3C17.1667 28.0866 17.1667 27.4798 16.9305 27.0164C16.7228 26.6087 16.3913 26.2772 15.9836 26.0695C15.5202 25.8333 14.9134 25.8333 13.7 25.8333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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

// Table headers based on API response
const tableHeaders = [
  { key: 'name', title: 'اسم المنتج', width: '303px' },
  { key: 'code', title: 'كود SKU', width: '120px' },
  { key: 'unit', title: 'الوحدة', width: '120px' },
  { key: 'category', title: 'التصنيف', width: '120px' },
  { key: 'purchase_price', title: 'سعر الشراء', width: '120px' },
  { key: 'sell_price', title: 'سعر البيع', width: '120px' },
  { key: 'status', title: 'الحالة', width: '120px' },
]

// Sub item headers for expanded rows
const subItemHeaders = [
  { key: 'name', title: 'اسم المنتج الفرعي', width: '218px' },
  { key: 'code', title: 'كود المنتج', width: '150px' },
  { key: 'sell_price', title: 'سعر البيع', width: '150px' },
  { key: 'purchase_price', title: 'سعر الشراء', width: '150px' },
  { key: 'quantity', title: 'الكمية', width: '150px' },
  { key: 'total_amount', title: 'المبلغ الاجمالي', width: '150px' },
]

// Sample data based on API response structure
const tableItems = ref([
  {
    id: 13,
    name: 'اسم المنتج',
    code: 'ITEMS-00013',
    category: 'قطعة',
    unit: 'قطعة',
    purchase_price: 1200,
    sell_price: 200,
    status: 1,
    sub_items: []
  },
  {
    id: 11,
    name: 'اسم المنتج',
    code: 'ITEMS-00011',
    category: 'قطعة',
    unit: 'قطعة',
    purchase_price: 1200,
    sell_price: 200,
    status: 1,
    sub_items: [
      {
        id: 12,
        name: 'بحص احمر _ كبير',
        code: 'BR-S-BAG-50KG',
        purchase_price: 12,
        sell_price: 122,
        quantity: 500,
        total_amount: '4,000.00 ريال',
        status: 1
      }
    ]
  },
  {
    id: 9,
    name: 'اسم المنتج',
    code: 'ITEMS-00009',
    category: 'قطعة',
    unit: 'قطعة',
    purchase_price: 1200,
    sell_price: 200,
    status: 0,
    sub_items: [
      {
        id: 10,
        name: 'بحص اصفر _ كبير',
        code: 'BR-S-BAG-50KG',
        purchase_price: 12,
        sell_price: 122,
        quantity: 500,
        total_amount: '8,000.00 ريال',
        status: 1
      }
    ]
  },
])

// Selection state
const selectedRows = ref<number[]>([])
const hasSelected = computed(() => selectedRows.value.length > 0)

// Filters
const showAdvancedFilters = ref(false)
const filterStatus = ref<string | null>(null)
const filterProductName = ref('')
const filterSkuCode = ref('')
const filterUnit = ref('')
const filterCategory = ref('')

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// Handlers
const handleView = (item: any) => {
  router.push({ name: 'GroupProductView', params: { id: item.id } })
}

const handleEdit = (item: any) => {
  router.push({ name: 'GroupProductEdit', params: { id: item.id } })
}

const handleDelete = (item: any) => {
  tableItems.value = tableItems.value.filter(t => t.id !== item.id)
}

const handleSelect = (item: any, selected: boolean) => {
  if (selected) selectedRows.value.push(item.id)
  else selectedRows.value = selectedRows.value.filter(id => id !== item.id)
}

const handleSelectAll = (checked: boolean) => {
  selectedRows.value = checked ? tableItems.value.map(i => i.id) : []
}

const openCreate = () => {
  router.push({ name: 'GroupProductsCreate' })
}
</script>

<template>
  <default-layout>
    <div class="group-products-page">
      <PageHeader :icon="groupProductsIcon" title-key="pages.groupProducts.title"
        description-key="pages.groupProducts.description" />
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
              :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')" />
            <div class="w-px bg-gray-200"></div>
            <ButtonWithIcon variant="flat" height="40" rounded="0"
              custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
              :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')" />
          </div>

          <!-- Main header controls -->
          <div class="flex flex-wrap gap-3">
            <ButtonWithIcon variant="outlined" rounded="4" color="gray-500" height="40"
              custom-class="font-semibold text-base border-gray-400"
              :prepend-icon="columnIcon" :label="t('common.columns')" append-icon="mdi-chevron-down" />

            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />

            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" :label="t('common.addProduct')" @click="openCreate" />
          </div>
        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap gap-3 flex-1 order-1 sm:order-2 justify-end sm:justify-start">
            <v-select v-model="filterStatus" :items="['فعال', 'غير فعال']" density="comfortable" variant="outlined"
              hide-details :placeholder="t('common.status')" class="w-full sm:w-40 bg-white" />
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
                :prepend-icon="searchIcon" label="ابحث الآن" />
              
              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" label="إعادة تعيين" />
            </div>

          </div>
        </div>

        <!-- Group Products Table -->
        <GroupedDataTable :headers="tableHeaders" :items="tableItems" :sub-item-headers="subItemHeaders" show-checkbox
          show-actions @edit="handleEdit" @delete="handleDelete" @view="handleView" @select="handleSelect"
          @selectAll="handleSelectAll" />
      </div>
    </div>
  </default-layout>
</template>

<style scoped></style>
