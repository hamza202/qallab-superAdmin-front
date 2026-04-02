<script setup lang="ts">
import { SettingsIcon } from '@/components/icons/globalIcons';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);
const loading = ref(false);

interface CustomPricingForm {
    id?: number;
    minDistance: string;
    maxDistance: string;
    minWeight: string;
    maxWeight: string;
    materialType: string | null;
    truckTypes: string[];
    truckCount: string;
    tripTime: string | null;
    tripDuration: string;
    waitingTime: string;
    roadType: string | null;
    price: string;
}

const form = reactive<CustomPricingForm>({
    minDistance: '',
    maxDistance: '',
    minWeight: '',
    maxWeight: '',
    materialType: null,
    truckTypes: [],
    truckCount: '',
    tripTime: null,
    tripDuration: '',
    waitingTime: '',
    roadType: null,
    price: '',
});

const formErrors = reactive<Record<string, string>>({});

// Demo data for dropdowns
const materialTypes = [
    { title: "منتجات عامة", value: "general" },
    { title: "مواد بناء أولية", value: "construction" },
    { title: "محروقات", value: "fuel" },
    { title: "قطع غيار", value: "spare-parts" },
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
        minWeight: "5",
        maxWeight: "10",
        materialType: "general",
        truckTypes: ["small", "medium"],
        truckCount: "5",
        tripTime: "morning",
        tripDuration: "2",
        waitingTime: "1",
        roadType: "highway",
        price: "500"
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
            toast.success('تم تحديث التسعير المخصص بنجاح');
        } else {
            toast.success('تم إضافة التسعير المخصص بنجاح');
        }

        router.push('/settings/custom-pricing/list');
    } catch (err: any) {
        console.error('Error saving pricing:', err);
        toast.error('حدث خطأ أثناء حفظ التسعير المخصص');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push('/settings/custom-pricing/list');
};

onMounted(() => {
    if (isEditing.value) {
        fetchPricingData();
    }
});
</script>

<template>
    <default-layout>
        <div class="custom-pricing-form-page">
            <PageHeader 
                :icon="SettingsIcon" 
                :title-key="isEditing ? 'تعديل التسعير المخصص' : 'إضافة تسعير مخصص'"
                description-key="إدارة التسعير المخصص للشاحنات والمواد" 
            />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextInput 
                                v-model="form.minDistance" 
                                label="أدنى مسافة"
                                placeholder="أدخل أدنى مسافة"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['minDistance']"
                                @input="delete formErrors['minDistance']"
                            />

                            <TextInput 
                                v-model="form.maxDistance" 
                                label="أقصى مسافة"
                                placeholder="أدخل أقصى مسافة"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['maxDistance']"
                                @input="delete formErrors['maxDistance']"
                            />

                            <TextInput 
                                v-model="form.minWeight" 
                                label="أدنى حمولة"
                                placeholder="أدخل أدنى حمولة"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['minWeight']"
                                @input="delete formErrors['minWeight']"
                            />

                            <TextInput 
                                v-model="form.maxWeight" 
                                label="أقصى حمولة"
                                placeholder="أدخل أقصى حمولة"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['maxWeight']"
                                @input="delete formErrors['maxWeight']"
                            />

                            <SelectWithIconInput 
                                v-model="form.materialType" 
                                label="نوع المواد"
                                placeholder="اختر نوع المواد"
                                :items="materialTypes"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['materialType']"
                                @update:model-value="delete formErrors['materialType']"
                            />

                            <SelectWithIconInput 
                                v-model="form.truckTypes" 
                                label="نوع الشاحنات"
                                placeholder="اختر نوع الشاحنات"
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

                            <TextInput 
                                v-model="form.tripDuration" 
                                label="مدة الرحلة (ساعة)"
                                placeholder="أدخل مدة الرحلة بالساعات"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['tripDuration']"
                                @input="delete formErrors['tripDuration']"
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
                                v-model="form.price" 
                                label="السعر"
                                placeholder="أدخل السعر"
                                type="number"
                                :rules="[required()]"
                                :hide-details="false"
                                :error-messages="formErrors['price']"
                                @input="delete formErrors['price']"
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
