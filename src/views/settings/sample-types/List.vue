<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const sampleTypeIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.33594 25.9997L25.2274 36.4455C25.5117 36.5876 25.6538 36.6587 25.8028 36.6866C25.9349 36.7114 26.0703 36.7114 26.2024 36.6866C26.3514 36.6587 26.4935 36.5876 26.7778 36.4455L47.6693 25.9997M4.33594 36.8331L25.2274 47.2788C25.5117 47.4209 25.6538 47.492 25.8028 47.52C25.9349 47.5447 26.0703 47.5447 26.2024 47.52C26.3514 47.492 26.4935 47.4209 26.7778 47.2788L47.6693 36.8331M4.33594 15.1664L25.2274 4.72065C25.5117 4.57854 25.6538 4.50748 25.8028 4.47951C25.9349 4.45475 26.0703 4.45475 26.2024 4.47951C26.3514 4.50748 26.4935 4.57854 26.7778 4.72065L47.6693 15.1664L26.7778 25.6121C26.4935 25.7543 26.3514 25.8253 26.2024 25.8533C26.0703 25.8781 25.9349 25.8781 25.8028 25.8533C25.6538 25.8253 25.5117 25.7543 25.2274 25.6121L4.33594 15.1664Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const sampleTypeTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "300px" },
  { key: "description", title: "الوصف", width: "400px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const sampleTypeTableItems = ref([
  {
    id: 1,
    name: "نوع العينة 1",
    description: "الوصف",
    status: "فعال",
  },
  {
    id: 2,
    name: "نوع العينة 2",
    description: "الوصف",
    status: "غير فعال",
  },
  {
    id: 3,
    name: "نوع العينة 3",
    description: "الوصف",
    status: "فعال",
  },
  {
    id: 4,
    name: "نوع العينة 4",
    description: "الوصف",
    status: "فعال",
  },
]);

const openCreateSampleType = () => {
  router.push("/sample-types/create");
};

const handleEditSampleType = (item: any) => {
  router.push(`/sample-types/edit/${item.id}`);
};

const handleDeleteSampleType = (item: any) => {
  sampleTypeTableItems.value = sampleTypeTableItems.value.filter((t) => t.id !== item.id);
};

const showAdvancedFilters = ref(false);

const filterName = ref("");
const filterStatus = ref("");

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const handleSearch = () => {
  console.log("Searching with filters:", {
    name: filterName.value,
    status: filterStatus.value,
  });
};

const resetFilters = () => {
  filterName.value = "";
  filterStatus.value = "";
};

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M15 13.5V3.5C15 2.72343 15 2.33515 14.8731 2.02886C14.704 1.62048 14.3795 1.29602 13.9711 1.12687C13.6649 1 13.2766 1 12.5 1C11.7234 1 11.3351 1 11.0289 1.12687C10.6205 1.29602 10.296 1.62048 10.1269 2.02886C10 2.33515 10 2.72343 10 3.5V13.5C10 14.2766 10 14.6649 10.1269 14.9711C10.296 15.3795 10.6205 15.704 11.0289 15.8731C11.3351 16 11.7234 16 12.5 16C13.2766 16 13.6649 16 13.9711 15.8731C14.3795 15.704 14.704 15.3795 14.8731 14.9711C15 14.6649 15 14.2766 15 13.5Z"
    stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;
</script>

<template>
  <default-layout>
    <div class="sample-types-list-page">
      <PageHeader
        :icon="sampleTypeIcon"
        title-key="أنواع العينات"
        description-key="تمكنك من إدارة أنواع العينات"
      />

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <h3 class="text-lg font-bold text-gray-900">جدول أنواع العينات</h3>

          <div class="flex flex-wrap gap-3">
            <v-btn
              variant="outlined"
              append-icon="mdi-chevron-down"
              color="gray-500"
              height="40"
              class="font-semibold text-base border-gray-400"
            >
              <template #prepend>
                <span v-html="columnIcon"></span>
              </template>
              الأعمدة
            </v-btn>

            <v-btn
              variant="outlined"
              color="primary-50"
              height="40"
              class="px-7 font-semibold text-base text-primary-700"
              prepend-icon="mdi-magnify"
              @click="toggleAdvancedFilters"
            >
              بحث متقدم
            </v-btn>

            <v-btn
              variant="flat"
              color="primary"
              height="40"
              class="px-7 font-semibold text-base"
              prepend-icon="mdi-plus-circle-outline"
              @click="openCreateSampleType"
            >
              إضافة نوع جديد
            </v-btn>
          </div>
        </div>

        <div
          v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2"
        >
          <div class="flex flex-wrap gap-3 flex-1 order-1 sm:order-2 items-center justify-end sm:justify-start">
            <v-text-field
              v-model="filterName"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="الاسم"
              class="w-full sm:w-60 bg-white"
            />
            <v-select
              v-model="filterStatus"
              :items="['فعال', 'غير فعال']"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="الحالة"
              class="w-full sm:w-40 bg-white"
            />
            <v-btn
              variant="flat"
              color="primary"
              height="40"
              class="font-semibold text-base px-6"
              prepend-icon="mdi-magnify"
              @click="handleSearch"
            >
              بحث
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              height="40"
              class="font-semibold text-base"
              prepend-icon="mdi-refresh"
              @click="resetFilters"
            >
              إعادة تعيين
            </v-btn>
          </div>
        </div>

        <DataTable
          :headers="sampleTypeTableHeaders"
          :items="sampleTypeTableItems"
          show-actions
          :show-view="false"
          @edit="handleEditSampleType"
          @delete="handleDeleteSampleType"
        >
          <template #item.status="{ item }">
            <span
              v-if="item.status === 'فعال'"
              class="inline-flex items-center px-3 py-1 rounded-full bg-success-50 text-success-700 text-sm font-medium"
            >
              فعال
            </span>
            <span
              v-else
              class="inline-flex items-center px-3 py-1 rounded-full bg-error-100 text-error-600 text-sm font-medium"
            >
              غير فعال
            </span>
          </template>
        </DataTable>
      </div>
    </div>
  </default-layout>
</template>
