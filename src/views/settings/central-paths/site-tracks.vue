<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import Map from "@/components/common/Map.vue";
import { SettingsIcon, columnIcon, exportIcon, searchIcon } from "@/components/icons/globalIcons";

const route = useRoute();
const router = useRouter();
const api = useApi();

const zoneId = computed(() => route.params.zoneId);

// Types
interface SiteTrack {
    id: number;
    zone_id: number;
    name: string;
    direction_code: string;
    coordinates: string | null;
    latitude: string | null;
    longitude: string | null;
    address: string | null;
    is_active: boolean;
    actions?: {
        can_view: boolean;
        can_update: boolean;
        can_change_status: boolean;
        pricing_ton?: { zone_site_track_id: number; can_access: boolean };
        pricing_km_truck?: { zone_site_track_id: number; can_access: boolean };
        pricing_custom?: { zone_site_track_id: number; can_access: boolean };
    };
}

interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
}

interface Pagination {
    next_cursor: string | null;
    previous_cursor: string | null;
    per_page: number;
}

// API Data
const tableItems = ref<SiteTrack[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
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

// Status change
const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<SiteTrack | null>(null);

// Map dialog
const showMapDialog = ref(false);
const mapLatitude = ref<string | null>(null);
const mapLongitude = ref<string | null>(null);
const mapAddress = ref<string | null>(null);
const editingItem = ref<SiteTrack | null>(null);

// Fetch site tracks
const fetchSiteTracks = async (append = false) => {
    try {
        if (append) {
            loadingMore.value = true;
        } else {
            loading.value = true;
        }

        const params = new URLSearchParams();
        params.append('zone_id', String(zoneId.value));
        params.append('per_page', String(perPage.value));

        if (append && nextCursor.value) {
            params.append('cursor', nextCursor.value);
        }
        if (filterName.value) params.append('name', filterName.value);
        if (filterStatus.value !== null) params.append('status', String(filterStatus.value));

        const response = await api.get<any>(`/zone-site-tracks?${params.toString()}`);

        const normalizedData = response.data.map((item: any) => ({
            ...item,
            is_active: Boolean(item.is_active)
        }));

        if (append) {
            tableItems.value = [...tableItems.value, ...normalizedData];
        } else {
            tableItems.value = normalizedData;
            if (response.headers) {
                allHeaders.value = response.headers.filter((h: TableHeader) => h.key !== 'id' && h.key !== 'actions');
                shownHeaders.value = response.shownHeaders.filter((h: TableHeader) => h.key !== 'id' && h.key !== 'actions');
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
        console.error('Error fetching site tracks:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = async () => {
    if (!hasMoreData.value || loadingMore.value) return;
    await fetchSiteTracks(true);
};

const applyFilters = () => {
    fetchSiteTracks();
};

const resetFilters = () => {
    filterName.value = '';
    filterStatus.value = null;
    fetchSiteTracks();
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

// Status change
const handleStatusChange = (item: SiteTrack) => {
    itemToChangeStatus.value = { ...item };
    showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
    if (!itemToChangeStatus.value) return;

    try {
        statusChangeLoading.value = true;
        await api.patch(`/zone-site-tracks/${itemToChangeStatus.value.id}/change-status`);

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id);
        if (index !== -1) {
            tableItems.value[index].is_active = !tableItems.value[index].is_active;
        }

        toast.success(tableItems.value[index]?.is_active ? 'تم تفعيل المسار بنجاح' : 'تم تعطيل المسار بنجاح');
    } catch (err: any) {
        console.error('Error changing status:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

// Edit (Map dialog)
const handleEditSiteTrack = (item: SiteTrack) => {
    editingItem.value = item;
    mapLatitude.value = item.latitude || null;
    mapLongitude.value = item.longitude || null;
    mapAddress.value = item.address || null;
    showMapDialog.value = true;
};

const handleLocationSelected = async (data: { latitude: string; longitude: string; address: string }) => {
    if (!editingItem.value) return;

    try {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);
        formData.append('address', data.address);

        await api.post(`/zone-site-tracks/${editingItem.value.id}`, formData);

        const index = tableItems.value.findIndex(t => t.id === editingItem.value!.id);
        if (index !== -1) {
            tableItems.value[index].latitude = data.latitude;
            tableItems.value[index].longitude = data.longitude;
            tableItems.value[index].address = data.address;
            tableItems.value[index].coordinates = `${data.latitude} \\ ${data.longitude}`;
        }

        toast.success('تم تحديث الموقع بنجاح');
    } catch (err: any) {
        console.error('Error updating site track:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحديث الموقع');
    } finally {
        editingItem.value = null;
    }
};

// Navigation to pricing pages
const handlePricingByTon = (item: SiteTrack) => {
    const trackId = item.actions?.pricing_ton?.zone_site_track_id;
    if (trackId) {
        router.push({
            path: '/settings/pricing-per-ton/create',
            query: { zone_site_track_id: trackId, zone_id: String(zoneId.value) },
        });
    }
};

const handlePricingByTruck = (item: SiteTrack) => {
    const trackId = item.actions?.pricing_km_truck?.zone_site_track_id;
    if (trackId) {
        router.push({
            path: '/settings/pricing-by-truck/create',
            query: { zone_site_track_id: trackId, zone_id: String(zoneId.value) },
        });
    }
};

const handleCustomPricing = (item: SiteTrack) => {
    const trackId = item.actions?.pricing_custom?.zone_site_track_id;
    if (trackId) {
        router.push({
            path: '/settings/custom-pricing/create',
            query: { zone_site_track_id: trackId, zone_id: String(zoneId.value) },
        });
    }
};

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

onMounted(() => {
    fetchSiteTracks();
});
</script>

<template>
    <default-layout>
        <div class="site-tracks-page">
            <PageHeader :icon="SettingsIcon" title-key="مسارات الموقع"
                description-key="إدارة مسارات الموقع للمنطقة الجغرافية" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" label="تصدير" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div class="flex flex-wrap items-center gap-3 justify-end border-y border-y-slate-300 px-4 sm:px-6 py-3">
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

                <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-checkbox="false"
                    show-actions @edit="handleEditSiteTrack" forceShowEdit
                    @load-more="loadMore" :loading-more="loadingMore" :has-more-data="hasMoreData">
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
                            class="small-switch" @update:model-value="() => handleStatusChange(item)" />
                    </template>
                    <template #custom-actions="{ item }">
                        <v-btn v-if="item.actions?.pricing_ton?.can_access"
                            variant="outlined" size="small" color="primary"
                            class="text-xs font-semibold !rounded"
                            @click="handlePricingByTon(item)">
                            تسعير بالطن
                        </v-btn>
                        <v-btn v-if="item.actions?.pricing_km_truck?.can_access"
                            variant="outlined" size="small" color="primary"
                            class="text-xs font-semibold !rounded"
                            @click="handlePricingByTruck(item)">
                            تسعير بالشاحنة
                        </v-btn>
                        <v-btn v-if="item.actions?.pricing_custom?.can_access"
                            variant="outlined" size="small" color="primary"
                            class="text-xs font-semibold !rounded"
                            @click="handleCustomPricing(item)">
                            تسعير مخصص
                        </v-btn>
                    </template>
                </DataTable>
            </div>
        </div>

        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="itemToChangeStatus?.name || ''" :current-status="itemToChangeStatus?.is_active"
            @confirm="confirmStatusChange" />

        <Map
            v-model="showMapDialog"
            :latitude="mapLatitude"
            :longitude="mapLongitude"
            :address="mapAddress"
            @location-selected="handleLocationSelected"
        />
    </default-layout>
</template>

<style scoped></style>
