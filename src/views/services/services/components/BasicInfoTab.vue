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

const serviceTypes = [
  { title: 'داخلية', value: 'internal' },
  { title: 'خارجية', value: 'external' },
]

const serviceCategories = [
  { title: 'استشارات', value: 'consulting' },
  { title: 'صيانة', value: 'maintenance' },
]

const measurementUnits = [
  { title: 'ساعة', value: 'hour' },
  { title: 'يوم', value: 'day' },
  { title: 'ثابت', value: 'fixed' },
]
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Row 1 -->
      <div>
        <TextInput v-model="formData.name_ar" variant="outlined" label="الاسم بالعربية" density="comfortable"
          placeholder="ادخل الاسم" hide-details @update:model-value="updateFormData" />
      </div>

      <div>
        <TextInput v-model="formData.name_en" variant="outlined" density="comfortable" label="الاسم بالانجليزية"
          placeholder="ادخل الاسم" hide-details @update:model-value="updateFormData" />
      </div>

      <div>
        <TextInput v-model="formData.code" variant="outlined" density="comfortable" label="رمز الخدمة"
          placeholder="2110" hide-details @update:model-value="updateFormData" />
      </div>

      <!-- Row 2 -->
      <div>
        <selectInput v-model="formData.service_category" :items="serviceCategories" variant="outlined"
          label="فئة الخدمة" density="comfortable" placeholder="تحليل" hide-details
          @update:model-value="updateFormData" />
      </div>

      <div>
        <selectInput v-model="formData.service_type" :items="serviceTypes" variant="outlined" label="نوع الخدمة"
          density="comfortable" placeholder="داخلية" hide-details @update:model-value="updateFormData">
          <template #append-inner>
            <v-icon color="primary">mdi-plus-circle</v-icon>
          </template>
        </selectInput>
      </div>

      <div>
        <selectInput v-model="formData.service_status" :items="[{ title: 'معالجة', value: 'processing' }]"
          variant="outlined" density="comfortable" label="حالة الخدمة" placeholder="معالجة" hide-details
          @update:model-value="updateFormData" />
      </div>

      <!-- Row 3 -->

      <div class="md:row-span-2">
        <TextareaInput v-model="formData.arabic_description" variant="outlined" density="comfortable"
          label="الوصف بالعربية" placeholder="تفاصيل الخدمة" hide-details rows="5"
          @update:model-value="updateFormData" />
      </div>

      <!-- Row 4 -->
      <div class="md:row-span-2">
        <TextareaInput v-model="formData.english_description" variant="outlined" density="comfortable"
          label="الوصف بالانجليزية" placeholder="Service details" rows="5" hide-details
          @update:model-value="updateFormData" />
      </div>

      <div>
        <selectInput v-model="formData.measurement_unit" :items="measurementUnits" variant="outlined"
          density="comfortable" label="وحدة القياس" placeholder="ساعة" hide-details
          @update:model-value="updateFormData" />
      </div>


      <div>
        <TextInput v-model="formData.unit_price" type="number" variant="outlined" density="comfortable"
          label="سعر الوحدة" placeholder="25" hide-details @update:model-value="updateFormData" />
      </div>


      <!-- Row 6 -->
      <div>
        <selectInput v-model="formData.pricing_method" :items="measurementUnits" variant="outlined"
          density="comfortable" label="طريقة الاسم" placeholder="ثابت" hide-details
          @update:model-value="updateFormData" />
      </div>

      <div>
        <TextInput v-model="formData.minimum_service" variant="outlined" density="comfortable" label="حد أدنى للخدمة"
          placeholder="ساعة" hide-details @update:model-value="updateFormData" />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">خاضعة للضريبة</label>
        <v-radio-group v-model="formData.tax_applicable" inline hide-details @update:model-value="updateFormData">
          <v-radio label="نعم" :value="true" color="primary" />
          <v-radio label="لا" :value="false" color="primary" />
        </v-radio-group>
      </div>

      <div>
        <TextInput v-model="formData.tax_percentage" type="number" variant="outlined" label="نسبة الضريبة"
          density="comfortable" placeholder="25%" hide-details @update:model-value="updateFormData" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
