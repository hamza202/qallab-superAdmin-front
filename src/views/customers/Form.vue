<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { infoCircleIcon } from "@/components/icons/globalIcons";

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
  trade_name: {
    en: string;
    ar: string;
  };
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

// Form errors from backend validation
const formErrors = reactive<Record<string, string>>({});

// Page loading
const pageLoading = ref(false);

// Tabs
const activeTab = ref(0);
const tabs = [
  {
    title: "المعلومات الاساسية", value: 0, icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>` },
  {
    title: "المعلومات المحاسبية", value: 1, icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.5 4.5L4.5 15.5M6.5 8.5V4.5M4.5 6.5H8.5M11.5 13.5H15.5M5.8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V5.8C19 4.11984 19 3.27976 18.673 2.63803C18.3854 2.07354 17.9265 1.6146 17.362 1.32698C16.7202 1 15.8802 1 14.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
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
const commercialNameAr = ref("");
const commercialNameEn = ref("");
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
    const response = await api.get<{ data: CustomerConstants }>('/customers/constants');

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
    const response = await api.get<{ data: ListItem[] }>('/countries/list');
    countryItems.value = response.data.map(item => ({
      title: item.name,
      value: item.id
    }));
  } catch (err: any) {
    console.error('Error fetching countries:', err);
  }
};

const fetchCities = async () => {
  try {
    const response = await api.get<{ data: ListItem[] }>(`/cities/list`);
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
    const response = await api.get<{ data: ListItem[] }>('/customer-categories/list');
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
    const response = await api.get<{ data: ListItem[] }>('/sales-man/list');
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
    const response = await api.get<{ data: ListItem[] }>('/tree-chart-cards/list');
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
      `/customers/list?related_customer=${customerId.value}`
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
    const response = await api.get<any>(`/customers/${route.params.id}`);
    const data = response.data;

    // Set customer ID
    customerId.value = data.id;

    // Basic Info
    accountType.value = data.customer_type;
    fullNameAr.value = data.full_name_translations?.ar || data.full_name || '';
    fullNameEn.value = data.full_name_translations?.en || data.full_name || '';
    customerCode.value = data.customer_code;
    mobile.value = data.mobile;
    phone.value = data.phone;
    email.value = data.email;
    commercialNameAr.value = data.trade_name_translations?.ar || data.trade_name || '';
    commercialNameEn.value = data.trade_name_translations?.en || data.trade_name || '';
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
    trade_name: {
      en: commercialNameEn.value,
      ar: commercialNameAr.value
    },
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
    // Clear previous errors
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    saving.value = true;
    const payload = buildPayload(step);

    let response: CustomerResponse;

    if (customerId.value) {
      // Update existing customer
      response = await api.put(`/customers/${customerId.value}`, payload);
    } else {
      // Create new customer
      response = await api.post('/customers', payload);
    }

    // Store customer ID for subsequent saves
    if (response.data.customer_id) {
      customerId.value = response.data.customer_id;
    }

    success(response.message || 'تم حفظ العميل بنجاح');
    return true;
  } catch (err: any) {
    console.error('Error saving customer:', err);

    // Handle validation errors (422 status)
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      error(err?.response?.data?.message || 'فشل حفظ العميل');
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
  if (formRef.value && typeof formRef.value.validate === 'function') {
    const { valid } = await formRef.value.validate();
    if (!valid) {
      error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
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


// Lifecycle
onMounted(async () => {
  pageLoading.value = true;
  await Promise.all([
    fetchConstants(),
    fetchCountries(),
    fetchCities(),
    fetchCustomerCategories(),
    fetchSalesMans(),
    fetchTreeChartCards()
  ]);

  if (isEditing.value) {
    await fetchCustomerData();
  }
  pageLoading.value = false;
});

// Icons
const customersIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.85 26H36.4837C37.6258 26 38.6112 25.9999 39.4227 26.0662C40.2793 26.1362 41.1313 26.2907 41.9511 26.7085C43.1742 27.3316 44.1685 28.326 44.7917 29.5491C45.2094 30.3689 45.3639 31.2209 45.4339 32.0774C45.5002 32.889 45.5002 33.8743 45.5002 35.0164V36.4836C45.5002 37.6257 45.5002 38.611 45.4339 39.4226C45.3639 40.2791 45.2094 41.1311 44.7917 41.9509C44.1685 43.174 43.1742 44.1684 41.9511 44.7915C41.1313 45.2093 40.2793 45.3638 39.4227 45.4338C38.6111 45.5001 37.6258 45.5 36.4836 45.5H32.85C31.7079 45.5 30.7225 45.5001 29.9109 45.4338C29.0544 45.3638 28.2024 45.2093 27.3826 44.7915C26.1595 44.1684 25.1651 43.174 24.542 41.9509C24.1242 41.1311 23.9697 40.2791 23.8997 39.4226C23.8334 38.611 23.8335 37.6257 23.8335 36.4835V35.0165C23.8335 33.8743 23.8334 32.889 23.8997 32.0774C23.9697 31.2209 24.1242 30.3689 24.542 29.5491C25.1651 28.326 26.1595 27.3316 27.3826 26.7085C28.2024 26.2907 29.0544 26.1362 29.9109 26.0662C30.7225 25.9999 31.7078 26 32.85 26ZM30.2638 30.3852C29.6752 30.4333 29.457 30.5149 29.3499 30.5695C28.9422 30.7772 28.6107 31.1087 28.403 31.5164C28.3484 31.6235 28.2668 31.8417 28.2187 32.4303C28.1685 33.0442 28.1668 33.8508 28.1668 35.1V36.4C28.1668 37.6492 28.1685 38.4558 28.2187 39.0697C28.2668 39.6583 28.3484 39.8765 28.403 39.9836C28.6107 40.3913 28.9422 40.7228 29.3499 40.9305C29.457 40.9851 29.6752 41.0667 30.2638 41.1148C30.8777 41.165 31.6843 41.1667 32.9335 41.1667H36.4002C37.6494 41.1667 38.456 41.165 39.0699 41.1148C39.6585 41.0667 39.8767 40.9851 39.9838 40.9305C40.3915 40.7228 40.723 40.3913 40.9307 39.9836C40.9853 39.8765 41.0669 39.6583 41.115 39.0697C41.1652 38.4558 41.1668 37.6492 41.1668 36.4V35.1C41.1668 33.8508 41.1652 33.0442 41.115 32.4303C41.0669 31.8417 40.9853 31.6235 40.9307 31.5164C40.723 31.1087 40.3915 30.7772 39.9838 30.5695C39.8767 30.5149 39.6585 30.4333 39.0699 30.3852C38.456 30.335 37.6494 30.3333 36.4002 30.3333H32.9335C31.6843 30.3333 30.8777 30.335 30.2638 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9018 6.50009C13.0769 6.49944 12.3666 6.49887 11.7321 6.62508C9.15361 7.13798 7.13798 9.15361 6.62508 11.7321C6.49887 12.3666 6.49944 13.0769 6.50009 13.9018L6.50019 14.0835L6.50009 14.2653C6.49944 15.0901 6.49887 15.8004 6.62508 16.4349C7.13798 19.0134 9.15361 21.0291 11.7321 21.542C12.3666 21.6682 13.0769 21.6676 13.9018 21.667H38.0986C38.9235 21.6676 39.6338 21.6682 40.2683 21.542C42.8468 21.0291 44.8624 19.0134 45.3753 16.4349C45.5015 15.8005 45.5009 15.0902 45.5003 14.2654L45.5002 14.0835L45.5003 13.9017C45.5009 13.0769 45.5015 12.3666 45.3753 11.7321C44.8624 9.15361 42.8468 7.13798 40.2683 6.62508C39.6338 6.49887 38.9235 6.49944 38.0986 6.50009H13.9018ZM12.5775 10.8752C12.734 10.844 12.9729 10.8335 14.0835 10.8335H37.9169C39.0275 10.8335 39.2663 10.844 39.4229 10.8752C40.2824 11.0461 40.9543 11.718 41.1252 12.5775C41.1564 12.734 41.1669 12.9729 41.1669 14.0835C41.1669 15.1941 41.1564 15.433 41.1252 15.5896C40.9543 16.449 40.2824 17.1209 39.4229 17.2919C39.2663 17.323 39.0275 17.3335 37.9169 17.3335H14.0835C12.9729 17.3335 12.734 17.323 12.5775 17.2919C11.718 17.1209 11.0461 16.449 10.8752 15.5896C10.844 15.433 10.8335 15.1941 10.8335 14.0835C10.8335 12.9729 10.844 12.734 10.8752 12.5775C11.0461 11.718 11.718 11.0461 12.5775 10.8752Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.0002 26.0003C9.41035 26.0003 6.5002 28.9104 6.5002 32.5003V39.0003C6.5002 42.5901 9.41035 45.5003 13.0002 45.5003C16.59 45.5003 19.5002 42.5901 19.5002 39.0003V32.5003C19.5002 28.9104 16.5901 26.0003 13.0002 26.0003ZM10.8335 32.5003C10.8335 31.3036 11.8036 30.3336 13.0002 30.3336C14.1968 30.3336 15.1669 31.3036 15.1669 32.5003V39.0003C15.1669 40.1969 14.1968 41.1669 13.0002 41.1669C11.8036 41.1669 10.8335 40.1969 10.8335 39.0003V32.5003Z" fill="#1570EF"/>
</svg>`;

const plusIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
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
const locationIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 13.2864C2.14864 14.1031 1 15.2412 1 16.5C1 18.9853 5.47715 21 11 21C16.5228 21 21 18.9853 21 16.5C21 15.2412 19.8514 14.1031 18 13.2864M17 7C17 11.0637 12.5 13 11 16C9.5 13 5 11.0637 5 7C5 3.68629 7.68629 1 11 1C14.3137 1 17 3.68629 17 7ZM12 7C12 7.55228 11.5523 8 11 8C10.4477 8 10 7.55228 10 7C10 6.44772 10.4477 6 11 6C11.5523 6 12 6.44772 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const listIcon = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 8L7 8M19 2L7 2M19 14L7 14M3 8C3 8.55228 2.55228 9 2 9C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7C2.55228 7 3 7.44772 3 8ZM3 2C3 2.55228 2.55228 3 2 3C1.44772 3 1 2.55228 1 2C1 1.44772 1.44772 1 2 1C2.55228 1 3 1.44772 3 2ZM3 14C3 14.5523 2.55228 15 2 15C1.44772 15 1 14.5523 1 14C1 13.4477 1.44772 13 2 13C2.55228 13 3 13.4477 3 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;


const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="customer-form-page">
      <!-- Header -->
      <PageHeader :icon="customersIcon" title-key="pages.customers.title"
        description-key="pages.customers.description" />

      <!-- Tabs -->
      <div class="flex gap-2 overflow-y-auto py-4 px-6 border-y border-gray-200 -mx-6 mb-3">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
          'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
          isTabActive(tab.value)
            ? 'bg-primary-500 text-white'
            : 'text-gray-400 hover:bg-gray-50',
        ]">
          <span v-html="tab.icon" class="w-6 h-6"></span>
          <span class="text-base font-semibold whitespace-nowrap">{{
            tab.title
          }}</span>
        </button>
      </div>

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
                <v-radio-group v-model="accountType" inline hide-details
                  @update:model-value="delete formErrors['customer_type']">
                  <v-radio :label="item.title" :value="item.value" color="primary" v-for="item in customerTypeItems" :key="item.value" />
                </v-radio-group>
                <div v-if="formErrors['customer_type']" class="text-error text-xs mt-1">{{ formErrors['customer_type']
                  }}</div>
              </div>

              <!-- Row 1: Full Name, Customer Code -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 mb-4">
                <div class="md:col-span-2">
                  <LanguageTabs :languages="availableLanguages" label="الاسم كامل">
                    <template #en>
                      <TextInput v-model="fullNameEn" placeholder="Full name (English)" :rules="[required()]"
                        :hide-details="false" :error-messages="formErrors['full_name.en']"
                        @input="delete formErrors['full_name.en']" />
                    </template>
                    <template #ar>
                      <TextInput v-model="fullNameAr" placeholder="الاسم الكامل بالعربية" :rules="[required()]"
                        :hide-details="false" :error-messages="formErrors['full_name.ar']"
                        @input="delete formErrors['full_name.ar']" />
                    </template>
                  </LanguageTabs>
                </div>
                <div>
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">الكود</div>
                  <div class="bg-gray-200 text-primary-900 rounded-lg px-4 py-2.5 font-bold text-end">
                    {{ customerCode }}
                  </div>
                </div>

                <TelInput v-model="mobile" label="الجوال" :rules="[required(), saudiPhone()]"
                  :error-messages="formErrors['mobile']" @input="delete formErrors['mobile']" />
                <TelInput v-model="phone" label="الهاتف" :error-messages="formErrors['phone']"
                  @input="delete formErrors['phone']" :rules="[saudiPhone()]" />

                <TextInput v-model="email" dir="ltr" label="البريد الالكتروني" placeholder="مثال: name@domain.com"
                  :rules="[required()]" :hide-details="false" :error-messages="formErrors['email']"
                  @input="delete formErrors['email']" />

                <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
                  <template #en>
                    <TextInput v-model="commercialNameEn" placeholder="Trade name (English)"
                      :rules="[required()]" :hide-details="false" :error-messages="formErrors['trade_name.en']"
                      @input="delete formErrors['trade_name.en']" />
                  </template>
                  <template #ar>
                    <TextInput v-model="commercialNameAr" placeholder="الاسم التجاري بالعربية"
                      :rules="[required()]" :hide-details="false" :error-messages="formErrors['trade_name.ar']"
                      @input="delete formErrors['trade_name.ar']" />
                  </template>
                </LanguageTabs>

                <TextInput v-model="legalName" label="الاسم القانوني" placeholder="ادخل الاسم القانوني"
                  :hide-details="false" :error-messages="formErrors['legal_name']"
                  @input="delete formErrors['legal_name']" />
                <SelectWithIconInput show-add-button v-model="entityType" label="نوع الكيان" placeholder="اختر نوع الكيان"
                  :items="entityTypeItems" :hide-details="false" :error-messages="formErrors['entity_type']"
                  @update:model-value="delete formErrors['entity_type']" />

                <TextInput v-model="taxNumber" label="السجل التجاري" placeholder="ادخل رقم السجل التجاري" :hide-details="false"
                  :error-messages="formErrors['commercial_register']"
                  @input="delete formErrors['commercial_register']" />
              </div>
            </div>

            <!-- Sub-tabs: Address Info / Contact List -->
            <div class="mb-6">
              <div class="flex gap-2 overflow-y-auto py-4 px-6 border-y border-gray-200 -mx-6">
                <button @click="basicInfoSubTab = 0" :class="[
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
                  basicInfoSubTab === 0
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-gray-50',
                ]">
                  <span v-html="locationIcon"></span>
                  <span class="text-base font-semibold whitespace-nowrap"> معلومات العنوان </span>
                </button>
                <button @click="basicInfoSubTab = 1" :class="[
                  'flex items-center gap-2 px-3.5 py-2.5 rounded-md transition-all',
                  basicInfoSubTab === 1
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-gray-50',
                ]">
                  <span v-html="listIcon"></span>
                  <span class="text-base font-semibold whitespace-nowrap"> قائمة الاتصال </span>
                </button>
              </div>

              <!-- Address Info Sub-tab -->
              <div v-if="basicInfoSubTab === 0" class="bg-gray-50 rounded-lg p-6 mt-4">
                <!-- Row 1: Country, City, Postal Code -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <SelectInput v-model="country" label="الدولة" placeholder="اختر الدولة" :items="countryItems" clearable
                    :hide-details="false" :error-messages="formErrors['address.country_id']"
                    @update:model-value="delete formErrors['address.country_id']" />
                  <SelectInput v-model="city" label="المدينة" placeholder="اختر المدينة" :items="cityItems" clearable
                    :hide-details="false" :error-messages="formErrors['address.city_id']"
                    @update:model-value="delete formErrors['address.city_id']" />
                  <TextInput v-model="postalCode" label="الرمز البريدي" placeholder="مثال: 12345" :hide-details="false"
                    :error-messages="formErrors['address.postal_code']"
                    @input="delete formErrors['address.postal_code']" />
                  <TextInput v-model="district" label="اسم الحي" placeholder="ادخل اسم الحي" :hide-details="false"
                    :error-messages="formErrors['address.neighborhood']"
                    @input="delete formErrors['address.neighborhood']" />
                  <TextInput v-model="streetName" label="اسم الشارع" placeholder="ادخل اسم الشارع" :hide-details="false"
                    :error-messages="formErrors['address.street_name']"
                    @input="delete formErrors['address.street_name']" />
                  <TextInput v-model="buildingNumber" label="رقم المبنى" placeholder="ادخل رقم المبنى" :hide-details="false"
                    :error-messages="formErrors['address.building_number']"
                    @input="delete formErrors['address.building_number']" />
                  <TextInput v-model="nationalAddress" label="العنوان الوطني" placeholder="اكتب العنوان الوطني الكامل"
                    :hide-details="false" :error-messages="formErrors['address.address_1']"
                    @input="delete formErrors['address.address_1']">
                    <template #append-inner>
                      <v-tooltip location="top" content-class="custom-tooltip">
                        <template #activator="{ props: tooltipProps }">
                          <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                            :prepend-icon="infoCircleIcon" v-bind="tooltipProps" />
                        </template>
                        <div>
                          العنوان الوطني
                        </div>
                      </v-tooltip>
                    </template>
                  </TextInput>
                  <TextInput v-model="address2" label="عنوان 2" placeholder="تفاصيل عنوان إضافية" :hide-details="false"
                    :error-messages="formErrors['address.address_2']" @input="delete formErrors['address.address_2']" />
                </div>
              </div>
              <!-- Contact List Sub-tab -->
              <div v-if="basicInfoSubTab === 1" class="bg-gray-50 -mx-6">
                <div class="flex justify-between items-center px-6 border-y border-gray-200 py-3">
                  <h2 class="text-lg font-bold text-primary-900">قائمة عملاء العميل</h2>
                  <ButtonWithIcon variant="flat" color="primary-500" border="sm" height="40"
                    custom-class="font-semibold px-6 !text-white !border-primary-200" :prepend-icon="plusIcon"
                    label="أضف عميل" @click="addContact" />
                </div>

                <!-- Contacts Table with Editable Inputs -->
                <v-table v-if="contacts.length > 0" class="bg-white">
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
                          placeholder="اكتب الاسم الأول" :input-props="{ class: '!min-w-[160px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.last_name" density="compact" variant="outlined" hide-details
                          placeholder="اكتب الاسم الأخير" :input-props="{ class: '!min-w-[160px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.email" density="compact" variant="outlined" hide-details
                          placeholder="اكتب البريد الإلكتروني" :input-props="{ class: '!min-w-[200px]' }" />

                      </td>
                      <td class="py-3 px-4">
                        <!-- <TextInput v-model="contact.telephone" density="compact" variant="outlined" hide-details
                          placeholder="96600000000+" /> -->
                        <TelInput v-model="contact.telephone" density="compact" variant="outlined"
                          :input-props="{ class: '!min-w-[200px]' }" :rules="[saudiPhone()]" />
                      </td>
                      <td class="py-3 px-4">
                        <TelInput v-model="contact.mobile" density="compact" variant="outlined"
                          :input-props="{ class: '!min-w-[200px]' }" :rules="[saudiPhone()]" />
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <ButtonWithIcon color="error" size="small" variant="text" :icon="trashIcon" icon-only
                            @click="deleteContact(index)" />
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
              <SelectInput v-model="priceType" label="نوع السعر" placeholder="اختر نوع السعر" :items="priceTypeItems"
                :hide-details="false" :error-messages="formErrors['price_type']"
                @update:model-value="delete formErrors['price_type']" />
              <!-- <SelectWithIconInput v-model="priceList" label="قائمة الاسعار" placeholder="قائمة الاسعار"
                :items="priceListItems" :hide-details="false"  @add-click="handleAddPriceList" /> -->
              <SelectWithIconInput show-add-button v-model="customerClassification" label="تصنيف العميل"
                placeholder="اختر تصنيف العميل" :items="customerClassificationItems" :hide-details="false"
                :error-messages="formErrors['customer_classification_id']" @add-click="handleAddClassification"
                @update:model-value="delete formErrors['customer_classification_id']" />
              <SelectWithIconInput show-add-button v-model="salesRepresentative" label="مندوب المبيعات"
                placeholder="اختر مندوب المبيعات" :items="salesRepresentativeItems" :hide-details="false"
                :error-messages="formErrors['sales_man_id']" @add-click="handleAddSalesRep"
                @update:model-value="delete formErrors['sales_man_id']" />
              <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">انشاء حساب خاص في شجرة المحاسبة</span>
                <v-radio-group v-model="createAccountInTree" inline hide-details>
                  <v-radio label="نعم" :value="true" color="primary" />
                  <v-radio label="لا" :value="false" color="primary" />
                </v-radio-group>
              </div>
              <SelectWithIconInput v-model="account" label="الحساب" placeholder="اختر الحساب" :items="accountItems"
                :hide-details="false" :error-messages="formErrors['tree_chart_card_id']" @add-click="handleAddAccount"
                @update:model-value="delete formErrors['tree_chart_card_id']" />
              <SelectInput v-model="relatedCustomers" label="العملاء المرتبطين" placeholder="اختر العملاء المرتبطين"
                :items="relatedCustomersItems" :hide-details="false" multiple
                :error-messages="formErrors['related_customers']"
                @update:model-value="delete formErrors['related_customers']" />
              <PriceInput v-model="minimumCredit" label="الحد الادنى (دائن)" placeholder="اكتب الحد الأدنى للدائن" 
                :hide-details="false" :error-messages="formErrors['minimum_credit']"
                @input="delete formErrors['minimum_credit']" />
              <PriceInput v-model="maximumCredit" label="الحد الاعلى (دائن)" placeholder="اكتب الحد الأعلى للدائن" 
                :hide-details="false" :error-messages="formErrors['maximum_credit']"
                @input="delete formErrors['maximum_credit']" />
              <PriceInput v-model="minimumDebit" label="الحد الادنى (مدين)" placeholder="اكتب الحد الأدنى للمدين" 
                :hide-details="false" :error-messages="formErrors['minimum_debit']"
                @input="delete formErrors['minimum_debit']" />
              <PriceInput v-model="maximumDebit" label="الحد الاعلى (مدين)" placeholder="اكتب الحد الأعلى للمدين" 
                :hide-details="false" :error-messages="formErrors['maximum_debit']"
                @input="delete formErrors['maximum_debit']" />
              <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">الحالة الافتراضية</span>
                <div class="flex items-center gap-3 mt-1">
                  <v-radio-group v-model="defaultStatus" inline hide-details>
                    <v-radio :value="true" color="primary">
                      <template #label>
                        <span :class="defaultStatus ? 'text-primary font-semibold' : 'text-gray-600'">
                          فعال
                        </span>
                      </template>
                    </v-radio>
                    <v-radio :value="false" color="primary">
                      <template #label>
                        <span :class="!defaultStatus ? 'text-primary font-semibold' : 'text-gray-600'">
                          غير فعال
                        </span>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
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
                      Date(balance.last_validated_date).toLocaleDateString('en-US') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
          :prepend-icon="saveIcon" label="حفظ" @click="handleSave" :loading="saving" />

        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
          :disabled="saving" custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
          @click="handleClose" />
      </div>
    </div>

    <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

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
