<script setup lang="ts">
import { ref } from "vue";
import TaxRuleFormDialog from "@/views/settings/tax-rules/components/TaxRuleFormDialog.vue";

const taxRulesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;

const taxRulesTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "200px" },
  { key: "type", title: "النوع", width: "140px" },
  { key: "description", title: "الوصف", width: "220px" },
  { key: "createdAt", title: "تاريخ الإنشاء", width: "160px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const taxRulesTableItems = ref([
  {
    id: 1,
    name: "اسم المنتج",
    nameEn: "Product Name",
    type: "AfGEHJ",
    description: "قصبة",
    key: "TAX_RULE_1",
    example: "مثال 1",
    autoApply: true,
    createdAt: "13 Dec 2025",
    status: "نشطة",
  },
  {
    id: 2,
    name: "اسم المنتج",
    nameEn: "Product Name",
    type: "AfGEHJ",
    description: "قصبة",
    key: "TAX_RULE_2",
    example: "مثال 2",
    autoApply: true,
    createdAt: "13 Dec 2025",
    status: "نشطة",
  },
]);

const showTaxRuleDialog = ref(false);
const editingTaxRule = ref<any | null>(null);

const openCreateTaxRule = () => {
  editingTaxRule.value = null;
  showTaxRuleDialog.value = true;
};

const handleEditTaxRule = (item: any) => {
  editingTaxRule.value = {
    id: item.id,
    nameAr: item.name,
    nameEn: item.nameEn,
    type: item.type,
    key: item.key,
    description: item.description,
    example: item.example,
    autoApply: item.autoApply,
    status: item.status === "نشطة",
  };

  showTaxRuleDialog.value = true;
};

const handleDeleteTaxRule = (item: any) => {
  taxRulesTableItems.value = taxRulesTableItems.value.filter((t) => t.id !== item.id);
};

const handleSaveTaxRule = (payload: any) => {
  if (editingTaxRule.value && editingTaxRule.value.id) {
    const index = taxRulesTableItems.value.findIndex((t) => t.id === editingTaxRule.value.id);
    if (index !== -1) {
      taxRulesTableItems.value[index] = {
        ...taxRulesTableItems.value[index],
        name: payload.nameAr,
        nameEn: payload.nameEn,
        type: payload.type,
        key: payload.key,
        description: payload.description,
        example: payload.example,
        autoApply: payload.autoApply,
        status: payload.status ? "نشطة" : "غير نشطة",
      };
    }
  } else {
    const nextId = taxRulesTableItems.value.length
      ? Math.max(...taxRulesTableItems.value.map((t) => t.id)) + 1
      : 1;

    taxRulesTableItems.value.push({
      id: nextId,
      name: payload.nameAr,
      nameEn: payload.nameEn,
      type: payload.type,
      key: payload.key,
      description: payload.description,
      example: payload.example,
      autoApply: payload.autoApply,
      createdAt: new Date().toLocaleDateString("ar-EG"),
      status: payload.status ? "نشطة" : "غير نشطة",
    });
  }
};


const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6673 4.16732V3.50065C11.6673 2.56723 11.6673 2.10052 11.4857 1.744C11.3259 1.4304 11.0709 1.17543 10.7573 1.01564C10.4008 0.833984 9.93407 0.833984 9.00065 0.833984H7.66732C6.7339 0.833984 6.26719 0.833984 5.91067 1.01564C5.59706 1.17543 5.3421 1.4304 5.18231 1.744C5.00065 2.10052 5.00065 2.56723 5.00065 3.50065V4.16732M6.66732 8.75065V12.9173M10.0007 8.75065V12.9173M0.833984 4.16732H15.834M14.1673 4.16732V13.5007C14.1673 14.9008 14.1673 15.6008 13.8948 16.1356C13.6552 16.606 13.2727 16.9885 12.8023 17.2282C12.2675 17.5007 11.5674 17.5007 10.1673 17.5007H6.50065C5.10052 17.5007 4.40045 17.5007 3.86567 17.2282C3.39527 16.9885 3.01282 16.606 2.77313 16.1356C2.50065 15.6008 2.50065 14.9008 2.50065 13.5007V4.16732" stroke="#4B5565" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="tax-rules-page">
      <PageHeader :icon="taxRulesIcon" title-key="pages.taxRules.title" description-key="pages.taxRules.description" />

      <div class="bg-gray-50 rounded-md mt-4 -mx-6 ">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2">
          <div class="text-sm sm:text-lg font-bold text-gray-900">
            قائمة القواعد الضريبية
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <v-text-field density="comfortable" variant="outlined" hide-details placeholder="بحث"
              prepend-inner-icon="mdi-magnify" class="w-full sm:w-64 bg-white rounded-md" />

            <v-btn variant="outlined" color="primary-50" height="45"
              class="px-4 font-semibold text-sm text-gray-700 bg-white border !border-gray-200"
              prepend-icon="mdi-filter-variant">
              فلتر
            </v-btn>

            <v-btn height="45" icon variant="outlined" color="error-50"
              class="!min-w-0 w-11 h-10 bg-white border !border-gray-200 text-gray-700">
              <span v-html="trashIcon"></span>
            </v-btn>
          </div>
        </div>

        <div
          class="flex flex-wrap sm:items-center flex-col sm:flex-row justify-between gap-3 bg-primary-50 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <div class="flex flex-wrap gap-3 flex-1 justify-end sm:justify-start">
            <v-text-field density="comfortable" variant="outlined" hide-details placeholder="الاسم"
              class="w-full sm:w-52 bg-white" />
            <v-select density="comfortable" variant="outlined" hide-details :items="['النوع 1', 'النوع 2']"
              placeholder="النوع" class="w-full sm:w-40 bg-white" />
            <v-select density="comfortable" variant="outlined" hide-details :items="['نشطة', 'غير نشطة']"
              placeholder="الحالة" class="w-full sm:w-40 bg-white" />
          </div>

          <v-btn variant="flat" color="primary" height="45"
            class="px-6 font-semibold text-sm sm:text-base text-white flex-shrink-0"
            prepend-icon="mdi-plus-circle-outline" @click="openCreateTaxRule">
            قاعدة ضريبية جديدة
          </v-btn>
        </div>

        <DataTable :headers="taxRulesTableHeaders" :items="taxRulesTableItems" show-actions @edit="handleEditTaxRule"
          show-checkbox @delete="handleDeleteTaxRule" />

        <TaxRuleFormDialog v-model="showTaxRuleDialog" :tax-rule="editingTaxRule" @save="handleSaveTaxRule" />
      </div>
    </div>
  </default-layout>
</template>
