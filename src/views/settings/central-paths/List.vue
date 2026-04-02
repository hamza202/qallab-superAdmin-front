<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import CentralPathFormDialog from "@/views/settings/central-paths/components/CentralPathFormDialog.vue";
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

const router = useRouter();
const api = useApi();

// Types
interface CentralPath {
    id: number;
    geographical_zone: string;
    city: string;
    is_active: boolean;
    actions?: {
        can_update: boolean;
        can_delete: boolean;
        can_view: boolean;
        can_change_status: boolean;
    };
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

interface ZonesResponse {
    status: number;
    code: number;
    locale: string;
    message: string;
    data: CentralPath[];
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
    status?: number | null;
}

// API Data
const tableItems = ref<CentralPath[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const canBulkDelete = ref(true);
const header_table = ref('');
const loading = ref(false);
const loadingMore = ref(false);

// Pagination
const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
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
const filterStatus = ref<number | null>(null);

const StatusList = [
    { title: 'فعال', value: 1 },
    { title: 'غير فعال', value: 0 }
];

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<CentralPath | null>(null);

const showPathDialog = ref(false);
const editingPathId = ref<number | null>(null);

const selectedPaths = ref<number[]>([]);
const hasSelectedPaths = computed(() => selectedPaths.value.length > 0);

// Fetch zones from API
const fetchCentralPaths = async (append = false) => {
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
        if (filterStatus.value !== null) filters.status = filterStatus.value;

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `/zones?${queryString}` : '/zones';

        const response = await api.get<ZonesResponse>(url);

        const normalizedData = response.data.map(item => ({
            ...item,
            is_active: Boolean(item.is_active)
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = normalizedData;
            if (response.headers) {
                allHeaders.value = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions');
                shownHeaders.value = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions');
            }
            if (response.actions) {
                canCreate.value = response.actions.can_create;
                canBulkDelete.value = response.actions.can_bulk_delete ?? false;
            }
            if (response.header_table) {
                header_table.value = response.header_table;
            }
        }

        if (response.pagination) {
            nextCursor.value = response.pagination.next_cursor;
            previousCursor.value = response.pagination.prev_cursor;
        }
    } catch (err: any) {
        console.error('Error fetching zones:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = async () => {
    if (!hasMoreData.value || loadingMore.value) return;
    await fetchCentralPaths(true);
};

const applyFilters = () => {
    fetchCentralPaths();
};

const resetFilters = () => {
    filterName.value = '';
    filterStatus.value = null;
    fetchCentralPaths();
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
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حفظ الأعمدة');
    } finally {
        updatingHeaders.value = false;
    }
};

const openCreatePath = () => {
    editingPathId.value = null;
    showPathDialog.value = true;
};

const handleViewPath = (item: any) => {
    router.push(`/settings/central-paths/${item.id}`);
};

const handleEditPath = (item: any) => {
    editingPathId.value = item.id;
    showPathDialog.value = true;
};

const handleDeletePath = async (item: any) => {
    try {
        await api.delete(`/zones/${item.id}`);
        toast.success('تم حذف المسار المركزي بنجاح');
        await fetchCentralPaths();
    } catch (err: any) {
        console.error('Error deleting zone:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حذف المسار المركزي');
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

        await api.patch(`/zones/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

        toast.success(newStatus ? 'تم تفعيل المسار المركزي بنجاح' : 'تم تعطيل المسار المركزي بنجاح');

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus;
        }
    } catch (err: any) {
        console.error('Error changing status:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تغيير حالة المسار المركزي');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

const handleBulkDelete = () => {
    if (selectedPaths.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        await api.post('/zones/bulk-delete', { ids: selectedPaths.value });
        toast.success(`تم حذف ${selectedPaths.value.length} مسار مركزي بنجاح`);
        selectedPaths.value = [];
        await fetchCentralPaths();
    } catch (err: any) {
        console.error('Error deleting zones:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حذف المسارات المركزية');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleSavePath = async () => {
    await fetchCentralPaths();
    editingPathId.value = null;
};

const handleSelectPath = (item: any, selected: boolean) => {
    if (selected) {
        if (!selectedPaths.value.includes(item.id)) {
            selectedPaths.value.push(item.id);
        }
    } else {
        selectedPaths.value = selectedPaths.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllPaths = (selected: boolean) => {
    if (selected) {
        selectedPaths.value = tableItems.value.map((item) => item.id);
    } else {
        selectedPaths.value = [];
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchCentralPaths();
});
</script>

<template>
    <default-layout>
        <div class="central-paths-page">
            <PageHeader :icon="SettingsIcon" title-key="المسارات المركزية"
                description-key="إدارة المسارات المركزية والمدن المرتبطة بها" />
            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" label="تصدير" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedPaths ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedPaths"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" label="حذف المحدد"
                            @click="handleBulkDelete" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" label="حذف"
                            @click="handleBulkDelete" />
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500"
                                    height="40" custom-class="font-semibold text-base border-gray-400"
                                    :prepend-icon="columnIcon" label="الأعمدة"
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
                            :prepend-icon="searchIcon" label="بحث متقدم"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="إضافة جديد" @click="openCreatePath" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
                    <div class="flex flex-wrap gap-3 justify-between">
                        <div class="flex gap-3 flex-wrap">
                            <TextInput v-model="filterName" density="comfortable" variant="outlined" hide-details
                                placeholder="بحث بالاسم" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <SelectInput v-model="filterStatus" :items="StatusList" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="الحالة" class="w-full sm:w-40 bg-white"
                                @update:model-value="applyFilters" />
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
                    show-actions @delete="handleDeletePath" @edit="handleEditPath" @view="handleViewPath" @select="handleSelectPath" forceShowView forceShowDelete forceShowEdit
                    @selectAll="handleSelectAllPaths" :confirm-delete="true"
                    @load-more="loadMore" :loading-more="loadingMore" :has-more-data="hasMoreData">
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)" />
                    </template>
                </DataTable>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف المسارات المركزية"
            :message="`هل أنت متأكد من حذف ${selectedPaths.length} مسار مركزي؟`" @confirm="confirmBulkDelete" />

        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="(itemToChangeStatus?.geographical_zone || '') + ' - ' + (itemToChangeStatus?.city || '')" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />

        <CentralPathFormDialog v-model="showPathDialog" :path-id="editingPathId" @saved="handleSavePath" />
    </default-layout>
</template>

<style scoped></style>
