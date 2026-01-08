<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
])

const props = defineProps<{
  modelValue: any
  domains: Array<{ key: string; label: string }>
  types: Array<{ key: string; label: string }>
  units: Array<{ id: number; name: string }>
  pricingMethods: Array<{ id: number; name: string }>
  taxes: Array<{ id: number; tax_name: string }>
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
const domainItems = computed(() => 
  props.domains.map(d => ({ title: d.label, value: d.key }))
)

const typeItems = computed(() => 
  props.types.map(t => ({ title: t.label, value: t.key }))
)

const unitItems = computed(() => 
  props.units.map(u => ({ title: u.name, value: u.id }))
)

const pricingMethodItems = computed(() => 
  props.pricingMethods.map(p => ({ title: p.name, value: p.id }))
)

const taxItems = computed(() => 
  props.taxes.map(t => ({ title: t.tax_name, value: t.id }))
)
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Row 1 - Name with Language Tabs -->
      <div class="md:col-span-2">
        <LanguageTabs :languages="availableLanguages" label="الإسم">
          <template #en>
            <TextInput v-model="formData.name_en" variant="outlined" density="comfortable"
              placeholder="Enter name in English" hide-details @update:model-value="updateFormData" />
          </template>
          <template #ar>
            <TextInput v-model="formData.name_ar" variant="outlined" density="comfortable"
              placeholder="ادخل الاسم بالعربية" hide-details @update:model-value="updateFormData" />
          </template>
        </LanguageTabs>
      </div>

      <div>
        <TextInput v-model="formData.service_code" variant="outlined" density="comfortable" label="رمز الخدمة"
          placeholder="2110" hide-details @update:model-value="updateFormData" />
      </div>

      <!-- Row 2 -->
      <div>
        <selectInput v-model="formData.service_category_id" :items="domainItems" variant="outlined"
          label="فئة الخدمة" density="comfortable" placeholder="اختر الفئة" hide-details
          @update:model-value="updateFormData" />
      </div>

      <div>
        <selectInput v-model="formData.service_type" :items="typeItems" variant="outlined" label="نوع الخدمة"
          density="comfortable" placeholder="داخلية" hide-details @update:model-value="updateFormData" />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">حالة الخدمة</label>
        <v-radio-group v-model="formData.is_active" inline hide-details @update:model-value="updateFormData">
          <v-radio label="نشط" :value="true" color="primary" />
          <v-radio label="غير نشط" :value="false" color="primary" />
        </v-radio-group>
      </div>

      <!-- Row 3 - Description with Language Tabs -->
      <div class="md:col-span-2 md:row-span-2">
        <LanguageTabs :languages="availableLanguages" label="الوصف">
          <template #en>
            <RichTextEditor v-model="formData.description_en" placeholder="Enter description in English"
              min-height="120px" hide-details @update:model-value="updateFormData" />
          </template>
          <template #ar>
            <RichTextEditor v-model="formData.description_ar" placeholder="ادخل الوصف بالعربية"
              min-height="120px" hide-details @update:model-value="updateFormData" />
          </template>
        </LanguageTabs>
      </div>

      <div>
        <selectInput v-model="formData.unit_id" :items="unitItems" variant="outlined"
          density="comfortable" label="وحدة القياس" placeholder="اختر الوحدة" hide-details
          @update:model-value="updateFormData" />
      </div>


      <div>
        <TextInput v-model="formData.unit_price" type="number" variant="outlined" density="comfortable"
          label="سعر الوحدة" placeholder="25" hide-details @update:model-value="updateFormData" />
      </div>


      <!-- Row 6 -->
      <div>
        <selectInput v-model="formData.pricing_method_id" :items="pricingMethodItems" variant="outlined"
          density="comfortable" label="طريقة التسعير" placeholder="اختر الطريقة" hide-details
          @update:model-value="updateFormData" />
      </div>

      <div>
        <TextInput v-model="formData.min_quantity" type="number" variant="outlined" density="comfortable" label="حد أدنى للكمية"
          placeholder="0" hide-details @update:model-value="updateFormData" />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">خاضعة للضريبة</label>
        <v-radio-group v-model="formData.is_taxable" inline hide-details @update:model-value="updateFormData">
          <v-radio label="نعم" :value="true" color="primary" />
          <v-radio label="لا" :value="false" color="primary" />
        </v-radio-group>
      </div>

      <div>
        <selectInput v-model="formData.tax_id" :items="taxItems" variant="outlined"
          density="comfortable" label="الضريبة" placeholder="اختر الضريبة" hide-details
          @update:model-value="updateFormData" :disabled="!formData.is_taxable" />
      </div>

      <div>
        <TextInput v-model="formData.tax_percentage" type="number" variant="outlined" label="نسبة الضريبة"
          density="comfortable" placeholder="0" hide-details @update:model-value="updateFormData" :disabled="!formData.is_taxable" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
