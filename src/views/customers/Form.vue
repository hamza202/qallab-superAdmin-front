<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Check if editing
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'تعديل عميل' : 'إضافة عميل');

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

// Basic Info completion check
const basicInfoCompleted = computed(() => {
  return !!(fullName.value && mobile.value);
});

const accountingInfoCompleted = computed(() => {
  if (createAccountInTree.value === null) return false;
  if (createAccountInTree.value === false) return true;
  return !!account.value;
});

// Form data - Basic Info
const accountType = ref<'individual' | 'commercial'>('individual');
const customerCode = ref("CU-5478544");
const fullName = ref("");
const commercialName = ref("");
const legalName = ref("");
const branch = ref(null);
const mobile = ref("");
const phone = ref("");
const email = ref("");
const entityType = ref(null);
const taxNumber = ref("");
const status = ref(true);

// Address Info (sub-tab)
const country = ref(null);
const city = ref(null);
const postalCode = ref("");
const district = ref("");
const streetName = ref("");
const buildingNumber = ref("");
const nationalAddress = ref("");
const address2 = ref("");

// Contact List
const contacts = ref([
  {
    id: 1,
    firstName: "علي",
    lastName: "خالد",
    email: "example@gmail.com",
    phone: "+96600000000",
    mobile: "+96600000000",
  },
]);

const newContact = ref({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  mobile: "",
});

// Accounting Info
const priceType = ref(null);
const priceList = ref(null);
const customerClassification = ref(null);
const salesRepresentative = ref(null);
const createAccountInTree = ref<boolean | null>(true);
const account = ref(null);
const relatedCustomers = ref(null);
const accountLowerLimit = ref("");
const upperLimitDebit = ref("");
const lowerLimitDebit = ref("");
const upperLimitCredit = ref("");
const lowerLimitCredit = ref("");
const defaultStatus = ref(true);

// Balances
const debit = ref(10.00);
const credit = ref(20.00);
const netBalance = computed(() => credit.value - debit.value);

// Select items
const branchItems = [
  { title: "الفرع الرئيسي", value: "main" },
  { title: "فرع الرياض", value: "riyadh" },
  { title: "فرع جدة", value: "jeddah" },
];

const entityTypeItems = [
  { title: "Establishment", value: "establishment" },
  { title: "Company", value: "company" },
  { title: "Individual", value: "individual" },
];

const countryItems = [
  { title: "السعودية", value: "SA" },
  { title: "الإمارات", value: "AE" },
  { title: "مصر", value: "EG" },
];

const cityItems = [
  { title: "الرياض", value: "riyadh" },
  { title: "جدة", value: "jeddah" },
  { title: "مكة", value: "makkah" },
];

const accountItems = [
  { title: "حساب العملاء", value: "customers" },
  { title: "حساب المدينين", value: "debtors" },
];

const priceTypeItems = [
  { title: "نوع السعر", value: "type1" },
  { title: "نوع السعر 2", value: "type2" },
];

const priceListItems = [
  { title: "قائمة الاسعار", value: "list1" },
  { title: "قائمة الاسعار 2", value: "list2" },
];

const customerClassificationItems = [
  { title: "تصنيف العميل", value: "class1" },
  { title: "تصنيف العميل 2", value: "class2" },
];

const salesRepresentativeItems = [
  { title: "مندوب المبيعات", value: "rep1" },
  { title: "مندوب المبيعات 2", value: "rep2" },
];

const relatedCustomersItems = [
  { title: "العملاء المرتبطين", value: "related1" },
  { title: "العملاء المرتبطين 2", value: "related2" },
];

// Sub-tabs for basic info section
const basicInfoSubTab = ref(0);

// Handlers
const handleAddBranch = () => {
  console.log("Add new branch");
};

const handleAddPriceList = () => {
  console.log("Add new price list");
};

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
  if (newContact.value.firstName && newContact.value.lastName) {
    contacts.value.push({
      id: contacts.value.length + 1,
      ...newContact.value,
    });
    newContact.value = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      mobile: "",
    };
  }
};

const deleteContact = (contactId: number) => {
  contacts.value = contacts.value.filter(c => c.id !== contactId);
};

const handleSave = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Saving customer...");
    router.push({ name: "CustomersList" });
  }
};

const handleClose = () => {
  router.push({ name: "CustomersList" });
};

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

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
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
        ]">
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

              <!-- Row 1: Full Name, Customer Code, Branch -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="fullName" label="الاسم كامل بالعربية" placeholder="الاسم كامل بالعربية"
                  :rules="[required()]" :hide-details="false" />
                <TextInput v-model="fullName" label="الاسم كامل بالإنحليزية" placeholder="الاسم كامل بالإنحليزية"
                  :rules="[required()]" :hide-details="false" />
                <div>
                  <div class="mb-[7px] text-sm font-semibold text-gray-700">الكود</div>
                  <div class="bg-gray-200 text-primary-900 rounded-lg px-4 py-2.5 font-bold text-end">
                    {{ customerCode }}
                  </div>
                </div>
                <SelectWithIconInput v-model="branch" label="الفرع" placeholder="الفرع" :items="branchItems"
                  :hide-details="false" show-add-button @add-click="handleAddBranch" />

                <TextInput v-model="mobile" label="الجوال" placeholder="+966 (555) 000-0000" :rules="[required()]"
                  :hide-details="false">
                  <template #append-inner>
                    <span class="text-gray-500 text-sm">KSA</span>
                  </template>
                </TextInput>
                <TextInput v-model="phone" label="الهاتف" placeholder="+966 (555) 000-0000" :hide-details="false">
                  <template #append-inner>
                    <span class="text-gray-500 text-sm">KSA</span>
                  </template>
                </TextInput>
                <TextInput v-model="email" label="البريد الالكتروني" placeholder="البريد الالكتروني"
                  :hide-details="false" />
                <TextInput v-model="commercialName" label="الاسم التجاري" placeholder="Al-Nahda Contracting"
                  :hide-details="false" />
                <TextInput v-model="legalName" label="الاسم القانوني" placeholder="Al-Nahda Construction LLC"
                  :hide-details="false" />
                <SelectWithIconInput v-model="entityType" label="نوع الكيان" placeholder="Establishment"
                  :items="entityTypeItems" :hide-details="false" show-add-button />

                <TextInput v-model="taxNumber" label="الرقم الضريبي" placeholder="310123456700003"
                  :hide-details="false" />
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
                    :hide-details="false" />
                  <SelectInput v-model="city" label="المدينة" placeholder="المدينة" :items="cityItems"
                    :hide-details="false" />
                  <TextInput v-model="postalCode" label="الرمز البريدي" placeholder="00000" :hide-details="false" />
                </div>

                <!-- Row 2: District, Street Name, Building Number -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <TextInput v-model="district" label="اسم الحي" placeholder="الحي" :hide-details="false" />
                  <TextInput v-model="streetName" label="اسم الشارع" placeholder="الشارع" :hide-details="false" />
                  <TextInput v-model="buildingNumber" label="رقم المبنى" placeholder="00000" :hide-details="false" />
                </div>

                <!-- Row 3: National Address, Address 2 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h2 class="text-lg font-bold text-primary-900 mb-4">قائمة عملاء العميل</h2>

                <!-- New Contact Row -->
                <div class="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4 items-end">
                  <TextInput v-model="newContact.firstName" label="الاسم الاول" placeholder="الاسم الاول"
                    :hide-details="true" />
                  <TextInput v-model="newContact.lastName" label="الاسم الاخر" placeholder="الاسم الاخر"
                    :hide-details="true" />
                  <TextInput v-model="newContact.email" label="البريد الالكتروني" placeholder="example@gmail.com"
                    :hide-details="true" />
                  <TextInput v-model="newContact.phone" label="الهاتف" placeholder="+96600000000"
                    :hide-details="true" />
                  <TextInput v-model="newContact.mobile" label="الجوال" placeholder="+96600000000"
                    :hide-details="true" />
                  <div class="flex items-center gap-2">
                    <v-btn variant="flat" color="primary" height="40" class="font-semibold" @click="addContact">
                      اضف
                    </v-btn>
                  </div>
                </div>

                <!-- Contacts Table -->
                <v-table v-if="contacts.length > 0" class="bg-white rounded-lg">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">
                        <v-checkbox hide-details density="compact" />
                      </th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم الاول</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم الاخر</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">البريد الالكتروني</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الهاتف</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الجوال</th>
                      <th class="text-right font-semibold text-gray-700 py-3 px-4">الاجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="contact in contacts" :key="contact.id" class="border-b border-gray-200">
                      <td class="py-3 px-4">
                        <v-checkbox hide-details density="compact" />
                      </td>
                      <td class="py-3 px-4 text-gray-900">{{ contact.firstName }}</td>
                      <td class="py-3 px-4 text-gray-900">{{ contact.lastName }}</td>
                      <td class="py-3 px-4 text-gray-900">{{ contact.email }}</td>
                      <td class="py-3 px-4 text-gray-900">{{ contact.phone }}</td>
                      <td class="py-3 px-4 text-gray-900">{{ contact.mobile }}</td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <v-btn icon size="small" variant="text" @click="deleteContact(contact.id)">
                            <span v-html="trashIcon"></span>
                          </v-btn>
                          <v-btn icon size="small" variant="text">
                            <span v-html="editIcon"></span>
                          </v-btn>
                        </div>
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
            <!-- Row 1: Price Type, Price List, Customer Classification -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SelectInput v-model="priceType" label="نوع السعر" placeholder="نوع السعر" :items="priceTypeItems"
                :hide-details="false" />
              <SelectWithIconInput v-model="priceList" label="قائمة الاسعار" placeholder="قائمة الاسعار"
                :items="priceListItems" :hide-details="false" show-add-button @add-click="handleAddPriceList" />
              <SelectWithIconInput v-model="customerClassification" label="تصنيف العميل" placeholder="تصنيف العميل"
                :items="customerClassificationItems" :hide-details="false" show-add-button
                @add-click="handleAddClassification" />
            </div>

            <!-- Row 2: Sales Representative, Create Account Option -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SelectWithIconInput v-model="salesRepresentative" label="مندوب المبيعات" placeholder="مندوب المبيعات"
                :items="salesRepresentativeItems" :hide-details="false" show-add-button
                @add-click="handleAddSalesRep" />
              <div>
                <span class="text-sm font-semibold text-gray-700 mb-1 block">انشاء حساب خاص في شجرة المحاسبة</span>
                <v-radio-group v-model="createAccountInTree" inline hide-details>
                  <v-radio label="نعم" :value="true" color="primary" />
                  <v-radio label="لا" :value="false" color="primary" />
                </v-radio-group>
              </div>
            </div>

            <!-- Row 3: Account, Related Customers, Account Lower Limit -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <SelectWithIconInput v-model="account" label="الحساب" placeholder="الحساب" :items="accountItems"
                :hide-details="false" show-add-button @add-click="handleAddAccount" />
              <SelectInput v-model="relatedCustomers" label="العملاء المرتبطين" placeholder="العملاء المرتبطين"
                :items="relatedCustomersItems" :hide-details="false" />
              <TextInput v-model="accountLowerLimit" label="الحد الادنى (دائن)" placeholder="الحد الادنى"
                :hide-details="false" />
            </div>

            <!-- Row 4: Upper/Lower Limits -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <TextInput v-model="upperLimitDebit" label="الحد الاعلى (مدين)" placeholder="الحد الادنى"
                :hide-details="false" />
              <TextInput v-model="lowerLimitDebit" label="الحد الادنى (مدين)" placeholder="الحد الادنى"
                :hide-details="false" />
              <TextInput v-model="upperLimitCredit" label="الحد الاعلى (دائن)" placeholder="الحد الادنى"
                :hide-details="false" />
            </div>

            <!-- Row 5: Lower Limit Credit, Default Status -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <TextInput v-model="lowerLimitCredit" label="الحد الادنى" placeholder="الحد الادنى"
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

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-sm font-semibold text-gray-700 mb-2">دائن</div>
                <div class="text-lg font-bold text-gray-900">{{ debit.toFixed(2) }}</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-semibold text-gray-700 mb-2">مدين</div>
                <div class="text-lg font-bold text-gray-900">{{ credit.toFixed(2) }}</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-semibold text-gray-700 mb-2">صافي الرصيد</div>
                <div class="text-lg font-bold text-gray-900">{{ netBalance.toFixed(2) }}</div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 mt-6">
        <v-btn variant="flat" color="primary" prepend-icon="mdi-content-save-all-outline" height="48"
          class="font-semibold text-base  px-8 sm:!px-20" @click="handleSave">
          <span>حفظ</span>
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
