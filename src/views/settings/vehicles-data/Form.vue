<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

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
    vehicleNumber: string;
    plateNumber: string;
    vehicleType: string | null;
    vehicleCategory: string | null;
    manufacturer: string | null;
    loadType: string | null;
    loadCapacity: string;
    manufacturingYear: string;
    gpsTracking: string | null;
    operationalReadiness: string | null;
    vehicleOwnership: string | null;
    fuelType: string | null;
    drivingLicense: string | null;
    insuranceStatus: string | null;
    maintenanceDate: string;
    status: boolean;
    notes: string;
}

const form = reactive<VehicleForm>({
    vehicleNumber: '',
    plateNumber: '',
    vehicleType: null,
    vehicleCategory: null,
    manufacturer: null,
    loadType: null,
    loadCapacity: '',
    manufacturingYear: '',
    gpsTracking: null,
    operationalReadiness: null,
    vehicleOwnership: null,
    fuelType: null,
    drivingLicense: null,
    insuranceStatus: null,
    maintenanceDate: '',
    status: true,
    notes: '',
});

const formErrors = reactive<Record<string, string>>({});

// Demo data for dropdowns
const vehicleTypes = [
    { title: "شاحنة", value: "truck" },
    { title: "فان", value: "van" },
    { title: "معدات ثقيلة", value: "heavy_equipment" },
];

const vehicleCategories = [
    { title: "شاحنات ثقيلة", value: "heavy_trucks" },
    { title: "بضائع عامة", value: "general" },
    { title: "إنشاءات", value: "construction" },
];

const manufacturers = [
    { title: "فولفو", value: "volvo" },
    { title: "سكانيا", value: "scania" },
    { title: "مرسيدس", value: "mercedes" },
];

const loadTypes = [
    { title: "حمولة جافة", value: "bulk" },
    { title: "حمولة عامة", value: "general" },
    { title: "مواد خطرة", value: "hazardous" },
];

const fuelTypes = [
    { title: "ديزل", value: "diesel" },
    { title: "بنزين", value: "petrol" },
    { title: "كهرباء", value: "electric" },
];

const gpsTrackingOptions = [
    { title: "مثبت", value: "installed" },
    { title: "غير مثبت", value: "not_installed" },
];

const operationalReadinessOptions = [
    { title: "جاهزة", value: "ready" },
    { title: "غير جاهزة", value: "not_ready" },
];

const vehicleOwnershipOptions = [
    { title: "خاصة", value: "private" },
    { title: "مستأجرة", value: "rented" },
];

const drivingLicenseOptions = [
    { title: "DRIV-2024-001", value: "driv_2024_001" },
    { title: "DRIV-2024-002", value: "driv_2024_002" },
];

const insuranceStatusOptions = [
    { title: "ساري", value: "active" },
    { title: "منتهي", value: "expired" },
];

// Demo data for existing records
const demoVehicles = [
    {
        id: 1,
        vehicleNumber: "VEH-001",
        plateNumber: "SA-2154",
        vehicleType: "truck",
        vehicleCategory: "heavy_trucks",
        manufacturer: "volvo",
        loadType: "bulk",
        loadCapacity: "15",
        manufacturingYear: "2022",
        gpsTracking: "installed",
        operationalReadiness: "ready",
        vehicleOwnership: "private",
        fuelType: "diesel",
        drivingLicense: "driv_2024_001",
        insuranceStatus: "active",
        maintenanceDate: "2024-02-15",
        status: true,
        notes: "مركبة في حالة ممتازة"
    },
];

const isEditing = computed(() => !!route.params.id);

const fetchVehicleData = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;

        await new Promise(resolve => setTimeout(resolve, 300));

        const vehicle = demoVehicles.find(v => v.id === Number(route.params.id));
        if (vehicle) {
            Object.assign(form, vehicle);
        }
    } catch (err: any) {
        console.error('Error fetching vehicle data:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const handleSave = async () => {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (formRef.value && typeof formRef.value.validate === "function") {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    try {
        saving.value = true;

        await new Promise(resolve => setTimeout(resolve, 500));

        if (isEditing.value) {
            toast.success('تم تحديث بيانات المركبة بنجاح');
        } else {
            toast.success('تم إضافة بيانات المركبة بنجاح');
        }

        router.push('/settings/vehicles-data/list');
    } catch (err: any) {
        console.error('Error saving vehicle:', err);
        toast.error('حدث خطأ أثناء حفظ بيانات المركبة');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/vehicles-data/list');
};

onMounted(() => {
    if (isEditing.value) {
        fetchVehicleData();
    }
});
</script>

<template>
    <default-layout>
        <div class="vehicles-data-form-page">
            <PageHeader :icon="icon" :title-key="isEditing ? 'تعديل بيانات المركبة' : 'إضافة بيانات المركبة'"
                description-key="تمكنك من إدارة وإضافة بيانات المركبات" />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-10">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else>
                        <h3 class="text-lg font-bold text-primary-900 mb-6">بيانات المركبة</h3>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <TextInput v-model="form.vehicleNumber" label="رقم المركبة"
                                placeholder="ادخل رقم المركبة مثل: VEH-001" :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['vehicleNumber']"
                                @input="delete formErrors['vehicleNumber']" />

                            <TextInput v-model="form.plateNumber" label="رقم اللوحة"
                                placeholder="ادخل رقم اللوحة مثل: أ ب ح 2 1234" :rules="[required()]"
                                :hide-details="false" :error-messages="formErrors['plateNumber']"
                                @input="delete formErrors['plateNumber']" />

                            <SelectWithIconInput v-model="form.vehicleType" label="نوع المركبة"
                                placeholder="اختر نوع المركبة مثل: شاحنة" :items="vehicleTypes" :rules="[required()]"
                                :hide-details="false" :error-messages="formErrors['vehicleType']"
                                @update:model-value="delete formErrors['vehicleType']" />

                            <SelectWithIconInput v-model="form.vehicleCategory" label="فئة المركبة"
                                placeholder="اختر فئة المركبة مثل: بضائع" :items="vehicleCategories"
                                :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['vehicleCategory']"
                                @update:model-value="delete formErrors['vehicleCategory']" />

                            <SelectWithIconInput v-model="form.manufacturer" label="الشركة المصنعة"
                                placeholder="ادخل اسم الشركة المصنعة مثل: فيات" :items="manufacturers"
                                :rules="[required()]" :hide-details="false" :error-messages="formErrors['manufacturer']"
                                @update:model-value="delete formErrors['manufacturer']" />

                            <SelectWithIconInput v-model="form.loadType" label="نوع الحمولة"
                                placeholder="اختر نوع الحمولة مثل: حمولة جافة" :items="loadTypes" :rules="[required()]"
                                :hide-details="false" :error-messages="formErrors['loadType']"
                                @update:model-value="delete formErrors['loadType']" />

                            <TextInput v-model="form.loadCapacity" label="سعة الحمولة (طن)"
                                placeholder="ادخل سعة الحمولة مثل: 10" :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['loadCapacity']"
                                @input="delete formErrors['loadCapacity']" />

                            <TextInput v-model="form.manufacturingYear" label="سنة الصنع"
                                placeholder="اختر سنة الصنع مثل: 2022" :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['manufacturingYear']"
                                @input="delete formErrors['manufacturingYear']" />

                            <SelectWithIconInput v-model="form.gpsTracking" label="نظام تتبع GPS"
                                placeholder="اختر نظام التتبع مثل: مثبت" :items="gpsTrackingOptions"
                                :rules="[required()]" :hide-details="false" :error-messages="formErrors['gpsTracking']"
                                @update:model-value="delete formErrors['gpsTracking']" />

                            <SelectWithIconInput v-model="form.operationalReadiness" label="جاهزية التشغيل"
                                placeholder="اختر الجاهزية مثل: جاهزة" :items="operationalReadinessOptions"
                                :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['operationalReadiness']"
                                @update:model-value="delete formErrors['operationalReadiness']" />

                            <SelectWithIconInput v-model="form.vehicleOwnership" label="ملكية المركبة"
                                placeholder="اختر الملكية مثل: خاصة" :items="vehicleOwnershipOptions"
                                :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['vehicleOwnership']"
                                @update:model-value="delete formErrors['vehicleOwnership']" />

                            <SelectWithIconInput v-model="form.fuelType" label="نوع الوقود"
                                placeholder="اختر نوع الوقود مثل: ديزل" :items="fuelTypes" :rules="[required()]"
                                :hide-details="false" :error-messages="formErrors['fuelType']"
                                @update:model-value="delete formErrors['fuelType']" />

                            <SelectWithIconInput v-model="form.drivingLicense" label="رخصة السير"
                                placeholder="ادخل رقم الرخصة مثل: DRIV-2024-001" :items="drivingLicenseOptions"
                                :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['drivingLicense']"
                                @update:model-value="delete formErrors['drivingLicense']" />

                            <SelectWithIconInput v-model="form.insuranceStatus" label="حالة التأمين"
                                placeholder="اختر حالة التأمين مثل: ساري" :items="insuranceStatusOptions"
                                :rules="[required()]" :hide-details="false"
                                :error-messages="formErrors['insuranceStatus']"
                                @update:model-value="delete formErrors['insuranceStatus']" />

                            <DatePickerInput v-model="form.maintenanceDate" label="تاريخ آخر صيانة"
                                placeholder="اختر تاريخ آخر صيانة مثل: 15-02-2024" :rules="[required()]"
                                :hide-details="false" :error-messages="formErrors['maintenanceDate']"
                                @update:model-value="delete formErrors['maintenanceDate']" />
                            <TextareaInput class="md:col-span-2" v-model="form.notes" label="ملاحظات"
                                placeholder="ادخل الملاحظات هنا" :hide-details="false" rows="4" />

                            <div>
                                <span class="text-sm font-semibold text-gray-700 block mb-2">الحالة</span>
                                <div class="flex items-center gap-3">
                                    <v-radio-group v-model="form.status" inline hide-details>
                                        <v-radio :value="true" color="primary">
                                            <template #label>
                                                <span
                                                    :class="form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    فعال
                                                </span>
                                            </template>
                                        </v-radio>
                                        <v-radio :value="false" color="primary">
                                            <template #label>
                                                <span
                                                    :class="!form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    غير فعال
                                                </span>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </div>
                            </div>
                        </div>

                        <div class="mb-6">
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
