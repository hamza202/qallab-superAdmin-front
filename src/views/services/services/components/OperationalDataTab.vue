<script setup lang="ts">
import { ref, computed, watch } from 'vue'

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
            <h3 class="text-base font-bold text-black mb-6">الموعد والمدة ؟</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="mb-6">
                    <label class="block text-sm font-semibold text-gray-900 mb-2">هل تحتاج موعد؟</label>
                    <v-radio-group v-model="formData.requires_scheduling" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">مدة الخدمة</label>
                    <v-text-field v-model="formData.service_duration" type="number" variant="outlined"
                        density="comfortable" placeholder="5" hide-details @update:model-value="updateFormData">
                        <template #append-inner>
                            <v-divider vertical class="mx-2" />
                            <div @mousedown.stop @click.stop>
                                <v-select v-model="formData.service_duration_unit" :items="durationUnitItems"
                                    variant="plain" density="compact" hide-details class="inner-select"
                                    style="width: 100px; min-width: 100px;" @update:model-value="updateFormData" />
                            </div>
                        </template>
                    </v-text-field>
                </div>
            </div>

        </div>

        <!-- حالة الخدمة Section -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-base font-bold text-black mb-6">حالة الخدمة ؟</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">تتطلب موافقة</label>
                    <v-radio-group v-model="formData.requires_approval" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">قابلة للمقايضة</label>
                    <v-radio-group v-model="formData.is_barter" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">قابلة للتجزئة</label>
                    <v-radio-group v-model="formData.is_partial_allowed" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">متاحة للبيع</label>
                    <v-radio-group v-model="formData.sales_enabled" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">متاحة للشراء</label>
                    <v-radio-group v-model="formData.purchase_enabled" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">متاحة للمشاريع</label>
                    <v-radio-group v-model="formData.project_enabled" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>

                <selectInput label="مستوى الرؤية" v-model="formData.visibility_level" :items="visibilityItems"
                    variant="outlined" density="comfortable" placeholder="عام" hide-details class="max-w-md"
                    @update:model-value="updateFormData" />
            </div>
        </div>

        <!-- بيانات إضافية Section -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">بيانات إضافية</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">الوصف بالعربية</label>
                    <v-textarea v-model="formData.notes" variant="outlined" density="comfortable"
                        placeholder="تفاصيل المنتج" rows="4" hide-details @update:model-value="updateFormData" />
                </div>

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
                    <label class="block text-sm font-semibold text-gray-700 mb-2">تاريخ التفعيل</label>
                    <v-text-field v-model="formData.activation_date" type="date" variant="outlined"
                        density="comfortable" placeholder="2024-03-01" hide-details
                        @update:model-value="updateFormData" />
                </div>
            </div>
        </div>
    </div>
</template>

