<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { GridIcon, refreshIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon ,printerIcon} from "@/components/icons/globalIcons";
import {switcStatusIcon} from '@/components/icons/priceOffersIcons'
const { t } = useI18n()

const router = useRouter();

const showChangeStatusDialog = ref(false)
const selectedStatus = ref(null)

const tableHeaders = [
    { key: "invoiceCode", title: "كود الفاتورة", width: "150px" },
    { key: "supplierName", title: "اسم المورد", width: "200px" },
    { key: "invoiceDate", title: "تاريخ الفاتورة", width: "130px" },
    { key: "totalAmount", title: "إجمالي المبلغ", width: "130px" },
    { key: "paymentStatus", title: "حالة الدفع", width: "120px" },
    { key: "status", title: "الحالة", width: "120px" },
];

const tableItems = ref([
    {
        id: 1,
        invoiceCode: "#267644",
        supplierName: "اسم المورد",
        invoiceDate: "12/07/2026",
        totalAmount: "150",
        paymentStatus: "مكتمل",
        status: "مكتمل",
    },
    {
        id: 2,
        invoiceCode: "#267644",
        supplierName: "محمد احمد",
        invoiceDate: "12/07/2026",
        totalAmount: "150",
        paymentStatus: "قيد المراجعة",
        status: "قيد المراجعة",
    },
    {
        id: 3,
        invoiceCode: "#267644",
        supplierName: "محمد احمد",
        invoiceDate: "12/07/2026",
        totalAmount: "150",
        paymentStatus: "تأكيد",
        status: "تأكيد",
    },
]);

const selectedInvoices = ref<number[]>([]);
const hasSelectedInvoices = computed(() => selectedInvoices.value.length > 0);

const showAdvancedFilters = ref(false);
const filterInvoiceCode = ref("");
const filterSupplierName = ref("");
const filterStatus = ref(null);
const filterStartDate = ref("");
const filterEndDate = ref("");

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterInvoiceCode.value = "";
    filterSupplierName.value = "";
    filterStatus.value = null;
    filterStartDate.value = "";
    filterEndDate.value = "";
};

const applyFilters = () => {
    console.log("Applying filters...");
};

const handleEdit = (item: any) => {
    router.push({ name: "PurchaseInvoicesEdit", params: { id: item.id } });
};

const handleDelete = (item: any) => {
    tableItems.value = tableItems.value.filter((t) => t.id !== item.id);
};

const handleSelectInvoice = (item: any, selected: boolean) => {
    if (selected) {
        selectedInvoices.value.push(item.id);
    } else {
        selectedInvoices.value = selectedInvoices.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllInvoices = (checked: boolean) => {
    if (checked) {
        selectedInvoices.value = tableItems.value.map((item) => item.id);
    } else {
        selectedInvoices.value = [];
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

const openCreateInvoice = () => {
    router.push({ name: "PurchaseInvoicesCreate" });
};

</script>

<template>
    <default-layout>
        <div class="purchase-invoices-page">
            <PageHeader :icon="GridIcon" title-key="pages.PurchaseInvoices.title"
                 description-key="pages.PurchaseInvoices.description" />

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
                <div :class="hasSelectedInvoices ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedInvoices"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')" />
                    </div>

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
                            :prepend-icon="plusIcon" label="أضف فاتورة مشتريات" @click="openCreateInvoice" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterInvoiceCode" density="comfortable" variant="outlined" hide-details
                            placeholder="كود الفاتورة" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterSupplierName" density="comfortable" variant="outlined" hide-details
                            placeholder="اسم المورد" class="w-full sm:w-40 bg-white" />
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

                <DataTable :headers="tableHeaders" :items="tableItems" show-checkbox show-actions force-show-delete
                    force-show-edit force-show-view @edit="handleEdit" @delete="handleDelete" smallButtons
                    @select="handleSelectInvoice" @selectAll="handleSelectAllInvoices">
                    <template #item.status="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(item.status)]">
                            {{ item.status }}
                        </span>
                    </template>
                    <template #item.paymentStatus="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(item.paymentStatus)]">
                            {{ item.paymentStatus }}
                        </span>
                    </template>
                                        <template #item.actions="{ item }">
                        <div class="flex items-center">
                            <v-btn icon variant="text" color="success-700" size="x-small">
                                <span class="w-5" v-html="printerIcon"></span>
                            </v-btn>
                            <v-btn icon variant="text" size="x-small" color="warning-600"
                                @click="showChangeStatusDialog = true">
                                <span v-html="switcStatusIcon"></span>
                            </v-btn>
                        </div>
                    </template>

                </DataTable>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
