<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

// TypeScript Interfaces
interface ConstantItem {
  key: string;
  label: string;
}

interface ListItem {
  id: number;
  name: string;
}

interface CustomerConstants {
  types: ConstantItem[];
  entity_types: ConstantItem[];
  price_types: ConstantItem[];
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

interface CustomerBalance {
  id: number;
  currency: string;
  debit: string;
  credit: string;
  balance: string;
  last_amount: string;
  last_validated_date: string;
}

interface CustomerPayload {
  step: number;
  customer_id?: number;
  customer_type: string;
  full_name: {
    en: string;
    ar: string;
  };
  customer_code: string;
  mobile: string;
  phone: string;
  email: string;
  trade_name: string;
  legal_name: string;
  entity_type: string | null;
  commercial_register: string;
  address: Address;
  contact_list: ContactListItem[];
  price_type: string | null;
  customer_category_id: number | null;
  sales_man_id: number | null;
  tree_chart_card_id: number | null;
  related_customers: number[];
  minimum_credit: number | string;
  maximum_credit: number | string;
  minimum_debit: number | string;
  maximum_debit: number | string;
  is_active: boolean;
}

interface CustomerResponse {
  status: number;
  code: number;
  locale: string;
  message: string;
  data: {
    customer_id: number;
  };
}

// Check if editing
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'تعديل عميل' : 'إضافة عميل');

// Loading states
const loading = ref(false);
const saving = ref(false);
const loadingConstants = ref(false);

// Customer ID for step 2
const customerId = ref<number | null>(null);

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
    return !!(fullNameAr.value && mobile.value && customerId.value);
  }
  // When creating, only check required fields (customerId will be set after first save)
  return !!(fullNameAr.value && mobile.value);
});

const accountingInfoCompleted = computed(() => {
  if (createAccountInTree.value === null) return false;
  if (createAccountInTree.value === false) return true;
  return !!account.value;
});

// Form data - Basic Info
const accountType = ref<string>('individual');
const customerCode = ref("CU-5478544");
const fullNameAr = ref("");
const fullNameEn = ref("");
const commercialName = ref("");
const legalName = ref("");
const mobile = ref("");
const phone = ref("");
const email = ref("");
const entityType = ref<string | null>(null);
const taxNumber = ref("");
const status = ref(true);

// Address Info (sub-tab)
const country = ref<number | null>(null);
const city = ref<number | null>(null);
const postalCode = ref("");
const district = ref("");
const streetName = ref("");
const buildingNumber = ref("");
const nationalAddress = ref("");
const address2 = ref("");

// Contact List
const contacts = ref<ContactListItem[]>([]);

// Accounting Info
const priceType = ref<string | null>(null);
const customerClassification = ref<number | null>(null);
const salesRepresentative = ref<number | null>(null);
const createAccountInTree = ref<boolean | null>(true);
const account = ref<number | null>(null);
const relatedCustomers = ref<(number | string)[]>([]);
const minimumCredit = ref<number | string>("");
const maximumCredit = ref<number | string>("");
const minimumDebit = ref<number | string>("");
const maximumDebit = ref<number | string>("");
const defaultStatus = ref(true);

// Balances (read-only from API)
const customerBalances = ref<CustomerBalance[]>([]);

// Dropdown items from API
const customerTypeItems = ref<{ title: string; value: string }[]>([]);
const entityTypeItems = ref<{ title: string; value: string }[]>([]);
const priceTypeItems = ref<{ title: string; value: string }[]>([]);
const countryItems = ref<{ title: string; value: number }[]>([]);
const cityItems = ref<{ title: string; value: number }[]>([]);
const customerClassificationItems = ref<{ title: string; value: number }[]>([]);
const salesRepresentativeItems = ref<{ title: string; value: number }[]>([]);
const accountItems = ref<{ title: string; value: number }[]>([]);
const relatedCustomersItems = ref<{ title: string; value: number }[]>([]);

// Sub-tabs for basic info section
const basicInfoSubTab = ref(0);

// API Functions
const fetchConstants = async () => {
  try {
    loadingConstants.value = true;
    const response = await api.get<{ data: CustomerConstants }>('/admin/api/customers/constants');

    customerTypeItems.value = response.data.types.map(item => ({
      title: item.label,
      value: item.key
    }));

    entityTypeItems.value = response.data.entity_types.map(item => ({
      title: item.label,
      value: item.key
    }));

    priceTypeItems.value = response.data.price_types.map(item => ({
      title: item.label,
      value: item.key
    }));
  } catch (err: any) {
    console.error('Error fetching constants:', err);
    error(err?.response?.data?.message || 'Failed to fetch constants');
  } finally {
    loadingConstants.value = false;
  }
};

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

const fetchCustomerCategories = async () => {
  try {
    const response = await api.get<{ data: ListItem[] }>('/admin/api/customer-categories/list');
    customerClassificationItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching customer categories:', err);
  }
};

const fetchSalesMans = async () => {
  try {
    const response = await api.get<{ data: ListItem[] }>('/admin/api/sales-man/list');
    salesRepresentativeItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching sales mans:', err);
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

const fetchRelatedCustomers = async () => {
  if (!customerId.value) return;
  try {
    const response = await api.get<{ data: { id: number; full_name: string }[] }>(
      `/admin/api/customers/list?related_customer=${customerId.value}`
    );
    relatedCustomersItems.value = response.data.map(item => ({
      title: item.full_name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching related customers:', err);
  }
};

const fetchCustomerData = async () => {
  if (!route.params.id) return;

  try {
    loading.value = true;
    const response = await api.get<any>(`/admin/api/customers/${route.params.id}`);
    const data = response.data;

    // Set customer ID
    customerId.value = data.id;

    // Basic Info
    accountType.value = data.customer_type;
    fullNameAr.value = data.full_name;
    fullNameEn.value = data.full_name;
    customerCode.value = data.customer_code;
    mobile.value = data.mobile;
    phone.value = data.phone;
    email.value = data.email;
    commercialName.value = data.trade_name;
    legalName.value = data.legal_name;
    entityType.value = data.entity_type;
    taxNumber.value = data.commercial_register;
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

    // Customer Balances
    customerBalances.value = data.customer_balances || [];

    // Accounting Info
    priceType.value = data.price_type;
    customerClassification.value = data.customer_classification_id;
    salesRepresentative.value = data.sales_man_id;
    account.value = data.tree_chart_card_id;
    relatedCustomers.value = data.related_customers?.map((id: string) => parseInt(id)) || [];
    minimumCredit.value = data.minimum_credit;
    maximumCredit.value = data.maximum_credit;
    minimumDebit.value = data.minimum_debit;
    maximumDebit.value = data.maximum_debit;
    defaultStatus.value = data.is_active;

    // Fetch related customers
    await fetchRelatedCustomers();
  } catch (err: any) {
    console.error('Error fetching customer data:', err);
    error(err?.response?.data?.message || 'Failed to fetch customer data');
  } finally {
    loading.value = false;
  }
};

const buildPayload = (step: number): CustomerPayload => {
  return {
    step,
    customer_id: customerId.value || undefined,
    customer_type: accountType.value,
    full_name: {
      en: fullNameEn.value,
      ar: fullNameAr.value
    },
    customer_code: customerCode.value,
    mobile: mobile.value,
    phone: phone.value,
    email: email.value,
    trade_name: commercialName.value,
    legal_name: legalName.value,
    entity_type: entityType.value,
    commercial_register: taxNumber.value,
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
    price_type: priceType.value,
    customer_category_id: customerClassification.value,
    sales_man_id: salesRepresentative.value,
    tree_chart_card_id: account.value,
    related_customers: relatedCustomers.value.map(id => typeof id === 'string' ? parseInt(id) : id),
    minimum_credit: minimumCredit.value,
    maximum_credit: maximumCredit.value,
    minimum_debit: minimumDebit.value,
    maximum_debit: maximumDebit.value,
    is_active: defaultStatus.value
  };
};

const saveStep = async (step: number) => {
  try {
    saving.value = true;
    const payload = buildPayload(step);

    let response: CustomerResponse;

    if (customerId.value) {
      // Update existing customer
      response = await api.put(`/admin/api/customers/${customerId.value}`, payload);
    } else {
      // Create new customer
      response = await api.post('/admin/api/customers', payload);
    }

    // Store customer ID for subsequent saves
    if (response.data.customer_id) {
      customerId.value = response.data.customer_id;
    }

    success(response.message || 'Customer saved successfully');
    return true;
  } catch (err: any) {
    console.error('Error saving customer:', err);

    // Handle validation errors
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;
      const errorMessages = Object.values(errors).flat().join('\n');
      error(errorMessages);
    } else {
      error(err?.response?.data?.message || 'Failed to save customer');
    }
    return false;
  } finally {
    saving.value = false;
  }
};

// Handlers
const handleAddClassification = () => {
  console.log("Add new classification");
};

const handleAddSalesRep = () => {
  console.log("Add new sales representative");
};

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

const deleteContact = (index: number) => {
  contacts.value.splice(index, 1);
};

const handleSave = async () => {
  const { valid } = await formRef.value?.validate();
  if (!valid) {
    error('Please fill all required fields');
    return;
  }

  // Save step 1 (basic info)
  if (activeTab.value === 0) {
    const saved = await saveStep(1);
    if (saved) {
      // Move to accounting tab
      activeTab.value = 1;
    }
  }
  // Save step 2 (accounting info)
  else if (activeTab.value === 1) {
    const saved = await saveStep(2);
    if (saved) {
      router.push({ name: "CustomersList" });
    }
  }
};

const handleClose = () => {
  router.push({ name: "CustomersList" });
};

// Watch country change to fetch cities
const handleCountryChange = async (countryId: string | number | null | (string | number)[]) => {
  // Handle array case (shouldn't happen for single select, but type-safe)
  const singleValue = Array.isArray(countryId) ? countryId[0] : countryId;

  if (singleValue) {
    city.value = null;
    const numericId = typeof singleValue === 'string' ? parseInt(singleValue) : singleValue;
    await fetchCities(numericId);
  }
};

// Lifecycle
onMounted(async () => {
  // Fetch all dropdown data
  await Promise.all([
    fetchConstants(),
    fetchCountries(),
    fetchCustomerCategories(),
    fetchSalesMans(),
    fetchTreeChartCards()
  ]);

  // If editing, fetch customer data
  if (isEditing.value) {
    await fetchCustomerData();
  }
});

// Icons
const customersIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 6.5C18.5442 6.5 12.5 12.5442 12.5 20C12.5 27.4558 18.5442 33.5 26 33.5C33.4558 33.5 39.5 27.4558 39.5 20C39.5 12.5442 33.4558 6.5 26 6.5ZM16.8333 20C16.8333 14.9374 20.9374 10.8333 26 10.8333C31.0626 10.8333 35.1667 14.9374 35.1667 20C35.1667 25.0626 31.0626 29.1667 26 29.1667C20.9374 29.1667 16.8333 25.0626 16.8333 20Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 37.8333C19.7211 37.8333 14.0289 39.7344 9.88167 42.8177C7.81306 44.3555 6.5 46.9289 6.5 49.8333C6.5 51.0299 7.47005 52 8.66667 52H43.3333C44.5299 52 45.5 51.0299 45.5 49.8333C45.5 46.9289 44.1869 44.3555 42.1183 42.8177C37.9711 39.7344 32.2789 37.8333 26 37.8333ZM10.8333 47.6667C11.1844 46.5889 11.9156 45.6111 12.9817 44.8177C16.3711 42.2989 20.9456 40.6667 26 40.6667C31.0544 40.6667 35.6289 42.2989 39.0183 44.8177C40.0844 45.6111 40.8156 46.5889 41.1667 47.6667H10.8333Z" fill="#1570EF"/>
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
    <div class="customer-form-page">
      <!-- Header -->
      <PageHeader :icon="customersIcon" title-key="pages.customers.title"
        description-key="pages.customers.description" />

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="custom-tabs mb-6" hide-slider>
        <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" :class="[
          'custom-tab',
          {
            'custom-tab--active': isTabActive(tab.value),
            'custom-tab--completed': isTabCompleted(tab.value),
          },
        ]" @click="handleTabChange(tab.value, $event)">
          {{ tab.title }}
          <span v-if="isTabCompleted(tab.value)" class="ms-2" v-html="checkCircleIcon"></span>
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab">
        <!-- Tab 1: المعلومات الاساسية -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <!-- Customer Data Section -->
            <div class="mb-6 bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-bold text-primary-900 mb-4">بيانات العميل</h2>

              <!-- Account Type -->
              <div class="mb-4">
                <span class="text-sm font-semibold text-gray-700 mb-1 block">نوع حساب العميل</span>
                <v-radio-group v-model="accountType" inline hide-details>
                  <v-radio label="فردي" value="individual" color="primary" />
                  <v-radio label="تجاري" value="commercial" color="primary" />
                </v-radio-group>
              </div>

              <!-- Row 1: Full Name, Customer Code -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="fullNameAr" label="الاسم كامل بالعربية" placeholder="الاسم كامل بالعربية"
                  :rules="[required()]" :hide-details="false" />
                <TextInput v-model="fullNameEn" label="الاسم كامل بالإنحليزية" placeholder="الاسم كامل بالإنحليزية"
                  :rules="[required()]" :hide-details="false" />
                <div>
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">الكود</div>
                  <div class="bg-gray-200 text-primary-900 rounded-lg px-4 py-2.5 font-bold text-end">
                    {{ customerCode }}
                  </div>
                </div>

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
                <TextInput v-model="email" dir="ltr" label="البريد الالكتروني" placeholder="البريد الالكتروني"
                  :hide-details="false" />
                <TextInput v-model="commercialName" label="الاسم التجاري" placeholder="Al-Nahda Contracting"
                  :hide-details="false" />
                <TextInput v-model="legalName" label="الاسم القانوني" placeholder="Al-Nahda Construction LLC"
                  :hide-details="false" />
                <SelectWithIconInput v-model="entityType" label="نوع الكيان" placeholder="Establishment"
                  :items="entityTypeItems" :hide-details="false" />

                <TextInput v-model="taxNumber" label="السجل التجاري" placeholder="1255" :hide-details="false" />
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
                <!-- Row 1: Country, City, Postal Code -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <SelectInput v-model="country" label="الدولة" placeholder="الدولة" :items="countryItems"
                    :hide-details="false" @update:model-value="handleCountryChange" />
                  <SelectInput v-model="city" label="المدينة" placeholder="المدينة" :items="cityItems"
                    :hide-details="false" :disabled="!country" />
                  <TextInput v-model="postalCode" label="الرمز البريدي" placeholder="00000" :hide-details="false" />
                  <TextInput v-model="district" label="اسم الحي" placeholder="الحي" :hide-details="false" />
                  <TextInput v-model="streetName" label="اسم الشارع" placeholder="الشارع" :hide-details="false" />
                  <TextInput v-model="buildingNumber" label="رقم المبنى" placeholder="00000" :hide-details="false" />
                  <TextInput v-model="nationalAddress" label="العنوان الوطني" placeholder="ادخل العنوان"
                    :hide-details="false">
                    <template #prepend-inner>
                      <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                    </template>
                  </TextInput>
                  <TextInput v-model="address2" label="عنوان 2" placeholder="العنوان" :hide-details="false" />
                </div>
              </div>

              <!-- Contact List Sub-tab -->
              <div v-if="basicInfoSubTab === 1" class="bg-gray-50 rounded-lg p-6">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-bold text-primary-900">قائمة عملاء العميل</h2>
                  <v-btn variant="flat" color="primary" height="40" class="font-semibold" @click="addContact"
                    prepend-icon="mdi-plus">
                    اضف
                  </v-btn>
                </div>

                <!-- Contacts Table with Editable Inputs -->
                <v-table v-if="contacts.length > 0" class="bg-white rounded-lg">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم الاول</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم الاخير</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">البريد الالكتروني</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الهاتف</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الجوال</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(contact, index) in contacts" :key="index" class="border-b border-gray-200">
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.first_name" density="compact" variant="outlined" hide-details
                          placeholder="الاسم الاول" :input-props="{ class: '!min-w-[160px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.last_name" density="compact" variant="outlined" hide-details
                          placeholder="الاسم الاخير" :input-props="{ class: '!min-w-[160px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.email" density="compact" variant="outlined" hide-details
                          placeholder="example@gmail.com" :input-props="{ class: '!min-w-[200px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.telephone" density="compact" variant="outlined" hide-details
                          placeholder="96600000000+" :input-props="{ class: '!min-w-[150px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.mobile" density="compact" variant="outlined" hide-details
                          placeholder="96600000000+" :input-props="{ class: '!min-w-[150px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <v-btn icon size="small" variant="text" @click="deleteContact(index)">
                            <span v-html="trashIcon"></span>
                          </v-btn>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
                <div v-else class="text-center py-8 text-gray-500">
                  لا توجد جهات اتصال. انقر على "اضف" لإضافة جهة اتصال جديدة.
                </div>
              </div>
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: المعلومات المحاسبية -->
        <v-tabs-window-item :value="1">
          <div class="mb-6 bg-gray-50 rounded-lg p-6">
            <!-- Row 1: Price Type, Price List, Customer Classification -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SelectInput v-model="priceType" label="نوع السعر" placeholder="نوع السعر" :items="priceTypeItems"
                :hide-details="false" />
              <!-- <SelectWithIconInput v-model="priceList" label="قائمة الاسعار" placeholder="قائمة الاسعار"
                :items="priceListItems" :hide-details="false"  @add-click="handleAddPriceList" /> -->
              <SelectWithIconInput v-model="customerClassification" label="تصنيف العميل" placeholder="تصنيف العميل"
                :items="customerClassificationItems" :hide-details="false" @add-click="handleAddClassification" />
              <SelectWithIconInput v-model="salesRepresentative" label="مندوب المبيعات" placeholder="مندوب المبيعات"
                :items="salesRepresentativeItems" :hide-details="false" @add-click="handleAddSalesRep" />
              <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">انشاء حساب خاص في شجرة المحاسبة</span>
                <v-radio-group v-model="createAccountInTree" inline hide-details>
                  <v-radio label="نعم" :value="true" color="primary" />
                  <v-radio label="لا" :value="false" color="primary" />
                </v-radio-group>
              </div>
              <SelectWithIconInput v-model="account" label="الحساب" placeholder="الحساب" :items="accountItems"
                :hide-details="false" @add-click="handleAddAccount" />
              <SelectInput v-model="relatedCustomers" label="العملاء المرتبطين" placeholder="العملاء المرتبطين"
                :items="relatedCustomersItems" :hide-details="false" multiple />
              <TextInput v-model="minimumCredit" label="الحد الادنى (دائن)" placeholder="الحد الادنى" type="number"
                :hide-details="false" />
              <TextInput v-model="maximumCredit" label="الحد الاعلى (دائن)" placeholder="الحد الاعلى" type="number"
                :hide-details="false" />
              <TextInput v-model="minimumDebit" label="الحد الادنى (مدين)" placeholder="الحد الادنى" type="number"
                :hide-details="false" />
              <TextInput v-model="maximumDebit" label="الحد الاعلى (مدين)" placeholder="الحد الاعلى" type="number"
                :hide-details="false" />
              <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">الحالة الافتراضية</span>
                <v-radio-group v-model="defaultStatus" inline hide-details>
                  <v-radio label="فعال" :value="true" color="primary" />
                  <v-radio label="غير فعال" :value="false" color="primary" />
                </v-radio-group>
              </div>
            </div>




          </div>

          <!-- Balances Section -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900 mb-4">الارصدة</h2>

            <div v-if="customerBalances.length === 0" class="text-center text-gray-500 py-4">
              لا توجد أرصدة متاحة
            </div>

            <div v-else class="space-y-6">
              <div v-for="balance in customerBalances" :key="balance.id"
                class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="text-sm font-semibold text-primary-700 mb-3">{{ balance.currency }}</div>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">دائن</div>
                    <div class="text-base font-bold text-gray-900">{{ parseFloat(balance.debit).toFixed(2) }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">مدين</div>
                    <div class="text-base font-bold text-gray-900">{{ parseFloat(balance.credit).toFixed(2) }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">الرصيد</div>
                    <div class="text-base font-bold text-primary-700">{{ parseFloat(balance.balance).toFixed(2) }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">آخر مبلغ</div>
                    <div class="text-base font-bold text-gray-900">{{ parseFloat(balance.last_amount).toFixed(2) }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-xs font-semibold text-gray-600 mb-1">آخر تحديث</div>
                    <div class="text-sm font-medium text-gray-700">{{ new
                      Date(balance.last_validated_date).toLocaleDateString('ar-SA') }}</div>
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
          class="font-semibold text-base  px-8 sm:!px-20" @click="handleSave" :loading="saving" :disabled="loading">
          <span>{{ activeTab === 0 ? 'حفظ والمتابعة' : 'حفظ' }}</span>
        </v-btn>

        <v-btn variant="outlined" height="48" prepend-icon="mdi-close" color="primary"
          class="font-semibold text-base px-8 border-gray-300 bg-primary-50 px-8 sm:!px-20" @click="handleClose">
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
