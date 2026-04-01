<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import { SaveDoubleIcon, fileIcon } from "@/components/icons/globalIcons";
import TopHeader from "@/components/price-offers/TopHeader.vue";
import Map from "@/components/common/Map.vue";
import { mapMarkerIcon } from "@/components/icons/priceOffersIcons";

const geoAreasIcon = `<svg width="70" height="50" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 4.33301C18.0876 4.33301 11.6667 10.7539 11.6667 18.6663C11.6667 25.7604 17.4354 35.1195 23.0716 41.9692C24.015 43.109 24.4867 43.6789 25.122 43.9063C25.6669 44.1026 26.3331 44.1026 26.878 43.9063C27.5133 43.6789 27.985 43.109 28.9284 41.9692C34.5646 35.1195 40.3333 25.7604 40.3333 18.6663C40.3333 10.7539 33.9124 4.33301 26 4.33301ZM26 24.333C29.2216 24.333 31.8333 21.7213 31.8333 18.4997C31.8333 15.278 29.2216 12.6663 26 12.6663C22.7784 12.6663 20.1667 15.278 20.1667 18.4997C20.1667 21.7213 22.7784 24.333 26 24.333Z" fill="#ffffff"/>
</svg>`;

const api = useApi();
const route = useRoute();
const router = useRouter();
const { success, apiError } = useNotification();

const formErrors = reactive<Record<string, string>>({});

const availableLanguages = ref([
    { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
    { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface GeographicalZoneForm {
    id?: number;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    type: string | null;
    parent_id: number | null;
    details_location: string;
    target_latitude: string | null;
    target_longitude: string | null;
    is_active: boolean;
}

const formRef = ref<any>(null);
const isFormValid = ref(false);
const pageLoading = ref(false);
const saving = ref(false);

const form = reactive<GeographicalZoneForm>({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    type: null,
    parent_id: null,
    details_location: "",
    target_latitude: null,
    target_longitude: null,
    is_active: true,
});

const zoneTypes = ref<Array<{ title: string; value: string }>>([]);
const parentZones = ref<Array<{ title: string; value: number }>>([]);

// Map dialog state
const showMapDialog = ref(false);
const mapLatitude = ref<string | null>(null);
const mapLongitude = ref<string | null>(null);
const mapAddress = ref('');

const isEditMode = computed(() => !!route.params.id);

const fetchConstants = async () => {
    try {
        const response = await api.get('/geographical-zones/constants');
        zoneTypes.value = response.data.geographical_zone_types.map((type: any) => ({
            title: type.label,
            value: type.key
        }));
    } catch (err: any) {
        console.error('Error fetching constants:', err);
    }
};

const fetchParentZones = async () => {
    try {
        const params = new URLSearchParams();
        if (isEditMode.value && route.params.id) {
            params.append('ignore_id', route.params.id as string);
        }
        const queryString = params.toString();
        const url = queryString ? `/geographical-zones/list?${queryString}` : '/geographical-zones/list';

        const response = await api.get(url);
        parentZones.value = response.data.map((zone: any) => ({
            title: zone.name,
            value: zone.id
        }));
    } catch (err: any) {
        console.error('Error fetching parent zones:', err);
    }
};

const fetchGeoAreaData = async (geoAreaId: string) => {
    try {
        const response = await api.get(`/geographical-zones/${geoAreaId}`);
        const geoArea = response.data;

        form.id = geoArea.id;
        form.nameAr = geoArea.name_translations?.ar || "";
        form.nameEn = geoArea.name_translations?.en || "";
        form.descriptionAr = geoArea.description_translations?.ar || "";
        form.descriptionEn = geoArea.description_translations?.en || "";
        form.type = geoArea.type || null;
        form.parent_id = geoArea.parent_id || null;
        form.details_location = geoArea.details_location || "";
        form.target_latitude = geoArea.target_latitude || null;
        form.target_longitude = geoArea.target_longitude || null;
        form.is_active = Boolean(geoArea.is_active);
    } catch (err: any) {
        console.error('Error fetching geographical zone details:', err);
        apiError(err, t('common.messages.general.loadDataFailed'));
        router.push('/settings/geo-areas/list');
    }
};

const resetForm = () => {
    delete form.id;
    form.nameAr = "";
    form.nameEn = "";
    form.descriptionAr = "";
    form.descriptionEn = "";
    form.type = null;
    form.parent_id = null;
    form.details_location = "";
    form.target_latitude = null;
    form.target_longitude = null;
    form.is_active = true;
};

const handleCancel = () => {
    router.push('/settings/geo-areas/list');
};

const openMapDialog = () => {
    mapLatitude.value = form.target_latitude;
    mapLongitude.value = form.target_longitude;
    mapAddress.value = form.details_location || '';
    showMapDialog.value = true;
};

const handleLocationSelected = (location: { latitude: string; longitude: string; address: string }) => {
    form.target_latitude = location.latitude;
    form.target_longitude = location.longitude;
    form.details_location = location.address;
    showMapDialog.value = false;
};

const handleSave = async () => {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (formRef.value && typeof formRef.value.validate === "function") {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    try {
        saving.value = true;

        const payload = {
            name: {
                en: form.nameEn,
                ar: form.nameAr,
            },
            description: {
                en: form.descriptionEn,
                ar: form.descriptionAr,
            },
            type: form.type,
            parent_id: form.parent_id,
            details_location: form.details_location,
            target_latitude: form.target_latitude,
            target_longitude: form.target_longitude,
            is_active: form.is_active,
        };

        if (form.id) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name[en]', form.nameEn);
            formData.append('name[ar]', form.nameAr);
            formData.append('description[en]', form.descriptionEn);
            formData.append('description[ar]', form.descriptionAr);
            formData.append('type', form.type || '');
            formData.append('parent_id', String(form.parent_id || ''));
            formData.append('details_location', form.details_location);
            formData.append('target_latitude', String(form.target_latitude || ''));
            formData.append('target_longitude', String(form.target_longitude || ''));
            formData.append('is_active', form.is_active ? '1' : '0');

            await api.post(`/geographical-zones/${form.id}`, formData);
            success(t('common.messages.general.editSuccess'));
        } else {
            await api.post('/geographical-zones', payload);
            success(t('common.messages.general.createSuccess'));
        }

        router.push('/settings/geo-areas/list');
    } catch (err: any) {
        console.error('Error saving geo area:', err);

        if (err?.response?.status === 422 && err?.response?.data?.errors) {
            const apiErrors = err.response.data.errors;
            Object.keys(apiErrors).forEach(key => {
                formErrors[key] = apiErrors[key][0];
            });
        }
        
        apiError(err, t('common.messages.general.saveError'));
    } finally {
        saving.value = false;
    }
};

onMounted(async () => {
    pageLoading.value = true
     await fetchConstants();
      await fetchParentZones();

    if (isEditMode.value && route.params.id) {
        await fetchGeoAreaData(route.params.id as string);
    }
    pageLoading.value = false
});
</script>

<template>
    <default-layout>
        <div class="geo-areas-form-page -mx-6">
            <!-- Page Header -->
            <TopHeader :icon="geoAreasIcon" title-key="pages.geoAreas.FormTitle"
                description-key="pages.geoAreas.FormDescription" :show-action="false" />

            <!-- Loading State -->
            <div v-if="pageLoading" class="flex justify-center items-center py-20">
                <v-progress-circular indeterminate color="primary" size="48" />
            </div>

            <div v-else class="p-6">
                <v-form ref="formRef" class="space-y-6" v-model="isFormValid" @submit.prevent="handleSave">
                    <div class="flex items-center gap-2 text-primary-600">
                        <span class="w-[17px] h-[20px]" v-html="fileIcon"></span>
                        <h2 class="text-base font-bold">{{ t('pages.geoAreas.form.basicData') }}</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-8">
                        <!-- Name with Language Tabs -->
                        <LanguageTabs :languages="availableLanguages" :label="t('form.fields.name.label')">
                            <template #en>
                                <TextInput v-model="form.nameEn" :placeholder="t('form.fields.nameEn.placeholder')" :rules="[required()]"
                                    :hide-details="true" :error-messages="formErrors['name.en']"
                                    @update:model-value="delete formErrors['name.en']" />
                            </template>
                            <template #ar>
                                <TextInput v-model="form.nameAr" :placeholder="t('form.fields.nameAr.placeholder')" :hide-details="true"
                                    :error-messages="formErrors['name.ar']" :rules="[required()]"
                                    @update:model-value="delete formErrors['name.ar']" />
                            </template>
                        </LanguageTabs>

                        <!-- Type -->
                        <SelectInput v-model="form.type" clearable :items="zoneTypes" :label="t('pages.geoAreas.form.zoneType')"
                            :placeholder="t('pages.geoAreas.form.selectZoneType')" :rules="[required()]" :error-messages="formErrors['type']"
                            @update:model-value="delete formErrors['type']" />

                        <!-- Parent Zone -->
                        <SelectInput v-model="form.parent_id" clearable :items="parentZones" :label="t('pages.geoAreas.form.parentZone')"
                            :placeholder="t('pages.geoAreas.form.selectParentZone')" :error-messages="formErrors['parent_id']"
                            @update:model-value="delete formErrors['parent_id']" />

                        <!-- Location Picker with Map -->
                        <div class="relative">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">{{ t('form.address.geoLocation.label') }}</label>
                            <div @click="openMapDialog()"
                                class="flex items-center justify-between px-4 py-2 min-h-[48px] border rounded-lg cursor-pointer transition-colors"
                                :class="formErrors['details_location'] ? '!border-error-500 bg-error-50' : '!border-blue-400 hover:bg-blue-100'">
                                <span class="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                    :class="formErrors['details_location'] ? 'text-error-700' : 'text-blue-900'">
                                    {{ form.details_location || t('form.address.selectLocationOnMap.placeholder') }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span v-html="mapMarkerIcon"></span>
                                </div>
                            </div>
                            <p v-if="formErrors['details_location']" class="text-error-600 text-xs mt-1">{{
                                formErrors['details_location'] }}
                            </p>
                        </div>

                        <!-- Target Latitude (Read-only, auto-filled from map) -->
                        <TextInput v-model.number="form.target_latitude" v-if="form.target_latitude" :label="t('form.address.latitude.label')"
                            :placeholder="t('pages.geoAreas.form.autoFilledFromMap')" type="number" step="any" readonly
                            :error-messages="formErrors['target_latitude']"
                            @update:model-value="delete formErrors['target_latitude']" />

                        <!-- Target Longitude (Read-only, auto-filled from map) -->
                        <TextInput v-model.number="form.target_longitude" v-if="form.target_latitude" :label="t('form.address.longitude.label')"
                            :placeholder="t('pages.geoAreas.form.autoFilledFromMap')" type="number" step="any" readonly
                            :error-messages="formErrors['target_longitude']"
                            @update:model-value="delete formErrors['target_longitude']" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-8">
                        <!-- Description with Language Tabs -->
                        <LanguageTabs :languages="availableLanguages" :label="t('form.fields.description.label')" class="md:col-span-2">
                            <template #en>
                                <TextareaInput v-model="form.descriptionEn" :placeholder="t('form.fields.descriptionEnglish.placeholder')"
                                    :rows="4" :hide-details="true" :error-messages="formErrors['description.en']"
                                    @update:model-value="delete formErrors['description.en']" />
                            </template>
                            <template #ar>
                                <TextareaInput v-model="form.descriptionAr" :placeholder="t('form.fields.descriptionArabic.placeholder')" :rows="4"
                                    :hide-details="true" :error-messages="formErrors['description.ar']"
                                    @update:model-value="delete formErrors['description.ar']" />
                            </template>
                        </LanguageTabs>

                        <!-- Status -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-3">{{ t('form.fields.status.label') }}</label>
                            <div class="flex items-center gap-3 mt-1">
                                <v-radio-group v-model="form.is_active" inline hide-details>
                                    <v-radio :value="true" color="primary">
                                        <template #label>
                                            <span
                                                :class="form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                                {{ t('common.status.active') }}
                                            </span>
                                        </template>
                                    </v-radio>
                                    <v-radio :value="false" color="primary">
                                        <template #label>
                                            <span
                                                :class="!form.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                                {{ t('common.status.inactive') }}
                                            </span>
                                        </template>
                                    </v-radio>
                                </v-radio-group>
                            </div>
                        </div>
                    </div>
                    <!-- Action Buttons -->
                    <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
                            :prepend-icon="SaveDoubleIcon" :label="isEditMode ? t('common.actions.edit') : t('common.actions.save')" :loading="saving"
                            :disabled="saving" @click="handleSave" />

                        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4"
                            height="48" custom-class="font-semibold text-base text-primary-700 px-6 min-w-56"
                            :label="t('common.actions.close')" :disabled="saving" @click="handleCancel" />
                    </div>
                </v-form>
            </div>
        </div>

        <!-- Map Dialog -->
        <Map v-model="showMapDialog" :latitude="mapLatitude" :longitude="mapLongitude" :address="mapAddress"
            @location-selected="handleLocationSelected" />

    </default-layout>
</template>
