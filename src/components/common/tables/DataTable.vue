<script setup lang="ts">
interface TableHeader {
  key: string;
  title: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  width?: string;
}

interface TableItem {
  id: string | number;
  [key: string]: any;
}

interface Props {
  title?: string;
  headers: TableHeader[];
  items: TableItem[];
  showCheckbox?: boolean;
  showActions?: boolean;
  showDelete?: boolean;
  confirmDelete?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  showCheckbox: false,
  showActions: true,
  showDelete: true,
  confirmDelete: true,
  loading: false,
});

const emit = defineEmits<{
  (e: "edit", item: TableItem): void;
  (e: "delete", item: TableItem): void;
  (e: "select", item: TableItem, selected: boolean): void;
  (e: "selectAll", selected: boolean): void;
}>();

const selectedItems = ref<(string | number)[]>([]);
const selectAll = ref(false);

const showDeleteDialog = ref(false);
const pendingDeleteItem = ref<TableItem | null>(null);

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = props.items.map((item) => item.id);
    emit("selectAll", true);
  } else {
    selectedItems.value = [];
    emit("selectAll", false);
  }
};

const isSelected = (id: string | number) => selectedItems.value.includes(id);

const toggleSelect = (item: TableItem) => {
  const index = selectedItems.value.indexOf(item.id);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
    emit("select", item, false);
  } else {
    selectedItems.value.push(item.id);
    emit("select", item, true);
  }
  selectAll.value = selectedItems.value.length === props.items.length;
};

const handleEdit = (item: TableItem) => {
  emit("edit", item);
};

const handleDelete = (item: TableItem) => {
  if (!props.confirmDelete) {
    emit("delete", item);
    return;
  }

  pendingDeleteItem.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = () => {
  if (!pendingDeleteItem.value) return;
  emit("delete", pendingDeleteItem.value);
  pendingDeleteItem.value = null;
};

const cancelDelete = () => {
  pendingDeleteItem.value = null;
};

// Priority badge colors
const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "high":
    case "عالية":
      return "bg-success-50 text-success-700";
    case "medium":
    case "متوسطة":
      return "bg-primary-50 text-primary-700";
    case "low":
    case "منخفضة":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const isStatusActive = (status: unknown) => {
  if (typeof status === "boolean") {
    return status;
  }

  if (typeof status === "string") {
    return status === "نشطة" || status.toLowerCase() === "active";
  }

  return false;
};

// Icons
const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6666 4.16668V3.50001C11.6666 2.56659 11.6666 2.09988 11.4849 1.74336C11.3251 1.42976 11.0702 1.17479 10.7566 1.015C10.4 0.833344 9.93334 0.833344 8.99992 0.833344H7.66658C6.73316 0.833344 6.26645 0.833344 5.90993 1.015C5.59633 1.17479 5.34136 1.42976 5.18157 1.74336C4.99992 2.09988 4.99992 2.56659 4.99992 3.50001V4.16668M6.66659 8.75001V12.9167M9.99992 8.75001V12.9167M0.833252 4.16668H15.8333M14.1666 4.16668V13.5C14.1666 14.9001 14.1666 15.6002 13.8941 16.135C13.6544 16.6054 13.272 16.9878 12.8016 17.2275C12.2668 17.5 11.5667 17.5 10.1666 17.5H6.49992C5.09979 17.5 4.39972 17.5 3.86494 17.2275C3.39454 16.9878 3.01209 16.6054 2.7724 16.135C2.49992 15.6002 2.49992 14.9001 2.49992 13.5V4.16668" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14662 14.1201C1.18491 13.7755 1.20405 13.6032 1.25618 13.4422C1.30243 13.2993 1.36778 13.1633 1.45045 13.038C1.54363 12.8967 1.66621 12.7741 1.91136 12.5289L12.9166 1.5237C13.8371 0.603225 15.3295 0.603226 16.2499 1.5237C17.1704 2.44417 17.1704 3.93656 16.2499 4.85703L5.24469 15.8623C4.99954 16.1074 4.87696 16.23 4.73566 16.3232C4.61029 16.4058 4.47433 16.4712 4.33146 16.5174C4.17042 16.5696 3.99813 16.5887 3.65356 16.627L0.833252 16.9404L1.14662 14.1201Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <div class="bg-white overflow-hidden">
    <!-- Header -->
    <div v-if="title" class="px-3 py-3 border-b border-gray-300 border-t bg-gray-50 border-t-gray-300">
      <h3 class="font-bold text-gray-900">{{ title }}</h3>
    </div>

    <!-- Table -->
    <v-table class="data-table" hover>
      <thead v-if="items.length > 0">
        <tr class="bg-gray-50">
          <!-- Checkbox Header (Right side for RTL) -->
          <th v-if="showCheckbox" class="w-[60px] !bg-gray-50">
            <v-checkbox v-model="selectAll" hide-details density="compact" class="justify-end"
              @change="toggleSelectAll" />
          </th>

          <!-- Dynamic Headers (original order for RTL) -->
          <th v-for="header in headers" :key="header.key" class="!font-bold !text-gray-600 !text-xs !bg-gray-50"
            :style="header.width ? { width: header.width } : {}">
            {{ header.title }}
          </th>

          <!-- Actions Header (Left side for RTL) -->
          <th v-if="showActions" class="!text-start w-[100px] !bg-gray-50"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" class="border-b border-gray-200 bg-white">
          <!-- Checkbox Column (Right side for RTL) -->
          <td v-if="showCheckbox" class="!text-start !py-4 !bg-white">
            <v-checkbox :model-value="isSelected(item.id)" hide-details density="compact" class="justify-end"
              @change="toggleSelect(item)" />
          </td>

          <!-- Dynamic Columns (original order for RTL) -->
          <td v-for="header in headers" :key="header.key" class="!text-start !py-4 !bg-white">
            <!-- Custom Cell Slot -->
            <template v-if="$slots[`item.${header.key}`]">
              <slot :name="`item.${header.key}`" :item="item" />
            </template>

            <!-- Priority Badge -->
            <template v-else-if="header.key === 'priority'">
              <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getPriorityClass(item[header.key])">
                {{ item[header.key] }}
              </span>
            </template>

            <!-- Taxes Pills -->
            <template v-else-if="header.key === 'taxes'">
              <div class="flex flex-wrap gap-2">
                <span v-for="(tax, index) in (Array.isArray(item[header.key]) ? item[header.key] : [item[header.key]])"
                  :key="index" class="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
                  {{ tax }}
                </span>
              </div>
            </template>

            <!-- Status Switch (fallback when no custom slot provided) -->
            <template v-else-if="header.key === 'status'">
              <div class="flex">
                <v-switch :model-value="isStatusActive(item[header.key])" hide-details inset density="compact"
                  color="primary" readonly />
              </div>
            </template>

            <!-- Regular Text -->
            <template v-else>
              <span class="text-sm text-gray-600">{{ item[header.key] }}</span>
            </template>
          </td>

          <!-- Actions Column (Left side for RTL) -->
          <td v-if="showActions" class="!py-4 !bg-white">
            <div class="flex items-center gap-1">
              <v-btn icon variant="text" v-if="showDelete" size="small" color="error" @click="handleDelete(item)">
                <span v-html="trashIcon"></span>
              </v-btn>
              <v-btn icon variant="text" color="primary" size="small" @click="handleEdit(item)">
                <span v-html="editIcon"></span>
              </v-btn>
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-if="items.length === 0">
          <td :colspan="headers.length + (showActions ? 1 : 0) + (showCheckbox ? 1 : 0)"
            class="text-center py-8 text-gray-500">
            لا توجد بيانات
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Loading Overlay -->
    <v-overlay :model-value="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <DeleteConfirmDialog
      v-model="showDeleteDialog"
      :persistent="true"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="cancelDelete"
    />
  </div>
</template>

<style scoped>
.data-table :deep(th) {
  height: 44px !important;
}

.data-table :deep(td) {
  height: 72px !important;
}

.data-table :deep(tr:last-child td) {
  border-bottom: none !important;
}
</style>
