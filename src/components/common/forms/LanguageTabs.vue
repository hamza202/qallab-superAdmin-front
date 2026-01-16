<script setup lang="ts">
import { ref, watch, provide } from "vue";

export interface Language {
  code: string;
  name: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

interface LanguageTabsProps {
  languages: Language[];
  modelValue?: Record<string, boolean>;
  label?: string;
  labelClass?: string;
}

const props = withDefaults(defineProps<LanguageTabsProps>(), {
  languages: () => [
    { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" },
    { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" },
  ],
  label: "",
  labelClass: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, boolean>): void;
}>();

const activeTab = ref(props.languages[0]?.code || "en");

const validationState = ref<Record<string, boolean>>({});

const setValidation = (langCode: string, isValid: boolean) => {
  validationState.value[langCode] = isValid;
  emit("update:modelValue", { ...validationState.value });
};

provide("languageTabsValidation", {
  setValidation,
  activeTab,
});

const getTabClasses = (lang: Language) => {
  const isActive = activeTab.value === lang.code;
  const hasError = validationState.value[lang.code] === false;

  return [
    "flex items-center gap-2 px-4 py-[10px] text-xs font-semibold cursor-pointer transition-all duration-150",
    "border-l first:border-l-0 border-gray-300",
    isActive ? "bg-white text-gray-700" : "bg-gray-50 text-gray-800",
    hasError ? "border-t-2 border-t-red-500" : "",
  ];
};

const getContentClasses = (langCode: string) => {
  const hasError = validationState.value[langCode] === false;
  return [
    // "overflow-hidden",
    hasError ? "border-red-500" : "",
  ];
};

watch(
  () => props.languages,
  (newLangs) => {
    if (newLangs.length > 0 && !newLangs.find((l) => l.code === activeTab.value)) {
      activeTab.value = newLangs[0].code;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="language-tabs-wrapper">
    <div class="flex items-end justify-between">
      <label v-if="label" class="qallab-label" :class="labelClass">
        {{ label }}
      </label>

      <!-- Tabs Header -->
      <div
        class="flex items-center border border-b-0 border-gray-300 rounded-tl-lg rounded-tr-lg overflow-hidden shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          type="button"
          :class="getTabClasses(lang)"
          @click="activeTab = lang.code"
        >
          <img :src="lang.flag" :alt="lang.name" class="w-5 h-5 rounded-full object-cover" />
          <span>{{ lang.name }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div :class="getContentClasses(activeTab)">
      <template v-for="lang in languages" :key="lang.code">
        <div
          v-show="activeTab === lang.code"
          :dir="lang.dir || 'ltr'"
          class="tab-content"
        >
          <slot :name="lang.code" :lang="lang" :isActive="activeTab === lang.code"></slot>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tab-content {
  min-height: 40px;
}
</style>
