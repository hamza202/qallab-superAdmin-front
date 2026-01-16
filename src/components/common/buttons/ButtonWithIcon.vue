<script setup lang="ts">
import { computed } from "vue";

type ButtonVariant = "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
type ButtonSize = "x-small" | "small" | "default" | "large" | "x-large";
type ButtonDensity = "default" | "comfortable" | "compact";

interface ButtonWithIconProps {
  // Content
  label?: string;
  icon?: string;
  iconPosition?: "prepend" | "append";
  prependIcon?: string;
  appendIcon?: string;

  // Vuetify props
  variant?: ButtonVariant;
  color?: string;
  size?: ButtonSize;
  density?: ButtonDensity;
  height?: string | number;
  width?: string | number;
  rounded?: string | number | boolean;

  // States
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;

  // Styling
  elevation?: string | number;
  border?: string | boolean;

  // Custom classes
  customClass?: string;

  // HTML attributes
  type?: "button" | "submit" | "reset";
  href?: string;
  to?: string | object;

  // Icon only mode
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<ButtonWithIconProps>(), {
  variant: "flat",
  color: "primary",
  size: "default",
  density: "default",
  height: "40",
  rounded: "4",
  disabled: false,
  loading: false,
  block: false,
  type: "button",
  iconPosition: "prepend",
  iconOnly: false,
});

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};

// Determine if we should show icon in prepend or append slot
const showPrependIcon = computed(() => {
  return props.prependIcon;
});

const showAppendIcon = computed(() => {
  return props.appendIcon;
});

const prependIconToShow = computed(() => {
  return props.prependIcon;
});

const appendIconToShow = computed(() => {
  return props.appendIcon;
});

// Helper to detect if icon is MDI string (starts with 'mdi-') or SVG HTML
const isMdiIcon = (icon: string | undefined | null) => {
  return icon && typeof icon === 'string' && icon.startsWith('mdi-');
};

const isSvgIcon = (icon: string | undefined | null) => {
  return icon && typeof icon === 'string' && !icon.startsWith('mdi-');
};
</script>

<template>
  <v-btn :variant="variant" :color="color" :size="size" :density="density" :height="height" :width="width"
    :rounded="rounded" :disabled="disabled" :loading="loading" :block="block" :elevation="elevation" :border="border"
    :type="type" :href="href" :to="to" :class="customClass" @click="handleClick">
    <!-- Prepend Icon Slot -->
    <template v-if="showPrependIcon" #prepend>
      <slot name="prepend">
        <v-icon v-if="isMdiIcon(prependIconToShow)">{{ prependIconToShow }}</v-icon>
        <span v-else-if="isSvgIcon(prependIconToShow)" v-html="prependIconToShow"></span>
      </slot>
    </template>

    <!-- Default Slot for Label or Icon-Only -->
    <slot>
      <template v-if="iconOnly && icon">
        <v-icon v-if="isMdiIcon(icon)">{{ icon }}</v-icon>
        <span v-else-if="isSvgIcon(icon)" v-html="icon"></span>
      </template>
      <span v-else-if="!iconOnly && label">{{ label }}</span>
    </slot>

    <!-- Append Icon Slot -->
    <template v-if="showAppendIcon" #append>
      <slot name="append">
        <v-icon v-if="isMdiIcon(appendIconToShow)">{{ appendIconToShow }}</v-icon>
        <span v-else-if="isSvgIcon(appendIconToShow)" v-html="appendIconToShow"></span>
      </slot>
    </template>
  </v-btn>
</template>

<style scoped>
/* Add any custom button styles here if needed */
</style>
