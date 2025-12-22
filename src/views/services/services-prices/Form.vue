<script setup lang="ts">
import { ref } from "vue";

interface ServicePriceRow {
  id: number;
  serviceId: number | null;
  maxPrice: number | null;
  minPrice: number | null;
}

type EditableTableItem = {
  id: string | number;
  [key: string]: any;
};

type BulkEditMode = "percentage" | "value";
type BulkEditDirection = "increase" | "decrease";

const priceListIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.8333 6.5C8.4401 6.5 6.5 8.4401 6.5 10.8333V41.1667C6.5 43.5599 8.4401 45.5 10.8333 45.5H41.1667C43.5599 45.5 45.5 43.5599 45.5 41.1667V10.8333C45.5 8.4401 43.5599 6.5 41.1667 6.5H10.8333ZM15.1667 18.4167C15.1667 17.2201 16.1367 16.25 17.3333 16.25H34.6667C35.8633 16.25 36.8333 17.2201 36.8333 18.4167C36.8333 19.6133 35.8633 20.5833 34.6667 20.5833H17.3333C16.1367 20.5833 15.1667 19.6133 15.1667 18.4167ZM15.1667 29.25C15.1667 28.0534 16.1367 27.0833 17.3333 27.0833H34.6667C35.8633 27.0833 36.8333 28.0534 36.8333 29.25C36.8333 30.4466 35.8633 31.4167 34.6667 31.4167H17.3333C16.1367 31.4167 15.1667 30.4466 15.1667 29.25Z" fill="#1570EF"/>
</svg>`;

const serviceName = ref("");

const serviceItems = ref([
  { title: "خدمة استشارية", value: 1 },
  { title: "خدمة صيانة", value: 2 },
  { title: "خدمة تركيب", value: 3 },
]);

const nextRowId = ref(1);

const createEmptyRow = (): ServicePriceRow => ({
  id: nextRowId.value++,
  serviceId: null,
  maxPrice: null,
  minPrice: null,
});

const rows = ref<ServicePriceRow[]>([createEmptyRow()]);

const tableHeaders = [
  { key: "rowNumber", title: "#", width: "70px" },
  { key: "serviceId", title: "المنتج" },
  { key: "maxPrice", title: "أعلى سعر", width: "150px" },
  { key: "minPrice", title: "أدنى سعر", width: "150px" },
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

  rows.value.forEach((r) => {
    r.maxPrice = applyToValue(r.maxPrice);
    r.minPrice = applyToValue(r.minPrice);
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
  console.log("Save services price list", {
    name: serviceName.value,
    rows: rows.value,
  });
};
</script>

<template>
  <default-layout>
    <div class="services-price-list-page">
      <PageHeader :icon="priceListIcon" title-key="pages.servicePricesList.title"
        description-key="pages.servicePricesList.description" />

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
              <TextInput v-model="serviceName" placeholder="اسم قائمة السعر" :hide-details="true"
                :input-props="{ class: 'bg-white' }" />
            </div>

            <v-btn variant="flat" color="primary" height="40" class="px-7 font-semibold text-base"
              prepend-icon="mdi-plus" @click="addRow">
              إضافة خدمة
            </v-btn>
          </div>
        </div>
        <EditableDataTable :headers="tableHeaders" :items="rows" :show-actions="true" :show-delete="true" show-checkbox
          @delete="handleDeleteRow">
          <template #item.rowNumber="{ rowIndex }">
            <span class="text-sm text-gray-600">{{ rowIndex + 1 }}</span>
          </template>

          <template #item.serviceId="{ item }">
            <SelectInput v-model="item.serviceId" :items="serviceItems" placeholder="اختر المنتج" :hide-details="true"
              :input-props="{ class: 'bg-white max-w-[350px]' }" />
          </template>

          <template #item.maxPrice="{ item }">
            <PriceInput v-model="item.maxPrice" placeholder="60"
              :hide-details="true" :input-props="{ class: 'bg-white md:min-w-[200px]' }" />
          </template>

          <template #item.minPrice="{ item }">
            <PriceInput v-model="item.minPrice" placeholder="60"
              :hide-details="true" :input-props="{ class: 'bg-white md:min-w-[200px]' }" />
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

<style scoped></style>
