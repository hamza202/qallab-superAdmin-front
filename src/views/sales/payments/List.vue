<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';
import { trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon, printerIcon, whatsappIcon, folderDownload, fileIcon } from "@/components/icons/globalIcons";
import { switcStatusIcon } from '@/components/icons/priceOffersIcons';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();
const salesPaymentsIcon = `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M33.4167 32.3333H9.58333M33.4167 23.6667H9.58333M2 15H41M12.4 2H30.6C34.2403 2 36.0605 2 37.4509 2.70846C38.674 3.33163 39.6684 4.32601 40.2915 5.54906C41 6.93949 41 8.75966 41 12.4V30.6C41 34.2403 41 36.0605 40.2915 37.4509C39.6684 38.674 38.674 39.6684 37.4509 40.2915C36.0605 41 34.2403 41 30.6 41H12.4C8.75966 41 6.93949 41 5.54906 40.2915C4.32601 39.6684 3.33163 38.674 2.70846 37.4509C2 36.0605 2 34.2403 2 30.6V12.4C2 8.75966 2 6.93949 2.70846 5.54906C3.33163 4.32601 4.32601 3.33163 5.54906 2.70846C6.93949 2 8.75966 2 12.4 2Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
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

interface ItemActions {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
    can_print?: boolean;
}

interface PaymentItem {
    uuid: string;
    code: string;
    customer_name?: string;
    payment_datetime?: string;
    amount?: number;
    status: string;
    status_id: number;
    actions: ItemActions;
    [key: string]: unknown;
}

interface TableHeader {
    key: string;
    title: string;
}

interface ListResponse {
    data: PaymentItem[];
    pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
    header_table: string;
    headers: TableHeader[];
    shownHeaders: TableHeader[];
    actions: { can_create: boolean; can_bulk_delete: boolean };
}

const tableItems = ref<PaymentItem[]>([]);
const canCreate = ref(true);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

// Cursor pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

const tableHeaders = computed(() =>
    shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

const tableItemsWithId = computed(() =>
    tableItems.value.map((item) => ({ ...item, id: item.uuid }))
);

const selectedPayments = ref<string[]>([]);
const hasSelectedPayments = computed(() => selectedPayments.value.length > 0);

const showAdvancedFilters = ref(false);
const filterPaymentCode = ref("");
const filterCustomerName = ref("");
const filterStatusId = ref<number | null>(null);
const filterStartDate = ref("");
const filterEndDate = ref("");
const filterAmount = ref("");

const showBulkDeleteDialog = ref(false);
const showDeleteDialog = ref(false);
const itemToDelete = ref<PaymentItem | null>(null);
const deleteLoading = ref(false);

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterPaymentCode.value = "";
    filterCustomerName.value = "";
    filterStatusId.value = null;
    filterStartDate.value = "";
    filterEndDate.value = "";
    filterAmount.value = "";
    fetchList();
};

const applyFilters = () => {
    fetchList();
};

const fetchList = async (cursor?: string | null, append = false) => {
    try {
        if (append) {
            loadingMore.value = true;
        } else {
            loading.value = true;
        }

        // Demo data for testing
        const demoData: PaymentItem[] = [
            {
                uuid: '1',
                code: 'PAY-2024-001',
                customer_name: 'شركة البناء الحديث',
                payment_datetime: '2024-03-10 14:30:00',
                amount: 50000,
                status: 'مكتمل',
                status_id: 1,
                actions: { can_update: false, can_delete: false, can_view: true, can_change_status: true, can_print: true }
            },
            {
                uuid: '2',
                code: 'PAY-2024-002',
                customer_name: 'مؤسسة الإنشاءات الذكية',
                payment_datetime: '2024-03-09 10:15:00',
                amount: 75000,
                status: 'قيد المراجعة',
                status_id: 2,
                actions: { can_update: false, can_delete: false, can_view: true, can_change_status: true, can_print: true }
            },
            {
                uuid: '3',
                code: 'PAY-2024-003',
                customer_name: 'شركة المقاولات العامة',
                payment_datetime: '2024-03-08 16:45:00',
                amount: 120000,
                status: 'مكتمل',
                status_id: 1,
                actions: { can_update: false, can_delete: false, can_view: true, can_change_status: true, can_print: true }
            },
            {
                uuid: '4',
                code: 'PAY-2024-004',
                customer_name: 'مؤسسة التطوير العقاري',
                payment_datetime: '2024-03-07 11:20:00',
                amount: 95000,
                status: 'ملغي',
                status_id: 3,
                actions: { can_update: false, can_delete: false, can_view: true, can_change_status: false, can_print: true }
            },
            {
                uuid: '5',
                code: 'PAY-2024-005',
                customer_name: 'شركة الخليج للإنشاءات',
                payment_datetime: '2024-03-06 09:00:00',
                amount: 200000,
                status: 'مكتمل',
                status_id: 1,
                actions: { can_update: false, can_delete: false, can_view: true, can_change_status: true, can_print: true }
            }
        ];

        const demoHeaders = [
            { key: 'code', title: 'كود الدفعة' },
            { key: 'customer_name', title: 'اسم العميل' },
            { key: 'payment_datetime', title: 'تاريخ الدفعة' },
            { key: 'amount', title: 'المبلغ' },
            { key: 'status', title: 'الحالة' }
        ];

        if (append) {
            tableItems.value = [...tableItems.value, ...demoData];
        } else {
            tableItems.value = demoData;
            canCreate.value = true;
            canBulkDelete.value = true;
            initHeaders(demoHeaders, demoHeaders);
        }

        nextCursor.value = null;
        previousCursor.value = null;
        perPage.value = 15;
    } catch (err: any) {
        console.error('Error fetching payments list:', err);
        error(err?.response?.data?.message || t('sales.payments.messages.loadListError'));
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = () => {
    if (hasMoreData.value && !loadingMore.value) {
        fetchList(nextCursor.value, true);
    }
};

const handleToggleHeader = async (headerKey: string) => {
    await toggleHeader(headerKey).catch((err: any) => {
        error(err?.response?.data?.message || t('sales.payments.messages.columnsUpdateError'));
    });
};

const handleView = (item: { id?: string | number; uuid?: string }) => {
    const uuid = item.uuid ?? String(item.id);
    router.push({ name: 'SalesPaymentsView', params: { id: uuid } });
};

const handleEdit = (item: { id?: string | number; uuid?: string }) => {
    const uuid = item.uuid ?? String(item.id);
    router.push({ name: 'SalesPaymentsEdit', params: { id: uuid } });
};

const handlePrint = (item: { id?: string | number; uuid?: string }) => {
    const uuid = item.uuid ?? String(item.id);
    const route = router.resolve({ name: 'SalesPaymentsPrint', params: { id: uuid } });
    const printUrl = route.href.startsWith('/') ? `${window.location.origin}${route.href}` : route.href;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;';
    document.body.appendChild(iframe);

    const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'payment-print-ready' && e.source === iframe.contentWindow && iframe.contentWindow) {
            window.removeEventListener('message', handleMessage);
            iframe.contentWindow.print();
            setTimeout(() => {
                if (iframe.parentNode) document.body.removeChild(iframe);
            }, 1000);
        }
    };
    window.addEventListener('message', handleMessage);
    iframe.src = printUrl;
};

const confirmDelete = async (item: { uuid?: string; id?: string | number } & Partial<PaymentItem>) => {
    const uuid = item.uuid;
    try {
        await api.delete(`/sales/invoice-payments/${uuid}`);
        success(t('sales.payments.messages.deleteSuccess'));
        await fetchList();
    } catch (err: any) {
        console.error('Error deleting payment:', err);
        error(err?.response?.data?.message || t('sales.payments.messages.deleteError'));
    } finally {
    }
};

const handleSelectPayment = (item: { id: string | number }, selected: boolean) => {
    const id = String(item.id);
    if (selected) {
        selectedPayments.value.push(id);
    } else {
        selectedPayments.value = selectedPayments.value.filter((x) => x !== id);
    }
};

const handleSelectAllPayments = (checked: boolean) => {
    if (checked) {
        selectedPayments.value = tableItemsWithId.value.map((i) => String(i.id));
    } else {
        selectedPayments.value = [];
    }
};

const handleBulkDelete = () => {
    if (selectedPayments.value.length === 0) return;
    showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    try {
        deleteLoading.value = true;
        await api.post('/sales/invoice-payments/bulk-delete', {
            ids: selectedPayments.value,
        });
        success(t('sales.payments.messages.bulkDeleteSuccess', { count: selectedPayments.value.length }));
        selectedPayments.value = [];
        await fetchList();
    } catch (err: any) {
        console.error('Error bulk deleting:', err);
        error(err?.response?.data?.message || t('sales.payments.messages.bulkDeleteError'));
    } finally {
        deleteLoading.value = false;
        showBulkDeleteDialog.value = false;
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
        case 'ملغي':
            return 'bg-[#FEE4E2] text-[#D92D20]';
        default:
            return 'bg-[#F2F4F7] text-[#344054]';
    }
};

const openCreatePayment = () => {
    router.push({ name: 'SalesPaymentsCreate' });
};

// Infinite scroll setup
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

onMounted(async () => {
    await fetchList();
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
        <div class="sales-payments-page">
            <PageHeader :icon="salesPaymentsIcon" title-key="sales.payments.list.title"
                description-key="sales.payments.list.description" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
                    :prepend-icon="importIcon" :label="t('common.action.import')" />
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" :label="t('common.action.export')" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedPayments ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedPayments"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.action.delete')"
                            @click="handleBulkDelete" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.action.deleteAll')"
                            @click="handleBulkDelete" />
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
                            <template #activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" append-icon="mdi-chevron-down"
                                    rounded="4" color="gray-500" height="40"
                                    custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                                    :label="t('common.table.columns')">
                                    <template #append>
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </template>
                                </ButtonWithIcon>
                            </template>
                            <v-list class="py-2">
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
                            :prepend-icon="searchIcon" :label="t('common.table.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" :label="t('sales.payments.addPayment')" @click="openCreatePayment" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterPaymentCode" density="comfortable" variant="outlined" hide-details
                            :placeholder="t('sales.payments.filters.paymentCode')" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterCustomerName" density="comfortable" variant="outlined" hide-details
                            :placeholder="t('sales.payments.filters.customerName')" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterAmount" density="comfortable" variant="outlined" hide-details
                            :placeholder="t('sales.payments.filters.amount')" class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterStartDate" density="comfortable" hide-details
                            :placeholder="t('sales.payments.filters.startDate')" class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterEndDate" density="comfortable" hide-details
                            :placeholder="t('sales.payments.filters.endDate')" class="w-full sm:w-40 bg-white" />
                    </div>
                    <div class="flex gap-2 items-center">
                        <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                            custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                            :prepend-icon="searchIcon" :label="t('sales.payments.search')" @click="applyFilters" />
                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                            custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                            prepend-icon="mdi-refresh" :label="t('common.actions.reset')" @click="resetFilters" />
                    </div>
                </div>

                <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading"
                    :show-checkbox="canBulkDelete" show-actions @view="handleView" @edit="handleEdit"
                    @delete="confirmDelete" @select="handleSelectPayment" @selectAll="handleSelectAllPayments">
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
                            <v-btn v-if="item.actions?.can_print" icon variant="text" color="success-700" size="small"
                                @click="handlePrint(item)">
                                <span class="w-5" v-html="printerIcon"></span>
                            </v-btn>

                            <v-btn color="#3E4784" icon variant="text"
                                size="small">
                                <span v-html="folderDownload"></span>
                            </v-btn>

                            <v-btn color="primary-600" icon variant="text"
                                size="small">
                                <span v-html="fileIcon"></span>
                            </v-btn>
                        </div>
                    </template>
                </DataTable>

                <!-- Infinite Scroll Trigger -->
                <div ref="loadMoreTrigger" class="h-10 flex items-center justify-center">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <!-- Bulk Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading"
            :title="t('sales.payments.bulkDelete.title')"
            :message="t('sales.payments.bulkDelete.message', { count: selectedPayments.length })"
            @confirm="confirmBulkDelete" />
    </default-layout>
</template>

<style scoped></style>
