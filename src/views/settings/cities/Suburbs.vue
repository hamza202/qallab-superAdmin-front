<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { toast } from "vue3-toastify";
import { useApi } from "@/composables/useApi";
import { useTableColumns, type TableHeader } from "@/composables/useTableColumns";
import { homeIcon, mapIcon, plusIcon, columnIcon } from "@/components/icons/globalIcons";
import { required, minLength, maxLength } from "@/utils/validators";
import LanguageTabs from "@/components/common/forms/LanguageTabs.vue";

const { t, locale } = useI18n();
const api = useApi();
const route = useRoute();
const router = useRouter();
const icon = `<svg width="49" height="44" viewBox="0 0 49 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.66667 12.6587C5.28398 12.6488 5.00609 12.6267 4.75625 12.577C2.90502 12.2088 1.4579 10.7616 1.08967 8.91042C1 8.45963 1 7.91753 1 6.83333C1 5.74914 1 5.20704 1.08967 4.75625C1.4579 2.90502 2.90502 1.4579 4.75625 1.08967C5.20704 1 5.74914 1 6.83333 1H41.8333C42.9175 1 43.4596 1 43.9104 1.08967C45.7616 1.4579 47.2088 2.90502 47.577 4.75625C47.6667 5.20704 47.6667 5.74914 47.6667 6.83333C47.6667 7.91753 47.6667 8.45963 47.577 8.91042C47.2088 10.7616 45.7616 12.2088 43.9104 12.577C43.6606 12.6267 43.3827 12.6488 43 12.6587M19.6667 24.3333H29M5.66667 12.6667H43V31.8C43 35.7204 43 37.6805 42.237 39.1779C41.5659 40.4951 40.4951 41.5659 39.1779 42.237C37.6806 43 35.7204 43 31.8 43H16.8667C12.9463 43 10.9861 43 9.48873 42.237C8.1716 41.5659 7.10073 40.4951 6.42962 39.1779C5.66667 37.6805 5.66667 35.7204 5.66667 31.8V12.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const cityId = computed(() => String(route.params.cityId ?? ""));

const cityNameQuery = computed(() => {
  const q = route.query.city_name;
  const raw = Array.isArray(q) ? q[0] : q;
  return typeof raw === "string" ? raw.trim() : "";
});

/** From list navigation query; falls back to translated “City #id” for deep links. */
const breadcrumbCityLabel = computed(() => {
  if (cityNameQuery.value) return cityNameQuery.value;
  return t("pages.citySuburbs.breadcrumbCityId", { id: cityId.value });
});

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
  current_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  per_page: number;
}

interface SuburbActions {
  can_view?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
  can_change_status?: boolean;
}

interface SuburbRow {
  id: number;
  name_en: string;
  name_ar: string;
  suburb_no: string | number;
  city_name?: string;
  is_active: boolean;
  actions: SuburbActions;
}

interface SuburbsListResponse {
  status?: boolean;
  data: SuburbRow[];
  pagination?: Pagination;
  header_table?: string;
  headers?: TableHeader[];
  shownHeaders?: TableHeader[];
  actions?: { can_create?: boolean };
}

const availableLanguages = [
  { code: "en", name: "EN", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
];

const suburbsIcon = mapIcon;
/** Slot name for DataTable custom cell (avoid `#item.is_active` — parsed as invalid modifier). */
const suburbStatusSlotName = "item.is_active";

const tableItems = ref<SuburbRow[]>([]);
const canCreate = ref(true);

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
const editingId = ref<number | null>(null);
const formErrors = ref<Record<string, string>>({});

const form = ref({
  name_en: "",
  name_ar: "",
  suburb_no: "" as string,
  is_active: true,
});

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<SuburbRow | null>(null);

const showViewDialog = ref(false);
const viewSuburb = ref<SuburbRow | null>(null);

const defaultActions = (): SuburbActions => ({
  can_view: true,
  can_update: true,
  can_delete: true,
  can_change_status: true,
});

const normalizeRow = (raw: Record<string, unknown>): SuburbRow => {
  const translations = (raw.name_translations as { en?: string; ar?: string } | undefined) || {};
  const name_en =
    (raw.name_en as string) ||
    translations.en ||
    (typeof raw.name === "string" ? raw.name : "") ||
    "";
  const name_ar =
    (raw.name_ar as string) ||
    translations.ar ||
    (typeof raw.name === "string" ? raw.name : "") ||
    "";
  const actionsRaw = raw.actions as SuburbActions | undefined;
  const cityName =
    typeof raw.city_name === "string"
      ? raw.city_name
      : raw.city_name != null
        ? String(raw.city_name)
        : "";
  return {
    id: Number(raw.id),
    name_en,
    name_ar,
    suburb_no: (raw.suburb_no as string | number) ?? "",
    city_name: cityName,
    is_active: Boolean(raw.is_active),
    actions: {
      ...defaultActions(),
      ...actionsRaw,
    },
  };
};

const displayName = (row: SuburbRow) =>
  locale.value === "ar"
    ? row.name_ar || row.name_en || String(row.suburb_no || "")
    : row.name_en || row.name_ar || String(row.suburb_no || "");

const statusChangeItemName = computed(() =>
  itemToChangeStatus.value ? displayName(itemToChangeStatus.value) : ""
);

const tableRows = computed(() =>
  tableItems.value.map((row) => ({
    ...row,
    name: displayName(row),
  }))
);

const getStaticSuburbHeaders = (): TableHeader[] => [
  { key: "name", title: t("pages.citySuburbs.columns.name") },
  { key: "suburb_no", title: t("pages.citySuburbs.columns.suburbNo") },
  { key: "city_name", title: t("pages.citySuburbs.columns.cityName") },
  { key: "is_active", title: t("pages.citySuburbs.columns.status") },
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

const fetchSuburbs = async (append = false) => {
  if (!cityId.value) return;
  try {
    if (append) loadingMore.value = true;
    else loading.value = true;

    const params = new URLSearchParams();
    params.set("per_page", String(perPage.value));
    params.set("city_id", String(cityId.value));
    if (append && nextCursor.value) params.set("cursor", nextCursor.value);

    const qs = params.toString();
    const url = `/city-suburbs?${qs}`;
    const response = await api.get<SuburbsListResponse>(url);

    const normalized = (response.data || []).map((item) => normalizeRow(item as unknown as Record<string, unknown>));

    if (!append) {
      if (response.header_table) {
        tableName.value = response.header_table;
      }
      if (response.headers?.length && response.shownHeaders?.length) {
        initHeaders(response.headers, response.shownHeaders);
      } else {
        const fallback = getStaticSuburbHeaders();
        if (!tableName.value) {
          tableName.value = "city_suburbs";
        }
        initHeaders(fallback, fallback);
      }
    }

    if (response.actions?.can_create !== undefined) {
      canCreate.value = response.actions.can_create;
    }

    if (append) {
      tableItems.value = [...tableItems.value, ...normalized];
    } else {
      tableItems.value = normalized;
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
      const fallback = getStaticSuburbHeaders();
      if (!tableName.value) {
        tableName.value = "city_suburbs";
      }
      initHeaders(fallback, fallback);
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const loadMore = async () => {
  if (!hasMoreData.value || loadingMore.value) return;
  await fetchSuburbs(true);
};

const resetForm = async () => {
  editingId.value = null;
  form.value = {
    name_en: "",
    name_ar: "",
    suburb_no: "",
    is_active: true,
  };
  formErrors.value = {};
  await nextTick();
  formRef.value?.resetValidation?.();
};

const buildPayload = () => ({
  city_id: Number(cityId.value),
  name: {
    en: form.value.name_en.trim(),
    ar: form.value.name_ar.trim()
  },
  suburb_no: String(form.value.suburb_no).trim(),
  is_active: form.value.is_active,
});

const submitForm = async () => {
  formErrors.value = {};
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  if (!cityId.value) return;

  try {
    saving.value = true;
    const payload = buildPayload();

    if (editingId.value != null) {
      await api.post(`/city-suburbs/${editingId.value}`, {
        ...payload,
        _method: "PUT",
        is_active: form.value.is_active ? "1" : "0",
      });
      toast.success(t("common.messages.success.updated"));
    } else {
      await api.post(`/city-suburbs`, payload);
      toast.success(t("common.messages.success.created"));
    }

    await resetForm();
    await fetchSuburbs();
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

const handleEdit = async (item: SuburbRow & { name?: string }) => {
  editingId.value = item.id;
  form.value = {
    name_en: item.name_en,
    name_ar: item.name_ar,
    suburb_no: String(item.suburb_no ?? ""),
    is_active: Boolean(item.is_active),
  };
  formErrors.value = {};
  await nextTick();
  formRef.value?.resetValidation?.();
};

const handleDelete = async (item: SuburbRow) => {
  if (!cityId.value) return;
  try {
    await api.delete(`/city-suburbs/${item.id}`);
    toast.success(t("common.messages.general.deleteSuccess"));
    if (editingId.value === item.id) await resetForm();
    await fetchSuburbs();
  } catch (err: unknown) {
    toast.error(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      t("common.messages.general.deleteError")
    );
  }
};


const handleStatusChange = (item: SuburbRow) => {
  itemToChangeStatus.value = { ...item };
  showStatusChangeDialog.value = true;
};

const confirmStatusChange = async () => {
  if (!itemToChangeStatus.value || !cityId.value) return;
  try {
    statusChangeLoading.value = true;
    const newStatus = !itemToChangeStatus.value.is_active;
    await api.patch(`/city-suburbs/${itemToChangeStatus.value.id}/change-status`, {
      status: newStatus,
    });
    toast.success(
      t(`common.messages.general.${newStatus ? "activateSuccess" : "deactivateSuccess"}`)
    );
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

const handleView = (item: SuburbRow) => {
  viewSuburb.value = item;
  showViewDialog.value = true;
};

watch(
  () => cityId.value,
  async (id) => {
    if (!id) {
      router.push({ name: "CitiesList" });
      return;
    }
    await resetForm();
    tableName.value = "";
    await fetchSuburbs();
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
    <div class="city-suburbs-page">
      <nav class="flex flex-wrap items-center gap-3 mb-4 text-sm" aria-label="Breadcrumb">
        <router-link to="/" class="text-gray-500 hover:text-primary-600" :aria-label="t('breadcrumb.shared.home')">
          <span v-html="homeIcon"></span>
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-gray-600">{{ t("breadcrumb.settings.root") }}</span>
        <span class="text-lg text-gray-300">/</span>
        <router-link to="/settings/cities/list" class="text-gray-600 hover:text-primary-600">
          {{ t("breadcrumb.settings.cities.list") }}
        </router-link>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-gray-600">{{ breadcrumbCityLabel }}</span>
        <span class="text-lg text-gray-300">/</span>
        <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
          {{ t("breadcrumb.settings.cities.suburbs") }}
        </span>
      </nav>

      <PageHeader :icon="icon" title-key="pages.citySuburbs.title" class="p-6 -mx-6 my-6 border-y !border-gray-200"
        description-key="pages.citySuburbs.description" />

      <div class="bg-white rounded-lg !bg-gray-50 p-4 mb-6 shadow-sm">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submitForm">
          <div class="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4">
            <div class="flex-1 min-w-[200px]">
              <LanguageTabs :languages="availableLanguages" :label="t('common.form.name')">
                <template #en>
                  <TextInput v-model="form.name_en" :placeholder="t('pages.citySuburbs.form.nameEnPlaceholder')"
                    :rules="[required(), minLength(2), maxLength(200)]" :hide-details="false"
                    :error-messages="formErrors.name_en" @input="delete formErrors.name_en" />
                </template>
                <template #ar>
                  <TextInput v-model="form.name_ar" :placeholder="t('pages.citySuburbs.form.nameArPlaceholder')"
                    :rules="[required(), minLength(2), maxLength(200)]" :hide-details="false"
                    :error-messages="formErrors.name_ar" @input="delete formErrors.name_ar" />
                </template>
              </LanguageTabs>
            </div>

            <div class="w-full sm:w-44">
              <TextInput v-model="form.suburb_no" :label="t('pages.citySuburbs.form.suburbNo')"
                :placeholder="t('pages.citySuburbs.form.suburbNoPlaceholder')" type="text" variant="outlined"
                density="comfortable" hide-details="auto" :rules="[required()]" :error-messages="formErrors.suburb_no"
                @input="delete formErrors.suburb_no" />
            </div>

            <div class="min-w-[200px]">
              <span class="text-sm font-semibold text-gray-700 block mb-1">{{ t("form.fields.status.label") }}</span>
              <v-radio-group v-model="form.is_active" inline hide-details>
                <v-radio :value="true" color="primary">
                  <template #label>
                    <span :class="form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ t("common.status.active") }}
                    </span>
                  </template>
                </v-radio>
                <v-radio :value="false" color="primary">
                  <template #label>
                    <span :class="!form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                      {{ t("common.status.inactive") }}
                    </span>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>

            <div class="min-w-[200px] flex gap-2">
              <ButtonWithIcon v-if="editingId != null" variant="outlined" color="gray-500" height="44" rounded="4"
                custom-class="font-semibold text-base" prepend-icon="mdi-close"
                :label="t('pages.citySuburbs.form.cancelEdit')" @click="resetForm" />
              <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4" size="large" custom-class="px-8"
                :prepend-icon="plusIcon"
                :label="editingId != null ? t('common.actions.save') : t('pages.citySuburbs.form.addNew')"
                :loading="saving" :disabled="saving || !canCreate" @click="submitForm" />
            </div>

          </div>
        </v-form>
      </div>

      <div class="bg-gray-50 rounded-md -mx-6">
        <div class="flex flex-wrap items-center gap-3 justify-between bg-primary-50 px-4 sm:px-6 py-3 bg-white">
          <h2 class="font-bold text-lg text-primary-900 flex items-center gap-2 m-0 ">
            <span v-html="mapIcon"></span>
            {{ t("pages.citySuburbs.tableTitle") }}
          </h2>
          <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500" height="40"
                custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                :label="t('common.table.columns')" append-icon="mdi-chevron-down" />
            </template>
            <v-list class="py-2">
              <v-list-item v-for="header in allHeaders" :key="header.key" @click="handleToggleHeader(header.key)">
                <template #prepend>
                  <v-checkbox-btn :model-value="headerCheckStates[header.key]" :disabled="updatingHeaders"
                    @click.stop="handleToggleHeader(header.key)" />
                </template>
                <v-list-item-title>{{ header.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <DataTable :headers="tableHeaders" :items="tableRows" :loading="loading" show-actions :show-view="true"
          @edit="handleEdit" @delete="handleDelete" @view="handleView">
          <template v-slot:[suburbStatusSlotName]="{ item }">
            <v-switch :model-value="item.is_active" hide-details inset density="compact" color="primary"
              class="small-switch" @update:model-value="() => handleStatusChange(item)"
              v-if="item.actions?.can_change_status !== false" />
            <span v-else class="text-sm text-gray-600">--</span>
          </template>
        </DataTable>

        <div ref="loadMoreTrigger" class="flex justify-center py-8">
          <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
        </div>
      </div>
    </div>

    <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
      :item-name="statusChangeItemName" :current-status="itemToChangeStatus?.is_active"
      @confirm="confirmStatusChange" />

    <v-dialog v-model="showViewDialog" max-width="480">
      <v-card v-if="viewSuburb" class="pa-6">
        <v-card-title class="text-h6 font-bold pa-0 mb-4">{{ t("pages.citySuburbs.viewDialog.title") }}</v-card-title>
        <v-card-text class="pa-0 text-body-2 space-y-2">
          <div>
            <span class="text-gray-500">{{ t("pages.citySuburbs.form.nameEn") }}:</span>
            {{ viewSuburb.name_en || "—" }}
          </div>
          <div>
            <span class="text-gray-500">{{ t("pages.citySuburbs.form.nameAr") }}:</span>
            {{ viewSuburb.name_ar || "—" }}
          </div>
          <div>
            <span class="text-gray-500">{{ t("pages.citySuburbs.form.suburbNo") }}:</span>
            {{ viewSuburb.suburb_no }}
          </div>
          <div>
            <span class="text-gray-500">{{ t("pages.citySuburbs.columns.status") }}:</span>
            {{ viewSuburb.is_active ? t("common.status.active") : t("common.status.inactive") }}
          </div>
        </v-card-text>
        <v-card-actions class="pa-0 mt-4">
          <v-btn color="primary" variant="flat" block @click="showViewDialog = false">
            {{ t("common.actions.close") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </default-layout>
</template>

<style scoped>
.small-switch :deep(.v-switch__track) {
  opacity: 1;
}
</style>
