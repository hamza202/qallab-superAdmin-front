<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import { useApi } from "@/composables/useApi";
import { useTableColumns, type TableHeader } from "@/composables/useTableColumns";
import { homeIcon, plusIcon, columnIcon, SettingsIcon, mapIcon } from "@/components/icons/globalIcons";
import { required } from "@/utils/validators";
const icon = `<svg width="49" height="44" viewBox="0 0 49 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.66667 12.6587C5.28398 12.6488 5.00609 12.6267 4.75625 12.577C2.90502 12.2088 1.4579 10.7616 1.08967 8.91042C1 8.45963 1 7.91753 1 6.83333C1 5.74914 1 5.20704 1.08967 4.75625C1.4579 2.90502 2.90502 1.4579 4.75625 1.08967C5.20704 1 5.74914 1 6.83333 1H41.8333C42.9175 1 43.4596 1 43.9104 1.08967C45.7616 1.4579 47.2088 2.90502 47.577 4.75625C47.6667 5.20704 47.6667 5.74914 47.6667 6.83333C47.6667 7.91753 47.6667 8.45963 47.577 8.91042C47.2088 10.7616 45.7616 12.2088 43.9104 12.577C43.6606 12.6267 43.3827 12.6488 43 12.6587M19.6667 24.3333H29M5.66667 12.6667H43V31.8C43 35.7204 43 37.6805 42.237 39.1779C41.5659 40.4951 40.4951 41.5659 39.1779 42.237C37.6806 43 35.7204 43 31.8 43H16.8667C12.9463 43 10.9861 43 9.48873 42.237C8.1716 41.5659 7.10073 40.4951 6.42962 39.1779C5.66667 37.6805 5.66667 35.7204 5.66667 31.8V12.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const { t } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();

const zoneIdParam = computed(() => String(route.params.zoneId ?? ""));
const cityIdParam = computed(() => String(route.params.cityId ?? ""));

const zoneLabelQuery = computed(() => {
  const z = route.query.zone;
  const zStr = Array.isArray(z) ? z[0] : z;
  const parts = [typeof zStr === "string" ? zStr.trim() : ""].filter(
    Boolean
  );
  return parts.join(" — ") || "";
});

const breadcrumbZoneLabel = computed(() => {
  if (zoneLabelQuery.value) return zoneLabelQuery.value;
  return t("pages.centralPaths.zoneSuburbs.breadcrumbZoneFallback", { id: zoneIdParam.value });
});

const pageDescription = computed(() => zoneLabelQuery.value || t("pages.centralPaths.zoneSuburbs.descriptionFallback"));

const tableName = ref("");
const {
  allHeaders,
  shownHeaders,
  updatingHeaders,
  showHeadersMenu,
  headerCheckStates,
  initHeaders,
  toggleHeader,
} = useTableColumns(tableName);

interface Pagination {
  next_cursor: string | null;
  prev_cursor?: string | null;
  per_page?: number;
}

interface RowActions {
  can_update?: boolean;
  can_delete?: boolean;
  can_view?: boolean;
  can_change_status?: boolean;
}

interface ZoneSuburbRow {
  id: number;
  city_suburb_id: number;
  /** Resolved label for table + select presets */
  name: string;
  /** Same as name when API uses city_suburb_name column key */
  city_suburb_name: string;
  is_active: boolean;
  actions: RowActions;
}

interface ZoneCitySuburbsIndexResponse {
  data: unknown[];
  pagination?: Pagination;
  header_table?: string;
  headers?: TableHeader[];
  shownHeaders?: TableHeader[];
}

const zoneStatusSlotName = "item.is_active";

const tableItems = ref<ZoneSuburbRow[]>([]);
const tableHeaders = computed(() =>
  shownHeaders.value.map((h) => ({ key: h.key, title: h.title, width: h.width ?? "140px" }))
);

const loading = ref(false);
const loadingMore = ref(false);
const nextCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);
const loadMoreTrigger = ref<HTMLElement | null>(null);

const formRef = ref<{
  validate: () => Promise<{ valid: boolean }>;
  resetValidation?: () => void;
} | null>(null);
const isFormValid = ref(false);
const saving = ref(false);
const formErrors = ref<Record<string, string>>({});

/** Selected city suburb IDs (FK), sent as city_suburb_ids on update */
const selectedCitySuburbIds = ref<(string | number)[]>([]);

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<ZoneSuburbRow | null>(null);

const defaultActions = (): RowActions => ({
  can_update: true,
  can_delete: true,
  can_view: false,
  can_change_status: true,
});

const extractCitySuburbId = (raw: Record<string, unknown>): number => {
  if (raw.city_suburb_id != null) return Number(raw.city_suburb_id);
  if (raw.citySuburbId != null) return Number(raw.citySuburbId);
  const nested = raw.city_suburb as { id?: number } | undefined;
  if (nested?.id != null) return Number(nested.id);
  if (raw.suburb_id != null) return Number(raw.suburb_id);
  return 0;
};

const resolveSuburbDisplayName = (raw: Record<string, unknown>): string => {
  const nestedSuburb = raw.suburb as { name?: string } | undefined;
  const nestedCitySuburb = raw.city_suburb as { name?: string } | undefined;
  const candidates = [
    raw.city_suburb_name,
    raw.name,
    raw.suburb_name,
    nestedSuburb?.name,
    nestedCitySuburb?.name,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
};

const normalizeRow = (raw: Record<string, unknown>): ZoneSuburbRow => {
  const pivotId = Number(raw.id);
  const csId = extractCitySuburbId(raw);
  const displayName = resolveSuburbDisplayName(raw);
  const actionsRaw = raw.actions as RowActions | undefined;
  /** Prefer real FK; avoid using pivot id as city_suburb_id */
  const citySuburbId = csId > 0 ? csId : 0;
  return {
    id: pivotId,
    city_suburb_id: citySuburbId,
    name: displayName,
    city_suburb_name: displayName,
    is_active: Boolean(raw.is_active),
    actions: {
      ...defaultActions(),
      ...actionsRaw,
    },
  };
};

const statusChangeItemName = computed(
  () => itemToChangeStatus.value?.name || itemToChangeStatus.value?.city_suburb_name || ""
);

/** Labels for server-side multi-select chips (from index rows) */
const suburbPresetItems = computed(() =>
  tableItems.value
    .filter((r) => r.city_suburb_id > 0 && (r.name || r.city_suburb_name))
    .map((r) => {
      const label = (r.name || r.city_suburb_name).trim();
      return {
        id: r.city_suburb_id,
        name: label,
        title: label,
        value: r.city_suburb_id,
      };
    })
);

const getStaticHeaders = (): TableHeader[] => [
  { key: "city_suburb_name", title: t("pages.centralPaths.zoneSuburbs.columns.name") },
  { key: "is_active", title: t("pages.centralPaths.zoneSuburbs.columns.status") },
];

const handleToggleHeader = async (headerKey: string) => {
  try {
    await toggleHeader(headerKey);
  } catch (err: unknown) {
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("common.messages.general.saveError")
    );
  }
};

const syncFormSelectionFromTable = () => {
  const ids = tableItems.value.map((r) => r.city_suburb_id).filter((id) => id > 0);
  selectedCitySuburbIds.value = [...new Set(ids)];
};

const fetchCitySuburbsList = async (search = "", cursor?: string, perPageArg = 15) => {
  const cityId = Number(cityIdParam.value);
  if (!cityId || Number.isNaN(cityId)) {
    return { data: [], next_cursor: null as string | null };
  }

  const params: Record<string, string | number> = {
    per_page: perPageArg,
    city_id: cityId,
  };
  if (search) params.name = search;
  if (cursor) params.cursor = cursor;

  const res = await api.get<{ data?: unknown[]; pagination?: { next_cursor?: string | null } }>("/city-suburbs/list", {
    params,
  });

  return {
    data: Array.isArray(res.data) ? res.data : [],
    next_cursor: res.pagination?.next_cursor ?? null,
  };
};

const fetchZoneCitySuburbs = async (append = false) => {
  if (!zoneIdParam.value || !cityIdParam.value) return;
  try {
    if (append) loadingMore.value = true;
    else loading.value = true;

    const params = new URLSearchParams();
    params.set("zone_id", zoneIdParam.value);
    params.set("per_page", String(perPage.value));
    if (append && nextCursor.value) params.set("cursor", nextCursor.value);

    const url = `/zone-city-suburbs?${params.toString()}`;
    const response = await api.get<ZoneCitySuburbsIndexResponse>(url);

    const rows = (response.data || []).map((item) =>
      normalizeRow(item as unknown as Record<string, unknown>)
    );

    if (!append) {
      if (response.header_table) tableName.value = response.header_table;
      if (response.headers?.length && response.shownHeaders?.length) {
        initHeaders(response.headers, response.shownHeaders);
      } else {
        const fallback = getStaticHeaders();
        if (!tableName.value) tableName.value = "zone_city_suburbs";
        initHeaders(fallback, fallback);
      }

      tableItems.value = rows;
      syncFormSelectionFromTable();
      await nextTick();
      formRef.value?.resetValidation?.();
    } else {
      tableItems.value = [...tableItems.value, ...rows];
    }

    nextCursor.value = response.pagination?.next_cursor ?? null;
  } catch (err: unknown) {
    console.error(err);
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("common.messages.general.loadDataFailed")
    );
    if (!append) {
      tableItems.value = [];
      const fallback = getStaticHeaders();
      if (!tableName.value) tableName.value = "zone_city_suburbs";
      initHeaders(fallback, fallback);
      selectedCitySuburbIds.value = [];
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (!hasMoreData.value || loadingMore.value) return;
  await fetchZoneCitySuburbs(true);
};

const submitUpdate = async () => {
  formErrors.value = {};
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  const effectiveZoneId = Number(zoneIdParam.value);
  if (!effectiveZoneId || Number.isNaN(effectiveZoneId)) {
    toast.error(t("pages.centralPaths.zoneSuburbs.messages.missingZone"));
    return;
  }

  const citySuburbIds = selectedCitySuburbIds.value.map((x) => Number(x)).filter((n) => Number.isFinite(n));

  try {
    saving.value = true;
    await api.post("/zone-city-suburbs/sync", {
      zone_id: effectiveZoneId,
      city_suburb_ids: citySuburbIds,
      _method: "PUT",
    });
    toast.success(t("common.messages.success.updated"));
    await nextTick();
    formRef.value?.resetValidation?.();
    tableName.value = "";
    await fetchZoneCitySuburbs();
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
    if (e.response?.status === 422 && e.response.data?.errors) {
      const apiErrors = e.response.data.errors;
      Object.keys(apiErrors).forEach((key) => {
        formErrors.value[key] = apiErrors[key][0];
      });
      toast.error(e.response.data.message || t("common.messages.error.validationFailed"));
    } else {
      toast.error(e.response?.data?.message || t("common.messages.error.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (item: ZoneSuburbRow) => {
  try {
    await api.delete(`/zone-city-suburbs/${item.id}`);
    toast.success(t("common.messages.general.deleteSuccess"));
    tableName.value = "";
    await fetchZoneCitySuburbs();
  } catch (err: unknown) {
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("common.messages.general.deleteError")
    );
  }
};

const handleStatusChange = (item: ZoneSuburbRow) => {
  itemToChangeStatus.value = { ...item };
  showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value) return;
  try {
    statusChangeLoading.value = true;
    const newStatus = !itemToChangeStatus.value.is_active;
    await api.patch(`/zone-city-suburbs/${itemToChangeStatus.value.id}/change-status`, {
      status: newStatus,
    });
    toast.success(t(`common.messages.general.${newStatus ? "activateSuccess" : "deactivateSuccess"}`));
    const idx = tableItems.value.findIndex((r) => r.id === itemToChangeStatus.value!.id);
    if (idx !== -1) tableItems.value[idx].is_active = newStatus;
  } catch (err: unknown) {
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("common.messages.general.changeStatusError")
    );
  } finally {
    statusChangeLoading.value = false;
    showStatusChangeDialog.value = false;
    itemToChangeStatus.value = null;
  }
};

watch(
  () => [zoneIdParam.value, cityIdParam.value] as const,
  async ([zoneId, cityId]) => {
    if (!zoneId || !cityId) {
      router.push({ name: "CentralPathsList" });
      return;
    }
    selectedCitySuburbIds.value = [];
    tableName.value = "";
    formErrors.value = {};
    await nextTick();
    formRef.value?.resetValidation?.();
    await fetchZoneCitySuburbs();
  },
  { immediate: true }
);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMoreData.value && !loadingMore.value) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );
  const el = loadMoreTrigger.value;
  if (el) observer.observe(el);
});
</script>

<template>
  <default-layout>
    <div class="zone-city-suburbs-page">
      <nav class="flex flex-wrap items-center gap-3 mb-4 text-sm" aria-label="Breadcrumb">
        <router-link to="/" class="text-gray-500 hover:text-primary-600" :aria-label="t('breadcrumb.shared.home')">
          <span v-html="homeIcon"></span>
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-gray-600">{{ t("breadcrumb.settings.root") }}</span>
        <span class="text-lg text-gray-300">/</span>
        <router-link to="/settings/central-paths/list" class="text-gray-600 hover:text-primary-600">
          {{ t("breadcrumb.settings.centralPaths.list") }}
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-gray-600">{{ breadcrumbZoneLabel }}</span>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
          {{ t("breadcrumb.settings.centralPaths.zoneSuburbs") }}
        </span>
      </nav>

      <PageHeader :icon="icon" title-key="pages.centralPaths.zoneSuburbs.title" class="p-6 -mx-6 my-6 border-y !border-gray-200"
        description-key="pages.centralPaths.zoneSuburbs.description" />

      <div class="bg-white rounded-lg !bg-gray-50 p-4 mb-6 shadow-sm">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submitUpdate" class="lg:max-w-[50%]">
          <div class="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
            <div class="flex-1 min-w-[240px]">
              <SelectInput
                v-model="selectedCitySuburbIds"
                :items="[]"
                multiple
                :label="t('pages.centralPaths.zoneSuburbs.form.suburbsLabel')"
                :placeholder="t('pages.centralPaths.zoneSuburbs.form.suburbsPlaceholder')"
                density="comfortable"
                variant="outlined"
                :hide-details="false"
                :rules="[required()]"
                :error-messages="formErrors.city_suburb_ids"
                :server-side="true"
                :fetch-function="fetchCitySuburbsList"
                :preset-items="suburbPresetItems"
                item-title-key="name"
                item-value-key="id"
                :debounce-time="500"
                @update:model-value="delete formErrors.city_suburb_ids"
              />
            </div>

            <div class="flex gap-2 lg:ms-auto">
              <ButtonWithIcon
                variant="flat"
                color="primary"
                height="44"
                rounded="4"
                custom-class="px-6"
                :prepend-icon="plusIcon"
                :label="t('pages.centralPaths.zoneSuburbs.form.save')"
                :loading="saving"
                :disabled="saving"
                type="submit"
              />
            </div>
          </div>
        </v-form>
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div
          class="flex flex-wrap items-center gap-3 justify-between bg-primary-50 px-4 sm:px-6 py-3 bg-white"
        >
        <h2 class="font-bold text-lg text-primary-900 flex items-center gap-2 m-0 ">
            <span v-html="mapIcon"></span>
            {{ t("pages.citySuburbs.tableTitle") }}
          </h2>
          <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <ButtonWithIcon
                v-bind="props"
                variant="outlined"
                rounded="4"
                color="gray-500"
                height="40"
                custom-class="font-semibold text-base border-gray-400"
                :prepend-icon="columnIcon"
                :label="t('common.table.columns')"
                append-icon="mdi-chevron-down"
              />
            </template>
            <v-list class="py-2">
              <v-list-item v-for="header in allHeaders" :key="header.key" @click="handleToggleHeader(header.key)">
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="headerCheckStates[header.key]"
                    :disabled="updatingHeaders"
                    @click.stop="handleToggleHeader(header.key)"
                  />
                </template>
                <v-list-item-title>{{ header.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <DataTable
          :headers="tableHeaders"
          :items="tableItems"
          :loading="loading"
          show-actions
          :show-view="false"
          :show-edit="false"
          :show-delete="true"
          :force-show-delete="true"
          @delete="handleDelete"
        >
          <template v-slot:[zoneStatusSlotName]="{ item }">
            <v-switch
              :model-value="item.is_active"
              hide-details
              inset
              density="compact"
              color="primary"
              class="small-switch"
              @update:model-value="() => handleStatusChange(item)"
              v-if="item.actions?.can_change_status !== false"
            />
            <span v-else class="text-sm text-gray-600">--</span>
          </template>
        </DataTable>

        <div ref="loadMoreTrigger" class="flex justify-center py-8">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
        </div>
      </div>
    </div>

    <StatusChangeDialog
      v-model="showStatusChangeDialog"
      :loading="statusChangeLoading"
      :item-name="statusChangeItemName"
      :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange"
    />
  </default-layout>
</template>

<style scoped>
.small-switch :deep(.v-switch__track) {
  opacity: 1;
}
</style>
