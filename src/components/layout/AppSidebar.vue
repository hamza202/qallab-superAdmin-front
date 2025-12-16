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
                    <div class="px-4 pb-1 text-xs text-primary-200"
                        :class="{ '!px-1 text-center': !isSidebarExpanded }">
                        الرئيسية
                    </div>

                    <v-list-item value="overview" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg text-white hover:bg-primary-700/40 transition flex items-center justify-start gap-2">
                        <template #title>
                            نظرة عامة
                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex items-center justify-center ">
                                <v-icon size="20">mdi-view-grid-outline</v-icon>
                            </div>
                        </template>
                    </v-list-item>

                    <v-list-group value="products" :model-value="true" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">
                                        mdi-chevron-down
                                    </v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1">
                                        <span class="font-semibold">المنتجات</span>
                                    </div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex  items-center justify-center">
                                        <v-icon size="20">mdi-view-grid-outline</v-icon>
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
                                    <router-link to="/simple-products/create"
                                        :class="[$route.path.includes('/simple-products') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.simpleProducts.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/group-products"
                                        :class="[$route.path.includes('/group-products') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.groupProducts.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/composite-products"
                                        :class="[$route.path.includes('/composite-products') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.compositeProducts.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>


                    <v-list-group value="settings" :model-value="true" class="mt-1">
                        <template #activator="{ props, isOpen }">
                            <v-list-item v-bind="props" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                                class="px-2 py-1.5 mx-4 rounded-lg hover:bg-primary-700/40 text-white flex items-center justify-between gap-2">
                                <template #append>
                                    <v-icon size="20"
                                        :class="['ms-auto transition-transform', isOpen ? 'rotate-180' : '']">
                                        mdi-chevron-down
                                    </v-icon>
                                </template>
                                <template #title>
                                    <div class="flex-1">
                                        <span class="font-semibold">الإعدادات</span>
                                    </div>
                                </template>
                                <template #prepend>
                                    <div
                                        class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex  items-center justify-center">
                                        <v-icon size="20">mdi-view-grid-outline</v-icon>
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
                                    <router-link to="/categories"
                                        :class="[$route.path.includes('/categories') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.categories.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/units"
                                        :class="[$route.path.includes('/units') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.units.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/brands"
                                        :class="[$route.path.includes('/brands') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.brands.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/factories"
                                        :class="[$route.path.includes('/factories') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.factories.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/geo-areas"
                                        :class="[$route.path.includes('/geo-areas') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.geoAreas.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/geo-segments"
                                        :class="[$route.path.includes('/geo-segments') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.geoSegments.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/codes"
                                        :class="[$route.path.includes('/codes') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.codes.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/cities"
                                        :class="[$route.path.includes('/cities') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.cities.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/taxes"
                                        :class="[$route.path.includes('/taxes') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.taxes.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/account-types"
                                        :class="[$route.path.includes('/account-types') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.accountTypes.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                                <li class="relative">
                                    <router-link to="/tax-rules"
                                        :class="[$route.path.includes('/tax-rules') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                        {{ $t('pages.taxRules.title') }}
                                    </router-link>
                                    <span
                                        class="absolute top-1/2 right-[-26px] w-4 border-t-2 border-dotted border-white -translate-y-1/2"></span>
                                </li>
                            </ul>
                        </div>
                    </v-list-group>

                    <v-list-item value="inventory" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg hover:bg-primary-700/40 transition text-white flex items-center justify-start gap-2 mt-2">
                        <template #title>
                            <router-link to="/suppliers/list"
                                :class="[$route.path.includes('/suppliers/list') ? 'font-bold text-qallab-yellow' : 'text-white hover:text-qallab-yellow']">
                                {{ $t('pages.suppliers.title') }}
                            </router-link>

                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex items-center justify-center ">
                                <v-icon size="20">mdi-warehouse</v-icon>
                            </div>
                        </template>
                    </v-list-item>

                    <v-list-item value="product-settings" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg hover:bg-primary-700/40 transition text-white flex items-center justify-start gap-2">
                        <template #title>
                            إدارة اعدادات المنتجات
                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex items-center justify-center ">
                                <v-icon size="20">mdi-view-grid-plus</v-icon>
                            </div>
                        </template>
                    </v-list-item>

                    <v-list-item value="services" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg hover:bg-primary-700/40 transition text-white flex items-center justify-start gap-2">
                        <template #title>
                            الخدمات
                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex items-center justify-center ">
                                <v-icon size="20">mdi-apps-box</v-icon>
                            </div>
                        </template>
                    </v-list-item>
                    <div class="px-3 my-3">
                        <v-divider opacity=".25" thickness="2" color="white"></v-divider>

                    </div>

                    <div class="px-4 pb-1 text-xs text-primary-200"
                        :class="{ '!px-1 text-center': !isSidebarExpanded }">
                        الإعدادات
                    </div>

                    <v-list-item value="users" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg hover:bg-primary-700/40 transition text-white flex items-center justify-start gap-2">
                        <template #title>
                            إدارة المستخدمين
                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex items-center justify-center ">
                                <v-icon size="20">mdi-account-outline</v-icon>
                            </div>
                        </template>
                    </v-list-item>

                    <v-list-item value="language" :class="{ '!mx-1 gap-5': !isSidebarExpanded }"
                        class="mx-4 px-2 py-1.5 rounded-lg hover:bg-primary-700/40 transition text-white flex items-center justify-start gap-2">
                        <template #title>
                            اللغة
                        </template>
                        <template #prepend>
                            <div
                                class="bg-qallab-yellow text-white rounded-lg w-8 h-8 flex items-center justify-center ">
                                <v-icon size="20">mdi-web</v-icon>
                            </div>
                        </template>
                    </v-list-item>
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