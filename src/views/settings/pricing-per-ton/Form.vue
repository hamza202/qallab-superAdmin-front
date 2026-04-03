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

interface PricingPerTonForm {
    id?: number;
    central_location: string;
    city: string;
    direction: string | null;
    min_distance_km: string;
    max_distance_km: string;
    material_type: string | null;
    weight_ton: string;
    price_per_ton: string;
}

const form = reactive<PricingPerTonForm>({
    central_location: '',
    city: '',
    direction: null,
    min_distance_km: '',
    max_distance_km: '',
    material_type: null,
    weight_ton: '',
    price_per_ton: '',
});

const formErrors = reactive<Record<string, string>>({});

// Demo data for dropdowns
const directions = [
    { title: "شمال", value: "north" },
    { title: "جنوب", value: "south" },
    { title: "شرق", value: "east" },
    { title: "غرب", value: "west" },
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
        central_location: 'مجمع الحمر',
        city: 'جدة',
        direction: 'north',
        min_distance_km: 10,
        max_distance_km: 50,
        material_type: 'رمل',
        weight_ton: 1000,
        price_per_ton: 150,
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

        router.push('/settings/pricing-per-ton/list');
    } catch (err: any) {
        console.error('Error saving pricing:', err);
        toast.error('حدث خطأ أثناء حفظ التسعير');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/pricing-per-ton/list');
};

onMounted(() => {
    if (isEditing.value) {
        fetchPricingData();
    }
});
</script>

<template>
    <default-layout>
        <div class="pricing-per-ton-form-page -mx-6">
            <AppFormBreadcrumb list-path="/settings/pricing-per-ton/list" module-root-key="الإعدادات"
                list-label-key="إدارة المسارات المركزية" create-label-key="مجمع العد" edit-label-key="مجمع العد"
                :is-edit-mode="isEditing" />

            <TopHeader :icon="coins" title-key="إضافة تسعيرة بالطن" description-key="تحكم في إضافة تسعيرة بالطن"
                :show-action="false" />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else class="space-y-6">
                        <h2 class="text-xl font-bold text-primary-800 mb-6">معلومات التسعيرة</h2>

                        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            <TextInput v-model="form.central_location" label="الموقع المركزي" placeholder="مجمع العد"
                                :rules="[required()]" :error-messages="formErrors['central_location']"
                                @input="delete formErrors['central_location']" density="comfortable" />

                            <TextInput v-model="form.city" label="المدينة" placeholder="الرياض"
                                :rules="[required()]" :error-messages="formErrors['city']"
                                @input="delete formErrors['city']" density="comfortable" />

                            <SelectWithIconInput v-model="form.direction" label="الاتجاه" placeholder="اختر الاتجاه"
                                :items="directions" :rules="[required()]" :error-messages="formErrors['direction']"
                                @update:model-value="delete formErrors['direction']" density="comfortable" />

                            <TextInput v-model="form.min_distance_km" label="أقل مسافة (كم)" placeholder="10" type="number"
                                :rules="[required()]" :error-messages="formErrors['min_distance_km']"
                                @input="delete formErrors['min_distance_km']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">كم</span>
                                </template>
                            </TextInput>

                            <TextInput v-model="form.max_distance_km" label="أقصى مسافة (كم)" placeholder="50" type="number"
                                :rules="[required()]" :error-messages="formErrors['max_distance_km']"
                                @input="delete formErrors['max_distance_km']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">كم</span>
                                </template>
                            </TextInput>

                            <SelectWithIconInput v-model="form.material_type" label="نوع المادة" placeholder="رمل"
                                :items="materialTypes" :rules="[required()]"
                                :error-messages="formErrors['material_type']"
                                @update:model-value="delete formErrors['material_type']" density="comfortable" />

                            <TextInput v-model="form.weight_ton" label="الوزن (طن)" placeholder="1000" type="number"
                                :rules="[required()]" :error-messages="formErrors['weight_ton']"
                                @input="delete formErrors['weight_ton']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">طن</span>
                                </template>
                            </TextInput>

                            <PriceInput v-model="form.price_per_ton" label="السعر/طن" placeholder="150" showRialIcon type="number"
                                :rules="[required()]" :error-messages="formErrors['price_per_ton']"
                                @input="delete formErrors['price_per_ton']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">ر</span>
                                </template>
                            </PriceInput>
                        </div>

                        <div class="flex gap-3 justify-center pt-4 sm:w-[75%] mx-auto mt-12">
                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1"
                                label="حفظ والعودة إلى قائمة المسارات" @click="handleSave" :loading="saving"
                                :disabled="saving" />

                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1"
                                label="حفظ والعودة إلى قائمة التسعيرة بالطن" @click="handleSave" :loading="saving"
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
