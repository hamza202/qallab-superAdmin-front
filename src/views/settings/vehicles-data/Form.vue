<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useApi } from '@/composables/useApi';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const api = useApi();

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);
const loading = ref(false);

const icon = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M38.8333 17.1667V8.93333C38.8333 6.50644 38.8333 5.29299 38.361 4.36604C37.9456 3.55067 37.2827 2.88776 36.4673 2.47231C35.5403 2 34.3269 2 31.9 2H15.4333C13.0064 2 11.793 2 10.866 2.47231C10.0507 2.88776 9.38776 3.55067 8.9723 4.36604C8.5 5.29299 8.5 6.50644 8.5 8.93333V17.1667M8.5 15H2V12.8333M38.8333 15H45.3333V12.8333M10.6667 24.75H10.6883M36.6667 24.75H36.6883M12.4 17.1667H34.9333C38.5737 17.1667 40.3938 17.1667 41.7843 17.8751C43.0073 18.4983 44.0017 19.4927 44.6249 20.7157C45.3333 22.1062 45.3333 23.9263 45.3333 27.5667V34.5C45.3333 36.5191 45.3333 37.5286 45.0035 38.325C44.5637 39.3867 43.7201 40.2303 42.6583 40.6701C41.862 41 40.8524 41 38.8333 41H37.5333C36.7282 41 36.3256 41 35.9888 40.9466C34.1346 40.653 32.6804 39.1988 32.3867 37.3446C32.3333 37.0077 32.3333 36.6051 32.3333 35.8C32.3333 35.5987 32.3333 35.4981 32.32 35.4139C32.2466 34.9503 31.883 34.5868 31.4195 34.5133C31.3353 34.5 31.2346 34.5 31.0333 34.5H16.3C16.0987 34.5 15.9981 34.5 15.9139 34.5133C15.4503 34.5868 15.0868 34.9503 15.0133 35.4139C15 35.4981 15 35.5987 15 35.8C15 36.6051 15 37.0077 14.9466 37.3446C14.653 39.1988 13.1987 40.653 11.3445 40.9466C11.0077 41 10.6051 41 9.8 41H8.5C6.48092 41 5.47138 41 4.67504 40.6701C3.61325 40.2303 2.76966 39.3867 2.32986 38.325C2 37.5286 2 36.5191 2 34.5V27.5667C2 23.9263 2 22.1062 2.70846 20.7157C3.33163 19.4927 4.32601 18.4983 5.54906 17.8751C6.93949 17.1667 8.75966 17.1667 12.4 17.1667ZM11.75 24.75C11.75 25.3483 11.265 25.8333 10.6667 25.8333C10.0684 25.8333 9.58333 25.3483 9.58333 24.75C9.58333 24.1517 10.0684 23.6667 10.6667 23.6667C11.265 23.6667 11.75 24.1517 11.75 24.75ZM37.75 24.75C37.75 25.3483 37.265 25.8333 36.6667 25.8333C36.0684 25.8333 35.5833 25.3483 35.5833 24.75C35.5833 24.1517 36.0684 23.6667 36.6667 23.6667C37.265 23.6667 37.75 24.1517 37.75 24.75Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

interface VehicleForm {
    id?: number;
    vehicle_number: string;
    plate_number: string;
    vehicle_type: string | null;
    vehicle_category: string | null;
    cargo_type: string | null;
    manufacturer_id: number | null;
    manufacturing_year: string | null;
    cargo_capacity: number | null;
    fuel_type: string | null;
    gps_tracking: string | null;
    operational_readiness: string | null;
    vehicle_ownership: string | null;
    last_maintenance_date: string;
    insurance_status: string | null;
    driving_license_number: string;
    notes: string | null;
    is_active: boolean;
    chassis_number: string;
    logistics_company_id: number | null;
}

interface ConstantOption {
    title: string;
    value: string;
}

interface ConstantsResponse {
    status: number;
    code: number;
    locale: string;
    message: string;
    data: {
        vehicle_types: Array<{ key: string; label: string }>;
        vehicle_categories: Array<{ key: string; label: string }>;
        cargo_types: Array<{ key: string; label: string }>;
        fuel_types: Array<{ key: string; label: string }>;
        gps_tracking_options: Array<{ key: string; label: string }>;
        operational_readiness_options: Array<{ key: string; label: string }>;
        vehicle_ownership_options: Array<{ key: string; label: string }>;
        insurance_status_options: Array<{ key: string; label: string }>;
    };
}

const formData = ref<VehicleForm>({
    vehicle_number: '',
    plate_number: '',
    vehicle_type: null,
    vehicle_category: null,
    cargo_type: null,
    manufacturer_id: null,
    manufacturing_year: null,
    cargo_capacity: null,
    fuel_type: null,
    gps_tracking: null,
    operational_readiness: null,
    vehicle_ownership: null,
    last_maintenance_date: '',
    insurance_status: null,
    driving_license_number: '',
    notes: null,
    is_active: true,
    chassis_number: '',
    logistics_company_id: null,
});

const isFormDataLoaded = ref(false);

const formErrors = reactive<Record<string, string>>({});

const vehicleTypes = ref<ConstantOption[]>([]);
const vehicleCategories = ref<ConstantOption[]>([]);
const cargoTypes = ref<ConstantOption[]>([]);
const fuelTypes = ref<ConstantOption[]>([]);
const gpsTrackingOptions = ref<ConstantOption[]>([]);
const operationalReadinessOptions = ref<ConstantOption[]>([]);
const vehicleOwnershipOptions = ref<ConstantOption[]>([]);
const insuranceStatusOptions = ref<ConstantOption[]>([]);

const isEditMode = computed(() => !!route.params.id);

const fetchConstants = async () => {
    try {
        const response = await api.get<ConstantsResponse>('/vehicles/constants');
        vehicleTypes.value = response.data.vehicle_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        vehicleCategories.value = response.data.vehicle_categories?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        cargoTypes.value = response.data.cargo_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        fuelTypes.value = response.data.fuel_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        gpsTrackingOptions.value = response.data.gps_tracking_options?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        operationalReadinessOptions.value = response.data.operational_readiness_options?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        vehicleOwnershipOptions.value = response.data.vehicle_ownership_options?.map((i: any) => ({ title: i.label, value: i.key })) || [];
        insuranceStatusOptions.value = response.data.insurance_status_options?.map((i: any) => ({ title: i.label, value: i.key })) || [];
    } catch (err: any) {
        console.error('Error fetching constants:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.loadDataFailed'));
    }
};

const fetchVehicleData = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;
        const response = await api.get(`/vehicles/${route.params.id}`);
        formData.value = response.data;
        isFormDataLoaded.value = true;
    } catch (err: any) {
        console.error('Error fetching vehicle data:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.loadDataFailed'));
    } finally {
        loading.value = false;
    }
};

const waitForSupplierData = async () => {
    if (!isEditMode.value) return;

    if (isFormDataLoaded.value && formData.value.logistics_company_id) {
        return;
    }

    await new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (isFormDataLoaded.value && formData.value.logistics_company_id) {
                clearInterval(checkInterval);
                clearTimeout(timeoutId);
                resolve(true);
            }
        }, 10);

        const timeoutId = setTimeout(() => {
            clearInterval(checkInterval);
            resolve(true);
        }, 5000);
    });
};

const fetchSuppliers = async (search = '', cursor?: string, perPage = 15) => {
    if (isEditMode.value) {
        await waitForSupplierData();
    }

    const params: any = { per_page: perPage, service_type: 'logistic_company' };
    if (search) {
        params.name = search;
    }
    if (cursor) {
        params.cursor = cursor;
    }
    if (formData.value.logistics_company_id) {
        params.order_by_id = formData.value.logistics_company_id;
    }

    const res = await api.get<any>('/logistics-companies/list', { params });

    return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor || null,
    };
};

const fetchManufacturers = async (search = '', cursor?: string, perPage = 15) => {
    const params: any = { per_page: perPage };
    if (search) {
        params.name = search;
    }
    if (cursor) {
        params.cursor = cursor;
    }
    if (formData.value.manufacturer_id) {
        params.order_by_id = formData.value.manufacturer_id;
    }

    const res = await api.get<any>('/manufacturers/list', { params });

    return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor || null,
    };
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
            vehicle_number: formData.value.vehicle_number,
            plate_number: formData.value.plate_number,
            vehicle_type: formData.value.vehicle_type,
            vehicle_category: formData.value.vehicle_category,
            cargo_type: formData.value.cargo_type,
            manufacturer_id: formData.value.manufacturer_id,
            manufacturing_year: formData.value.manufacturing_year,
            cargo_capacity: formData.value.cargo_capacity,
            fuel_type: formData.value.fuel_type,
            gps_tracking: formData.value.gps_tracking,
            operational_readiness: formData.value.operational_readiness,
            vehicle_ownership: formData.value.vehicle_ownership,
            last_maintenance_date: formData.value.last_maintenance_date,
            insurance_status: formData.value.insurance_status,
            driving_license_number: formData.value.driving_license_number,
            notes: formData.value.notes,
            is_active: formData.value.is_active,
            chassis_number: formData.value.chassis_number,
            logistics_company_id: formData.value.logistics_company_id,
        };

        if (isEditMode.value) {
            await api.put(`/vehicles/${route.params.id}`, payload);
            toast.success(t('common.messages.general.updateSuccess'));
        } else {
            await api.post('/vehicles', payload);
            toast.success(t('common.messages.general.createSuccess'));
        }

        router.push('/settings/vehicles-data/list');
    } catch (err: any) {
        console.error('Error saving vehicle:', err);
        if (err?.response?.data?.errors) {
            Object.assign(formErrors, err.response.data.errors);
        }
        toast.error(err?.response?.data?.message || t('common.messages.general.saveError'));
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/vehicles-data/list');
};

onMounted(async () => {
    await fetchConstants();
    if (isEditMode.value) {
        await fetchVehicleData();
    } else {
        isFormDataLoaded.value = true;
    }
});
</script>

<template>
    <default-layout>
        <div class="vehicles-data-form-page">
            <PageHeader :icon="icon" :title-key="isEditMode ? 'pages.vehiclesData.form.editTitle' : 'pages.vehiclesData.form.addTitle'"
                description-key="pages.vehiclesData.description" />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-10">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else>
                        <h3 class="text-lg font-bold text-primary-900 mb-6">{{ t('pages.vehiclesData.form.sectionTitle') }}</h3>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <PriceInput v-model="formData.vehicle_number" :label="t('pages.vehiclesData.form.labels.vehicleNumber')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.vehicleNumber')" :rules="[required()]"
                                :error-messages="formErrors['vehicle_number']"
                                @input="delete formErrors['vehicle_number']" density="comfortable" />

                            <PriceInput v-model="formData.plate_number" :label="t('pages.vehiclesData.form.labels.plateNumber')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.plateNumber')" :rules="[required()]"
                                :error-messages="formErrors['plate_number']" @input="delete formErrors['plate_number']"
                                density="comfortable" />

                            <SelectWithIconInput v-model="formData.vehicle_type" :label="t('pages.vehiclesData.form.labels.vehicleType')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.vehicleType')" :items="vehicleTypes" :rules="[required()]"
                                :error-messages="formErrors['vehicle_type']" @update:model-value="delete formErrors['vehicle_type']"
                                density="comfortable" />

                            <SelectWithIconInput v-model="formData.vehicle_category" :label="t('pages.vehiclesData.form.labels.vehicleCategory')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.vehicleCategory')" :items="vehicleCategories" :rules="[required()]"
                                :error-messages="formErrors['vehicle_category']"
                                @update:model-value="delete formErrors['vehicle_category']" density="comfortable" />

                            <SelectWithIconInput v-model="formData.cargo_type" :label="t('pages.vehiclesData.form.labels.cargoType')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.cargoType')" :items="cargoTypes" :rules="[required()]"
                                :error-messages="formErrors['cargo_type']" @update:model-value="delete formErrors['cargo_type']"
                                density="comfortable" />

                            <SelectInput v-model="formData.manufacturer_id" :label="t('pages.vehiclesData.form.labels.manufacturer')" :items="[]"
                                item-title="title" :rules="[required()]" item-value="value" density="comfortable"
                                :placeholder="t('pages.vehiclesData.form.placeholders.manufacturer')" :server-side="true" :fetch-function="fetchManufacturers"
                                item-title-key="name" item-value-key="id" :debounce-time="500"
                                :error-messages="formErrors['manufacturer_id']"
                                @update:model-value="delete formErrors['manufacturer_id']" />

                            <SelectInput v-model="formData.logistics_company_id" :label="t('pages.vehiclesData.form.labels.logisticsCompany')" :items="[]"
                                item-title="title" :rules="[required()]" item-value="value" density="comfortable"
                                :placeholder="t('pages.vehiclesData.form.placeholders.logisticsCompany')" :server-side="true" :fetch-function="fetchSuppliers"
                                item-title-key="name" item-value-key="id" :debounce-time="500"
                                :error-messages="formErrors['logistics_company_id']"
                                @update:model-value="delete formErrors['logistics_company_id']" />

                            <DatePickerInput v-model="formData.manufacturing_year" :label="t('pages.vehiclesData.form.labels.manufacturingYear')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.manufacturingYear')" :rules="[required()]" :year-only="true"
                                :error-messages="formErrors['manufacturing_year']"
                                @update:model-value="delete formErrors['manufacturing_year']" density="comfortable" />

                            <TextInput v-model="formData.cargo_capacity" :label="t('pages.vehiclesData.form.labels.cargoCapacity')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.cargoCapacity')" type="number" :rules="[required()]"
                                :error-messages="formErrors['cargo_capacity']" @input="delete formErrors['cargo_capacity']"
                                density="comfortable" />

                            <SelectWithIconInput v-model="formData.fuel_type" :label="t('pages.vehiclesData.form.labels.fuelType')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.fuelType')" :items="fuelTypes" :rules="[required()]"
                                :error-messages="formErrors['fuel_type']" @update:model-value="delete formErrors['fuel_type']"
                                density="comfortable" />

                            <SelectWithIconInput v-model="formData.gps_tracking" :label="t('pages.vehiclesData.form.labels.gpsTracking')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.gpsTracking')" :items="gpsTrackingOptions" :rules="[required()]"
                                :error-messages="formErrors['gps_tracking']" @update:model-value="delete formErrors['gps_tracking']"
                                density="comfortable" />

                            <SelectWithIconInput v-model="formData.operational_readiness" :label="t('pages.vehiclesData.form.labels.operationalReadiness')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.operationalReadiness')" :items="operationalReadinessOptions" :rules="[required()]"
                                :error-messages="formErrors['operational_readiness']"
                                @update:model-value="delete formErrors['operational_readiness']" density="comfortable" />

                            <SelectWithIconInput v-model="formData.vehicle_ownership" :label="t('pages.vehiclesData.form.labels.vehicleOwnership')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.vehicleOwnership')" :items="vehicleOwnershipOptions" :rules="[required()]"
                                :error-messages="formErrors['vehicle_ownership']"
                                @update:model-value="delete formErrors['vehicle_ownership']" density="comfortable" />

                            <DatePickerInput v-model="formData.last_maintenance_date" :label="t('pages.vehiclesData.form.labels.lastMaintenanceDate')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.lastMaintenanceDate')" :rules="[required()]"
                                :error-messages="formErrors['last_maintenance_date']"
                                @update:model-value="delete formErrors['last_maintenance_date']" density="comfortable" />

                            <SelectWithIconInput v-model="formData.insurance_status" :label="t('pages.vehiclesData.form.labels.insuranceStatus')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.insuranceStatus')" :items="insuranceStatusOptions" :rules="[required()]"
                                :error-messages="formErrors['insurance_status']"
                                @update:model-value="delete formErrors['insurance_status']" density="comfortable" />

                            <PriceInput v-model="formData.driving_license_number" :label="t('pages.vehiclesData.form.labels.drivingLicenseNumber')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.drivingLicenseNumber')" :rules="[required()]"
                                :error-messages="formErrors['driving_license_number']"
                                @input="delete formErrors['driving_license_number']" density="comfortable" />

                            <PriceInput v-model="formData.chassis_number" :label="t('pages.vehiclesData.form.labels.chassisNumber')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.chassisNumber')" :rules="[required()]"
                                :error-messages="formErrors['chassis_number']" @input="delete formErrors['chassis_number']"
                                density="comfortable" />

                            <TextareaInput class="md:col-span-2" v-model="formData.notes" :label="t('pages.vehiclesData.form.labels.notes')"
                                :placeholder="t('pages.vehiclesData.form.placeholders.notes')" rows="4" />

                            <div>
                                <span class="text-sm font-semibold text-gray-700 block mb-2">{{ t('pages.vehiclesData.form.labels.status') }}</span>
                                <div class="flex items-center gap-3">
                                    <v-radio-group v-model="formData.is_active" inline hide-details>
                                        <v-radio :value="true" color="primary">
                                            <template #label>
                                                <span
                                                    :class="formData.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    {{ t('pages.vehiclesData.form.status.active') }}
                                                </span>
                                            </template>
                                        </v-radio>
                                        <v-radio :value="false" color="primary">
                                            <template #label>
                                                <span
                                                    :class="!formData.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    {{ t('pages.vehiclesData.form.status.inactive') }}
                                                </span>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 justify-center pt-4">
                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-8" :label="t('common.actions.save')" prepend-icon="mdi-content-save"
                                @click="handleSave" :loading="saving" :disabled="saving" />

                            <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
                                custom-class="font-semibold text-base text-primary-700 px-8" :label="t('common.actions.cancel')"
                                prepend-icon="mdi-close" @click="handleCancel" />
                        </div>
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
