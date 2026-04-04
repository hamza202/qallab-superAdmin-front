<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useApi } from "@/composables/useApi";
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, searchIcon } from "@/components/icons/globalIcons";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog.vue";
import StatusChangeDialog from "@/components/common/StatusChangeDialog.vue";

const router = useRouter();
const api = useApi();

interface CustomPricing {
    id: number;
    is_active: boolean;
    actions?: {
        can_update: boolean;
        can_delete: boolean;
        can_view: boolean;
        can_change_status: boolean;
    };
    [key: string]: any;
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

const tableItems = ref<CustomPricing[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const header_table = ref('');
const canBulkDelete = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

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
const itemToChangeStatus = ref<CustomPricing | null>(null);

const selectedItems = ref<number[]>([]);
const hasSelectedItems = computed(() => selectedItems.value.length > 0);

const fetchData = async (append = false) => {
    try {
        if (append) {
            loadingMore.value = true;
        } else {
            loading.value = true;
        }

        const params = new URLSearchParams();
        params.append('per_page', String(perPage.value));
        if (append && nextCursor.value) params.append('cursor', nextCursor.value);
        if (filterName.value) params.append('name', filterName.value);
        if (filterStatus.value !== null) params.append('status', String(filterStatus.value));

        const response = await api.get<any>(`/zone-custom-pricings?${params.toString()}`);

        const normalizedData = (response.data || []).map((item: any) => ({
            ...item,
            is_active: Boolean(item.is_active),
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = normalizedData;
            if (response.headers) {
                allHeaders.value = response.headers.filter((h: TableHeader) => h.key !== 'id' && h.key !== 'actions');
                shownHeaders.value = response.shownHeaders.filter((h: TableHeader) => h.key !== 'id' && h.key !== 'actions');
            }
            if (response.actions) {
                canBulkDelete.value = response.actions.can_bulk_delete ?? false;
            }
            if (response.header_table) {
                header_table.value = response.header_table;
            }
        }

        if (response.pagination) {
            nextCursor.value = response.pagination.next_cursor;
            previousCursor.value = response.pagination.previous_cursor;
        }
    } catch (err: any) {
        console.error('Error fetching pricings:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = async () => {
    if (!hasMoreData.value || loadingMore.value) return;
    await fetchData(true);
};

const applyFilters = () => {
    fetchData();
};

const resetFilters = () => {
    filterName.value = '';
    filterStatus.value = null;
    fetchData();
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

const handleEdit = (item: any) => {
    router.push(`/settings/custom-pricing/edit/${item.id}`);
};

const handleView = (item: any) => {
    router.push(`/settings/custom-pricing/view/${item.id}`);
};

const handleDelete = async (item: any) => {
    try {
        await api.delete(`/zone-custom-pricings/${item.id}`);
        toast.success('تم حذف التسعير بنجاح');
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting pricing:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حذف التسعير');
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

        await api.patch(`/zone-custom-pricings/${itemToChangeStatus.value.id}/change-status`, { status: newStatus });

        toast.success(newStatus ? 'تم تفعيل التسعير بنجاح' : 'تم تعطيل التسعير بنجاح');

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus;
        }
    } catch (err: any) {
        console.error('Error changing status:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

const handleBulkDelete = () => {
    if (selectedItems.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        await api.post('/zone-custom-pricings/bulk-delete', { ids: selectedItems.value });
        toast.success(`تم حذف ${selectedItems.value.length} تسعير بنجاح`);
        selectedItems.value = [];
        await fetchData();
    } catch (err: any) {
        console.error('Error deleting pricings:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حذف التسعيرات');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleSelectItem = (item: any, selected: boolean) => {
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

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <default-layout>
        <div class="custom-pricing-page">
            <PageHeader :icon="SettingsIcon" title-key="التسعير المخصص"
                description-key="إدارة التسعيرات المخصصة" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" label="تصدير" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedItems ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedItems"
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
                    show-actions @delete="handleDelete" @edit="handleEdit" @view="handleView"
                    @select="handleSelectItem" @selectAll="handleSelectAllItems" :confirm-delete="true"
                    @load-more="loadMore" :loading-more="loadingMore" :has-more-data="hasMoreData">
                    <template #item.is_active="{ item }">
                        <v-switch v-if="item.actions?.can_change_status" :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)" />
                        <span v-else class="text-sm text-gray-600">--</span>
                    </template>
                    <template #item.status="{ item }">
                        <v-switch v-if="item.actions?.can_change_status" :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)" />
                        <span v-else class="text-sm text-gray-600">--</span>
                    </template>
                </DataTable>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف التسعيرات"
            :message="`هل أنت متأكد من حذف ${selectedItems.length} تسعير؟`" @confirm="confirmBulkDelete" />

        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="'التسعير'" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />
    </default-layout>
</template>

<style scoped></style>
