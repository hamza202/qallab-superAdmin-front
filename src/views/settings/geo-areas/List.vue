<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import { useApi } from "@/composables/useApi";
import { columnIcon, exportIcon, plusIcon, searchIcon, trash_1_icon, trash_2_icon } from "@/components/icons/globalIcons";

const { t } = useI18n();
const router = useRouter();
const { success, error } = useNotification();
const api = useApi();

const geoAreasIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 4.33301C18.0876 4.33301 11.6667 10.7539 11.6667 18.6663C11.6667 25.7604 17.4354 35.1195 23.0716 41.9692C24.015 43.109 24.4867 43.6789 25.122 43.9063C25.6669 44.1026 26.3331 44.1026 26.878 43.9063C27.5133 43.6789 27.985 43.109 28.9284 41.9692C34.5646 35.1195 40.3333 25.7604 40.3333 18.6663C40.3333 10.7539 33.9124 4.33301 26 4.33301ZM26 24.333C29.2216 24.333 31.8333 21.7213 31.8333 18.4997C31.8333 15.278 29.2216 12.6663 26 12.6663C22.7784 12.6663 20.1667 15.278 20.1667 18.4997C20.1667 21.7213 22.7784 24.333 26 24.333Z" fill="#1570EF"/>
</svg>`;

interface GeographicalZone {
    id: number;
    name: string;
    type: string;
    parent_name?: string;
    is_active: boolean;
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

interface Pagination {
    current_page: number;
    next_cursor: string | null;
    prev_cursor: string | null;
    per_page: number;
}

interface GeographicalZonesResponse {
    status: boolean;
    code: number;
    message: string;
    data: GeographicalZone[];
    pagination: Pagination;
    header_table: string;
    headers: TableHeader[];
    shownHeaders: TableHeader[];
    actions: {
        can_create: boolean;
        can_bulk_delete?: boolean;
    };
}

interface FilterParams {
    per_page?: number;
    cursor?: string | null;
    name?: string;
    type?: string;
    status?: number | boolean;
}

// === State ===
const tableItems = ref<GeographicalZone[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

// Pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

// Filters
const showAdvancedFilters = ref(false);
const filterName = ref('');
const filterType = ref('');
const filterStatus = ref<number | null>(null);

const StatusList = [
    { title: 'فعال', value: 1 },
    { title: 'غير فعال', value: 0 }
];

// Dialogs
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);
const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<GeographicalZone | null>(null);

// Selection
const selectedItems = ref<number[]>([]);
const hasSelectedItems = computed(() => selectedItems.value.length > 0);

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

// Column management
const tableName = ref('');
const {
    allHeaders: allColumnHeaders,
    shownHeaders: shownColumnHeaders,
    visibleHeaders,
    headerCheckStates,
    initHeaders,
    toggleHeader,
} = useTableColumns(tableName);

const showColumnsMenu = ref(false);

// === Computed ===
const tableHeaders = computed(() => {
    return visibleHeaders.value.map(header => ({
        key: header.key,
        title: header.title,
        width: '140px',
    }));
});

const fetchGeographicalZones = async (append = false) => {
    try {
        if (append) {
            loadingMore.value = true;
        } else {
            loading.value = true;
        }

        const filters: FilterParams = {
            per_page: perPage.value,
            cursor: append ? nextCursor.value : null,
        };

        if (filterName.value) filters.name = filterName.value;
        if (filterType.value) filters.type = filterType.value;
        if (filterStatus.value !== null) filters.status = filterStatus.value;

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `/geographical-zones?${queryString}` : '/geographical-zones';

        const response = await api.get<GeographicalZonesResponse>(url);

        const normalizedData = response.data.map(item => ({
            ...item,
            is_active: Boolean(item.is_active)
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = normalizedData;

            // Initialize headers from API response
            if (response.header_table) {
                tableName.value = response.header_table;
            }
            if (response.headers && response.shownHeaders) {
                const filteredHeaders = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions');
                const filteredShownHeaders = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions');
                initHeaders(filteredHeaders, filteredShownHeaders);
            }

            canCreate.value = response.actions.can_create;
            canBulkDelete.value = response.actions.can_bulk_delete ?? false;
        }

        nextCursor.value = response.pagination.next_cursor;
        previousCursor.value = response.pagination.prev_cursor;
    } catch (err: any) {
        console.error('Error fetching geographical zones:', err);
        error(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const fetchData = fetchGeographicalZones;

// === Handlers ===
const handleCreate = () => {
    router.push("/settings/geo-areas/create");
};

const handleEdit = (item: any) => {
    const zoneItem = item as GeographicalZone;
    router.push(`/settings/geo-areas/edit/${zoneItem.id}`);
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        await api.post('/geographical-zones/bulk-delete', { ids: selectedItems.value });
        success(`تم حذف ${selectedItems.value.length} منطقة جغرافية بنجاح`);
        selectedItems.value = [];
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting geographical zones:', err);
        error(err?.response?.data?.message || 'Failed to delete geographical zones');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleDeleteItem = async (item: any) => {
    try {
        await api.delete(`/geographical-zones/${item.id}`);
        success('تم حذف المنطقة الجغرافية بنجاح');
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting geographical zone:', err);
        error(err?.response?.data?.message || 'Failed to delete geographical zone');
    }
};

const handleStatusChange = (item: any) => {
    itemToChangeStatus.value = { ...item };
    showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
    if (!itemToChangeStatus.value) return;

    try {
        statusChangeLoading.value = true;
        const newStatus = !itemToChangeStatus.value.is_active;

        await api.patch(`/geographical-zones/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

        success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} المنطقة الجغرافية بنجاح`);

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus;
        }
    } catch (err: any) {
        console.error('Error changing status:', err);
        error(err?.response?.data?.message || 'Failed to change status');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const handleBulkDelete = () => {
    if (selectedItems.value.length === 0) return;
    showDeleteDialog.value = true;
};

const applyFilters = () => {
    fetchData();
};

const handleSelectitems = (item: any, selected: boolean) => {
    if (selected) {
        if (!selectedItems.value.includes(item.id)) {
            selectedItems.value.push(item.id);
        }
    } else {
        selectedItems.value = selectedItems.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllItems = (selected: boolean) => {
    if (selected) {
        selectedItems.value = tableItems.value.map((item) => item.id);
    } else {
        selectedItems.value = [];
    }
};

const resetFilters = () => {
    filterName.value = '';
    filterType.value = '';
    filterStatus.value = null;
    fetchData();
};

// === Infinite Scroll ===
const setupInfiniteScroll = () => {
    if (!loadMoreTrigger.value) return;

    observer.value = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
                fetchGeographicalZones(true);
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

// === Lifecycle ===
onMounted(() => {
    fetchData();
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
        <div class="geographical-zones-list-page">
            <PageHeader :icon="geoAreasIcon" title-key="pages.geoAreas.title"
                description-key="pages.geoAreas.description" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" :label="t('common.export')" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedItems ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedItems"
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
                        <v-menu v-model="showColumnsMenu" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500"
                                    height="40" custom-class="font-semibold text-base border-gray-400"
                                    :prepend-icon="columnIcon" :label="t('common.columns')"
                                    append-icon="mdi-chevron-down" />
                            </template>
                            <v-card min-width="200">
                                <v-list>
                                    <v-list-item v-for="header in allColumnHeaders" :key="header.key"
                                        @click="toggleHeader(header.key)">
                                        <template v-slot:prepend>
                                            <v-checkbox-btn :model-value="headerCheckStates[header.key]"
                                                @click.stop="toggleHeader(header.key)" />
                                        </template>
                                        <v-list-item-title>{{ header.title }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-menu>

                        <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف منطقة جغرافية" @click="handleCreate" />
                    </div>
                </div>

                <!-- Data Table -->
                <DataTable v-model="selectedItems" :headers="tableHeaders" :items="tableItems" :loading="loading"
                    show-actions show-checkbox item-value="id" @edit="handleEdit" @delete="handleDeleteItem" @select="handleSelectitems"
                    @selectAll="handleSelectAllItems">
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)"
                            v-if="item.actions?.can_change_status" />
                        <span v-else class="text-sm text-gray-600">--</span>
                    </template>
                </DataTable>

                <!-- Infinite scroll trigger (always in DOM so IntersectionObserver can attach) -->
                <div ref="loadMoreTrigger" class="h-4"></div>

                <!-- Loading more indicator -->
                <div v-if="loadingMore" class="flex justify-center items-center py-4">
                    <v-progress-circular indeterminate color="primary" size="32" />
                    <span class="mr-2 text-gray-600">جاري تحميل المزيد...</span>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading"
            :item-name="selectedItems.length === 1 ? 'المنطقة الجغرافية' : `${selectedItems.length} منطقة جغرافية`"
            @confirm="confirmBulkDelete" @cancel="showDeleteDialog = false" />

        <!-- Status Change Dialog -->
        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="itemToChangeStatus?.name" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />
    </default-layout>
</template>

<style scoped></style>
