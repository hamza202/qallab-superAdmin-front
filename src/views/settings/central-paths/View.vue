<template>
    <default-layout>
        <div class="central-path-view-page -mx-6">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
                <v-progress-circular indeterminate color="primary" size="64" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[400px] px-6">
                <v-icon size="64" class="text-red-500 mb-4">mdi-alert-circle-outline</v-icon>
                <h3 class="text-xl font-bold text-gray-900 mb-2">حدث خطأ في تحميل البيانات</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <ButtonWithIcon color="primary" label="إعادة المحاولة" @click="fetchCentralPath" />
            </div>

            <!-- Content -->
            <div v-else>
                <!-- Breadcrumb -->
                <div class="flex items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/settings" class="text-gray-600 hover:text-primary-600">
                        الاعدادات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/settings/central-paths/list" class="text-gray-600 hover:text-primary-600">
                        ادارة المسارات المركزية
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{ centralPath.name }}</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="centralPathIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ centralPath.name }}</h1>
                                <p class="text-sm text-gray-600">{{ centralPath.cityName }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Routes Section -->
                <div class="px-6 py-6">
                    <div class="flex items-center gap-2 mb-6">
                        <span v-html="routesIcon" class="text-primary-600"></span>
                        <h2 class="text-xl font-bold text-primary-900">المسارات</h2>
                    </div>

                    <DataTable
                        :headers="tableHeaders"
                        :items="routes"
                        :loading="routesLoading"
                        :show-checkbox="false"
                        show-actions
                        :show-delete="false"
                        :show-edit="false"
                        :show-view="false"
                    >
                        <template #item.is_active="{ item }">
                            <v-switch
                                :model-value="item.is_active"
                                hide-details
                                inset
                                density="compact"
                                color="primary"
                                class="small-switch"
                                readonly
                            />
                        </template>
                        <template #item.actions="{ item }">
                            <div class="flex items-center gap-1">
                                <v-btn
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    class="text-xs font-semibold !rounded"
                                    @click="handlePricingByTon(item)"
                                >
                                    تسعير بالطن
                                </v-btn>
                                <v-btn
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    class="text-xs font-semibold !rounded"
                                    @click="handlePricingByTruck(item)"
                                >
                                    تسعير بالشاحنة
                                </v-btn>
                                <v-btn
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    class="text-xs font-semibold !rounded"
                                    @click="handleCustomPricing(item)"
                                >
                                    تسعير مخصص
                                </v-btn>
                                <v-btn icon variant="text" size="small" @click="handleEditRoute(item)">
                                    <span v-html="editIcon"></span>
                                </v-btn>
                                <v-btn icon variant="text" size="small" @click="handleViewRoute(item)">
                                    <span v-html="eyeIcon"></span>
                                </v-btn>
                            </div>
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Route {
    id: number
    name: string
    code: string
    coordinates: string
    locationTitle: string
    is_active: boolean
    [key: string]: any
}

interface CentralPathData {
    id: number
    name: string
    cityName: string
    routes: Route[]
}

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const routesLoading = ref(false)
const error = ref<string | null>(null)

const tableHeaders = [
    { key: 'name', title: 'المسار' },
    { key: 'code', title: 'كود المسار' },
    { key: 'coordinates', title: 'احداثيات المسار' },
    { key: 'locationTitle', title: 'عنوان الموقع' },
    { key: 'is_active', title: 'الحالة' },
]

const centralPath = ref<CentralPathData>({
    id: 0,
    name: '',
    cityName: '',
    routes: [],
})

const routes = ref<Route[]>([])

// Demo data
const demoRoutes: Route[] = [
    { id: 1, name: 'شمال', code: 'N', coordinates: '0.43234 \\ 1.6545', locationTitle: 'شمال', is_active: true },
    { id: 2, name: 'جنوب', code: 'S', coordinates: '0.43234 \\ 1.6545', locationTitle: 'جنوب', is_active: false },
    { id: 3, name: 'شرق', code: 'E', coordinates: '0.43234 \\ 1.6545', locationTitle: 'شرق', is_active: true },
    { id: 4, name: 'غرب', code: 'W', coordinates: '0.43234 \\ 1.6545', locationTitle: 'غرب', is_active: true },
    { id: 5, name: 'شمال شرق', code: 'NE', coordinates: '0.43234 \\ 1.6545', locationTitle: 'شمال شرق', is_active: true },
    { id: 6, name: 'شمال غرب', code: 'NW', coordinates: '0.43234 \\ 1.6545', locationTitle: 'شمال غرب', is_active: false },
    { id: 7, name: 'جنوب شرق', code: 'SE', coordinates: '0.43234 \\ 1.6545', locationTitle: 'جنوب شرق', is_active: false },
    { id: 8, name: 'جنوب غرب', code: 'SW', coordinates: '0.43234 \\ 1.6545', locationTitle: 'جنوب غرب', is_active: true },
]

const fetchCentralPath = async () => {
    try {
        loading.value = true
        error.value = null
        const pathId = route.params.id

        // TODO: Replace with actual API call
        // const response = await api.get(`/central-paths/${pathId}`)
        await new Promise(resolve => setTimeout(resolve, 300))

        centralPath.value = {
            id: Number(pathId),
            name: 'مجمع العد',
            cityName: 'مدينة جدة',
            routes: demoRoutes,
        }
        routes.value = demoRoutes
    } catch (err: any) {
        error.value = err.response?.data?.message || err.message || 'حدث خطأ أثناء تحميل البيانات'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}

const handleEditRoute = (item: any) => {
    // TODO: implement edit route
    console.log('Edit route:', item)
}

const handleViewRoute = (item: any) => {
    // TODO: implement view route
    console.log('View route:', item)
}

const handlePricingByTon = (item: any) => {
    router.push(`/settings/pricing-per-ton/create`)
}

const handlePricingByTruck = (item: any) => {
    router.push(`/settings/pricing-by-truck/create`)
}

const handleCustomPricing = (item: any) => {
    router.push(`/settings/custom-pricing/create`)
}

onMounted(() => {
    fetchCentralPath()
})

// Icons
const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const centralPathIcon = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M9.33337 18.6667H46.6667V37.8001C46.6667 41.7205 46.6667 43.6806 45.9038 45.178C45.2326 46.4952 44.1618 47.566 42.8446 48.2371C41.3473 49.0001 39.3871 49.0001 35.4667 49.0001H20.5334C16.613 49.0001 14.6528 49.0001 13.1554 48.2371C11.8383 47.566 10.7674 46.4952 10.0963 45.178C9.33337 43.6806 9.33337 41.7204 9.33337 37.8001V18.6667Z" fill="#1570EF"/>
<path d="M9.33329 18.6587C8.95061 18.6488 8.67272 18.6267 8.42287 18.577C6.57165 18.2088 5.12453 16.7616 4.75629 14.9104C4.66663 14.4596 4.66663 13.9175 4.66663 12.8333C4.66663 11.7491 4.66663 11.207 4.75629 10.7562C5.12453 8.90502 6.57165 7.4579 8.42287 7.08967C8.87367 7 9.41576 7 10.5 7H45.5C46.5842 7 47.1263 7 47.5771 7.08967C49.4283 7.4579 50.8754 8.90502 51.2436 10.7562C51.3333 11.207 51.3333 11.7491 51.3333 12.8333C51.3333 13.9175 51.3333 14.4596 51.2436 14.9104C50.8754 16.7616 49.4283 18.2088 47.5771 18.577C47.3272 18.6267 47.0493 18.6488 46.6666 18.6587M23.3333 30.3333H32.6666M9.33329 18.6667H46.6666V37.8C46.6666 41.7204 46.6666 43.6805 45.9037 45.1779C45.2326 46.4951 44.1617 47.5659 42.8446 48.237C41.3472 49 39.387 49 35.4666 49H20.5333C16.6129 49 14.6527 49 13.1554 48.237C11.8382 47.5659 10.7674 46.4951 10.0962 45.1779C9.33329 43.6805 9.33329 41.7204 9.33329 37.8V18.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const routesIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5 4H10.9344C13.9816 4 15.5053 4 16.0836 4.54729C16.5836 5.02037 16.8051 5.71728 16.6702 6.39221C16.514 7.17302 15.2701 8.05285 12.7823 9.81253L8.71772 12.6875C6.2299 14.4471 4.98599 15.327 4.82984 16.1078C4.69486 16.7827 4.91642 17.4796 5.41636 17.9527C5.99474 18.5 7.51836 18.5 10.5656 18.5H11.5M7 4C7 5.65685 5.65685 7 4 7C2.34315 7 1 5.65685 1 4C1 2.34315 2.34315 1 4 1C5.65685 1 7 2.34315 7 4ZM21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18Z" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14662 14.1201C1.18491 13.7755 1.20405 13.6032 1.25618 13.4422C1.30243 13.2993 1.36778 13.1633 1.45045 13.038C1.54363 12.8967 1.66621 12.7741 1.91136 12.5289L12.9166 1.5237C13.8371 0.603225 15.3295 0.603226 16.2499 1.5237C17.1704 2.44417 17.1704 3.93656 16.2499 4.85703L5.24469 15.8623C4.99954 16.1074 4.87696 16.23 4.73566 16.3232C4.61029 16.4058 4.47433 16.4712 4.33146 16.5174C4.17042 16.5696 3.99813 16.5887 3.65356 16.627L0.833252 16.9404L1.14662 14.1201Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const eyeIcon = `<svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.26387 8.71318C1.12769 8.49754 1.05959 8.38972 1.02147 8.22342C0.992842 8.0985 0.992842 7.9015 1.02147 7.77658C1.05959 7.61028 1.12769 7.50246 1.26387 7.28682C2.38928 5.50484 5.73915 1 10.8442 1C15.9492 1 19.299 5.50484 20.4244 7.28682C20.5606 7.50246 20.6287 7.61028 20.6668 7.77658C20.6955 7.9015 20.6955 8.0985 20.6668 8.22342C20.6287 8.38972 20.5606 8.49754 20.4244 8.71318C19.299 10.4952 15.9492 15 10.8442 15C5.73915 15 2.38928 10.4952 1.26387 8.71318Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.8442 11C12.501 11 13.8442 9.65685 13.8442 8C13.8442 6.34315 12.501 5 10.8442 5C9.1873 5 7.84415 6.34315 7.84415 8C7.84415 9.65685 9.1873 11 10.8442 11Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>
