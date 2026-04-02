<script setup lang="ts">
import { SettingsIcon } from '@/components/icons/globalIcons';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);
const loading = ref(false);

interface PricingForm {
    id?: number;
    centralLocation: string | null;
    city: string | null;
    minDistance: string;
    maxDistance: string;
    truckTypes: string[];
    truckCount: string;
    tripDuration: string;
    tripTime: string | null;
    materialType: string | null;
    price: string;
    roadType: string | null;
    waitingTime: string;
}

const form = reactive<PricingForm>({
    centralLocation: null,
    city: null,
    minDistance: '',
    maxDistance: '',
    truckTypes: [],
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
const centralLocations = [
    { title: "الرياض - المركز الرئيسي", value: "riyadh-main" },
    { title: "جدة - المركز الغربي", value: "jeddah-west" },
    { title: "الدمام - المركز الشرقي", value: "dammam-east" },
    { title: "مكة المكرمة - المركز الديني", value: "makkah-religious" },
];

const cities = [
    { title: "الرياض", value: "riyadh" },
    { title: "جدة", value: "jeddah" },
    { title: "مكة المكرمة", value: "makkah" },
    { title: "المدينة المنورة", value: "madinah" },
    { title: "الدمام", value: "dammam" },
    { title: "الخبر", value: "khobar" },
    { title: "الطائف", value: "taif" },
    { title: "تبوك", value: "tabuk" },
];

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
        centralLocation: "riyadh-main",
        city: "riyadh",
        minDistance: "50",
        maxDistance: "100",
        truckTypes: ["small", "medium"],
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
        <div class="pricing-form-page">
            <PageHeader 
                :icon="SettingsIcon" 
                :title-key="isEditing ? 'تعديل التسعير بالشاحنة' : 'إضافة تسعير بالشاحنة'"
                description-key="إدارة أسعار الشحن حسب الشاحنة والمسافة" 
            />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectWithIconInput 
                                v-model="form.centralLocation" 
                                label="الموقع المركزي"
                                placeholder="اختر الموقع المركزي"
                                :items="centralLocations"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['centralLocation']"
                                @update:model-value="delete formErrors['centralLocation']"
                            />

                            <SelectWithIconInput 
                                v-model="form.city" 
                                label="المدينة"
                                placeholder="اختر المدينة"
                                :items="cities"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['city']"
                                @update:model-value="delete formErrors['city']"
                            />

                            <TextInput 
                                v-model="form.minDistance" 
                                label="أدنى مسافة بال كم"
                                placeholder="أدخل أدنى مسافة"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['minDistance']"
                                @input="delete formErrors['minDistance']"
                            />

                            <TextInput 
                                v-model="form.maxDistance" 
                                label="أقصى مسافة بال كم"
                                placeholder="أدخل أقصى مسافة"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['maxDistance']"
                                @input="delete formErrors['maxDistance']"
                            />

                            <SelectWithIconInput 
                                v-model="form.truckTypes" 
                                label="نوع الشاحنة"
                                placeholder="اختر نوع الشاحنة"
                                :items="truckTypes"
                                :rules="[required()]"
                                :hide-details="false"
                                multiple
                                :error-messages="formErrors['truckTypes']"
                                @update:model-value="delete formErrors['truckTypes']"
                            />

                            <TextInput 
                                v-model="form.truckCount" 
                                label="عدد الشاحنات"
                                placeholder="أدخل عدد الشاحنات"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['truckCount']"
                                @input="delete formErrors['truckCount']"
                            />

                            <TextInput 
                                v-model="form.tripDuration" 
                                label="زمن الرحلة (ساعة)"
                                placeholder="أدخل زمن الرحلة بالساعات"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['tripDuration']"
                                @input="delete formErrors['tripDuration']"
                            />

                            <SelectWithIconInput 
                                v-model="form.tripTime" 
                                label="وقت الرحلة"
                                placeholder="اختر وقت الرحلة"
                                :items="tripTimes"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['tripTime']"
                                @update:model-value="delete formErrors['tripTime']"
                            />

                            <SelectWithIconInput 
                                v-model="form.materialType" 
                                label="نوع المادة"
                                placeholder="اختر نوع المادة"
                                :items="materialTypes"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['materialType']"
                                @update:model-value="delete formErrors['materialType']"
                            />

                            <TextInput 
                                v-model="form.price" 
                                label="السعر / طن"
                                placeholder="أدخل السعر"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['price']"
                                @input="delete formErrors['price']"
                            />

                            <SelectWithIconInput 
                                v-model="form.roadType" 
                                label="نوع الطريق"
                                placeholder="اختر نوع الطريق"
                                :items="roadTypes"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['roadType']"
                                @update:model-value="delete formErrors['roadType']"
                            />

                            <TextInput 
                                v-model="form.waitingTime" 
                                label="وقت الانتظار (ساعة)"
                                placeholder="أدخل وقت الانتظار بالساعات"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['waitingTime']"
                                @input="delete formErrors['waitingTime']"
                            />
                        </div>

                        <div class="flex gap-3 justify-end pt-4">
                            <ButtonWithIcon 
                                variant="flat" 
                                color="primary" 
                                height="44" 
                                rounded="4"
                                custom-class="font-semibold text-base px-8" 
                                label="حفظ" 
                                prepend-icon="mdi-content-save" 
                                @click="handleSave"
                                :loading="saving" 
                                :disabled="saving" 
                            />

                            <ButtonWithIcon 
                                variant="flat" 
                                color="primary-50" 
                                height="44" 
                                rounded="4"
                                custom-class="font-semibold text-base text-primary-700 px-8" 
                                label="إلغاء" 
                                prepend-icon="mdi-close"
                                @click="handleCancel" 
                            />
                        </div>
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
