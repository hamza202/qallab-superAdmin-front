<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useApi } from "@/composables/useApi";

import { CheckCircleIcon } from '@/components/icons/globalIcons.ts'
const api = useApi();

const formErrors = reactive<Record<string, string>>({});

const availableLanguages = ref([
    { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
    { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface StatusForm {
    id?: number;
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    color: string;
    status: boolean;
}

const props = defineProps<{
    modelValue: boolean;
    statusId?: number | null;
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
const loadingStatusData = ref(false);
const saving = ref(false);

const form = reactive<StatusForm>({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    color: "#1E88E5",
    status: true,
});

const fetchStatusData = async (statusId: number) => {
    try {
        loadingStatusData.value = true;
        const response = await api.get(`/system-statuses/${statusId}`);
        const status = response.data;

        form.id = status.id;
        form.nameAr = status.name_translations?.ar || status.name;
        form.nameEn = status.name_translations?.en || status.name;
        form.descriptionAr = status.description_translations?.ar || status.description || "";
        form.descriptionEn = status.description_translations?.en || status.description || "";
        form.color = status.color || "#1E88E5";
        form.status = Boolean(status.is_active);
    } catch (err: any) {
        console.error('Error fetching status details:', err);
        toast.error(err?.response?.data?.message || 'Failed to fetch status details');
        internalOpen.value = false;
    } finally {
        loadingStatusData.value = false;
    }
};

const resetForm = () => {
    delete form.id;
    form.nameAr = "";
    form.nameEn = "";
    form.descriptionAr = "";
    form.descriptionEn = "";
    form.color = "#1E88E5";
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

        const payload = {
            name: {
                en: form.nameEn,
                ar: form.nameAr,
            },
            description: {
                en: form.descriptionEn,
                ar: form.descriptionAr,
            },
            color: form.color,
            is_active: form.status,
        };

        if (form.id) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('name[en]', form.nameEn);
            formData.append('name[ar]', form.nameAr);
            formData.append('description[en]', form.descriptionEn);
            formData.append('description[ar]', form.descriptionAr);
            formData.append('color', form.color);
            formData.append('is_active', form.status ? '1' : '0');

            await api.post(`/system-statuses/${form.id}`, formData);
            toast.success('تم تحديث حالة النظام بنجاح');
        } else {
            await api.post('/system-statuses', payload);
            toast.success('تم إضافة حالة النظام بنجاح');
        }

        emit('saved');
        closeDialog();
        resetForm();
    } catch (err: any) {
        console.error('Error saving status:', err);

        if (err?.response?.status === 422 && err?.response?.data?.errors) {
            const apiErrors = err.response.data.errors;
            Object.keys(apiErrors).forEach(key => {
                formErrors[key] = apiErrors[key][0];
            });
            toast.error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
        } else {
            toast.error(err?.response?.data?.message || 'Failed to save status');
        }
    } finally {
        saving.value = false;
    }
};

watch(
    () => props.modelValue,
    (open) => {
        if (!open) return;

        if (props.statusId) {
            fetchStatusData(props.statusId);
        } else {
            resetForm();
        }
    }
);
</script>

<template>
    <AppDialog v-model="internalOpen" title="إضافة حالة جديدة" :max-width="600">
        <template #title>
            <div class="text-base font-bold text-gray-900 flex items-center gap-2">
                <span class="!bg-gray-50 border !border-gray-100 rounded px-1.5 py-1 text-gray-600">
                    <span v-html="CheckCircleIcon"></span>
                </span>
                {{ statusId ? 'تعديل الحالة' : 'إضافة حالة جديدة' }}

            </div>
        </template>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <div v-if="loadingStatusData" class="flex justify-center items-center py-12">
                <v-progress-circular indeterminate color="primary" size="48" />
            </div>

            <div v-else>
                <div class=" mb-2">
                    <LanguageTabs :languages="availableLanguages" label="الإسم">
                        <template #en>
                            <TextInput v-model="form.nameEn" placeholder="Enter name in English"
                                :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                                :error-messages="formErrors['name.en']" @input="delete formErrors['name.en']" />
                        </template>
                        <template #ar>
                            <TextInput v-model="form.nameAr" placeholder="ادخل الاسم بالعربية"
                                :rules="[required(), minLength(2), maxLength(100)]" :hide-details="false"
                                :error-messages="formErrors['name.ar']" @input="delete formErrors['name.ar']" />
                        </template>
                    </LanguageTabs>
                </div>

                <div class="mb-4">
                    <LanguageTabs :languages="availableLanguages" label="الوصف">
                        <template #en>
                            <TextareaInput v-model="form.descriptionEn" placeholder="الوصف بالإنجليزية" :rows="4"
                                :hide-details="true" />
                        </template>
                        <template #ar>
                            <TextareaInput v-model="form.descriptionAr" placeholder="الوصف بالعربية" :rows="4"
                                :hide-details="true" />
                        </template>
                    </LanguageTabs>

                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    <ColorPickerInput v-model="form.color" label="اللون" />
                </div>

            </div>
        </v-form>

        <template #actions>
            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                custom-class="font-semibold text-base sm:flex-1" label="حفظ" prepend-icon="mdi-plus" @click="handleSave"
                :loading="saving" :disabled="saving" />

            <ButtonWithIcon variant="flat" color="primary-50" height="44" rounded="4"
                custom-class="font-semibold text-base text-primary-700 sm:flex-1" label="إغلاق" prepend-icon="mdi-close"
                @click="closeDialog" />
        </template>
    </AppDialog>
</template>
