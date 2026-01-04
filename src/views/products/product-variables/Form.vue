<template>
  <default-layout>
    <div class="form-validation-page">
      <!-- Header -->
      <PageHeader :icon="gridIcon" title-key="pages.productVariables.title"
        description-key="pages.productVariables.description" />

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
        <div class="">
          <!-- Basic Information Section -->
          <div class="mb-3 bg-primary-50 border !border-gray-200 rounded-lg px-6 py-4">
            <h2 class="text-lg font-bold text-primary-900 mb-4">المعلومات الأساسية</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextInput v-model="formData.name_ar" label="اسم متغير المنتج (عربي)" placeholder="المقياس"
                :rules="[required('الاسم بالعربي مطلوب')]" :hide-details="false" />

              <TextInput v-model="formData.name_en" label="اسم متغير المنتج (إنجليزي)" placeholder="Size"
                :rules="[required('الاسم بالإنجليزي مطلوب')]" :hide-details="false" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <SelectInput v-model="formData.value_type" label="نوع القيمة" :items="classificationItems"
                placeholder="اختر نوع القيمة" :hide-details="false" :loading="loadingConstants" />

              <SelectInput v-model="formData.category_ids" label="الفئات" :items="categoryItems"
                placeholder="اختر الفئات" :hide-details="false" multiple chips :loading="loadingCategories" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="col-span-2">
                <!-- Notes -->
                <TextareaInput v-model="formData.notes" label="الملاحظات" placeholder="أدخل الملاحظات هنا..." rows="4"
                  :hide-details="false" />

              </div>

              <!-- Status Radio Buttons -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">الحالة</label>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="formData.is_active" type="radio" :value="true"
                      class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                    <span class="text-sm text-gray-700">فعال</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="formData.is_active" type="radio" :value="false"
                      class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                    <span class="text-sm text-gray-700">غير فعال</span>
                  </label>
                </div>
              </div>


            </div>
          </div>

          <!-- Variable Values Section -->
          <div class="mb-3 bg-gray-50 border !border-gray-200 rounded-lg">
            <div class="flex justify-between items-center border-b !border-gray-200 px-6 py-4">
              <h2 class="text-lg font-bold text-primary-900">قيم المتغير</h2>
              <v-btn variant="flat" color="primary" height="40" class="font-bold px-5" @click="addVariableValue">
                <template #prepend>
                  <span v-html="addIcon"></span>
                </template>
                أضف جديد
              </v-btn>
            </div>

            <!-- Variable Values Table with Editable Inputs -->
            <v-table v-if="formData.values.length > 0" class="bg-white rounded-none">
              <thead>
                <tr class="bg-gray-100">
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">{{ formData.name_ar || formData.name_en || 'القيمة' }}</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">الحالة</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, index) in formData.values" :key="index" class="border-b !border-gray-200">
                  <td class="py-3 px-4">
                    <TextInput v-model="value.name" density="compact" variant="outlined" hide-details
                      placeholder="أدخل القيمة" />
                  </td>
                  <td class="py-3 px-4">
                    <v-switch v-model="value.is_active" hide-details inset density="compact" color="primary" />
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <v-btn icon size="small" color="error" variant="text" @click="removeVariableValue(index)">
                        <span v-html="trashIcon"></span>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <!-- Empty State -->
            <div v-if="formData.values.length === 0"
              class="text-center py-12 bg-white rounded-lg border !border-gray-200 m-4">
              <v-icon size="48" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
              <p class="mt-3 text-gray-600 text-sm">لا توجد قيم متغيرات</p>
              <p class="text-gray-500 text-xs">اضغط على "أضف جديد" لإضافة قيمة جديدة</p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6 px-6">
            <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
              @click="handleSaveAndReturn">
              <template #prepend>
                <v-icon>mdi-content-save-all-outline</v-icon>
              </template>
              {{ t('common.save') }}
            </v-btn>
            <v-btn variant="flat" color="primary-50" height="44"
              class="font-semibold text-base text-primary-700 sm:min-w-[200px]" @click="handleBack">
              <template #prepend>
                <v-icon>mdi-close</v-icon>
              </template>
              {{ t('common.cancel') }}
            </v-btn>
          </div>


        </div>
      </v-form>
    </div>
  </default-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const api = useApi()

const formRef = ref<any>(null)
const isFormValid = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// Validation rules
const required = (message: string) => (value: any) => !!value || message

const gridIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.2 6.5H9.96667C8.75322 6.5 8.1465 6.5 7.68302 6.73615C7.27534 6.94388 6.94388 7.27534 6.73615 7.68302C6.5 8.1465 6.5 8.75322 6.5 9.96667V18.2C6.5 19.4134 6.5 20.0202 6.73615 20.4836C6.94388 20.8913 7.27534 21.2228 7.68302 21.4305C8.1465 21.6667 8.75322 21.6667 9.96667 21.6667H18.2C19.4134 21.6667 20.0202 21.6667 20.4836 21.4305C20.8913 21.2228 21.2228 20.8913 21.4305 20.4836C21.6667 20.0202 21.6667 19.4134 21.6667 18.2V9.96667C21.6667 8.75322 21.6667 8.1465 21.4305 7.68302C21.2228 7.27534 20.8913 6.94388 20.4836 6.73615C20.0202 6.5 19.4134 6.5 18.2 6.5Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42.0333 6.5H33.8C32.5866 6.5 31.9798 6.5 31.5164 6.73615C31.1087 6.94388 30.7772 7.27534 30.5695 7.68302C30.3333 8.1465 30.3333 8.75322 30.3333 9.96667V18.2C30.3333 19.4134 30.3333 20.0202 30.5695 20.4836C30.7772 20.8913 31.1087 21.2228 31.5164 21.4305C31.9798 21.6667 32.5866 21.6667 33.8 21.6667H42.0333C43.2468 21.6667 43.8535 21.6667 44.317 21.4305C44.7247 21.2228 45.0561 20.8913 45.2638 20.4836C45.5 20.0202 45.5 19.4134 45.5 18.2V9.96667C45.5 8.75322 45.5 8.1465 45.2638 7.68302C45.0561 7.27534 44.7247 6.94388 44.317 6.73615C43.8535 6.5 43.2468 6.5 42.0333 6.5Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42.0333 30.3333H33.8C32.5866 30.3333 31.9798 30.3333 31.5164 30.5695C31.1087 30.7772 30.7772 31.1087 30.5695 31.5164C30.3333 31.9798 30.3333 32.5866 30.3333 33.8V42.0333C30.3333 43.2468 30.3333 43.8535 30.5695 44.317C30.7772 44.7247 31.1087 45.0561 31.5164 45.2638C31.9798 45.5 32.5866 45.5 33.8 45.5H42.0333C43.2468 45.5 43.8535 45.5 44.317 45.2638C44.7247 45.0561 45.0561 44.7247 45.2638 44.317C45.5 43.8535 45.5 43.2468 45.5 42.0333V33.8C45.5 32.5866 45.5 31.9798 45.2638 31.5164C45.0561 31.1087 44.7247 30.7772 44.317 30.5695C43.8535 30.3333 43.2468 30.3333 42.0333 30.3333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.2 30.3333H9.96667C8.75322 30.3333 8.1465 30.3333 7.68302 30.5695C7.27534 30.7772 6.94388 31.1087 6.73615 31.5164C6.5 31.9798 6.5 32.5866 6.5 33.8V42.0333C6.5 43.2468 6.5 43.8535 6.73615 44.317C6.94388 44.7247 7.27534 45.0561 7.68302 45.2638C8.1465 45.5 8.75322 45.5 9.96667 45.5H18.2C19.4134 45.5 20.0202 45.5 20.4836 45.2638C20.8913 45.0561 21.2228 44.7247 21.4305 44.317C21.6667 43.8535 21.6667 43.2468 21.6667 42.0333V33.8C21.6667 32.5866 21.6667 31.9798 21.4305 31.5164C21.2228 31.1087 20.8913 30.7772 20.4836 30.5695C20.0202 30.3333 19.4134 30.3333 18.2 30.3333Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.08333 0.750122H10.4788C10.8864 0.750122 11.0902 0.750122 11.2821 0.796172C11.4521 0.837 11.6147 0.904341 11.7638 0.995722C11.932 1.09879 12.0761 1.24292 12.3644 1.53117L14.969 4.13574C15.2572 4.42399 15.4013 4.56812 15.5044 4.73631C15.5958 4.88543 15.6631 5.04801 15.7039 5.21807C15.75 5.40988 15.75 5.61371 15.75 6.02136V12.4168M8.66667 6.58346H5.41667C4.94996 6.58346 4.7166 6.58346 4.53834 6.49263C4.38154 6.41273 4.25406 6.28525 4.17416 6.12845C4.08333 5.95019 4.08333 5.71683 4.08333 5.25012V3.66679M9.5 15.7501V12.0835C9.5 11.6167 9.5 11.3834 9.40917 11.2051C9.32928 11.0483 9.20179 10.9208 9.04499 10.8409C8.86673 10.7501 8.63338 10.7501 8.16667 10.7501H5.41667C4.94996 10.7501 4.7166 10.7501 4.53834 10.8409C4.38154 10.9208 4.25406 11.0483 4.17416 11.2051C4.08333 11.3834 4.08333 11.6167 4.08333 12.0835V15.7501M12.8333 6.71907V13.0835C12.8333 14.0169 12.8333 14.4836 12.6517 14.8401C12.4919 15.1537 12.2369 15.4087 11.9233 15.5685C11.5668 15.7501 11.1001 15.7501 10.1667 15.7501H3.41667C2.48325 15.7501 2.01654 15.7501 1.66002 15.5685C1.34641 15.4087 1.09144 15.1537 0.931656 14.8401C0.75 14.4836 0.75 14.0169 0.75 13.0835V6.33346C0.75 5.40003 0.75 4.93332 0.931656 4.5768C1.09144 4.2632 1.34641 4.00823 1.66002 3.84844C2.01654 3.66679 2.48325 3.66679 3.41667 3.66679H9.78105C9.98487 3.66679 10.0868 3.66679 10.1827 3.68981C10.2677 3.71023 10.349 3.7439 10.4236 3.78959C10.5077 3.84112 10.5797 3.91319 10.7239 4.05731L12.4428 5.77626C12.5869 5.92039 12.659 5.99245 12.7105 6.07655C12.7562 6.15111 12.7899 6.2324 12.8103 6.31743C12.8333 6.41333 12.8333 6.51525 12.8333 6.71907Z" stroke="#175CD3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const arrowLeftIcon = `<svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1667 5.83337H0.833344M0.833344 5.83337L5.83334 10.8334M0.833344 5.83337L5.83334 0.833374" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const addIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4.16669V15.8334M4.16669 10H15.8334" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`


const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;


interface VariableValue {
  id?: number | null
  name: string
  is_active: boolean
}

interface FormData {
  name_ar: string
  name_en: string
  value_type: string
  is_active: boolean
  notes: string
  category_ids: string[]
  values: VariableValue[]
}

interface ApiAspect {
  id: number
  name: string
  value_type: number
  category_ids: string[]
  notes: string
  is_active: boolean
  values: Array<{
    id: number
    name: string
    is_active: number
  }>
  created_at: string
}

interface ValueType {
  key: number
  label: string
}

interface Category {
  id: number
  name: string
}

const classificationItems = ref<Array<{ title: string; value: string }>>([])
const categoryItems = ref<Array<{ title: string; value: string }>>([])
const loadingConstants = ref(false)
const loadingCategories = ref(false)

const formData = ref<FormData>({
  name_ar: '',
  name_en: '',
  value_type: '1',
  is_active: true,
  notes: '',
  category_ids: [],
  values: []
})

const isEditMode = computed(() => !!route.params.id)

const addVariableValue = () => {
  formData.value.values.push({
    id: null,
    name: '',
    is_active: true
  })
}

const removeVariableValue = (index: number) => {
  formData.value.values.splice(index, 1)
}

const handleBack = () => {
  router.push({ name: 'ProductVariableList' })
}

const handleSaveAndReturn = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) {
    error.value = 'يرجى تصحيح الأخطاء في النموذج'
    return
  }

  try {
    loading.value = true
    error.value = null

    // Prepare payload according to API structure
    const payload = {
      name: {
        ar: formData.value.name_ar,
        en: formData.value.name_en
      },
      notes: formData.value.notes,
      value_type: formData.value.value_type,
      category_ids: formData.value.category_ids,
      is_active: formData.value.is_active,
      values: formData.value.values.map(v => ({
        id: v.id,
        name: v.name,
        is_active: v.is_active
      }))
    }

    if (isEditMode.value) {
      // Update existing aspect
      await api.post(`/api/aspects/${route.params.id}`, payload)
      alert('تم تحديث المتغير بنجاح')
    } else {
      // Create new aspect
      await api.post('/api/aspects', payload)
      alert('تم إضافة المتغير بنجاح')
    }

    handleBack()
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'فشل حفظ البيانات'
    console.error('Save error:', err)
    alert(error.value)
  } finally {
    loading.value = false
  }
}

// Fetch constants (value_types)
const fetchConstants = async () => {
  try {
    loadingConstants.value = true
    const response = await api.get<{
      status: number
      code: number
      locale: string
      message: string
      data: {
        value_types: ValueType[]
      }
    }>('/api/aspects/constants')

    if (response.data && response.data.value_types) {
      classificationItems.value = response.data.value_types.map(vt => ({
        title: vt.label,
        value: vt.key.toString()
      }))
    }
  } catch (err: any) {
    console.error('Fetch constants error:', err)
    error.value = err.response?.data?.message || err.message || 'فشل تحميل الثوابت'
  } finally {
    loadingConstants.value = false
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    loadingCategories.value = true
    const response = await api.get<{
      status: number
      code: number
      locale: string
      message: string
      data: Category[]
    }>('/admin/api/categories/list')

    if (response.data) {
      categoryItems.value = response.data.map(cat => ({
        title: cat.name,
        value: cat.id.toString()
      }))
    }
  } catch (err: any) {
    console.error('Fetch categories error:', err)
    error.value = err.response?.data?.message || err.message || 'فشل تحميل الفئات'
  } finally {
    loadingCategories.value = false
  }
}

// Fetch aspect data for editing
const fetchAspect = async () => {
  if (!isEditMode.value) return

  try {
    loading.value = true
    error.value = null

    const response: { data: ApiAspect } = await api.get(`/api/aspects/${route.params.id}`)
    const aspect = response.data

    // Transform API data to form data
    formData.value = {
      name_ar: aspect.name || '',
      name_en: aspect.name || '',
      value_type: aspect.value_type.toString(),
      is_active: aspect.is_active,
      notes: aspect.notes || '',
      category_ids: aspect.category_ids || [],
      values: aspect.values?.map(v => ({
        id: v.id,
        name: v.name,
        is_active: Boolean(v.is_active)
      })) || []
    }
  } catch (err: any) {
    error.value = err.message || 'فشل تحميل بيانات المتغير'
    console.error('Fetch aspect error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Fetch constants and categories first
  await Promise.all([
    fetchConstants(),
    fetchCategories()
  ])
  
  // Then fetch aspect data if in edit mode
  await fetchAspect()
})
</script>
