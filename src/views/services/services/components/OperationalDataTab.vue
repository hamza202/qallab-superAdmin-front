<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Available languages
const availableLanguages = ref([
    { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
    { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
])

const props = defineProps<{
    modelValue: any
    durationUnits: Array<{ key: string; label: string }>
    visibilityLevels: Array<{ key: string; label: string }>
}>()

const emit = defineEmits(['update:modelValue'])

const formData = ref(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
    formData.value = newVal
}, { deep: true })

const updateFormData = () => {
    emit('update:modelValue', formData.value)
}

// Convert API data to select items format
const durationUnitItems = computed(() =>
    props.durationUnits.map(d => ({ title: d.label, value: d.key }))
)

const visibilityItems = computed(() =>
    props.visibilityLevels.map(v => ({ title: v.label, value: v.key }))
)

const handleFileUpload = (event: any) => {
    const files = event.target.files
    if (files && files.length > 0) {
        formData.value.attachments = {
            name: files[0].name,
            size: files[0].size,
            uploaded: true
        }
        updateFormData()
    }
}
</script>

<template>
    <div class="space-y-3">
        <!-- الموعد والمدة Section -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-base font-bold text-black mb-6">{{ t('pages.services.form.operationalData.appointmentSection') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.requiresScheduling') }}</label>
                    <v-radio-group v-model="formData.requires_scheduling" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span
                                    :class="formData.requires_scheduling ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span
                                    :class="!formData.requires_scheduling ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>
                <div>
                    <!-- <label class="block text-sm font-semibold text-gray-900 mb-2">مدة الخدمة</label>
                    <v-text-field v-model="formData.service_duration" type="number" variant="outlined"
                        :rules="[numeric(), positive()]" density="comfortable" placeholder="أدخل المدة"
                        @update:model-value="updateFormData">
                        <template #append-inner>
                            <v-divider vertical class="mx-2" />
                            <div @mousedown.stop @click.stop>
                                <v-select v-model="formData.service_duration_unit" placeholder="اختر"
                                    :items="durationUnitItems" variant="plain" density="compact" hide-details
                                    class="inner-select" style="width: 100px; min-width: 100px;"
                                    @update:model-value="updateFormData" />
                            </div>
                        </template>
                    </v-text-field> -->
                    <TextInputWithSelect v-model="formData.service_duration"
                        v-model:selectValue="formData.service_duration_unit" :label="t('pages.services.form.operationalData.serviceDuration')" :placeholder="t('pages.services.form.operationalData.serviceDurationPlaceholder')"
                        type="number" :rules="[numeric(), positive()]" :select-items="durationUnitItems"
                        :select-placeholder="t('pages.services.form.operationalData.durationUnitPlaceholder')" select-width="100px" @update:model-value="updateFormData"
                        @update:select-value="updateFormData" />

                </div>
            </div>
        </div>

        <!-- حالة الخدمة Section -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-base font-bold text-black mb-6">{{ t('pages.services.form.operationalData.serviceStatusSection') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.requiresApproval') }}</label>
                    <v-radio-group v-model="formData.requires_approval" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span
                                    :class="formData.requires_approval ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span
                                    :class="!formData.requires_approval ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.isBarter') }}</label>
                    <v-radio-group v-model="formData.is_barter" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span :class="formData.is_barter ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span :class="!formData.is_barter ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.isPartialAllowed') }}</label>
                    <v-radio-group v-model="formData.is_partial_allowed" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span
                                    :class="formData.is_partial_allowed ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span
                                    :class="!formData.is_partial_allowed ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.salesEnabled') }}</label>
                    <v-radio-group v-model="formData.sales_enabled" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span :class="formData.sales_enabled ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span :class="!formData.sales_enabled ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.purchaseEnabled') }}</label>
                    <v-radio-group v-model="formData.purchase_enabled" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span
                                    :class="formData.purchase_enabled ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span
                                    :class="!formData.purchase_enabled ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">{{ t('pages.services.form.operationalData.projectEnabled') }}</label>
                    <v-radio-group v-model="formData.project_enabled" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio :value="true" color="primary">
                            <template #label>
                                <span
                                    :class="formData.project_enabled ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.yes') }}
                                </span>
                            </template>
                        </v-radio>
                        <v-radio :value="false" color="primary">
                            <template #label>
                                <span
                                    :class="!formData.project_enabled ? 'text-primary font-semibold' : 'text-gray-600'">
                                    {{ t('pages.services.form.basicInfo.no') }}
                                </span>
                            </template>
                        </v-radio>
                    </v-radio-group>
                </div>

                <selectInput :label="t('pages.services.form.operationalData.visibilityLevel')" v-model="formData.visibility_level" :items="visibilityItems"
                    variant="outlined" density="comfortable" :placeholder="t('pages.services.form.operationalData.visibilityPlaceholder')" hide-details class="max-w-md"
                    @update:model-value="updateFormData" />
            </div>
        </div>

        <!-- بيانات إضافية Section -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ t('pages.services.form.operationalData.additionalDataSection') }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextareaInput v-model="formData.notes" :label="t('pages.services.form.operationalData.notes')" :placeholder="t('pages.services.form.operationalData.notesPlaceholder')" :rows="4"
                    :hide-details="true" @update:model-value="updateFormData" />

                <!-- <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">مستندات مرفقة</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white">
                        <input type="file" class="hidden" id="file-upload" @change="handleFileUpload" />
                        <label for="file-upload" class="cursor-pointer">
                            <div class="text-gray-500 mb-2">
                                <v-icon size="40" color="primary">mdi-file-document-outline</v-icon>
                            </div>
                            <div class="text-sm text-gray-600">
                                <span v-if="formData.attachments?.name">
                                    {{ formData.attachments.name }}<br />
                                    <span class="text-xs">200 kB — 100% uploaded</span>
                                </span>
                                <span v-else>
                                    ملف مشروع البيوت<br />
                                    <span class="text-xs">200 kB — 100% uploaded</span>
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
 -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">{{ t('pages.services.form.operationalData.activationDate') }}</label>
                    <DatePickerInput v-model="formData.activation_date" variant="outlined" density="comfortable"
                        :placeholder="t('pages.services.form.operationalData.activationDatePlaceholder')" hide-details @update:model-value="updateFormData" />
                </div>
            </div>
        </div>
    </div>
</template>
