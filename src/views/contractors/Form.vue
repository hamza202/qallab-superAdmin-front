<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import BasicInfoTab from "./components/BasicInfoTab.vue";
import FinancialInfoTab from "./components/FinancialInfoTab.vue";
import CommercialInfoTab from "./components/CommercialInfoTab.vue";
import OperationalInfoTab from "./components/OperationalInfoTab.vue";
import DocumentsTab from "./components/DocumentsTab.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const contractorsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 6.5C18.5442 6.5 12.5 12.5442 12.5 20C12.5 27.4558 18.5442 33.5 26 33.5C33.4558 33.5 39.5 27.4558 39.5 20C39.5 12.5442 33.4558 6.5 26 6.5ZM16.8333 20C16.8333 14.9374 20.9374 10.8333 26 10.8333C31.0626 10.8333 35.1667 14.9374 35.1667 20C35.1667 25.0626 31.0626 29.1667 26 29.1667C20.9374 29.1667 16.8333 25.0626 16.8333 20Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 37.8333C19.7211 37.8333 14.0289 39.7344 9.88167 42.8177C7.81306 44.3555 6.5 46.9289 6.5 49.8333C6.5 51.0299 7.47005 52 8.66667 52H43.3333C44.5299 52 45.5 51.0299 45.5 49.8333C45.5 46.9289 44.1869 44.3555 42.1183 42.8177C37.9711 39.7344 32.2789 37.8333 26 37.8333ZM10.8333 47.6667C11.1844 46.5889 11.9156 45.6111 12.9817 44.8177C16.3711 42.2989 20.9456 40.6667 26 40.6667C31.0544 40.6667 35.6289 42.2989 39.0183 44.8177C40.0844 45.6111 40.8156 46.5889 41.1667 47.6667H10.8333Z" fill="#1570EF"/>
</svg>`;

const checkCircleIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12506_1251)">
<path d="M16.5 8.34375V9C16.4991 10.5993 15.9754 12.1574 15.007 13.4429C14.0386 14.7284 12.6775 15.6733 11.1265 16.1377C9.57557 16.6021 7.91794 16.5614 6.39209 16.0216C4.86624 15.4817 3.55402 14.4709 2.64836 13.1352C1.7427 11.7994 1.29008 10.2083 1.35681 8.61019C1.42354 7.01205 2.00608 5.46414 3.01878 4.20164C4.03148 2.93913 5.42182 2.02527 6.98338 1.59033C8.54495 1.15539 10.2003 1.21851 11.7263 1.77188M16.5 2.25L9 9.7575L6.75 7.5075" stroke="#039855" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12506_1251">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;

const isEditing = computed(() => route.params.id !== 'new');
const pageTitle = computed(() => isEditing.value ? "تعديل المقاول" : "إضافة مقاول");
const contractorId = ref<number | null>(null);

const formRef = ref<any>(null);
const isFormValid = ref(false);

const activeTab = ref(0);
const tabs = [
  { title: "البيانات الاساسية", value: 0 },
  { title: "البيانات المالية", value: 1 },
  { title: "البيانات التجارية", value: 2 },
  { title: "المعلومات التشغيلية", value: 3 },
];

const isTabActive = (value: number) => activeTab.value === value;

const handleTabChange = (newTab: number, event?: Event) => {
  activeTab.value = newTab;
};


const fullNameTranslations = ref({ ar: "", en: "" });
const tradeNameTranslations = ref({ ar: "", en: "" });
const commercialRegister = ref("");
const taxRegister = ref("");
const entityType = ref<string | null>(null);
const isActive = ref(true);
const crIssueDate = ref("");
const crExpiryDate = ref("");
const languageId = ref<number | null>(null);
const phone = ref("");
const email = ref("");
const mobile = ref("");
const countryId = ref<number | null>(null);
const cityId = ref<number | null>(null);
const neighborhood = ref("");
const streetName = ref("");
const buildingNumber = ref("");
const postalCode = ref("");
const address1 = ref("");

const debitLimit = ref<number | string | null>(null);
const creditLimit = ref<number | string | null>(null);
const bankAccounts = ref<any[]>([]);

const contractorClassification = ref<string | null>(null);
const classificationGrade = ref<string | null>(null);
const scopeOfWork = ref<string | null>(null);
const municipalLicenseNumber = ref("");
const municipalLicenseExpiry = ref("");
const municipalLicenseStatus = ref<string | null>(null);
const safetyCertification = ref<string | null>(null);
const environmentalCertification = ref<string | null>(null);
const civilDefenseApproval = ref<boolean>(false);

const ongoingProjects = ref<number | null>(null);
const completedProjects = ref<number | null>(null);
const employeesCount = ref<number | null>(null);
const engineersCount = ref<number | null>(null);
const techniciansCount = ref<number | null>(null);
const operationalCapacity = ref<string | null>(null);
const specialization = ref<string | null>(null);
const siteReadiness = ref<string | null>(null);
const safetyManagementSystem = ref<boolean>(false);
const environmentalCompliance = ref<boolean>(false);

const documents = ref<any[]>([]);
const documentName = ref("");
const documentType = ref<string | null>(null);
const documentFile = ref<File[] | null>(null);

const constants = ref<any>({});
const banks = ref<Array<{ id: number; name: string }>>([]);
const languages = ref<Array<{ id: number; name: string }>>([]);
const countries = ref<Array<{ id: number; name: string }>>([]);
const cities = ref<Array<{ id: number; name: string }>>([]);

const entityTypeItems = computed(() =>
  constants.value.entity_type?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const contractorClassificationItems = computed(() =>
  constants.value.contractor_classification?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const classificationGradeItems = computed(() =>
  constants.value.classification_grade?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const scopeOfWorkItems = computed(() =>
  constants.value.scope_of_work?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const municipalLicenseStatusItems = computed(() =>
  constants.value.municipal_license_status?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const safetyCertificationItems = computed(() =>
  constants.value.safety_certification?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const environmentalCertificationItems = computed(() =>
  constants.value.environmental_certification?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const operationalCapacityItems = computed(() =>
  constants.value.operational_capacity?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const specializationItems = computed(() =>
  constants.value.specialization?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const siteReadinessItems = computed(() =>
  constants.value.site_readiness?.map((item: any) => ({ title: item.label, value: item.key })) || []
);

const bankItems = computed(() =>
  banks.value.map(bank => ({ title: bank.name, value: bank.id }))
);
const languageItems = computed(() =>
  languages.value.map(lang => ({ title: lang.name, value: lang.id }))
);
const countryItems = computed(() =>
  countries.value.map(country => ({ title: country.name, value: country.id }))
);
const cityItems = computed(() =>
  cities.value.map(city => ({ title: city.name, value: city.id }))
);

const saving = ref(false);

const handleSave = async () => {
  try {
    saving.value = true;

    const step = activeTab.value + 1;
    const payload: any = { step };

    if (step === 1) {
      payload.full_name = {
        ar: fullNameTranslations.value.ar,
        en: fullNameTranslations.value.en
      };
      payload.trade_name = {
        ar: tradeNameTranslations.value.ar,
        en: tradeNameTranslations.value.en
      };
      if (commercialRegister.value) payload.commercial_register = commercialRegister.value;
      if (taxRegister.value) payload.tax_register = taxRegister.value;
      if (entityType.value) payload.entity_type = entityType.value;
      payload.is_active = isActive.value;
      if (crIssueDate.value) payload.cr_issue_date = crIssueDate.value;
      if (crExpiryDate.value) payload.cr_expiry_date = crExpiryDate.value;
      if (languageId.value) payload.language_id = languageId.value;
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
    }

    if (step === 2) {
      if (!isEditing.value) {
        error('يجب حفظ البيانات الأساسية أولاً');
        saving.value = false;
        return;
      }
      payload.bank_accounts = bankAccounts.value.map(account => {
        const accountData: any = {
          bank_id: account.bank_id,
          bank_branch: account.bank_branch,
          iban: account.iban,
          account_number: account.account_number,
          is_active: account.is_active
        };
        if (account.id !== null && account.id !== undefined) {
          accountData.id = account.id;
        }
        return accountData;
      });
      if (debitLimit.value) payload.debit_limit = debitLimit.value;
      if (creditLimit.value) payload.credit_limit = creditLimit.value;
    }

    if (step === 3) {
      if (!isEditing.value) {
        error('يجب حفظ البيانات الأساسية أولاً');
        saving.value = false;
        return;
      }
      if (contractorClassification.value) payload.contractor_classification = contractorClassification.value;
      if (classificationGrade.value) payload.classification_grade = classificationGrade.value;
      if (scopeOfWork.value) payload.scope_of_work = scopeOfWork.value;
      if (municipalLicenseNumber.value) payload.municipal_license_number = municipalLicenseNumber.value;
      if (municipalLicenseExpiry.value) payload.municipal_license_expiry = municipalLicenseExpiry.value;
      if (municipalLicenseStatus.value) payload.municipal_license_status = municipalLicenseStatus.value;
      if (safetyCertification.value) payload.safety_certification = safetyCertification.value;
      if (environmentalCertification.value) payload.environmental_certification = environmentalCertification.value;
      payload.civil_defense_approval = civilDefenseApproval.value;
    }

    if (step === 4) {
      if (!isEditing.value) {
        error('يجب حفظ البيانات الأساسية أولاً');
        saving.value = false;
        return;
      }
      if (ongoingProjects.value) payload.ongoing_projects = ongoingProjects.value;
      if (completedProjects.value) payload.completed_projects = completedProjects.value;
      if (employeesCount.value) payload.employees_count = employeesCount.value;
      if (engineersCount.value) payload.engineers_count = engineersCount.value;
      if (techniciansCount.value) payload.technicians_count = techniciansCount.value;
      if (operationalCapacity.value) payload.operational_capacity = operationalCapacity.value;
      if (specialization.value) payload.specialization = specialization.value;
      if (siteReadiness.value) payload.site_readiness = siteReadiness.value;
      payload.safety_management_system = safetyManagementSystem.value;
      payload.environmental_compliance = environmentalCompliance.value;
    }

    if (step === 1) {
      if (isEditing.value) {
        await api.put(`/admin/api/contractors/${route.params.id}`, payload);
        success('تم حفظ البيانات الأساسية بنجاح');
      } else {
        const response = await api.post('/admin/api/contractors', payload);
        success('تم حفظ البيانات الأساسية بنجاح');
        if (response.data?.id) {
          contractorId.value = response.data.id;
          router.replace({ name: 'ContractorsEdit', params: { id: response.data.id } });
        }
      }
    } else if (step === 2) {
      await api.put(`/admin/api/contractors/${route.params.id}`, payload);
      success('تم حفظ البيانات المالية بنجاح');
    } else if (step === 3) {
      await api.put(`/admin/api/contractors/${route.params.id}`, payload);
      success('تم حفظ البيانات التجارية بنجاح');
    } else if (step === 4) {
      await api.put(`/admin/api/contractors/${route.params.id}`, payload);
      success('تم حفظ المعلومات التشغيلية بنجاح');
    }
  } catch (err: any) {
    console.error('Error saving contractor:', err);
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;
      Object.keys(errors).forEach(key => {
        errors[key].forEach((msg: string) => error(msg));
      });
    } else {
      error(err?.response?.data?.message || 'فشل حفظ المقاول');
    }
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push({ name: 'ContractorsList' });
};

const handleBasicInfoUpdate = (data: any) => {
  if (data.fullNameTranslations !== undefined) fullNameTranslations.value = data.fullNameTranslations;
  if (data.tradeNameTranslations !== undefined) tradeNameTranslations.value = data.tradeNameTranslations;
  if (data.commercialRegister !== undefined) commercialRegister.value = data.commercialRegister;
  if (data.taxRegister !== undefined) taxRegister.value = data.taxRegister;
  if (data.entityType !== undefined) entityType.value = data.entityType;
  if (data.isActive !== undefined) isActive.value = data.isActive;
  if (data.crIssueDate !== undefined) crIssueDate.value = data.crIssueDate;
  if (data.crExpiryDate !== undefined) crExpiryDate.value = data.crExpiryDate;
  if (data.languageId !== undefined) languageId.value = data.languageId;
  if (data.phone !== undefined) phone.value = data.phone;
  if (data.email !== undefined) email.value = data.email;
  if (data.mobile !== undefined) mobile.value = data.mobile;
  if (data.countryId !== undefined) countryId.value = data.countryId;
  if (data.cityId !== undefined) cityId.value = data.cityId;
  if (data.neighborhood !== undefined) neighborhood.value = data.neighborhood;
  if (data.streetName !== undefined) streetName.value = data.streetName;
  if (data.buildingNumber !== undefined) buildingNumber.value = data.buildingNumber;
  if (data.postalCode !== undefined) postalCode.value = data.postalCode;
  if (data.address1 !== undefined) address1.value = data.address1;
};

const handleFinancialInfoUpdate = (data: any) => {
  if (data.bankAccounts !== undefined) bankAccounts.value = data.bankAccounts;
  if (data.debitLimit !== undefined) debitLimit.value = data.debitLimit;
  if (data.creditLimit !== undefined) creditLimit.value = data.creditLimit;
};

const handleCommercialInfoUpdate = (data: any) => {
  if (data.contractorClassification !== undefined) contractorClassification.value = data.contractorClassification;
  if (data.classificationGrade !== undefined) classificationGrade.value = data.classificationGrade;
  if (data.scopeOfWork !== undefined) scopeOfWork.value = data.scopeOfWork;
  if (data.municipalLicenseNumber !== undefined) municipalLicenseNumber.value = data.municipalLicenseNumber;
  if (data.municipalLicenseExpiry !== undefined) municipalLicenseExpiry.value = data.municipalLicenseExpiry;
  if (data.municipalLicenseStatus !== undefined) municipalLicenseStatus.value = data.municipalLicenseStatus;
  if (data.safetyCertification !== undefined) safetyCertification.value = data.safetyCertification;
  if (data.environmentalCertification !== undefined) environmentalCertification.value = data.environmentalCertification;
  if (data.civilDefenseApproval !== undefined) civilDefenseApproval.value = data.civilDefenseApproval;
};

const handleOperationalInfoUpdate = (data: any) => {
  if (data.ongoingProjects !== undefined) ongoingProjects.value = data.ongoingProjects;
  if (data.completedProjects !== undefined) completedProjects.value = data.completedProjects;
  if (data.employeesCount !== undefined) employeesCount.value = data.employeesCount;
  if (data.engineersCount !== undefined) engineersCount.value = data.engineersCount;
  if (data.techniciansCount !== undefined) techniciansCount.value = data.techniciansCount;
  if (data.operationalCapacity !== undefined) operationalCapacity.value = data.operationalCapacity;
  if (data.specialization !== undefined) specialization.value = data.specialization;
  if (data.siteReadiness !== undefined) siteReadiness.value = data.siteReadiness;
  if (data.safetyManagementSystem !== undefined) safetyManagementSystem.value = data.safetyManagementSystem;
  if (data.environmentalCompliance !== undefined) environmentalCompliance.value = data.environmentalCompliance;
};

const handleDocumentsUpdate = (data: any) => {
  if (data.documents !== undefined) documents.value = data.documents;
};

const fetchConstants = async () => {
  try {
    const response = await api.get('/admin/api/contractors/constants');
    constants.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching constants:', err);
  }
};

const fetchBanks = async () => {
  try {
    const response = await api.get('/admin/api/banks/list');
    banks.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching banks:', err);
  }
};

const fetchLanguages = async () => {
  try {
    const response = await api.get('/admin/api/languages/list');
    languages.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching languages:', err);
  }
};

const fetchCountries = async () => {
  try {
    const response = await api.get('/admin/api/countries/list');
    countries.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching countries:', err);
  }
};

const fetchCities = async () => {
  try {
    const response = await api.get('/admin/api/cities/list');
    cities.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching cities:', err);
  }
};

const fetchContractorData = async () => {
  if (!isEditing.value) return;

  try {
    const response = await api.get(`/admin/api/contractors/${route.params.id}`);
    const data = response.data.data;

    contractorId.value = data.id;
    fullNameTranslations.value = data.full_name_translations || { ar: "", en: "" };
    tradeNameTranslations.value = data.trade_name_translations || { ar: "", en: "" };
    commercialRegister.value = data.commercial_register || "";
    taxRegister.value = data.tax_register || "";
    entityType.value = data.entity_type;
    isActive.value = data.is_active;
    crIssueDate.value = data.cr_issue_date || "";
    crExpiryDate.value = data.cr_expiry_date || "";
    languageId.value = data.language_id;
    phone.value = data.phone || "";
    email.value = data.email || "";
    mobile.value = data.mobile || "";
    countryId.value = data.country_id;
    cityId.value = data.city_id;
    neighborhood.value = data.neighborhood || "";
    streetName.value = data.street_name || "";
    buildingNumber.value = data.building_number || "";
    postalCode.value = data.postal_code || "";
    address1.value = data.address_1 || "";

    debitLimit.value = data.debit_limit;
    creditLimit.value = data.credit_limit;
    bankAccounts.value = data.bank_accounts || [];

    contractorClassification.value = data.contractor_classification;
    classificationGrade.value = data.classification_grade;
    scopeOfWork.value = data.scope_of_work;
    municipalLicenseNumber.value = data.municipal_license_number || "";
    municipalLicenseExpiry.value = data.municipal_license_expiry || "";
    municipalLicenseStatus.value = data.municipal_license_status;
    safetyCertification.value = data.safety_certification;
    environmentalCertification.value = data.environmental_certification;
    civilDefenseApproval.value = data.civil_defense_approval || false;

    ongoingProjects.value = data.ongoing_projects;
    completedProjects.value = data.completed_projects;
    employeesCount.value = data.employees_count;
    engineersCount.value = data.engineers_count;
    techniciansCount.value = data.technicians_count;
    operationalCapacity.value = data.operational_capacity;
    specialization.value = data.specialization;
    siteReadiness.value = data.site_readiness;
    safetyManagementSystem.value = data.safety_management_system || false;
    environmentalCompliance.value = data.environmental_compliance || false;
  } catch (err: any) {
    console.error('Error fetching contractor:', err);
    error(err?.response?.data?.message || 'فشل تحميل بيانات المقاول');
  }
};

onMounted(async () => {
  await Promise.all([
    fetchConstants(),
    fetchBanks(),
    fetchLanguages(),
    fetchCountries(),
    fetchCities(),
  ]);
  await fetchContractorData();
});

</script>

<template>
  <default-layout>
    <div class="contractor-form-page">
      <PageHeader :icon="contractorsIcon" title-key="pages.contractors.title"
        description-key="pages.contractors.editDescription" />

      <div class="py-3 border-y border-gray-200 mb-6 px-6 -mx-6">
        <v-tabs v-model="activeTab" class="custom-tabs" hide-slider>
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
            'custom-tab',
            {
              'custom-tab--active': isTabActive(tab.value),
            },
          ]" @click="handleTabChange(tab.value, $event)">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
      </div>
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item :value="0">
          <BasicInfoTab :fullNameTranslations="fullNameTranslations" :tradeNameTranslations="tradeNameTranslations"
            :commercialRegister="commercialRegister" :taxRegister="taxRegister" :entityType="entityType"
            :isActive="isActive" :crIssueDate="crIssueDate" :crExpiryDate="crExpiryDate" :languageId="languageId"
            :phone="phone" :email="email" :mobile="mobile" :countryId="countryId" :cityId="cityId"
            :neighborhood="neighborhood" :streetName="streetName" :buildingNumber="buildingNumber"
            :postalCode="postalCode" :address1="address1" :entityTypeItems="entityTypeItems"
            :languageItems="languageItems" :countryItems="countryItems" :cityItems="cityItems"
            @update:formData="handleBasicInfoUpdate" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="1">
          <FinancialInfoTab :bankAccounts="bankAccounts" :bankItems="bankItems" :debitLimit="debitLimit"
            :creditLimit="creditLimit" @update:formData="handleFinancialInfoUpdate" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="2">
          <CommercialInfoTab :contractorClassification="contractorClassification"
            :classificationGrade="classificationGrade" :scopeOfWork="scopeOfWork"
            :municipalLicenseNumber="municipalLicenseNumber" :municipalLicenseExpiry="municipalLicenseExpiry"
            :municipalLicenseStatus="municipalLicenseStatus" :safetyCertification="safetyCertification"
            :environmentalCertification="environmentalCertification" :civilDefenseApproval="civilDefenseApproval"
            :contractorClassificationItems="contractorClassificationItems"
            :classificationGradeItems="classificationGradeItems" :scopeOfWorkItems="scopeOfWorkItems"
            :municipalLicenseStatusItems="municipalLicenseStatusItems"
            :safetyCertificationItems="safetyCertificationItems"
            :environmentalCertificationItems="environmentalCertificationItems"
            @update:formData="handleCommercialInfoUpdate" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="3">
          <OperationalInfoTab :ongoingProjects="ongoingProjects" :completedProjects="completedProjects"
            :employeesCount="employeesCount" :engineersCount="engineersCount" :techniciansCount="techniciansCount"
            :operationalCapacity="operationalCapacity" :specialization="specialization" :siteReadiness="siteReadiness"
            :safetyManagementSystem="safetyManagementSystem" :environmentalCompliance="environmentalCompliance"
            :operationalCapacityItems="operationalCapacityItems" :specializationItems="specializationItems"
            :siteReadinessItems="siteReadinessItems" @update:formData="handleOperationalInfoUpdate" />
        </v-tabs-window-item>
      </v-tabs-window>

      <div class="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6 px-6">
        <v-btn variant="flat" color="primary" height="44" class="font-semibold text-base sm:min-w-[200px]"
          @click="handleSave" :loading="saving">
          <template #prepend>
            <v-icon>mdi-content-save-all-outline</v-icon>
          </template>
          حفظ التعديلات
        </v-btn>
        <v-btn variant="flat" color="primary-50" height="44"
          class="font-semibold text-base text-primary-700 sm:min-w-[200px]" @click="handleCancel" :disabled="saving">
          <template #prepend>
            <v-icon>mdi-close</v-icon>
          </template>
          اغلاق
        </v-btn>
      </div>

    </div>
  </default-layout>
</template>

<style scoped>
.custom-tab {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.custom-tab--active {
  background: #1570EF;
  color: white;
}
</style>
