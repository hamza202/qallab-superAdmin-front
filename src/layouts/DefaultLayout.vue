<template>
    <v-app class="bg-gray-50 font-sans h-screen overflow-hidden">
        <AppSidebar v-model="drawer" :is-mobile="isMobile" />

        <app-header :drawer="drawer" @toggle-drawer="drawer = !drawer" :is-mobile="isMobile" />

        <v-main class="pb-15 !pe-4 md:!pe-6 lg:ms-5 h-full overflow-hidden">
            <v-container fluid
                class="bg-white p-0 !border border-gray-300 rounded-[24px] m-1 h-full flex flex-col overflow-hidden">
                <div class="flex-1 overflow-y-auto overflow-x-hidden main-scroll">
                    <div class="px-6 py-6">
                        <slot />
                    </div>
                </div>
            </v-container>
        </v-main>
        <app-footer />
    </v-app>
</template>

<script setup>
import AppFooter from "@/components/layout/AppFooter.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";

import { ref, computed, watch } from "vue";
import { useDisplay } from "vuetify";

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);
const drawer = ref(!isMobile.value);

watch(isMobile, (value) => {
    drawer.value = !value;
});
</script>

<style lang="scss">
.main-scroll {
  scrollbar-width: thin;
  scrollbar-color: #E3E8EF transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #E3E8EF;
    border-radius: 9999px;

    &:hover {
      background-color: #E3E8EF;
    }
  }
}
</style>