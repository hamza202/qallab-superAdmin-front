<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

// TypeScript Interfaces
interface ListItem {
  id: number;
  name: string;
}

interface Address {
  country_id: number | null;
  city_id: number | null;
  postal_code: string;
  neighborhood: string;
  street_name: string;
  building_number: string;
  address_1: string;
  address_2: string;
}

interface ContactListItem {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  telephone: string;
}

interface SupplierBalance {
  id: number;
  currency: string;
  debit: string;
  credit: string;
  balance: string;
  last_amount: string;
  last_validated_date: string;
}

interface SupplierPayload {
  step: number;
  supplier_id?: number;
  business_name: {
    en: string;
    ar: string;
  };
  first_name: {
    en: string;
    ar: string;
  };
  last_name: {
    en: string;
    ar: string;
  };
  supplier_code: string;
  default_currency_id: number | null;
  mobile: string;
  phone: string;
  email: string;
  address_1: string;
  buisnessno: string;
  taxno: string;
  is_active: boolean;
  address: Address;
  contact_list: ContactListItem[];
  tree_chart_card_id: number | null;
}

interface SupplierResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    supplier_id: number;
  };
}

// Check if editing
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'تعديل مورد' : 'إضافة مورد');

// Loading states
const loading = ref(false);
const saving = ref(false);

// Supplier ID for step 2
const supplierId = ref<number | null>(null);

// Form ref
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Tabs
const activeTab = ref(0);
const tabs = [
  { title: "المعلومات الاساسية", value: 0 },
  { title: "المعلومات المحاسبية", value: 1 },
];

const isTabActive = (value: number) => activeTab.value === value;
const isTabCompleted = (value: number) => {
  if (value === 0) return basicInfoCompleted.value;
  if (value === 1) return accountingInfoCompleted.value;
  return false;
};

// Handle tab change with validation
const handleTabChange = (newTab: number, event?: Event) => {
  // Validate when creating (not editing) and trying to move to step 2
  if (!isEditing.value && newTab === 1 && activeTab.value === 0) {
    if (!basicInfoCompleted.value) {
      error('يجب إكمال المعلومات الأساسية أولاً');
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      // Force tab to stay on current tab
      setTimeout(() => {
        activeTab.value = 0;
      }, 0);
      return;
    }
  }
  activeTab.value = newTab;
};

// Basic Info completion check
const basicInfoCompleted = computed(() => {
  // When editing, check if data is loaded
  if (isEditing.value) {
    return !!(businessNameAr.value && mobile.value && supplierId.value);
  }
  // When creating, only check required fields (supplierId will be set after first save)
  return !!(businessNameAr.value && mobile.value);
});

const accountingInfoCompleted = computed(() => {
  if (createAccountInTree.value === null) return false;
  if (createAccountInTree.value === false) return true;
  return !!account.value;
});

// Form data - Basic Info
const supplierCode = ref("SUP-5478544");
const businessNameAr = ref("");
const businessNameEn = ref("");
const firstNameAr = ref("");
const firstNameEn = ref("");
const lastNameAr = ref("");
const lastNameEn = ref("");
const defaultCurrency = ref<number | null>(null);
const mobile = ref("");
const phone = ref("");
const email = ref("");
const businessNumber = ref("");
const taxNumber = ref("");
const nationalAddress = ref("");
const status = ref(true);

// Address Info (sub-tab)
const country = ref<number | null>(null);
const city = ref<number | null>(null);
const postalCode = ref("");
const district = ref("");
const streetName = ref("");
const buildingNumber = ref("");
const address2 = ref("");

// Contact List
const contacts = ref<ContactListItem[]>([]);

// Accounting Info
const createAccountInTree = ref<boolean | null>(true);
const account = ref<number | null>(null);

// Balances (read-only from API)
const supplierBalances = ref<SupplierBalance[]>([]);

// Dropdown items from API
const currencyItems = ref<{ title: string; value: number }[]>([]);
const countryItems = ref<{ title: string; value: number }[]>([]);
const cityItems = ref<{ title: string; value: number }[]>([]);
const accountItems = ref<{ title: string; value: number }[]>([]);

// Sub-tabs for basic info section
const basicInfoSubTab = ref(0);

// API Functions
const fetchCountries = async () => {
  try {
    const response = await api.get<{ data: ListItem[] }>('/admin/api/countries/list');
    countryItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching countries:', err);
  }
};

const fetchCities = async (countryId: number) => {
  try {
    const response = await api.get<{ data: ListItem[] }>(`/admin/api/cities/list?country_id=${countryId}`);
    cityItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching cities:', err);
  }
};

const fetchCurrencies = async () => {
  try {
    const response = await api.get<{ data: ListItem[] }>('/admin/api/currencies/list');
    currencyItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching currencies:', err);
  }
};

const fetchTreeChartCards = async () => {
  try {
    const response = await api.get<{ data: ListItem[] }>('/admin/api/tree-chart-cards/list');
    accountItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching tree chart cards:', err);
  }
};

const fetchSupplierData = async () => {
  if (!route.params.id) return;

  try {
    loading.value = true;
    const response = await api.get<any>(`/admin/api/suppliers/${route.params.id}`);
    const data = response.data;

    // Set supplier ID
    supplierId.value = data.id;

    // Basic Info
    businessNameAr.value = data.business_name_translations?.ar || data.business_name;
    businessNameEn.value = data.business_name_translations?.en || data.business_name;
    firstNameAr.value = data.first_name_translations?.ar || data.first_name;
    firstNameEn.value = data.first_name_translations?.en || data.first_name;
    lastNameAr.value = data.last_name_translations?.ar || data.last_name;
    lastNameEn.value = data.last_name_translations?.en || data.last_name;
    supplierCode.value = data.supplier_code;
    mobile.value = data.mobile;
    phone.value = data.phone;
    email.value = data.email;
    defaultCurrency.value = data.default_currency_id;
    businessNumber.value = data.buisnessno;
    taxNumber.value = data.taxno;
    nationalAddress.value = data.address_1;
    status.value = data.is_active;

    // Address
    if (data.address) {
      country.value = data.address.country_id;
      city.value = data.address.city_id;
      postalCode.value = data.address.postal_code;
      district.value = data.address.neighborhood;
      streetName.value = data.address.street_name;
      buildingNumber.value = data.address.building_number;
      nationalAddress.value = data.address.address_1;
      address2.value = data.address.address_2;

      // Fetch cities for selected country
      if (data.address.country_id) {
        await fetchCities(data.address.country_id);
      }
    }

    // Contact List
    contacts.value = data.contact_list || [];

    // Supplier Balances
    supplierBalances.value = data.supplier_balances || [];

    // Accounting Info
    account.value = data.tree_chart_card_id;
  } catch (err: any) {
    console.error('Error fetching supplier data:', err);
    error(err?.response?.data?.message || 'Failed to fetch supplier data');
  } finally {
    loading.value = false;
  }
};

const buildPayload = (step: number): SupplierPayload => {
  return {
    step,
    supplier_id: supplierId.value || undefined,
    business_name: {
      en: businessNameEn.value,
      ar: businessNameAr.value
    },
    first_name: {
      en: firstNameEn.value,
      ar: firstNameAr.value
    },
    last_name: {
      en: lastNameEn.value,
      ar: lastNameAr.value
    },
    supplier_code: supplierCode.value,
    default_currency_id: defaultCurrency.value,
    mobile: mobile.value,
    phone: phone.value,
    email: email.value,
    address_1: nationalAddress.value,
    buisnessno: businessNumber.value,
    taxno: taxNumber.value,
    is_active: status.value,
    address: {
      country_id: country.value,
      city_id: city.value,
      postal_code: postalCode.value,
      neighborhood: district.value,
      street_name: streetName.value,
      building_number: buildingNumber.value,
      address_1: nationalAddress.value,
      address_2: address2.value
    },
    contact_list: contacts.value.map(contact => ({
      id: contact.id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      mobile: contact.mobile,
      telephone: contact.telephone
    })),
    tree_chart_card_id: account.value
  };
};

const saveStep = async (step: number) => {
  try {
    saving.value = true;
    const payload = buildPayload(step);

    let response: SupplierResponse;

    if (supplierId.value) {
      // Update existing supplier
      response = await api.put(`/admin/api/suppliers/${supplierId.value}`, payload);
    } else {
      // Create new supplier
      response = await api.post('/admin/api/suppliers', payload);
    }

    // Store supplier ID for subsequent saves
    if (response.data.supplier_id) {
      supplierId.value = response.data.supplier_id;
    }

    success(response.message || 'Supplier saved successfully');
    return true;
  } catch (err: any) {
    console.error('Error saving supplier:', err);

    // Handle validation errors
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;
      const errorMessages = Object.values(errors).flat().join('\n');
      error(errorMessages);
    } else {
      error(err?.response?.data?.message || 'Failed to save supplier');
    }
    return false;
  } finally {
    saving.value = false;
  }
};

// Handlers
const handleAddAccount = () => {
  console.log("Add new account");
};

const addContact = () => {
  contacts.value.push({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    telephone: ""
  });
};

const removeContact = (index: number) => {
  contacts.value.splice(index, 1);
};

const handleSave = async () => {
  // Save step 1 first
  const step1Success = await saveStep(1);
  if (!step1Success) return;

  // If on accounting tab, save step 2
  if (activeTab.value === 1) {
    const step2Success = await saveStep(2);
    if (step2Success) {
      router.push({ name: "SuppliersList" });
    }
  } else {
    // Move to accounting tab after saving step 1
    activeTab.value = 1;
  }
};

const handleClose = () => {
  router.push({ name: "SuppliersList" });
};

// Watch country change to fetch cities
watch(country, (newCountryId) => {
  if (newCountryId) {
    city.value = null; // Reset city when country changes
    fetchCities(newCountryId);
  }
});

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCountries(),
    fetchCurrencies(),
    fetchTreeChartCards()
  ]);

  if (isEditing.value) {
    await fetchSupplierData();
  }
});

// Icons
const suppliersIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 6.5C18.5442 6.5 12.5 12.5442 12.5 20C12.5 27.4558 18.5442 33.5 26 33.5C33.4558 33.5 39.5 27.4558 39.5 20C39.5 12.5442 33.4558 6.5 26 6.5ZM16.8333 20C16.8333 14.9374 20.9374 10.8333 26 10.8333C31.0626 10.8333 35.1667 14.9374 35.1667 20C35.1667 25.0626 31.0626 29.1667 26 29.1667C20.9374 29.1667 16.8333 25.0626 16.8333 20Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 37.8333C19.7211 37.8333 14.0289 39.7344 9.88167 42.8177C7.81306 44.3555 6.5 46.9289 6.5 49.8333C6.5 51.0299 7.47005 52 8.66667 52H43.3333C44.5299 52 45.5 51.0299 45.5 49.8333C45.5 46.9289 44.1869 44.3555 42.1183 42.8177C37.9711 39.7344 32.2789 37.8333 26 37.8333ZM10.8333 47.6667C11.1844 46.5889 11.9156 45.6111 12.9817 44.8177C16.3711 42.2989 20.9456 40.6667 26 40.6667C31.0544 40.6667 35.6289 42.2989 39.0183 44.8177C40.0844 45.6111 40.8156 46.5889 41.1667 47.6667H10.8333Z" fill="#1570EF"/>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.08333 0.750122H10.4788C10.8864 0.750122 11.0902 0.750122 11.2821 0.796172C11.4521 0.837 11.6147 0.904341 11.7638 0.995722C11.932 1.09879 12.0761 1.24292 12.3644 1.53117L14.969 4.13574C15.2572 4.42399 15.4013 4.56812 15.5044 4.73631C15.5958 4.88543 15.6631 5.04801 15.7039 5.21807C15.75 5.40988 15.75 5.61371 15.75 6.02136V12.4168M8.66667 6.58346H5.41667C4.94996 6.58346 4.7166 6.58346 4.53834 6.49263C4.38154 6.41273 4.25406 6.28525 4.17416 6.12845C4.08333 5.95019 4.08333 5.71683 4.08333 5.25012V3.66679M9.5 15.7501V12.0835C9.5 11.6167 9.5 11.3834 9.40917 11.2051C9.32928 11.0483 9.20179 10.9208 9.04499 10.8409C8.86673 10.7501 8.63338 10.7501 8.16667 10.7501H5.41667C4.94996 10.7501 4.7166 10.7501 4.53834 10.8409C4.38154 10.9208 4.25406 11.0483 4.17416 11.2051C4.08333 11.3834 4.08333 11.6167 4.08333 12.0835V15.7501M12.8333 6.71907V13.0835C12.8333 14.0169 12.8333 14.4836 12.6517 14.8401C12.4919 15.1537 12.2369 15.4087 11.9233 15.5685C11.5668 15.7501 11.1001 15.7501 10.1667 15.7501H3.41667C2.48325 15.7501 2.01654 15.7501 1.66002 15.5685C1.34641 15.4087 1.09144 15.1537 0.931656 14.8401C0.75 14.4836 0.75 14.0169 0.75 13.0835V6.33346C0.75 5.40003 0.75 4.93332 0.931656 4.5768C1.09144 4.2632 1.34641 4.00823 1.66002 3.84844C2.01654 3.66679 2.48325 3.66679 3.41667 3.66679H9.78105C9.98487 3.66679 10.0868 3.66679 10.1827 3.68981C10.2677 3.71023 10.349 3.7439 10.4236 3.78959C10.5077 3.84112 10.5797 3.91319 10.7239 4.05731L12.4428 5.77626C12.5869 5.92039 12.659 5.99245 12.7105 6.07655C12.7562 6.15111 12.7899 6.2324 12.8103 6.31743C12.8333 6.41333 12.8333 6.51525 12.8333 6.71907Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const closeIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 1L1 13M1 1L13 13" stroke="#344054" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const checkCircleIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12506_1251)">
<path d="M16.5 8.31429V9.00429C16.4991 10.6216 15.9754 12.1953 15.007 13.4907C14.0386 14.786 12.6775 15.7337 11.1265 16.1922C9.57557 16.6508 7.91794 16.5957 6.40085 16.0352C4.88376 15.4747 3.58849 14.4389 2.70822 13.0821C1.82795 11.7253 1.40984 10.1203 1.51626 8.50653C1.62267 6.89272 2.24791 5.35654 3.29871 4.1271C4.34951 2.89766 5.76959 2.04083 7.34714 1.6844C8.92469 1.32798 10.5752 1.49105 12.0525 2.14929M16.5 3L9 10.5075L6.75 8.2575" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12506_1251">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;

const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="supplier-form-page">
      <!-- Header -->
      <PageHeader :icon="suppliersIcon" title-key="pages.suppliers.title"
        description-key="pages.suppliers.description" />

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="custom-tabs mb-6" hide-slider>
        <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
          'custom-tab',
          {
            'custom-tab--active': isTabActive(tab.value),
            'custom-tab--completed': isTabCompleted(tab.value),
          },
        ]">
          {{ tab.title }}
          <span v-if="isTabCompleted(tab.value)" class="ms-2" v-html="checkCircleIcon"></span>
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab">
        <!-- Tab 1: المعلومات الاساسية -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <!-- Supplier Data Section -->
            <div class="mb-6 bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-bold text-primary-900 mb-4">{{ pageTitle }} - بيانات المورد</h2>

              <!-- Row 1: Business Name, First Name, Last Name with Language Tabs -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
                  <template #en>
                    <TextInput v-model="businessNameEn" placeholder="Enter business name in English"
                      :hide-details="true" />
                  </template>
                  <template #ar>
                    <TextInput v-model="businessNameAr" placeholder="ادخل الاسم التجاري بالعربية"
                      :rules="[required()]" :hide-details="true" />
                  </template>
                </LanguageTabs>

                <LanguageTabs :languages="availableLanguages" label="الاسم الأول">
                  <template #en>
                    <TextInput v-model="firstNameEn" placeholder="Enter first name in English"
                      :hide-details="true" />
                  </template>
                  <template #ar>
                    <TextInput v-model="firstNameAr" placeholder="ادخل الاسم الأول بالعربية"
                      :rules="[required()]" :hide-details="true" />
                  </template>
                </LanguageTabs>

                <LanguageTabs :languages="availableLanguages" label="الاسم الأخير">
                  <template #en>
                    <TextInput v-model="lastNameEn" placeholder="Enter last name in English"
                      :hide-details="true" />
                  </template>
                  <template #ar>
                    <TextInput v-model="lastNameAr" placeholder="ادخل الاسم الأخير بالعربية"
                      :hide-details="true" />
                  </template>
                </LanguageTabs>
              </div>

              <!-- Row 2: Supplier Code, Currency -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">كود المورد</div>
                  <div class="bg-gray-200 text-primary-900 rounded-lg px-4 py-2.5 font-bold text-end">
                    {{ supplierCode }}
                  </div>
                </div>
                <SelectInput v-model="defaultCurrency" label="العملة الافتراضية" placeholder="ريال سعودي"
                  :items="currencyItems" :hide-details="false" />
              </div>

              <!-- Row 3: Mobile, Phone, Email -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="mobile" label="الجوال" placeholder="+966 (555) 000-0000" :rules="[required()]"
                  :hide-details="false" dir="ltr">
                  <template #append-inner>
                    <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
                  </template>
                </TextInput>
                <TextInput v-model="phone" dir="ltr" label="الهاتف" placeholder="+966 (555) 000-0000" :hide-details="false">
                  <template #append-inner>
                    <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
                  </template>
                </TextInput>
                <TextInput v-model="email" label="البريد الالكتروني" placeholder="example@gmail.com"
                  :hide-details="false" />
              </div>

              <!-- Row 4: Business Number, Tax Number -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="businessNumber" label="رقم السجل التجاري" placeholder="ادخل الرقم"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
                <TextInput v-model="taxNumber" label="الرقم الضريبي" placeholder="ادخل الرقم" :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
                <div>
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">الحالة</div>
                  <div class="flex items-center gap-4">
                    <v-radio-group v-model="status" inline hide-details class="mt-0">
                      <v-radio label="فعال" :value="true" color="primary" />
                      <v-radio label="غير فعال" :value="false" color="primary" />
                    </v-radio-group>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub-tabs: Address Info / Contact List -->
            <div class="mb-6">
              <div class="flex gap-2 mb-4">
                <v-btn variant="flat" height="56" :class="[
                  'sm:min-w-[200px] text-base px-10  !shadow-none',
                  basicInfoSubTab === 0
                    ? '!bg-primary-600 !text-white'
                    : '!bg-primary-50 !text-primary-700',
                ]" @click="basicInfoSubTab = 0">
                  معلومات العنوان
                </v-btn>
                <v-btn variant="flat" height="56" :class="[
                  'sm:min-w-[200px] text-base px-10 !shadow-none',
                  basicInfoSubTab === 1
                    ? '!bg-primary-600 !text-white'
                    : '!bg-primary-50 !text-primary-700',
                ]" @click="basicInfoSubTab = 1">
                  قائمة الاتصال
                </v-btn>
              </div>

              <!-- Address Info Sub-tab -->
              <div v-if="basicInfoSubTab === 0" class="bg-gray-50 rounded-lg p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <SelectInput v-model="country" label="الدولة" placeholder="الدولة" :items="countryItems"
                    :hide-details="false" />
                  <SelectInput v-model="city" label="المدينة" placeholder="المدينة" :items="cityItems"
                    :hide-details="false" />
                  <TextInput v-model="postalCode" label="الرمز البريدي" placeholder="الرمز البريدي"
                    :hide-details="false" />
                  <TextInput v-model="district" label="اسم الحي" placeholder="اسم الحي" :hide-details="false" />
                  <TextInput v-model="streetName" label="اسم الشارع" placeholder="اسم الشارع" :hide-details="false" />
                  <TextInput v-model="buildingNumber" label="رقم المبنى" placeholder="رقم المبنى"
                    :hide-details="false" />
                  <TextInput v-model="nationalAddress" label="أدخل العنوان الوطني" placeholder="العنوان الوطني" :hide-details="false" />
                  <TextInput v-model="address2" label="العنوان 2" placeholder="العنوان الإضافي" :hide-details="false" />
                </div>
              </div>

              <!-- Contact List Sub-tab -->
              <div v-if="basicInfoSubTab === 1" class="bg-gray-50 rounded-lg p-6">
                <!-- Add Contact Form -->
                <div class="mb-4 flex items-center justify-between flex-wrap gap-4">
                  <h3 class="text-lg font-bold text-gray-600">قائمة جهات الاتصال</h3>
                  <v-btn variant="flat" color="primary" height="40" class="font-semibold text-base mb-4"
                    @click="addContact">
                    <template #prepend>
                      <span v-html="plusIcon"></span>
                    </template>
                    أضف
                  </v-btn>
                </div>

                <!-- Contacts Table -->
                <v-table v-if="contacts.length > 0" class="bg-white rounded-lg">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم الاول</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم الاخر</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">البريد الالكتروني</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الهاتف</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الجوال</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(contact, index) in contacts" :key="index" class="border-b border-gray-200">
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.first_name" placeholder="الاسم الاول" :hide-details="true"
                          density="compact" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.last_name" placeholder="الاسم الاخر" :hide-details="true"
                          density="compact" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.email" placeholder="example@gmail.com" :hide-details="true"
                          density="compact" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.telephone" placeholder="+966" :hide-details="true"
                          density="compact" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.mobile" placeholder="+966" :hide-details="true" density="compact" />
                      </td>
                      <td class="py-3 px-4">
                        <v-btn icon size="small" variant="text" color="error" @click="removeContact(index)">
                          <span v-html="trashIcon"></span>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: المعلومات المحاسبية -->
        <v-tabs-window-item :value="1">
          <div class="mb-6 bg-gray-50 rounded-lg p-6">
            <!-- Create Account Option -->

            <!-- Account Selection -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

              <div class="mb-6">
                <span class="text-sm font-semibold text-gray-700 mb-1 block">انشاء حساب خاص في شجرة المحاسبة</span>
                <v-radio-group v-model="createAccountInTree" inline hide-details>
                  <v-radio label="نعم" :value="true" color="primary" />
                  <v-radio label="لا" :value="false" color="primary" />
                </v-radio-group>
              </div>

              <SelectWithIconInput v-model="account" label="الحساب" placeholder="الحساب" :items="accountItems"
                :hide-details="false"  @add-click="handleAddAccount" />
            </div>
          </div>

          <!-- Balances Section -->
          <div v-if="isEditing" class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900 mb-4">الارصدة</h2>

            <div v-if="supplierBalances.length === 0" class="text-center py-8">
              <p class="text-gray-500">لا توجد أرصدة متاحة</p>
            </div>

            <div v-else class="space-y-6">
              <div v-for="balance in supplierBalances" :key="balance.id"
                class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="text-sm font-semibold text-primary-700 mb-3">{{ balance.currency }}</div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">الرصيد</div>
                    <div class="text-base font-bold text-gray-900">{{ balance.balance }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">المبلغ المستحق</div>
                    <div class="text-base font-bold text-gray-900">{{ balance.last_amount }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">العملة</div>
                    <div class="text-base font-bold text-gray-900">{{ balance.currency }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">تاريخ التدقيق الأخير</div>
                    <div class="text-sm font-medium text-gray-700">{{ balance.last_validated_date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 mt-6">
        <v-btn variant="flat" color="primary" prepend-icon="mdi-content-save-all-outline" height="48"
          class="font-semibold text-base  px-8 sm:!px-20" @click="handleSave" :loading="saving" :disabled="saving">
          <span>حفظ</span>
        </v-btn>

        <v-btn variant="outlined" height="48" prepend-icon="mdi-close" color="primary"
          class="font-semibold text-base px-8 border-gray-300 bg-primary-50 px-8 sm:!px-20" @click="handleClose"
          :disabled="saving">
          <span>اغلاق</span>
        </v-btn>
      </div>
    </div>
  </default-layout>
</template>

<style scoped>
.custom-tabs {
  border-bottom: none;
}

.custom-tab {
  @apply rounded-lg px-6 py-2 text-base font-semibold text-gray-600 bg-white border border-gray-300 mx-1;
  text-transform: none;
  letter-spacing: normal;
}

.custom-tab--active {
  @apply bg-primary-600 text-white border-primary-600;
}

.custom-tab--completed {
  @apply bg-primary-600 text-white border-primary-600;
}
</style>
