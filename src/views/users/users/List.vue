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
                    <!-- <span class="text-lg text-gray-300">/</span> -->
                    <!-- <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">dd</span> -->
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
                        <ButtonWithIcon to="/users" variant="flat" size="large" label="المستخدمين" color="primary-500"
                            :rounded="'md'" :prepend-icon="usersIcon_1" custom-class="text-white">
                        </ButtonWithIcon>
                        <ButtonWithIcon to="/roles" variant="flat" size="large" label="الأدوار" color="white"
                            :rounded="'md'" :prepend-icon="checksIcon" custom-class="!text-gray-400">
                        </ButtonWithIcon>
                    </div>
                </div>

                <!-- content -->
                <div class="p-6">
                    <v-card class="rounded-lg" elevation="0" variant="text">
                        <v-card-text class="p-0">
                            <v-row>
                                <!-- Right Side: Donut Chart -->
                                <v-col cols="12" md="5">
                                    <div
                                        class="d-flex flex-column align-center justify-center bg-gray-50 rounded-3xl h-100 p-5">
                                        <h3 class="text-h6 font-weight-bold text-gray-900 mb-6">المستخدمين الفعّالين :
                                        </h3>

                                        <div class="position-relative d-flex align-center justify-center mb-4">
                                        </div>
                                        <div class="d-flex gap-4 align-center">
                                            <div class="d-flex align-center gap-2">
                                                <div class="rounded-circle"
                                                    style="width: 12px; height: 12px; background-color: #E0F2FE;"></div>
                                                <span class="text-body-2 text-gray-600">غير فعال</span>
                                                <span class="text-body-2 font-weight-bold text-gray-900">300</span>
                                            </div>
                                            <div class="d-flex align-center gap-2">
                                                <div class="rounded-circle"
                                                    style="width: 12px; height: 12px; background-color: #1570EF;"></div>
                                                <span class="text-body-2 text-gray-600">فعال</span>
                                                <span class="text-body-2 font-weight-bold text-gray-900">156</span>
                                            </div>
                                        </div>
                                    </div>
                                </v-col>
                                <!-- Left Side: User Roles -->
                                <v-col cols="12" md="7">
                                    <div class="bg-gray-50 !rounded-3xl p-5">
                                        <h3 class="text-h6 font-weight-bold text-gray-900 mb-4">المستخدمين والأدوار :
                                        </h3>
                                        <v-divider length="250" class="mb-5"></v-divider> 

                                        <v-row justify="space-between">
                                            <v-col cols="12" sm="6">
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#F97316" size="40"><v-icon color="white"
                                                                size="20">mdi-wallet</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">المالية</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">12</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#3B82F6" size="40"><v-icon color="white"
                                                                size="20">mdi-cog</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">الصيانة والمشاريع</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">65</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#6B7280" size="40"><v-icon color="white"
                                                                size="20">mdi-link-variant</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">الصيعات</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">21</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#8B5CF6" size="40"><v-icon color="white"
                                                                size="20">mdi-cart</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">المشتريات</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">44</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#F59E0B" size="40"><v-icon color="white"
                                                                size="20">mdi-hand-heart</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">الخدمات</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">23</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#3B82F6" size="40"><v-icon color="white"
                                                                size="20">mdi-package-variant</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">المنتجات</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">56</span>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#F59E0B" size="40"><v-icon color="white"
                                                                size="20">mdi-home</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">التمويل</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">12</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#F97316" size="40"><v-icon color="white"
                                                                size="20">mdi-truck</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">الناقلات</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">66</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#3B82F6" size="40"><v-icon color="white"
                                                                size="20">mdi-file-document</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">التقارير</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">43</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#8B5CF6" size="40"><v-icon color="white"
                                                                size="20">mdi-view-dashboard</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">ادارة المشاريع</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">33</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between mb-5">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#60A5FA" size="40"><v-icon color="white"
                                                                size="20">mdi-account-group</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">المستخدمين</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">33</span>
                                                </div>
                                                <div class="d-flex align-center justify-space-between">
                                                    <div class="d-flex align-center gap-3">
                                                        <v-avatar color="#9CA3AF" size="40"><v-icon color="white"
                                                                size="20">mdi-calculator</v-icon></v-avatar>
                                                        <span class="text-body-1 text-gray-700">المحاسبة</span>
                                                    </div>
                                                    <span class="text-base font-weight-bold text-gray-900">07</span>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </div>


                <!-- Filters -->
                <div class="border-y border-y-primary-100 bg-primary-25 px-4 sm:px-6 py-3 flex flex-col gap-3">
                    <div class="flex flex-wrap xl:!flex-nowrap gap-3 items-center">
                        <div class="flex flex-wrap gap-3 flex-1">
                            <TextInput v-model="nameFilter" density="comfortable" variant="outlined" hide-details
                                placeholder="اسم المستخدم" class="w-full sm:w-60 bg-white" />

                            <SelectInput v-model="rolesFilter" :items="rolesOptions" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="الأدوار" class="w-full sm:w-60 bg-white" />

                            <SelectInput v-model="statusFilter" :items="statusOptions" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="الحالة" class="w-full sm:w-40 bg-white" />
                        </div>

                        <!-- Search Button -->
                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" label="ابحث الأن" />

                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" label="إعادة تعيين" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const nameFilter = ref("");
const rolesFilter = ref(null);
const statusFilter = ref(null);

const rolesOptions = ref([
    { title: 'مدير', value: 'admin' },
    { title: 'مستخدم', value: 'user' },
    { title: 'محرر', value: 'editor' }
]);

const statusOptions = ref([
    { title: 'نشط', value: 'active' },
    { title: 'غير نشط', value: 'inactive' }
]);

const productIcon = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" d="M9.33337 18.6667H46.6667V37.8001C46.6667 41.7205 46.6667 43.6806 45.9038 45.178C45.2326 46.4952 44.1618 47.566 42.8446 48.2371C41.3473 49.0001 39.3871 49.0001 35.4667 49.0001H20.5334C16.613 49.0001 14.6528 49.0001 13.1554 48.2371C11.8383 47.566 10.7674 46.4952 10.0963 45.178C9.33337 43.6806 9.33337 41.7204 9.33337 37.8001V18.6667Z" fill="#1570EF"/>
<path d="M9.33329 18.6587C8.95061 18.6488 8.67272 18.6267 8.42287 18.577C6.57165 18.2088 5.12453 16.7616 4.75629 14.9104C4.66663 14.4596 4.66663 13.9175 4.66663 12.8333C4.66663 11.7491 4.66663 11.207 4.75629 10.7562C5.12453 8.90502 6.57165 7.4579 8.42287 7.08967C8.87367 7 9.41576 7 10.5 7H45.5C46.5842 7 47.1263 7 47.5771 7.08967C49.4283 7.4579 50.8754 8.90502 51.2436 10.7562C51.3333 11.207 51.3333 11.7491 51.3333 12.8333C51.3333 13.9175 51.3333 14.4596 51.2436 14.9104C50.8754 16.7616 49.4283 18.2088 47.5771 18.577C47.3272 18.6267 47.0493 18.6488 46.6666 18.6587M23.3333 30.3333H32.6666M9.33329 18.6667H46.6666V37.8C46.6666 41.7204 46.6666 43.6805 45.9037 45.1779C45.2326 46.4951 44.1617 47.5659 42.8446 48.237C41.3472 49 39.387 49 35.4666 49H20.5333C16.6129 49 14.6527 49 13.1554 48.237C11.8382 47.5659 10.7674 46.4951 10.0962 45.1779C9.33329 43.6805 9.33329 41.7204 9.33329 37.8V18.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
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

onMounted(() => {
})
</script>