<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const formData = ref(props.modelValue)

const updateFormData = () => {
    emit('update:modelValue', formData.value)
}

const monitoringLevels = [
    { title: 'عام', value: 'general' },
    { title: 'متوسط', value: 'medium' },
    { title: 'تفصيلي', value: 'detailed' },
]

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
                    <v-radio-group v-model="formData.has_schedule" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <TextInput label="مدة الخدمة" v-model="formData.duration" variant="outlined" density="comfortable"
                    placeholder="5 ساعات" hide-details @update:model-value="updateFormData" />
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
                    <v-radio-group v-model="formData.exchangeable" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">قابلة للتجزئة</label>
                    <v-radio-group v-model="formData.divisible" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">متاحة للبيع</label>
                    <v-radio-group v-model="formData.available_for_sale" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">متاحة للشراء</label>
                    <v-radio-group v-model="formData.available_for_purchase" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>
                <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">متاحة للمشاريع</label>
                    <v-radio-group v-model="formData.available_for_projects" inline hide-details
                        @update:model-value="updateFormData">
                        <v-radio label="نعم" :value="true" color="primary" />
                        <v-radio label="لا" :value="false" color="primary" />
                    </v-radio-group>
                </div>

                    <selectInput label="مستوى الرقابة" v-model="formData.monitoring_level" :items="monitoringLevels" variant="outlined"
                        density="comfortable" placeholder="عام" hide-details class="max-w-md"
                        @update:model-value="updateFormData" />
            </div>
        </div>

        <!-- بيانات إضافية Section -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">بيانات إضافية</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">الوصف بالعربية</label>
                    <v-textarea v-model="formData.additional_description_ar" variant="outlined" density="comfortable"
                        placeholder="تفاصيل المنتج" rows="4" hide-details @update:model-value="updateFormData" />
                </div>

                <div>
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

<style scoped></style>
