<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';

const { t } = useI18n()

const router = useRouter();

// Projects icon
const projectsIcon = `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M33.4167 32.3333H9.58333M33.4167 23.6667H9.58333M2 15H41M12.4 2H30.6C34.2403 2 36.0605 2 37.4509 2.70846C38.674 3.33163 39.6684 4.32601 40.2915 5.54906C41 6.93949 41 8.75966 41 12.4V30.6C41 34.2403 41 36.0605 40.2915 37.4509C39.6684 38.674 38.674 39.6684 37.4509 40.2915C36.0605 41 34.2403 41 30.6 41H12.4C8.75966 41 6.93949 41 5.54906 40.2915C4.32601 39.6684 3.33163 38.674 2.70846 37.4509C2 36.0605 2 34.2403 2 30.6V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const importIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 11V12C16 13.4001 16 14.1002 15.7275 14.635C15.4878 15.1054 15.1054 15.4878 14.635 15.7275C14.1002 16 13.4001 16 12 16H5C3.59987 16 2.8998 16 2.36502 15.7275C1.89462 15.4878 1.51217 15.1054 1.27248 14.635C1 14.1002 1 13.4001 1 12V11M12.6667 6.83333L8.5 11M8.5 11L4.33333 6.83333M8.5 11V1" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const filterIcon = `<svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 6H14M1.5 1H16.5M6.5 11H11.5" stroke="#344054" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const refreshIcon = `<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.66699 7.5C1.66699 7.5 3.33366 5.83333 5.83366 3.33333C8.33366 0.833333 11.667 0.833333 14.167 3.33333C16.667 5.83333 16.667 9.16667 14.167 11.6667C11.667 14.1667 8.33366 14.1667 5.83366 11.6667C4.58366 10.4167 3.95866 8.75 4.16699 7.08333M1.66699 7.5V2.5M1.66699 7.5H6.66699" stroke="#344054" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Projects table data
const tableHeaders = [
    { key: "projectName", title: "اسم المشروع", width: "150px" },
    { key: "projectCode", title: "كود المشروع", width: "120px" },
    { key: "startDate", title: "تاريخ البدء", width: "130px" },
    { key: "endDate", title: "تاريخ الانتهاء", width: "130px" },
    { key: "type", title: "النوع", width: "100px" },
    { key: "name", title: "الاسم", width: "120px" },
    { key: "address", title: "العنوان", width: "120px" },
    { key: "status", title: "الحالة", width: "120px" },
];

const tableItems = ref([
    {
        id: 1,
        projectName: "CASD",
        projectCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "الرياض",
        status: "مكتمل",
    },
    {
        id: 2,
        projectName: "QALLAB",
        projectCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "مكة",
        status: "قيد المراجعة",
    },
    {
        id: 3,
        projectName: "YSTW",
        projectCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "جدة",
        status: "تأكيد",
    },
    {
        id: 4,
        projectName: "QALLAB",
        projectCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "تبوك",
        status: "الغاء",
    },
]);

// Selection state
const selectedProjects = ref<number[]>([]);
const hasSelectedProjects = computed(() => selectedProjects.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterProjectNumber = ref("");
const filterNameArabic = ref("");
const filterNameEnglish = ref("");
const filterStartDateMin = ref("");
const filterStartDateMax = ref("");

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterProjectNumber.value = "";
    filterNameArabic.value = "";
    filterNameEnglish.value = "";
    filterStartDateMin.value = "";
    filterStartDateMax.value = "";
};

const applyFilters = () => {
    console.log("Applying filters...");
};

// Handlers
const handleEdit = (item: any) => {
    router.push({ name: "ProjectsEdit", params: { id: item.id } });
};

const handleDelete = (item: any) => {
    tableItems.value = tableItems.value.filter((t) => t.id !== item.id);
};

const handleSelectProject = (item: any, selected: boolean) => {
    if (selected) {
        selectedProjects.value.push(item.id);
    } else {
        selectedProjects.value = selectedProjects.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllProjects = (checked: boolean) => {
    if (checked) {
        selectedProjects.value = tableItems.value.map((item) => item.id);
    } else {
        selectedProjects.value = [];
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'مكتمل':
            return 'bg-[#ECFDF3] text-[#027A48]';
        case 'قيد المراجعة':
            return 'bg-[#FEF0C7] text-[#DC6803]';
        case 'تأكيد':
            return 'bg-[#F2F4F7] text-[#344054]';
        case 'الغاء':
            return 'bg-[#FEE4E2] text-[#D92D20]';
        default:
            return 'bg-[#F2F4F7] text-[#344054]';
    }
};

const openCreateProject = () => {
    router.push({ name: "ProjectsCreate" });
};

</script>

<template>
    <default-layout>
        <div class="projects-page">
            <PageHeader :icon="projectsIcon" title-key="pages.projects.title"
                description-key="pages.projects.description" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
                    :prepend-icon="importIcon" :label="t('common.import')" />
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" :label="t('common.export')" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedProjects ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="hasSelectedProjects"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')" />
                    </div>

                    <!-- Main header controls -->
                    <div class="flex flex-wrap gap-3">
                        <ButtonWithIcon variant="outlined" append-icon="mdi-chevron-down" rounded="4" color="gray-500"
                            height="40" custom-class="font-semibold text-base border-gray-400"
                            :prepend-icon="columnIcon" :label="t('common.columns')">
                            <template #append>
                                <v-icon>mdi-chevron-down</v-icon>
                            </template>
                        </ButtonWithIcon>
                        
                        <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف مشروع" @click="openCreateProject" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3">
                    <div class="flex flex-wrap gap-3 items-end">
                        <v-text-field v-model="filterProjectNumber" density="comfortable" variant="outlined"
                            hide-details placeholder="رقم المشروع" class="w-full sm:w-40 bg-white" />
                        <v-text-field v-model="filterNameEnglish" density="comfortable" variant="outlined" hide-details
                            placeholder="الاسم بالانجليزية" class="w-full sm:w-40 bg-white" />
                        <v-text-field v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
                            placeholder="الاسم بالعربية" class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterStartDateMin" density="comfortable"
                            hide-details placeholder="اقل تاريخ بدء" class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterStartDateMax" density="comfortable"
                            hide-details placeholder="اعلى تاريخ بدء" class="w-full sm:w-40 bg-white" />
                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />
                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" label="إعادة تعيين" />
                        </div>
                    </div>
                </div>

                <!-- Projects Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" show-checkbox show-actions @edit="handleEdit"
                    @delete="handleDelete" @select="handleSelectProject" @selectAll="handleSelectAllProjects">
                    <template #item.status="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium', getStatusClass(item.status)]">
                            {{ item.status }}
                        </span>
                    </template>
                </DataTable>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
