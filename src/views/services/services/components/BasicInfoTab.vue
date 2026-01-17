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
  taxes: Array<{ id: number; tax_name: string; value_rate: string }>
  serviceCategories: Array<{ id: number; name: string }>
  formErrors: Record<string, string>
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
const StatusList = [
  { title: 'فعال', value: true },
  { title: 'غير فعال', value: false }
]


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

const serviceCategoryItems = computed(() =>
  props.serviceCategories.map(c => ({ title: c.name, value: c.id }))
)

// Watch for tax selection and auto-populate tax_percentage
watch(() => formData.value.tax_id, (newTaxId) => {
  if (newTaxId && formData.value.is_taxable) {
    const selectedTax = props.taxes.find(t => t.id === newTaxId)
    if (selectedTax) {
      formData.value.tax_percentage = selectedTax.value_rate
      updateFormData()
    }
  }
})

// Watch for is_taxable changes
watch(() => formData.value.is_taxable, (isTaxable) => {
  if (!isTaxable) {
    formData.value.tax_id = null
    formData.value.tax_percentage = ''
    updateFormData()
  }
})
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-3 md:p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Row 1 - Name with Language Tabs -->
      <div class="md:col-span-2">
        <LanguageTabs :languages="availableLanguages" label="الإسم">
          <template #en>
            <TextInput v-model="formData.name_en" variant="outlined" density="comfortable"
              placeholder="Enter name in English" :rules="[required()]" :hide-details="false"
              :error-messages="props.formErrors['name.en']" @update:model-value="updateFormData"
              @input="delete props.formErrors['name.en']" />
          </template>
          <template #ar>
            <TextInput v-model="formData.name_ar" variant="outlined" density="comfortable"
              placeholder="ادخل الاسم بالعربية" :rules="[required()]" :hide-details="false"
              :error-messages="props.formErrors['name.ar']" @update:model-value="updateFormData"
              @input="delete props.formErrors['name.ar']" />
          </template>
        </LanguageTabs>
      </div>

      <div>
        <TextInput v-model="formData.service_code" variant="outlined" density="comfortable" label="رمز الخدمة"
          placeholder="ادخل رمز الخدمة" :rules="[required()]" :hide-details="false"
          :error-messages="props.formErrors['service_code']" @update:model-value="updateFormData"
          @input="delete props.formErrors['service_code']" />
      </div>

      <div>
        <selectInput v-model="formData.service_category_id" :items="serviceCategoryItems" variant="outlined"
          label="فئة الخدمة" density="comfortable" clearable placeholder="اختر الفئة"
          :error-messages="props.formErrors['service_category_id']" @update:model-value="() => { updateFormData(); delete props.formErrors['service_category_id']; }" />
      </div>

      <div>
        <selectWithIconInput show-add-button v-model="formData.service_type" :items="typeItems" variant="outlined"
          label="نوع الخدمة" :hide-details="false" density="comfortable" clearable placeholder="اختر نوع الخدمة" :rules="[required()]"
          :error-messages="props.formErrors['service_type']" @update:model-value="() => { updateFormData(); delete props.formErrors['service_type']; }" />
      </div>

      <div>
        <selectInput v-model="formData.is_active" :items="StatusList" variant="outlined" label="حالة الخدمة"
          density="comfortable" placeholder="اختر الحالة" clearable hide-details @update:model-value="updateFormData" />
      </div>

      <!-- Row 3 - Description with Language Tabs -->
      <div class="md:col-span-2 md:row-span-2">
        <LanguageTabs :languages="availableLanguages" label="الوصف">
          <template #en>
            <RichTextEditor v-model="formData.description_en" placeholder="Enter description in English"
              min-height="120px" hide-details @update:model-value="updateFormData" />
          </template>
          <template #ar>
            <RichTextEditor v-model="formData.description_ar" placeholder="ادخل الوصف بالعربية" min-height="120px"
              hide-details @update:model-value="updateFormData" />
          </template>
        </LanguageTabs>
      </div>

      <div>
        <selectInput v-model="formData.unit_id" :items="unitItems" variant="outlined" density="comfortable"
          label="وحدة القياس" clearable placeholder="اختر الوحدة" :rules="[required()]" :hide-details="false"
          :error-messages="props.formErrors['unit_id']" @update:model-value="() => { updateFormData(); delete props.formErrors['unit_id']; }" />
      </div>


      <div>
        <TextInput v-model="formData.unit_price" type="number" variant="outlined" density="comfortable"
          label="سعر الوحدة" placeholder="ادخل سعر الوحدة" hide-details @update:model-value="updateFormData" />
      </div>


      <!-- Row 6 -->
      <div>
        <selectInput v-model="formData.pricing_method_id" :items="pricingMethodItems" variant="outlined"
          density="comfortable" label="طريقة التسعير" placeholder="اختر الطريقة" :rules="[required()]" :hide-details="false"
          @update:model-value="() => { updateFormData(); delete props.formErrors['pricing_method_id']; }" clearable :error-messages="props.formErrors['pricing_method_id']" />
      </div>

      <div>
        <TextInput v-model="formData.min_quantity" type="number" variant="outlined" density="comfortable"
          label="حد أدنى للكمية" placeholder="0" :rules="[minValue(1)]" :hide-details="false"
          :error-messages="props.formErrors['min_quantity']" @update:model-value="updateFormData"
          @input="delete props.formErrors['min_quantity']" />
      </div>

      <div>
        <selectInput v-model="formData.tax_id" :items="taxItems" variant="outlined" density="comfortable" :hide-details="false"
          label="الضريبة" placeholder="اختر الضريبة" @update:model-value="() => { updateFormData(); delete props.formErrors['tax_id']; }"
          :disabled="!formData.is_taxable" clearable :rules="formData.is_taxable ? [required()] : []"
          :error-messages="props.formErrors['tax_id']" />
      </div>

      <div>
        <TextInput v-model="formData.tax_percentage" type="number" variant="outlined" label="نسبة الضريبة"
          density="comfortable" placeholder="0" hide-details readonly
          disabled />
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 mb-2">خاضعة للضريبة</label>
        <v-radio-group v-model="formData.is_taxable" inline hide-details @update:model-value="updateFormData">
          <v-radio :value="true" color="primary">
            <template #label>
              <span :class="formData.is_taxable ? 'text-primary font-semibold' : 'text-gray-600'">
                نعم
              </span>
            </template>
          </v-radio>
          <v-radio :value="false" color="primary">
            <template #label>
              <span :class="!formData.is_taxable ? 'text-primary font-semibold' : 'text-gray-600'">
                لا
              </span>
            </template>
          </v-radio>
        </v-radio-group>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
