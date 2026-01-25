<template>
    <default-layout>
        <div class="product-view-page -mx-6">
            <!-- Content -->
            <div>
                <!-- Breadcrumb -->
                <div class="flex items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/users/list" class="text-gray-600 hover:text-primary-600">
                        المستخدمين
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/users/list" class="text-gray-600 hover:text-primary-600">
                        المستخدمين والأدوار
                    </router-link>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-3 border-y border-gray-200">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 flex items-center justify-center">
                            <span v-html="usersIcon_2" class="text-primary-600"></span>
                        </div>
                        <div>
                            <h1 class="text-lg font-semibold text-gray-900 mb-1">المستخدمين والأدوار</h1>
                            <p class="text-sm text-gray-600">تمكنك من عرض وتعديل المستخدمين وادوارهم</p>
                        </div>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div
                    class="flex lg:items-center lg:justify-between py-4 border-b border-gray-200 flex-col lg:flex-row gap-3 px-6">
                    <div class="flex gap-2 overflow-y-auto">
                        <ButtonWithIcon to="/users/list" variant="flat" size="large" label="المستخدمين" color="white"
                            :rounded="'md'" :prepend-icon="usersIcon_1" custom-class="!text-gray-400">
                        </ButtonWithIcon>
                        <ButtonWithIcon to="/roles/list" variant="flat" size="large" label="الأدوار" color="primary-500"
                            :rounded="'md'" :prepend-icon="checksIcon" custom-class="text-white">
                        </ButtonWithIcon>
                    </div>
                </div>

                <!-- content -->
                <div class="p-6">
                    <v-card class="rounded-lg" elevation="0" variant="text">
                        <v-card-text class="p-0">
                            <div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
                                <!-- Right Side: Donut Chart -->
                                <div class="md:col-span-2">
                                    <div class="d-flex flex-column bg-gray-50 rounded-3xl h-100 p-5">
                                        <h3 class="text-lg font-bold text-gray-900 mb-4">الأدوار الفعّالة :
                                        </h3>
                                        <v-divider length="250" class="mb-5"></v-divider>
                                        <div class="position-relative mb-4 d-flex justify-center flex-1 flex-wrap gap-3">
                                            <div class="space-y-3">
                                                <div class="d-flex align-center gap-2">
                                                    <div class="rounded-circle w-[8px] h-[8px] bg-primary-600"></div>
                                                    <span class="text-gray-600 text-sm">فعال</span>
                                                </div>
                                                <div class="d-flex align-center gap-2">
                                                    <div class="rounded-circle w-[8px] h-[8px] bg-primary-100"></div>
                                                    <span class="text-gray-600 text-sm">غير فعال</span>
                                                </div>
                                            </div>
                                            <div class="flex-1 flex justify-center items-center flex-col gap-4">
                                                <ApexCharts type="donut" :options="chartOptions" :series="series"
                                                    width="300" />
                                                <div class="d-flex gap-5 align-center justify-center">
                                                    <div class="d-flex align-center gap-2">
                                                        <div class="rounded-md w-[16px] h-[16px] bg-primary-600"></div>
                                                        <span class="font-bold text-gray-900 text-base">{{ activeRolesCount }}</span>
                                                    </div>
                                                    <div class="d-flex align-center gap-2">
                                                        <div class="rounded-md w-[16px] h-[16px] bg-primary-100"></div>
                                                        <span class="font-bold text-gray-900 text-base">{{ inactiveRolesCount }}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- Left Side: Role Stats -->
                                <div class="md:col-span-3">
                                    <div class="bg-gray-50 !rounded-3xl p-5">
                                        <h3 class="text-lg font-bold text-gray-900 mb-4">الأدوار والصلاحيات :
                                        </h3>
                                        <v-divider length="250" class="mb-5"></v-divider>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-20">
                                            <div class="space-y-4">
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#53B1FD" size="42">
                                                            <span v-html="gridIcon"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">المنتجات</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">56</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#FEC84B" size="42">
                                                            <span v-html="servicesIcon"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">الخدمات</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">23</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#6F1877" size="42">
                                                            <span v-html="shoppingCart"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">المشتريات</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">44</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#697586" size="42">
                                                            <span v-html="brandIcon"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">المالية</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">12</span>
                                                </div>
                                            </div>
                                            <div class="space-y-4">
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#1570EF" size="42">
                                                            <span v-html="refreshIcon"></span>
                                                        </v-avatar>
                                                        <span class="text-body-1 font-semibold text-gray-900">المقاصة</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">65</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#DC6803" size="42">
                                                            <span v-html="walletIcon"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">التمويل</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">21</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#53B1FD" size="42">
                                                            <span v-html="usersIcon"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">المستخدمين</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">33</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#1570EF" size="42">
                                                            <span v-html="fileIcon"></span>
                                                        </v-avatar>
                                                        <span
                                                            class="text-body-1 font-semibold text-gray-900">التقارير</span>
                                                    </div>
                                                    <span class="text-base font-bold text-gray-900">43</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>


                <!-- Filters -->
                <div class="border-t border-primary-100 bg-primary-25 px-4 sm:px-6 py-3 flex flex-col gap-3">
                    <div class="flex flex-wrap xl:!flex-nowrap gap-3 items-center">
                        <div class="flex flex-wrap gap-3 flex-1">
                            <TextInput v-model="nameFilter" density="comfortable" variant="outlined" hide-details
                                placeholder="اسم الدور" class="w-full sm:w-60 bg-white" />

                            <SelectInput v-model="statusFilter" :items="statusOptions" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="الحالة" class="w-full sm:w-40 bg-white" />
                        </div>

                        <!-- Search Button -->
                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" label="ابحث الأن" @click="fetchRoles" />

                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
                        </div>
                    </div>
                </div>

                <!-- Roles Cards Section -->
                <div class="p-6">
                    <!-- Add Role Button -->
                    <div class="flex mb-6" v-if="canCreate">
                        <ButtonWithIcon @click="handleAddRole" variant="flat" size="large" label="اضافة دور جديد" color="primary-500"
                            :rounded="'md'" :prepend-icon="plusIcon" custom-class="text-white">
                        </ButtonWithIcon>
                    </div>

                    <!-- Loading State -->
                    <div v-if="rolesLoading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                    </div>

                    <!-- Roles Grid -->
                    <div v-else-if="roles.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <RoleCard v-for="(role, index) in roles" :key="role.id" :role="role" :index="index"
                            :status-loading="statusLoadingId === role.id" edit-route-name="RolesEdit"
                            @status-change="handleStatusChange" />
                    </div>

                    <!-- Empty State -->
                    <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
                        <span v-html="checksIcon" class="text-gray-300 mb-4"></span>
                        <p class="text-lg font-medium">لا يوجد أدوار</p>
                        <p class="text-sm">لم يتم العثور على أدوار مطابقة للبحث</p>
                    </div>
                </div>

            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ApexCharts from 'vue3-apexcharts'
import RoleCard from '../component/RoleCard.vue'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

// Composables
const api = useApi()
const { success, error: errorNotification } = useNotification()
const router = useRouter()

// === TypeScript Interfaces ===
interface Group {
    group_name: string
    active_permissions_count: number
}

interface RoleActions {
    can_update: boolean
    can_change_status: boolean
}

interface Role {
    id: number
    role_name: string
    is_active: boolean
    groups: Group[]
    actions?: RoleActions
}

interface ApiResponse {
    status: number
    code: number
    locale: string
    message: string
    data: Role[]
    actions: {
        can_create: boolean
        can_bulk_delete?: boolean
    }
}

// === State ===
const roles = ref<Role[]>([])
const canCreate = ref(false)
const canBulkDelete = ref(true)
const rolesLoading = ref(false)
const statusLoadingId = ref<number | null>(null)

// Filters
const nameFilter = ref("")
const statusFilter = ref<number | null>(null)

const statusOptions = ref([
    { title: 'فعال', value: 1 },
    { title: 'غير فعال', value: 0 }
])

// === Computed ===
const activeRolesCount = computed(() => roles.value.filter(r => r.is_active).length)
const inactiveRolesCount = computed(() => roles.value.filter(r => !r.is_active).length)
const series = computed(() => [activeRolesCount.value, inactiveRolesCount.value])

const chartOptions = computed(() => ({
    labels: ['فعال', 'غير فعال'],
    colors: ['#1570EF', '#D1E9FF'],
    legend: {
        show: false,
    },
    dataLabels: {
        enabled: false,
        style: {
            fontSize: '12px',
            fontWeight: 600,
            colors: ['#333', '#999'],
        },
        dropShadow: {
            enabled: false,
        },
    },
    plotOptions: {
        pie: {
            donut: {
                size: '75%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: '',
                        formatter: () => String(roles.value.length),
                    },
                },
            },
        },
    },
    stroke: {
        width: 0,
    },
}))

// === API Functions ===
const fetchRoles = async () => {
    try {
        rolesLoading.value = true
        
        const params = new URLSearchParams()
        if (nameFilter.value) params.append('name', nameFilter.value)
        if (statusFilter.value !== null) params.append('status', String(statusFilter.value))
        
        const queryString = params.toString()
        const url = queryString ? `/roles?${queryString}` : '/roles'
        
        const response = await api.get<ApiResponse>(url)
        
        roles.value = response.data
        canCreate.value = response.actions?.can_create ?? false
        canBulkDelete.value = response.actions?.can_bulk_delete ?? false
    } catch (err: any) {
        console.error('Error fetching roles:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء جلب البيانات')
    } finally {
        rolesLoading.value = false
    }
}

const handleStatusChange = async (role: Role, newStatus: boolean) => {
    try {
        statusLoadingId.value = role.id
        
        await api.patch(`/roles/${role.id}/change-status`, {
            is_active: newStatus
        })
        
        // Update local state
        const roleIndex = roles.value.findIndex(r => r.id === role.id)
        if (roleIndex !== -1) {
            roles.value[roleIndex].is_active = newStatus
        }
        
        success(newStatus ? 'تم تفعيل الدور بنجاح' : 'تم تعطيل الدور بنجاح')
    } catch (err: any) {
        console.error('Error changing status:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة')
        // Revert the switch state by refreshing data
        await fetchRoles()
    } finally {
        statusLoadingId.value = null
    }
}

// === Handlers ===
const handleAddRole = () => {
    router.push({ name: 'RolesCreate' })
}

const resetFilters = () => {
    nameFilter.value = ''
    statusFilter.value = null
    fetchRoles()
}

// Icons
const usersIcon_1 = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 19V17C21 15.1362 19.7252 13.5701 18 13.126M14.5 1.29076C15.9659 1.88415 17 3.32131 17 5C17 6.67869 15.9659 8.11585 14.5 8.70924M16 19C16 17.1362 16 16.2044 15.6955 15.4693C15.2895 14.4892 14.5108 13.7105 13.5307 13.3045C12.7956 13 11.8638 13 10 13H7C5.13623 13 4.20435 13 3.46927 13.3045C2.48915 13.7105 1.71046 14.4892 1.30448 15.4693C1 16.2044 1 17.1362 1 19M12.5 5C12.5 7.20914 10.7091 9 8.5 9C6.29086 9 4.5 7.20914 4.5 5C4.5 2.79086 6.29086 1 8.5 1C10.7091 1 12.5 2.79086 12.5 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const usersIcon_2 = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M45.3333 41V36.6667C45.3333 32.6283 42.5713 29.2351 38.8333 28.273M31.25 2.62998C34.4261 3.91565 36.6667 7.02951 36.6667 10.6667C36.6667 14.3038 34.4261 17.4177 31.25 18.7034M34.5 41C34.5 36.9618 34.5 34.9428 33.8403 33.3501C32.9607 31.2265 31.2735 29.5393 29.1499 28.6597C27.5572 28 25.5382 28 21.5 28H15C10.9618 28 8.94276 28 7.35008 28.6597C5.2265 29.5393 3.53932 31.2265 2.65971 33.3501C2 34.9428 2 36.9618 2 41M26.9167 10.6667C26.9167 15.4531 23.0365 19.3333 18.25 19.3333C13.4635 19.3333 9.58333 15.4531 9.58333 10.6667C9.58333 5.8802 13.4635 2 18.25 2C23.0365 2 26.9167 5.8802 26.9167 10.6667Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const checksIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 7V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V11.8C1 12.9201 1 13.4802 1.21799 13.908C1.40973 14.2843 1.71569 14.5903 2.09202 14.782C2.51984 15 3.0799 15 4.2 15H7M11 14L13 16L17.5 11.5M10.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V10.2C21 9.07989 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H10.2C9.07989 7 8.51984 7 8.09202 7.21799C7.71569 7.40973 7.40973 7.71569 7.21799 8.09202C7 8.51984 7 9.07989 7 10.2V17.8C7 18.9201 7 19.4802 7.21799 19.908C7.40973 20.2843 7.71569 20.5903 8.09202 20.782C8.51984 21 9.07989 21 10.2 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const gridIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.1615 12H16.8385C17.3657 12 17.8205 12 18.195 12.0306C18.5904 12.0629 18.9836 12.1342 19.362 12.327C19.9265 12.6146 20.3854 13.0735 20.673 13.638C20.8658 14.0164 20.9371 14.4096 20.9694 14.805C21 15.1795 21 15.6343 21 16.1614V16.8386C21 17.3657 21 17.8205 20.9694 18.195C20.9371 18.5904 20.8658 18.9836 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.9836 20.8658 18.5904 20.9371 18.195 20.9694C17.8205 21 17.3657 21 16.8385 21H15.1615C14.6343 21 14.1796 21 13.805 20.9694C13.4096 20.9371 13.0164 20.8658 12.638 20.673C12.0735 20.3854 11.6146 19.9265 11.327 19.362C11.1342 18.9836 11.0629 18.5904 11.0306 18.195C11 17.8205 11 17.3657 11 16.8385V16.1615C11 15.6343 11 15.1795 11.0306 14.805C11.0629 14.4096 11.1342 14.0164 11.327 13.638C11.6146 13.0735 12.0735 12.6146 12.638 12.327C13.0164 12.1342 13.4096 12.0629 13.805 12.0306C14.1795 12 14.6343 12 15.1615 12ZM13.9678 14.0239C13.6962 14.0461 13.5955 14.0838 13.546 14.109C13.3578 14.2049 13.2049 14.3578 13.109 14.546C13.0838 14.5955 13.0461 14.6962 13.0239 14.9678C13.0008 15.2512 13 15.6234 13 16.2V16.8C13 17.3766 13.0008 17.7488 13.0239 18.0322C13.0461 18.3038 13.0838 18.4045 13.109 18.454C13.2049 18.6422 13.3578 18.7951 13.546 18.891C13.5955 18.9162 13.6962 18.9539 13.9678 18.9761C14.2512 18.9992 14.6234 19 15.2 19H16.8C17.3766 19 17.7488 18.9992 18.0322 18.9761C18.3038 18.9539 18.4045 18.9162 18.454 18.891C18.6422 18.7951 18.7951 18.6422 18.891 18.454C18.9162 18.4045 18.9539 18.3038 18.9761 18.0322C18.9992 17.7488 19 17.3766 19 16.8V16.2C19 15.6234 18.9992 15.2512 18.9761 14.9678C18.9539 14.6962 18.9162 14.5955 18.891 14.546C18.7951 14.3578 18.6422 14.2049 18.454 14.109C18.4045 14.0838 18.3038 14.0461 18.0322 14.0239C17.7488 14.0008 17.3766 14 16.8 14H15.2C14.6234 14 14.2512 14.0008 13.9678 14.0239Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.4162 3.00004C6.03551 2.99974 5.70767 2.99948 5.41482 3.05773C4.22474 3.29445 3.29445 4.22474 3.05773 5.41482C2.99948 5.70767 2.99974 6.0355 3.00004 6.4162L3.00009 6.50009L3.00004 6.58397C2.99974 6.96467 2.99948 7.2925 3.05773 7.58536C3.29445 8.77543 4.22474 9.70572 5.41482 9.94244C5.70767 10.0007 6.0355 10.0004 6.4162 10.0001H17.584C17.9647 10.0004 18.2925 10.0007 18.5854 9.94244C19.7754 9.70572 20.7057 8.77543 20.9424 7.58536C21.0007 7.29252 21.0004 6.9647 21.0001 6.58402L21.0001 6.50009L21.0001 6.41619C21.0004 6.03551 21.0007 5.70766 20.9424 5.41482C20.7057 4.22474 19.7754 3.29445 18.5854 3.05773C18.2925 2.99948 17.9647 2.99974 17.584 3.00004H6.4162ZM5.805 5.0193C5.87725 5.00493 5.9875 5.00009 6.50009 5.00009H17.5001C18.0127 5.00009 18.1229 5.00493 18.1952 5.0193C18.5919 5.09821 18.902 5.40831 18.9809 5.805C18.9952 5.87725 19.0001 5.9875 19.0001 6.50009C19.0001 7.01267 18.9952 7.12293 18.9809 7.19518C18.902 7.59187 18.5919 7.90197 18.1952 7.98087C18.1229 7.99524 18.0127 8.00009 17.5001 8.00009H6.50009C5.9875 8.00009 5.87725 7.99524 5.805 7.98087C5.40831 7.90197 5.09821 7.59187 5.0193 7.19518C5.00493 7.12293 5.00009 7.01267 5.00009 6.50009C5.00009 5.9875 5.00493 5.87725 5.0193 5.805C5.09821 5.40831 5.40831 5.09821 5.805 5.0193Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M6.00009 12.0001C4.34324 12.0001 3.00009 13.3433 3.00009 15.0001V18.0001C3.00009 19.657 4.34324 21.0001 6.00009 21.0001C7.65695 21.0001 9.00009 19.657 9.00009 18.0001V15.0001C9.00009 13.3433 7.65695 12.0001 6.00009 12.0001ZM5.00009 15.0001C5.00009 14.4478 5.44781 14.0001 6.00009 14.0001C6.55238 14.0001 7.00009 14.4478 7.00009 15.0001V18.0001C7.00009 18.5524 6.55238 19.0001 6.00009 19.0001C5.44781 19.0001 5.00009 18.5524 5.00009 18.0001V15.0001Z" fill="white"/>
</svg>`

const servicesIcon = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 4L13 4M13 4C13 5.65686 14.3431 7 16 7C17.6569 7 19 5.65685 19 4C19 2.34315 17.6569 1 16 1C14.3431 1 13 2.34315 13 4ZM7 12L19 12M7 12C7 13.6569 5.65685 15 4 15C2.34315 15 1 13.6569 1 12C1 10.3431 2.34315 9 4 9C5.65685 9 7 10.3431 7 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const shoppingCart = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.00014 13H17.1359C18.1487 13 18.6551 13 19.0582 12.8112C19.4134 12.6448 19.7118 12.3777 19.9163 12.0432C20.1485 11.6633 20.2044 11.16 20.3163 10.1534L20.9013 4.88835C20.9355 4.58088 20.9525 4.42715 20.9031 4.30816C20.8597 4.20366 20.7821 4.11697 20.683 4.06228C20.5702 4 20.4155 4 20.1062 4H3.50014M1 1H2.24844C2.51306 1 2.64537 1 2.74889 1.05032C2.84002 1.09463 2.91554 1.16557 2.96544 1.25376C3.02212 1.35394 3.03037 1.48599 3.04688 1.7501L3.95312 16.2499C3.96963 16.514 3.97788 16.6461 4.03456 16.7462C4.08446 16.8344 4.15998 16.9054 4.25111 16.9497C4.35463 17 4.48694 17 4.75156 17H18M6.5 20.5H6.51M15.5 20.5H15.51M7 20.5C7 20.7761 6.77614 21 6.5 21C6.22386 21 6 20.7761 6 20.5C6 20.2239 6.22386 20 6.5 20C6.77614 20 7 20.2239 7 20.5ZM16 20.5C16 20.7761 15.7761 21 15.5 21C15.2239 21 15 20.7761 15 20.5C15 20.2239 15.2239 20 15.5 20C15.7761 20 16 20.2239 16 20.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const brandIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 8H8.01M2 5.2L2 9.67451C2 10.1637 2 10.4083 2.05526 10.6385C2.10425 10.8425 2.18506 11.0376 2.29472 11.2166C2.4184 11.4184 2.59135 11.5914 2.93726 11.9373L10.6059 19.6059C11.7939 20.7939 12.388 21.388 13.0729 21.6105C13.6755 21.8063 14.3245 21.8063 14.927 21.6105C15.612 21.388 16.2061 20.7939 17.3941 19.6059L19.6059 17.3941C20.7939 16.2061 21.388 15.612 21.6105 14.927C21.8063 14.3245 21.8063 13.6755 21.6105 13.0729C21.388 12.388 20.7939 11.7939 19.6059 10.6059L11.9373 2.93726C11.5914 2.59135 11.4184 2.4184 11.2166 2.29472C11.0376 2.18506 10.8425 2.10425 10.6385 2.05526C10.4083 2 10.1637 2 9.67452 2L5.2 2C4.0799 2 3.51984 2 3.09202 2.21799C2.7157 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.07989 2 5.2ZM8.5 8C8.5 8.27614 8.27614 8.5 8 8.5C7.72386 8.5 7.5 8.27614 7.5 8C7.5 7.72386 7.72386 7.5 8 7.5C8.27614 7.5 8.5 7.72386 8.5 8Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const refreshIcon = `<svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.0532 17.2687C9.45234 18.3331 12.3098 18.2753 14.7568 16.8625C18.8223 14.5153 20.2152 9.31679 17.868 5.2513L17.618 4.81829M3.1451 13.7514C0.797888 9.68593 2.19083 4.48741 6.25631 2.1402C8.7033 0.727435 11.5608 0.669628 13.9599 1.73399M1 13.8351L3.73205 14.5671L4.4641 11.8351M16.5492 7.16712L17.2813 4.43507L20.0133 5.16712" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const walletIcon = `<svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 6.5V4.2C19 3.0799 19 2.51984 18.782 2.09202C18.5903 1.7157 18.2843 1.40974 17.908 1.21799C17.4802 1 16.9201 1 15.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.7157 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V13.8C1 14.9201 1 15.4802 1.21799 15.908C1.40973 16.2843 1.71569 16.5903 2.09202 16.782C2.51984 17 3.07989 17 4.2 17L15.8 17C16.9201 17 17.4802 17 17.908 16.782C18.2843 16.5903 18.5903 16.2843 18.782 15.908C19 15.4802 19 14.9201 19 13.8V11.5M14 9C14 8.53535 14 8.30302 14.0384 8.10982C14.1962 7.31644 14.8164 6.69624 15.6098 6.53843C15.803 6.5 16.0353 6.5 16.5 6.5H18.5C18.9647 6.5 19.197 6.5 19.3902 6.53843C20.1836 6.69624 20.8038 7.31644 20.9616 8.10982C21 8.30302 21 8.53535 21 9C21 9.46466 21 9.69698 20.9616 9.89018C20.8038 10.6836 20.1836 11.3038 19.3902 11.4616C19.197 11.5 18.9647 11.5 18.5 11.5H16.5C16.0353 11.5 15.803 11.5 15.6098 11.4616C14.8164 11.3038 14.1962 10.6836 14.0384 9.89018C14 9.69698 14 9.46465 14 9Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const usersIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 3.46776C17.4817 4.20411 18.5 5.73314 18.5 7.5C18.5 9.26686 17.4817 10.7959 16 11.5322M18 16.7664C19.5115 17.4503 20.8725 18.565 22 20M2 20C3.94649 17.5226 6.58918 16 9.5 16C12.4108 16 15.0535 17.5226 17 20M14 7.5C14 9.98528 11.9853 12 9.5 12C7.01472 12 5 9.98528 5 7.5C5 5.01472 7.01472 3 9.5 3C11.9853 3 14 5.01472 14 7.5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const fileIcon = `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 1.26953V5.40007C11 5.96012 11 6.24015 11.109 6.45406C11.2049 6.64222 11.3578 6.7952 11.546 6.89108C11.7599 7.00007 12.0399 7.00007 12.6 7.00007H16.7305M13 12H5M13 16H5M7 8H5M11 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H12.2C13.8802 21 14.7202 21 15.362 20.673C15.9265 20.3854 16.3854 19.9265 16.673 19.362C17 18.7202 17 17.8802 17 16.2V7L11 1Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`


onMounted(() => {
    fetchRoles()
})
</script>