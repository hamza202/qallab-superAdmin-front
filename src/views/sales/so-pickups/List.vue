<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue';
import { GridIcon, trash_1_icon, trash_2_icon, importIcon, columnIcon, exportIcon, searchIcon } from "@/components/icons/globalIcons";
import { switcStatusIcon, truckIcon } from '@/components/icons/priceOffersIcons';
import StatusChangeFeature from '@/components/common/StatusChangeFeature.vue';

const { t } = useI18n();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

// Table column management
const TABLE_NAME = 'admin_sales_so_pickups';
const {
    allHeaders,
    shownHeaders,
    updatingHeaders,
    showHeadersMenu,
    headerCheckStates,
    initHeaders,
    toggleHeader,
} = useTableColumns(TABLE_NAME);

// Types
interface ItemActions {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
}

interface PickupItem {
    uuid: string;
    id?: string | number;
    doc_id?: string | number; // from list response, used for change-status API
    status: string;
    status_id: number;
    /** From list API – used for status badge color */
    status_background_color?: string;
    status_text_color?: string;
    actions: ItemActions;
    [key: string]: unknown;
}

interface TableHeader {
    key: string;
    title: string;
}

interface ListResponse {
    data: PickupItem[];
    pagination?: { next_cursor: string | null; previous_cursor: string | null; per_page: number };
    header_table?: string;
    headers?: TableHeader[];
    shownHeaders?: TableHeader[];
    actions?: { can_bulk_delete?: boolean };
}

// API state
const tableItems = ref<PickupItem[]>([]);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const nextCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

// Table headers for DataTable (from shownHeaders)
const tableHeaders = computed(() =>
    shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: '140px' }))
);

// Items with id for DataTable (id = uuid for selection)
const tableItemsWithId = computed(() =>
    tableItems.value.map((item) => ({ ...item, id: item.uuid }))
);

// Selection state
const selectedRequests = ref<string[]>([]);
const hasSelectedRequests = computed(() => selectedRequests.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);

// Delete dialogs
const showBulkDeleteDialog = ref(false);
const showDeleteDialog = ref(false);
const itemToDelete = ref<PickupItem | null>(null);
const deleteLoading = ref(false);

// Status change dialog
const showChangeStatusDialog = ref(false);
const itemToChangeStatus = ref<PickupItem | null>(null);

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

// API: fetch list (append = true for infinite scroll)
const fetchList = async (append = false) => {
    if (append) loadingMore.value = true;
    else loading.value = true;
    try {
        const params = new URLSearchParams();
        params.append('per_page', String(perPage.value));
        if (append && nextCursor.value) params.append('cursor', nextCursor.value);

        const url = params.toString() ? `/sales/so-pickups?${params.toString()}` : '/sales/so-pickups';
        const res = await api.get<ListResponse>(url);

        const data = res.data || [];
        if (append) {
            tableItems.value = [...tableItems.value, ...data];
        } else {
            tableItems.value = data;
            canBulkDelete.value = res.actions?.can_bulk_delete ?? false;
            initHeaders(res.headers || [], res.shownHeaders || []);
        }
        nextCursor.value = res.pagination?.next_cursor ?? null;
    } catch (err: any) {
        console.error('Error fetching SO pickups list:', err);
        error(err?.response?.data?.message || 'فشل تحميل قائمة حجوزات التسليم');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const setupInfiniteScroll = () => {
    if (!loadMoreTrigger.value) return;
    observer.value = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
                fetchList(true);
            }
        },
        { root: null, rootMargin: '100px', threshold: 0.1 }
    );
    observer.value.observe(loadMoreTrigger.value);
};

const cleanupInfiniteScroll = () => {
    if (observer.value && loadMoreTrigger.value) {
        observer.value.unobserve(loadMoreTrigger.value);
        observer.value.disconnect();
    }
};

// Toggle column and persist
const handleToggleHeader = async (headerKey: string) => {
    await toggleHeader(headerKey).catch((err: any) => {
        error(err?.response?.data?.message || 'فشل تحديث الأعمدة');
    });
};

// Handlers
const handleView = (item: { id?: string | number; uuid?: string }) => {
    const id = item.uuid ?? String(item.id);
    router.push({ name: 'SalesSoPickupsView', params: { id } });
};

const handleEdit = (item: { id?: string | number; uuid?: string }) => {
    const id = item.uuid ?? String(item.id);
    router.push({ name: 'SalesSoPickupsEdit', params: { id } });
};

const openCreateTrip = (item: { id?: string | number; uuid?: string }) => {
    const id = item.uuid ?? String(item.id);
    router.push({ name: 'SalesTripsCreate', params: { pickupId : id } });
};

const handleDelete = (item: { uuid?: string; id?: string | number } & Partial<PickupItem>) => {
    itemToDelete.value = item as PickupItem;
    showDeleteDialog.value = true;
};

const confirmDelete = async () => {
    if (!itemToDelete.value) return;
    const uuid = itemToDelete.value.uuid;
    try {
        deleteLoading.value = true;
        await api.delete(`/sales/so-pickups/${uuid}`);
        success('تم حذف حجز التسليم بنجاح');
        showDeleteDialog.value = false;
        itemToDelete.value = null;
        await fetchList();
    } catch (err: any) {
        console.error('Error deleting pickup:', err);
        error(err?.response?.data?.message || 'فشل حذف حجز التسليم');
    } finally {
        deleteLoading.value = false;
    }
};

const handleSelectRequest = (item: { id: string | number }, selected: boolean) => {
    const id = String(item.id);
    if (selected) {
        selectedRequests.value.push(id);
    } else {
        selectedRequests.value = selectedRequests.value.filter((x) => x !== id);
    }
};

const handleSelectAllRequests = (checked: boolean) => {
    if (checked) {
        selectedRequests.value = tableItemsWithId.value.map((i) => String(i.id));
    } else {
        selectedRequests.value = [];
    }
};

/** Fallback status classes when API does not return status colors */
const getStatusClass = (status: string) => {
    switch (status) {
        case 'مكتمل':
            return 'bg-[#ECFDF3] text-[#027A48]'; // green – completed
        case 'تأكيد':
            return 'bg-[#D1FAE5] text-[#059669]'; // green – confirmed
        case 'قيد المراجعة':
            return 'bg-[#FEF0C7] text-[#DC6803]'; // amber – under review
        case 'مسودة':
            return 'bg-[#F2F4F7] text-[#344054]'; // gray – draft
        case 'الغاء':
        case 'مرفوض':
            return 'bg-[#FEE4E2] text-[#D92D20]'; // red – cancelled/rejected
        default:
            return 'bg-[#F2F4F7] text-[#344054]'; // gray – default
    }
};

/** Use status color from list API when present (after change-status, list returns colors) */
const getStatusStyle = (item: Record<string, unknown>): Record<string, string> | null => {
    const bg = item.status_background_color as string | undefined;
    const fg = item.status_text_color as string | undefined;
    if (bg || fg) {
        return {
            ...(bg && { backgroundColor: bg }),
            ...(fg && { color: fg }),
        };
    }
    return null;
};

const handleBulkDelete = () => {
    if (selectedRequests.value.length === 0) return;
    showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    try {
        deleteLoading.value = true;
        const formData = new FormData();
        selectedRequests.value.forEach((id, index) => {
            formData.append(`ids[${index}]`, id);
        });
        await api.post('/sales/so-pickups/bulk-delete', formData);
        success(`تم حذف ${selectedRequests.value.length} حجز تسليم بنجاح`);
        selectedRequests.value = [];
        await fetchList();
    } catch (err: any) {
        console.error('Error bulk deleting pickups:', err);
        error(err?.response?.data?.message || 'فشل الحذف الجماعي');
    } finally {
        deleteLoading.value = false;
        showBulkDeleteDialog.value = false;
    }
};

const openChangeStatusDialog = (item: PickupItem | Record<string, unknown>) => {
    itemToChangeStatus.value = item as PickupItem;
    showChangeStatusDialog.value = true;
};

onMounted(() => {
    fetchList();
    nextTick(() => setupInfiniteScroll());
});

onBeforeUnmount(() => {
    cleanupInfiniteScroll();
});
</script>

<template>
    <default-layout>
        <div class="so-pickups-page">
            <PageHeader :icon="GridIcon" title-key="pages.SalesSoPickups.title"
                description-key="pages.SalesSoPickups.description" />

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
                <div :class="hasSelectedRequests ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected (only if can_bulk_delete) -->
                    <div v-if="canBulkDelete && hasSelectedRequests"
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
                            <template #activator="{ props: menuProps }">
                                <ButtonWithIcon v-bind="menuProps" variant="outlined" append-icon="mdi-chevron-down"
                                    rounded="4" color="gray-500" height="40"
                                    custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                                    :label="t('common.columns')">
                                    <template #append>
                                        <v-icon>mdi-chevron-down</v-icon>
                                    </template>
                                </ButtonWithIcon>
                            </template>
                            <v-list>
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
                    </div>
                </div>

                <!-- Advanced filters row (optional - extend when API supports query params) -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex gap-2 items-center">
                        <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                            custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                            :prepend-icon="searchIcon" label="ابحث" @click="fetchList" />
                    </div>
                </div>

                <!-- SO Pickups Table -->
                <DataTable :headers="tableHeaders" :items="tableItemsWithId" :loading="loading"
                    :show-checkbox="canBulkDelete" show-actions @edit="handleEdit" @delete="handleDelete"
                    @view="handleView" @select="handleSelectRequest" @selectAll="handleSelectAllRequests">
                    <template #item.status="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', (!getStatusStyle(item as Record<string, unknown>)) ? getStatusClass(String(item.status)) : '']"
                            :style="getStatusStyle(item as Record<string, unknown>) ?? undefined">
                            {{ item.status }}
                        </span>
                    </template>
                    <template #item.actions="{ item }">
                        <div class="flex items-center">
                            <v-btn icon variant="text" size="x-small"
                                color="success" @click="openCreateTrip(item)">
                                <span v-html="truckIcon"></span>
                            </v-btn>
                            <v-btn v-if="item.actions?.can_change_status" icon variant="text" size="x-small"
                                color="warning-600" @click="openChangeStatusDialog(item)">
                                <span v-html="switcStatusIcon"></span>
                            </v-btn>
                        </div>
                    </template>
                </DataTable>

                <div ref="loadMoreTrigger" class="h-4"></div>
                <div v-if="loadingMore" class="flex justify-center items-center py-4">
                    <v-progress-circular indeterminate color="primary" size="32" />
                    <span class="mr-2 text-gray-600">جاري تحميل المزيد...</span>
                </div>
            </div>
        </div>

        <StatusChangeFeature
            v-model="showChangeStatusDialog"
            :item="itemToChangeStatus"
            :change-status-url="`/sales/so-pickups/${itemToChangeStatus?.uuid}/change-status`"
            @success="fetchList"
        />

        <!-- Single Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف حجز التسليم"
            message="هل أنت متأكد من حذف حجز التسليم؟" @confirm="confirmDelete" />

        <!-- Bulk Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف حجوزات التسليم"
            :message="`هل أنت متأكد من حذف ${selectedRequests.length} حجز تسليم؟`" @confirm="confirmBulkDelete" />
    </default-layout>
</template>

<style scoped></style>
