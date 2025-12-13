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
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  showCheckbox: false,
  showActions: true,
  showDelete: true,
  loading: false,
});

const emit = defineEmits<{
  (e: "edit", item: TableItem): void;
  (e: "delete", item: TableItem): void;
  (e: "select", item: TableItem, selected: boolean): void;
}>();

const selectedItems = ref<(string | number)[]>([]);
const selectAll = ref(false);

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = props.items.map((item) => item.id);
  } else {
    selectedItems.value = [];
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
  emit("delete", item);
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
const trashIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.3333 5.00001V4.33334C13.3333 3.39992 13.3333 2.93321 13.1517 2.5767C12.9919 2.26309 12.7369 2.00812 12.4233 1.84833C12.0668 1.66667 11.6001 1.66667 10.6667 1.66667H9.33333C8.39991 1.66667 7.9332 1.66667 7.57668 1.84833C7.26308 2.00812 7.00811 2.26309 6.84832 2.5767C6.66667 2.93321 6.66667 3.39992 6.66667 4.33334V5.00001M8.33333 9.58334V13.75M11.6667 9.58334V13.75M2.5 5.00001H17.5M15.8333 5.00001V14.3333C15.8333 15.7335 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.9387 17.8212 14.4683 18.0609C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0609C5.06129 17.8212 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7335 4.16667 14.3333V5.00001" stroke="#4B5565" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.39662 15.0963C2.43491 14.7517 2.45405 14.5794 2.50618 14.4184C2.55243 14.2755 2.61778 14.1396 2.70045 14.0142C2.79363 13.8729 2.91621 13.7503 3.16136 13.5052L14.1666 2.49992C15.0871 1.57945 16.5795 1.57945 17.4999 2.49993C18.4204 3.4204 18.4204 4.91279 17.4999 5.83326L6.49469 16.8385C6.24954 17.0836 6.12696 17.2062 5.98566 17.2994C5.86029 17.3821 5.72433 17.4474 5.58146 17.4937C5.42042 17.5458 5.24813 17.5649 4.90356 17.6032L2.08325 17.9166L2.39662 15.0963Z" stroke="#4B5565" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <div
    class="bg-white border border-gray-200 !rounded-xl shadow-sm overflow-hidden"
  >
    <!-- Header -->
    <div v-if="title" class="px-6 pt-5 pb-0">
      <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
    </div>

    <!-- Divider -->
    <div v-if="title" class="border-b border-gray-200 mt-5"></div>

    <!-- Table -->
    <v-table class="data-table" hover>
      <thead>
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

          <!-- Dynamic Headers (original order for RTL) -->
          <th
            v-for="header in headers"
            :key="header.key"
            class="!font-bold !text-gray-600 !text-xs !bg-gray-50"
            :style="header.width ? { width: header.width } : {}"
          >
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
            <v-checkbox
              :model-value="isSelected(item.id)"
              hide-details
              density="compact"
              class="justify-end"
              @change="toggleSelect(item)"
            />
          </td>

          <!-- Dynamic Columns (original order for RTL) -->
          <td
            v-for="header in headers"
            :key="header.key"
            class="!text-start !py-4 !bg-white"
          >
            <!-- Priority Badge -->
            <template v-if="header.key === 'priority'">
              <span
                class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getPriorityClass(item[header.key])"
              >
                {{ item[header.key] }}
              </span>
            </template>

            <!-- Taxes Pills -->
            <template v-else-if="header.key === 'taxes'">
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tax, index) in (Array.isArray(item[header.key]) ? item[header.key] : [item[header.key]])"
                  :key="index"
                  class="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                >
                  {{ tax }}
                </span>
              </div>
            </template>

            <!-- Status Switch -->
            <template v-else-if="header.key === 'status'">
              <div class="flex">
                <v-switch
                  :model-value="isStatusActive(item[header.key])"
                  hide-details
                  inset
                  density="compact"
                  color="primary"
                  readonly
                />
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
              <v-btn
                icon
                variant="text"
                v-if="showDelete"
                size="small"
                @click="handleDelete(item)"
              >
                <span v-html="trashIcon"></span>
              </v-btn>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="handleEdit(item)"
              >
                <span v-html="editIcon"></span>
              </v-btn>
            </div>
          </td>
        </tr>

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
