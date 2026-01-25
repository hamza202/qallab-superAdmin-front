<script setup lang="ts">
interface AppDialogProps {
  modelValue: boolean;
  title?: string;
  maxWidth?: string | number;
  scrim?: string;
  persistent?: boolean;
  hideHeader?: boolean;
  hideActions?: boolean;
  opacity?: string | number
}

const props = withDefaults(defineProps<AppDialogProps>(), {
  maxWidth: 500,
  scrim: "#194185",
  opacity: ".92",
  persistent: false,
  hideHeader: false,
  hideActions: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const closeDialog = () => {
  internalOpen.value = false;
  emit("close");
};
</script>

<template>
  <v-dialog
    v-model="internalOpen"
    :max-width="props.maxWidth"
    :scrim="props.scrim"
    :persistent="props.persistent"
    :opacity="props.opacity"
    attach="#app"
  >
    <v-card class="rounded-lg">
      <v-card-title
        v-if="!props.hideHeader"
        class="flex items-center justify-between p-4 border-b border-slate-200"
      >
        <div class="flex items-center gap-2">
          <slot name="title">
            <h2 v-if="props.title" class="text-base font-bold text-gray-900">
              {{ props.title }}
            </h2>
          </slot>
        </div>
        <v-btn icon variant="text" color="gray" density="comfortable" @click="closeDialog">
          <v-icon size="20" color="gray-500">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pb-0 pt-4">
        <slot />
      </v-card-text>

      <v-card-actions
        v-if="!props.hideActions"
        class="px-6 pb-5 pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end items-stretch"
      >
        <slot name="actions">
          <v-btn
            variant="flat"
            color="primary-50"
            height="44"
            class="font-semibold text-base text-primary-700 sm:flex-1"
            @click="closeDialog"
          >
            اغلاق
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
