<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { useTableColumns } from '@/composables/useTableColumns';
import { useI18n } from 'vue-i18n'
import { GridIcon, refreshIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, plusIcon, searchIcon, printerIcon } from "@/components/icons/globalIcons";

const { t } = useI18n()
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

// Table column management
const TABLE_NAME = 'admin_customers';
const {
    allHeaders,
    shownHeaders,
    updatingHeaders,
    showHeadersMenu,
    headerCheckStates,
    initHeaders,
    toggleHeader,
} = useTableColumns(TABLE_NAME);

// TypeScript Interfaces
interface CustomerAction {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
}

interface Customer {
    id: number;
    full_name: string;
    customer_code: string;
    total_invoices: number;
    total_paid: number;
    due_amount: number;
    mobile: string;
    commercial_register: string;
    city: string;
    status: boolean;
    status_value: string;
    created_at: string;
    actions: CustomerAction;
}

interface TableHeader {
    key: string;
    title: string;
}

interface ListResponse {
    data: Customer[];
    pagination: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
    header_table: string;
    headers: TableHeader[];
    shownHeaders: TableHeader[];
    actions: { can_create: boolean; can_bulk_delete: boolean };
}

// API Data
const tableItems = ref<Customer[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

// Cursor pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

// Computed table headers for DataTable component
const tableHeaders = computed(() =>
    shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

// Selection state
const selectedCustomers = ref<number[]>([]);
const hasSelectedCustomers = computed(() => selectedCustomers.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterFullName = ref("");
const filterCode = ref("");
const filterMobile = ref("");
const filterCommercialRegister = ref("");
const filterCity = ref<string | null>(null);
const filterStatus = ref<string | null>(null);

const cityItems = ["الرياض", "جدة", "الطائف", "مكة", "المدينة"];

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

// Delete confirmation
const showBulkDeleteDialog = ref(false);
const deleteLoading = ref(false);

// Status change confirmation
const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<Customer | null>(null);

// API Functions
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
        if (filterFullName.value) params.append('full_name', filterFullName.value);
        if (filterCode.value) params.append('code', filterCode.value);
        if (filterMobile.value) params.append('mobile', filterMobile.value);
        if (filterCity.value) params.append('city_id', filterCity.value);
        if (filterCommercialRegister.value) params.append('commercial_reg', filterCommercialRegister.value);
        if (filterStatus.value) params.append('status', filterStatus.value);

        const url = `/customers?${params.toString()}`;
        const body = (await api.get(url)) as unknown as ListResponse;

        if (append) {
            tableItems.value = [...tableItems.value, ...(Array.isArray(body?.data) ? body.data : [])];
        } else {
            tableItems.value = Array.isArray(body?.data) ? body.data : [];
            canCreate.value = body?.actions?.can_create ?? false;
            canBulkDelete.value = body?.actions?.can_bulk_delete ?? false;
            initHeaders(body?.headers ?? [], body?.shownHeaders ?? []);
        }

        nextCursor.value = body?.pagination?.next_cursor || null;
        previousCursor.value = body?.pagination?.previous_cursor || null;
        perPage.value = body?.pagination?.per_page || 15;
    } catch (err: any) {
        console.error('Error fetching customers:', err);
        error(err?.response?.data?.message || 'فشل تحميل قائمة العملاء');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

// Load more data (lazy loading)
const loadMore = () => {
    if (hasMoreData.value && !loadingMore.value) {
        fetchList(nextCursor.value, true);
    }
};

// Apply filters
const applyFilters = () => {
    fetchList();
};

const resetFilters = () => {
    filterFullName.value = "";
    filterCode.value = "";
    filterMobile.value = "";
    filterCommercialRegister.value = "";
    filterCity.value = null;
    filterStatus.value = null;
    fetchList();
};

// Toggle column and persist
const handleToggleHeader = async (headerKey: string) => {
    await toggleHeader(headerKey).catch((err: any) => {
        error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
    });
};

// Handlers
const handleEdit = (item: any) => {
    router.push({ name: "CustomersEdit", params: { id: item.id } });
};

const handleStatusChange = (item: any) => {
    itemToChangeStatus.value = item;
    showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
    if (!itemToChangeStatus.value) return;

    try {
        statusChangeLoading.value = true;
        const newStatus = !itemToChangeStatus.value.status;

        await api.patch(`/customers/${itemToChangeStatus.value.id}/change-status`, {
            status: newStatus
        });

        success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} العميل بنجاح`);

        // Update the item in the list
        const index = tableItems.value.findIndex(c => c.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].status = newStatus;
            tableItems.value[index].status_value = newStatus ? 'فعال' : 'غير فعال';
        }

        itemToChangeStatus.value = null;
    } catch (err: any) {
        console.error('Error changing customer status:', err);
        error(err?.response?.data?.message || 'فشل تغيير حالة العميل');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
    }
};

const confirmDelete = async (item: any) => {
    try {
        await api.delete(`/customers/${item.id}`);
        success('تم حذف العميل بنجاح');
        await fetchList();
    } catch (err: any) {
        console.error('Error deleting customer:', err);
        error(err?.response?.data?.message || 'فشل حذف العميل');
    }
};

const handleBulkDelete = () => {
    if (selectedCustomers.value.length === 0) return;
    showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    try {
        deleteLoading.value = true;
        await api.post('/customers/bulk-delete', { ids: selectedCustomers.value });
        success(`تم حذف ${selectedCustomers.value.length} عميل بنجاح`);
        selectedCustomers.value = [];
        await fetchList();
    } catch (err: any) {
        console.error('Error bulk deleting customers:', err);
        error(err?.response?.data?.message || 'فشل الحذف الجماعي');
    } finally {
        deleteLoading.value = false;
        showBulkDeleteDialog.value = false;
    }
};

const handleSelectCustomer = (item: any, selected: boolean) => {
    if (selected) {
        selectedCustomers.value.push(item.id);
    } else {
        selectedCustomers.value = selectedCustomers.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllCustomers = (checked: boolean) => {
    if (checked) {
        selectedCustomers.value = tableItems.value.map((item) => item.id);
    } else {
        selectedCustomers.value = [];
    }
};

const openCreateCustomer = () => {
    router.push({ name: "CustomersCreate" });
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
        <div class="customers-page">
            <PageHeader :icon="GridIcon" title-key="pages.customers.title"
                description-key="pages.customers.description" />

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
                <div :class="hasSelectedCustomers ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:!px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="canBulkDelete && hasSelectedCustomers"
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

                    <!-- Main header controls -->
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
                                            :disabled="updatingHeaders"
                                            @click.stop="handleToggleHeader(header.key)" />
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
                            :prepend-icon="plusIcon" label="أضف عميل" @click="openCreateCustomer" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterFullName" density="comfortable" variant="outlined" hide-details
                            placeholder="الاسم الكامل" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterCode" density="comfortable" variant="outlined" hide-details
                            placeholder="كود العميل" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterMobile" density="comfortable" variant="outlined" hide-details
                            placeholder="رقم الجوال" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterCommercialRegister" density="comfortable" variant="outlined"
                            hide-details placeholder="السجل التجاري" class="w-full sm:w-40 bg-white" />
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

                <!-- Customers Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete"
                    show-actions @edit="handleEdit" @delete="confirmDelete" @select="handleSelectCustomer"
                    @selectAll="handleSelectAllCustomers">
                    <template #item.status="{ item }">
                        <v-switch :model-value="item.status" hide-details inset density="compact" class="small-switch"
                            color="primary-600" @click="handleStatusChange(item)" />
                    </template>
                </DataTable>

                <!-- Infinite Scroll Trigger -->
                <div ref="loadMoreTrigger" class="h-10 flex items-center justify-center">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <!-- Bulk Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف العملاء"
            :message="`هل أنت متأكد من حذف ${selectedCustomers.length} عميل؟`" @confirm="confirmBulkDelete" />

        <!-- Status Change Confirmation Dialog -->
        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="itemToChangeStatus?.full_name" :current-status="itemToChangeStatus?.status || false"
            @confirm="confirmStatusChange" />
    </default-layout>
</template>

<style scoped></style>
