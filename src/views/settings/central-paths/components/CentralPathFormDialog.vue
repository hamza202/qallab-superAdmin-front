<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { CheckCircleIcon } from '@/components/icons/globalIcons.ts'

const formErrors = reactive<Record<string, string>>({});

interface PathForm {
    id?: number;
    centralLocation: string | null;
    city: string | null;
    status: boolean;
}

const props = defineProps<{
    modelValue: boolean;
    pathId?: number | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    "saved": [];
}>();

const internalOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
});

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);

const form = reactive<PathForm>({
    centralLocation: null,
    city: null,
    status: true,
});

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
    { title: "أبها", value: "abha" },
    { title: "حائل", value: "hail" },
];

// Demo data for existing paths
const demoPaths = [
    { id: 1, centralLocation: "riyadh-main", city: "riyadh", status: true },
    { id: 2, centralLocation: "jeddah-west", city: "jeddah", status: true },
    { id: 3, centralLocation: "dammam-east", city: "dammam", status: false },
    { id: 4, centralLocation: "makkah-religious", city: "makkah", status: true },
];

const fetchPathData = (pathId: number) => {
    const path = demoPaths.find(p => p.id === pathId);
    if (path) {
        form.id = path.id;
        form.centralLocation = path.centralLocation;
        form.city = path.city;
        form.status = path.status;
    }
};

const resetForm = () => {
    delete form.id;
    form.centralLocation = null;
    form.city = null;
    form.status = true;
};

const closeDialog = () => {
    internalOpen.value = false;
    resetForm();
    Object.keys(formErrors).forEach(key => delete formErrors[key]);
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

        if (form.id) {
            toast.success('تم تحديث المسار المركزي بنجاح');
        } else {
            toast.success('تم إضافة المسار المركزي بنجاح');
        }

        emit('saved');
        closeDialog();
        resetForm();
    } catch (err: any) {
        console.error('Error saving path:', err);
        toast.error('حدث خطأ أثناء حفظ المسار المركزي');
    } finally {
        saving.value = false;
    }
};

watch(
    () => props.modelValue,
    (open) => {
        if (!open) return;

        if (props.pathId) {
            fetchPathData(props.pathId);
        } else {
            resetForm();
        }
    }
);
</script>

<template>
    <AppDialog v-model="internalOpen" title="المسارات المركزية" :max-width="600">
        <template #title>
            <div class="text-base font-bold text-gray-900 flex items-center gap-2">
                <span class="!bg-gray-50 border !border-gray-100 rounded px-1.5 py-1 text-gray-600">
                    <span v-html="CheckCircleIcon"></span>
                </span>
                {{ pathId ? 'تعديل المسار المركزي' : 'إضافة مسار مركزي جديد' }}
            </div>
        </template>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <div class="space-y-4">
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

                <div>
                    <span class="text-sm font-semibold text-gray-700 block mb-1">الحالة</span>
                    <div class="flex items-center gap-3">
                        <v-radio-group v-model="form.status" inline hide-details>
                            <v-radio :value="true" color="primary">
                                <template #label>
                                    <span :class="form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                                        فعال
                                    </span>
                                </template>
                            </v-radio>
                            <v-radio :value="false" color="primary">
                                <template #label>
                                    <span :class="!form.status ? 'text-primary font-semibold' : 'text-gray-600'">
                                        غير فعال
                                    </span>
                                </template>
                            </v-radio>
                        </v-radio-group>
                    </div>
                </div>
            </div>
        </v-form>

        <template #actions>
            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                custom-class="font-semibold text-base sm:flex-1" label="حفظ" prepend-icon="mdi-content-save" @click="handleSave"
                :loading="saving" :disabled="saving" />

            <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
                custom-class="font-semibold text-base text-primary-700 sm:flex-1" label="إلغاء" prepend-icon="mdi-close"
                @click="closeDialog" />
        </template>
    </AppDialog>
</template>
