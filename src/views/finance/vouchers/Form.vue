<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

// TypeScript Interfaces
interface VoucherFormData {
    voucher_type: string;
    client_name: string | null;
    voucher_date: string;
    amount: number | string;
    description: string;
    payment_method: string | null;
    bank_name: string | null;
    account_number: string | null;
    classification: string;
    unit: string;
    debit: number | string;
    credit: number | string;
    current_balance: number | string;
    after_operation_balance: number | string;
}

// Available languages
const availableLanguages = ref([
    { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
    { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

// Check if editing
const isEditing = computed(() => !!route.params.id);

// Voucher type from route (payment-voucher or receipt-voucher)
const voucherType = computed(() => route.params.type as string);
const isPaymentVoucher = computed(() => voucherType.value === 'payment-voucher');
const isReceiptVoucher = computed(() => voucherType.value === 'receipt-voucher');

// Entity type toggle (customer or supplier)
const entityType = ref<'customer' | 'supplier'>('customer');
const entityLabel = computed(() => entityType.value === 'customer' ? 'عميل' : 'مورد');

// Loading states
const loading = ref(false);
const saving = ref(false);

// Form ref
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Form data
const formData = ref<VoucherFormData>({
    voucher_type: "",
    client_name: null,
    voucher_date: "",
    amount: "",
    description: "",
    payment_method: null,
    bank_name: null,
    account_number: null,
    classification: "",
    unit: "",
    debit: "",
    credit: "",
    current_balance: "",
    after_operation_balance: "",
});

// Dropdown options
const paymentMethodItems = ["نقدي", "بنكي", "شيك", "تحويل"];
const classificationItems = ["قطعة", "ضامنة"];
const clients = [
  { title: "اسم العميل", value: "customer1" },
  { title: "اسم العميل 2", value: "customer2" },
];

// Validation rules
const rules = {
    required: (v: any) => !!v || "هذا الحقل مطلوب",
    amount: (v: any) => {
        if (!v) return "هذا الحقل مطلوب";
        if (isNaN(Number(v))) return "يجب أن يكون رقماً";
        if (Number(v) <= 0) return "يجب أن يكون أكبر من صفر";
        return true;
    },
};


// Fetch voucher data for editing
const fetchVoucher = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;
        const response = await api.get(`/admin/api/vouchers/${route.params.id}`);

        if (response.data) {
            formData.value = {
                voucher_type: response.data.voucher_type || "",
                client_name: response.data.client_name || "",
                voucher_date: response.data.voucher_date || "",
                amount: response.data.amount || "",
                description: response.data.description || "",
                payment_method: response.data.payment_method || "",
                bank_name: response.data.bank_name || "",
                account_number: response.data.account_number || "",
                classification: response.data.classification || "",
                unit: response.data.unit || "",
                debit: response.data.debit || "",
                credit: response.data.credit || "",
                current_balance: response.data.current_balance || "",
                after_operation_balance: response.data.after_operation_balance || "",
            };
        }
    } catch (err: any) {
        console.error('Error fetching voucher:', err);
        error(err?.response?.data?.message || 'فشل في تحميل بيانات السند');
    } finally {
        loading.value = false;
    }
};

// Save voucher
const handleSave = async () => {
    try {
        saving.value = true;

        const payload = {
            ...formData.value,
            voucher_type: voucherType.value, // payment-voucher or receipt-voucher
            entity_type: entityType.value, // customer or supplier
        };

        if (isEditing.value) {
            await api.put(`/admin/api/vouchers/${route.params.id}`, payload);
            success('تم تحديث السند بنجاح');
        } else {
            await api.post('/admin/api/vouchers', payload);
            success('تم إضافة السند بنجاح');
        }

        router.push({ name: 'VouchersList' });
    } catch (err: any) {
        console.error('Error saving voucher:', err);
        error(err?.response?.data?.message || 'فشل في حفظ السند');
    } finally {
        saving.value = false;
    }
};

// Cancel and go back
const handleCancel = () => {
    router.push({ name: 'VouchersList' });
};

// Lifecycle
onMounted(() => {
    if (isEditing.value) {
        fetchVoucher();
    }
});

// Vouchers icon
const ReceiptVoucherIcon = `<svg width="41" height="48" viewBox="0 0 41 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.6667 20.4167V12.4C36.6667 8.75966 36.6667 6.93949 35.9582 5.54906C35.335 4.32601 34.3407 3.33163 33.1176 2.70846C31.7272 2 29.907 2 26.2667 2H12.4C8.75966 2 6.93949 2 5.54906 2.70846C4.32601 3.33163 3.33163 4.32601 2.70846 5.54906C2 6.93949 2 8.75966 2 12.4V34.9333C2 38.5737 2 40.3938 2.70846 41.7843C3.33163 43.0073 4.32601 44.0017 5.54906 44.6249C6.93949 45.3333 8.75966 45.3333 12.4 45.3333H19.3333M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M32.3333 43.1667V30.1667M25.8333 36.6667H38.8333" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const PaymentVoucherIcon = `<svg width="41" height="48" viewBox="0 0 41 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.6667 23.5392V12.4C36.6667 8.75966 36.6667 6.93949 35.9582 5.54906C35.335 4.32601 34.3407 3.33163 33.1176 2.70846C31.7272 2 29.907 2 26.2667 2H12.4C8.75966 2 6.93949 2 5.54906 2.70846C4.32601 3.33163 3.33163 4.32601 2.70846 5.54906C2 6.93949 2 8.75966 2 12.4V34.9333C2 38.5737 2 40.3938 2.70846 41.7843C3.33163 43.0073 4.32601 44.0017 5.54906 44.6249C6.93949 45.3333 8.75966 45.3333 12.4 45.3333H23.6667M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M25.8333 34.5H38.8333" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const customerIcon = `<svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 18C3.33579 15.5226 6.50702 14 10 14C13.493 14 16.6642 15.5226 19 18M14.5 5.5C14.5 7.98528 12.4853 10 10 10C7.51472 10 5.5 7.98528 5.5 5.5C5.5 3.01472 7.51472 1 10 1C12.4853 1 14.5 3.01472 14.5 5.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const supplierIcon = `<svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 16L18 13M18 13L21 16M18 13V19M11 13.5H6.5C5.10444 13.5 4.40665 13.5 3.83886 13.6722C2.56045 14.06 1.56004 15.0605 1.17224 16.3389C1 16.9067 1 17.6044 1 19M13.5 5.5C13.5 7.98528 11.4853 10 9 10C6.51472 10 4.5 7.98528 4.5 5.5C4.5 3.01472 6.51472 1 9 1C11.4853 1 13.5 3.01472 13.5 5.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;


</script>
<template>
    <default-layout>
        <div class="voucher-form-page">
            <PageHeader :icon="isReceiptVoucher ? ReceiptVoucherIcon : PaymentVoucherIcon" :title-key="isReceiptVoucher ? 'pages.vouchers_form.receiptVoucherTitle' : 'pages.vouchers_form.paymentVoucherTitle'"
                description-key="pages.vouchers_form.description" />

            <!-- Entity Type Toggle Buttons -->
            <div class="flex gap-2 mb-6 border-y border-gray-200 -mx-6 px-6 py-3">
                <ButtonWithIcon variant="flat" :color="entityType === 'customer' ? 'primary-500' : 'white'" height="50"
                    :custom-class="`px-5 font-semibold text-base ${entityType === 'customer' ? '!text-white' : '!text-gray-400'}`"
                    :prepend-icon="customerIcon" label="عميل" @click="entityType = 'customer'" />
                
                <ButtonWithIcon variant="flat" :color="entityType === 'supplier' ? 'primary-500' : 'white'" height="50"
                    :custom-class="`px-5 font-semibold text-base ${entityType === 'supplier' ? '!text-white' : '!text-gray-400'}`"
                    :prepend-icon="supplierIcon" label="مورد" @click="entityType = 'supplier'" />
            </div>


            <!-- Form Content -->
            <v-form ref="formRef" v-model="isFormValid">
                <!-- Section 1: Basic Information -->
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-bold text-primary-900 mb-5">البيانات الأساسية للسند</h3>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6">
                        <!-- Client/Supplier Name -->
                        <SelectWithIconInput show-add-button v-model="formData.client_name" :label="`اسم ال${entityLabel} *`"
                            :placeholder="`ال${entityLabel} `" :rules="[rules.required]"
                            :items="clients" :hide-details="false"/>

                        <!-- Voucher Date -->
                        <DatePickerInput v-model="formData.voucher_date" label="تاريخ السند *"
                            :rules="[rules.required]" placeholder="اختر التاريخ" hide-details="auto" />

                        <!-- Amount -->
                        <TextInput v-model="formData.amount" label="المبلغ *" placeholder="00.00 ريس"
                            :rules="[rules.amount]" hide-details="auto" />

                        <LanguageTabs :languages="availableLanguages" label="وصف السند" class="md:col-span-2">
                            <template #en>
                                <TextareaInput v-model="formData.description"
                                    placeholder="Enter description in English" min-height="120px" hide-details />
                            </template>
                            <template #ar>
                                <TextareaInput v-model="formData.description" placeholder="ادخل الوصف بالعربية"
                                    min-height="120px" hide-details />
                            </template>
                        </LanguageTabs>
                    </div>
                </div>

                <!-- Section 2: Payment & Accounting -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="col-span-2 bg-gray-50 rounded-lg p-6">
                        <h3 class="text-lg font-bold text-primary-900 mb-6">طريقة الدفع والحسابات</h3>
                        <!-- Left Column -->
                        <div class="grid grid-cols-2 gap-4">
                            <!-- Payment Method -->
                            <SelectInput v-model="formData.payment_method" label="طريقة الدفع *"
                                :items="paymentMethodItems" placeholder="اختر" hide-details="auto" />

                            <!-- Bank Name -->
                            <SelectWithIconInput show-add-button v-model="formData.bank_name" label="اسم البنك"
                                :items="['الراجحي', 'الأهلي', 'الرياض']" placeholder="اختر" hide-details="auto" />

                            <!-- Account (Debit/Credit) -->
                            <SelectWithIconInput show-add-button v-model="formData.account_number" label="الحساب (توجيه المصروف/الإيراد)"
                                :items="[]" placeholder="اختر" hide-details="auto" />
                        </div>

                    </div>

                    <!-- Right Column - Summary Table -->
                    <div class="bg-white rounded-lg overflow-hidden border border-gray-200">
                        <table class="w-full">
                            <!-- Table Header -->
                            <thead>
                                <tr class="bg-primary-400">
                                    <th
                                        class="text-white font-semibold text-base py-3 px-4 text-center border-l border-gray-200">
                                        العنصر
                                    </th>
                                    <th class="text-white font-semibold text-base py-3 px-4 text-center">
                                        القيمة
                                    </th>
                                </tr>
                            </thead>
                            <!-- Table Body -->
                            <tbody class="text-sm bg-primary-50/80">
                                <!-- Received from / Destination -->
                                <tr class="border-b border-gray-200">
                                    <td
                                        class="py-4 px-4 text-center font-bold text-gray-900 border-l border-gray-200">
                                        يستلم من / الوجهة
                                    </td>
                                    <td class="py-4 px-4 text-center text-gray-600">
                                        {{ entityLabel }}
                                    </td>
                                </tr>

                                <!-- Voucher Number -->
                                <tr class="border-b border-gray-200">
                                    <td
                                        class="py-4 px-4 text-center font-bold text-gray-900 border-l border-gray-200">
                                        رقم السند
                                    </td>
                                    <td class="py-4 px-4 text-center text-gray-600">
                                        GFR-2255
                                    </td>
                                </tr>

                                <!-- Classification -->
                                <tr class="border-b border-gray-200">
                                    <td
                                        class="py-4 px-4 text-center font-bold text-gray-900 border-l border-gray-200">
                                        التصنيف
                                    </td>
                                    <td class="py-4 px-4 text-center">
                                        <span :class="isReceiptVoucher ? 'text-success-700 bg-success-50' : 'bg-error-50 text-error-700'" class="font-semibold px-2 rounded-full"
                                            >
                                            {{ isReceiptVoucher ? 'قبض' : 'صرف' }}
                                        </span>
                                    </td>
                                </tr>

                                <!-- Total Amount -->
                                <tr class="border-b border-gray-200">
                                    <td
                                        class="py-4 px-4 text-center font-bold text-gray-900 border-l border-gray-200">
                                        إجمالي السند
                                    </td>
                                    <td class="py-4 px-4 text-center text-gray-600">
                                        {{ formData.amount || '0' }} ريال
                                    </td>
                                </tr>

                                <!-- Current Balance -->
                                <tr class="border-b border-gray-200">
                                    <td
                                        class="py-4 px-4 text-center font-bold text-gray-900 border-l border-gray-200">
                                        الرصيد الحالي لل{{ entityLabel }}
                                    </td>
                                    <td class="py-4 px-4 text-center text-gray-600">
                                        {{ formData.current_balance || '0' }} ريال
                                    </td>
                                </tr>

                                <!-- After Operation Balance -->
                                <tr>
                                    <td
                                        class="py-4 px-4 text-center font-bold text-gray-900 border-l border-gray-200">
                                        الرصيد بعد العملية
                                    </td>
                                    <td class="py-4 px-4 text-center text-gray-600">
                                        {{ formData.after_operation_balance || '0' }} ريال
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </v-form>

            <!-- Action Buttons -->
      <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
          :prepend-icon="saveIcon" label="حفظ" @click="handleSave" />
        
        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
          custom-class="font-semibold text-base text-primary-700 px-6 min-w-56"
          label="إلغاء" @click="handleCancel" />
      </div>


        </div>
    </default-layout>
</template>

<style scoped></style>
