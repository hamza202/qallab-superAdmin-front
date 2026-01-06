<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const testMethodologyIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const testMethodologyTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "300px" },
  { key: "description", title: "الوصف", width: "400px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const testMethodologyTableItems = ref([
  {
    id: 1,
    name: "منهجية 1",
    description: "وصف المنهجية الأولى",
    status: "فعال",
  },
  {
    id: 2,
    name: "منهجية 2",
    description: "وصف المنهجية الثانية",
    status: "غير فعال",
  },
  {
    id: 3,
    name: "منهجية 3",
    description: "وصف المنهجية الثالثة",
    status: "فعال",
  },
  {
    id: 4,
    name: "منهجية 4",
    description: "وصف المنهجية الرابعة",
    status: "فعال",
  },
]);

const openCreateTestMethodology = () => {
  router.push("/test-methodology/create");
};

const handleEditTestMethodology = (item: any) => {
  router.push(`/test-methodology/edit/${item.id}`);
};

const handleDeleteTestMethodology = (item: any) => {
  testMethodologyTableItems.value = testMethodologyTableItems.value.filter((t) => t.id !== item.id);
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
    <div class="test-methodology-list-page">
      <PageHeader
        :icon="testMethodologyIcon"
        title-key="منهجية الاختبارات"
        description-key="تمكنك من إدارة منهجية الاختبارات"
      />

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <h3 class="text-lg font-bold text-gray-900">جدول منهجيات الاختبار</h3>

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
              @click="openCreateTestMethodology"
            >
              إضافة منهجية
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
          :headers="testMethodologyTableHeaders"
          :items="testMethodologyTableItems"
          show-actions
          :show-view="false"
          @edit="handleEditTestMethodology"
          @delete="handleDeleteTestMethodology"
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
