<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { homeIcon } from "@/components/icons/globalIcons";

const props = withDefaults(
  defineProps<{
    listPath: string;
    /** e.g. breadcrumb.purchases.root */
    moduleRootKey: string;
    /** e.g. breadcrumb.purchases.orders.materialProduct.list */
    listLabelKey: string;
    createLabelKey: string;
    editLabelKey: string;
    isEditMode: boolean;
    /** When set, used instead of create/edit (e.g. link forms). */
    actionLabelKey?: string;
    code?: string | null;
  }>(),
  { code: "", actionLabelKey: "" }
);

const { t } = useI18n();

const pageLabel = computed(() => {
  if (props.actionLabelKey) {
    return t(props.actionLabelKey);
  }
  return props.isEditMode ? t(props.editLabelKey) : t(props.createLabelKey);
});

const codeDisplay = computed(() => (props.code == null ? "" : String(props.code)));
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 mb-4 text-sm px-6">
    <router-link
      to="/"
      class="text-gray-500 hover:text-primary-600"
      :aria-label="t('breadcrumb.shared.home')"
    >
      <span v-html="homeIcon"></span>
    </router-link>
    <span class="text-lg text-gray-300">/</span>
    <span class="text-gray-600">{{ t(moduleRootKey) }}</span>
    <span class="text-lg text-gray-300">/</span>
    <router-link :to="listPath" class="text-gray-600 hover:text-primary-600">
      {{ t(listLabelKey) }}
    </router-link>
    <span class="text-lg text-gray-300">/</span>
    <span class="text-gray-600">{{ pageLabel }}</span>
    <span v-if="codeDisplay" class="text-lg text-gray-300">/</span>
    <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">{{
      codeDisplay
    }}</span>
  </div>
</template>
