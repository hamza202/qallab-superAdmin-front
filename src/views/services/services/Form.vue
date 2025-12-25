<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotification } from '@/composables/useNotification'
import BasicInfoTab from './components/BasicInfoTab.vue'
import OperationalDataTab from './components/OperationalDataTab.vue'

const route = useRoute()
const router = useRouter()
const { success, error } = useNotification()

const serviceId = computed(() => route.params.id ? Number(route.params.id) : null)
const isEditing = computed(() => !!serviceId.value)
const saving = ref(false)

const servicesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="40" height="40" rx="4" stroke="#1570EF" stroke-width="3"/>
<path d="M14 16H38" stroke="#1570EF" stroke-width="3"/>
<path d="M14 24H38" stroke="#1570EF" stroke-width="3"/>
<path d="M14 32H30" stroke="#1570EF" stroke-width="3"/>
</svg>`

const activeTab = ref(0)

const tabs = [
    { title: "البيانات الأساسية", value: 0 },
    { title: "البيانات التشغيلية", value: 1 },
]

const basicInfoData = ref({
    name_ar: '',
    name_en: '',
    code: '',
    service_type: 'internal',
    service_category: 'consulting',
    service_status: 'processing',
    measurement_unit: 'hour',
    arabic_description: 'تفاصيل الخدمة',
    english_description: 'Service details',
    unit_price: '25',
    tax_applicable: true,
    pricing_method: 'fixed',
    minimum_service: 'ساعة',
    tax_percentage: '25',
})

const operationalData = ref({
    has_schedule: true,
    duration: '',
    requires_approval: true,
    available_for_sale: true,
    available_for_purchase: true,
    available_for_projects: true,
    divisible: false,
    exchangeable: false,
    monitoring_level: 'عام',
    additional_description_ar: '',
    attachments: {
        name: 'ملف مشروع البيوت',
        size: '200 kB',
        uploaded: true
    },
    activation_date: '2024-03-01',
})

const isTabActive = (value: number) => activeTab.value === value

const basicInfoCompleted = computed(() => {
    if (isEditing.value) {
        return !!(basicInfoData.value.name_ar && basicInfoData.value.code)
    }
    return !!(basicInfoData.value.name_ar && basicInfoData.value.code)
})

const operationalInfoCompleted = computed(() => {
    return !!(operationalData.value.duration && operationalData.value.monitoring_level)
})

const isTabCompleted = (value: number) => {
    if (value === 0) return basicInfoCompleted.value
    if (value === 1) return operationalInfoCompleted.value
    return false
}

const handleTabChange = (newTab: number, event?: Event) => {
    if (!isEditing.value && newTab === 1 && activeTab.value === 0) {
        if (!basicInfoCompleted.value) {
            error('يجب إكمال المعلومات الأساسية أولاً')
            if (event) {
                event.preventDefault()
                event.stopPropagation()
            }
            setTimeout(() => {
                activeTab.value = 0
            }, 0)
            return
        }
    }
    activeTab.value = newTab
}

const handleSave = async () => {
    try {
        saving.value = true

        success('تم حفظ الخدمة بنجاح')

        setTimeout(() => {
            router.push({ name: 'ServicesList' })
        }, 1000)
    } catch (err: any) {
        console.error('Error saving service:', err)
        error('فشل في حفظ الخدمة')
    } finally {
        saving.value = false
    }
}

const handleClose = () => {
    router.push({ name: 'ServicesList' })
}

const checkCircleIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12506_1251)">
<path d="M16.5 8.31429V9.00429C16.4991 10.6216 15.9754 12.1953 15.007 13.4907C14.0386 14.786 12.6775 15.7337 11.1265 16.1922C9.57557 16.6508 7.91794 16.5957 6.40085 16.0352C4.88376 15.4747 3.58849 14.4389 2.70822 13.0821C1.82795 11.7253 1.40984 10.1203 1.51626 8.50653C1.62267 6.89272 2.24791 5.35654 3.29871 4.1271C4.34951 2.89766 5.76959 2.04083 7.34714 1.6844C8.92469 1.32798 10.5752 1.49105 12.0525 2.14929M16.5 3L9 10.5075L6.75 8.2575" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12506_1251">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`
</script>

<template>
    <default-layout>
        <div class="services-form-page">
            <PageHeader :icon="servicesIcon" title-key="pages.services.title"
                description-key="pages.services.description" />

            <div class="-mx-6">
                <div class="bg-white px-6">
                    <v-tabs v-model="activeTab" color="primary" class="custom-tabs mb-6" hide-slider>
                        <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
                            'custom-tab',
                            {
                                'custom-tab--active': isTabActive(tab.value),
                                'custom-tab--completed': isTabCompleted(tab.value),
                            },
                        ]" @click="handleTabChange(tab.value, $event)">
                            {{ tab.title }}
                            <span v-if="isTabCompleted(tab.value)" class="ms-2" v-html="checkCircleIcon"></span>
                        </v-tab>
                    </v-tabs>

                    <v-tabs-window v-model="activeTab">
                        <v-tabs-window-item :value="0">
                            <BasicInfoTab v-model="basicInfoData" />
                        </v-tabs-window-item>

                        <v-tabs-window-item :value="1">
                            <OperationalDataTab v-model="operationalData" />
                        </v-tabs-window-item>
                    </v-tabs-window>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6 px-6">
                    <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
                        @click="handleSave" :loading="saving">
                        <template #prepend>
                            <v-icon>mdi-content-save-all-outline</v-icon>
                        </template>
                        حفظ
                    </v-btn>
                    <v-btn variant="flat" color="primary-50" height="44"
                        class="font-semibold text-base text-primary-700 sm:min-w-[200px]" @click="handleClose"
                        :disabled="saving">
                        <template #prepend>
                            <v-icon>mdi-close</v-icon>
                        </template>
                        اغلاق
                    </v-btn>
                </div>
            </div>
        </div>
    </default-layout>
</template>

<style scoped>
.custom-tabs {
    border-bottom: none;
}

.custom-tab {
    @apply rounded-lg px-6 py-2 text-base font-semibold text-gray-600 bg-white border border-gray-300 mx-1;
    text-transform: none;
    letter-spacing: normal;
}

.custom-tab--active {
    @apply bg-primary-600 !text-white border-primary-600;
}

.custom-tab--completed {
    @apply bg-primary-600 text-white border-primary-600;
}
</style>
