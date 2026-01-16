<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

interface AccountTypeForm {
  nameAr: string;
  nameEn: string;
  role: string;
  description: string;
  status: boolean;
}

const props = defineProps<{
  modelValue: boolean;
  accountType?: Partial<AccountTypeForm> | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "save", payload: AccountTypeForm): void;
}>();

const internalOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const form = reactive<AccountTypeForm>({
  nameAr: "",
  nameEn: "",
  role: "",
  description: "",
  status: true,
});

const roleItems = [
  { title: "اختر الدور", value: "" },
  { title: "مدير", value: "مدير" },
  { title: "محاسب", value: "محاسب" },
  { title: "موظف", value: "موظف" },
];

const resetForm = () => {
  form.nameAr = "";
  form.nameEn = "";
  form.role = "";
  form.description = "";
  form.status = true;
};

const closeDialog = () => {
  internalOpen.value = false;
};

const handleSave = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  emit("save", { ...form });
};

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;

    if (props.accountType) {
      form.nameAr = props.accountType.nameAr ?? "";
      form.nameEn = props.accountType.nameEn ?? "";
      form.role = props.accountType.role ?? "";
      form.description = props.accountType.description ?? "";
      form.status = props.accountType.status ?? true;
    } else {
      resetForm();
    }
  }
);

const headerIcon = `<svg width="44" height="22" viewBox="0 0 44 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<g style="mix-blend-mode:multiply">
<rect x="0.5" y="0.5" width="43" height="21" rx="3.5" fill="#F8FAFC"/>
<rect x="0.5" y="0.5" width="43" height="21" rx="3.5" stroke="#EEF2F6"/>
<g clip-path="url(#clip0_861_53609)">
<path d="M20.5 10.3143V11.0043C20.4991 12.6216 19.9754 14.1953 19.007 15.4907C18.0386 16.786 16.6775 17.7337 15.1265 18.1922C13.5756 18.6508 11.9179 18.5957 10.4009 18.0352C8.88376 17.4747 7.58849 16.4389 6.70822 15.0821C5.82795 13.7253 5.40984 12.1203 5.51626 10.5065C5.62267 8.89272 6.24791 7.35654 7.29871 6.1271C8.34951 4.89766 9.76959 4.04083 11.3471 3.6844C12.9247 3.32798 14.5752 3.49105 16.0525 4.14929M20.5 5L13 12.5075L10.75 10.2575" stroke="#4B5565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g clip-path="url(#clip1_861_53609)">
<path d="M38.5 10.3143V11.0043C38.4991 12.6216 37.9754 14.1953 37.007 15.4907C36.0386 16.786 34.6775 17.7337 33.1265 18.1922C31.5756 18.6508 29.9179 18.5957 28.4009 18.0352C26.8838 17.4747 25.5885 16.4389 24.7082 15.0821C23.8279 13.7253 23.4098 12.1203 23.5163 10.5065C23.6227 8.89272 24.2479 7.35654 25.2987 6.1271C26.3495 4.89766 27.7696 4.04083 29.3471 3.6844C30.9247 3.32798 32.5752 3.49105 34.0525 4.14929M38.5 5L31 12.5075L28.75 10.2575" stroke="#4B5565" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<defs>
<clipPath id="clip0_861_53609">
<rect width="18" height="18" fill="white" transform="translate(4 2)"/>
</clipPath>
<clipPath id="clip1_861_53609">
<rect width="18" height="18" fill="white" transform="translate(22 2)"/>
</clipPath>
</defs>
</svg>
`
</script>

<template>
  <AppDialog v-model="internalOpen" title="إضافة نوع حساب جديد" :max-width="640">
    <template #title>
      <div class="text-base font-bold text-gray-900 flex items-center gap-2">
        <span class="bg-gray-50 border border-gray-100 rounded text-gray-600">
          <span v-html="headerIcon"></span>
        </span>
        إضافة نوع حساب جديد
      </div>
    </template>

    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <div class="mb-4">
        <LanguageTabs :languages="availableLanguages" label="الإسم">
          <template #en>
            <TextInput v-model="form.nameEn" placeholder="Enter name in English" :hide-details="true" />
          </template>
          <template #ar>
            <TextInput v-model="form.nameAr" placeholder="ادخل الاسم بالعربية" :hide-details="true" />
          </template>
        </LanguageTabs>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2 mb-4">

        <SelectInput v-model="form.role" label="الدور" placeholder="اختر الدور" :items="roleItems"
          :hide-details="false" />

        <div>
          <span class="text-base font-semibold text-gray-700 block mb-1">الحالة</span>
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

        <div class="md:col-span-2 mt-2">
          <TextareaInput v-model="form.description" label="الوصف" placeholder="الوصف" :hide-details="false" />
        </div>
      </div>
    </v-form>

    <template #actions>
      <ButtonWithIcon variant="flat" color="primary" height="44"
        custom-class="font-semibold text-base sm:flex-1" label="حفظ"
        prepend-icon="mdi-plus" @click="handleSave" />
      
      <ButtonWithIcon variant="flat" color="primary-50" height="44"
        custom-class="font-semibold text-base text-primary-700 sm:flex-1"
        label="اغلاق" prepend-icon="mdi-close" @click="closeDialog" />
    </template>
  </AppDialog>
</template>

<style scoped></style>
