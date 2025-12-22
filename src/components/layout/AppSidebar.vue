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

                <v-list density="compact" nav class="text-sm px-0 space-y-1"
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
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">المنتجات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="productsIcon"></span>
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
                                    <router-link to="/products/sales-management"
                                        :class="[$route.path.includes('/products/sales-management') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        المبيعات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/products/price-list"
                                        :class="[$route.path.includes('/products/price-list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">قائمة
                                        الأسعار</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/products/production-capacity"
                                        :class="[$route.path.includes('/products/production-capacity') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">القدرة
                                        الإنتاجية</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/products/settings"
                                        :class="[$route.path.includes('/products/settings') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إعدادات
                                        المنتج</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- الخدمات -->
                    <v-list-group value="services" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">الخدمات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="servicesIcon"></span>
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
                                    <router-link to="/services/management"
                                        :class="[$route.path.includes('/services/management') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        الخدمات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/services/price-list"
                                        :class="[$route.path.includes('/services/price-list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">قوائم
                                        الأسعار</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/services/settings"
                                        :class="[$route.path.includes('/services/settings') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إعدادات
                                        الخدمات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المبيعات -->
                    <v-list-group value="sales" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">المبيعات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="salesIcon"></span>
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
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المشاريع -->
                    <v-list-group value="projects" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">المشاريع</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="projectsIcon"></span>
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
                                    <router-link to="/projects/management"
                                        :class="[$route.path.includes('/projects/management') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        المشاريع</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/projects/scheduling"
                                        :class="[$route.path.includes('/projects/scheduling') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">جدولة
                                        المشاريع</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المشتريات -->
                    <v-list-group value="purchases" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">المشتريات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="purchasesIcon"></span>
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
                                    <router-link to="/purchases/quotations"
                                        :class="[$route.path.includes('/purchases/quotations') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        عروض الأسعار</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/purchases/invoices"
                                        :class="[$route.path.includes('/purchases/invoices') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        فواتير المبيعات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/purchases/orders"
                                        :class="[$route.path.includes('/purchases/orders') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        طلبات المشتريات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/purchases/contracts"
                                        :class="[$route.path.includes('/purchases/contracts') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">إدارة
                                        العقود</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <!-- المالية -->
                    <v-list-group value="finance" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">المالية</span></div>
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
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">المستخدمين</span></div>
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
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">اللوجستيات</span></div>
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
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">التقارير</span></div>
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
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">mdi-chevron-down</v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1"><span class="font-semibold">الإعدادات</span></div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-md w-6 h-6 flex items-center justify-center">
                                        <span v-html="settingsIcon"></span>
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
                                    <router-link to="/settings/countries-cities"
                                        :class="[$route.path.includes('/settings/countries-cities') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">الدول
                                        والمدن</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/settings/categories"
                                        :class="[$route.path.includes('/settings/categories') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">التصنيفات</router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
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
</style>