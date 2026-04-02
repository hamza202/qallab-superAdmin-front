<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { SettingsIcon, trash_1_icon, trash_2_icon, columnIcon, exportIcon, plusIcon, searchIcon } from "@/components/icons/globalIcons";

const router = useRouter();

interface PricingByTruck {
    id: number;
    centralLocation: string;
    centralLocationName: string;
    city: string;
    cityName: string;
    direction: string;
    minDistance: number;
    maxDistance: number;
    materialType: string;
    materialTypeName: string;
    tripDuration: number;
    pricePerTon: number;
    truckType: string;
    truckTypeName: string;
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

// Demo data
const demoPricings: PricingByTruck[] = [
    {
        id: 1,
        centralLocation: "riyadh-main",
        centralLocationName: "الرياض - المركز الرئيسي",
        city: "riyadh",
        cityName: "الرياض",
        direction: "ذهاب",
        minDistance: 50,
        maxDistance: 100,
        materialType: "general",
        materialTypeName: "منتجات عامة",
        tripDuration: 2,
        pricePerTon: 500,
        truckType: "small",
        truckTypeName: "شاحنة صغيرة"
    },
    {
        id: 2,
        centralLocation: "jeddah-west",
        centralLocationName: "جدة - المركز الغربي",
        city: "jeddah",
        cityName: "جدة",
        direction: "إياب",
        minDistance: 100,
        maxDistance: 200,
        materialType: "construction",
        materialTypeName: "مواد بناء أولية",
        tripDuration: 4,
        pricePerTon: 800,
        truckType: "medium",
        truckTypeName: "شاحنة متوسطة"
    },
    {
        id: 3,
        centralLocation: "dammam-east",
        centralLocationName: "الدمام - المركز الشرقي",
        city: "dammam",
        cityName: "الدمام",
        direction: "ذهاب",
        minDistance: 30,
        maxDistance: 80,
        materialType: "fuel",
        materialTypeName: "محروقات",
        tripDuration: 1.5,
        pricePerTon: 450,
        truckType: "large",
        truckTypeName: "شاحنة كبيرة"
    },
    {
        id: 4,
        centralLocation: "makkah-religious",
        centralLocationName: "مكة المكرمة - المركز الديني",
        city: "makkah",
        cityName: "مكة المكرمة",
        direction: "إياب",
        minDistance: 150,
        maxDistance: 250,
        materialType: "spare-parts",
        materialTypeName: "قطع غيار",
        tripDuration: 5,
        pricePerTon: 1000,
        truckType: "trailer",
        truckTypeName: "شاحنة مقطورة"
    },
    {
        id: 5,
        centralLocation: "riyadh-main",
        centralLocationName: "الرياض - المركز الرئيسي",
        city: "khobar",
        cityName: "الخبر",
        direction: "ذهاب",
        minDistance: 200,
        maxDistance: 300,
        materialType: "general",
        materialTypeName: "منتجات عامة",
        tripDuration: 6,
        pricePerTon: 1200,
        truckType: "dump",
        truckTypeName: "شاحنة قلاب"
    },
    {
        id: 6,
        centralLocation: "jeddah-west",
        centralLocationName: "جدة - المركز الغربي",
        city: "taif",
        cityName: "الطائف",
        direction: "إياب",
        minDistance: 80,
        maxDistance: 120,
        materialType: "construction",
        materialTypeName: "مواد بناء أولية",
        tripDuration: 3,
        pricePerTon: 650,
        truckType: "medium",
        truckTypeName: "شاحنة متوسطة"
    },
];

const tableItems = ref<PricingByTruck[]>([...demoPricings]);
const allHeaders = ref<TableHeader[]>([
    { key: "centralLocationName", title: "الموقع المركزي", sortable: true },
    { key: "cityName", title: "المدينة", sortable: true },
    { key: "direction", title: "الاتجاه", sortable: true },
    { key: "minDistance", title: "أقل مسافة بال كم", sortable: true },
    { key: "maxDistance", title: "أقصى مسافة بال كم", sortable: true },
    { key: "materialTypeName", title: "نوع المادة", sortable: true },
    { key: "tripDuration", title: "زمن الرحلة بالساعة", sortable: true },
    { key: "pricePerTon", title: "السعر/ طن", sortable: true },
    { key: "truckTypeName", title: "نوع الشاحنة", sortable: true },
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
const filterMaterialType = ref("");
const filterTruckType = ref("");

const showDeleteDialog = ref(false);
const deleteLoading = ref(false);

const selectedPricings = ref<number[]>([]);
const hasSelectedPricings = computed(() => selectedPricings.value.length > 0);

const fetchPricings = async () => {
    try {
        loading.value = true;
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Apply filters
        let filteredData = [...demoPricings];
        
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
        
        if (filterMaterialType.value) {
            filteredData = filteredData.filter(item => 
                item.materialTypeName.includes(filterMaterialType.value)
            );
        }
        
        if (filterTruckType.value) {
            filteredData = filteredData.filter(item => 
                item.truckTypeName.includes(filterTruckType.value)
            );
        }
        
        tableItems.value = filteredData;
    } catch (err: any) {
        console.error('Error fetching pricings:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    fetchPricings();
};

const resetFilters = () => {
    filterCentralLocation.value = '';
    filterCity.value = '';
    filterMaterialType.value = '';
    filterTruckType.value = '';
    fetchPricings();
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

const openCreatePricing = () => {
    router.push('/settings/pricing-by-truck/create');
};

const handleEditPricing = (item: any) => {
    router.push(`/settings/pricing-by-truck/edit/${item.id}`);
};

const handleViewPricing = (item: any) => {
    router.push(`/settings/pricing-by-truck/view/${item.id}`);
};

const handleDeletePricing = async (item: any) => {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(p => p.id !== item.id);
        toast.success('تم حذف التسعير بنجاح');
    } catch (err: any) {
        console.error('Error deleting pricing:', err);
        toast.error('حدث خطأ أثناء حذف التسعير');
    }
};

const handleBulkDelete = () => {
    if (selectedPricings.value.length === 0) return;
    showDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    if (deleteLoading.value) return;

    try {
        deleteLoading.value = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        tableItems.value = tableItems.value.filter(item => !selectedPricings.value.includes(item.id));
        toast.success(`تم حذف ${selectedPricings.value.length} تسعير بنجاح`);
        selectedPricings.value = [];
    } catch (err: any) {
        console.error('Error deleting pricings:', err);
        toast.error('حدث خطأ أثناء حذف التسعيرات');
    } finally {
        deleteLoading.value = false;
        showDeleteDialog.value = false;
    }
};

const handleSelectPricing = (item: any, selected: boolean) => {
    if (selected) {
        if (!selectedPricings.value.includes(item.id)) {
            selectedPricings.value.push(item.id);
        }
    } else {
        selectedPricings.value = selectedPricings.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllPricings = (selected: boolean) => {
    if (selected) {
        selectedPricings.value = tableItems.value.map((item) => item.id);
    } else {
        selectedPricings.value = [];
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchPricings();
});

</script>

<template>
    <default-layout>
        <div class="pricing-by-truck-page">
            <PageHeader :icon="SettingsIcon" title-key="التسعير بالشاحنة"
                description-key="إدارة أسعار الشحن حسب الشاحنة والمسافة والمواد" />
            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" label="تصدير" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedPricings ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <div v-if="hasSelectedPricings"
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
                            :prepend-icon="plusIcon" label="إضافة جديد" @click="openCreatePricing" />
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
                            <TextInput v-model="filterMaterialType" density="comfortable" variant="outlined" hide-details
                                placeholder="نوع المادة" class="w-full sm:w-40 bg-white"
                                @keyup.enter="applyFilters" />
                            <TextInput v-model="filterTruckType" density="comfortable" variant="outlined" hide-details
                                placeholder="نوع الشاحنة" class="w-full sm:w-40 bg-white"
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
                    show-actions @delete="handleDeletePricing" @edit="handleEditPricing" @view="handleViewPricing" @select="handleSelectPricing"
                    @selectAll="handleSelectAllPricings" :confirm-delete="true" forceShowView forceShowDelete forceShowEdit>
                </DataTable>
            </div>
        </div>

        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف التسعيرات"
            :message="`هل أنت متأكد من حذف ${selectedPricings.length} تسعير؟`" @confirm="confirmBulkDelete" />
    </default-layout>
</template>

<style scoped></style>
