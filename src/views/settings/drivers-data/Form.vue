<script setup lang="ts">
import { SettingsIcon } from '@/components/icons/globalIcons';
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
`
interface DriverForm {
    id?: number;
    tripNumber: string;
    driverName: string;
    identityNumber: string;
    tripType: string | null;
    tripEndDate: string;
    hasDangerousMaterials: boolean;
    inspectionRating: string;
    currentInspectionDate: string;
    driverStatus: string | null;
}

const form = reactive<DriverForm>({
    tripNumber: '',
    driverName: '',
    identityNumber: '',
    tripType: null,
    tripEndDate: '',
    hasDangerousMaterials: false,
    inspectionRating: '',
    currentInspectionDate: '',
    driverStatus: null,
});

const formErrors = reactive<Record<string, string>>({});

// Demo data for dropdowns
const tripTypes = [
    { title: "Forklift", value: "forklift" },
    { title: "Truck", value: "truck" },
    { title: "Van", value: "van" },
    { title: "Heavy Equipment", value: "heavy" },
];

const driverStatuses = [
    { title: "نشط", value: "active" },
    { title: "غير نشط", value: "inactive" },
    { title: "معلق", value: "suspended" },
];

// Demo data for existing records
const demoDrivers = [
    {
        id: 1,
        tripNumber: "DRIV-2024-001",
        driverName: "أحمد محمد",
        identityNumber: "1234567890",
        tripType: "forklift",
        tripEndDate: "2024-12-31",
        hasDangerousMaterials: true,
        inspectionRating: "4.5",
        currentInspectionDate: "2024-03-15",
        driverStatus: "active"
    },
];

const isEditing = computed(() => !!route.params.id);

const fetchDriverData = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const driver = demoDrivers.find(d => d.id === Number(route.params.id));
        if (driver) {
            Object.assign(form, driver);
        }
    } catch (err: any) {
        console.error('Error fetching driver data:', err);
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

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        if (isEditing.value) {
            toast.success('تم تحديث بيانات السائق بنجاح');
        } else {
            toast.success('تم إضافة بيانات السائق بنجاح');
        }

        router.push('/settings/drivers-data/list');
    } catch (err: any) {
        console.error('Error saving driver:', err);
        toast.error('حدث خطأ أثناء حفظ بيانات السائق');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/drivers-data/list');
};

onMounted(() => {
    if (isEditing.value) {
        fetchDriverData();
    }
});
</script>

<template>
    <default-layout>
        <div class="drivers-data-form-page">
            <PageHeader 
                :icon="icon" 
                :title-key="isEditing ? 'تعديل بيانات السائق' : 'إضافة بيانات السائق'"
                description-key="تمكنك من إدارة وإضافة بيانات السائقين" 
            />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-10">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else>
                        <h3 class="text-lg font-bold text-primary-900 mb-6">بيانات السائق</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <TextInput 
                                v-model="form.tripNumber" 
                                label="رقم رخصة السائق"
                                placeholder="أدخل رقم الرخصة مثل: DRIV-2024-001"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['tripNumber']"
                                @input="delete formErrors['tripNumber']"
                            />

                            <TextInput 
                                v-model="form.driverName" 
                                label="الاسم"
                                placeholder="أدخل الاسم مثل: محمد أحمد"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['driverName']"
                                @input="delete formErrors['driverName']"
                            />

                            <TextInput 
                                v-model="form.identityNumber" 
                                label="رقم الهوية / الإقامة"
                                placeholder="أدخل رقم الهوية مثل: 1234567890"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['identityNumber']"
                                @input="delete formErrors['identityNumber']"
                            />

                            <SelectWithIconInput 
                                v-model="form.tripType" 
                                label="نوع الرخصة"
                                placeholder="اختر نوع الرخصة مثل: نشط"
                                :items="tripTypes"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['tripType']"
                                @update:model-value="delete formErrors['tripType']"
                            />

                            <DatePickerInput 
                                v-model="form.tripEndDate" 
                                label="تاريخ انتهاء الرخصة"
                                placeholder="اختر تاريخ الانتهاء مثل: 31-12-2024"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['tripEndDate']"
                                @update:model-value="delete formErrors['tripEndDate']"
                            />

                            <div>
                                <span class="text-sm font-semibold text-gray-700 block mb-2">مؤهل لنقل مواد خطرة</span>
                                <div class="flex items-center gap-3">
                                    <v-radio-group v-model="form.hasDangerousMaterials" inline hide-details>
                                        <v-radio :value="true" color="primary">
                                            <template #label>
                                                <span :class="form.hasDangerousMaterials ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    نعم
                                                </span>
                                            </template>
                                        </v-radio>
                                        <v-radio :value="false" color="primary">
                                            <template #label>
                                                <span :class="!form.hasDangerousMaterials ? 'text-primary font-semibold' : 'text-gray-600'">
                                                    لا
                                                </span>
                                            </template>
                                        </v-radio>
                                    </v-radio-group>
                                </div>
                            </div>

                            <TextInput 
                                v-model="form.inspectionRating" 
                                label="تقييم السائق"
                                placeholder="أدخل التقييم مثل: ممتاز"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['inspectionRating']"
                                @input="delete formErrors['inspectionRating']"
                            />

                            <DatePickerInput 
                                v-model="form.currentInspectionDate" 
                                label="تاريخ الفحص الحالي"
                                placeholder="اختر تاريخ الفحص مثل: 15-03-2024"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['currentInspectionDate']"
                                @update:model-value="delete formErrors['currentInspectionDate']"
                            />

                            <SelectWithIconInput 
                                v-model="form.driverStatus" 
                                label="حالة السائق"
                                placeholder="اختر الحالة مثل: نشط"
                                :items="driverStatuses"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['driverStatus']"
                                @update:model-value="delete formErrors['driverStatus']"
                            />
                        </div>

                        <div class="flex gap-3 justify-center pt-4">
                            <ButtonWithIcon 
                                variant="flat" 
                                color="primary" 
                                height="44" 
                                rounded="4"
                                custom-class="font-semibold text-base px-8" 
                                label="حفظ" 
                                prepend-icon="mdi-content-save" 
                                @click="handleSave"
                                :loading="saving" 
                                :disabled="saving" 
                            />

                            <ButtonWithIcon 
                                variant="flat" 
                                color="primary-50" 
                                height="44" 
                                rounded="4"
                                custom-class="font-semibold text-base text-primary-700 px-8" 
                                label="إلغاء" 
                                prepend-icon="mdi-close"
                                @click="handleCancel" 
                            />
                        </div>
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
