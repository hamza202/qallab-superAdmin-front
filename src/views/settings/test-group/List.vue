<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const testGroupIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const testGroupTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "220px" },
  { key: "mainTestGroup", title: "مجموعة الاختبار الرئيسية", width: "220px" },
  { key: "description", title: "الوصف", width: "300px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const testGroupTableItems = ref([
  {
    id: 1,
    name: "مجموعة 1",
    mainTestGroup: "احدل",
    description: "وصف مجموعة الاختبار الأولى",
    status: "فعال",
  },
  {
    id: 2,
    name: "مجموعة 2",
    mainTestGroup: "مجموعة رئيسية",
    description: "وصف مجموعة الاختبار الثانية",
    status: "غير فعال",
  },
  {
    id: 3,
    name: "مجموعة 3",
    mainTestGroup: "احدل",
    description: "وصف مجموعة الاختبار الثالثة",
    status: "فعال",
  },
  {
    id: 4,
    name: "مجموعة 4",
    mainTestGroup: "مجموعة فرعية",
    description: "وصف مجموعة الاختبار الرابعة",
    status: "فعال",
  },
]);

const openCreateTestGroup = () => {
  router.push("/test-group/create");
};

const handleEditTestGroup = (item: any) => {
  router.push(`/test-group/edit/${item.id}`);
};

const handleDeleteTestGroup = (item: any) => {
  testGroupTableItems.value = testGroupTableItems.value.filter((g) => g.id !== item.id);
};

// filters
const showAdvancedFilters = ref(false);

const filterName = ref("");
const filterStatus = ref<string | null>(null);

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
  filterName.value = "";
  filterStatus.value = null;
};

const handleSearch = () => {
  // Implement search logic here
  console.log('Searching with filters:', { name: filterName.value, status: filterStatus.value });
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
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>

<template>
  <default-layout>
    <div class="test-group-page">
      <PageHeader
        :icon="testGroupIcon"
        title-key="pages.testGroup.title"
        description-key="pages.testGroup.description"
      />
      <div class="flex justify-end pb-2">
        <v-btn
          variant="outlined"
          height="40"
          class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
        >
          <template #prepend>
            <span v-html="exportIcon"></span>
          </template>
          تصدير
        </v-btn>
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3"
        >
          <h3 class="text-lg font-bold text-gray-900">جدول مجموعات الاختبار</h3>

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
              @click="openCreateTestGroup"
            >
              إضافة مجموعة
            </v-btn>
          </div>
        </div>

        <!-- Advanced filters row -->
        <div
          v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2"
        >
          <div class="flex flex-wrap gap-3 flex-1 order-1 sm:order-2 justify-end sm:justify-start">
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
          :headers="testGroupTableHeaders"
          :items="testGroupTableItems"
          :show-view="false"
          show-actions
          @edit="handleEditTestGroup"
          @delete="handleDeleteTestGroup"
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
