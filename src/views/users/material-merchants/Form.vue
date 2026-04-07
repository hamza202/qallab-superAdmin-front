<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useI18n } from 'vue-i18n';
import BasicInfoTab from "./components/BasicInfoTab.vue";
import FinancialInfoTab from "./components/FinancialInfoTab.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { t } = useI18n();

const materialMerchantsIcon = `<svg width="52" height="52" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const isEditing = computed(() => route.params.id !== 'new');
const pageTitle = computed(() => isEditing.value ? t('pages.materialMerchants.form.editTitle') : t('pages.materialMerchants.form.addTitle'));
const materialMerchantId = ref<number | null>(null);
const pageLoading = ref(false);

/** When true, merchant payload (incl. country_id / city_id) is applied — safe for lazy lists. */
const merchantAddressListsReady = ref(false);

async function waitForMerchantAddressLists() {
  if (!isEditing.value) return;
  await new Promise<void>((resolve) => {
    if (merchantAddressListsReady.value) {
      resolve();
      return;
    }
    const stop = watch(merchantAddressListsReady, (ok) => {
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
  { title: t('pages.materialMerchants.form.tabs.basicInfo'), value: 0 },
  { title: t('pages.materialMerchants.form.tabs.financialInfo'), value: 1 },
]);

const isTabActive = (value: number) => activeTab.value === value;

const handleTabChange = (newTab: number, event?: Event) => {
  activeTab.value = newTab;
};


const businessNameTranslations = ref({ ar: "", en: "" });
const buisnessno = ref("");
const taxno = ref("");
const ownerName = ref("");
const phone = ref("");
const email = ref("");
const mobile = ref("");
const unifiedLoginId = ref("");
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

const banks = ref<Array<{ id: number; name: string }>>([]);

const bankItems = computed(() =>
  banks.value.map(bank => ({ title: bank.name, value: bank.id }))
);

const saving = ref(false);

const handleSave = async () => {
  try {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    saving.value = true;


    const step = activeTab.value + 1;
    const payload: any = { step };

    if (step === 1) {
      payload.business_name = {
        ar: businessNameTranslations.value.ar,
        en: businessNameTranslations.value.en
      };
      if (buisnessno.value) payload.buisnessno = String(buisnessno.value);
      if (taxno.value) payload.taxno = String(taxno.value);
      payload.owner_name = ownerName.value;
      if (phone.value) payload.phone = phone.value;
      if (email.value) payload.email = email.value;
      if (mobile.value) payload.mobile = mobile.value;
      if (unifiedLoginId.value) payload.unified_login_id = unifiedLoginId.value;
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
        toast.error(t('common.messages.general.completeStep1First'));
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

    let response;
    if (step === 1) {
      if (isEditing.value) {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
          if (key === 'business_name') {
            formData.append(`${key}[ar]`, payload[key].ar);
            formData.append(`${key}[en]`, payload[key].en);
          } else {
            formData.append(key, payload[key]);
          }
        });
        formData.append('_method', 'PUT');
        response = await api.post(`/material-merchants/${route.params.id}`, formData);
        toast.success(t('common.messages.general.saveSuccess'));
      } else {
        response = await api.post('/material-merchants', payload);
        toast.success(t('common.messages.general.saveSuccess'));
        if (response.id) {
          materialMerchantId.value = response.id;
          router.replace({ name: 'MaterialMerchantsEdit', params: { id: response.id } });
        }
      }
      if (step === 1 && activeTab.value < 1) {
        activeTab.value++;
      }
    } else {
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        if (key === 'bank_accounts') {
          payload[key].forEach((account: any, index: number) => {
            Object.keys(account).forEach(accKey => {
              formData.append(`bank_accounts[${index}][${accKey}]`, account[accKey]);
            });
          });
        } else {
          formData.append(key, payload[key]);
        }
      });
      formData.append('_method', 'PUT');
      response = await api.post(`/material-merchants/${route.params.id}`, formData);

      const stepMessages = [
        'تم حفظ البيانات الأساسية بنجاح',
        'تم حفظ البيانات المالية بنجاح',
      ];

      hasValidationErrors.value = false;
      Object.keys(formErrors).forEach(key => delete formErrors[key]);

      toast.success(response.message || stepMessages[step - 1]);

      if (step < 2) {
        activeTab.value = step;
      } else if (step === 2) {
        router.push({ name: 'MaterialMerchantsList' });
      }
    }
  } catch (err: any) {
    console.error('Error saving material merchant:', err);

    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      hasValidationErrors.value = true;
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      toast.error(err?.response?.data?.message || t('common.messages.general.saveError'));
    } else {
      toast.error(err?.response?.data?.message || t('common.messages.general.saveError'));
    }
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push({ name: 'MaterialMerchantsList' });
};

const handleBasicInfoUpdate = (data: any) => {
  if (data.businessNameTranslations !== undefined) businessNameTranslations.value = data.businessNameTranslations;
  if (data.buisnessno !== undefined) buisnessno.value = data.buisnessno;
  if (data.taxno !== undefined) taxno.value = data.taxno;
  if (data.ownerName !== undefined) ownerName.value = data.ownerName;
  if (data.phone !== undefined) phone.value = data.phone;
  if (data.email !== undefined) email.value = data.email;
  if (data.mobile !== undefined) mobile.value = data.mobile;
  if (data.unifiedLoginId !== undefined) unifiedLoginId.value = data.unifiedLoginId;
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

const clearError = (field: string) => {
  console.log(field);
  console.log(formErrors);

  if (formErrors[field]) {
    delete formErrors[field];
  }

  if (Object.keys(formErrors).length === 0) {
    hasValidationErrors.value = false;
  }
};

const fetchBanks = async () => {
  try {
    const response = await api.get('/banks/list');
    if (response.data && Array.isArray(response.data)) {
      banks.value = response.data.map((bank: any) => ({
        id: bank.id,
        name: bank.name || bank.title
      }));
    }
  } catch (err: any) {
    console.error('Error fetching banks:', err);
  }
};

const fetchMaterialMerchantData = async () => {
  if (!isEditing.value) return;

  if (hasValidationErrors.value) return;

  try {
    const response = await api.get(`/material-merchants/${route.params.id}`);
    const data = response.data;

    materialMerchantId.value = data.id;
    businessNameTranslations.value = data.business_name_translations || { ar: "", en: "" };
    buisnessno.value = data.buisnessno || "";
    taxno.value = data.taxno || "";
    ownerName.value = data.owner_name || '';
    phone.value = data.phone || "";
    email.value = data.email || "";
    mobile.value = data.mobile || "";
    unifiedLoginId.value = data.unified_login_id || "";
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
  } catch (err: any) {
    console.error('Error fetching material merchant:', err);
    toast.error(err?.response?.data?.message || t('common.messages.general.loadDataFailed'));
  }
};

onMounted(async () => {
  pageLoading.value = true
  merchantAddressListsReady.value = false
  await Promise.all([fetchBanks()]);
  await fetchMaterialMerchantData();
  merchantAddressListsReady.value = true
  pageLoading.value = false
});

</script>

<template>
  <default-layout>
    <div class="material-merchant-form-page">
      <PageHeader :icon="materialMerchantsIcon" title-key="pages.materialMerchants.title"
        description-key="pages.materialMerchants.editDescription" />

      <div class="py-3 border-y border-gray-200 mb-6 px-6 -mx-6">
        <v-tabs v-model="activeTab" class="custom-tabs" hide-slider>
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
            'custom-tab !px-4',
            {
              '!bg-primary-500 !text-white': isTabActive(tab.value),
              '!bg-white !text-gray-400': !isTabActive(tab.value),
            },
          ]" @click="handleTabChange(tab.value, $event)">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
      </div>
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item :value="0">
          <BasicInfoTab :businessNameTranslations="businessNameTranslations" :buisnessno="buisnessno" :taxno="taxno"
            :ownerName="ownerName" :phone="phone" :email="email" :mobile="mobile" :unifiedLoginId="unifiedLoginId"
            :countryId="countryId" :cityId="cityId" :neighborhood="neighborhood" :streetName="streetName"
            :buildingNumber="buildingNumber" :postalCode="postalCode" :address1="address1"
            :wait-for-address-lists-ready="waitForMerchantAddressLists"
            :formErrors="formErrors"
            @update:formData="handleBasicInfoUpdate" @clear:error="clearError" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="1">
          <FinancialInfoTab :bankAccounts="bankAccounts" :bankItems="bankItems" :debitLimit="debitLimit"
            :creditLimit="creditLimit" :formErrors="formErrors" @update:formData="handleFinancialInfoUpdate"
            @clear:error="clearError" />
        </v-tabs-window-item>
      </v-tabs-window>

      <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
          :prepend-icon="saveIcon" label="حفظ التعديلات" @click="handleSave" :loading="saving" />

        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
          custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق" :disabled="saving"
          @click="handleCancel" />
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
</style>
