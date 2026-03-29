<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ProductToAdd } from './AddProductDialog.vue';

type RequestType = 'raw_materials' | 'fuel' | 'transfer_service' | 'logistics' | 'trips' | 'logistics-trips';

type ProductLike = Partial<ProductToAdd> & { item_id: number; item_name: string };

const props = defineProps<{
  modelValue: boolean;
  products: ProductLike[];
  requestType: RequestType;
  transportTypes?: any[];
  unitItems?: any[];
  showUnitPriceAndDiscount?: boolean;
  variant?: 'purchases' | 'sales';
  discountTypeItems?: any[];
  fillingsItems?: any[];
  supplyTypeItems?: any[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "productsUpdated": [products: ProductToAdd[]];
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
});

const isSalesMode = computed(() => (props.variant || 'purchases') === 'sales');
const showPricingFields = computed(() => isSalesMode.value || !!props.showUnitPriceAndDiscount);

const unitItemsList = computed(() => props.unitItems || []);
const packageTypeItemsList = computed(() => props.transportTypes || []);
const fillingsOptionsList = computed(() => props.fillingsItems || []);
const supplyTypeOptionsList = computed(() => props.supplyTypeItems || []);
const discountTypeOptionsList = computed(() => {
  if (props.discountTypeItems && props.discountTypeItems.length > 0) {
    return props.discountTypeItems;
  }
  return [
    { title: '%', value: 1 },
    { title: 'ريال', value: 2 },
  ];
});

const matchDiscountType = (val: any): number | string | null => {
  if (val == null) return null;
  const opts = discountTypeOptionsList.value;
  const exact = opts.find((o: any) => o.value === val);
  if (exact) return exact.value;
  const loose = opts.find((o: any) => String(o.value) === String(val));
  return loose ? loose.value : val;
};

const editableProducts = ref<ProductToAdd[]>([]);

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    editableProducts.value = props.products.map(p => {
      const raw = p as any;
      return {
        item_id: p.item_id,
        item_name: p.item_name,
        unit_id: p.unit_id ?? null,
        unit_name: p.unit_name ?? '',
        quantity: p.quantity ?? null,
        transport_type: p.transport_type != null
          ? (Array.isArray(p.transport_type) ? [...p.transport_type] : p.transport_type)
          : null,
        transport_type_name: p.transport_type_name ?? '',
        transport_type_names: p.transport_type_names ?? '',
        transport_no: (p.transport_no ?? null) as number | null,
        trip_no: p.trip_no ?? null,
        from_date: p.from_date ?? null,
        trip_date: p.trip_date ?? null,
        trip_price: (p.trip_price ?? null) as number | null,
        notes: p.notes ?? '',
        isAdded: p.isAdded,
        id: p.id,
        unit_price: p.unit_price ?? raw.price_per_unit ?? null,
        discount: p.discount ?? raw.discount_val ?? null,
        discount_type: matchDiscountType(p.discount_type),
        supply_type: raw.supply_type ?? null,
      } as ProductToAdd;
    });
  }
});

const handleDeleteProduct = (index: number) => {
  editableProducts.value.splice(index, 1);
};

const resolveNames = (product: ProductToAdd): ProductToAdd => {
  const unit = unitItemsList.value.find((u: any) => u.value === product.unit_id);
  const result = { ...product, unit_name: unit?.title ?? product.unit_name ?? '' };

  const tt = product.transport_type;
  if (Array.isArray(tt) && tt.length > 0) {
    result.transport_type_names = tt
      .map((id: number) => packageTypeItemsList.value.find((t: any) => t.value === id)?.title)
      .filter(Boolean)
      .join(', ');
  } else {
    const single = tt == null ? null : (Array.isArray(tt) ? tt[0] : tt);
    const filling = fillingsOptionsList.value.find((f: any) => f.value === single);
    const transport = packageTypeItemsList.value.find((t: any) => t.value === single);
    result.transport_type_name = filling?.title ?? transport?.title ?? product.transport_type_name ?? '';
  }

  const st = (product as any).supply_type;
  if (st != null) {
    const supply = supplyTypeOptionsList.value.find((s: any) => s.value === st);
    (result as any).supply_type_name = supply?.title ?? (product as any).supply_type_name ?? '';
  }

  (result as any).price_per_unit = product.unit_price;
  (result as any).discount_val = product.discount;
  result.isAdded = true;

  return result;
};

const handleSave = () => {
  const resolved = editableProducts.value.map(resolveNames);
  emit('productsUpdated', resolved);
  closeDialog();
};

const closeDialog = () => {
  internalOpen.value = false;
  editableProducts.value = [];
};

const handleCancel = () => {
  closeDialog();
};

const cubeIcon = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.5 6.13379L9.99997 10.856M9.99997 10.856L1.49997 6.13379M9.99997 10.856L10 20.356M19 14.9146V6.79749C19 6.45484 19 6.28352 18.9495 6.13072C18.9049 5.99555 18.8318 5.87147 18.7354 5.76678C18.6263 5.64844 18.4766 5.56524 18.177 5.39883L10.777 1.28772C10.4934 1.13017 10.3516 1.05139 10.2015 1.0205C10.0685 0.993166 9.93146 0.993166 9.79855 1.0205C9.64838 1.05139 9.50658 1.13017 9.22297 1.28772L1.82297 5.39884C1.52345 5.56524 1.37369 5.64844 1.26463 5.76678C1.16816 5.87147 1.09515 5.99555 1.05048 6.13073C1 6.28352 1 6.45485 1 6.79749V14.9146C1 15.2572 1 15.4286 1.05048 15.5814C1.09515 15.7165 1.16816 15.8406 1.26463 15.9453C1.37369 16.0636 1.52345 16.1468 1.82297 16.3132L9.22297 20.4244C9.50658 20.5819 9.64838 20.6607 9.79855 20.6916C9.93146 20.7189 10.0685 20.7189 10.2015 20.6916C10.3516 20.6607 10.4934 20.5819 10.777 20.4244L18.177 16.3132C18.4766 16.1468 18.6263 16.0636 18.7354 15.9453C18.8318 15.8406 18.9049 15.7165 18.9495 15.5814C19 15.4286 19 15.2572 19 14.9146Z" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.5 5H3.16667M3.16667 5H16.5M3.16667 5V16.6667C3.16667 17.1087 3.34226 17.5326 3.65482 17.8452C3.96738 18.1577 4.39131 18.3333 4.83333 18.3333H13.1667C13.6087 18.3333 14.0326 18.1577 14.3452 17.8452C14.6577 17.5326 14.8333 17.1087 14.8333 16.6667V5M5.66667 5V3.33333C5.66667 2.89131 5.84226 2.46738 6.15482 2.15482C6.46738 1.84226 6.89131 1.66667 7.33333 1.66667H10.6667C11.1087 1.66667 11.5326 1.84226 11.8452 2.15482C12.1577 2.46738 12.3333 2.89131 12.3333 3.33333V5M7.33333 9.16667V14.1667M10.6667 9.16667V14.1667" stroke="#F04438" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <AppDialog v-model="internalOpen" :max-width="900">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="!bg-gray-50 border border-gray-100 rounded px-1 py-0.5 text-gray-600">
          <span v-html="cubeIcon"></span>
        </span>
        تعديل المنتجات
      </div>
    </template>

    <div v-if="editableProducts.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <v-icon size="64" color="gray-400">mdi-package-variant-closed</v-icon>
      <p class="mt-4 text-lg font-medium">لا توجد منتجات للتعديل</p>
    </div>

    <div v-else class="space-y-3 max-h-[500px] overflow-auto custom-scroll">
      <div v-for="(product, index) in editableProducts" :key="product.item_id" class="flex gap-3 rounded-lg border !border-gray-100 p-3 bg-white">
        <div class="flex items-start justify-center pt-2">
          <button type="button" class="text-red-500 hover:text-red-700 p-1" @click="handleDeleteProduct(index)">
            <span v-html="trashIcon"></span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center gap-3 flex-1">
          <div class="sm:col-span-2 md:col-span-4 font-medium text-gray-900">
            {{ product.item_name }}
          </div>

          <div>
            <PriceInput
              v-model="product.quantity"
              placeholder="الكمية"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div>
            <SelectInput
              v-model="product.unit_id"
              :items="unitItemsList"
              placeholder="الوحدة"
              density="compact"
              class="min-w-[170px]"
              item-title="title"
              item-value="value"
            />
          </div>

          <div v-if="requestType === 'fuel'">
            <SelectInput
              v-model="product.transport_type"
              :items="fillingsOptionsList"
              placeholder="التعبئة"
              density="compact"
              class="min-w-[170px]"
              item-title="title"
              item-value="value"
            />
          </div>

          <div v-if="requestType === 'fuel'">
            <SelectInput
              :model-value="(product as any).supply_type ?? null"
              @update:model-value="(v: any) => { (product as any).supply_type = Array.isArray(v) ? v[0] : v }"
              :items="supplyTypeOptionsList"
              placeholder="نوع التوريد"
              density="compact"
              class="min-w-[170px]"
              item-title="title"
              item-value="value"
            />
          </div>

          <div v-if="showPricingFields">
            <PriceInput
              v-model="product.unit_price"
              placeholder="سعر الوحدة"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="showPricingFields">
            <TextInputWithSelect
              v-model="product.discount"
              v-model:selectValue="product.discount_type"
              type="number"
              placeholder="الخصم"
              density="compact"
              select-width="75px"
              :select-items="discountTypeOptionsList"
              select-placeholder="اختر"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="!showPricingFields && (requestType === 'raw_materials' || requestType === 'logistics')">
            <PriceInput
              v-model="product.trip_no"
              placeholder="عدد الرحلات"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="requestType === 'logistics'">
            <DatePickerInput
              v-model="product.from_date"
              placeholder="تاريخ بداية النقل"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="!showPricingFields && (requestType === 'raw_materials' || requestType === 'trips')">
            <SelectInput
              v-model="product.transport_type"
              :items="packageTypeItemsList"
              placeholder="نوع الناقلة"
              density="compact"
              class="min-w-[170px]"
              item-title="title"
              item-value="value"
            />
          </div>

          <div v-if="!showPricingFields && requestType === 'trips'">
            <PriceInput
              v-model="product.transport_no"
              placeholder="عدد الناقلات"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="requestType === 'logistics-trips'">
            <DatePickerInput
              v-model="product.trip_date"
              placeholder="تاريخ الرحلة"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="requestType === 'logistics-trips'">
            <PriceInput
              v-model="product.trip_price"
              showRialIcon
              placeholder="سعر الرحلة"
              density="compact"
              class="min-w-[170px]"
            />
          </div>

          <div v-if="requestType === 'logistics-trips'" class="md:col-span-2">
            <SelectInput
              v-model="product.transport_type"
              :items="packageTypeItemsList"
              placeholder="نوع المركبات"
              density="compact"
              class="min-w-[170px]"
              item-title="title"
              item-value="value"
              multiple
            />
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <div class="flex items-center justify-center gap-4 flex-1 mt-4">
        <ButtonWithIcon
          variant="flat"
          color="primary"
          size="large"
          custom-class="px-8"
          label="حفظ التعديلات"
          @click="handleSave"
        />

        <ButtonWithIcon
          variant="outlined"
          color="gray-700"
          border="gray-300"
          size="large"
          custom-class="px-4"
          label="إلغاء"
          @click="handleCancel"
        />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
:deep(.v-field__input) {
  min-height: 36px !important;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 999px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.custom-scroll::-webkit-scrollbar-button {
  display: none;
  height: 0;
  width: 0;
}
</style>
