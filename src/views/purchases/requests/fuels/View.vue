<template>
    <default-layout>
        <div class="category-view-page -mx-6">
            <!-- Content -->
            <div>
                <!-- Breadcrumb -->
                <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
                    <router-link to="/" class="text-gray-500 hover:text-primary-600">
                        <span v-html="homeIcon"></span>
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/settings" class="text-gray-600 hover:text-primary-600">
                        المشتريات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <router-link to="/settings/products-categories" class="text-gray-600 hover:text-primary-600">
                        طلبات عروض أسعار محروقات
                    </router-link>
                    <span class="text-lg text-gray-300">/</span>
                    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">#238592</span>
                </div>

                <!-- Page Header -->
                <div class="bg-white px-6 py-4 border-y border-gray-200">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                                <span v-html="productIcon" class="text-primary-600"></span>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900 mb-1">dff</h1>
                                <p class="text-sm text-gray-600">dfg</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-8">
                    <div class="bg-primary-50 px-6 py-3">
                        <div class="flex items-center gap-2">
                            <span v-html="packageIcon"></span>
                            <h2 class="text-lg font-bold text-primary-900">المنتجات</h2>
                        </div>
                    </div>

                    <!-- Products Table -->
                    <div class="mb-4">
                        <DataTable :headers="headers" :items="items" />
                    </div>
                </div>


                <!-- Attachments and Summary Section -->
                <div class="grid grid-cols-1 lg:grid-cols-2 justify-between lg:gap-20">
                    <!-- Attachments (Right Side) -->
                    <div class=" p-6">
                        <div class="flex items-center gap-2 mb-6 px-6 py-4 bg-primary-500 rounded-lg text-white">
                            <span v-html="UploadedFileIcon"></span>
                            <h3 class="text-lg font-bold">مرفقات</h3>
                        </div>

                        <!-- Voice Message -->
                        <div class="rounded-xl bg-primary-50 px-4 py-6 mb-3 flex items-center justify-between">
                            <div>
                                <p class="text-primary-600 font-bold text-sm mb-2">رسالة صوتية</p>
                                <p class="text-blue-900 font-bold text-base">00:49</p>
                            </div>
                            <ButtonWithIcon color="primary-500" iconOnly :icon="playIcon" height="75" variant="flat"
                                class="!text-primary-900 font-bold" customClass="!h-unset" />

                        </div>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                            <!-- Text Note -->
                            <div class="rounded-lg border border-gray-100 lg:col-span-2 p-4">
                                <p class="text-primary-600 font-bold text-sm mb-2">ملاحظة نصية</p>
                                <p class="text-gray-400 font-medium text-sm">
                                    هل تود إرفاق بعض الملاحظات، قم بكتابتها هنا من فضلك وسيتم إرفاقها مع طلب عرض
                                    السعر المرسل
                                </p>
                            </div>

                            <div class="rounded-md overflow-hidden">
                                <v-img src="https://placehold.co/600x400" class="w-full h-full object-cover "></v-img>
                            </div>
                        </div>
                    </div>

                    <!-- Summary (Left Side) -->
                    <div class=" p-6">
                        <div class="flex items-center gap-2 mb-2 px-6 py-4 bg-primary-500 rounded-lg text-white">
                            <span v-html="fileCheckIcon"></span>
                            <h3 class="text-lg font-bold">ملخص الطلب</h3>
                        </div>

                        <div
                            class="space-y-0 bg-white border !border-gray-100 rounded-lg !text-blue-900 text-lg font-bold">
                            <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100 ">
                                <span class="">المنتجات</span>
                                <span class="">{{ summaryData.productsCount }}</span>
                            </div>
                            <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100">
                                <span class="">الخدمات</span>
                                <span class="">{{ summaryData.servicesCount }}</span>
                            </div>
                            <div class="flex justify-between items-center py-4 px-6 border-b !border-gray-100">
                                <span class="">طريقة الدفع</span>
                                <span class="">{{ summaryData.paymentMethod }}</span>
                            </div>
                            <div class="flex justify-between items-center py-4 px-6">
                                <span class="">دفعة مقدمة</span>
                                <span class="">{{ summaryData.advancePayment }}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fileCheckIcon, UploadedFileIcon, packageIcon, productIcon, playIcon, homeIcon } from '@/components/icons/priceOffersIcons'
// Summary data
const summaryData = ref({
    productsCount: 2,
    servicesCount: 0,
    paymentMethod: 'كاش',
    advancePayment: '50.000'
});

const headers = [
    { title: 'اسم المنتج', key: 'name' },
    { title: 'الكمية', key: 'quantity' },
    { title: 'الوحدة', key: 'unit' },
    { title: 'نوع الناقلة', key: 'transport_type' },
    { title: 'عدد الرحلات اليومية', key: 'daily_trips' },
    { title: 'ملاحظات', key: 'notes' },
]
const items = [
    {
        id: 1,
        name: 'اسمنت باور كريت',
        quantity: 30,
        unit: 'طن',
        transport_type: 'شحن 10',
        daily_trips: 5,
        notes: 'لا يوجد',
    },
    {
        id: 2,
        name: 'البلاط / السيراميك',
        quantity: 500,
        unit: 'متر مربع (m2)',
        transport_type: 'شحن 12',
        daily_trips: 5,
        notes: 'كل 100 طن لوحدها',
    },
]
</script>

<style scoped></style>
