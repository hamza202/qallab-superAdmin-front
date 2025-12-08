<template>
    <v-navigation-drawer v-model="drawerProxy" app width="230" :rail="!isMobile && isCollapsed"
        :expand-on-hover="!isMobile && isCollapsed" :permanent="!isMobile" :temporary="isMobile"
        class="py-4 lg:ms-2 max-h-[94vh] border-0 bg-gray-50 !border-t-4 !border-qallab-blue q-sidebar-drawer"
        :class="{ 'pt-0 pb-0 max-h-[100vh]': isMobile }">
        <div class="relative !overflow-visible bg-primary-800 text-white pt-7 pb-4 flex flex-col justify-between w-100 h-100 rounded-[24px]"
            :class="{ 'pt-0 rounded-none': isMobile }">
            <div class="flex flex-col gap-4">
                <div class="flex justify-center mb-2 px-3">
                    <img src="@/assets/logo-light.svg" alt="Qallab logo" class="w-15" />
                </div>
                <div class="q-sidebar-toggle" v-if="!isMobile">
                    <v-btn size="x-small" icon class="bg-qallab-yellow text-white shadow-md rounded-full"
                        @click="toggleCollapse">
                        <v-icon size="20">{{ isCollapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
                    </v-btn>
                </div>

                <v-list density="compact" nav class="text-sm">
                    <v-list-item value="home" class="px-3 py-2 rounded-lg bg-primary-700/60 text-white">
                        <template #prepend>
                            <v-icon size="20" class="text-qallab-yellow">mdi-home-outline</v-icon>
                        </template>
                        <template #title>
                            الرئيسية
                        </template>
                    </v-list-item>

                    <v-list-item value="products"
                        class="px-3 py-2 rounded-lg hover:bg-primary-700/40 transition text-white">
                        <template #prepend>
                            <v-icon size="20" class="text-qallab-yellow">mdi-view-grid-outline</v-icon>
                        </template>
                        <template #title>
                            المنتجات
                        </template>
                    </v-list-item>

                    <v-list-item value="inventory"
                        class="px-3 py-2 rounded-lg hover:bg-primary-700/40 transition text-white">
                        <template #prepend>
                            <v-icon size="20" class="text-qallab-yellow">mdi-warehouse</v-icon>
                        </template>
                        <template #title>
                            إدارة المخازن
                        </template>
                    </v-list-item>

                    <v-list-item value="settings"
                        class="px-3 py-2 rounded-lg hover:bg-primary-700/40 transition text-white">
                        <template #prepend>
                            <v-icon size="20" class="text-qallab-yellow">mdi-cog-outline</v-icon>
                        </template>
                        <template #title>
                            الإعدادات
                        </template>
                    </v-list-item>
                </v-list>
            </div>

            <div class="mt-6">
                <div class="bg-white/10 rounded-xl px-3 py-4 text-xs leading-relaxed">
                    Download our
                    <span class="font-semibold">Mobile app</span>
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
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
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
    top: 2rem;
    left: -1rem;
    margin-bottom: 0;
}
</style>