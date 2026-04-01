<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { useI18n } from 'vue-i18n'
import { useTableColumns } from '@/composables/useTableColumns';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';
import { trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";
import { switcStatusIcon } from '@/components/icons/priceOffersIcons';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';

const { t } = useI18n()

const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const tableName = ref('');
const {
    allHeaders,
    shownHeaders,
    updatingHeaders,
    showHeadersMenu,
    headerCheckStates,
    initHeaders,
    toggleHeader,
} = useTableColumns(tableName);

// TypeScript Interfaces
interface VoucherAction {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
}

interface Voucher {
    id: number;
    uuid: string;
    voucher_number: string;
    client_name: string;
    voucher_type: string;
    voucher_date: string;
    amount: number;
    debit: number;
    credit: number;
    unit: string;
    classification: string;
    user: string;
    class: 'received' | 'payment';
    actions: VoucherAction;
    status?: string | boolean;
    status_id: number;
}

interface TableHeader {
    key: string;
    title: string;
}

interface Pagination {
    next_cursor: string | null;
    previous_cursor: string | null;
    per_page: number;
}

interface VouchersResponse {
    status: number;
    code: number;
    locale: string;
    message: string;
    data: Voucher[];
    pagination: Pagination;
    headers: TableHeader[];
    shownHeaders: TableHeader[];
    actions: {
        can_create: boolean;
        can_bulk_delete?: boolean;
    };
}

interface VoucherFilters {
    per_page?: number;
    cursor?: string | null;
    voucher_number?: string;
    client_name?: string;
    voucher_type?: string;
    voucher_date?: string;
    unit?: string;
    classification?: string;
    status?: string;
}

// Vouchers icon
const vouchersIcon = `<svg width="39" height="48" viewBox="0 0 39 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.6667 28V36.6667M28 23.6667V36.6667M19.3333 15V36.6667M36.6667 12.4V34.9333C36.6667 38.5737 36.6667 40.3938 35.9582 41.7843C35.335 43.0073 34.3407 44.0017 33.1176 44.6249C31.7272 45.3333 29.907 45.3333 26.2667 45.3333H12.4C8.75966 45.3333 6.93949 45.3333 5.54906 44.6249C4.32601 44.0017 3.33163 43.0073 2.70846 41.7843C2 40.3938 2 38.5737 2 34.9333V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2H26.2667C29.907 2 31.7272 2 33.1176 2.70846C34.3407 3.33163 35.335 4.32601 35.9582 5.54906C36.6667 6.93949 36.6667 8.75966 36.6667 12.4Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// API Data
const tableItems = ref<Voucher[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(true);
const loading = ref(false);
const loadingMore = ref(false);
const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<Voucher | null>(null);

// Pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

// Computed table headers for DataTable component
const tableHeaders = computed(() =>
    shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

// Selection state
const selectedVouchers = ref<number[]>([]);
const hasSelectedVouchers = computed(() => selectedVouchers.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterVoucherNumber = ref("");
const filterClientName = ref("");
const filterVoucherType = ref<string | null>(null);
const filterVoucherDate = ref("");
const filterUnit = ref<string | null>(null);
const filterClassification = ref<string | null>(null);
const filterStatus = ref<string | null>(null);

const voucherTypeItems = ["قبض", "صرف", "قيد"];
const unitItems = ["عميل", "مورد"];
const classificationItems = ["قطعة", "ضامنة"];

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const openChangeStatusDialog = (item: Voucher | Record<string, unknown>) => {
    itemToChangeStatus.value = item as Voucher;
    showChangeStatusDialog.value = true;
};

// Delete confirmation
const showBulkDeleteDialog = ref(false);
const deleteLoading = ref(false);


// API Functions
const fetchVouchers = async (cursor?: string | null, append = false) => {
    try {
        if (append) {
            loadingMore.value = true;
        } else {
            loading.value = true;
        }

        const filters: VoucherFilters = {
            per_page: perPage.value,
            cursor: cursor || undefined,
        };

        if (filterVoucherNumber.value) filters.voucher_number = filterVoucherNumber.value;
        if (filterClientName.value) filters.client_name = filterClientName.value;
        if (filterVoucherType.value) filters.voucher_type = filterVoucherType.value;
        if (filterVoucherDate.value) filters.voucher_date = filterVoucherDate.value;
        if (filterUnit.value) filters.unit = filterUnit.value;
        if (filterClassification.value) filters.classification = filterClassification.value;
        if (filterStatus.value) filters.status = filterStatus.value;

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `/receipts-payments-transactions?${queryString}` : '/receipts-payments-transactions';

        const response = await api.get<VouchersResponse>(url);

        const normalizedData = response.data.map((item) => ({
            ...item,
            status: item.status !== undefined
                ? Boolean(item.status)
                : item.status === 'active' || item.status === 'enabled' || item.status === '1' || item.status === 1,
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = Array.isArray(response.data) ? response.data : [];
            canCreate.value = response.actions.can_create ?? false;
            canBulkDelete.value = response.actions.can_bulk_delete ?? false;
            if (response.header_table) {
                tableName.value = response.header_table;
            }
            initHeaders(response.headers ?? [], response.shownHeaders ?? []);
        }

        nextCursor.value = response.pagination.next_cursor;
        previousCursor.value = response.pagination.previous_cursor;
        perPage.value = response.pagination.per_page;
    } catch (err: any) {
        console.error('Error fetching vouchers:', err);
        error(err?.response?.data?.message || 'فشل في تحميل السندات');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

// Load more data (lazy loading)
const loadMore = () => {
    if (hasMoreData.value && !loadingMore.value) {
        fetchVouchers(nextCursor.value, true);
    }
};

// Apply filters
const applyFilters = () => {
    fetchVouchers();
};

const resetFilters = () => {
    filterVoucherNumber.value = "";
    filterClientName.value = "";
    filterVoucherType.value = null;
    filterVoucherDate.value = "";
    filterUnit.value = null;
    filterClassification.value = null;
    filterStatus.value = null;
};

const handleToggleHeader = async (headerKey: string) => {
    await toggleHeader(headerKey).catch((err: any) => {
        error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
    });
};

// Handlers
const handleView = (item: any) => {
    router.push({ name: "VouchersView", params: { id: item.id } });
};

const handleEdit = (item: any) => {
    router.push({ name: "VouchersEdit", params: { id: item.id }, query: { type: item.class } });
};

const confirmDelete = async (item: any) => {
    try {
        await api.delete(`/receipts-payments-transactions/${item.id}`);
        success('تم حذف السند بنجاح');
        await fetchVouchers();
    } catch (err: any) {
        console.error('Error deleting voucher:', err);
        error(err?.response?.data?.message || 'فشل في حذف السند');
    }
};

const handleBulkDelete = () => {
    if (selectedVouchers.value.length === 0) return;
    showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    try {
        deleteLoading.value = true;
        await api.post('/receipts-payments-transactions/bulk-delete', { ids: selectedVouchers.value });
        success(`تم حذف ${selectedVouchers.value.length} سند بنجاح`);
        selectedVouchers.value = [];
        await fetchVouchers();
    } catch (err: any) {
        console.error('Error bulk deleting vouchers:', err);
        error(err?.response?.data?.message || 'فشل في حذف السندات');
    } finally {
        deleteLoading.value = false;
        showBulkDeleteDialog.value = false;
    }
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

const openCreateVoucher = (type: string) => {
    // Default to receipt voucher, can be changed based on UI selection
    router.push({ name: "VouchersCreate", params: { type: type } });
};

// Infinite scroll with Intersection Observer
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const setupInfiniteScroll = () => {
    if (!loadMoreTrigger.value) return;

    observer.value = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
                loadMore();
            }
        },
        {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        }
    );

    observer.value.observe(loadMoreTrigger.value);
};

const cleanupInfiniteScroll = () => {
    if (observer.value && loadMoreTrigger.value) {
        observer.value.unobserve(loadMoreTrigger.value);
        observer.value.disconnect();
    }
};

// Lifecycle
onMounted(() => {
    fetchVouchers();
    nextTick(() => {
        setupInfiniteScroll();
    });
});

onBeforeUnmount(() => {
    cleanupInfiniteScroll();
});
</script>

<template>
    <default-layout>
        <div class="vouchers-page">
            <PageHeader :icon="vouchersIcon" title-key="pages.vouchers.title"
                description-key="pages.vouchers.description" />

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
                <div
                    class="flex flex-wrap items-center justify-between gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="hasSelectedVouchers"
                        class="flex flex-wrap items-stretch rounded-lg overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')"
                            @click="handleBulkDelete" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')"
                            @click="handleBulkDelete" />
                    </div>
                    <h3 v-else class="text-gray-900 text-lg font-bold">إدارة سندات القبض والصرف</h3>

                    <!-- Main header controls -->
                    <div class="flex flex-wrap gap-3">
                        <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
                            <template #activator="{ props: menuProps }">
                                <ButtonWithIcon v-bind="menuProps" variant="outlined" append-icon="mdi-chevron-down"
                                    rounded="4" color="gray-500" height="40"
                                    custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                                    :label="t('common.columns')" />
                            </template>
                            <v-list>
                                <v-list-item v-for="header in allHeaders" :key="header.key"
                                    @click="handleToggleHeader(header.key)">
                                    <template #prepend>
                                        <v-checkbox-btn :model-value="headerCheckStates[header.key]"
                                            :disabled="updatingHeaders" @click.stop="handleToggleHeader(header.key)" />
                                    </template>
                                    <v-list-item-title>{{ header.title }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base border !border-primary-200 !text-primary-800"
                            :prepend-icon="plusIcon" label="اضافة سند قبض"
                            @click="openCreateVoucher('received')" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base border !border-primary-200 !text-primary-800"
                            :prepend-icon="plusIcon" label="اضافة سند صرف"
                            @click="openCreateVoucher('payment')" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
                    <div class="flex flex-wrap lg:!flex-nowrap gap-3 justify-end sm:justify-start">
                        <v-text-field v-model="filterVoucherNumber" density="comfortable" variant="outlined"
                            hide-details placeholder="رقم السند" class="w-full sm:w-40 bg-white"
                            @keyup.enter="applyFilters" />
                        <v-text-field v-model="filterClientName" density="comfortable" variant="outlined" hide-details
                            placeholder="اسم العميل" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
                        <v-select v-model="filterVoucherType" :items="voucherTypeItems" density="comfortable"
                            variant="outlined" hide-details placeholder="نوع السند" class="w-full sm:w-40 bg-white"
                            @update:model-value="applyFilters" />
                        <DatePickerInput v-model="filterVoucherDate" density="comfortable" hide-details
                            placeholder="تاريخ السند" class="w-full sm:w-40 bg-white"
                            @update:model-value="applyFilters" />
                        <v-select v-model="filterUnit" :items="unitItems" density="comfortable" variant="outlined"
                            hide-details placeholder="الوحدة" class="w-full sm:w-40 bg-white"
                            @update:model-value="applyFilters" />
                        <v-select v-model="filterClassification" :items="classificationItems" density="comfortable"
                            variant="outlined" hide-details placeholder="التصنيف" class="w-full sm:w-40 bg-white"
                            @update:model-value="applyFilters" />

                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />

                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />

                        </div>

                    </div>
                </div>

                <!-- Vouchers Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete"
                    show-actions @edit="handleEdit" @delete="confirmDelete" @view="handleView"
                    @select="handleSelectVoucher" @selectAll="handleSelectAllVouchers">
                    <template #item.actions="{ item }">
                        <div class="flex items-center gap-1">
                            <v-btn v-if="item.actions?.can_change_status" icon variant="text" size="small" color="warning-600"
                                @click="openChangeStatusDialog(item)">
                                <span v-html="switcStatusIcon"></span>
                            </v-btn>
                        </div>
                    </template>
                </DataTable>

                <!-- Infinite Scroll Trigger & Loading Indicator -->
                <div ref="loadMoreTrigger" class="flex justify-center py-4">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <!-- Bulk delete -->
        <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف السندات"
            :message="`هل أنت متأكد من حذف ${selectedVouchers.length} سند؟`" @confirm="confirmBulkDelete" />

        <StatusChangeFeature
            v-model="showChangeStatusDialog"
            :item="itemToChangeStatus"
            :change-status-url="`/receipts-payments-transactions/${itemToChangeStatus?.id}/change-status`"
            title="تغيير الحالة"
            message="تغيير الحالة:"
            @success="fetchVouchers"
        />
    </default-layout>
</template>

<style scoped></style>
