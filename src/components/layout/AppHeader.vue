<template>
    <v-app-bar app flat color="gray-50" class="px-4 md:px-8 border-t-4 border-qallab-blue lg:!ps-12" height="75">
        <v-app-bar-nav-icon density="comfortable" :class="isMobile ? 'block me-2' : 'hidden'" @click="onToggleDrawer" />
        <div class="flex-1 flex items-center gap-4">
            <div class="hidden md:flex flex-1">
                <h1 class="text-h5 font-bold">
                    أهلاً وسهلاً <span class="text-qallab-blue-light">محمد</span>
                </h1>
            </div>

            <div class="flex items-center gap-4 justify-end ms-auto flex-1">
                <v-btn size="small" icon variant="flat" class="bg-qallab-blue text-white">
                    <v-icon>mdi-bell-outline</v-icon>
                </v-btn>

                <v-text-field density="comfortable" variant="outlined" hide-details placeholder="Search"
                    class="max-w-md w-full flex-1" prepend-inner-icon="mdi-magnify" />

                <div class="flex items-center gap-2">
                    <div class="hidden sm:flex flex-col text-end">
                        <span class="text-sm font-semibold text-gray-900">
                            Mohammed Saqer
                        </span>
                        <span class="text-xs text-gray-500">mohawck@qallab.com</span>
                    </div>

                    <v-avatar class="position-relative overflow-visible">
                        <v-img alt="John" src="https://cdn.vuetifyjs.com/images/john.jpg" class="rounded-full"></v-img>
                        <img alt="John" src="@/assets/vectors/qallab-icon.svg"
                            class="position-absolute bottom-[-5px] start-[-4px] z-index-3"></img>
                    </v-avatar>
                </div>
            </div>
        </div>
    </v-app-bar>
</template>
<script setup>
const props = defineProps({
    drawer: {
        type: Boolean,
        default: true,
    },
    isMobile: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(["toggle-drawer"]);

const onToggleDrawer = () => {
    emit("toggle-drawer");
};
</script>
