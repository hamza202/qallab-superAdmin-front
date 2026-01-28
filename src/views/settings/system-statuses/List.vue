<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import StatusFormDialog from "@/views/settings/system-statuses/components/StatusFormDialog.vue";
import { useI18n } from 'vue-i18n'
import { useApi } from "@/composables/useApi";
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

const { t } = useI18n()
const api = useApi();

interface SystemStatus {
    id: number;
    name: string;
    color: string;
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

interface SystemStatusesResponse {
    status: boolean;
    code: number;
    message: string;
    data: SystemStatus[];
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
    created_by?: string;
    created_at?: string;
    status?: number | boolean;
}


const tableItems = ref<SystemStatus[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(true);
const header_table = ref('');
const loading = ref(false);
const loadingMore = ref(false);

const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(5);
const hasMoreData = computed(() => nextCursor.value !== null);

const tableHeaders = computed(() => shownHeaders.value);

const showHeadersMenu = ref(false);
const updatingHeaders = ref(false);

const headerCheckStates = computed(() => {
    const states: Record<string, boolean> = {};
    allHeaders.value.forEach(header => {
        states[header.key] = shownHeaders.value.some(sh => sh.key === header.key);
    });
    return states;
});

const showAdvancedFilters = ref(false);
const filterName = ref("");
const filterCreatedBy = ref("");
const filterCreatedAt = ref<string | null>(null);
const filterStatus = ref<number | null>(null);

const StatusList = [
    { title: 'فعال', value: 1 },
    { title: 'غير فعال', value: 0 }
]

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<SystemStatus | null>(null);

const showStatusDialog = ref(false);
const editingStatusId = ref<number | null>(null);

const selectedStatuses = ref<number[]>([]);
const hasSelectedStatuses = computed(() => selectedStatuses.value.length > 0);

const loadMoreTrigger = ref<HTMLElement | null>(null);

const fetchSystemStatuses = async (append = false) => {
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
        const url = queryString ? `/system-statuses?${queryString}` : '/system-statuses';

        const response = await api.get<SystemStatusesResponse>(url);

        const normalizedData = response.data.map(item => ({
            ...item,
            is_active: Boolean(item.is_active)
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = normalizedData;
            allHeaders.value = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions');
            shownHeaders.value = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions');
            canCreate.value = response.actions.can_create;
            canBulkDelete.value = response.actions.can_bulk_delete ?? false;
            header_table.value = response.header_table
        }

        nextCursor.value = response.pagination.next_cursor;
        previousCursor.value = response.pagination.prev_cursor;
    } catch (err: any) {
        console.error('Error fetching system statuses:', err);
        toast.error(err?.response?.data?.message || 'Failed to fetch system statuses');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = async () => {
    if (!hasMoreData.value || loadingMore.value) return;
    await fetchSystemStatuses(true);
};

const applyFilters = () => {
    fetchSystemStatuses();
};

const resetFilters = () => {
    filterName.value = '';
    filterCreatedBy.value = ''
    filterCreatedAt.value = null;
    filterStatus.value = null;
    fetchSystemStatuses();
};

const toggleHeader = async (headerKey: string) => {
    const isCurrentlyShown = shownHeaders.value.some(h => h.key === headerKey);

    if (isCurrentlyShown) {
        shownHeaders.value = shownHeaders.value.filter(h => h.key !== headerKey);
    } else {
        const headerToAdd = allHeaders.value.find(h => h.key === headerKey);
        if (headerToAdd) {
            shownHeaders.value.push(headerToAdd);
        }
    }

    await updateHeadersOnServer();
};

const updateHeadersOnServer = async () => {
    try {
        updatingHeaders.value = true;
        const headerKeys = shownHeaders.value.map(h => h.key);

        const formData = new FormData();
        formData.append('table', header_table.value);
        headerKeys.forEach((header, index) => {
            formData.append(`header[${index}]`, header);
        });

        await api.post('/headers', formData);
    } catch (err: any) {
        console.error('Error updating headers:', err);
        toast.error(err?.response?.data?.message || 'Failed to update headers');
    } finally {
        updatingHeaders.value = false;
    }
};

const openCreateStatus = () => {
    editingStatusId.value = null;
    showStatusDialog.value = true;
};

const handleEditStatus = (item: any) => {
    editingStatusId.value = item.id;
    showStatusDialog.value = true;
};

const handleDeleteStatus = async (item: any) => {
    try {
        await api.delete(`/system-statuses/${item.id}`);
        toast.success('تم حذف حالة النظام بنجاح');
        await fetchSystemStatuses();
    } catch (err: any) {
        console.error('Error deleting system status:', err);
        toast.error(err?.response?.data?.message || 'Failed to delete system status');
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

        await api.patch(`/system-statuses/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

        toast.success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} حالة النظام بنجاح`);

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus;
        }
    } catch (err: any) {
        console.error('Error changing status:', err);
        toast.error(err?.response?.data?.message || 'Failed to change status');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

const handleBulkDelete = () => {
    if (selectedStatuses.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        await api.post('/system-statuses/bulk-delete', { ids: selectedStatuses.value });
        toast.success(`تم حذف ${selectedStatuses.value.length} حالة نظام بنجاح`);
        selectedStatuses.value = [];
        await fetchSystemStatuses();
    } catch (err: any) {
        console.error('Error deleting system statuses:', err);
        toast.error(err?.response?.data?.message || 'Failed to delete system statuses');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleSaveStatus = async () => {
    await fetchSystemStatuses();
    editingStatusId.value = null;
};

const handleSelectStatus = (item: any, selected: boolean) => {
    if (selected) {
        if (!selectedStatuses.value.includes(item.id)) {
            selectedStatuses.value.push(item.id);
        }
    } else {
        selectedStatuses.value = selectedStatuses.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllStatuses = (selected: boolean) => {
    if (selected) {
        selectedStatuses.value = tableItems.value.map((item) => item.id);
    } else {
        selectedStatuses.value = [];
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchSystemStatuses();

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && hasMoreData.value && !loadingMore.value) {
                loadMore();
            }
        },
        { threshold: 0.1 }
    );

    if (loadMoreTrigger.value) {
        observer.observe(loadMoreTrigger.value);
    }
});

</script>

<template>
    <default-layout>
        <div class="system-statuses-page">
            <PageHeader :icon="SettingsIcon" title-key="pages.systemStatuses.title"
                description-key="pages.systemStatuses.description" />
            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" :label="t('common.export')" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedStatuses ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedStatuses"
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
                            <template v-slot:activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500"
                                    height="40" custom-class="font-semibold text-base border-gray-400"
                                    :prepend-icon="columnIcon" :label="t('common.columns')"
                                    append-icon="mdi-chevron-down" />
                            </template>
                            <v-list>
                                <v-list-item v-for="header in allHeaders" :key="header.key"
                                    @click="toggleHeader(header.key)">
                                    <template v-slot:prepend>
                                        <v-checkbox-btn :model-value="headerCheckStates[header.key]"
                                            :disabled="updatingHeaders"
                                            @click.stop="toggleHeader(header.key)"></v-checkbox-btn>
                                    </template>
                                    <v-list-item-title>{{ header.title }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" :label="t('common.addNew')" @click="openCreateStatus" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
                    <div class="flex flex-wrap gap-3 justify-between">
                        <div class="flex gap-3 flex-wrap">
                            <TextInput v-model="filterName" density="comfortable" variant="outlined" hide-details
                                placeholder="اسم حالة النظام" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterCreatedBy" density="comfortable" variant="outlined" hide-details
                                placeholder="أنشأ بواسطة" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <SelectInput v-model="filterStatus" :items="StatusList" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="الحالة" class="w-full sm:w-40 bg-white"
                                @update:model-value="applyFilters" />
                            <DatePickerInput v-model="filterCreatedAt" placeholder="تاريخ الإنشاء" hide-details
                                class="w-full sm:w-40 bg-white" />
                        </div>

                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" label="بحث" @click="applyFilters" />

                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
                        </div>
                    </div>
                </div>

                <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete"
                    show-actions @delete="handleDeleteStatus" @edit="handleEditStatus" @select="handleSelectStatus"
                    @selectAll="handleSelectAllStatuses" :confirm-delete="true">
                    <template #item.color="{ item }">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full border-[3px]" :style="{ backgroundColor: item.color }"></div>
                        </div>
                    </template>
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)"
                            v-if="item.actions.can_change_status" />
                        <span v-else class="text-sm text-gray-600">--</span>
                    </template>
                </DataTable>

                <div ref="loadMoreTrigger" class="flex justify-center py-8">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف حالات النظام"
            :message="`هل أنت متأكد من حذف ${selectedStatuses.length} حالة نظام؟`" @confirm="confirmBulkDelete" />

        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="itemToChangeStatus?.name" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />

        <StatusFormDialog v-model="showStatusDialog" :status-id="editingStatusId" @saved="handleSaveStatus" />
    </default-layout>
</template>

<style scoped></style>
