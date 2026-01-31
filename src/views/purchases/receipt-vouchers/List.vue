<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { GridIcon, fileCheckIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon, homeIcon } from "@/components/icons/globalIcons";
const { t } = useI18n()

const router = useRouter();

const showChangeStatusDialog = ref(false)
const selectedStatus = ref(null)

// Receipt Vouchers table data
const tableHeaders = [
    { key: "voucherCode", title: "كود السند", width: "150px" },
    { key: "purchaseCode", title: "كود طلبية المشتريات", width: "150px" },
    { key: "voucherDate", title: "تاريخ السند", width: "130px" },
    { key: "receiptDate", title: "تاريخ الاستلام", width: "130px" },
    { key: "status", title: "الحالة", width: "120px" },
];

const tableItems = ref([
    {
        id: 1,
        voucherCode: "#124098",
        purchaseCode: "#124098",
        voucherDate: "22/07/2025",
        receiptDate: "22/07/2025",
        status: "مكتمل",
    },
    {
        id: 2,
        voucherCode: "#124099",
        purchaseCode: "#124099",
        voucherDate: "22/07/2025",
        receiptDate: "22/07/2025",
        status: "قيد المراجعة",
    },
    {
        id: 3,
        voucherCode: "#124100",
        purchaseCode: "#124100",
        voucherDate: "22/07/2025",
        receiptDate: "22/07/2025",
        status: "تأكيد",
    },
]);

// Selection state
const selectedVouchers = ref<number[]>([]);
const hasSelectedVouchers = computed(() => selectedVouchers.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterVoucherCode = ref("");
const filterPurchaseCode = ref("");
const filterStatus = ref(null);
const filterStartDate = ref("");
const filterEndDate = ref("");

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterVoucherCode.value = "";
    filterPurchaseCode.value = "";
    filterStatus.value = null;
    filterStartDate.value = "";
    filterEndDate.value = "";
};

const applyFilters = () => {
    console.log("Applying filters...");
};

// Handlers
const handleEdit = (item: any) => {
    router.push({ name: "ReceiptVouchersEdit", params: { id: item.id } });
};

const handleDelete = (item: any) => {
    tableItems.value = tableItems.value.filter((t) => t.id !== item.id);
};

const handleSelectVoucher = (item: any, selected: boolean) => {
    if (selected) {
        selectedVouchers.value.push(item.id);
    } else {
        selectedVouchers.value = selectedVouchers.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllVouchers = (checked: boolean) => {
    if (checked) {
        selectedVouchers.value = tableItems.value.map((item) => item.id);
    } else {
        selectedVouchers.value = [];
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

const openCreateVoucher = () => {
    router.push({ name: "ReceiptVouchersCreate" });
};

</script>

<template>
    <default-layout>
        <div class="receipt-vouchers-page">
            <!-- Breadcrumb -->
            <div class="flex items-center gap-3 text-sm px-3 pb-5 pt-2">
                <router-link to="/" class="text-gray-500 hover:text-primary-600">
                    <span v-html="homeIcon"></span>
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <span class="text-gray-600">
                    المشتريات
                </span>
                <span class="text-lg text-gray-300">/</span>
                <router-link to="/purchases/orders/material-product/list" class="text-gray-600 hover:text-primary-600">
                    قائمة طلبيات المشتريات
                </router-link>
                <span class="text-lg text-gray-300">/</span>

                <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">جدول سندات الأستلام</span>
            </div>

            <PageHeader :icon="GridIcon" title-key="pages.ReceiptVouchers.title"
                class="-mx-6 px-6 py-6 border-y !border-gray-200" description-key="pages.ReceiptVouchers.description" />

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
                <div :class="hasSelectedVouchers ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="hasSelectedVouchers"
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
                            :prepend-icon="plusIcon" label="أضف سند استلام" @click="openCreateVoucher" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterVoucherCode" density="comfortable" variant="outlined" hide-details
                            placeholder="كود السند" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterPurchaseCode" density="comfortable" variant="outlined" hide-details
                            placeholder="كود طلبية المشتريات" class="w-full sm:w-40 bg-white" />
                        <SelectInput :items="['مكتمل', 'قيد المراجعة', 'تأكيد']" v-model="filterStatus"
                            density="comfortable" variant="outlined" hide-details placeholder="الحالة"
                            class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterStartDate" density="comfortable" hide-details
                            placeholder="تاريخ البداية" class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterEndDate" density="comfortable" hide-details
                            placeholder="تاريخ النهاية" class="w-full sm:w-40 bg-white" />
                    </div>
                    <div class="flex gap-2 items-center">
                        <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                            custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                            :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />
                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                            custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                            prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
                    </div>
                </div>

                <!-- Receipt Vouchers Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" show-checkbox show-actions force-show-delete
                    force-show-edit force-show-view @edit="handleEdit" @delete="handleDelete" smallButtons
                    @select="handleSelectVoucher" @selectAll="handleSelectAllVouchers">
                    <template #item.status="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(item.status)]">
                            {{ item.status }}
                        </span>
                    </template>
                </DataTable>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
