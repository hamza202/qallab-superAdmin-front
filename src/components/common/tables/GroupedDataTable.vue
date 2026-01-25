<script setup lang="ts">
import { ref } from 'vue'

interface TableHeader {
  key: string
  title: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  width?: string
}

interface SubItem {
  id: string | number
  [key: string]: any
}

interface TableItem {
  id: string | number
  sub_items?: SubItem[]
  [key: string]: any
}

interface Props {
  headers: TableHeader[]
  items: TableItem[]
  subItemHeaders?: TableHeader[]
  showCheckbox?: boolean
  showActions?: boolean
  showDelete?: boolean
  showEdit?: boolean
  showView?: boolean
  confirmDelete?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCheckbox: false,
  showActions: true,
  showDelete: true,
  showEdit: true,
  showView: true,
  confirmDelete: true,
  loading: false,
})

const emit = defineEmits<{
  (e: 'edit', item: TableItem | SubItem, isSubItem?: boolean): void
  (e: 'delete', item: TableItem | SubItem, isSubItem?: boolean): void
  (e: 'view', item: TableItem | SubItem, isSubItem?: boolean): void
  (e: 'select', item: TableItem, selected: boolean): void
  (e: 'selectAll', selected: boolean): void
  (e: 'toggleStatus', item: TableItem): void
  (e: 'toggleSubItem', item: SubItem): void
}>()

// Expanded rows state
const expandedRows = ref<Set<string | number>>(new Set())

const toggleExpand = (itemId: string | number) => {
  if (expandedRows.value.has(itemId)) {
    expandedRows.value.delete(itemId)
  } else {
    expandedRows.value.add(itemId)
  }
}

const isExpanded = (itemId: string | number) => expandedRows.value.has(itemId)

// Selection state
const selectedItems = ref<(string | number)[]>([])
const selectAll = ref(false)

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = props.items.map((item) => item.id)
    emit('selectAll', true)
  } else {
    selectedItems.value = []
    emit('selectAll', false)
  }
}

const isSelected = (id: string | number) => selectedItems.value.includes(id)

const toggleSelect = (item: TableItem) => {
  const index = selectedItems.value.indexOf(item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
    emit('select', item, false)
  } else {
    selectedItems.value.push(item.id)
    emit('select', item, true)
  }
  selectAll.value = selectedItems.value.length === props.items.length
}

// Handlers
const handleEdit = (item: TableItem | SubItem, isSubItem = false) => {
  emit('edit', item, isSubItem)
}

const handleView = (item: TableItem | SubItem, isSubItem = false) => {
  emit('view', item, isSubItem)
}

const handleDelete = (item: TableItem | SubItem, isSubItem = false) => {
  emit('delete', item, isSubItem)
}

const handleToggleStatus = (item: TableItem) => {
  emit('toggleStatus', item)
}

const handleToggleSubItem = (subItem: SubItem) => {
  emit('toggleSubItem', subItem)
}

const isStatusActive = (status: unknown) => {
  if (typeof status === 'boolean') {
    return status
  }
  if (typeof status === 'string') {
    return status === 'نشطة' || status.toLowerCase() === 'active'
  }
  if (typeof status === 'number') {
    return status === 1
  }
  return false
}

// Icons
const chevronDownIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 7.5L10 12.5L15 7.5" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6666 4.16668V3.50001C11.6666 2.56659 11.6666 2.09988 11.4849 1.74336C11.3251 1.42976 11.0702 1.17479 10.7566 1.015C10.4 0.833344 9.93334 0.833344 8.99992 0.833344H7.66658C6.73316 0.833344 6.26645 0.833344 5.90993 1.015C5.59633 1.17479 5.34136 1.42976 5.18157 1.74336C4.99992 2.09988 4.99992 2.56659 4.99992 3.50001V4.16668M6.66659 8.75001V12.9167M9.99992 8.75001V12.9167M0.833252 4.16668H15.8333M14.1666 4.16668V13.5C14.1666 14.9001 14.1666 15.6002 13.8941 16.135C13.6544 16.6054 13.272 16.9878 12.8016 17.2275C12.2668 17.5 11.5667 17.5 10.1666 17.5H6.49992C5.09979 17.5 4.39972 17.5 3.86494 17.2275C3.39454 16.9878 3.01209 16.6054 2.7724 16.135C2.49992 15.6002 2.49992 14.9001 2.49992 13.5V4.16668" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14662 14.1201C1.18491 13.7755 1.20405 13.6032 1.25618 13.4422C1.30243 13.2993 1.36778 13.1633 1.45045 13.038C1.54363 12.8967 1.66621 12.7741 1.91136 12.5289L12.9166 1.5237C13.8371 0.603225 15.3295 0.603226 16.2499 1.5237C17.1704 2.44417 17.1704 3.93656 16.2499 4.85703L5.24469 15.8623C4.99954 16.1074 4.87696 16.23 4.73566 16.3232C4.61029 16.4058 4.47433 16.4712 4.33146 16.5174C4.17042 16.5696 3.99813 16.5887 3.65356 16.627L0.833252 16.9404L1.14662 14.1201Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const eyeIcon = `<svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.26387 8.71318C1.12769 8.49754 1.05959 8.38972 1.02147 8.22342C0.992842 8.0985 0.992842 7.9015 1.02147 7.77658C1.05959 7.61028 1.12769 7.50246 1.26387 7.28682C2.38928 5.50484 5.73915 1 10.8442 1C15.9492 1 19.299 5.50484 20.4244 7.28682C20.5606 7.50246 20.6287 7.61028 20.6668 7.77658C20.6955 7.9015 20.6955 8.0985 20.6668 8.22342C20.6287 8.38972 20.5606 8.49754 20.4244 8.71318C19.299 10.4952 15.9492 15 10.8442 15C5.73915 15 2.38928 10.4952 1.26387 8.71318Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.8442 11C12.501 11 13.8442 9.65685 13.8442 8C13.8442 6.34315 12.501 5 10.8442 5C9.1873 5 7.84415 6.34315 7.84415 8C7.84415 9.65685 9.1873 11 10.8442 11Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>

<template>
  <div class="bg-white overflow-hidden">
    <!-- Table -->
    <v-table class="grouped-data-table" hover>
      <thead v-if="items.length > 0">
        <tr class="bg-gray-50">
          <!-- Checkbox Header (Right side for RTL) -->
          <th v-if="showCheckbox" class="w-[60px] !bg-gray-50">
            <v-checkbox
              v-model="selectAll"
              hide-details
              density="compact"
              class="justify-end"
              @change="toggleSelectAll"
            />
          </th>

          <!-- Dynamic Headers -->
          <th
            v-for="header in headers"
            :key="header.key"
            class="!font-bold !text-gray-600 !text-xs !bg-gray-50"
            :style="header.width ? { width: header.width } : {}"
          >
            {{ header.title }}
          </th>

          <!-- Actions Header -->
          <th v-if="showActions" class="!text-start w-[137px] !bg-gray-50"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in items" :key="item.id">
          <!-- Main Row -->
          <tr class="border-b border-gray-200 bg-white main-row">
            <!-- Checkbox Column -->
            <td v-if="showCheckbox" class="!text-start !py-4 !bg-white min-w-[60px]">
              <v-checkbox
                :model-value="isSelected(item.id)"
                hide-details
                density="compact"
                class="justify-end"
                @change="toggleSelect(item)"
              />
            </td>

            <!-- Dynamic Columns -->
            <td
              v-for="header in headers"
              :key="header.key"
              class="!text-start !py-4 !bg-white"
            >
              <!-- Product Name with Expand Icon -->
              <template v-if="header.key === 'name' && item.sub_items && item.sub_items.length > 0">
                <div class="flex items-center gap-3 justify-start cursor-pointer" @click="toggleExpand(item.id)">
                  <button
                    class="transition-transform duration-200"
                    :class="{ 'rotate-180': isExpanded(item.id) }"
                  >
                    <span v-html="chevronDownIcon"></span>
                  </button>
                  <div class="flex flex-col items-start">
                    <span class="text-sm font-medium text-gray-900">{{ item[header.key] }}</span>
                  </div>
                 
                </div>
              </template>

              <!-- Regular Product Name (no sub items) -->
              <template v-else-if="header.key === 'name'">
                <span class="text-sm font-medium text-gray-900">{{ item[header.key] }}</span>
              </template>

              <!-- Status Switch (for both 'status' and 'is_active' keys) -->
              <template v-else-if="header.key === 'status' || header.key === 'is_active'">
                <div class="flex">
                  <slot :name="`item.${header.key}`" :item="item">
                    <v-switch
                      :model-value="isStatusActive(item.status ?? item.is_active ?? item[header.key])"
                      hide-details
                      inset
                      density="compact"
                      color="primary"
                      readonly
                      class="small-switch"
                    />
                  </slot>
                </div>
              </template>

              <!-- Regular Text -->
              <template v-else>
                <span class="text-sm text-gray-600">{{ item[header.key] }}</span>
              </template>
            </td>

            <!-- Actions Column -->
            <td v-if="showActions" class="!py-4 !bg-white">
              <div class="flex items-center justify-center gap-1">
                <v-btn
                  v-if="showView"
                  icon
                  variant="text"
                  size="small"
                  @click="handleView(item)"
                >
                  <span v-html="eyeIcon"></span>
                </v-btn>
                <v-btn
                  v-if="showEdit"
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="handleEdit(item)"
                >
                  <span v-html="editIcon"></span>
                </v-btn>
                <v-btn
                  v-if="showDelete"
                  icon
                  variant="text"
                  size="small"
                  color="error"
                  @click="handleDelete(item)"
                >
                  <span v-html="trashIcon"></span>
                </v-btn>
              </div>
            </td>
          </tr>

          <!-- Sub Items Rows (Expanded) -->
          <tr
            v-if="isExpanded(item.id) && item.sub_items && item.sub_items.length > 0"
            class="sub-items-container"
          >
            <td :colspan="headers.length + (showActions ? 1 : 0) + (showCheckbox ? 1 : 0)" class="!p-0">
              <div class="bg-gray-50 px-4 py-2">
                <table class="w-full sub-items-table">
                  <thead>
                    <tr class="bg-white">
                      <th
                        v-for="subHeader in subItemHeaders"
                        :key="subHeader.key"
                        class="!font-bold !text-gray-600 !text-xs !bg-white !py-3 !px-6 text-center"
                      >
                        {{ subHeader.title }}
                      </th>
                      <th class="!font-bold !text-gray-600 !text-xs !bg-white !py-3 !px-6 text-center w-[130px]">
                        الاجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="subItem in item.sub_items"
                      :key="subItem.id"
                      class="bg-white"
                    >
                      <td
                        v-for="subHeader in subItemHeaders"
                        :key="subHeader.key"
                        class="!py-4 !px-6 text-center"
                      >
                        <!-- Status for sub items (is_active key) -->
                        <template v-if="subHeader.key === 'is_active'">
                          <div class="flex justify-center">
                            <v-switch
                              :model-value="isStatusActive(subItem.is_active)"
                              hide-details
                              inset
                              density="compact"
                              color="primary"
                              @update:model-value="handleToggleSubItem(subItem)"
                              class="small-switch"
                            />
                          </div>
                        </template>
                        <!-- Regular text -->
                        <template v-else>
                          <span class="text-sm text-gray-600">{{ subItem[subHeader.key] }}</span>
                        </template>
                      </td>
                      <!-- Sub Item Actions -->
                      <td class="!py-4 !px-6">
                        <div class="flex items-center justify-center gap-1">
                          <v-btn
                            icon
                            variant="text"
                            size="small"
                            color="error"
                            @click="handleDelete(subItem, true)"
                          >
                            <span v-html="trashIcon"></span>
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </template>

        <!-- Empty State -->
        <tr v-if="items.length === 0">
          <td
            :colspan="headers.length + (showActions ? 1 : 0) + (showCheckbox ? 1 : 0)"
            class="text-center py-8 text-gray-500"
          >
            لا توجد بيانات
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Loading Overlay -->
    <v-overlay
      :model-value="loading"
      contained
      class="align-center justify-center"
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </div>
</template>

<style scoped>
.grouped-data-table :deep(th) {
  height: 44px !important;
}

.grouped-data-table :deep(td) {
  height: 72px !important;
}

.grouped-data-table :deep(.main-row:last-child td) {
  border-bottom: none !important;
}

.small-switch {
  transform: scale(0.8);
  transform-origin: left;
}

html[dir='rtl'] .small-switch {
  transform-origin: right;
}

.sub-items-container td {
  padding: 0 !important;
  background-color: #f8fafc !important;
}

.sub-items-table {
  border-collapse: separate;
  border-spacing: 0;
}

.sub-items-table th,
.sub-items-table td {
  border: 1px solid #e3e8ef;
}

.sub-items-table th {
  background-color: white !important;
  font-weight: bold;
  font-size: 12px;
  color: #4b5565;
}

.sub-items-table td {
  background-color: white !important;
  font-size: 14px;
  color: #4b5565;
}
</style>

