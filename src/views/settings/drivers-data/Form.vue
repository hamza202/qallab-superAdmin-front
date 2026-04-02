<script setup lang="ts">
import { SettingsIcon } from '@/components/icons/globalIcons';
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
`
interface DriverForm {
    id?: number;
    license_number: string;
    logistics_company_id: number | null;
    name: string;
    national_id: string;
    country_id: number | null;
    license_type: string[];
    license_expires_at: string;
    hazardous_material_qualified: boolean;
    is_active: boolean;
    medical_exam_date: string;
    rating: number | null;
}

interface LicenseType {
    title: string;
    value: string;
}

interface ConstantsResponse {
    status: number;
    code: number;
    locale: string;
    message: string;
    data: {
        license_types: LicenseType[];
    };
}

const formData = ref<DriverForm>({
    license_number: '',
    logistics_company_id: null,
    name: '',
    national_id: '',
    country_id: 1,
    license_type: [],
    license_expires_at: '',
    hazardous_material_qualified: false,
    is_active: true,
    medical_exam_date: '',
    rating: null,
});

const isFormDataLoaded = ref(false);

const formErrors = reactive<Record<string, string>>({});

const licenseTypes = ref<LicenseType[]>([]);
const countries = ref<any[]>([]);
const ratings = [
    { title: '1', value: 1 },
    { title: '2', value: 2 },
    { title: '3', value: 3 },
    { title: '4', value: 4 },
    { title: '5', value: 5 },
];

const isEditMode = computed(() => !!route.params.id);

const fetchConstants = async () => {
    try {
        const response = await api.get<ConstantsResponse>('/drivers/constants');
        licenseTypes.value = response.data.license_types?.map((i: any) => ({ title: i.label, value: i.key })) || [];

    } catch (err: any) {
        console.error('Error fetching constants:', err);
        toast.error(err?.response?.data?.message || t('common.messages.general.loadDataFailed'));
    }
};

const fetchDriverData = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;
        const response = await api.get(`/drivers/${route.params.id}`);
        formData.value = {
            ...response.data,
            license_type: response.data.license_type || [],
        };
        isFormDataLoaded.value = true;
    } catch (err: any) {
        console.error('Error fetching driver data:', err);
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

    const res = await api.get<any>('/suppliers/list', { params });

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
            license_number: Number(formData.value.license_number),
            logistics_company_id: formData.value.logistics_company_id,
            name: formData.value.name,
            national_id: Number(formData.value.national_id),
            country_id: formData.value.country_id,
            license_type: formData.value.license_type,
            license_expires_at: formData.value.license_expires_at,
            hazardous_material_qualified: formData.value.hazardous_material_qualified,
            is_active: formData.value.is_active,
            medical_exam_date: formData.value.medical_exam_date,
            rating: formData.value.rating,
        };

        if (isEditMode.value) {
            await api.put(`/drivers/${route.params.id}`, payload);
            toast.success(t('common.messages.general.updateSuccess'));
        } else {
            await api.post('/drivers', payload);
            toast.success(t('common.messages.general.createSuccess'));
        }

        router.push('/settings/drivers-data/list');
    } catch (err: any) {
        console.error('Error saving driver:', err);
        if (err?.response?.data?.errors) {
            Object.assign(formErrors, err.response.data.errors);
        }
        toast.error(err?.response?.data?.message || t('common.messages.general.saveError'));
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/drivers-data/list');
};

onMounted(async () => {
    await fetchConstants();
    if (isEditMode.value) {
        await fetchDriverData();
    } else {
        isFormDataLoaded.value = true;
    }
});
</script>

<template>
    <default-layout>
        <div class="drivers-data-form-page">
            <PageHeader :icon="icon" :title-key="isEditMode ? 'تعديل بيانات السائق' : 'إضافة بيانات السائق'"
                description-key="تمكنك من إدارة وإضافة بيانات السائقين" />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-10">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else>
                        <h3 class="text-lg font-bold text-primary-900 mb-6">بيانات السائق</h3>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <TextInput v-model="formData.license_number" label="رقم رخصة السائق"
                                placeholder="أدخل رقم الرخصة" :rules="[required()]"
                                :error-messages="formErrors['license_number']"
                                @input="delete formErrors['license_number']" density="comfortable" />

                            <SelectInput v-model="formData.logistics_company_id" label="شركة النقل" :items="[]"
                                item-title="title" :rules="[required()]" item-value="value" density="comfortable"
                                placeholder="اختر شركة النقل" :server-side="true" :fetch-function="fetchSuppliers"
                                item-title-key="full_name" item-value-key="id" :debounce-time="500"
                                :error-messages="formErrors['logistics_company_id']"
                                @update:model-value="delete formErrors['logistics_company_id']" />

                            <TextInput v-model="formData.name" label="الاسم" placeholder="أدخل الاسم"
                                :rules="[required()]" :error-messages="formErrors['name']"
                                @input="delete formErrors['name']" density="comfortable" />

                            <TextInput v-model="formData.national_id" label="رقم الهوية / الإقامة"
                                placeholder="أدخل رقم الهوية" :rules="[required()]"
                                :error-messages="formErrors['national_id']" @input="delete formErrors['national_id']"
                                density="comfortable" />

                            <MultipleSelectInput v-model="formData.license_type" label="نوع الرخصة"
                                placeholder="اختر نوع الرخصة" :items="licenseTypes" item-title="label" item-value="key"
                                multiple chips closable-chips :rules="[required()]"
                                :error-messages="formErrors['license_type']"
                                @update:model-value="delete formErrors['license_type']" density="comfortable" />

                            <DatePickerInput v-model="formData.license_expires_at" label="تاريخ انتهاء الرخصة"
                                placeholder="اختر تاريخ الانتهاء" :rules="[required()]"
                                :error-messages="formErrors['license_expires_at']"
                                @update:model-value="delete formErrors['license_expires_at']" density="comfortable" />

                            <SelectWithIconInput v-model="formData.rating" label="تقييم السائق"
                                placeholder="اختر التقييم" :items="ratings" :rules="[required()]"
                                :error-messages="formErrors['rating']" @update:model-value="delete formErrors['rating']"
                                density="comfortable" />

                            <DatePickerInput v-model="formData.medical_exam_date" label="تاريخ الفحص الطبي"
                                placeholder="اختر تاريخ الفحص" :rules="[required()]"
                                :error-messages="formErrors['medical_exam_date']"
                                @update:model-value="delete formErrors['medical_exam_date']" density="comfortable" />

                            <div>
                                <span class="text-sm font-semibold text-gray-700 block mb-2">مؤهل لنقل مواد خطرة</span>
                                <div class="flex items-center gap-3">
                                    <v-radio-group v-model="formData.hazardous_material_qualified" inline hide-details>
                                        <v-radio :value="true" color="primary">
                                            <template #label>
                                                <span
                                                    :class="formData.hazardous_material_qualified ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    نعم
                                                </span>
                                            </template>
                                        </v-radio>
                                        <v-radio :value="false" color="primary">
                                            <template #label>
                                                <span
                                                    :class="!formData.hazardous_material_qualified ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    لا
                                                </span>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </div>
                            </div>

                            <div>
                                <span class="text-sm font-semibold text-gray-700 block mb-2">حالة السائق</span>
                                <div class="flex items-center gap-3">
                                    <v-radio-group v-model="formData.is_active" inline hide-details>
                                        <v-radio :value="true" color="primary">
                                            <template #label>
                                                <span
                                                    :class="formData.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    فعال
                                                </span>
                                            </template>
                                        </v-radio>
                                        <v-radio :value="false" color="primary">
                                            <template #label>
                                                <span
                                                    :class="!formData.is_active ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    غير فعال
                                                </span>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 justify-center pt-4">
                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-8" label="حفظ" prepend-icon="mdi-content-save"
                                @click="handleSave" :loading="saving" :disabled="saving" />

                            <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
                                custom-class="font-semibold text-base text-primary-700 px-8" label="إلغاء"
                                prepend-icon="mdi-close" @click="handleCancel" />
                        </div>
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
