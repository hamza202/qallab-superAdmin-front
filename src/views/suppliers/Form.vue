<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

const route = useRoute();
const router = useRouter();
const api = useApi();

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

// Form errors from backend validation
const formErrors = reactive<Record<string, string>>({});

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
const pageLoading = ref(false)

// Sub-tabs for basic info section
const basicInfoSubTab = ref(0);

// API Functions
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

const fetchCities = async (countryId: number) => {
  try {
    const response = await api.get<{ data: ListItem[] }>(`/cities/list?country_id=${countryId}`);
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
    const response = await api.get<{ data: ListItem[] }>('/currencies/list');
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
    const response = await api.get<{ data: ListItem[] }>('/tree-chart-cards/list');
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
    const response = await api.get<any>(`/suppliers/${route.params.id}`);
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
    toast.error(err?.response?.data?.message || 'Failed to fetch supplier data');
  } finally {
    loading.value = false;
  }
};

const buildPayload = (step: number): any => {
  // Step 1: Basic Information
  if (step === 1) {
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
      }))
    };
  }

  // Step 2: Accounting Information
  if (step === 2) {
    return {
      step,
      supplier_id: supplierId.value || undefined,
      tree_chart_card_id: account.value
    };
  }

  return {};
};

const saveStep = async (step: number) => {
  try {
    // Clear previous errors
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    saving.value = true;
    const payload = buildPayload(step);

    let response: SupplierResponse;

    if (supplierId.value) {
      // Update existing supplier
      response = await api.put(`/suppliers/${supplierId.value}`, payload);
    } else {
      // Create new supplier
      response = await api.post('/suppliers', payload);
    }

    // Store supplier ID for subsequent saves
    if (response.data.supplier_id) {
      supplierId.value = response.data.supplier_id;
    }

    toast.success(response.message || 'تم حفظ المورد بنجاح');
    return true;
  } catch (err: any) {
    console.error('Error saving supplier:', err);

    // Handle validation errors (422 status)
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      const apiErrors = err.response.data.errors;
      Object.keys(apiErrors).forEach(key => {
        formErrors[key] = apiErrors[key][0];
      });
      toast.error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
    } else {
      toast.error(err?.response?.data?.message || 'فشل حفظ المورد');
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
  // Validate form before saving
  if (formRef.value && typeof formRef.value.validate === 'function') {
    const { valid } = await formRef.value.validate();
    if (!valid) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
  }

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
    fetchCities(newCountryId);
  } else {
    city.value = null; // Reset city when country changes
  }
});

// Lifecycle
onMounted(async () => {
  pageLoading.value = true
  await Promise.all([
    fetchCountries(),
    fetchCurrencies(),
    fetchTreeChartCards()
  ]);

  if (isEditing.value) {
    await fetchSupplierData();
  }
  pageLoading.value = false

});

// Icons
const suppliersIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5003 28H36.961C39.1555 28 40.2527 28 41.1262 27.5909C41.8957 27.2305 42.5422 26.6518 42.9854 25.9268C43.4885 25.1039 43.6096 24.0133 43.852 21.8323L45.1195 10.4247C45.1935 9.75858 45.2305 9.42549 45.1234 9.16768C45.0293 8.94125 44.8612 8.75344 44.6466 8.63493C44.4021 8.5 44.067 8.5 43.3967 8.5H7.41697M2 2H4.70495C5.2783 2 5.56498 2 5.78926 2.10904C5.9867 2.20503 6.15033 2.35874 6.25845 2.54982C6.38126 2.76686 6.39914 3.05298 6.43491 3.62521L8.39842 35.0415C8.43419 35.6137 8.45207 35.8998 8.57489 36.1168C8.68301 36.3079 8.84663 36.4616 9.04408 36.5576C9.26836 36.6667 9.55503 36.6667 10.1284 36.6667H38.8333M13.9167 44.25H13.9383M33.4167 44.25H33.4383M15 44.25C15 44.8483 14.515 45.3333 13.9167 45.3333C13.3184 45.3333 12.8333 44.8483 12.8333 44.25C12.8333 43.6517 13.3184 43.1667 13.9167 43.1667C14.515 43.1667 15 43.6517 15 44.25ZM34.5 44.25C34.5 44.8483 34.015 45.3333 33.4167 45.3333C32.8184 45.3333 32.3333 44.8483 32.3333 44.25C32.3333 43.6517 32.8184 43.1667 33.4167 43.1667C34.015 43.1667 34.5 43.6517 34.5 44.25Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const infoIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1892_22688)">
<path d="M6.06065 6.00016C6.21739 5.55461 6.52675 5.1789 6.93395 4.93958C7.34116 4.70027 7.81991 4.61279 8.28543 4.69264C8.75096 4.77249 9.17319 5.01451 9.47737 5.37585C9.78154 5.73718 9.94802 6.19451 9.94732 6.66683C9.94732 8.00016 7.94732 8.66683 7.94732 8.66683M8.00065 11.3335H8.00732M14.6673 8.00016C14.6673 11.6821 11.6825 14.6668 8.00065 14.6668C4.31875 14.6668 1.33398 11.6821 1.33398 8.00016C1.33398 4.31826 4.31875 1.3335 8.00065 1.3335C11.6825 1.3335 14.6673 4.31826 14.6673 8.00016Z" stroke="#9AA4B2" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_1892_22688">
<rect width="16" height="16" fill="white"/>
</clipPath>
</defs>
</svg>
`


const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const closeIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 1L1 13M1 1L13 13" stroke="#344054" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const locationIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 13.2864C2.14864 14.1031 1 15.2412 1 16.5C1 18.9853 5.47715 21 11 21C16.5228 21 21 18.9853 21 16.5C21 15.2412 19.8514 14.1031 18 13.2864M17 7C17 11.0637 12.5 13 11 16C9.5 13 5 11.0637 5 7C5 3.68629 7.68629 1 11 1C14.3137 1 17 3.68629 17 7ZM12 7C12 7.55228 11.5523 8 11 8C10.4477 8 10 7.55228 10 7C10 6.44772 10.4477 6 11 6C11.5523 6 12 6.44772 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const listIcon = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 8L7 8M19 2L7 2M19 14L7 14M3 8C3 8.55228 2.55228 9 2 9C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7C2.55228 7 3 7.44772 3 8ZM3 2C3 2.55228 2.55228 3 2 3C1.44772 3 1 2.55228 1 2C1 1.44772 1.44772 1 2 1C2.55228 1 3 1.44772 3 2ZM3 14C3 14.5523 2.55228 15 2 15C1.44772 15 1 14.5523 1 14C1 13.4477 1.44772 13 2 13C2.55228 13 3 13.4477 3 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

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
            <!-- Supplier Data Section -->
            <div class="mb-6 bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-bold text-primary-900 mb-4">{{ pageTitle }} - بيانات المورد</h2>

              <!-- Row 1: Business Name, First Name, Last Name with Language Tabs -->
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-4 mb-4">
                <LanguageTabs :languages="availableLanguages" label="الاسم التجاري">
                  <template #en>
                    <TextInput v-model="businessNameEn" placeholder="Enter business name in English"
                      :rules="[required()]" :hide-details="false" :error-messages="formErrors['business_name.en']"
                      @input="delete formErrors['business_name.en']" />
                  </template>
                  <template #ar>
                    <TextInput v-model="businessNameAr" placeholder="ادخل الاسم التجاري بالعربية" :rules="[required()]"
                      :hide-details="false" :error-messages="formErrors['business_name.ar']"
                      @input="delete formErrors['business_name.ar']" />
                  </template>
                </LanguageTabs>

                <LanguageTabs :languages="availableLanguages" label="الاسم الأول">
                  <template #en>
                    <TextInput v-model="firstNameEn" placeholder="Enter first name in English" :rules="[required()]"
                      :hide-details="false" :error-messages="formErrors['first_name.en']"
                      @input="delete formErrors['first_name.en']" />
                  </template>
                  <template #ar>
                    <TextInput v-model="firstNameAr" placeholder="ادخل الاسم الأول بالعربية" :rules="[required()]"
                      :hide-details="false" :error-messages="formErrors['first_name.ar']"
                      @input="delete formErrors['first_name.ar']" />
                  </template>
                </LanguageTabs>

                <LanguageTabs :languages="availableLanguages" label="الاسم الأخير">
                  <template #en>
                    <TextInput v-model="lastNameEn" placeholder="Enter last name in English" :rules="[required()]"
                      :hide-details="false" :error-messages="formErrors['last_name.en']"
                      @input="delete formErrors['last_name.en']" />
                  </template>
                  <template #ar>
                    <TextInput v-model="lastNameAr" placeholder="ادخل الاسم الأخير بالعربية" :rules="[required()]"
                      :hide-details="false" :error-messages="formErrors['last_name.ar']"
                      @input="delete formErrors['last_name.ar']" />
                  </template>
                </LanguageTabs>

                <div v-if="isEditing">
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">كود المورد</div>
                  <div class="bg-gray-200 text-primary-900 rounded-lg px-4 py-2.5 font-bold text-end">
                    {{ supplierCode }}
                  </div>
                </div>
                <SelectInput v-model="defaultCurrency" clearable label="العملة الافتراضية" placeholder="ريال سعودي"
                  :items="currencyItems" :rules="[required()]" :hide-details="false"
                  :error-messages="formErrors['default_currency_id']"
                  @update:model-value="delete formErrors['default_currency_id']" />
                <TelInput v-model="phone" label="الجوال" :rules="[required(), saudiPhone()]"
                  :error-messages="formErrors['mobile']" @input="delete formErrors['mobile']" />
                <TelInput v-model="phone" label="الهاتف" :rules="[saudiPhone()]" :error-messages="formErrors['phone']"
                  @input="delete formErrors['phone']" />

                <TextInput v-model="email" dir="ltr" label="البريد الالكتروني" placeholder="example@gmail.com"
                  :rules="[required()]" :hide-details="false" :error-messages="formErrors['email']"
                  @input="delete formErrors['email']" />
                <TextInput v-model="businessNumber" label="رقم السجل التجاري" placeholder="ادخل الرقم"
                  :hide-details="false">
                  <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                      <template #activator="{ props: tooltipProps }">
                        <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                          :prepend-icon="infoIcon" v-bind="tooltipProps" />
                      </template>
                      <div>
                        رقم السجل التجاري للمورد
                      </div>
                    </v-tooltip>
                  </template>
                </TextInput>
                <TextInput v-model="taxNumber" label="الرقم الضريبي" placeholder="ادخل الرقم" :hide-details="false">
                  <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                      <template #activator="{ props: tooltipProps }">
                        <ButtonWithIcon variant="text" size="small" density="compact" custom-class="!min-w-0 p-0"
                          :prepend-icon="infoIcon" v-bind="tooltipProps" />
                      </template>
                      <div>
                        الرقم الضريبي للمورد
                      </div>
                    </v-tooltip>
                  </template>
                </TextInput>
                <div>
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">الحالة</div>
                  <div class="flex items-center gap-3 mt-1">
                    <v-radio-group v-model="status" inline hide-details>
                      <v-radio :value="true" color="primary">
                        <template #label>
                          <span :class="status ? 'text-primary font-semibold' : 'text-gray-600'">
                            فعال
                          </span>
                        </template>
                      </v-radio>
                      <v-radio :value="false" color="primary">
                        <template #label>
                          <span :class="!status ? 'text-primary font-semibold' : 'text-gray-600'">
                            غير فعال
                          </span>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </div>
                </div>
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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <SelectInput v-model="country" label="الدولة" placeholder="الدولة" :items="countryItems"
                    :rules="[required()]" :hide-details="false" clearable :error-messages="formErrors['country_code']"
                    @update:model-value="delete formErrors['country_code']" />
                  <SelectInput v-model="city" label="المدينة" placeholder="المدينة" :items="cityItems"
                    :rules="[required()]" :hide-details="false" :disabled="!country" clearable
                    :error-messages="formErrors['city_id']" @update:model-value="delete formErrors['city_id']" />
                  <TextInput v-model="postalCode" label="الرمز البريدي" placeholder="الرمز البريدي"
                    :hide-details="false" />
                  <TextInput v-model="district" label="اسم الحي" placeholder="اسم الحي" :hide-details="false" />
                  <TextInput v-model="streetName" label="اسم الشارع" placeholder="اسم الشارع" :hide-details="false" />
                  <TextInput v-model="buildingNumber" label="رقم المبنى" placeholder="رقم المبنى"
                    :hide-details="false" />
                  <TextInput v-model="nationalAddress" label="أدخل العنوان الوطني" placeholder="العنوان الوطني"
                    :rules="[required()]" :hide-details="false" :error-messages="formErrors['address_1']"
                    @input="delete formErrors['address_1']" />
                  <TextInput v-model="address2" label="العنوان 2" placeholder="العنوان الإضافي" :hide-details="false" />
                </div>
              </div>

              <!-- Contact List Sub-tab -->
              <div v-if="basicInfoSubTab === 1" class="bg-gray-50 -mx-6">
                <!-- Add Contact Form -->
                <div class="flex items-center justify-between flex-wrap gap-4 px-6 border-y border-gray-200 py-3">
                  <h3 class="text-lg font-bold text-gray-600">قائمة جهات الاتصال</h3>
                  <ButtonWithIcon variant="flat" color="primary-500" border="sm" height="40"
                    custom-class="font-semibold px-6 !text-white !border-primary-200" :prepend-icon="plusIcon"
                    label="أضف جهة اتصال" @click="addContact" />
                </div>

                <!-- Contacts Table -->
                <v-table v-if="contacts.length > 0" class="bg-white">
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
                          density="compact" :input-props="{ class: 'min-w-[150px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.last_name" placeholder="الاسم الاخر" :hide-details="true"
                          density="compact" :input-props="{ class: 'min-w-[150px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TextInput v-model="contact.email" placeholder="example@gmail.com" dir="ltr" :hide-details="true"
                          density="compact" :input-props="{ class: 'min-w-[180px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TelInput v-model="contact.telephone" :hide-details="true" density="compact"
                          :input-props="{ class: 'min-w-[200px]' }" />
                      </td>
                      <td class="py-3 px-4">
                        <TelInput :input-props="{ class: 'min-w-[200px]' }" v-model="contact.mobile" :hide-details="true"
                          density="compact" />
                      </td>
                      <td class="py-3 px-4">
                        <ButtonWithIcon :icon="trashIcon" icon-only size="small" variant="text" color="error"
                          @click="removeContact(index)" />
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
          <div class="-mx-6">

            <div class="rounded-lg px-6 py-2 mb-3">
              <!-- Account Selection -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- <div class="mb-6">
                  <span class="text-sm font-semibold text-gray-700 mb-1 block">انشاء حساب خاص في شجرة المحاسبة</span>
                  <v-radio-group v-model="createAccountInTree" inline hide-details>
                    <v-radio label="نعم" :value="true" color="primary">
                      <template #label>
                        <span :class="createAccountInTree ? 'text-primary font-semibold' : 'text-gray-600'">
                          نعم
                        </span>
                      </template>

                    </v-radio>
                    <v-radio label="لا" :value="false" color="primary">
                      <template #label>
                        <span :class="!createAccountInTree ? 'text-primary font-semibold' : 'text-gray-600'">
                          لا
                        </span>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div> -->

                <SelectWithIconInput v-model="account" label="الحساب" placeholder="الحساب" :items="accountItems"
                  :hide-details="false" @add-click="handleAddAccount" />
              </div>
            </div>

            <!-- Balances Section -->
            <div v-if="isEditing" class="bg-white">
              <div class="px-6 py-4 border border-gray-200">
                <h2 class="text-lg font-bold text-gray-900">الارصدة</h2>
              </div>

              <div v-if="supplierBalances.length === 0" class="text-center py-8">
                <p class="text-gray-500">لا توجد أرصدة متاحة</p>
              </div>

              <div v-else class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-200">
                      <th class="px-6 py-3 text-sm font-semibold text-gray-700">الرصيد</th>
                      <th class="px-6 py-3 text-sm font-semibold text-gray-700">المبلغ المستحق</th>
                      <th class="px-6 py-3 text-sm font-semibold text-gray-700">العملة</th>
                      <th class="px-6 py-3 text-sm font-semibold text-gray-700">تاريخ التدقيق الأخير</th>
                    </tr>
                  </thead>
                  <tbody class="text-center">
                    <tr v-for="(balance, index) in supplierBalances" :key="balance.id"
                      :class="index !== supplierBalances.length - 1 ? 'border-b border-gray-200' : ''">
                      <td class="px-6 py-4 text-sm text-gray-900">{{ balance.balance }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900">{{ balance.last_amount }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900">{{ balance.currency }}</td>
                      <td class="px-6 py-4 text-sm text-gray-900">{{ new
                        Date(balance.last_validated_date).toLocaleDateString('en-GB') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
          :prepend-icon="saveIcon" label="حفظ" @click="handleSave" :loading="saving" />

        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" :disabled="saving"
          height="48" custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
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
