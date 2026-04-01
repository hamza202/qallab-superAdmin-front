<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';
import { useApi } from '@/composables/useApi';
import { returnIcon, saveIcon, fileCheckIcon, fileIcon_2, rialIcon, walletIcon, fileIcon, creditCard } from '@/components/icons/globalIcons';
import { useForm } from '@/composables/useForm';
import { useNotification as useNotify } from '@/composables/useNotification';
import SarIcon from "@/components/icons/SarIcon.vue";

const { formRef, isFormValid, validate } = useForm();
const { success, warning, apiError } = useNotify();

const { t } = useI18n();
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
            { title: t('sales.forms.paymentsDemo.cash'), value: 'cash' },
            { title: t('sales.forms.paymentsDemo.bankTransfer'), value: 'bank_transfer' },
            { title: t('sales.forms.paymentsDemo.check'), value: 'check' },
            { title: t('sales.forms.paymentsDemo.creditCard'), value: 'credit_card' }
        ];

        branchItems.value = [
            { title: t('sales.forms.paymentsDemo.branchMain'), value: 'main' },
            { title: t('sales.forms.paymentsDemo.branchRiyadh'), value: 'riyadh' },
            { title: t('sales.forms.paymentsDemo.branchJeddah'), value: 'jeddah' },
            { title: t('sales.forms.paymentsDemo.branchDammam'), value: 'dammam' }
        ];
    } catch (e) {
        console.error('Error fetching constants:', e);
    }
};

const fetchCustomers = async () => {
    try {
        // Demo customers data
        customerItems.value = [
            { title: t('sales.forms.paymentsDemo.company1'), value: 1 },
            { title: t('sales.forms.paymentsDemo.company2'), value: 2 },
            { title: t('sales.forms.paymentsDemo.company3'), value: 3 },
            { title: t('sales.forms.paymentsDemo.company4'), value: 4 },
            { title: t('sales.forms.paymentsDemo.company5'), value: 5 }
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
            full_name: customerItems.value.find(c => c.value === customerId)?.title || t('sales.forms.paymentsDemo.customerFallback'),
            balance: 150000,
            commercial_register: 'CR-2024-' + customerId,
            address: {
                address_1: t('sales.forms.paymentsDemo.demoAddress1'),
                address_2: t('sales.forms.paymentsDemo.demoCityCountry')
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
                invoice_type: t('sales.forms.paymentsDemo.invoiceTypeSales'),
                amount: 50000,
                currency: t('sales.forms.paymentsDemo.currencySar'),
                payment_amount: 50000
            },
            {
                invoice_id: '2',
                invoice_code: 'INV-2024-002',
                invoice_type: t('sales.forms.paymentsDemo.invoiceTypeSales'),
                amount: 35000,
                currency: t('sales.forms.paymentsDemo.currencySar'),
                payment_amount: 35000
            }
        ];

        // Demo balance history
        balanceTableItems.value = [
            {
                payment_datetime: '2024-03-10 14:30:00',
                currency: t('sales.forms.paymentsDemo.currencySar'),
                amount: 25000,
                direction: t('sales.forms.paymentsDemo.directionInbound')
            },
            {
                payment_datetime: '2024-03-08 10:15:00',
                currency: t('sales.forms.paymentsDemo.currencySar'),
                amount: 15000,
                direction: t('sales.forms.paymentsDemo.directionOutbound')
            },
            {
                payment_datetime: '2024-03-05 16:45:00',
                currency: t('sales.forms.paymentsDemo.currencySar'),
                amount: 35000,
                direction: t('sales.forms.paymentsDemo.directionInbound')
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
            notes: t('sales.forms.paymentsDemo.noteAdvance'),
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

        success(isEditMode.value ? t('sales.forms.common.messages.paymentUpdated') : t('sales.forms.common.messages.paymentCreated'));

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
        apiError(e, t('sales.forms.common.messages.savePaymentError'));
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
            <AppFormBreadcrumb
                list-path="/sales/payments/list"
                module-root-key="breadcrumb.sales.root"
                list-label-key="breadcrumb.sales.payments.list"
                create-label-key="breadcrumb.sales.payments.create"
                edit-label-key="breadcrumb.sales.payments.edit"
                :is-edit-mode="isEditMode"
                :code="paymentCode"
            />
            <TopHeader :icon="fileCheckIcon" title-key="pages.SalesPayments.FormTitle"
                description-key="pages.SalesPayments.FormDescription" :show-action="false">
                <template #code>
                    <div class="flex items-center lg:gap-3 gap-2">

                        <!-- Label -->
                        <span class="text-sm font-semibold text-white">{{ t('sales.forms.common.labels.totalAmountHeader') }}</span>
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
                    <h2 class="text-base font-bold">{{ t('sales.forms.common.sections.basicData') }}</h2>
                </div>

                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
                        <div>
                            <priceInput showRialIcon v-model="formData.amount" :placeholder="t('sales.forms.common.placeholders.enterPaymentAmountValue')"
                                :label="t('sales.forms.common.labels.amount')" density="comfortable" :rules="[required()]" />
                        </div>

                        <div>
                            <DateTimePickerInput v-model="formData.payment_datetime" type="date" density="comfortable"
                                :placeholder="t('sales.forms.common.placeholders.dateSample')" :label="t('sales.forms.common.labels.paymentDate')" :rules="[required()]" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.payment_method" :items="paymentMethodItems"
                                :placeholder="t('sales.forms.common.placeholders.selectCurrency')" :label="t('sales.forms.common.labels.currency')" density="comfortable"
                                :rules="[required()]" />
                        </div>


                        <div>
                            <SelectInput v-model="formData.payment_method" :items="paymentMethodItems"
                                :placeholder="t('sales.forms.common.placeholders.selectPaymentMethod')" :label="t('sales.forms.common.labels.paymentMethod')" density="comfortable"
                                :rules="[required()]" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.branch" :items="branchItems" :placeholder="t('sales.forms.common.placeholders.selectBranch')"
                                :label="t('sales.forms.common.labels.branch')" density="comfortable" />
                        </div>

                        <div>
                            <SelectInput v-model="formData.customer_id" :items="customerItems"
                                :placeholder="t('sales.forms.common.placeholders.selectTreasury')" :label="t('sales.forms.common.labels.treasuries')" density="comfortable"
                                :rules="[required()]" />
                        </div>

                        <div class="lg:col-span-2">
                            <TextInput v-model="formData.notes" :placeholder="t('sales.forms.common.placeholders.paymentNotes')" :label="t('sales.forms.common.labels.paymentNotes')"
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
                        <h2 class="text-base font-bold">{{ t('sales.forms.common.labels.customerBalance') }}</h2>
                    </div>
                    <div class="p-4 space-y-4">
                        <!-- Available Balance Card -->
                        <div
                            class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4 text-white relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -ms-16 -mt-16"></div>
                            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -me-12 -mb-12">
                            </div>

                            <div class="relative z-10">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-lg font-semibold">{{ t('sales.forms.common.labels.availableBalanceForCustomer') }}</h3>
                                </div>

                                <div class="flex items-baseline gap-2 mb-4">
                                    <span class="text-2xl font-bold">325412</span>
                                    <SarIcon :width="20" :height="20" color="white" />
                                </div>

                                <p class="text-gray-300">{{ t('sales.forms.common.misc.demoBalanceLastUpdated') }}</p>
                            </div>
                        </div>

                        <div>
                            <div class="flex items-center gap-2 justify-between">
                                <div>
                                    <p class="font-bold text-gray-700">{{ t('sales.forms.common.labels.useAvailableBalance') }}</p>
                                    <p class=" text-gray-500">{{ t('sales.forms.common.labels.forPayingFullPayment') }}</p>
                                </div>
                                <v-switch hide-details inset density="compact" color="primary" class="small-switch" />

                            </div>
                        </div>

                        <div v-if="useAvailableBalance"
                            class="mt-4 bg-warning-100 border !border-warning-600 rounded-2xl px-4 py-3 flex items-center gap-2 justify-between">
                            <p class="text-base font-semibold text-warning-600">{{ t('sales.forms.common.labels.amountUsedFromBalance') }}</p>
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
                        <h2 class="text-base font-bold">{{ t('sales.forms.common.labels.customerDetailsSection') }}</h2>
                    </div>
                    <div class="p-4">
                        <div class="!bg-primary-100 rounded-2xl px-5 py-3 border !border-primary-300 mb-4">
                            <div>
                                <p class="text-lg font-semibold text-gray-900 mb-1">{{ t('sales.forms.paymentsDemo.demoCustomerDisplayName') }}</p>
                                <p class="text-lg text-primary-600 font-bold">CUST_1211</p>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                                <SelectInput v-model="formData.payment_method" :label="t('sales.forms.common.labels.collectedBy')"
                                    :items="paymentMethodItems" :placeholder="t('sales.forms.common.placeholders.supplierAccountPlaceholder')" density="compact"
                                     />
                                <TextInput v-model="queryCode" :label="t('sales.forms.common.labels.operationCode')"
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
                        :label="t('sales.forms.common.actions.saveBackHome')" @click="handleSubmit('backToList')" />

                    <ButtonWithIcon variant="flat" color="primary-50" height="48" rounded="4" :loading="isSubmitting"
                        custom-class="font-semibold text-base text-primary-700 px-6 md:!px-10" :prepend-icon="saveIcon"
                        :label="t('sales.forms.common.actions.saveCreateNew')" @click="handleSubmit('createNew')" />

                    <ButtonWithIcon variant="flat" color="gray-100" rounded="4" height="48" prepend-icon="mdi-close"
                        custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" :label="t('common.actions.close')"
                        @click="handleCancel" />

                </div>
            </div>
        </div>

        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </default-layout>
</template>
