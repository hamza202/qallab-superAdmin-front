<script setup lang="ts">
interface TableHeader {
  key: string;
  title: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  width?: string;
  children?: TableHeader[];
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
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  showCheckbox: false,
  showActions: true,
  showDelete: true,
  confirmDelete: true,
  loading: false,
  emptyText: "لا توجد بيانات",
});

const emit = defineEmits<{
  (e: "delete", item: TableItem): void;
  (e: "select", item: TableItem, selected: boolean): void;
  (e: "selectAll", selected: boolean): void;
}>();

const selectedItems = ref<(string | number)[]>([]);
const selectAll = ref(false);

const hasGroupedHeaders = computed(() =>
  props.headers.some((h) => !!h.children?.length)
);

const flatHeaders = computed(() => {
  if (!hasGroupedHeaders.value) return props.headers;
  const out: TableHeader[] = [];
  props.headers.forEach((h) => {
    if (h.children?.length) {
      out.push(...h.children);
    } else {
      out.push(h);
    }
  });
  return out;
});

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
</script>

<template>
  <div class="bg-white overflow-hidden">
    <div v-if="title" class="px-3 py-3 border-b border-gray-300 border-t bg-gray-50 border-t-gray-300">
      <h3 class="font-bold text-gray-900">{{ title }}</h3>
    </div>

    <v-table class="editable-data-table" hover>
      <thead>
        <tr v-if="!hasGroupedHeaders" class="bg-gray-50">
          <th v-if="showCheckbox" class="w-[60px] !bg-gray-50 px-2">
            <v-checkbox v-model="selectAll" hide-details density="compact" class="justify-end min-w-7"
              @change="toggleSelectAll" />
          </th>

          <th v-for="header in headers" :key="header.key" class="!font-bold !text-gray-600 !text-xs !bg-gray-50"
            :style="header.width ? { width: header.width } : {}">
            {{ header.title }}
          </th>

          <th v-if="showActions && showDelete" class="!text-start w-[100px] !bg-gray-50"></th>
        </tr>

        <tr v-else class="bg-gray-50">
          <th v-if="showCheckbox" class="w-[60px] !bg-gray-50 px-2">
            <v-checkbox v-model="selectAll" hide-details density="compact" class="justify-end min-w-7"
              @change="toggleSelectAll" />
          </th>

          <template v-for="header in headers" :key="header.key">
            <th v-if="header.children?.length" class="!font-bold !text-gray-600 !text-xs !bg-gray-50 text-center border-x border-gray-300"
              :colspan="header.children.length" :style="header.width ? { width: header.width } : {}">
              {{ header.title }}
            </th>
            <th v-else class="!font-bold !text-gray-600 !text-xs !bg-gray-50"
              :style="header.width ? { width: header.width } : {}">
              {{ header.title }}
            </th>
          </template>

          <th v-if="showActions && showDelete" class="!text-start w-[100px] !bg-gray-50"></th>
        </tr>

        <tr v-if="hasGroupedHeaders" class="bg-gray-50">
          <th v-if="showCheckbox" class="w-[60px] !bg-gray-50"></th>
          <template v-for="header in headers" :key="header.key">
            <template v-if="header.children?.length">
              <th v-for="child in header.children" :key="child.key"
                class="!font-bold !text-gray-600 !text-xs !bg-gray-50 text-center border-x border-gray-300"
                :style="child.width ? { width: child.width } : {}">
                {{ child.title }}
              </th>
            </template>
            <th v-else class="!bg-gray-50" :style="header.width ? { width: header.width } : {}"></th>
          </template>
          <th v-if="showActions && showDelete" class="!bg-gray-50"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, rowIndex) in items" :key="item.id" class="border-b border-gray-200 bg-white">
          <td v-if="showCheckbox" class="!text-start !py-4 !bg-white !px-2">
            <v-checkbox :model-value="isSelected(item.id)" hide-details density="compact" class="justify-end min-w-7"
              @change="toggleSelect(item)" />
          </td>

          <td v-for="header in flatHeaders" :key="header.key" class="!text-start !py-4 !bg-white !px-2">
            <slot :name="`item.${header.key}`" :item="item" :header="header" :value="item[header.key]"
              :row-index="rowIndex">
              <span class="text-sm text-gray-600">{{ item[header.key] }}</span>
            </slot>
          </td>

          <td v-if="showActions && showDelete" class="!py-4 !bg-white">
            <slot name="actions" :item="item" :row-index="rowIndex">
              <div class="flex items-center gap-1">
                <v-btn icon variant="text" size="small" color="error" @click="handleDelete(item)">
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>
            </slot>
          </td>
        </tr>

        <tr v-if="items.length === 0">
          <td :colspan="flatHeaders.length + (showActions && showDelete ? 1 : 0) + (showCheckbox ? 1 : 0)"
            class="text-center py-8 text-gray-500">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-overlay :model-value="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <DeleteConfirmDialog v-model="showDeleteDialog" :persistent="true" @confirm="confirmDelete" @cancel="cancelDelete"
      @close="cancelDelete" />
  </div>
</template>

<style scoped>
.editable-data-table :deep(th) {
  height: 44px !important;
}

.editable-data-table :deep(td) {
  height: 72px !important;
}

.editable-data-table :deep(tr:last-child td) {
  border-bottom: none !important;
}
</style>
