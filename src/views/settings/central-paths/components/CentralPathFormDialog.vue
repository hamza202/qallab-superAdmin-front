<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from "vue";
import { CheckCircleIcon } from '@/components/icons/globalIcons.ts'
import zoneService from '@/services/api/zone.service'
import { useLazyCountryCityLists } from '@/composables/useLazyCountryCityLists'

const formErrors = reactive<Record<string, string>>({});

interface PathForm {
    id?: number;
    geographical_zone_id: number | null;
    city_id: number | null;
    is_active: boolean;
}

const props = defineProps<{
    modelValue: boolean;
    pathId?: number | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    "saved": [];
}>();

const internalOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
});

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);

const form = reactive<PathForm>({
    geographical_zone_id: null,
    city_id: null,
    is_active: true,
});

// Dropdown data
const geographicalZones = ref<Array<{ title: string; value: number }>>([]);
const loadingZones = ref(false);
const pathDataReady = ref(false);

const { buildCitiesFetcher } = useLazyCountryCityLists();

const fetchCitiesLazy = buildCitiesFetcher({
    getCountryId: () => undefined,
    getSelectedCityId: () => form.city_id ?? undefined,
    requireCountry: false,
    waitForReady: async () => {
        if (!props.pathId) return;
        await new Promise<void>((resolve) => {
            if (pathDataReady.value) {
                resolve();
                return;
            }
            const stop = watch(pathDataReady, (ok) => {
                if (ok) {
                    stop();
                    resolve();
                }
            });
        });
    },
});

const fetchGeographicalZones = async () => {
    try {
        loadingZones.value = true;
        const response = await zoneService.getGeographicalZones();
        geographicalZones.value = response.data.map((item) => ({
            title: item.name,
            value: item.id,
        }));
    } catch (err: any) {
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحميل المناطق الجغرافية');
    } finally {
        loadingZones.value = false;
    }
};

const fetchPathData = async (pathId: number) => {
    try {
        const response = await zoneService.getById(pathId);
        const data = response.data;
        form.id = data.id;
        form.geographical_zone_id = data.geographical_zone_id;
        form.city_id = data.city_id;
        form.is_active = data.is_active;
    } catch (err: any) {
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
        pathDataReady.value = true;
    }
};

const resetForm = () => {
    delete form.id;
    form.geographical_zone_id = null;
    form.city_id = null;
    form.is_active = true;
};

const closeDialog = () => {
    internalOpen.value = false;
    resetForm();
    Object.keys(formErrors).forEach(key => delete formErrors[key]);
};

const handleSave = async () => {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (formRef.value && typeof formRef.value.validate === "function") {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    try {
        saving.value = true;

        if (form.id) {
            const formData = new FormData();
            formData.append('geographical_zone_id', String(form.geographical_zone_id));
            formData.append('city_id', String(form.city_id));
            formData.append('is_active', form.is_active ? 'true' : 'false');
            await zoneService.update(form.id, formData);
            toast.success('تم تحديث المسار المركزي بنجاح');
        } else {
            await zoneService.create({
                geographical_zone_id: form.geographical_zone_id!,
                city_id: form.city_id!,
                is_active: form.is_active,
            });
            toast.success('تم إضافة المسار المركزي بنجاح');
        }

        emit('saved');
        closeDialog();
        resetForm();
    } catch (err: any) {
        if (err?.response?.data?.errors) {
            const errors = err.response.data.errors;
            Object.keys(errors).forEach(key => {
                formErrors[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
            });
        } else {
            toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حفظ المسار المركزي');
        }
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    fetchGeographicalZones();
});

watch(
    () => props.modelValue,
    (open) => {
        if (!open) {
            pathDataReady.value = false;
            return;
        }

        pathDataReady.value = false;
        if (props.pathId) {
            fetchPathData(props.pathId);
        } else {
            resetForm();
            pathDataReady.value = true;
        }
    }
);
</script>

<template>
    <AppDialog v-model="internalOpen" title="المسارات المركزية" :max-width="600">
        <template #title>
            <div class="text-base font-bold text-gray-900 flex items-center gap-2">
                <span class="!bg-gray-50 border !border-gray-100 rounded px-1.5 py-1 text-gray-600">
                    <span v-html="CheckCircleIcon"></span>
                </span>
                {{ pathId ? 'تعديل المسار المركزي' : 'إضافة مسار مركزي جديد' }}
            </div>
        </template>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <div class="space-y-4">
                <SelectWithIconInput
                    v-model="form.geographical_zone_id"
                    label="الموقع المركزي"
                    placeholder="اختر الموقع المركزي"
                    :items="geographicalZones"
                    :loading="loadingZones"
                    :rules="[required()]"
                    :hide-details="false"
                    :error-messages="formErrors['geographical_zone_id']"
                    @update:model-value="delete formErrors['geographical_zone_id']"
                />

                <SelectInput
                    :key="String(props.pathId ?? 'new')"
                    v-model="form.city_id"
                    label="المدينة"
                    placeholder="اختر المدينة"
                    :items="[]"
                    :server-side="true"
                    :fetch-function="fetchCitiesLazy"
                    item-title-key="name"
                    item-value-key="id"
                    :debounce-time="500"
                    :rules="[required()]"
                    :hide-details="false"
                    :error-messages="formErrors['city_id']"
                    @update:model-value="delete formErrors['city_id']"
                />

                <div>
                    <span class="text-sm font-semibold text-gray-700 block mb-1">الحالة</span>
                    <div class="flex items-center gap-3">
                        <v-radio-group v-model="form.is_active" inline hide-details>
                            <v-radio :value="true" color="primary">
                                <template #label>
                                    <span :class="form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                        فعال
                                    </span>
                                </template>
                            </v-radio>
                            <v-radio :value="false" color="primary">
                                <template #label>
                                    <span :class="!form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                        غير فعال
                                    </span>
                                </template>
                            </v-radio>
                        </v-radio-group>
                    </div>
                </div>
            </div>
        </v-form>

        <template #actions>
            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                custom-class="font-semibold text-base sm:flex-1" label="حفظ" prepend-icon="mdi-content-save" @click="handleSave"
                :loading="saving" :disabled="saving" />

            <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
                custom-class="font-semibold text-base text-primary-700 sm:flex-1" label="إلغاء" prepend-icon="mdi-close"
                @click="closeDialog" />
        </template>
    </AppDialog>
</template>
