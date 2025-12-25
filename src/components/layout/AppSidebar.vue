<template>
    <v-navigation-drawer v-model="drawerProxy" app width="230" :rail="!isMobile && isCollapsed"
        :expand-on-hover="!isMobile && isCollapsed" :permanent="!isMobile" :temporary="isMobile"
        class="py-4 lg:ms-2 max-h-[94vh] border-0 bg-gray-50 !border-t-4 !border-qallab-blue q-sidebar-drawer relative"
        :class="{ 'pt-0 pb-0 min-h-[100vh]': isMobile }" @mouseenter="isDrawerHovered = true"
        @mouseleave="isDrawerHovered = false">
        <div class="q-sidebar-scroll bg-primary-800 text-white pt-7 pb-4 flex flex-col justify-between w-100 h-100 rounded-[24px] max-h-100"
            :class="{ 'pt-0 rounded-none': isMobile }">
            <div class="flex flex-col gap-4">
                <div class="flex justify-center mb-2 px-3">
                    <img src="@/assets/logo-light.svg" alt="Qallab logo" class="w-15" v-if="isSidebarExpanded" />
                    <img src="@/assets/vectors/qallab-favicon.svg" alt="" class="w-15" v-else>
                </div>
                <div class="q-sidebar-toggle z-10" v-if="!isMobile">
                    <v-btn size="x-small" icon class="bg-qallab-yellow text-white shadow-md !rounded-full"
                        @click="toggleCollapse">
                        <v-icon size="20">{{ isCollapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
                    </v-btn>
                </div>

                <v-list :opened="openGroups" density="compact" nav class="text-sm px-0 space-y-1"
                    active-class="bg-white !text-qallab-blue !font-bold relative before:absolute before:content-[''] before:inset-y-1 before:start-[-16px] before:bottom-[5px] before:w-1.5 before:bg-qallab-yellow before:rounded-e-lg">

                    <!-- الرئيسية -->
                    <v-list-item to="/" value="home" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg text-white hover:bg-primary-700/40 transition flex items-center justify-start gap-2">
                        <template #title>
                            الرئيسية
                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                <span v-html="homeIcon"></span>
                            </div>
                        </template>
                    </v-list-item>

                    <!-- المنتجات -->
                    <v-list-group value="products" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isProductsActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isProductsActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isProductsActive ? '!text-[#1570EF]' : ''">المنتجات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="productsIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <h2 class="text-sm font-medium leading-5 mb-2">إدارة المتجات</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/simple-products/list"
                                        :class="[$route.path.includes('/simple-products/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        منتجات بسيطة </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/group-products/list"
                                        :class="[$route.path.includes('/group-products/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        منتجات المجموعة</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/products/prices-list"
                                        :class="[$route.path.includes('/products/prices-list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        قوائم الاسعار</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/products/production-capacity-list"
                                        :class="[$route.path.includes('/products/production-capacity-list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        القدرة الإنتاجية</router-link>
                                </li>
                            </ul>
                            <h2 class="text-sm font-medium leading-5 my-2">إعدادات المنتجات</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/customers/list"
                                        :class="[$route.path.includes('/customers/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        متغيرات المنتج </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/invoices"
                                        :class="[$route.path.includes('/sales/invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        اعدادات جدول المنتجات</router-link>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- الخدمات -->
                    <v-list-group value="services" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isServicesActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isServicesActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isServicesActive ? '!text-[#1570EF]' : ''">الخدمات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="servicesIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <ul class="space-y-2 text-slate-100">
                                <li class="relative">
                                    <router-link to="/simple-products/list"
                                        :class="[$route.path.includes('/simple-products/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        إدارة الخدمات </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/group-products/list"
                                        :class="[$route.path.includes('/group-products/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        الاشتراكات</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/services/prices-list"
                                        :class="[$route.path.includes('/services/prices-list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        قوائم الاسعار</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/products/production-capacity-list"
                                        :class="[$route.path.includes('/products/production-capacity-list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        إعدادات الخدمات</router-link>
                                </li>
                            </ul>

                        </div>
                    </v-list-group>

                    <!-- المبيعات -->
                    <v-list-group value="sales" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isSalesActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isSalesActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isSalesActive ? '!text-[#1570EF]' : ''">المبيعات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="salesIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <!-- <div
                                class="absolute top-1 bottom-1 right-[30px] border-r-2 border-dotted border-white -translate-y-3 h-[100.5%]">
                            </div>
                            <ul class="space-y-2">
                                <li class="relative">
                                    <router-link to="/sales/quotations"
                                        :class="[$route.path.includes('/sales/quotations') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        عروض الأسعار</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/invoices"
                                        :class="[$route.path.includes('/sales/invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        فواتير المبيعات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/orders"
                                        :class="[$route.path.includes('/sales/orders') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        طلبات المبيعات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/contracts"
                                        :class="[$route.path.includes('/sales/contracts') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        العقود</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/clearing"
                                        :class="[$route.path.includes('/sales/clearing') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        المقاصة</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul> -->
                            <h2 class="text-sm font-medium leading-5 mb-2">إدارة العملاء</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/customers/list"
                                        :class="[$route.path.includes('/customers/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        قائمة العملاء </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/invoices"
                                        :class="[$route.path.includes('/sales/invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        فواتير المبيعات</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/orders"
                                        :class="[$route.path.includes('/sales/orders') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        طلبات المبيعات</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/contracts"
                                        :class="[$route.path.includes('/sales/contracts') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        العقود</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/clearing"
                                        :class="[$route.path.includes('/sales/clearing') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        المقاصة</router-link>
                                </li>
                            </ul>

                        </div>
                    </v-list-group>

                    <!-- المشاريع -->
                    <v-list-group value="projects" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isProjectsActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isProjectsActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isProjectsActive ? '!text-[#1570EF]' : ''">المشاريع</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="projectsIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <ul class="space-y-2 text-slate-100">
                                <li class="relative">
                                    <router-link to="/projects/list"
                                        :class="[$route.path.includes('/projects/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        إدارة
                                        المشاريع </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/projects/scheduling"
                                        :class="[$route.path.includes('/projects/scheduling') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        جدولة
                                        المشاريع</router-link>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المشتريات -->
                    <v-list-group value="purchases" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isPurchasesActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isPurchasesActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isPurchasesActive ? '!text-[#1570EF]' : ''">المشتريات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="purchasesIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <h2 class="text-sm font-medium leading-5 mb-2">إدارة الموردين</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/suppliers/list"
                                        :class="[$route.path.includes('/suppliers/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        إدارة الموردين </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/suppliers/list"
                                        :class="[$route.path.includes('/suppliers/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        تسوية حساب موردين</router-link>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المالية -->
                    <v-list-group value="finance" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isFinanceActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isFinanceActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isFinanceActive ? '!text-[#1570EF]' : ''">المالية</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="financeIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-3 ps-15 pe-4 text-sm">
                            <div
                                class="absolute top-1 bottom-1 right-[30px] border-r-2 border-dotted border-white -translate-y-3 h-[100.5%]">
                            </div>
                            <ul class="space-y-2">
                                <li class="relative">
                                    <router-link to="/finance/payment-vouchers"
                                        :class="[$route.path.includes('/finance/payment-vouchers') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        سندات الصرف</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/finance/receipt-vouchers"
                                        :class="[$route.path.includes('/finance/receipt-vouchers') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        سندات القبض</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المستخدمين -->
                    <v-list-group value="users" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isUsersActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isUsersActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isUsersActive ? '!text-[#1570EF]' : ''">المستخدمين</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="usersIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-3 ps-15 pe-4 text-sm">
                            <div
                                class="absolute top-1 bottom-1 right-[30px] border-r-2 border-dotted border-white -translate-y-3 h-[100.5%]">
                            </div>
                            <ul class="space-y-2">
                                <li class="relative">
                                    <router-link to="/users/list"
                                        :class="[$route.path.includes('/users/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">المستخدمين</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/users/roles"
                                        :class="[$route.path.includes('/users/roles') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">الأدوار
                                        والصلاحيات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- اللوجستيات -->
                    <v-list-group value="logistics" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isLogisticsActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isLogisticsActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isLogisticsActive ? '!text-[#1570EF]' : ''">اللوجستيات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="logisticsIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-3 ps-15 pe-4 text-sm">
                            <div
                                class="absolute top-1 bottom-1 right-[30px] border-r-2 border-dotted border-white -translate-y-3 h-[100.5%]">
                            </div>
                            <ul class="space-y-2">
                                <li class="relative">
                                    <router-link to="/logistics/transport-orders"
                                        :class="[$route.path.includes('/logistics/transport-orders') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">طلبات
                                        النقل</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/logistics/transport-invoices"
                                        :class="[$route.path.includes('/logistics/transport-invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">فواتير
                                        النقل</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- التقارير -->
                    <v-list-group value="reports" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isReportsActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isReportsActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isReportsActive ? '!text-[#1570EF]' : ''">التقارير</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="reportsIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-3 ps-15 pe-4 text-sm">
                            <div
                                class="absolute top-1 bottom-1 right-[30px] border-r-2 border-dotted border-white -translate-y-3 h-[100.5%]">
                            </div>
                            <ul class="space-y-2">
                                <li class="relative">
                                    <router-link to="/reports/sales"
                                        :class="[$route.path.includes('/reports/sales') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">تقارير
                                        المبيعات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/reports/purchases"
                                        :class="[$route.path.includes('/reports/purchases') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">تقارير
                                        المشتريات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- الإعدادات -->
                    <v-list-group value="settings" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="[{ '!mx-1 gap-5': !isSidebarExpanded }, isSettingsActive ? 'bg-white !text-[#1570EF]' : '']"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '', isSettingsActive ? '!text-[#1570EF]' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold" :class="isSettingsActive ? '!text-[#1570EF]' : ''">الإعدادات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="settingsIcon"></span>
                                    </div>
                                </template>
                            </v-list-item>
                        </template>
                        <div class="relative mt-1 ps-10 pe-4 text-sm">
                            <h2 class="text-sm font-medium leading-5 mb-2">الإعدادات الاساسية</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/products-categories/list"
                                        :class="[$route.path.includes('/products-categories/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        قائمة تصنيفات المنتجات </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/services-categories/list"
                                        :class="[$route.path.includes('/services-categories/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        قائمة تصنيفات الخدمات</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/products-categories/list"
                                        :class="[$route.path.includes('/products-categories/create') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        تصنيفات المنتجات </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/services-categories/list"
                                        :class="[$route.path.includes('/services-categories/create') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        تصنيفات الخدمات</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/units/list"
                                        :class="[$route.path.includes('/units/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        الوحدات</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/factories/list"
                                        :class="[$route.path.includes('/factories/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        المصانع</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/brands/list"
                                        :class="[$route.path.includes('/brands/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        العلامة التجارية</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/geo-areas/list"
                                        :class="[$route.path.includes('/geo-areas/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        تقسيمات المناطق الجغرافية</router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/geo-segments/list"
                                        :class="[$route.path.includes('/geo-segments/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        تقسيمات النطاقات الجغرافية</router-link>
                                </li>
                            </ul>
                            <h2 class="text-sm font-medium leading-5 my-2">إدارة الضرائب</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/tax-rules/list"
                                        :class="[$route.path.includes('/tax-rules/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        القواعد الضريبية
                                    </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/taxes/list"
                                        :class="[$route.path.includes('/taxes/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        الضرائب</router-link>
                                </li>
                            </ul>
                            <h2 class="text-sm font-medium leading-5 my-2">الدول والعملات</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/cities/list"
                                        :class="[$route.path.includes('/cities/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        إدارة الدول
                                    </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/sales/invoices"
                                        :class="[$route.path.includes('/sales/invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        إدارة العملات</router-link>
                                </li>
                            </ul>
                            <h2 class="text-sm font-medium leading-5 my-2">إعدادات متقدمة</h2>
                            <ul class="space-y-2 text-slate-100 text-xs list-disc list-outside ps-5">
                                <li class="relative">
                                    <router-link to="/codes"
                                        :class="[$route.path.includes('/codes') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        اعدادات الاكواد
                                    </router-link>
                                </li>
                                <li class="relative">
                                    <router-link to="/account-types/list"
                                        :class="[$route.path.includes('/account-types/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        أنواع الحسابات
                                    </router-link>
                                </li>
                            </ul>

                        </div>
                    </v-list-group>
                </v-list>
            </div>

            <div class="mt-15 px-2">
                <a href="#" class="block relative" v-if="isSidebarExpanded">
                    <v-btn size="x-small"
                        class="!absolute !top-[-15px] !left-5 bg-white border-[3px] border-qallab-blue !rounded-full p-1 h-9 w-9 flex items-center justify-center">
                        <v-icon size="20" class="text-qallab-blue font-bold">mdi-arrow-top-right</v-icon>
                    </v-btn>
                    <div
                        class="bg-white bg-[url('@/assets/vectors/mobile-download.svg')] bg-cover bg-right-bottom rounded-xl px-3 py-4 leading-relaxed flex items-end justify-between">
                        <img src="@/assets/vectors/qallab-iphone.svg"
                            class="transform scale-[1.5] translate-x-[-15px] translate-y-[-20px] w-12">
                        <span class="font-bold text-primary-900 text-end">Download our <br>
                            Mobile app</span>
                    </div>
                </a>
                <div v-else class="flex justify-center">
                    <v-btn icon size="x-small" class="bg-white text-qallab-blue rounded-full shadow-sm">
                        <v-icon size="18" class="text-qallab-blue">mdi-arrow-top-right</v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
    </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import {
    homeIcon,
    productsIcon,
    servicesIcon,
    salesIcon,
    projectsIcon,
    purchasesIcon,
    financeIcon,
    usersIcon,
    logisticsIcon,
    reportsIcon,
    settingsIcon
} from "@/components/icons/sidebarIcons";

const route = useRoute();

// Define routes for each dropdown group
const productsRoutes = ['/simple-products', '/group-products', '/products/prices-list', '/products/production-capacity-list', '/customers/list', '/sales/invoices'];
const servicesRoutes = ['/services'];
const salesRoutes = ['/customers', '/sales'];
const projectsRoutes = ['/projects'];
const purchasesRoutes = ['/suppliers'];
const financeRoutes = ['/finance'];
const usersRoutes = ['/users'];
const logisticsRoutes = ['/logistics'];
const reportsRoutes = ['/reports'];
const settingsRoutes = ['/products-categories', '/services-categories', '/units', '/factories', '/brands', '/geo-areas', '/geo-segments', '/tax-rules', '/taxes', '/cities', '/codes', '/account-types'];

// Check if current route is active for a group
const isGroupActive = (routes) => {
    return routes.some(r => route.path.includes(r));
};

// Computed properties for each group's active state
const isProductsActive = computed(() => isGroupActive(productsRoutes));
const isServicesActive = computed(() => isGroupActive(servicesRoutes));
const isSalesActive = computed(() => isGroupActive(salesRoutes));
const isProjectsActive = computed(() => isGroupActive(projectsRoutes));
const isPurchasesActive = computed(() => isGroupActive(purchasesRoutes));
const isFinanceActive = computed(() => isGroupActive(financeRoutes));
const isUsersActive = computed(() => isGroupActive(usersRoutes));
const isLogisticsActive = computed(() => isGroupActive(logisticsRoutes));
const isReportsActive = computed(() => isGroupActive(reportsRoutes));
const isSettingsActive = computed(() => isGroupActive(settingsRoutes));

// Track open groups
const openGroups = ref([]);

// Get current active group name
const getActiveGroupName = () => {
    if (isProductsActive.value) return 'products';
    if (isServicesActive.value) return 'services';
    if (isSalesActive.value) return 'sales';
    if (isProjectsActive.value) return 'projects';
    if (isPurchasesActive.value) return 'purchases';
    if (isFinanceActive.value) return 'finance';
    if (isUsersActive.value) return 'users';
    if (isLogisticsActive.value) return 'logistics';
    if (isReportsActive.value) return 'reports';
    if (isSettingsActive.value) return 'settings';
    return null;
};

// Initialize openGroups only once - don't watch route changes
// This prevents scroll reset when navigating within the same dropdown
const initActiveGroup = getActiveGroupName();
if (initActiveGroup) {
    openGroups.value = [initActiveGroup];
}

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: true,
    },
    isMobile: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:modelValue"]);

const drawerProxy = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit("update:modelValue", value);
    },
});

const isCollapsed = ref(false);
const isDrawerHovered = ref(false);

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const isSidebarExpanded = computed(() => !isCollapsed.value || isDrawerHovered.value);
</script>

<style>
.q-sidebar-drawer {
    overflow: visible !important;
}

.q-sidebar-drawer .v-navigation-drawer__content {
    overflow: hidden !important;
}

.q-sidebar-drawer .v-list-item__content {
    flex: 1;
}

.q-sidebar-drawer .q-sidebar-toggle {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.q-sidebar-drawer.v-navigation-drawer--rail .q-sidebar-toggle {
    position: static;
}

.q-sidebar-drawer.v-navigation-drawer--rail.v-navigation-drawer--expand-on-hover:hover .q-sidebar-toggle,
.q-sidebar-drawer:not(.v-navigation-drawer--rail) .q-sidebar-toggle {
    position: absolute;
    top: 3.5rem;
    left: -1rem;
    margin-bottom: 0;
}

.q-sidebar-scroll {
    overflow-y: auto;
    overflow-x: hidden !important;
    overflow-anchor: none !important;
}

.q-sidebar-scroll::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.q-sidebar-scroll {
    scrollbar-width: none;
}

.q-sidebar-drawer .v-list-item--active>.v-list-item__overlay {
    display: none;
}

.q-sidebar-drawer .v-list-group__items {
    scroll-margin: 0 !important;
}

.q-sidebar-scroll * {
    scroll-behavior: auto !important;
}

.q-sidebar-drawer .v-list-item {
    scroll-margin: 0 !important;
    scroll-snap-align: none !important;
}
</style>