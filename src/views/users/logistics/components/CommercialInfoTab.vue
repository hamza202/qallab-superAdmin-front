<script setup lang="ts">
import { reactive, watch } from 'vue';

interface Props {
    transportMinistryLicenseNumber: string;
    transportLicenseIssueDate: string;
    transportLicenseExpiryDate: string;
    activityClassification: string | null;
    hazardousTransport: boolean;
    civilDefensePermit: boolean;
    safetyClassification: string | null;
    fleetInsuranceCoverage: boolean;
    insuranceProvider: string;
    ownershipType: string | null;
    activityClassificationItems: Array<{ title: string; value: string }>;
    safetyClassificationItems: Array<{ title: string; value: string }>;
    ownershipTypeItems: Array<{ title: string; value: string }>;
    formErrors?: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:formData': [data: Partial<Props>];
    'clear:error': [field: string];
}>();

const clearError = (field: string) => {
    emit('clear:error', field);
};

const handleInputUpdate = (field: string) => {
    clearError(field);
    emitUpdate();
};

const formData = reactive({
    transportMinistryLicenseNumber: props.transportMinistryLicenseNumber,
    transportLicenseIssueDate: props.transportLicenseIssueDate,
    transportLicenseExpiryDate: props.transportLicenseExpiryDate,
    activityClassification: props.activityClassification,
    hazardousTransport: props.hazardousTransport,
    civilDefensePermit: props.civilDefensePermit,
    safetyClassification: props.safetyClassification,
    fleetInsuranceCoverage: props.fleetInsuranceCoverage,
    insuranceProvider: props.insuranceProvider,
    ownershipType: props.ownershipType,
});

watch(() => props, (newProps) => {
    Object.assign(formData, {
        transportMinistryLicenseNumber: newProps.transportMinistryLicenseNumber,
        transportLicenseIssueDate: newProps.transportLicenseIssueDate,
        transportLicenseExpiryDate: newProps.transportLicenseExpiryDate,
        activityClassification: newProps.activityClassification,
        hazardousTransport: newProps.hazardousTransport,
        civilDefensePermit: newProps.civilDefensePermit,
        safetyClassification: newProps.safetyClassification,
        fleetInsuranceCoverage: newProps.fleetInsuranceCoverage,
        insuranceProvider: newProps.insuranceProvider,
        ownershipType: newProps.ownershipType,
    });
}, { deep: true });

const emitUpdate = () => {
    emit('update:formData', { ...formData });
};

</script>

<template>
    <div class="mb-4 bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-bold text-primary-900 mb-4">الترخيص والامتثال</h2>

        <!-- License Information -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TextInput v-model="formData.transportMinistryLicenseNumber"
                @input="() => handleInputUpdate('transport_ministry_license_number')" label="رقم ترخيص وزارة النقل"
                placeholder="11478523" :error-messages="props.formErrors?.['transport_ministry_license_number']"
                :hide-details="false" />

            <DatePickerInput v-model="formData.transportLicenseIssueDate" @update:model-value="emitUpdate"
                label="تاريخ إصدار الترخيص" placeholder="DD-MM-YYYY"
                :error-messages="props.formErrors?.['license_issue_date']" :hide-details="false" />

            <DatePickerInput v-model="formData.transportLicenseExpiryDate" @update:model-value="emitUpdate"
                label="تاريخ انتهاء الترخيص" placeholder="DD-MM-YYYY"
                :error-messages="props.formErrors?.['license_expiry_date']" :hide-details="false" />

            <SelectInput clearable v-model="formData.activityClassification" @update:model-value="emitUpdate"
                label="تصنيف النشاط" placeholder="اختر تصنيف النشاط" :items="activityClassificationItems"
                :error-messages="props.formErrors?.['activity_classification']" :hide-details="false" />

            <SelectInput clearable v-model="formData.safetyClassification" @update:model-value="emitUpdate"
                label="تصنيف السلامة" placeholder="اختر تصنيف السلامة" :items="safetyClassificationItems"
                :error-messages="props.formErrors?.['safety_classification']" :hide-details="false" />

            <TextInput v-model="formData.insuranceProvider" @input="() => handleInputUpdate('insurance_provider')"
                label=" جهة التأمين  " placeholder="اسم شركة التأمين"
                :error-messages="props.formErrors?.['insurance_provider']" :hide-details="false" />

            <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">تأمين شامل للأسطول</span>
                <v-radio-group v-model="formData.fleetInsuranceCoverage" inline hide-details
                    @update:model-value="emitUpdate">
                    <v-radio :value="true" color="primary">
                        <template #label>
                            <span
                                :class="formData.fleetInsuranceCoverage ? 'text-primary font-semibold' : 'text-gray-600'">
                                نعم
                            </span>
                        </template>

                    </v-radio>
                    <v-radio :value="false" color="primary">
                        <template #label>
                            <span
                                :class="!formData.fleetInsuranceCoverage ? 'text-primary font-semibold' : 'text-gray-600'">
                                لا
                            </span>
                        </template>
                    </v-radio>
                </v-radio-group>
            </div>

            <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">رخصة نقل المواد الخطرة للمحروقات</span>
                <v-radio-group v-model="formData.hazardousTransport" inline hide-details
                    @update:model-value="emitUpdate">
                    <v-radio :value="true" color="primary">
                        <template #label>
                            <span :class="formData.hazardousTransport ? 'text-primary font-semibold' : 'text-gray-600'">
                                نعم
                            </span>
                        </template>

                    </v-radio>
                    <v-radio :value="false" color="primary">
                        <template #label>
                            <span
                                :class="!formData.hazardousTransport ? 'text-primary font-semibold' : 'text-gray-600'">
                                لا
                            </span>
                        </template>
                    </v-radio>
                </v-radio-group>
            </div>
            <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">تصريح الدفاع المدني</span>
                <v-radio-group v-model="formData.civilDefensePermit" inline hide-details
                    @update:model-value="emitUpdate">
                    <v-radio :value="true" color="primary">
                        <template #label>
                            <span :class="formData.civilDefensePermit ? 'text-primary font-semibold' : 'text-gray-600'">
                                نعم
                            </span>
                        </template>

                    </v-radio>
                    <v-radio :value="false" color="primary">
                        <template #label>
                            <span
                                :class="!formData.civilDefensePermit ? 'text-primary font-semibold' : 'text-gray-600'">
                                لا
                            </span>
                        </template>
                    </v-radio>
                </v-radio-group>
            </div>
            <SelectInput clearable v-model="formData.ownershipType" @update:model-value="emitUpdate" label="نوع الملكية"
                placeholder="اختر نوع الملكية" :items="ownershipTypeItems"
                :error-messages="props.formErrors?.['ownership_type']" :hide-details="false" />

        </div>
    </div>
</template>
