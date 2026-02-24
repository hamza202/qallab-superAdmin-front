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
import { GridIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon, printerIcon } from "@/components/icons/globalIcons";
import { switcStatusIcon } from '@/components/icons/priceOffersIcons';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const TABLE_NAME = 'admin_sales_invoices_building_materials';
const {
    allHeaders,
    shownHeaders,
    updatingHeaders,
    showHeadersMenu,
    headerCheckStates,
    initHeaders,
    toggleHeader,
} = useTableColumns(TABLE_NAME);

interface ItemActions {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
    can_print?: boolean;
}

interface InvoiceItem {
    uuid: string;
    code: string;
    customer_name?: string;
    invoice_due_datetime?: string;
    final_total?: number;
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
    data: InvoiceItem[];
    pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
    header_table: string;
    headers: TableHeader[];
    shownHeaders: TableHeader[];
    actions: { can_create: boolean; can_bulk_delete: boolean };
}

const tableItems = ref<InvoiceItem[]>([]);
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

const selectedInvoices = ref<string[]>([]);
const hasSelectedInvoices = computed(() => selectedInvoices.value.length > 0);

const showAdvancedFilters = ref(false);
const filterInvoiceCode = ref("");
const filterCustomerName = ref("");
const filterStatusId = ref<number | null>(null);
const filterStartDate = ref("");
const filterEndDate = ref("");
const filterFinalTotal = ref("");
const filterTotalQuantity = ref("");
const filterTotalTax = ref("");

const showBulkDeleteDialog = ref(false);

const deleteLoading = ref(false);

const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<InvoiceItem | null>(null);

const openChangeStatusDialog = (item: InvoiceItem | Record<string, unknown>) => {
    itemToChangeStatus.value = item as InvoiceItem;
    showChangeStatusDialog.value = true;
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterInvoiceCode.value = "";
    filterCustomerName.value = "";
    filterStatusId.value = null;
    filterStartDate.value = "";
    filterEndDate.value = "";
    filterFinalTotal.value = "";
    filterTotalQuantity.value = "";
    filterTotalTax.value = "";
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

        const params = new URLSearchParams();
        params.append('per_page', String(perPage.value));
        if (cursor) params.append('cursor', cursor);
        if (filterInvoiceCode.value) params.append('code', filterInvoiceCode.value);
        if (filterCustomerName.value) params.append('customer_name', filterCustomerName.value);
        if (filterStatusId.value) params.append('status_id', String(filterStatusId.value));
        if (filterStartDate.value) params.append('invoice_due_datetime_from', filterStartDate.value);
        if (filterEndDate.value) params.append('invoice_due_datetime_to', filterEndDate.value);
        if (filterFinalTotal.value) params.append('final_total', filterFinalTotal.value);
        if (filterTotalQuantity.value) params.append('total_quantity', filterTotalQuantity.value);
        if (filterTotalTax.value) params.append('total_tax', filterTotalTax.value);

        const url = `/sales/invoices/logistics/?${params.toString()}`;
        const body = (await api.get(url)) as unknown as ListResponse;

        if (append) {
            tableItems.value = [...tableItems.value, ...(Array.isArray(body?.data) ? body.data : [])];
        } else {
            tableItems.value = Array.isArray(body?.data) ? body.data : [];
            canCreate.value = body?.actions?.can_create ?? true;
            canBulkDelete.value = body?.actions?.can_bulk_delete ?? false;
            initHeaders(body?.headers ?? [], body?.shownHeaders ?? []);
        }

        nextCursor.value = body?.pagination?.next_cursor || null;
        previousCursor.value = body?.pagination?.previous_cursor || null;
        perPage.value = body?.pagination?.per_page || 15;
    } catch (err: any) {
        console.error('Error fetching invoices list:', err);
        error(err?.response?.data?.message || 'فشل تحميل قائمة الفواتير');
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
        error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
    });
};

const handleView = (item: { id?: string | number; uuid?: string }) => {
    const uuid = item.uuid ?? String(item.id);
    router.push({ name: 'SalesLogisticsInvoicesView', params: { id: uuid } });
};

const handleEdit = (item: { id?: string | number; uuid?: string }) => {
    const uuid = item.uuid ?? String(item.id);
    router.push({ name: 'SalesLogisticsInvoicesEdit', params: { id: uuid } });
};

const handlePrint = (item: { id?: string | number; uuid?: string }) => {
    const uuid = item.uuid ?? String(item.id);
    const route = router.resolve({ name: 'SalesLogisticsInvoicesPrint', params: { id: uuid } });
    const printUrl = route.href.startsWith('/') ? `${window.location.origin}${route.href}` : route.href;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:-9999px;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;';
    document.body.appendChild(iframe);

    const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'invoice-print-ready' && e.source === iframe.contentWindow && iframe.contentWindow) {
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

const confirmDelete = async (item: { uuid?: string; id?: string | number } & Partial<InvoiceItem>) => {
    const uuid = item.uuid;
    try {
        await api.delete(`/sales/invoices/logistics/${uuid}`);
        success('تم حذف الفاتورة بنجاح');
        await fetchList();
    } catch (err: any) {
        console.error('Error deleting invoice:', err);
        error(err?.response?.data?.message || 'فشل حذف الفاتورة');
    } finally {
    }
};

const handleSelectInvoice = (item: { id: string | number }, selected: boolean) => {
    const id = String(item.id);
    if (selected) {
        selectedInvoices.value.push(id);
    } else {
        selectedInvoices.value = selectedInvoices.value.filter((x) => x !== id);
    }
};

const handleSelectAllInvoices = (checked: boolean) => {
    if (checked) {
        selectedInvoices.value = tableItemsWithId.value.map((i) => String(i.id));
    } else {
        selectedInvoices.value = [];
    }
};

const handleBulkDelete = () => {
    if (selectedInvoices.value.length === 0) return;
    showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    try {
        deleteLoading.value = true;
        await api.post('/sales/invoices/logistics/bulk-delete', {
            ids: selectedInvoices.value,
        });
        success(`تم حذف ${selectedInvoices.value.length} فاتورة بنجاح`);
        selectedInvoices.value = [];
        await fetchList();
    } catch (err: any) {
        console.error('Error bulk deleting:', err);
        error(err?.response?.data?.message || 'فشل الحذف الجماعي');
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
            return 'bg-[#FEE4E2] text-[#D92D20]';
        default:
            return 'bg-[#F2F4F7] text-[#344054]';
    }
};

const openCreateInvoice = () => {
    router.push({ name: 'SalesLogisticsInvoicesCreate' });
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
        <div class="purchase-invoices-page">
            <PageHeader :icon="GridIcon" title-key="pages.SalesLogisticsInvoices.title"
                description-key="pages.SalesLogisticsInvoices.description" />

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
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')"
                            @click="handleBulkDelete" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')"
                            @click="handleBulkDelete" />
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
                            <template #activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" append-icon="mdi-chevron-down"
                                    rounded="4" color="gray-500" height="40"
                                    custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                                    :label="t('common.columns')">
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
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف فاتورة" @click="openCreateInvoice" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterInvoiceCode" density="comfortable" variant="outlined" hide-details
                            placeholder="كود الفاتورة" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterCustomerName" density="comfortable" variant="outlined" hide-details
                            placeholder="اسم العميل" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterFinalTotal" density="comfortable" variant="outlined" hide-details
                            placeholder="إجمالي المبلغ" class="w-full sm:w-40 bg-white" />
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

                <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading"
                    :show-checkbox="canBulkDelete" show-actions @view="handleView" @edit="handleEdit"
                    @delete="confirmDelete" @select="handleSelectInvoice" @selectAll="handleSelectAllInvoices">
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
                            <v-btn v-if="item.actions?.can_print" icon variant="text" color="success-700" size="x-small"
                                @click="handlePrint(item)">
                                <span class="w-5" v-html="printerIcon"></span>
                            </v-btn>

                            <v-btn v-if="item.actions?.can_change_status" icon variant="text" size="small"
                                @click="openChangeStatusDialog(item)">
                                <span v-html="switcStatusIcon"></span>
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
        <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف الفواتير"
            :message="`هل أنت متأكد من حذف ${selectedInvoices.length} فاتورة؟`" @confirm="confirmBulkDelete" />

        <!-- Status Change Dialog -->
        <StatusChangeFeature v-model="showChangeStatusDialog" :item="itemToChangeStatus"
            :change-status-url="`/sales/invoices/logistics/${itemToChangeStatus?.uuid}/change-status`"
            title="تغيير الحالة" message="تغيير الحالة:" @success="fetchList" />
    </default-layout>
</template>

<style scoped></style>
