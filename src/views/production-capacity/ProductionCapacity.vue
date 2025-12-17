<script setup lang="ts">
import { ref } from "vue";

interface ProductionCapacityRow {
  id: number;
  productId: number | null;
  tonPerHourMin: number | null;
  tonPerHourMax: number | null;
  tonPerDayMin: number | null;
  tonPerDayMax: number | null;
  tonPerWeekMin: number | null;
  tonPerWeekMax: number | null;
  tonPerMonthMin: number | null;
  tonPerMonthMax: number | null;
}

type ProductionCapacityNumericField = Exclude<
  keyof ProductionCapacityRow,
  "id" | "productId"
>;

type EditableTableItem = {
  id: string | number;
  [key: string]: any;
};

type BulkEditMode = "percentage" | "value";
type BulkEditDirection = "increase" | "decrease";

const productionCapacityIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 6.5C8.4401 6.5 6.5 8.4401 6.5 10.8333V41.1667C6.5 43.5599 8.4401 45.5 10.8333 45.5H41.1667C43.5599 45.5 45.5 43.5599 45.5 41.1667V10.8333C45.5 8.4401 43.5599 6.5 41.1667 6.5H10.8333ZM15.1667 18.4167C15.1667 17.2201 16.1367 16.25 17.3333 16.25H34.6667C35.8633 16.25 36.8333 17.2201 36.8333 18.4167C36.8333 19.6133 35.8633 20.5833 34.6667 20.5833H17.3333C16.1367 20.5833 15.1667 19.6133 15.1667 18.4167ZM15.1667 29.25C15.1667 28.0534 16.1367 27.0833 17.3333 27.0833H34.6667C35.8633 27.0833 36.8333 28.0534 36.8333 29.25C36.8333 30.4466 35.8633 31.4167 34.6667 31.4167H17.3333C16.1367 31.4167 15.1667 30.4466 15.1667 29.25Z" fill="#1570EF"/>
</svg>`;

const capacityListName = ref("");

const productItems = ref([
  { title: "مواد بناء", value: 1 },
  { title: "اسمنت", value: 2 },
  { title: "حديد", value: 3 },
]);

const nextRowId = ref(1);

const createEmptyRow = (): ProductionCapacityRow => ({
  id: nextRowId.value++,
  productId: null,
  tonPerHourMin: null,
  tonPerHourMax: null,
  tonPerDayMin: null,
  tonPerDayMax: null,
  tonPerWeekMin: null,
  tonPerWeekMax: null,
  tonPerMonthMin: null,
  tonPerMonthMax: null,
});

const rows = ref<ProductionCapacityRow[]>([createEmptyRow()]);

const tableHeaders = [
  { key: "rowNumber", title: "#", width: "70px" },
  { key: "productId", title: "المنتج", width: "280px" },
  {
    key: "tonPerHour",
    title: "سعر البيع بالطن / ساعة",
    children: [
      { key: "tonPerHourMin", title: "أدنى", width: "140px" },
      { key: "tonPerHourMax", title: "أعلى", width: "140px" },
    ],
  },
  {
    key: "tonPerDay",
    title: "سعر البيع بالطن / باليوم",
    children: [
      { key: "tonPerDayMin", title: "أدنى", width: "140px" },
      { key: "tonPerDayMax", title: "أعلى", width: "140px" },
    ],
  },
  {
    key: "tonPerWeek",
    title: "سعر البيع بالطن / بالاسبوع",
    children: [
      { key: "tonPerWeekMin", title: "أدنى", width: "140px" },
      { key: "tonPerWeekMax", title: "أعلى", width: "140px" },
    ],
  },
  {
    key: "tonPerMonth",
    title: "سعر البيع بالطن / بالشهر",
    children: [
      { key: "tonPerMonthMin", title: "أدنى", width: "140px" },
      { key: "tonPerMonthMax", title: "أعلى", width: "140px" },
    ],
  },
];

const bulkEditMode = ref<BulkEditMode>("percentage");
const bulkEditDirection = ref<BulkEditDirection>("increase");
const bulkEditAmount = ref<number | null>(10);

const applyBulkEdit = () => {
  const amount = Math.abs(Number(bulkEditAmount.value));
  if (!Number.isFinite(amount) || amount === 0) return;

  const applyToValue = (value: number | null) => {
    const base = Number(value ?? 0);
    if (!Number.isFinite(base)) return 0;

    let next = base;
    if (bulkEditMode.value === "percentage") {
      const factor = amount / 100;
      next = bulkEditDirection.value === "increase" ? base * (1 + factor) : base * (1 - factor);
    } else {
      next = bulkEditDirection.value === "increase" ? base + amount : base - amount;
    }

    if (!Number.isFinite(next)) return base;
    next = Math.max(0, Math.round(next * 100) / 100);
    return next;
  };

  const fields: ProductionCapacityNumericField[] = [
    "tonPerHourMin",
    "tonPerHourMax",
    "tonPerDayMin",
    "tonPerDayMax",
    "tonPerWeekMin",
    "tonPerWeekMax",
    "tonPerMonthMin",
    "tonPerMonthMax",
  ];

  rows.value.forEach((r) => {
    fields.forEach((f) => {
      r[f] = applyToValue(r[f]);
    });
  });
};

const addRow = () => {
  rows.value.push(createEmptyRow());
};

const removeRow = (rowId: number) => {
  rows.value = rows.value.filter((r) => r.id !== rowId);
  if (rows.value.length === 0) {
    rows.value.push(createEmptyRow());
  }
};

const handleDeleteRow = (item: EditableTableItem) => {
  const rowId = typeof item.id === "number" ? item.id : Number(item.id);
  if (Number.isNaN(rowId)) return;
  removeRow(rowId);
};

const handleSave = () => {
  console.log("Save production capacity", {
    name: capacityListName.value,
    rows: rows.value,
  });
};
</script>

<template>
  <default-layout>
    <div class="production-capacity-page">
      <PageHeader :icon="productionCapacityIcon" title-key="pages.productionCapacity.title"
        description-key="pages.productionCapacity.description" />

      <div class="-mx-6">
        <div class="pb-2">
          <div class="px-4 py-3">
            <div class="flex flex-col md:flex-row gap-5 md:items-center">
              <div class="text-lg font-bold text-gray-900">تعديل الكل</div>

              <div class="flex flex-wrap items-center gap-3">
                <div class="p-2 bg-gray-50 border border-gray-100 rounded-lg">
                  <v-btn-toggle v-model="bulkEditMode" mandatory density="comfortable" color="primary" class="gap-2">
                    <v-btn value="percentage" variant="flat" class="px-6">نسبة</v-btn>
                    <v-btn value="value" variant="flat" class="px-6">قيمة</v-btn>
                  </v-btn-toggle>
                </div>

                <div class="w-[120px]">
                  <PriceInput v-model="bulkEditAmount" :hide-details="true" :input-props="{ class: 'bg-white' }"
                    :currency="bulkEditMode === 'percentage' ? '%' : ''" placeholder="10" />
                </div>

                <div class="p-2 bg-gray-50 border border-gray-100 rounded-lg">
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

                <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base"
                  @click="applyBulkEdit">
                  تطبيق
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3">
          <div class="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div class="min-w-[250px]">
              <TextInput v-model="capacityListName" placeholder="اسم قائمة القدرة الإنتاجية" :hide-details="true"
                :input-props="{ class: 'bg-white rounded-lg' }" />
            </div>
            <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base"
              prepend-icon="mdi-plus" @click="addRow">
              إضافة منتج
            </v-btn>
          </div>
        </div>

        <EditableDataTable :headers="tableHeaders" :items="rows" :show-actions="true" :show-delete="true" show-checkbox
          @delete="handleDeleteRow">
          <template #item.rowNumber="{ rowIndex }">
            <span class="text-sm text-gray-600">{{ rowIndex + 1 }}</span>
          </template>

          <template #item.productId="{ item }">
            <SelectInput v-model="item.productId" :items="productItems" placeholder="اختر المنتج" :hide-details="true"
              :input-props="{ class: 'bg-white min-w-[250px]' }" />
          </template>

          <template #item.tonPerHourMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerHourMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerHourMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerHourMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerDayMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerDayMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerDayMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerDayMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerWeekMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerWeekMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerWeekMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerWeekMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerMonthMin="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerMonthMin" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>

          <template #item.tonPerMonthMax="{ item }">
            <div class="w-[80px]">
              <PriceInput v-model="item.tonPerMonthMax" placeholder="0" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>
          </template>
        </EditableDataTable>

        <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6">
          <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
            @click="handleSave">
            <template #prepend>
              <v-icon>mdi-content-save-all-outline</v-icon>
            </template>
            حفظ
          </v-btn>
          <v-btn variant="flat" color="primary-50" height="44"
            class="font-semibold text-base text-primary-700 sm:min-w-[200px]">
            <template #prepend>
              <v-icon>mdi-close</v-icon>
            </template>
            اغلاق
          </v-btn>
        </div>
      </div>
    </div>
  </default-layout>
</template>
