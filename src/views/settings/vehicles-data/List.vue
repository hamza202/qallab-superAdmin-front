<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useApi } from "@/composables/useApi";
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

const router = useRouter();
const { t } = useI18n();
const api = useApi();

const icon = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M38.8333 17.1667V8.93333C38.8333 6.50644 38.8333 5.29299 38.361 4.36604C37.9456 3.55067 37.2827 2.88776 36.4673 2.47231C35.5403 2 34.3269 2 31.9 2H15.4333C13.0064 2 11.793 2 10.866 2.47231C10.0507 2.88776 9.38776 3.55067 8.9723 4.36604C8.5 5.29299 8.5 6.50644 8.5 8.93333V17.1667M8.5 15H2V12.8333M38.8333 15H45.3333V12.8333M10.6667 24.75H10.6883M36.6667 24.75H36.6883M12.4 17.1667H34.9333C38.5737 17.1667 40.3938 17.1667 41.7843 17.8751C43.0073 18.4983 44.0017 19.4927 44.6249 20.7157C45.3333 22.1062 45.3333 23.9263 45.3333 27.5667V34.5C45.3333 36.5191 45.3333 37.5286 45.0035 38.325C44.5637 39.3867 43.7201 40.2303 42.6583 40.6701C41.862 41 40.8524 41 38.8333 41H37.5333C36.7282 41 36.3256 41 35.9888 40.9466C34.1346 40.653 32.6804 39.1988 32.3867 37.3446C32.3333 37.0077 32.3333 36.6051 32.3333 35.8C32.3333 35.5987 32.3333 35.4981 32.32 35.4139C32.2466 34.9503 31.883 34.5868 31.4195 34.5133C31.3353 34.5 31.2346 34.5 31.0333 34.5H16.3C16.0987 34.5 15.9981 34.5 15.9139 34.5133C15.4503 34.5868 15.0868 34.9503 15.0133 35.4139C15 35.4981 15 35.5987 15 35.8C15 36.6051 15 37.0077 14.9466 37.3446C14.653 39.1988 13.1987 40.653 11.3445 40.9466C11.0077 41 10.6051 41 9.8 41H8.5C6.48092 41 5.47138 41 4.67504 40.6701C3.61325 40.2303 2.76966 39.3867 2.32986 38.325C2 37.5286 2 36.5191 2 34.5V27.5667C2 23.9263 2 22.1062 2.70846 20.7157C3.33163 19.4927 4.32601 18.4983 5.54906 17.8751C6.93949 17.1667 8.75966 17.1667 12.4 17.1667ZM11.75 24.75C11.75 25.3483 11.265 25.8333 10.6667 25.8333C10.0684 25.8333 9.58333 25.3483 9.58333 24.75C9.58333 24.1517 10.0684 23.6667 10.6667 23.6667C11.265 23.6667 11.75 24.1517 11.75 24.75ZM37.75 24.75C37.75 25.3483 37.265 25.8333 36.6667 25.8333C36.0684 25.8333 35.5833 25.3483 35.5833 24.75C35.5833 24.1517 36.0684 23.6667 36.6667 23.6667C37.265 23.6667 37.75 24.1517 37.75 24.75Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

interface VehicleData {
    id: number;
    vehicle_number: string;
    plate_number: string;
    vehicle_type: string;
    vehicle_category: string;
    cargo_type: string;
    manufacturer_id: number | null;
    manufacturing_year: number;
    cargo_capacity: number;
    fuel_type: string;
    gps_tracking: string;
    operational_readiness: string;
    vehicle_ownership: string;
    last_maintenance_date: string;
    insurance_status: string;
    driving_license_number: string;
    chassis_number: string;
    is_active: boolean;
    logistics_company?: {
        id: number;
        full_name: string;
    };
    actions?: {
        can_change_status?: boolean;
        can_edit?: boolean;
        can_delete?: boolean;
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

interface VehiclesResponse {
    status: boolean;
    code: number;
    message: string;
    data: VehicleData[];
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
    vehicle_number?: string;
    plate_number?: string;
    vehicle_type?: string;
    status?: number | boolean;
}

const tableItems = ref<VehicleData[]>([]);
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
const filterVehicleNumber = ref("");
const filterPlateNumber = ref("");
const filterVehicleType = ref("");
const filterStatus = ref<number | null>(null);

const StatusList = computed(() => [
    { title: t('common.status.active'), value: 1 },
    { title: t('common.status.inactive'), value: 0 }
]);

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<VehicleData | null>(null);

const selectedVehicles = ref<number[]>([]);
const hasSelectedVehicles = computed(() => selectedVehicles.value.length > 0);

const loadMoreTrigger = ref<HTMLElement | null>(null);

const fetchVehicles = async (append = false) => {
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

        if (filterVehicleNumber.value) filters.vehicle_number = filterVehicleNumber.value;
        if (filterPlateNumber.value) filters.plate_number = filterPlateNumber.value;
        if (filterVehicleType.value) filters.vehicle_type = filterVehicleType.value;
        if (filterStatus.value !== null) filters.status = filterStatus.value;

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `/vehicles?${queryString}` : '/vehicles';

        const response = await api.get<VehiclesResponse>(url);

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
            header_table.value = response.header_table;
        }

        nextCursor.value = response.pagination.next_cursor;
        previousCursor.value = response.pagination.prev_cursor;
    } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.loadDataFailed'));
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = async () => {
    if (!hasMoreData.value || loadingMore.value) return;
    await fetchVehicles(true);
};

const applyFilters = () => {
    fetchVehicles();
};

const resetFilters = () => {
    filterVehicleNumber.value = '';
    filterPlateNumber.value = '';
    filterVehicleType.value = '';
    filterStatus.value = null;
    fetchVehicles();
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
        toast.error(err?.response?.data?.message || t('common.messages.general.saveError'));
    } finally {
        updatingHeaders.value = false;
    }
};

const openCreateVehicle = () => {
    router.push('/settings/vehicles-data/create');
};

const handleView = (item: any) => {
    router.push({ name: "VehiclesDataView", params: { id: item.id } });
};


const handleEditVehicle = (item: any) => {
    router.push(`/settings/vehicles-data/edit/${item.id}`);
};

const handleDeleteVehicle = async (item: any) => {
    try {
        await api.delete(`/vehicles/${item.id}`);
        toast.success(t('common.messages.general.deleteSuccess'));
        await fetchVehicles();
    } catch (err: any) {
        console.error('Error deleting vehicle:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.deleteError'));
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

        await api.patch(`/vehicles/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

        toast.success(t(`common.messages.general.${newStatus ? 'activateSuccess' : 'deactivateSuccess'}`));

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus;
        }
    } catch (err: any) {
        console.error('Error changing status:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.changeStatusError'));
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

const handleBulkDelete = () => {
    if (selectedVehicles.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        await api.post('/vehicles/bulk-delete', { ids: selectedVehicles.value });
        toast.success(t('common.messages.general.bulkDeleteSuccess', { count: selectedVehicles.value.length }));
        selectedVehicles.value = [];
        await fetchVehicles();
    } catch (err: any) {
        console.error('Error deleting vehicles:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.deleteError'));
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleSelectVehicle = (item: any, selected: boolean) => {
    if (selected) {
        if (!selectedVehicles.value.includes(item.id)) {
            selectedVehicles.value.push(item.id);
        }
    } else {
        selectedVehicles.value = selectedVehicles.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllVehicles = (selected: boolean) => {
    if (selected) {
        selectedVehicles.value = tableItems.value.map((item) => item.id);
    } else {
        selectedVehicles.value = [];
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchVehicles();

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
        <div class="vehicles-data-page">
            <PageHeader :icon="icon" title-key="إدارة بيانات المركبات"
                description-key="تمكنك من إدارة وإضافة بيانات المركبات" />
            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" label="تصدير" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedVehicles ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedVehicles"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.table.deleteSelected')"
                            @click="handleBulkDelete" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.actions.delete')"
                            @click="handleBulkDelete" />
                    </div>

                    <div class="flex flex-wrap gap-3">
                        <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500"
                                    height="40" custom-class="font-semibold text-base border-gray-400"
                                    :prepend-icon="columnIcon" :label="t('common.table.columns')"
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
                            :prepend-icon="searchIcon" :label="t('common.table.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon v-if="canCreate" variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" :label="t('common.form.addNew')" @click="openCreateVehicle" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
                    <div class="flex flex-wrap gap-3 justify-between">
                        <div class="flex gap-3 flex-wrap">
                            <TextInput v-model="filterVehicleNumber" density="comfortable" variant="outlined" hide-details
                                :placeholder="t('pages.vehiclesData.list.filters.vehicleNumber')" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterPlateNumber" density="comfortable" variant="outlined" hide-details
                                :placeholder="t('pages.vehiclesData.list.filters.plateNumber')" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterVehicleType" density="comfortable" variant="outlined" hide-details
                                :placeholder="t('pages.vehiclesData.list.filters.vehicleType')" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <SelectInput v-model="filterStatus" :items="StatusList" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                :placeholder="t('pages.vehiclesData.list.filters.status')" class="w-full sm:w-40 bg-white"
                                @update:model-value="applyFilters" />
                        </div>

                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" :label="t('common.actions.search')" @click="applyFilters" />

                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" :label="t('common.actions.reset')" @click="resetFilters" />
                        </div>
                    </div>
                </div>

                <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="canBulkDelete"
                    show-actions @delete="handleDeleteVehicle" @view="handleView" @edit="handleEditVehicle" @select="handleSelectVehicle"
                    @selectAll="handleSelectAllVehicles" :confirm-delete="true">
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)"
                            v-if="item.actions?.can_change_status" />
                        <span v-else class="text-sm text-gray-600">--</span>
                    </template>
                </DataTable>

                <div ref="loadMoreTrigger" class="flex justify-center py-8">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" :title="$t('common.dialogs.delete.title')"
            :message="$t('common.messages.general.bulkDeleteConfirm', { count: selectedVehicles.length })" @confirm="confirmBulkDelete" />

        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="itemToChangeStatus?.vehicle_number" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />
    </default-layout>
</template>

<style scoped></style>
