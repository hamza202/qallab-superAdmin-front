<template>
  <default-layout>
    <div class="category-view-page -mx-6">
      <div>
        <!-- Breadcrumb -->
        <div class="flex flex-wrap items-center gap-3 mb-6 text-sm px-6">
          <router-link to="/" class="text-gray-500 hover:text-primary-600">
            <span v-html="homeIcon"></span>
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <router-link to="/purchases/quotations-material-product/list" class="text-gray-600 hover:text-primary-600">
            المشتريات
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <router-link to="/purchases/quotations-material-product/list" class="text-gray-600 hover:text-primary-600">
            عروض اسعار مواد اوليه
          </router-link>
          <span class="text-lg text-gray-300">/</span>
          <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">#{{ quotationId }}</span>
        </div>

        <!-- Page Header -->
        <div class="bg-white px-6 py-4 border-y border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center">
                <span v-html="productIcon" class="text-primary-600"></span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-gray-900 mb-1">{{ detail?.quotation_name ?? '—' }}</h1>
                <p class="text-sm text-gray-600">{{ detail?.code ?? '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div
          class="flex lg:items-center lg:justify-between py-4 border-b border-gray-200 flex-col lg:flex-row gap-3 px-6">
          <div class="flex gap-2 overflow-y-auto">
            <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
              'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
              isTabActive(tab.value)
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:bg-gray-50',
            ]">
              <span v-html="tab.icon" class="w-6 h-6"></span>
              <span class="text-base font-semibold whitespace-nowrap">{{ tab.title }}</span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <v-tabs-window v-model="activeTab">
          <v-tabs-window-item :value="0">
            <div class="p-6 border-b !border-gray-200">
              <h2 class="text-xl font-bold text-primary-900 mb-6">معلومات العرض</h2>
              <div class="flex flex-wrap gap-4">
                <div class="info-item-bordered flex-1 px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">اسم العميل</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail?.customer_name ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered flex-1 px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">كود العرض</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail?.code ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered flex-1 px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">تاريخ العرض</label>
                  <p class="text-base font-semibold text-gray-900">{{ formatDate(detail?.quotations_datetime) }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered flex-1 px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">الحالة</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail?.status ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered flex-1 px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">موقع الهدف</label>
                  <p class="text-base font-semibold text-gray-900">{{ detail?.target_location ?? '—' }}</p>
                </div>
              </div>
              <div class="flex gap-4 mt-4">
                <div class="info-item-bordered px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">طريقة الدفع</label>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ detail?.payment_method ?? '—' }}</p>
                </div>
                <v-divider vertical class="my-6"></v-divider>
                <div class="info-item-bordered px-6 py-4">
                  <label class="font-semibold text-sm text-gray-500 mb-2 block">الإجمالي النهائي</label>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ detail?.final_total ?? '—' }}</p>
                </div>
              </div>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item :value="1">
            <div class="mb-8">
              <div class="bg-primary-50 px-6 py-3">
                <div class="flex items-center gap-2">
                  <span v-html="packageIcon"></span>
                  <h2 class="text-lg font-bold text-primary-900">المنتجات</h2>
                </div>
              </div>
              <div class="mb-4">
                <DataTable :headers="headers" :items="items" :show-actions="false" />
              </div>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </div>
  </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'

const route = useRoute()
const api = useApi()
const { error } = useNotification()

const quotationId = computed(() => route.params.id ?? '')
const activeTab = ref(0)
const detail = ref<any>(null)

const formatDate = (val: string | undefined) => {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('ar-SA')
  } catch {
    return val
  }
}

const fetchDetail = async () => {
  if (!quotationId.value) return
  try {
    const res = await api.get(`/purchases/quotations/building-materials/${quotationId.value}`)
    const data = res?.data ?? res
    detail.value = data
    items.value = data?.items ?? data?.products ?? []
  } catch (err: any) {
    console.error('Error fetching quotation:', err)
    error(err?.response?.data?.message || 'فشل تحميل تفاصيل العرض')
  }
}

const productIcon = `<svg width="49" height="44" viewBox="0 0 49 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.66667 12.6587C5.28398 12.6488 5.00609 12.6267 4.75625 12.577C2.90502 12.2088 1.4579 10.7616 1.08967 8.91042C1 8.45963 1 7.91753 1 6.83333C1 5.74914 1 5.20704 1.08967 4.75625C1.4579 2.90502 2.90502 1.4579 4.75625 1.08967C5.20704 1 5.74914 1 6.83333 1H41.8333C42.9175 1 43.4596 1 43.9104 1.08967C45.7616 1.4579 47.2088 2.90502 47.577 4.75625C47.6667 5.20704 47.6667 5.74914 47.6667 6.83333C47.6667 7.91753 47.6667 8.45963 47.577 8.91042C47.2088 10.7616 45.7616 12.2088 43.9104 12.577C43.6606 12.6267 43.3827 12.6488 43 12.6587M19.6667 24.3333H29M5.66667 12.6667H43V31.8C43 35.7204 43 37.6805 42.237 39.1779C41.5659 40.4951 40.4951 41.5659 39.1779 42.237C37.6806 43 35.7204 43 31.8 43H16.8667C12.9463 43 10.9861 43 9.48873 42.237C8.1716 41.5659 7.10073 40.4951 6.42962 39.1779C5.66667 37.6805 5.66667 35.7204 5.66667 31.8V12.6667Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const packageIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 9.5L7.5 4.5" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const tabs = [
  { title: 'المعلومات العامة', value: 0, icon: '' },
  { title: 'المنتجات المضافة', value: 1, icon: '' },
]

const isTabActive = (tabValue: number) => activeTab.value === tabValue

const headers = [
  { title: 'اسم المنتج', key: 'name' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'الوحدة', key: 'unit' },
  { title: 'ملاحظات', key: 'notes' },
]

const items = ref<any[]>([])

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.info-item-bordered {
  min-width: 150px;
}
</style>
