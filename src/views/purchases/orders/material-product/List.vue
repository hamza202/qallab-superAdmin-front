<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { GridIcon,fileCheckIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";
import { switchHorisinralIcon, refreshIcon, changeStatusIcon } from '@/components/icons/priceOffersIcons'
const { t } = useI18n()

const router = useRouter();

const showChangeStatusDialog = ref(false)
const selectedStatus = ref(null)
// Prices Offers table data
const tableHeaders = [
    { key: "requestName", title: "كود الطلب", width: "150px" },
    { key: "requestCode", title: "نوع الطلب", width: "120px" },
    { key: "startDate", title: "اسم المورد", width: "130px" },
    { key: "endDate", title: "تاريخ الطلب", width: "130px" },
    { key: "type", title: "موقع المشروع", width: "100px" },
    { key: "name", title: "طريقة الدفع", width: "120px" },
    { key: "address", title: "دفعة مقدمة", width: "120px" },
    { key: "status", title: "الحالة", width: "120px" },
];

const tableItems = ref([
    {
        id: 1,
        requestName: "CASD",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "الرياض",
        status: "مكتمل",
    },
    {
        id: 2,
        requestName: "QALLAB",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "مكة",
        status: "قيد المراجعة",
    },
    {
        id: 3,
        requestName: "YSTW",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "جدة",
        status: "تأكيد",
    },
    {
        id: 4,
        requestName: "QALLAB",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "تبوك",
        status: "الغاء",
    },
]);

// Selection state
const selectedRequests = ref<number[]>([]);
const hasselectedRequests = computed(() => selectedRequests.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterRequestNumber = ref("");
const filterNameArabic = ref(null);
const filterNameEnglish = ref("");
const filterStartDateMin = ref("");
const filterStartDateMax = ref("");

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterRequestNumber.value = "";
    filterNameArabic.value = null;
    filterNameEnglish.value = "";
    filterStartDateMin.value = "";
    filterStartDateMax.value = "";
};

const applyFilters = () => {
    console.log("Applying filters...");
};

// Handlers
const handleEdit = (item: any) => {
    router.push({ name: "OrdersMaterialProductEdit", params: { id: item.id } });
};

const handleDelete = (item: any) => {
    tableItems.value = tableItems.value.filter((t) => t.id !== item.id);
};

const handleSelectRequest = (item: any, selected: boolean) => {
    if (selected) {
        selectedRequests.value.push(item.id);
    } else {
        selectedRequests.value = selectedRequests.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllRequests = (checked: boolean) => {
    if (checked) {
        selectedRequests.value = tableItems.value.map((item) => item.id);
    } else {
        selectedRequests.value = [];
    }
};

const handleStatusChange = (status: any) => {
    console.log(status);
    showChangeStatusDialog.value = false;
}
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

const openCreateRequest = () => {
    router.push({ name: "OrdersMaterialProductCreate" });
};

</script>

<template>
    <default-layout>
        <div class="pricesOffers-page">
            <PageHeader :icon="GridIcon" title-key="pages.OrdersMaterialProduct.title"
                description-key="pages.OrdersMaterialProduct.description" />

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
                <div :class="hasselectedRequests ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="hasselectedRequests"
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
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف طلبية" @click="openCreateRequest" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterRequestNumber" density="comfortable" variant="outlined" hide-details
                            placeholder="كود العرض" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterNameEnglish" density="comfortable" variant="outlined" hide-details
                            placeholder="اسم العميل" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
                            placeholder="السعر" class="w-full sm:w-40 bg-white" />
                        <SelectInput :items="['الموقع', 'الموقع']" v-model="filterNameArabic" density="comfortable"
                            variant="outlined" hide-details placeholder="موقع المشروع"
                            class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterStartDateMin" density="comfortable" hide-details
                            placeholder="تاريخ العرض" class="w-full sm:w-40 bg-white" />
                    </div>
                    <div class="flex gap-2 items-center">
                        <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                            custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                            :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />
                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                            custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                            prepend-icon="mdi-refresh" label="إعادة تعيين" />
                    </div>
                </div>

                <!-- Prices Offers Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" show-checkbox show-actions force-show-delete
                    force-show-edit force-show-view @edit="handleEdit" @delete="handleDelete" smallButtons
                    @select="handleSelectRequest" @selectAll="handleSelectAllRequests">
                    <template #item.status="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(item.status)]">
                            {{ item.status }}
                        </span>
                    </template>
                    <template #item.actions="{ item }">
                        <div class="flex items-center">
                            <v-btn icon variant="text" size="x-small">
                                <span v-html="refreshIcon"></span>
                            </v-btn>
                            <v-btn icon variant="text" size="x-small" color="warning-600"
                                @click="showChangeStatusDialog = true">
                                <span v-html="switchHorisinralIcon"></span>
                            </v-btn>
                            <v-btn icon variant="text" size="x-small" color="success-700"
                                @click="">
                                <span class="w-4 font-bold" v-html="fileCheckIcon"></span>
                            </v-btn>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>

        <StatusChangeDialog v-model="showChangeStatusDialog" v-model:selectValue="selectedStatus" title="تغيير الحالة"
            message="تغيير الحالة:" :show-select="true" :select-items="[
                { title: 'قيد المراجعة', value: 'under_review' },
                { title: 'مقبول', value: 'accepted' }
            ]" :dialog-icon="changeStatusIcon" @confirm="handleStatusChange" />

    </default-layout>
</template>

<style scoped></style>