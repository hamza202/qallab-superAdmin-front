<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

const router = useRouter();

interface DriverData {
    id: number;
    tripNumber: string;
    driverName: string;
    identityNumber: string;
    tripType: string;
    currentInspectionDate: string;
    inspectionStatus: string;
    inspectionRating: number;
    is_active: boolean;
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

// Demo data
const demoDrivers: DriverData[] = [
    {
        id: 1,
        tripNumber: "12345668",
        driverName: "أحمد محمد",
        identityNumber: "254879632",
        tripType: "Forklift",
        currentInspectionDate: "2024-03-15",
        inspectionStatus: "نشط",
        inspectionRating: 4.5,
        is_active: true
    },
    {
        id: 2,
        tripNumber: "12345668",
        driverName: "محمد محمود",
        identityNumber: "5454842135",
        tripType: "Forklift",
        currentInspectionDate: "2024-03-10",
        inspectionStatus: "غير نشط",
        inspectionRating: 5.0,
        is_active: false
    },
    {
        id: 3,
        tripNumber: "12345668",
        driverName: "أحمد محمد",
        identityNumber: "5652326459",
        tripType: "Forklift",
        currentInspectionDate: "2024-03-20",
        inspectionStatus: "نشط",
        inspectionRating: 4.8,
        is_active: true
    },
    {
        id: 4,
        tripNumber: "12345669",
        driverName: "خالد أحمد",
        identityNumber: "1234567890",
        tripType: "Truck",
        currentInspectionDate: "2024-03-18",
        inspectionStatus: "نشط",
        inspectionRating: 4.2,
        is_active: true
    },
    {
        id: 5,
        tripNumber: "12345670",
        driverName: "علي حسن",
        identityNumber: "9876543210",
        tripType: "Forklift",
        currentInspectionDate: "2024-03-12",
        inspectionStatus: "غير نشط",
        inspectionRating: 3.8,
        is_active: false
    },
];

const tableItems = ref<DriverData[]>([...demoDrivers]);
const allHeaders = ref<TableHeader[]>([
    { key: "tripNumber", title: "رقم رخصة السائق", sortable: true },
    { key: "driverName", title: "اسم السائق", sortable: true },
    { key: "identityNumber", title: "رقم الهوية", sortable: true },
    { key: "tripType", title: "نوع الرخصة", sortable: true },
    { key: "inspectionRating", title: "تقييم السائق", sortable: true },
    { key: "inspectionStatus", title: "الحالة", sortable: false },
    { key: "is_active", title: "الإجراءات", sortable: false },
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
const filterDriverName = ref("");
const filterIdentityNumber = ref("");
const filterTripType = ref("");

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const selectedDrivers = ref<number[]>([]);
const hasSelectedDrivers = computed(() => selectedDrivers.value.length > 0);

const fetchDrivers = async () => {
    try {
        loading.value = true;
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Apply filters
        let filteredData = [...demoDrivers];
        
        if (filterDriverName.value) {
            filteredData = filteredData.filter(item => 
                item.driverName.includes(filterDriverName.value)
            );
        }
        
        if (filterIdentityNumber.value) {
            filteredData = filteredData.filter(item => 
                item.identityNumber.includes(filterIdentityNumber.value)
            );
        }
        
        if (filterTripType.value) {
            filteredData = filteredData.filter(item => 
                item.tripType.includes(filterTripType.value)
            );
        }
        
        tableItems.value = filteredData;
    } catch (err: any) {
        console.error('Error fetching drivers:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    fetchDrivers();
};

const resetFilters = () => {
    filterDriverName.value = '';
    filterIdentityNumber.value = '';
    filterTripType.value = '';
    fetchDrivers();
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

const openCreateDriver = () => {
    router.push('/settings/drivers-data/create');
};

const handleEditDriver = (item: any) => {
    router.push(`/settings/drivers-data/edit/${item.id}`);
};

const handleDeleteDriver = async (item: any) => {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(d => d.id !== item.id);
        toast.success('تم حذف بيانات السائق بنجاح');
    } catch (err: any) {
        console.error('Error deleting driver:', err);
        toast.error('حدث خطأ أثناء حذف بيانات السائق');
    }
};

const handleBulkDelete = () => {
    if (selectedDrivers.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(item => !selectedDrivers.value.includes(item.id));
        toast.success(`تم حذف ${selectedDrivers.value.length} سائق بنجاح`);
        selectedDrivers.value = [];
    } catch (err: any) {
        console.error('Error deleting drivers:', err);
        toast.error('حدث خطأ أثناء حذف السائقين');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleSelectDriver = (item: any, selected: boolean) => {
    if (selected) {
        if (!selectedDrivers.value.includes(item.id)) {
            selectedDrivers.value.push(item.id);
        }
    } else {
        selectedDrivers.value = selectedDrivers.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllDrivers = (selected: boolean) => {
    if (selected) {
        selectedDrivers.value = tableItems.value.map((item) => item.id);
    } else {
        selectedDrivers.value = [];
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchDrivers();
});

</script>

<template>
    <default-layout>
        <div class="drivers-data-page">
            <PageHeader :icon="SettingsIcon" title-key="إدارة بيانات السائقين"
                description-key="تمكنك من إدارة وإضافة بيانات السائقين" />
            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" label="تصدير" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedDrivers ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedDrivers"
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
                            :prepend-icon="plusIcon" label="إضافة جديد" @click="openCreateDriver" />
                    </div>
                </div>

                <div v-if="showAdvancedFilters" class="border-b border-gray-300 px-4 sm:px-6 py-4 bg-white">
                    <div class="flex flex-wrap gap-3 justify-between">
                        <div class="flex gap-3 flex-wrap">
                            <TextInput v-model="filterDriverName" density="comfortable" variant="outlined" hide-details
                                placeholder="اسم السائق" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterIdentityNumber" density="comfortable" variant="outlined" hide-details
                                placeholder="رقم الهوية" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterTripType" density="comfortable" variant="outlined" hide-details
                                placeholder="نوع الرخصة" class="w-full sm:w-40 bg-white"
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
                    show-actions @delete="handleDeleteDriver" @edit="handleEditDriver" @select="handleSelectDriver"
                    @selectAll="handleSelectAllDrivers" :confirm-delete="true" forceShowDelete forceShowEdit>
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" />
                    </template>
                    <template #item.inspectionRating="{ item }">
                        <span class="font-semibold text-primary-600">{{ item.inspectionRating }}</span>
                    </template>
                    <template #item.inspectionStatus="{ item }">
                        <span :class="item.is_active ? 'text-success-600' : 'text-gray-600'">{{ item.inspectionStatus }}</span>
                    </template>
                </DataTable>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف بيانات السائقين"
            :message="`هل أنت متأكد من حذف ${selectedDrivers.length} سائق؟`" @confirm="confirmBulkDelete" />
    </default-layout>
</template>

<style scoped></style>
