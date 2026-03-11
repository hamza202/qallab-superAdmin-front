<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2, rialIcon, walletIcon, fileIcon, creditCard } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';
import SarIcon from "@/components/icons/SarIcon.vue";

const { formRef, isFormValid, validate } = useForm();
const { success, warning, apiError } = useNotify();

const api = useApi();
const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const routeId = computed(() => route.params.id as string);
const pageLoading = ref(false);
const isSubmitting = ref(false);
const paymentCode = ref('500');
const customerItems = ref<any[]>([]);
const invoiceItems = ref<any[]>([]);
const paymentMethodItems = ref<any[]>([]);
const branchItems = ref<any[]>([]);
const customerData = ref<any>(null);
const invoiceData = ref<any>(null);
const useAvailableBalance = ref(true);
const queryCode = ref('#23525')
interface InvoiceTableItem {
    invoice_id: string;
    invoice_code: string;
    invoice_type: string;
    amount: number;
    currency: string;
    payment_amount: number;
}

interface BalanceItem {
    payment_datetime: string;
    currency: string;
    amount: number;
    direction: string;
}

const getDefaultFormData = () => ({
    customer_id: null,
    payment_method: null,
    invoice_id: null,
    payment_datetime: null as string | null,
    branch: null,
    notes: null as string | null,
    amount: null as number | null,
});

const formData = ref(getDefaultFormData());

const invoiceTableItems = ref<InvoiceTableItem[]>([]);
const balanceTableItems = ref<BalanceItem[]>([]);

const customerBalance = computed(() => customerData.value?.balance || 0);
const clientBalance = computed(() => invoiceData.value?.client_balance || 0);
const availableBalance = computed(() => invoiceData.value?.available_balance || 0);
const amountFromBalance = computed(() => useAvailableBalance.value ? availableBalance.value : 0);

const fetchConstants = async () => {
    try {
        // Demo data for payment methods and branches
        paymentMethodItems.value = [
            { title: 'نقدي', value: 'cash' },
            { title: 'تحويل بنكي', value: 'bank_transfer' },
            { title: 'شيك', value: 'check' },
            { title: 'بطاقة ائتمان', value: 'credit_card' }
        ];

        branchItems.value = [
            { title: 'الفرع الرئيسي', value: 'main' },
            { title: 'فرع الرياض', value: 'riyadh' },
            { title: 'فرع جدة', value: 'jeddah' },
            { title: 'فرع الدمام', value: 'dammam' }
        ];
    } catch (e) {
        console.error('Error fetching constants:', e);
    }
};

const fetchCustomers = async () => {
    try {
        // Demo customers data
        customerItems.value = [
            { title: 'شركة البناء الحديث', value: 1 },
            { title: 'مؤسسة الإنشاءات الذكية', value: 2 },
            { title: 'شركة المقاولات العامة', value: 3 },
            { title: 'مؤسسة التطوير العقاري', value: 4 },
            { title: 'شركة الخليج للإنشاءات', value: 5 }
        ];
    } catch (e) {
        console.error('Error fetching customers:', e);
    }
};

const fetchCustomerDetails = async (customerId: number | string | null) => {
    if (!customerId) {
        customerData.value = null;
        invoiceItems.value = [];
        return;
    }

    try {
        // Demo customer data
        customerData.value = {
            id: customerId,
            full_name: customerItems.value.find(c => c.value === customerId)?.title || 'عميل',
            balance: 150000,
            commercial_register: 'CR-2024-' + customerId,
            address: {
                address_1: 'شارع الملك فهد',
                address_2: 'الرياض، المملكة العربية السعودية'
            }
        };
        await fetchInvoicesByCustomer(customerId);
    } catch (e) {
        console.error('Error fetching customer details:', e);
        customerData.value = null;
    }
};

const fetchInvoicesByCustomer = async (customerId: number | string | null) => {
    if (!customerId) {
        invoiceItems.value = [];
        return;
    }

    try {
        // Demo invoices data based on customer
        invoiceItems.value = [
            { title: 'INV-2024-001', value: 'inv-1' },
            { title: 'INV-2024-002', value: 'inv-2' },
            { title: 'INV-2024-003', value: 'inv-3' }
        ];
    } catch (e) {
        console.error('Error fetching invoices:', e);
        invoiceItems.value = [];
    }
};

const fetchInvoiceDetails = async (invoiceId: number | string | null) => {
    if (!invoiceId) {
        invoiceData.value = null;
        invoiceTableItems.value = [];
        balanceTableItems.value = [];
        return;
    }

    try {
        // Demo invoice data
        invoiceData.value = {
            id: invoiceId,
            code: invoiceItems.value.find(i => i.value === invoiceId)?.title || 'INV-2024-001',
            client_balance: 85000,
            available_balance: 45000,
            total_amount: 120000
        };

        // Demo related invoices
        invoiceTableItems.value = [
            {
                invoice_id: '1',
                invoice_code: 'INV-2024-001',
                invoice_type: 'مبيعات',
                amount: 50000,
                currency: 'ريال',
                payment_amount: 50000
            },
            {
                invoice_id: '2',
                invoice_code: 'INV-2024-002',
                invoice_type: 'مبيعات',
                amount: 35000,
                currency: 'ريال',
                payment_amount: 35000
            }
        ];

        // Demo balance history
        balanceTableItems.value = [
            {
                payment_datetime: '2024-03-10 14:30:00',
                currency: 'ريال',
                amount: 25000,
                direction: 'وارد'
            },
            {
                payment_datetime: '2024-03-08 10:15:00',
                currency: 'ريال',
                amount: 15000,
                direction: 'صادر'
            },
            {
                payment_datetime: '2024-03-05 16:45:00',
                currency: 'ريال',
                amount: 35000,
                direction: 'وارد'
            }
        ];
    } catch (e) {
        console.error('Error fetching invoice details:', e);
        invoiceData.value = null;
    }
};

const fetchFormData = async () => {
    if (!isEditMode.value || !routeId.value) return;

    pageLoading.value = true;
    try {
        // Demo data for edit mode
        const demoEditData = {
            customer_id: 1,
            invoice_id: 'inv-1',
            payment_method: 'bank_transfer',
            payment_datetime: '2024-03-10 14:30:00',
            branch: 'main',
            notes: 'دفعة مقدمة للفاتورة',
            amount: 50000,
            code: 'PAY-2024-001'
        };

        formData.value.customer_id = demoEditData.customer_id;
        formData.value.invoice_id = demoEditData.invoice_id;
        formData.value.payment_method = demoEditData.payment_method;
        formData.value.payment_datetime = demoEditData.payment_datetime;
        formData.value.branch = demoEditData.branch;
        formData.value.notes = demoEditData.notes;
        formData.value.amount = demoEditData.amount;
        paymentCode.value = demoEditData.code;

        if (demoEditData.customer_id) {
            await fetchCustomerDetails(demoEditData.customer_id);
        }
        if (demoEditData.invoice_id) {
            await fetchInvoiceDetails(demoEditData.invoice_id);
        }
    } catch (e) {
        console.error('Error fetching form data:', e);
    } finally {
        pageLoading.value = false;
    }
};

const buildFormData = () => {
    return {
        customer_id: formData.value.customer_id,
        invoice_id: formData.value.invoice_id,
        payment_method: formData.value.payment_method,
        payment_datetime: formData.value.payment_datetime,
        branch: formData.value.branch,
        notes: formData.value.notes,
        amount: formData.value.amount,
        use_available_balance: useAvailableBalance.value,
    };
};

const handleSubmit = async (type: any) => {
    if (!await validate()) return;

    isSubmitting.value = true;
    try {
        const payload = buildFormData();
        if (isEditMode.value) {
            await api.put(`/sales/invoice-payments/${routeId.value}`, payload);
        } else {
            await api.post('/sales/invoice-payments', payload);
        }

        success(isEditMode.value ? 'تم تحديث الدفعة بنجاح' : 'تم إنشاء الدفعة بنجاح');

        if (type === 'createNew') {
            formData.value = getDefaultFormData();
            customerData.value = null;
            invoiceData.value = null;
            invoiceTableItems.value = [];
            balanceTableItems.value = [];
            paymentCode.value = '';
            useAvailableBalance.value = false;
        } else if (type === 'backToList') {
            router.push({ name: 'SalesPaymentsList' });
        }

    } catch (e: any) {
        console.error('Error submitting form:', e);
        apiError(e, 'حدث خطأ أثناء حفظ الدفعة');
    } finally {
        isSubmitting.value = false;
    }
};

const handleCancel = () => {
    router.push({ name: 'SalesPaymentsList' })
}

watch(() => formData.value.customer_id, (newVal) => {
    fetchCustomerDetails(newVal);
    formData.value.invoice_id = null;
});

watch(() => formData.value.invoice_id, (newVal) => {
    fetchInvoiceDetails(newVal);
});

onMounted(async () => {
    pageLoading.value = true;
    await Promise.all([
        fetchConstants(),
        fetchCustomers()
    ]);

    if (isEditMode.value) {
        await fetchFormData();
    }
    pageLoading.value = false;
});

</script>
<template>
    <default-layout>
        <div class="-mx-6 bg-qallab-dashboard-bg space-y-4">
            <TopHeader :icon="fileCheckIcon" title-key="pages.SalesPayments.FormTitle"
                description-key="pages.SalesPayments.FormDescription" :show-action="false">
                <template #code>
                    <div class="flex items-center lg:gap-3 gap-2">

                        <!-- Label -->
                        <span class="text-sm font-semibold text-white">اجمالي المبلغ</span>
                        <!-- Code Badge -->
                        <div
                            class="flex items-center !text-primary-800 gap-2 px-2.5 py-1.5 bg-primary-100 border border-primary-300 rounded shadow-xs">
                            <span v-html="walletIcon"></span>
                            <span class="font-bold dir-ltr">
                                {{ paymentCode }}
                            </span>
                            <SarIcon :width="15" :height="16" color="#1849A9" />
                        </div>
                    </div>
                </template>
            </TopHeader>

            <div class="p-6 bg-white rounded-3xl border !border-gray-100">
                <div class="flex items-center mb-6 gap-2 text-primary-600">
                    <span class="w-4" v-html="fileIcon_2"></span>
                    <h2 class="text-base font-bold">البيانات الأساسية</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
                        <div>
                            <priceInput showRialIcon v-model="formData.amount" placeholder="أدخل قيمة المبلغ"
                                label="المبلغ" density="comfortable" :rules="[required()]" />
                        </div>

                        <div>
                            <DateTimePickerInput v-model="formData.payment_datetime" type="date" density="comfortable"
                                placeholder="2024-03-01" label="تاريخ الدفعة" :rules="[required()]" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.payment_method" :items="paymentMethodItems"
                                placeholder="اختر عملة الدفع" label="العملة" density="comfortable"
                                :rules="[required()]" />
                        </div>


                        <div>
                            <SelectInput v-model="formData.payment_method" :items="paymentMethodItems"
                                placeholder="حدد طريقة الدفع" label="طريقة الدفع" density="comfortable"
                                :rules="[required()]" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.branch" :items="branchItems" placeholder="اختر الفرع"
                                label="الفرع" density="comfortable" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.customer_id" :items="customerItems"
                                placeholder="ادخل الخزينة" label="الخزائن" density="comfortable"
                                :rules="[required()]" />
                        </div>

                        <div class="lg:col-span-2">
                            <TextInput v-model="formData.notes" placeholder="أدخل ملاحظات الدفع" label="ملاحظات الدفع"
                                density="comfortable" />
                        </div>

                    </div>
                </v-form>
            </div>

            <!-- Customer Balance Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="bg-white rounded-3xl border !border-gray-100">
                    <div class="flex  p-6 items-center gap-2 text-primary-600 border-b !border-gray-200">
                        <span v-html="creditCard"></span>
                        <h2 class="text-base font-bold">رصيد العميل</h2>
                    </div>
                    <div class="p-4 space-y-4">
                        <!-- Available Balance Card -->
                        <div
                            class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4 text-white relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12">
                            </div>

                            <div class="relative z-10">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-lg font-semibold">الرصيد المتاح للعميل</h3>
                                </div>

                                <div class="flex items-baseline gap-2 mb-4">
                                    <span class="text-2xl font-bold">325412</span>
                                    <SarIcon :width="20" :height="20" color="white" />
                                </div>

                                <p class="text-gray-300">آخر تحديث: اليوم 12:00</p>
                            </div>
                        </div>

                        <div>
                            <div class="flex items-center gap-2 justify-between">
                                <div>
                                    <p class="font-bold text-gray-700">استخدام الرصيد المتاح</p>
                                    <p class=" text-gray-500">لدفع إجمالي الدفعة</p>
                                </div>
                                <v-switch hide-details inset density="compact" color="primary" class="small-switch" />

                            </div>
                        </div>

                        <div v-if="useAvailableBalance"
                            class="mt-4 bg-warning-100 border !border-warning-600 rounded-2xl px-4 py-3 flex items-center gap-2 justify-between">
                            <p class="text-base font-semibold text-warning-600">المبلغ المستخدم من الرصيد</p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-lg font-bold text-warning-600">500</span>
                                <SarIcon :width="15" :height="15" color="#DC6803" />
                            </div>
                        </div>


                    </div>
                </div>
                <!-- Customer Info Card -->
                <div class="bg-white rounded-3xl border !border-gray-100">
                    <div class="flex items-center gap-2 text-primary-600 p-6 border-b !border-gray-200">
                        <span class="w-5" v-html="fileIcon"></span>
                        <h2 class="text-base font-bold">بيانات العميل</h2>
                    </div>
                    <div class="p-4">
                        <div class="!bg-primary-100 rounded-2xl px-5 py-3 border !border-primary-300 mb-4">
                            <div>
                                <p class="text-lg font-semibold text-gray-900 mb-1">عبد العزيز الإقبالي</p>
                                <p class="text-lg text-primary-600 font-bold">CUST_1211</p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                                <SelectInput v-model="formData.payment_method" label="تم الجمع بواسطة"
                                    :items="paymentMethodItems" placeholder="حساب موردين" density="compact"
                                     />
                                <TextInput v-model="queryCode" label="كود العملية"
                                     disabled density="compact"
                                     />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-3 flex items-center justify-center gap-3">
                <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                    <ButtonWithIcon variant="flat" color="primary" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base px-6 md:!px-10" :prepend-icon="returnIcon"
                        label="حفظ والعودة للرئيسية" @click="handleSubmit('backToList')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        label="حفظ وإنشاء جديد" @click="handleSubmit('createNew')" />

                    <ButtonWithIcon variant="flat" color="gray-100" rounded="4" height="48" prepend-icon="mdi-close"
                        custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
                        @click="handleCancel" />

                </div>
            </div>
        </div>

        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>
