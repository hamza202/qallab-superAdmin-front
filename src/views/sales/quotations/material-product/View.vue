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
                        طلبات عروض أسعار مواد بناء أولية
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

                <!-- Tabs Navigation -->
                <div
                    class="flex lg:items-center lg:justify-between py-4 border-b border-gray-200 flex-col lg:flex-row gap-3 px-6">
                    <div class="flex gap-2 overflow-y-auto">
                        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
                            'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
                            isTabActive(tab.value)
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-400 hover:bg-gray-50',
                        ]">
                            <span v-html="tab.icon" class="w-6 h-6"></span>
                            <span class="text-base font-semibold whitespace-nowrap">{{ tab.title }}</span>
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <v-tabs-window v-model="activeTab">
                    <!-- Tab 1: المعلومات العامة -->
                    <v-tabs-window-item :value="0">
                        <!-- General Information Section -->
                        <div class="p-6 border-b !border-gray-200">
                            <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات الطلب</h2>

                            <div class="flex flex-wrap gap-4">
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">نوع الطلب</label>
                                    <p class="text-base font-semibold text-gray-900">dfs</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم المورد</label>
                                    <p class="text-base font-semibold text-gray-900">dfs
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ اصدار
                                        الطلب</label>
                                    <p class="text-base font-semibold text-gray-900">dsfgs</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">حالة الطلب</label>
                                    <p class="text-base font-semibold text-gray-900">
                                        <span>
                                            ffff
                                        </span>
                                    </p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered flex-1 px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع المشروع</label>
                                    <p class="text-base font-semibold text-gray-900">
                                        <span>
                                            ffff
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="flex gap-4 mt-4">
                                <div class="info-item-bordered  px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">sdg</p>
                                </div>
                                <v-divider vertical class="my-6"></v-divider>
                                <div class="info-item-bordered px-6 py-4">
                                    <label class="font-semibold text-sm text-gray-500 mb-2 block">دفعة مقدمة</label>
                                    <p class="text-sm text-gray-700 leading-relaxed">sdg</p>
                                </div>
                            </div>
                        </div>

                        <!-- Attachments and Summary Section -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 justify-between lg:gap-20">
                            <!-- Attachments (Right Side) -->
                            <div class=" p-6">
                                <div
                                    class="flex items-center gap-2 mb-6 px-6 py-4 bg-primary-500 rounded-lg text-white">
                                    <span v-html="UploadedFileIcon"></span>
                                    <h3 class="text-lg font-bold">مرفقات</h3>
                                </div>

                                <!-- Voice Message -->
                                <div class="rounded-xl bg-primary-50 px-4 py-6 mb-3 flex items-center justify-between">
                                    <div>
                                        <p class="text-primary-600 font-bold text-sm mb-2">رسالة صوتية</p>
                                        <p class="text-blue-900 font-bold text-base">00:49</p>
                                    </div>
                                    <ButtonWithIcon color="primary-500" iconOnly :icon="playIcon" height="75"
                                        variant="flat" class="!text-primary-900 font-bold" customClass="!h-unset" />

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
                                <div
                                    class="flex items-center gap-2 mb-2 px-6 py-4 bg-primary-500 rounded-lg text-white">
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

                    </v-tabs-window-item>
                    <v-tabs-window-item :value="1">
                        <div class="mb-8">
                            <div class="bg-primary-50 px-6 py-3">
                                <div class="flex items-center gap-2">
                                    <span v-html="packageIcon"></span>
                                    <h2 class="text-lg font-bold text-primary-900">المنتجات</h2>
                                </div>
                            </div>

                            <!-- Products Table -->
                            <div class="mb-4">
                                <DataTable :headers="headers" :items="items" :showActions="false" />
                            </div>
                        </div>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="2">
                        <div class="mb-8">
                            <div class="flex flex-wrap gap-3 items-center justify-between bg-primary-50 px-6 py-3">
                                <div class="flex items-center gap-2">
                                    <span v-html="truckIcon"></span>
                                    <h2 class="text-lg font-bold text-primary-900">خدمة النقل</h2>
                                </div>
                            </div>

                            <!-- Transport Services Table -->
                            <div class="mb-4">
                                <DataTable :headers="ServicesHeaders" :items="ServicesItems" :showActions="false" />
                            </div>
                        </div>
                    </v-tabs-window-item>
                </v-tabs-window>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const activeTab = ref(0)

const productIcon = `<svg width="49" height="44" viewBox="0 0 49 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.66667 12.6587C5.28398 12.6488 5.00609 12.6267 4.75625 12.577C2.90502 12.2088 1.4579 10.7616 1.08967 8.91042C1 8.45963 1 7.91753 1 6.83333C1 5.74914 1 5.20704 1.08967 4.75625C1.4579 2.90502 2.90502 1.4579 4.75625 1.08967C5.20704 1 5.74914 1 6.83333 1H41.8333C42.9175 1 43.4596 1 43.9104 1.08967C45.7616 1.4579 47.2088 2.90502 47.577 4.75625C47.6667 5.20704 47.6667 5.74914 47.6667 6.83333C47.6667 7.91753 47.6667 8.45963 47.577 8.91042C47.2088 10.7616 45.7616 12.2088 43.9104 12.577C43.6606 12.6267 43.3827 12.6488 43 12.6587M19.6667 24.3333H29M5.66667 12.6667H43V31.8C43 35.7204 43 37.6805 42.237 39.1779C41.5659 40.4951 40.4951 41.5659 39.1779 42.237C37.6806 43 35.7204 43 31.8 43H16.8667C12.9463 43 10.9861 43 9.48873 42.237C8.1716 41.5659 7.10073 40.4951 6.42962 39.1779C5.66667 37.6805 5.66667 35.7204 5.66667 31.8V12.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const playIcon = `<svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.75 9.36414C20.0833 10.1339 20.0833 12.0584 18.75 12.8282L3 21.9215C1.66666 22.6913 -1.09859e-06 21.7291 -1.03129e-06 20.1895L-2.36336e-07 2.00292C-1.69038e-07 0.463322 1.66667 -0.498927 3 0.270873L18.75 9.36414Z" fill="white"/>
</svg>`

const UploadedFileIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 7V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H12.5M12.5 11H8M11.5 15H8M16 7H8M18 18V12.5C18 11.6716 18.6716 11 19.5 11C20.3284 11 21 11.6716 21 12.5V18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18V14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const fileCheckIcon = `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`


const packageIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 9.5L7.5 4.5" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const truckIcon = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

// Tabs configuration
const tabs = [
    {
        title: 'المعلومات العامة للطلب',
        value: 0,
        icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
    {
        title: 'المنتجات المضافة',
        value: 1,
        icon: `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5005 6.13379L10.0005 10.856M10.0005 10.856L1.50046 6.13379M10.0005 10.856L10.0005 20.356M19.0005 14.9146V6.79749C19.0005 6.45484 19.0005 6.28352 18.95 6.13072C18.9053 5.99555 18.8323 5.87147 18.7359 5.76678C18.6268 5.64844 18.477 5.56524 18.1775 5.39883L10.7775 1.28772C10.4939 1.13017 10.3521 1.05139 10.2019 1.0205C10.069 0.993166 9.93195 0.993166 9.79904 1.0205C9.64887 1.05139 9.50707 1.13017 9.22346 1.28772L1.82346 5.39884C1.52394 5.56524 1.37417 5.64844 1.26512 5.76678C1.16865 5.87147 1.09564 5.99555 1.05097 6.13073C1.00049 6.28352 1.00049 6.45485 1.00049 6.79749V14.9146C1.00049 15.2572 1.00049 15.4286 1.05097 15.5814C1.09564 15.7165 1.16865 15.8406 1.26512 15.9453C1.37417 16.0636 1.52394 16.1468 1.82346 16.3132L9.22346 20.4244C9.50707 20.5819 9.64887 20.6607 9.79904 20.6916C9.93195 20.7189 10.069 20.7189 10.2019 20.6916C10.3521 20.6607 10.4939 20.5819 10.7775 20.4244L18.1775 16.3132C18.477 16.1468 18.6268 16.0636 18.7359 15.9453C18.8323 15.8406 18.9053 15.7165 18.95 15.5814C19.0005 15.4286 19.0005 15.2572 19.0005 14.9146Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
    {
        title: 'بيانات النقل',
        value: 2,
        icon: `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 14V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V10.8C1 11.9201 1 12.4802 1.21799 12.908C1.40973 13.2843 1.71569 13.5903 2.09202 13.782C2.51984 14 3.0799 14 4.2 14H15ZM15 14H19.4C19.9601 14 20.2401 14 20.454 13.891C20.6422 13.7951 20.7951 13.6422 20.891 13.454C21 13.2401 21 12.9601 21 12.4V9.66274C21 9.41815 21 9.29586 20.9724 9.18077C20.9479 9.07873 20.9075 8.98119 20.8526 8.89172C20.7908 8.7908 20.7043 8.70432 20.5314 8.53137L18.4686 6.46863C18.2957 6.29568 18.2092 6.2092 18.1083 6.14736C18.0188 6.09253 17.9213 6.05213 17.8192 6.02763C17.7041 6 17.5818 6 17.3373 6H15M8 16.5C8 17.8807 6.88071 19 5.5 19C4.11929 19 3 17.8807 3 16.5C3 15.1193 4.11929 14 5.5 14C6.88071 14 8 15.1193 8 16.5ZM19 16.5C19 17.8807 17.8807 19 16.5 19C15.1193 19 14 17.8807 14 16.5C14 15.1193 15.1193 14 16.5 14C17.8807 14 19 15.1193 19 16.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
    },
]

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue

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

const ServicesHeaders = [
    { title: 'موقع المشروع', key: 'project_location' },
    { title: 'من تاريخ', key: 'from_date' },
    { title: 'إلى تاريخ', key: 'to_date' },
    { title: 'نوع المركبات', key: 'vehicle_type' },
    { title: 'توقيت الرحلة', key: 'trip_time' },
    { title: 'ملاحظات', key: 'notes' },
]

const ServicesItems = [
    {
        id: 1,
        project_location: 'مكة',
        from_date: '22/6/2025',
        to_date: '26/7/2026',
        vehicle_type: 'قلاب',
        trip_time: 'صباحاً',
        notes: 'لا يوجد',
    },
    {
        id: 2,
        project_location: 'القصيم',
        from_date: '22/6/2025',
        to_date: '26/7/2026',
        vehicle_type: 'سطحة',
        trip_time: 'مساءً',
        notes: 'مغطاة بالكامل',
    },
]

</script>

<style scoped>
.info-item-bordered {
    min-width: 150px;
}
</style>
