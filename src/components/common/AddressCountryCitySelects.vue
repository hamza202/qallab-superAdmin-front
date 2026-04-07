<script setup lang="ts">
import SelectInput from "@/components/common/forms/selectInput.vue";
import { useLazyCountryCityLists } from "@/composables/useLazyCountryCityLists";

const props = withDefaults(
  defineProps<{
    countryId: number | null;
    cityId: number | null;
    countryLabel: string;
    countryPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    countryError?: string;
    cityError?: string;
    countryRules?: unknown[];
    cityRules?: unknown[];
    /** When false, city list loads without country filter (e.g. some filters). */
    requireCountryForCities?: boolean;
    /** Delay list API calls until parent data is loaded (e.g. edit form). */
    waitForListsReady?: () => void | Promise<void>;
  }>(),
  {
    countryError: "",
    cityError: "",
    countryRules: () => [],
    cityRules: () => [],
    requireCountryForCities: true,
  }
);

const emit = defineEmits<{
  "update:countryId": [value: number | null];
  "update:cityId": [value: number | null];
  "clear:error": [field: string];
}>();

const { buildCountriesFetcher, buildCitiesFetcher } = useLazyCountryCityLists();

const fetchCountriesList = buildCountriesFetcher({
  getSelectedCountryId: () => props.countryId ?? undefined,
  waitForReady: async () => {
    await props.waitForListsReady?.();
  },
});

const fetchCitiesList = buildCitiesFetcher({
  getCountryId: () => props.countryId ?? undefined,
  getSelectedCityId: () => props.cityId ?? undefined,
  getRequireCountry: () => props.requireCountryForCities,
  waitForReady: async () => {
    await props.waitForListsReady?.();
  },
});

const onCountryChange = (v: number | null) => {
  emit("update:countryId", v);
  emit("update:cityId", null);
  emit("clear:error", "country_id");
  emit("clear:error", "city_id");
};

const onCityChange = (v: number | null) => {
  emit("update:cityId", v);
  emit("clear:error", "city_id");
};
</script>

<template>
  <SelectInput
    :model-value="countryId"
    :items="[]"
    :label="countryLabel"
    :placeholder="countryPlaceholder"
    density="comfortable"
    clearable
    :hide-details="false"
    :rules="countryRules"
    :error-messages="countryError"
    :server-side="true"
    :fetch-function="fetchCountriesList"
    item-title-key="name"
    item-value-key="id"
    :debounce-time="500"
    @update:model-value="onCountryChange"
  />
  <SelectInput
    :key="String(countryId ?? 'no-country')"
    :model-value="cityId"
    :items="[]"
    :label="cityLabel"
    :placeholder="cityPlaceholder"
    density="comfortable"
    clearable
    :hide-details="false"
    :disabled="requireCountryForCities && !countryId"
    :rules="cityRules"
    :error-messages="cityError"
    :server-side="true"
    :fetch-function="fetchCitiesList"
    item-title-key="name"
    item-value-key="id"
    :debounce-time="500"
    @update:model-value="onCityChange"
  />
</template>
