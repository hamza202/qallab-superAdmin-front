<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useApi } from "@/composables/useApi";
import BasicInfoTab from "./components/BasicInfoTab.vue";
import FinancialInfoTab, { LogisticBankAccount } from './components/FinancialInfoTab.vue';
import CommercialInfoTab from "./components/CommercialInfoTab.vue";
import OperationalInfoTab from "./components/OperationalInfoTab.vue";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { saveIcon } from "@/components/icons/globalIcons";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter();
const route = useRoute();
const api = useApi();

const factoryIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.96927 23.8333L16.2526 23.8333L16.2526 13.4333C16.2526 11.0064 16.2526 9.79299 16.7249 8.86604C17.1404 8.05067 17.8033 7.38776 18.6186 6.97231C19.5456 6.5 20.759 6.5 23.1859 6.5L28.8193 6.5C31.2462 6.5 32.4596 6.5 33.3866 6.97231C34.2019 7.38776 34.8648 8.05067 35.2803 8.86604C35.7526 9.79299 35.7526 11.0064 35.7526 13.4333V23.8333L42.0359 23.8333C43.2494 23.8333 43.8561 23.8333 44.3196 24.0695C44.7273 24.2772 45.0587 24.6087 45.2664 25.0164C45.5026 25.4798 45.5026 26.0866 45.5026 27.3L45.5026 45.5H35.7526L16.2526 45.5H6.5026L6.5026 27.3C6.5026 26.0866 6.5026 25.4798 6.73876 25.0164C6.94648 24.6087 7.27794 24.2772 7.68562 24.0695C8.1491 23.8333 8.75582 23.8333 9.96927 23.8333Z" fill="#EFF8FF"/>
<path d="M16.2526 23.8333L9.96927 23.8333C8.75582 23.8333 8.1491 23.8333 7.68562 24.0695C7.27794 24.2772 6.94648 24.6087 6.73876 25.0164C6.5026 25.4798 6.5026 26.0866 6.5026 27.3L6.5026 45.5M35.7526 23.8333L42.0359 23.8333C43.2494 23.8333 43.8561 23.8333 44.3196 24.0695C44.7273 24.2772 45.0587 24.6087 45.2664 25.0164C45.5026 25.4798 45.5026 26.0866 45.5026 27.3L45.5026 45.5M35.7526 45.5L35.7526 13.4333C35.7526 11.0064 35.7526 9.79299 35.2803 8.86604C34.8648 8.05067 34.2019 7.38776 33.3866 6.97231C32.4596 6.5 31.2462 6.5 28.8193 6.5L23.1859 6.5C20.759 6.5 19.5456 6.5 18.6186 6.97231C17.8033 7.38776 17.1404 8.05067 16.7249 8.86604C16.2526 9.79299 16.2526 11.0064 16.2526 13.4333L16.2526 45.5M47.6693 45.5L4.33594 45.5M23.8359 15.1667H28.1693M23.8359 23.8333H28.1693M23.8359 32.5H28.1693" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const factoryId = ref<number | null>(null);

const isEditing = computed(() => !!route.params.id);

/** When true, factory payload (incl. country_id / city_id) load attempt finished — safe for lazy lists. */
const factoryAddressListsReady = ref(false);

async function waitForFactoryAddressLists() {
    if (!isEditing.value) return;
    await new Promise<void>((resolve) => {
        if (factoryAddressListsReady.value) {
            resolve();
            return;
        }
        const stop = watch(factoryAddressListsReady, (ok) => {
            if (ok) {
                stop();
                resolve();
            }
        });
    });
}

const formRef = ref<any>(null);
const isFormValid = ref(false);
const formErrors = reactive<Record<string, string>>({});
const hasValidationErrors = ref(false);

const activeTab = ref(0);
const tabs = computed(() => [
    { title: t('pages.factories.form.tabs.basicInfo'), value: 0 },
    { title: t('pages.factories.form.tabs.financialInfo'), value: 1 },
    { title: t('pages.factories.form.tabs.commercialInfo'), value: 2 },
    { title: t('pages.factories.form.tabs.operationalInfo'), value: 3 },
]);

const isTabActive = (value: number) => activeTab.value === value;

const handleTabChange = (newTab: number) => {
    activeTab.value = newTab;
};

// Step 1: Basic Info
const businessNameTranslations = ref({ ar: "", en: "" });
const tradeNameTranslations = ref({ ar: "", en: "" });
const ownerCompanyName = ref("");
const mobile = ref("");
const phone = ref("");
const email = ref("");
const buisnessno = ref<string>("");
const taxno = ref("");
const unifiedLoginId = ref("");
const languageId = ref<number | null>(null);

const countryId = ref<number | null>(null);
const cityId = ref<number | null>(null);
const neighborhood = ref("");
const streetName = ref("");
const postalCode = ref("");
const buildingNumber = ref("");
const address1 = ref("");

// Step 2: Financial Info
const bankAccounts = ref<LogisticBankAccount[]>([]);
const debitLimit = ref('');
const creditLimit = ref('');

// Step 3: Commercial Info
const licenseType = ref<string | null>(null);
const licenseNumber = ref("");
const issuingAuthority = ref<string | null>(null);
const issueDate = ref("");
const expiryDate = ref("");
const licenseStatus = ref<string | null>(null);
const licensedActivity = ref<string | null>(null);
const activityTypes = ref<string[]>([]);
const productTypes = ref<number[]>([]);
const rawMaterialTypes = ref<string[]>([]);
const rawMaterialSource = ref<string | null>(null);
const licensedCapacity = ref<number | null>(null);

// Step 4: Operational Info
const productionLinesCount = ref<number | null>(null);
const operationalReadiness = ref<string | null>(null);
const operationalStatus = ref<string | null>(null);
const totalWorkers = ref<number | null>(null);
const engineersCount = ref<number | null>(null);
const techniciansCount = ref<number | null>(null);
const qualityControlSystem = ref<string | null>(null);
const qualityLabAvailability = ref<boolean>(false);
const safetySystem = ref<string | null>(null);
const workingHours = ref<string | null>(null);
const equipmentType = ref<string[]>([]);
const operationMode = ref<string | null>(null);
const maintenanceSystem = ref<string | null>(null);
const weighbridgeAvailability = ref<boolean>(false);
const weighbridgeType = ref<string | null>(null);

const pageLoading = ref(false);

const constants = ref<any>({});

const languageItems = ref<Array<{ title: string; value: number }>>([]);
const bankItems = ref<Array<{ title: string; value: number }>>([]);
const productTypesItems = ref<Array<{ title: string; value: number }>>([]);

// Computed items from constants - Step 3
const licenseTypeItems = computed(() =>
  constants.value.license_type?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const issuingAuthorityItems = computed(() =>
  constants.value.issuing_authority?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const licenseStatusItems = computed(() =>
  constants.value.license_status?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const licensedActivityItems = computed(() =>
  constants.value.licensed_activity?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const activityTypesItems = computed(() =>
  constants.value.activity_types?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const rawMaterialTypesItems = computed(() =>
  constants.value.raw_material_types?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const rawMaterialSourceItems = computed(() =>
  constants.value.raw_material_source?.map((item: any) => ({ title: item.label, value: item.key })) || []
);

// Computed items from constants - Step 4
const operationalReadinessItems = computed(() =>
  constants.value.operational_readiness?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const operationalStatusItems = computed(() =>
  constants.value.operational_status?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const qualityControlSystemItems = computed(() =>
  constants.value.quality_control_system?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const safetySystemItems = computed(() =>
  constants.value.safety_system?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const workingHoursItems = computed(() =>
  constants.value.working_hours?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const equipmentTypesItems = computed(() =>
  constants.value.equipment_types?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const operationModeItems = computed(() =>
  constants.value.operation_mode?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const maintenanceSystemItems = computed(() =>
  constants.value.maintenance_system?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const weighbridgeTypeItems = computed(() =>
  constants.value.weighbridge_type?.map((item: any) => ({ title: item.label, value: item.key })) || []
);

const saving = ref(false);

const handleSave = async () => {
    try {
        Object.keys(formErrors).forEach(key => delete formErrors[key]);

        saving.value = true;

        const stepMapping = [1, 2, 3, 4];
        const step = stepMapping[activeTab.value];
        const payload: any = { step };

        payload._method = 'PUT';

        // Step 1: Basic Info
        if (step === 1) {
            if (ownerCompanyName.value) payload.owner_company_name = ownerCompanyName.value;
            payload.trade_name = {
                en: tradeNameTranslations.value.en || '',
                ar: tradeNameTranslations.value.ar || ''
            };
            if (buisnessno.value) payload.commercial_register = String(buisnessno.value);
            if (taxno.value) payload.tax_register = String(taxno.value);
            if (unifiedLoginId.value) payload.unified_login_id = String(unifiedLoginId.value);
            if (phone.value) payload.phone = phone.value;
            if (email.value) payload.email = email.value;
            if (mobile.value) payload.mobile = mobile.value;
            if (countryId.value) payload.country_id = countryId.value;
            if (cityId.value) payload.city_id = cityId.value;
            if (neighborhood.value) payload.neighborhood = neighborhood.value;
            if (streetName.value) payload.street_name = streetName.value;
            if (buildingNumber.value) payload.building_number = buildingNumber.value;
            if (postalCode.value) payload.postal_code = postalCode.value;
            if (address1.value) payload.address_1 = address1.value;
            if (languageId.value) payload.language_id = languageId.value;
        }

        // Step 2: Financial Info
        if (step === 2) {
            if (debitLimit.value) payload.debit_limit = debitLimit.value;
            if (creditLimit.value) payload.credit_limit = creditLimit.value;
            payload.bank_accounts = bankAccounts.value.map(account => {
                const accountData: any = {
                    bank_id: account.bank_id,
                    bank_branch: account.bank_branch,
                    iban: account.iban,
                    account_number: account.account_number,
                    is_active: account.is_active
                };
                if (account.id !== null && account.id !== undefined && String(account.id).length <= 5) {
                    accountData.id = account.id;
                }
                return accountData;
            });
        }

        // Step 3: Commercial Info
        if (step === 3) {
            if (licenseType.value) payload.license_type = licenseType.value;
            if (licenseNumber.value) payload.license_number = licenseNumber.value;
            if (issuingAuthority.value) payload.issuing_authority = issuingAuthority.value;
            if (issueDate.value) payload.issue_date = issueDate.value;
            if (expiryDate.value) payload.expiry_date = expiryDate.value;
            if (licenseStatus.value) payload.license_status = licenseStatus.value;
            if (licensedActivity.value) payload.licensed_activity = licensedActivity.value;
            if (activityTypes.value.length) payload.activity_types = activityTypes.value;
            if (productTypes.value.length) payload.product_types = productTypes.value;
            if (rawMaterialTypes.value.length) payload.raw_material_types = rawMaterialTypes.value;
            if (rawMaterialSource.value) payload.raw_material_source = rawMaterialSource.value;
            if (licensedCapacity.value !== null) payload.licensed_capacity = licensedCapacity.value;
        }

        // Step 4: Operational Info
        if (step === 4) {
            if (productionLinesCount.value !== null) payload.production_lines_count = productionLinesCount.value;
            if (operationalStatus.value) payload.operational_status = operationalStatus.value;
            if (totalWorkers.value !== null) payload.total_workers = totalWorkers.value;
            if (engineersCount.value !== null) payload.engineers_count = engineersCount.value;
            if (techniciansCount.value !== null) payload.technicians_count = techniciansCount.value;
            if (qualityControlSystem.value) payload.quality_control_system = qualityControlSystem.value;
            payload.quality_lab_availability = qualityLabAvailability.value;
            if (safetySystem.value) payload.safety_system = safetySystem.value;
            if (workingHours.value) payload.working_hours = workingHours.value;
            if (equipmentType.value.length) payload.equipment_type = equipmentType.value;
            if (operationMode.value) payload.operation_mode = operationMode.value;
            if (maintenanceSystem.value) payload.maintenance_system = maintenanceSystem.value;
            payload.weighbridge_availability = weighbridgeAvailability.value;
            if (weighbridgeType.value) payload.weighbridge_type = weighbridgeType.value;
        }

        const response: any = await api.post(`/factories/${factoryId.value}`, payload);

        const stepMessages: Record<number, string> = {
            1: t('pages.factories.form.messages.basicInfoSaved'),
            2: t('pages.factories.form.messages.financialInfoSaved'),
            3: t('pages.factories.form.messages.commercialInfoSaved'),
            4: t('pages.factories.form.messages.operationalInfoSaved')
        };

        hasValidationErrors.value = false;
        Object.keys(formErrors).forEach(key => delete formErrors[key]);

        toast.success(response.message || stepMessages[step]);

        if (activeTab.value < 3) {
            activeTab.value = activeTab.value + 1;
        } else if (activeTab.value === 3) {
            activeTab.value = 0;
        }
    } catch (err: any) {
        console.error('Error saving factory:', err);

        if (err?.response?.status === 422 && err?.response?.data?.errors) {
            hasValidationErrors.value = true;
            const apiErrors = err.response.data.errors;
            Object.keys(apiErrors).forEach(key => {
                formErrors[key] = apiErrors[key][0];
            });
        } else {
            toast.error(err?.response?.data?.message || t('pages.factories.form.messages.saveError'));
        }
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push({ name: 'Dashboard' });
};

const handleBasicInfoUpdate = (data: any) => {
    if (data.businessNameTranslations !== undefined) businessNameTranslations.value = data.businessNameTranslations;
    if (data.tradeNameTranslations !== undefined) tradeNameTranslations.value = data.tradeNameTranslations;
    if (data.ownerCompanyName !== undefined) ownerCompanyName.value = data.ownerCompanyName;
    if (data.mobile !== undefined) mobile.value = data.mobile;
    if (data.phone !== undefined) phone.value = data.phone;
    if (data.email !== undefined) email.value = data.email;
    if (data.buisnessno !== undefined) buisnessno.value = data.buisnessno;
    if (data.taxno !== undefined) taxno.value = data.taxno;
    if (data.unifiedLoginId !== undefined) unifiedLoginId.value = data.unifiedLoginId;
    if (data.countryId !== undefined) countryId.value = data.countryId;
    if (data.cityId !== undefined) cityId.value = data.cityId;
    if (data.neighborhood !== undefined) neighborhood.value = data.neighborhood;
    if (data.streetName !== undefined) streetName.value = data.streetName;
    if (data.postalCode !== undefined) postalCode.value = data.postalCode;
    if (data.buildingNumber !== undefined) buildingNumber.value = data.buildingNumber;
    if (data.address1 !== undefined) address1.value = data.address1;
    if (data.languageId !== undefined) languageId.value = data.languageId;
};

const clearFieldError = (field: string) => {
    if (formErrors[field]) {
        delete formErrors[field];
    }
    if (Object.keys(formErrors).length === 0) {
        hasValidationErrors.value = false;
    }
};

const handleFinancialInfoUpdate = (data: any) => {
    if (data.bankAccounts !== undefined) bankAccounts.value = data.bankAccounts;
    if (data.debitLimit !== undefined) debitLimit.value = data.debitLimit;
    if (data.creditLimit !== undefined) creditLimit.value = data.creditLimit;
};

const handleCommercialInfoUpdate = (data: any) => {
    if (data.licenseType !== undefined) licenseType.value = data.licenseType;
    if (data.licenseNumber !== undefined) licenseNumber.value = data.licenseNumber;
    if (data.issuingAuthority !== undefined) issuingAuthority.value = data.issuingAuthority;
    if (data.issueDate !== undefined) issueDate.value = data.issueDate;
    if (data.expiryDate !== undefined) expiryDate.value = data.expiryDate;
    if (data.licenseStatus !== undefined) licenseStatus.value = data.licenseStatus;
    if (data.licensedActivity !== undefined) licensedActivity.value = data.licensedActivity;
    if (data.activityTypes !== undefined) activityTypes.value = data.activityTypes;
    if (data.productTypes !== undefined) productTypes.value = data.productTypes;
    if (data.rawMaterialTypes !== undefined) rawMaterialTypes.value = data.rawMaterialTypes;
    if (data.rawMaterialSource !== undefined) rawMaterialSource.value = data.rawMaterialSource;
    if (data.licensedCapacity !== undefined) licensedCapacity.value = data.licensedCapacity;
};

const handleOperationalInfoUpdate = (data: any) => {
    if (data.productionLinesCount !== undefined) productionLinesCount.value = data.productionLinesCount;
    if (data.operationalReadiness !== undefined) operationalReadiness.value = data.operationalReadiness;
    if (data.operationalStatus !== undefined) operationalStatus.value = data.operationalStatus;
    if (data.totalWorkers !== undefined) totalWorkers.value = data.totalWorkers;
    if (data.engineersCount !== undefined) engineersCount.value = data.engineersCount;
    if (data.techniciansCount !== undefined) techniciansCount.value = data.techniciansCount;
    if (data.qualityControlSystem !== undefined) qualityControlSystem.value = data.qualityControlSystem;
    if (data.qualityLabAvailability !== undefined) qualityLabAvailability.value = data.qualityLabAvailability;
    if (data.safetySystem !== undefined) safetySystem.value = data.safetySystem;
    if (data.workingHours !== undefined) workingHours.value = data.workingHours;
    if (data.equipmentType !== undefined) equipmentType.value = data.equipmentType;
    if (data.operationMode !== undefined) operationMode.value = data.operationMode;
    if (data.maintenanceSystem !== undefined) maintenanceSystem.value = data.maintenanceSystem;
    if (data.weighbridgeAvailability !== undefined) weighbridgeAvailability.value = data.weighbridgeAvailability;
    if (data.weighbridgeType !== undefined) weighbridgeType.value = data.weighbridgeType;
};

const fetchFactoryData = async () => {
    if (hasValidationErrors.value) return;

    try {
        const routeFactoryId = route.params.id;
        if (!routeFactoryId) {
            toast.error(t('pages.factories.form.messages.loadError'));
            return;
        }

        const response = await api.get(`/factories/${routeFactoryId}`);
        const data = response.data;

        factoryId.value = data.id;

        // Step 1: Basic Info
        ownerCompanyName.value = data.owner_company_name || '';
        if (data.business_name_translations) {
            businessNameTranslations.value = data.business_name_translations;
        }
        if (data.trade_name_translations) {
            tradeNameTranslations.value = data.trade_name_translations;
        }
        buisnessno.value = data.commercial_register || '';
        taxno.value = data.tax_register || '';
        unifiedLoginId.value = data.unified_login_id || '';
        phone.value = data.phone || '';
        email.value = data.email || '';
        mobile.value = data.mobile || '';
        languageId.value = data.language_id || null;
        countryId.value = data.country_id || null;
        cityId.value = data.city_id || null;
        neighborhood.value = data.neighborhood || '';
        streetName.value = data.street_name || '';
        postalCode.value = data.postal_code || '';
        buildingNumber.value = data.building_number || '';
        address1.value = data.address_1 || '';

        // Step 2: Financial Info
        bankAccounts.value = data.bank_accounts || [];
        debitLimit.value = data.debit_limit || '';
        creditLimit.value = data.credit_limit || '';

        // Step 3: Commercial Info
        licenseType.value = data.license_type || null;
        licenseNumber.value = data.license_number || '';
        issuingAuthority.value = data.issuing_authority || null;
        issueDate.value = data.issue_date || '';
        expiryDate.value = data.expiry_date || '';
        licenseStatus.value = data.license_status || null;
        licensedActivity.value = data.licensed_activity || null;
        activityTypes.value = data.activity_types || [];
        productTypes.value = data.product_types || [];
        rawMaterialTypes.value = data.raw_material_types || [];
        rawMaterialSource.value = data.raw_material_source || null;
        licensedCapacity.value = data.licensed_capacity || null;

        // Step 4: Operational Info
        productionLinesCount.value = data.production_lines_count || null;
        operationalReadiness.value = data.operational_readiness || null;
        operationalStatus.value = data.operational_status || null;
        totalWorkers.value = data.total_workers || null;
        engineersCount.value = data.engineers_count || null;
        techniciansCount.value = data.technicians_count || null;
        qualityControlSystem.value = data.quality_control_system || null;
        qualityLabAvailability.value = data.quality_lab_availability === true || data.quality_lab_availability === 'true';
        safetySystem.value = data.safety_system || null;
        workingHours.value = data.working_hours || null;
        equipmentType.value = data.equipment_type || [];
        operationMode.value = data.operation_mode || null;
        maintenanceSystem.value = data.maintenance_system || null;
        weighbridgeAvailability.value = data.weighbridge_availability === true || data.weighbridge_availability === 'true';
        weighbridgeType.value = data.weighbridge_type || null;
    } catch (err: any) {
        console.error('Error fetching factory:', err);
        toast.error(err?.response?.data?.message || t('pages.factories.form.messages.loadError'));
    }
};

const fetchConstants = async () => {
    try {
        const response = await api.get('/factories/constants');
        constants.value = response.data;
    } catch (err: any) {
        console.error('Error fetching constants:', err);
    }
};

const fetchBanksList = async () => {
    try {
        const response = await api.get('/banks/list');
        if (response.data && Array.isArray(response.data)) {
            bankItems.value = response.data.map((bank: any) => ({
                title: bank.name || bank.title,
                value: bank.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching banks list:', err);
    }
};

const fetchLanguagesList = async () => {
    try {
        const response = await api.get('/languages/list');
        if (response.data && Array.isArray(response.data)) {
            languageItems.value = response.data.map((lang: any) => ({
                title: lang.name || lang.title,
                value: lang.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching languages list:', err);
    }
};

const fetchProductTypesList = async () => {
    try {
        const response = await api.get('/items/list');
        if (response.data && Array.isArray(response.data)) {
            productTypesItems.value = response.data.map((item: any) => ({
                title: item.name || item.title,
                value: item.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching product types list:', err);
    }
};

onMounted(async () => {
    pageLoading.value = true;
    factoryAddressListsReady.value = false;
    await Promise.all([
        fetchConstants(),
        fetchBanksList(),
        fetchLanguagesList(),
        fetchProductTypesList()
    ]);
    await fetchFactoryData();
    factoryAddressListsReady.value = true;
    pageLoading.value = false;
});

</script>

<template>
    <default-layout>
        <div class="logistic-form-page">
            <PageHeader :icon="factoryIcon" title-key="pages.factories.title"
                description-key="pages.factories.description" />

            <div class="py-3 border-y border-gray-200 mb-6 px-6 -mx-6">
                <v-tabs v-model="activeTab" class="custom-tabs" hide-slider>
                    <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
                        'custom-tab !px-4',
                        {
                            '!bg-primary-500 !text-white': isTabActive(tab.value),
                            '!bg-white !text-gray-400': !isTabActive(tab.value),
                        },
                    ]" @click="handleTabChange(tab.value)">
                        {{ tab.title }}
                    </v-tab>
                </v-tabs>

            </div>

            <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                <v-tabs-window v-model="activeTab">
                    <v-tabs-window-item :value="0">
                        <BasicInfoTab
                            :businessNameTranslations="businessNameTranslations"
                            :ownerCompanyName="ownerCompanyName" :mobile="mobile" :phone="phone" :email="email"
                            :buisnessno="buisnessno" :taxno="taxno" :unifiedLoginId="unifiedLoginId" :countryId="countryId" :cityId="cityId"
                            :neighborhood="neighborhood" :streetName="streetName" :postalCode="postalCode"
                            :buildingNumber="buildingNumber" :address1="address1" :languageId="languageId"
                            :tradeNameTranslations="tradeNameTranslations"
                            :languageItems="languageItems"
                            :wait-for-address-lists-ready="waitForFactoryAddressLists"
                            :formErrors="formErrors" @update:formData="handleBasicInfoUpdate"
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="1">
                        <FinancialInfoTab :bankAccounts="bankAccounts" :bankItems="bankItems" :debitLimit="debitLimit"
                            :creditLimit="creditLimit" :formErrors="formErrors"
                            @update:formData="handleFinancialInfoUpdate" @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="2">
                        <CommercialInfoTab 
                            :licenseType="licenseType"
                            :licenseNumber="licenseNumber"
                            :issuingAuthority="issuingAuthority"
                            :issueDate="issueDate"
                            :expiryDate="expiryDate"
                            :licenseStatus="licenseStatus"
                            :licensedActivity="licensedActivity"
                            :activityTypes="activityTypes"
                            :productTypes="productTypes"
                            :rawMaterialTypes="rawMaterialTypes"
                            :rawMaterialSource="rawMaterialSource"
                            :licensedCapacity="licensedCapacity"
                            :licenseTypeItems="licenseTypeItems"
                            :issuingAuthorityItems="issuingAuthorityItems"
                            :licenseStatusItems="licenseStatusItems"
                            :licensedActivityItems="licensedActivityItems"
                            :activityTypesItems="activityTypesItems"
                            :productTypesItems="productTypesItems"
                            :rawMaterialTypesItems="rawMaterialTypesItems"
                            :rawMaterialSourceItems="rawMaterialSourceItems"
                            :formErrors="formErrors"
                            @update:formData="handleCommercialInfoUpdate"
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="3">
                        <OperationalInfoTab 
                            :productionLinesCount="productionLinesCount"
                            :operationalReadiness="operationalReadiness"
                            :operationalStatus="operationalStatus"
                            :totalWorkers="totalWorkers"
                            :engineersCount="engineersCount" 
                            :techniciansCount="techniciansCount"
                            :qualityControlSystem="qualityControlSystem"
                            :qualityLabAvailability="qualityLabAvailability"
                            :safetySystem="safetySystem"
                            :workingHours="workingHours"
                            :equipmentType="equipmentType"
                            :operationMode="operationMode"
                            :maintenanceSystem="maintenanceSystem"
                            :weighbridgeAvailability="weighbridgeAvailability"
                            :weighbridgeType="weighbridgeType"
                            :operationalReadinessItems="operationalReadinessItems"
                            :operationalStatusItems="operationalStatusItems"
                            :qualityControlSystemItems="qualityControlSystemItems"
                            :safetySystemItems="safetySystemItems"
                            :workingHoursItems="workingHoursItems"
                            :equipmentTypesItems="equipmentTypesItems"
                            :operationModeItems="operationModeItems"
                            :maintenanceSystemItems="maintenanceSystemItems"
                            :weighbridgeTypeItems="weighbridgeTypeItems"
                            :formErrors="formErrors"
                            @update:formData="handleOperationalInfoUpdate"
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-form>

            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
                    :prepend-icon="saveIcon" :label="t('common.actions.save')" @click="handleSave" :loading="saving" />

                <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
                    custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" :label="t('common.actions.close')"
                    :disabled="saving" @click="handleCancel" />
            </div>
        </div>

        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" />
        </v-overlay>
    </default-layout>
</template>

<style scoped>
.custom-tab {
    border-radius: 8px !important;
    text-transform: none;
    font-weight: 500;
}


.custom-tab--completed {
    color: #039855;
}
</style>
