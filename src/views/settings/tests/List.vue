<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const testIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const testTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "180px" },
  { key: "testCode", title: "كود الاختبار", width: "150px" },
  { key: "testMethod", title: "منهجية الاختبار", width: "180px" },
  { key: "testGroup", title: "مجموعة الاختبار", width: "180px" },
  { key: "unitPrice", title: "سعر الوحدة", width: "120px" },
  { key: "minPrice", title: "أقل سعر", width: "120px" },
  { key: "minQuantity", title: "اقل كمية", width: "120px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const testTableItems = ref([
  {
    id: 1,
    name: "اختبار 1",
    testCode: "IM5_25565",
    testMethod: "منهجية 1",
    testGroup: "مجموعة 1",
    unitPrice: "10",
    minPrice: "5",
    minQuantity: "2",
    status: "فعال",
  },
  {
    id: 2,
    name: "اختبار 2",
    testCode: "IM5_25566",
    testMethod: "منهجية 2",
    testGroup: "مجموعة 2",
    unitPrice: "15",
    minPrice: "8",
    minQuantity: "3",
    status: "غير فعال",
  },
  {
    id: 3,
    name: "اختبار 3",
    testCode: "IM5_25567",
    testMethod: "منهجية 3",
    testGroup: "مجموعة 3",
    unitPrice: "20",
    minPrice: "10",
    minQuantity: "1",
    status: "فعال",
  },
  {
    id: 4,
    name: "اختبار 4",
    testCode: "IM5_25568",
    testMethod: "منهجية 4",
    testGroup: "مجموعة 4",
    unitPrice: "12",
    minPrice: "6",
    minQuantity: "5",
    status: "فعال",
  },
]);

const openCreateTest = () => {
  router.push("/tests/create");
};

const handleEditTest = (item: any) => {
  router.push(`/tests/edit/${item.id}`);
};

const handleDeleteTest = (item: any) => {
  testTableItems.value = testTableItems.value.filter((t) => t.id !== item.id);
};

// filters
const showAdvancedFilters = ref(false);

const filterName = ref("");
const filterTestMethod = ref<string | null>(null);
const filterTestGroup = ref<string | null>(null);
const filterStatus = ref<string | null>(null);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
  filterName.value = "";
  filterTestMethod.value = null;
  filterTestGroup.value = null;
  filterStatus.value = null;
};

const handleSearch = () => {
  console.log('Searching with filters:', { 
    name: filterName.value, 
    testMethod: filterTestMethod.value,
    testGroup: filterTestGroup.value,
    status: filterStatus.value 
  });
};

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6666 4.16668V3.50001C11.6666 2.56659 11.6666 2.09988 11.4849 1.74336C11.3251 1.42976 11.0702 1.17479 10.7566 1.015C10.4 0.833344 9.93334 0.833344 8.99992 0.833344H7.66658C6.73316 0.833344 6.26645 0.833344 5.90993 1.015C5.59633 1.17479 5.34136 1.42976 5.18157 1.74336C4.99992 2.09988 4.99992 2.56659 4.99992 3.50001V4.16668M6.66659 8.75001V12.9167M9.99992 8.75001V12.9167M0.833252 4.16668H15.8333M14.1666 4.16668V13.5C14.1666 14.9001 14.1666 15.6002 13.8941 16.135C13.6544 16.6054 13.272 16.9878 12.8016 17.2275C12.2668 17.5 11.5667 17.5 10.1666 17.5H6.49992C5.09979 17.5 4.39972 17.5 3.86494 17.2275C3.39454 16.9878 3.01209 16.6054 2.7724 16.135C2.49992 15.6002 2.49992 14.9001 2.49992 13.5V4.16668" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const edit_05_icon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14662 14.1201C1.18491 13.7755 1.20405 13.6032 1.25618 13.4422C1.30243 13.2993 1.36778 13.1633 1.45045 13.038C1.54363 12.8967 1.66621 12.7741 1.91136 12.5289L12.9166 1.5237C13.8371 0.603225 15.3295 0.603226 16.2499 1.5237C17.1704 2.44417 17.1704 3.93656 16.2499 4.85703L5.24469 15.8623C4.99954 16.1074 4.87696 16.23 4.73566 16.3232C4.61029 16.4058 4.47433 16.4712 4.33146 16.5174C4.17042 16.5696 3.99813 16.5887 3.65356 16.627L0.833252 16.9404L1.14662 14.1201Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <default-layout>
    <div class="tests-list-page">
      <PageHeader
        :icon="testIcon"
        title-key="الاختبارات"
        description-key="تمكنك من إدارة الاختبارات"
      />

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <h3 class="text-lg font-bold text-gray-900">جدول الاختبارات</h3>

          <!-- Main header controls -->
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
              @click="openCreateTest"
            >
              إضافة اختبار
            </v-btn>
          </div>
        </div>

        <!-- Advanced filters row -->
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
              v-model="filterTestMethod"
              :items="['منهجية 1', 'منهجية 2', 'منهجية 3']"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="منهجية الاختبار"
              class="w-full sm:w-40 bg-white"
            />
            <v-select
              v-model="filterTestGroup"
              :items="['مجموعة 1', 'مجموعة 2', 'مجموعة 3']"
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="مجموعة الاختبار"
              class="w-full sm:w-40 bg-white"
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
          :headers="testTableHeaders"
          :items="testTableItems"
          show-actions
          :show-view="false"
          @edit="handleEditTest"
          @delete="handleDeleteTest"
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

<style scoped></style>
