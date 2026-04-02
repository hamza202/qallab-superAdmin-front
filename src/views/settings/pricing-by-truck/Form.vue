<script setup lang="ts">
import { SettingsIcon } from '@/components/icons/globalIcons';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';

const router = useRouter();
const route = useRoute();

const coins = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.8333 6.33333C25.8333 8.72657 20.4981 10.6667 13.9167 10.6667C7.33527 10.6667 2 8.72657 2 6.33333M25.8333 6.33333C25.8333 3.9401 20.4981 2 13.9167 2C7.33527 2 2 3.9401 2 6.33333M25.8333 6.33333V9.58333M2 6.33333V32.3333C2 34.7266 7.33527 36.6667 13.9167 36.6667M13.9167 19.3333C13.5515 19.3333 13.1901 19.3274 12.8333 19.3157C6.75962 19.1166 2 17.2604 2 15M13.9167 28C7.33527 28 2 26.0599 2 23.6667M45.3333 20.4167C45.3333 22.8099 39.9981 24.75 33.4167 24.75C26.8353 24.75 21.5 22.8099 21.5 20.4167M45.3333 20.4167C45.3333 18.0234 39.9981 16.0833 33.4167 16.0833C26.8353 16.0833 21.5 18.0234 21.5 20.4167M45.3333 20.4167V36.6667C45.3333 39.0599 39.9981 41 33.4167 41C26.8353 41 21.5 39.0599 21.5 36.6667V20.4167M45.3333 28.5417C45.3333 30.9349 39.9981 32.875 33.4167 32.875C26.8353 32.875 21.5 30.9349 21.5 28.5417" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);
const loading = ref(false);

interface PricingForm {
    id?: number;
    minDistance: string;
    maxDistance: string;
    truckTypes: string | null;
    truckCount: string;
    tripDuration: string;
    tripTime: string | null;
    materialType: string | null;
    price: string;
    roadType: string | null;
    waitingTime: string;
}

const form = reactive<PricingForm>({
    minDistance: '',
    maxDistance: '',
    truckTypes: null,
    truckCount: '',
    tripDuration: '',
    tripTime: null,
    materialType: null,
    price: '',
    roadType: null,
    waitingTime: '',
});

const formErrors = reactive<Record<string, string>>({});

// Demo data for dropdowns
const truckTypes = [
    { title: "شاحنة صغيرة", value: "small" },
    { title: "شاحنة متوسطة", value: "medium" },
    { title: "شاحنة كبيرة", value: "large" },
    { title: "شاحنة قلاب", value: "dump" },
    { title: "شاحنة مقطورة", value: "trailer" },
];

const tripTimes = [
    { title: "صباحاً", value: "morning" },
    { title: "ظهراً", value: "noon" },
    { title: "مساءً", value: "evening" },
    { title: "ليلاً", value: "night" },
];

const materialTypes = [
    { title: "منتجات عامة", value: "general" },
    { title: "مواد بناء أولية", value: "construction" },
    { title: "محروقات", value: "fuel" },
    { title: "قطع غيار", value: "spare-parts" },
];

const roadTypes = [
    { title: "طريق سريع", value: "highway" },
    { title: "طريق رئيسي", value: "main" },
    { title: "طريق فرعي", value: "secondary" },
    { title: "طريق داخلي", value: "internal" },
];

// Demo data for existing records
const demoPricings = [
    {
        id: 1,
        minDistance: "50",
        maxDistance: "100",
        truckTypes: "small",
        truckCount: "5",
        tripDuration: "2",
        tripTime: "morning",
        materialType: "general",
        price: "500",
        roadType: "highway",
        waitingTime: "1"
    },
];

const isEditing = computed(() => !!route.params.id);

const fetchPricingData = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        const pricing = demoPricings.find(p => p.id === Number(route.params.id));
        if (pricing) {
            Object.assign(form, pricing);
        }
    } catch (err: any) {
        console.error('Error fetching pricing data:', err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const handleSave = async () => {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (formRef.value && typeof formRef.value.validate === "function") {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    try {
        saving.value = true;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        if (isEditing.value) {
            toast.success('تم تحديث التسعير بنجاح');
        } else {
            toast.success('تم إضافة التسعير بنجاح');
        }

        router.push('/settings/pricing-by-truck/list');
    } catch (err: any) {
        console.error('Error saving pricing:', err);
        toast.error('حدث خطأ أثناء حفظ التسعير');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/pricing-by-truck/list');
};

onMounted(() => {
    if (isEditing.value) {
        fetchPricingData();
    }
});
</script>

<template>
    <default-layout>
        <div class="pricing-form-page -mx-6">
            <AppFormBreadcrumb list-path="/settings/pricing-by-truck/list" module-root-key="الإعدادات"
                list-label-key="إدارة المسارات المركزية" create-label-key="مجمع العد" edit-label-key="مجمع العد"
                :is-edit-mode="isEditing" />

            <TopHeader :icon="coins" title-key="إضافة تسعيرة بالشاحنة" description-key="تحكم من إضافة تسعيرة بالشاحنة"
                :show-action="false" />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else class="space-y-6">
                        <h2 class="text-xl font-bold text-primary-800 mb-6">معلومات التسعيرة</h2>

                        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            <TextInput v-model="form.minDistance" label="أدنى مسافة" placeholder="12" type="number"
                                :rules="[required()]"  :error-messages="formErrors['minDistance']"
                                @input="delete formErrors['minDistance']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">كم</span>
                                </template>
                            </TextInput>

                            <TextInput v-model="form.maxDistance" label="أقصى مسافة" placeholder="12" type="number"
                                :rules="[required()]"  :error-messages="formErrors['maxDistance']"
                                @input="delete formErrors['maxDistance']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">كم</span>
                                </template>
                            </TextInput>

                            <SelectWithIconInput v-model="form.truckTypes" label="نوع الشاحنة" placeholder="اختر النوع"
                                :items="truckTypes" :rules="[required()]" 
                                :error-messages="formErrors['truckTypes']"
                                @update:model-value="delete formErrors['truckTypes']" density="comfortable" />

                            <TextInput v-model="form.truckCount" label="عدد الشاحنات" placeholder="2" type="number"
                                :rules="[required()]"  :error-messages="formErrors['truckCount']"
                                @input="delete formErrors['truckCount']" density="comfortable" />

                            <TextInput v-model="form.tripDuration" label="زمن الرحلة" placeholder="2" type="number"
                                :rules="[required()]"  :error-messages="formErrors['tripDuration']"
                                @input="delete formErrors['tripDuration']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">ساعة</span>
                                </template>
                            </TextInput>

                            <SelectWithIconInput v-model="form.tripTime" label="وقت الرحلة" placeholder="صباحاً"
                                :items="tripTimes" :rules="[required()]" 
                                :error-messages="formErrors['tripTime']"
                                @update:model-value="delete formErrors['tripTime']" density="comfortable" />

                            <SelectWithIconInput v-model="form.materialType" label="نوع المادة" placeholder="رمل"
                                :items="materialTypes" :rules="[required()]" 
                                :error-messages="formErrors['materialType']"
                                @update:model-value="delete formErrors['materialType']" density="comfortable" />

                            <PriceInput v-model="form.price" label="السعر" placeholder="5000" type="number"
                                :rules="[required()]" showRialIcon :error-messages="formErrors['price']"
                                @input="delete formErrors['price']" density="comfortable" />

                            <SelectWithIconInput v-model="form.roadType" label="نوع الطريق" placeholder="اختر النوع"
                                :items="roadTypes" :rules="[required()]" 
                                :error-messages="formErrors['roadType']"
                                @update:model-value="delete formErrors['roadType']" density="comfortable" />

                            <TextInput v-model="form.waitingTime" label="وقت الانتظار" placeholder="2" type="number"
                                :rules="[required()]"  :error-messages="formErrors['waitingTime']"
                                @input="delete formErrors['waitingTime']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">ساعة</span>
                                </template>
                            </TextInput>
                        </div>

                        <div class="flex gap-3 justify-center pt-4 sm:w-[75%] mx-auto mt-12">
                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1"
                                label="حفظ والعودة إلى قائمة المسارات" @click="handleSave" :loading="saving"
                                :disabled="saving" />

                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1"
                                label="حفظ والعودة إلى قائمة التسعيرة بالشاحنة" @click="handleSave" :loading="saving"
                                :disabled="saving" />

                            <ButtonWithIcon variant="outlined" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1" label="إلغاء"
                                @click="handleCancel" />
                        </div>
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
