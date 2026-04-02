<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CentralPathFormDialog from "@/views/settings/central-paths/components/CentralPathFormDialog.vue";
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

interface CentralPath {
    id: number;
    centralLocation: string;
    centralLocationName: string;
    city: string;
    cityName: string;
    is_active: boolean;
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

// Demo data
const demoPaths: CentralPath[] = [
    {
        id: 1,
        centralLocation: "riyadh-main",
        centralLocationName: "الرياض - المركز الرئيسي",
        city: "riyadh",
        cityName: "الرياض",
        is_active: true
    },
    {
        id: 2,
        centralLocation: "jeddah-west",
        centralLocationName: "جدة - المركز الغربي",
        city: "jeddah",
        cityName: "جدة",
        is_active: true
    },
    {
        id: 3,
        centralLocation: "dammam-east",
        centralLocationName: "الدمام - المركز الشرقي",
        city: "dammam",
        cityName: "الدمام",
        is_active: false
    },
    {
        id: 4,
        centralLocation: "makkah-religious",
        centralLocationName: "مكة المكرمة - المركز الديني",
        city: "makkah",
        cityName: "مكة المكرمة",
        is_active: true
    },
    {
        id: 5,
        centralLocation: "riyadh-main",
        centralLocationName: "الرياض - المركز الرئيسي",
        city: "khobar",
        cityName: "الخبر",
        is_active: true
    },
    {
        id: 6,
        centralLocation: "jeddah-west",
        centralLocationName: "جدة - المركز الغربي",
        city: "taif",
        cityName: "الطائف",
        is_active: false
    },
];

const tableItems = ref<CentralPath[]>([...demoPaths]);
const allHeaders = ref<TableHeader[]>([
    { key: "centralLocationName", title: "الموقع المركزي", sortable: true },
    { key: "cityName", title: "المدينة", sortable: true },
    { key: "is_active", title: "الحالة", sortable: false },
]);
const shownHeaders = ref<TableHeader[]>([...allHeaders.value]);
const canCreate = ref(true);
const canBulkDelete = ref(true);
const loading = ref(false);

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
const filterCentralLocation = ref("");
const filterCity = ref("");
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

const fetchCentralPaths = async () => {
    try {
        loading.value = true;
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Apply filters
        let filteredData = [...demoPaths];
        
        if (filterCentralLocation.value) {
            filteredData = filteredData.filter(item => 
                item.centralLocationName.includes(filterCentralLocation.value)
            );
        }
        
        if (filterCity.value) {
            filteredData = filteredData.filter(item => 
                item.cityName.includes(filterCity.value)
            );
        }
        
        if (filterStatus.value !== null) {
            filteredData = filteredData.filter(item => 
                item.is_active === Boolean(filterStatus.value)
            );
        }
        
        tableItems.value = filteredData;
    } catch (err: any) {
        console.error('Error fetching central paths:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    fetchCentralPaths();
};

const resetFilters = () => {
    filterCentralLocation.value = '';
    filterCity.value = '';
    filterStatus.value = null;
    fetchCentralPaths();
};

const toggleHeader = (headerKey: string) => {
    const isCurrentlyShown = shownHeaders.value.some(h => h.key === headerKey);

    if (isCurrentlyShown) {
        shownHeaders.value = shownHeaders.value.filter(h => h.key !== headerKey);
    } else {
        const headerToAdd = allHeaders.value.find(h => h.key === headerKey);
        if (headerToAdd) {
            shownHeaders.value.push(headerToAdd);
        }
    }
};

const openCreatePath = () => {
    editingPathId.value = null;
    showPathDialog.value = true;
};

const router = useRouter();

const handleViewPath = (item: any) => {
    router.push(`/settings/central-paths/${item.id}`);
};

const handleEditPath = (item: any) => {
    editingPathId.value = item.id;
    showPathDialog.value = true;
};

const handleDeletePath = async (item: any) => {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(p => p.id !== item.id);
        toast.success('تم حذف المسار المركزي بنجاح');
    } catch (err: any) {
        console.error('Error deleting central path:', err);
        toast.error('حدث خطأ أثناء حذف المسار المركزي');
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

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        toast.success(newStatus ? 'تم تفعيل المسار المركزي بنجاح' : 'تم تعطيل المسار المركزي بنجاح');

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus;
        }
    } catch (err: any) {
        console.error('Error changing status:', err);
        toast.error('حدث خطأ أثناء تغيير حالة المسار المركزي');
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
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(item => !selectedPaths.value.includes(item.id));
        toast.success(`تم حذف ${selectedPaths.value.length} مسار مركزي بنجاح`);
        selectedPaths.value = [];
    } catch (err: any) {
        console.error('Error deleting central paths:', err);
        toast.error('حدث خطأ أثناء حذف المسارات المركزية');
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
                            <TextInput v-model="filterCentralLocation" density="comfortable" variant="outlined" hide-details
                                placeholder="الموقع المركزي" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterCity" density="comfortable" variant="outlined" hide-details
                                placeholder="المدينة" class="w-full sm:w-40 bg-white"
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
                    @selectAll="handleSelectAllPaths" :confirm-delete="true">
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
            :item-name="itemToChangeStatus?.centralLocationName + ' - ' + itemToChangeStatus?.cityName" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />

        <CentralPathFormDialog v-model="showPathDialog" :path-id="editingPathId" @saved="handleSavePath" />
    </default-layout>
</template>

<style scoped></style>
