<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

const router = useRouter();

interface VehicleData {
    id: number;
    vehicleNumber: string;
    plateNumber: string;
    vehicleType: string;
    vehicleCategory: string;
    loadType: string;
    manufacturer: string;
    manufacturingYear: string;
    loadCapacity: string;
    is_active: boolean;
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

// Demo data
const demoVehicles: VehicleData[] = [
    {
        id: 1,
        vehicleNumber: "2154B416",
        plateNumber: "SA-2154",
        vehicleType: "Truck",
        vehicleCategory: "Heavy Trucks",
        loadType: "Bulk",
        manufacturer: "Volvo",
        manufacturingYear: "2015",
        loadCapacity: "15 tons",
        is_active: true
    },
    {
        id: 2,
        vehicleNumber: "2154B416",
        plateNumber: "AB-B416",
        vehicleType: "Van",
        vehicleCategory: "Construction",
        loadType: "General",
        manufacturer: "Scania",
        manufacturingYear: "2020",
        loadCapacity: "20 RD",
        is_active: false
    },
    {
        id: 3,
        vehicleNumber: "2154B416",
        plateNumber: "XD-4B416",
        vehicleType: "Truck",
        vehicleCategory: "Heavy Trucks",
        loadType: "Hazardous",
        manufacturer: "Volvo",
        manufacturingYear: "2023",
        loadCapacity: "30 m^3",
        is_active: true
    },
];

const tableItems = ref<VehicleData[]>([...demoVehicles]);
const allHeaders = ref<TableHeader[]>([
    { key: "vehicleNumber", title: "رقم المركبة", sortable: true },
    { key: "plateNumber", title: "رقم اللوحة", sortable: true },
    { key: "vehicleType", title: "نوع المركبة", sortable: true },
    { key: "vehicleCategory", title: "فئة المركبة", sortable: true },
    { key: "loadType", title: "نوع الحمولة", sortable: true },
    { key: "manufacturer", title: "الشركة المصنعة", sortable: true },
    { key: "manufacturingYear", title: "سنة الصنع", sortable: true },
    { key: "loadCapacity", title: "سعة الحمولة", sortable: true },
    { key: "is_active", title: "الحالة", sortable: true },
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
const filterVehicleNumber = ref("");
const filterPlateNumber = ref("");
const filterVehicleType = ref("");

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const selectedVehicles = ref<number[]>([]);
const hasSelectedVehicles = computed(() => selectedVehicles.value.length > 0);

const fetchVehicles = async () => {
    try {
        loading.value = true;
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Apply filters
        let filteredData = [...demoVehicles];
        
        if (filterVehicleNumber.value) {
            filteredData = filteredData.filter(item => 
                item.vehicleNumber.includes(filterVehicleNumber.value)
            );
        }
        
        if (filterPlateNumber.value) {
            filteredData = filteredData.filter(item => 
                item.plateNumber.includes(filterPlateNumber.value)
            );
        }
        
        if (filterVehicleType.value) {
            filteredData = filteredData.filter(item => 
                item.vehicleType.includes(filterVehicleType.value)
            );
        }
        
        tableItems.value = filteredData;
    } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    fetchVehicles();
};

const resetFilters = () => {
    filterVehicleNumber.value = '';
    filterPlateNumber.value = '';
    filterVehicleType.value = '';
    fetchVehicles();
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

const openCreateVehicle = () => {
    router.push('/settings/vehicles-data/create');
};

const handleEditVehicle = (item: any) => {
    router.push(`/settings/vehicles-data/edit/${item.id}`);
};

const handleDeleteVehicle = async (item: any) => {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(v => v.id !== item.id);
        toast.success('تم حذف بيانات المركبة بنجاح');
    } catch (err: any) {
        console.error('Error deleting vehicle:', err);
        toast.error('حدث خطأ أثناء حذف بيانات المركبة');
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
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(item => !selectedVehicles.value.includes(item.id));
        toast.success(`تم حذف ${selectedVehicles.value.length} مركبة بنجاح`);
        selectedVehicles.value = [];
    } catch (err: any) {
        console.error('Error deleting vehicles:', err);
        toast.error('حدث خطأ أثناء حذف المركبات');
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
});

</script>

<template>
    <default-layout>
        <div class="vehicles-data-page">
            <PageHeader :icon="SettingsIcon" title-key="إدارة بيانات المركبات"
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
                            :prepend-icon="plusIcon" label="إضافة جديد" @click="openCreateVehicle" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
                    <div class="flex flex-wrap gap-3 justify-between">
                        <div class="flex gap-3 flex-wrap">
                            <TextInput v-model="filterVehicleNumber" density="comfortable" variant="outlined" hide-details
                                placeholder="رقم المركبة" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterPlateNumber" density="comfortable" variant="outlined" hide-details
                                placeholder="رقم اللوحة" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterVehicleType" density="comfortable" variant="outlined" hide-details
                                placeholder="نوع المركبة" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
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
                    show-actions @delete="handleDeleteVehicle" @edit="handleEditVehicle" @select="handleSelectVehicle"
                    @selectAll="handleSelectAllVehicles" :confirm-delete="true" forceShowDelete forceShowEdit>
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" />
                    </template>
                </DataTable>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف بيانات المركبات"
            :message="`هل أنت متأكد من حذف ${selectedVehicles.length} مركبة؟`" @confirm="confirmBulkDelete" />
    </default-layout>
</template>

<style scoped></style>
