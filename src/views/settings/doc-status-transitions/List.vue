<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNotification } from '@/composables/useNotification';
import { useTableColumns } from '@/composables/useTableColumns';
import { useApi } from "@/composables/useApi";
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon, arrowsTriangleIcon } from "@/components/icons/globalIcons";

const { t } = useI18n();
const router = useRouter();
const { success, error } = useNotification();
const api = useApi();

interface DocStatusTransition {
    id: number;
    document_type: string;
    current_status: string;
    next_status: string;
    requires_approval: boolean;
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

interface DocStatusTransitionsResponse {
    status: boolean;
    code: number;
    message: string;
    data: DocStatusTransition[];
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
    document_type?: string;
    current_status?: string;
    next_status?: string;
    created_by?: string;
    created_at?: string;
    status?: number | boolean;
}


// === State ===
const tableItems = ref<DocStatusTransition[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(false);
const canShowWorkflow = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

// Pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

// Filters
const showAdvancedFilters = ref(false);
const filterDocumentType = ref('');
const filterCurrentStatus = ref('');
const filterNextStatus = ref('');
const filterCreatedBy = ref('');
const filterCreatedAt = ref<string | null>(null);
const filterStatus = ref<number | null>(null);

const StatusList = [
    { title: 'فعال', value: 1 },
    { title: 'غير فعال', value: 0 }
];

// Dialogs
const showDeleteDialog = ref(false);
const deleteLoading = ref(false);
const itemToDelete = ref<DocStatusTransition | null>(null);
const showStatusDialog = ref(false);
const statusLoading = ref(false);
const itemToChangeStatus = ref<DocStatusTransition | null>(null);

// Selection
const selectedItems = ref<number[]>([]);
const hasSelectedItems = computed(() => selectedItems.value.length > 0);

// Infinite scroll
const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

// Column management
const {
    allHeaders: allColumnHeaders,
    shownHeaders: shownColumnHeaders,
    visibleHeaders,
    headerCheckStates,
    initHeaders,
    toggleHeader,
} = useTableColumns('doc-status-transitions');

const showColumnsMenu = ref(false);

// === Computed ===
const tableHeaders = computed(() => {
    return visibleHeaders.value.map(header => ({
        key: header.key,
        title: header.title,
        width: '140px',
    }));
});

const fetchDocStatusTransitions = async (append = false) => {
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

        if (filterDocumentType.value) filters.document_type = filterDocumentType.value;
        if (filterCurrentStatus.value) filters.current_status = filterCurrentStatus.value;
        if (filterNextStatus.value) filters.next_status = filterNextStatus.value;
        if (filterCreatedBy.value) filters.created_by = filterCreatedBy.value;
        if (filterCreatedAt.value) filters.created_at = filterCreatedAt.value;
        if (filterStatus.value !== null) filters.status = filterStatus.value;

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `/doc-status-transitions?${queryString}` : '/doc-status-transitions';

        const response = await api.get<DocStatusTransitionsResponse>(url);

        const normalizedData = response.data.map(item => ({
            ...item,
            is_active: Boolean(item.is_active),
            requires_approval: Boolean(item.requires_approval)
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = normalizedData;

            // Initialize headers from API response
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
        console.error('Error fetching doc status transitions:', err);
        error(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const fetchData = fetchDocStatusTransitions;

// === Handlers ===
const handleCreate = () => {
    router.push("/settings/doc-status-transitions/create");
};

const handleTransitionsClick = (item: any) => {
    const transitionItem = item as DocStatusTransition;
    router.push(`/settings/doc-status-transitions/status-transition/${transitionItem.id}`);
}

const handleEdit = (item: any) => {
    const transitionItem = item as DocStatusTransition;
    router.push(`/settings/doc-status-transitions/edit/${transitionItem.id}`);
};

const confirmDelete = async () => {
    if (selectedItems.value.length === 0) return;

    try {
        deleteLoading.value = true;

        await api.post('/doc-status-transitions/bulk-delete', { ids: selectedItems.value });
        success(`تم حذف ${selectedItems.value.length} مسار عمل بنجاح`);
        selectedItems.value = [];
        showDeleteDialog.value = false;
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting transition:', err);
        error(err?.response?.data?.message || 'فشل حذف مسار العمل');
    } finally {
        deleteLoading.value = false;
    }
};




const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const handleBulkDelete = () => {
    if (selectedItems.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        await api.post('/doc-status-transitions/bulk-delete', { ids: selectedItems.value });
        success(`تم حذف ${selectedItems.value.length} مسار عمل بنجاح`);
        selectedItems.value = [];
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting doc status transitions:', err);
        error(err?.response?.data?.message || 'Failed to delete doc status transitions');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleDeleteItem = async (item: any) => {
    try {
        await api.delete(`/doc-status-transitions/${item.id}`);
        success('تم حذف مسار العمل بنجاح');
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting doc-status-transitions:', err);
        error(err?.response?.data?.message || 'Failed to delete doc-status-transitions');
    }
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
    filterDocumentType.value = '';
    filterCurrentStatus.value = '';
    filterNextStatus.value = '';
    filterCreatedBy.value = '';
    filterCreatedAt.value = null;
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
                fetchDocStatusTransitions(true);
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
        <div class="doc-transitions-list-page">
            <PageHeader :icon="SettingsIcon" title-key="pages.docStatusTransitions.title"
                description-key="pages.docStatusTransitions.description" />

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

                        <!-- <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" /> -->

                        <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف مسار عمل" @click="handleCreate" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <!-- <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
                    <div class="flex flex-wrap gap-3 flex-1 justify-between">
                        <div class="flex gap-3 flex-1">
                            <TextInput v-model="filterCurrentStatus" density="comfortable" variant="outlined"
                                hide-details placeholder="الحالة الحالية" class="w-full sm:w-60 bg-white" />
                            <TextInput v-model="filterNextStatus" density="comfortable" variant="outlined" hide-details
                                placeholder="الحالة التالية" class="w-full sm:w-60 bg-white" />
                            <SelectInput v-model="filterStatus" :items="StatusList" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="الحالة" class="w-full sm:w-40 bg-white" />
                        </div>
                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" :label="t('common.search')" @click="applyFilters" />
                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" :label="t('common.reset')" @click="resetFilters" />
                        </div>
                    </div>
                </div> -->

                <!-- Data Table -->
                <DataTable v-model="selectedItems" :headers="tableHeaders" :items="tableItems" :loading="loading"
                    show-actions show-checkbox item-value="id" @edit="handleEdit" @delete="handleDeleteItem" @select="handleSelectitems"
                    @selectAll="handleSelectAllItems">
                    <template #item.is_required="{ item }">
                        <v-switch :model-value="item.is_required" hide-details inset density="compact" color="primary"
                            class="small-switch" />
                    </template>
                    <template #item.has_auto_action="{ item }">
                        <v-switch :model-value="item.has_auto_action" hide-details inset density="compact"
                            color="primary" class="small-switch" />
                    </template>
                    <template #item.next_status="{ item }">
                        {{ item?.next_status?.join(', ') || '--' }}
                    </template>
                    <template #item.rollback_status="{ item }">
                        {{ item?.rollback_status?.join(', ') || '--' }}
                    </template>

                    <template #item.status_name_color="{ item }">
                        <div class="flex gap-2 items-center">
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 rounded-full border-[3px]"
                                    :style="{ backgroundColor: item.status_name_color.color }"></div>
                            </div>
                            <span class="text-sm text-gray-600">
                                {{ item.status_name_color.name }}
                            </span>
                        </div>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="flex items-center" v-if="item.actions.can_show_workflow">
                            <v-btn icon variant="text" size="small" @click="handleTransitionsClick(item)">
                                <span v-html="arrowsTriangleIcon"></span>
                            </v-btn>
                        </div>
                    </template>

                </DataTable>

                <!-- Loading more indicator -->
                <div v-if="hasMoreData" ref="loadMoreTrigger" class="flex justify-center py-4">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading"
            :item-name="selectedItems.length === 1 ? 'مسار العمل' : `${selectedItems.length} مسار عمل`"
            @confirm="confirmBulkDelete" @cancel="showDeleteDialog = false" />
    </default-layout>
</template>

<style scoped></style>
