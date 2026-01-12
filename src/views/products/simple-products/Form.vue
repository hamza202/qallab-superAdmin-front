<script setup lang="ts">
// All imports are now auto-imported:
// - Vue APIs (ref, computed, etc.) from 'vue'
// - Components from 'src/components/common/forms' and 'src/layouts'
// - Validators (required, minLength, etc.) from '@/utils/validators'

import { useNotification } from "@/composables/useNotification";
import TestFormDialog from "@/views/products/simple-products/components/TestFormDialog.vue";

// Form ref
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Form data
const productCode = ref("#eda23422");
const arabicName = ref("");
const englishName = ref("");
const category = ref(null);
const unit = ref(null);
const isMinUnit = ref(false);
const arabicDescription = ref("");
const englishDescription = ref("");
const productImages = ref<File[] | null>(null);
const purchasePrice = ref("");
const salePrice = ref("");
const maxSalePrice = ref("");
const minSalePrice = ref("");
const wholesalePrice = ref("");
const halfWholesalePrice = ref("");
const discountType = ref(null);
const discountValue = ref("506.64");

// Sample items for selects
const categoryItems = [
  { title: "اختر التصنيف", value: "" },
  { title: "إلكترونيات", value: "electronics" },
  { title: "ملابس", value: "clothing" },
  { title: "طعام", value: "food" },
];

const unitItems = [
  { title: "اختر الوحدة", value: "" },
  { title: "قطعة", value: "piece" },
  { title: "كيلو", value: "kg" },
  { title: "لتر", value: "liter" },
];

const discountTypeItems = [
  { title: "اختر نوع الخصم", value: "" },
  { title: "نسبة مئوية", value: "percentage" },
  { title: "قيمة ثابتة", value: "fixed" },
];

// Available languages (will be fetched from API in the future)
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

// Tax data
const taxType = ref(null);
const taxPercentage = ref("10%");
const taxMinValue = ref(null);
const taxPriority = ref(null);

const taxTypeItems = [
  { title: "اختر النوع", value: "" },
  { title: "ضريبة القيمة المضافة", value: "vat" },
  { title: "ضريبة المبيعات", value: "sales" },
  { title: "ضريبة الدخل", value: "income" },
];

const taxMinValueItems = [
  { title: "اختر القيمة", value: "" },
  { title: "100", value: "100" },
  { title: "500", value: "500" },
  { title: "1000", value: "1000" },
];

const taxPriorityItems = [
  { title: "اختر الأولوية", value: "" },
  { title: "عالية", value: "high" },
  { title: "متوسطة", value: "medium" },
  { title: "منخفضة", value: "low" },
];

// Supply and Internal Relations Data
const originCountry = ref(null);
const manufacturer = ref(null);
const brand = ref(null);
const relatedProducts = ref(null);
const attachedProducts = ref(null);
const alternativeProducts = ref(null);
const bestSuppliers = ref(null);

// Advanced Product Attributes
const isReturnable = ref(false);
const isRentable = ref(false);
const sellNegative = ref(false);
const isManufacturingProduct = ref(false);
const isAvailableForPurchase = ref(false);
const isAvailableForRent = ref(false);
const isAvailableForReturn = ref(false);
const isAvailableForSelling = ref(false);
const isAvailableForBuying = ref(false);
const isAvailableForManufacturing = ref(false);
const isAvailableForRefund = ref(false);
const isAvailableForOffset = ref(false);

// Sample items for new selects
const countryItems = [
  { title: "اختر البلد", value: "" },
  { title: "السعودية", value: "sa" },
  { title: "الإمارات", value: "ae" },
  { title: "مصر", value: "eg" },
];

const manufacturerItems = [
  { title: "اختر المصنع", value: "" },
  { title: "مصنع 1", value: "factory1" },
  { title: "مصنع 2", value: "factory2" },
];

const brandItems = [
  { title: "ادخل العلامة التجارية", value: "" },
  { title: "علامة 1", value: "brand1" },
  { title: "علامة 2", value: "brand2" },
];

const productItems = [
  { title: "اختر المنتج", value: "" },
  { title: "منتج 1", value: "product1" },
  { title: "منتج 2", value: "product2" },
];

const supplierItems = [
  { title: "اختر المورد", value: "" },
  { title: "مورد 1", value: "supplier1" },
  { title: "مورد 2", value: "supplier2" },
];

// Handlers for new section
const handleAddCountry = () => {
  console.log("Add new country");
};

const handleAddManufacturer = () => {
  console.log("Add new manufacturer");
};

const handleAddBrand = () => {
  console.log("Add new brand");
};

// Tax table data
const taxTableHeaders = [
  { key: "name", title: "الضريبة", width: "370px" },
  { key: "percentage", title: "النسبة", width: "176px" },
  { key: "minValue", title: "أقل قيمة", width: "176px" },
  { key: "priority", title: "الأولوية", width: "176px" },
];

const taxTableItems = ref([
  {
    id: 1,
    name: "ضريبة القيمة المضافة",
    percentage: "15%",
    minValue: "150",
    priority: "عالية",
  },
  {
    id: 2,
    name: "ضريبة تأمين",
    percentage: "15%",
    minValue: "150",
    priority: "منخفضة",
  },
  {
    id: 3,
    name: "ضريبة تأمين",
    percentage: "15%",
    minValue: "150",
    priority: "متوسطة",
  },
]);

const handleEditTax = (item: any) => {
  console.log("Edit tax:", item);
};

const handleDeleteTax = (item: any) => {
  taxTableItems.value = taxTableItems.value.filter((t) => t.id !== item.id);
};

// Tests data
const testsList = ref([
  {
    id: 1,
    testName: "اختبار 1",
    testsCount: 2,
    samplesCount: 22,
    sampleQuantity: 255,
    status: true,
  },
  {
    id: 2,
    testName: "اختبار 2",
    testsCount: 25,
    samplesCount: 5,
    sampleQuantity: 852,
    status: false,
  },
  {
    id: 3,
    testName: "اختبار 3",
    testsCount: 78,
    samplesCount: 26,
    sampleQuantity: 666,
    status: true,
  },
]);

const testForm = reactive({
  testName: null,
  testsCount: "",
  samplesCount: "",
  sampleQuantity: "",
  status: true,
});

const showTestDialog = ref(false);
const editingTest = ref<any>(null);

const testItems = [
  { title: "اختر", value: null },
  { title: "اختبار 1", value: "test1" },
  { title: "اختبار 2", value: "test2" },
  { title: "اختبار 3", value: "test3" },
];

const testsTableHeaders = [
  { key: "testName", title: "الاختبار", width: "200px" },
  { key: "testsCount", title: "عدد الاختبارات", width: "150px" },
  { key: "samplesCount", title: "عدد العينات", width: "150px" },
  { key: "sampleQuantity", title: "كمية العينات", width: "150px" },
  { key: "status", title: "الحالة", width: "120px" },
];

// Tabs
const activeTab = ref(0);
const tabs = [
  {
    title: "البيانات الأساسية",
    value: 0,
    icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    title: "بيانات الضرائب",
    value: 1,
    icon: `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 15C11 17.7614 13.2386 20 16 20C18.7614 20 21 17.7614 21 15C21 12.2386 18.7614 10 16 10C13.2386 10 11 12.2386 11 15ZM11 15C11 13.8742 11.3721 12.8353 12 11.9995V3M11 15C11 15.8254 11.2 16.604 11.5541 17.2901C10.7117 18.0018 8.76584 18.5 6.5 18.5C3.46243 18.5 1 17.6046 1 16.5V3M12 3C12 4.10457 9.53757 5 6.5 5C3.46243 5 1 4.10457 1 3M12 3C12 1.89543 9.53757 1 6.5 1C3.46243 1 1 1.89543 1 3M1 12C1 13.1046 3.46243 14 6.5 14C8.689 14 10.5793 13.535 11.4646 12.8618M12 7.5C12 8.60457 9.53757 9.5 6.5 9.5C3.46243 9.5 1 8.60457 1 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    title: "بيانات اضافية",
    value: 2,
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.5 9.5L7.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  },
  {
    title: "قائمة الاختبارات",
    value: 3,
    icon: `<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 1.26953V5.40007C11 5.96012 11 6.24015 11.109 6.45406C11.2049 6.64222 11.3578 6.7952 11.546 6.89108C11.7599 7.00007 12.0399 7.00007 12.6 7.00007H16.7305M13 12H5M13 16H5M7 8H5M11 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H12.2C13.8802 21 14.7202 21 15.362 20.673C15.9265 20.3854 16.3854 19.9265 16.673 19.362C17 18.7202 17 17.8802 17 16.2V7L11 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  },
];

// Tab helpers
const isTabActive = (tabValue: number) => activeTab.value === tabValue;

// Notification
const { notification, success } = useNotification();

// Copy product code function
const copyProductCode = async () => {
  try {
    await navigator.clipboard.writeText(productCode.value);
    success("تم نسخ كود المنتج بنجاح");
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = productCode.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    success("تم نسخ كود المنتج بنجاح");
  }
};

// Handlers
const handleAddCategory = () => {
  console.log("Add new category");
};

const handleAddUnit = () => {
  console.log("Add new unit");
};

const handleAddLanguage = () => {
  console.log("Add new language");
};

const handleAddTaxType = () => {
  console.log("Add new tax type");
};

const handleAddTax = () => {
  console.log("Add tax");
};

const handleAddTest = () => {
  const newTest = {
    id: testsList.value.length + 1,
    testName: testForm.testName || "اختبار",
    testsCount: parseInt(testForm.testsCount) || 0,
    samplesCount: parseInt(testForm.samplesCount) || 0,
    sampleQuantity: parseInt(testForm.sampleQuantity) || 0,
    status: testForm.status,
  };
  testsList.value.push(newTest);
  resetTestForm();
};

const handleEditTest = (item: any) => {
  editingTest.value = {
    testName: item.testName,
    testsCount: item.testsCount.toString(),
    samplesCount: item.samplesCount.toString(),
    sampleQuantity: item.sampleQuantity.toString(),
    status: item.status,
    id: item.id,
  };
  showTestDialog.value = true;
};

const handleSaveTest = (payload: any) => {
  if (editingTest.value && editingTest.value.id) {
    const index = testsList.value.findIndex((t) => t.id === editingTest.value.id);
    if (index !== -1) {
      testsList.value[index] = {
        ...testsList.value[index],
        testName: payload.testName || "اختبار",
        testsCount: parseInt(payload.testsCount) || 0,
        samplesCount: parseInt(payload.samplesCount) || 0,
        sampleQuantity: parseInt(payload.sampleQuantity) || 0,
        status: payload.status,
      };
    }
  }
  editingTest.value = null;
  showTestDialog.value = false;
};

const handleDeleteTest = (item: any) => {
  testsList.value = testsList.value.filter((t) => t.id !== item.id);
};

const resetTestForm = () => {
  testForm.testName = null;
  testForm.testsCount = "";
  testForm.samplesCount = "";
  testForm.sampleQuantity = "";
  testForm.status = true;
};

const handleSaveAndReturn = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and return to home");
    // هنا يمكنك إرسال البيانات للـ API
  } else {
    console.log("Form has errors");
  }
};

const handleSaveAndCreate = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and create new");
    // هنا يمكنك إرسال البيانات للـ API ثم إعادة تعيين الفورم
    formRef.value?.reset();
  } else {
    console.log("Form has errors");
  }
};

const handleSaveAndContinue = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Save and continue");
    // هنا يمكنك إرسال البيانات للـ API
  } else {
    console.log("Form has errors");
  }
};

// Icons
const gridIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;
const langIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12786_6371)">
<path d="M1.66669 9.99999H18.3334M1.66669 9.99999C1.66669 14.6024 5.39765 18.3333 10 18.3333M1.66669 9.99999C1.66669 5.39762 5.39765 1.66666 10 1.66666M18.3334 9.99999C18.3334 14.6024 14.6024 18.3333 10 18.3333M18.3334 9.99999C18.3334 5.39762 14.6024 1.66666 10 1.66666M10 1.66666C12.0844 3.94862 13.269 6.91002 13.3334 9.99999C13.269 13.09 12.0844 16.0514 10 18.3333M10 1.66666C7.91562 3.94862 6.73106 6.91002 6.66669 9.99999C6.73106 13.09 7.91562 16.0514 10 18.3333" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12786_6371">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>
`
const plusCircleIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 6.667v6.666M6.667 10h6.666M18.333 10a8.333 8.333 0 1 1-16.666 0 8.333 8.333 0 0 1 16.666 0Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const returnIcon = `<svg width="17" height="13" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.833332 4.16671H12.0833C14.1544 4.16671 15.8333 5.84564 15.8333 7.91671C15.8333 9.98778 14.1544 11.6667 12.0833 11.6667H8.33333M0.833332 4.16671L4.16667 0.833374M0.833332 4.16671L4.16667 7.50004" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.08333 0.750122H10.4788C10.8864 0.750122 11.0902 0.750122 11.2821 0.796172C11.4521 0.837 11.6147 0.904341 11.7638 0.995722C11.932 1.09879 12.0761 1.24292 12.3644 1.53117L14.969 4.13574C15.2572 4.42399 15.4013 4.56812 15.5044 4.73631C15.5958 4.88543 15.6631 5.04801 15.7039 5.21807C15.75 5.40988 15.75 5.61371 15.75 6.02136V12.4168M8.66667 6.58346H5.41667C4.94996 6.58346 4.7166 6.58346 4.53834 6.49263C4.38154 6.41273 4.25406 6.28525 4.17416 6.12845C4.08333 5.95019 4.08333 5.71683 4.08333 5.25012V3.66679M9.5 15.7501V12.0835C9.5 11.6167 9.5 11.3834 9.40917 11.2051C9.32928 11.0483 9.20179 10.9208 9.04499 10.8409C8.86673 10.7501 8.63338 10.7501 8.16667 10.7501H5.41667C4.94996 10.7501 4.7166 10.7501 4.53834 10.8409C4.38154 10.9208 4.25406 11.0483 4.17416 11.2051C4.08333 11.3834 4.08333 11.6167 4.08333 12.0835V15.7501M12.8333 6.71907V13.0835C12.8333 14.0169 12.8333 14.4836 12.6517 14.8401C12.4919 15.1537 12.2369 15.4087 11.9233 15.5685C11.5668 15.7501 11.1001 15.7501 10.1667 15.7501H3.41667C2.48325 15.7501 2.01654 15.7501 1.66002 15.5685C1.34641 15.4087 1.09144 15.1537 0.931656 14.8401C0.75 14.4836 0.75 14.0169 0.75 13.0835V6.33346C0.75 5.40003 0.75 4.93332 0.931656 4.5768C1.09144 4.2632 1.34641 4.00823 1.66002 3.84844C2.01654 3.66679 2.48325 3.66679 3.41667 3.66679H9.78105C9.98487 3.66679 10.0868 3.66679 10.1827 3.68981C10.2677 3.71023 10.349 3.7439 10.4236 3.78959C10.5077 3.84112 10.5797 3.91319 10.7239 4.05731L12.4428 5.77626C12.5869 5.92039 12.659 5.99245 12.7105 6.07655C12.7562 6.15111 12.7899 6.2324 12.8103 6.31743C12.8333 6.41333 12.8333 6.51525 12.8333 6.71907Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const arrowLeftIcon = `<svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1667 5.83337H0.833344M0.833344 5.83337L5.83334 10.8334M0.833344 5.83337L5.83334 0.833374" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="form-validation-page">
      <!-- Main Card -->
      <!-- Header -->
      <PageHeader :icon="gridIcon" title-key="pages.simpleProducts.title"
        description-key="pages.simpleProducts.description" />

      <!-- Tabs -->
      <div
        class="flex lg:items-center lg:justify-between py-4 border-y border-gray-200 flex-col lg:flex-row gap-3 mb-4">
        <!-- Tabs -->
        <div class="flex gap-2 overflow-y-auto">
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

        <div class="flex items-center lg:gap-3 gap-2">
          <!-- Label -->
          <span class="text-sm font-semibold text-gray-700">كود المنتج</span>
          <!-- Product Code Badge -->
          <div class="flex items-center gap-2 px-2.5 py-1.5 bg-primary-100 border border-primary-300 rounded shadow-xs">
            <button @click="copyProductCode" class="cursor-pointer hover:opacity-80 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.6667 1.89111V5.33323C11.6667 5.79994 11.6667 6.0333 11.7575 6.21156C11.8374 6.36836 11.9649 6.49584 12.1217 6.57574C12.3 6.66656 12.5333 6.66656 13 6.66656H16.4422M11.6667 14.1665H6.66671M13.3334 10.8332H6.66671M16.6667 8.32336V14.3332C16.6667 15.7333 16.6667 16.4334 16.3942 16.9681C16.1545 17.4386 15.7721 17.821 15.3017 18.0607C14.7669 18.3332 14.0668 18.3332 12.6667 18.3332H7.33337C5.93324 18.3332 5.23318 18.3332 4.6984 18.0607C4.22799 17.821 3.84554 17.4386 3.60586 16.9681C3.33337 16.4334 3.33337 15.7333 3.33337 14.3332V5.6665C3.33337 4.26637 3.33337 3.56631 3.60586 3.03153C3.84554 2.56112 4.22799 2.17867 4.6984 1.93899C5.23318 1.6665 5.93324 1.6665 7.33337 1.6665H10.0099C10.6213 1.6665 10.9271 1.6665 11.2148 1.73558C11.4699 1.79682 11.7137 1.89783 11.9374 2.0349C12.1897 2.18951 12.4059 2.4057 12.8383 2.83808L15.4951 5.49493C15.9275 5.92731 16.1437 6.1435 16.2983 6.39579C16.4354 6.61947 16.5364 6.86333 16.5976 7.11842C16.6667 7.40614 16.6667 7.71188 16.6667 8.32336Z"
                  stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <span class="font-bold text-primary-800 dir-ltr">{{
              productCode
            }}</span>
          </div>
        </div>
      </div>

      <v-tabs-window v-model="activeTab">
        <!-- Tab 1: البيانات الأساسية -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <div class="">
              <!-- Two Column Layout -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-3 bg-gray-50 rounded-lg p-3">
                <!-- Right Column: Prices Section -->
                <div class="lg:col-span-4 order-2 lg:order-1">
                  <div class="bg-gray-100 rounded-lg p-6">
                    <!-- Prices Header -->
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-[38px] h-[38px] bg-primary-500 rounded flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_852_47730)">
                            <path
                              d="M11.2749 6.95972C10.7979 7.29979 10.2141 7.49984 9.58366 7.49984C7.97283 7.49984 6.66699 6.194 6.66699 4.58317C6.66699 2.97234 7.97283 1.6665 9.58366 1.6665C10.6278 1.6665 11.5438 2.21518 12.0591 3.03996M5.00033 16.7391H7.17557C7.45918 16.7391 7.74106 16.7729 8.016 16.8404L10.3144 17.3989C10.8131 17.5204 11.3326 17.5322 11.8366 17.4343L14.3778 16.9399C15.0491 16.8092 15.6666 16.4877 16.1506 16.0169L17.9486 14.2679C18.462 13.7693 18.462 12.9602 17.9486 12.4607C17.4863 12.011 16.7543 11.9604 16.2313 12.3418L14.1358 13.8705C13.8357 14.0899 13.4706 14.208 13.095 14.208H11.0716L12.3595 14.208C13.0855 14.208 13.6735 13.6359 13.6735 12.9298V12.6741C13.6735 12.0878 13.2633 11.5765 12.6787 11.4347L10.6908 10.9513C10.3673 10.8728 10.036 10.8332 9.70294 10.8332C8.89893 10.8332 7.44357 11.4988 7.44357 11.4988L5.00033 12.5206M16.667 5.4165C16.667 7.02733 15.3612 8.33317 13.7503 8.33317C12.1395 8.33317 10.8337 7.02733 10.8337 5.4165C10.8337 3.80567 12.1395 2.49984 13.7503 2.49984C15.3612 2.49984 16.667 3.80567 16.667 5.4165ZM1.66699 12.1665L1.66699 16.9998C1.66699 17.4665 1.66699 17.6999 1.75782 17.8782C1.83771 18.035 1.9652 18.1624 2.122 18.2423C2.30026 18.3332 2.53361 18.3332 3.00033 18.3332H3.66699C4.1337 18.3332 4.36706 18.3332 4.54532 18.2423C4.70212 18.1624 4.8296 18.035 4.9095 17.8782C5.00033 17.6999 5.00033 17.4665 5.00033 16.9998V12.1665C5.00033 11.6998 5.00033 11.4664 4.9095 11.2882C4.8296 11.1314 4.70212 11.0039 4.54532 10.924C4.36706 10.8332 4.1337 10.8332 3.66699 10.8332L3.00033 10.8332C2.53362 10.8332 2.30026 10.8332 2.122 10.924C1.9652 11.0039 1.83771 11.1314 1.75782 11.2882C1.66699 11.4664 1.66699 11.6998 1.66699 12.1665Z"
                              stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </g>
                          <defs>
                            <clipPath id="clip0_852_47730">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <h2 class="text-lg font-bold text-primary-900">
                        الأسعار
                      </h2>
                    </div>

                    <!-- Price Fields -->
                    <div class="flex flex-col gap-[20px]">
                      <PriceInput v-model="purchasePrice" label="سعر الشراء" placeholder="ادخل السعر"
                        :rules="[required(), numeric(), positive()]" :hide-details="false" />
                      <PriceInput v-model="salePrice" label="سعر البيع" placeholder="ادخل السعر"
                        :rules="[required(), numeric(), positive()]" :hide-details="false" />
                      <div class="grid grid-cols-2 gap-[14px]">
                        <PriceInput v-model="minSalePrice" label="أقل سعر بيع" placeholder="ادخل السعر"
                          :rules="[numeric(), positive()]" :hide-details="false" />
                        <PriceInput v-model="maxSalePrice" label="أعلى سعر بيع" placeholder="ادخل السعر"
                          :rules="[numeric(), positive()]" :hide-details="true" />
                      </div>
                      <div class="grid grid-cols-2 gap-[14px]">
                        <PriceInput v-model="wholesalePrice" label="سعر الجملة" placeholder="سعر الجملة"
                          :rules="[numeric(), positive()]" :hide-details="true" />
                        <PriceInput v-model="halfWholesalePrice" label="سعر نصف الجملة" placeholder="سعر نصف الجملة"
                          :rules="[numeric(), positive()]" :hide-details="true" />
                      </div>
                      <!-- Discount Section -->
                      <div>
                        <SelectInput v-model="discountType" label="نوع الخصم" placeholder="اختر نوع الخصم"
                          :items="discountTypeItems" />
                      </div>
                      <div>
                        <div class="mb-[7px] text-sm font-semibold text-gray-700">
                          قيمة الخصم
                        </div>
                        <div
                          class="bg-gray-200 border border-gray-300 rounded-lg px-3 py-2 min-h-[44px] font-semibold text-primary-900 flex items-center justify-end">
                          <p class="text-base dir-ltr font-semibold">
                            {{ discountValue }} $
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Left Column: Product Info Section -->
                <div class="lg:col-span-8 order-1 lg:order-2">
                  <div class="p-6">
                    <!-- Product Info Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div class="flex items-center gap-3">
                        <div class="w-[38px] h-[38px] bg-primary-500 rounded flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M11.6663 9.1665H6.66634M8.33301 12.4998H6.66634M13.333 5.83317H6.66634M16.6663 5.6665V14.3332C16.6663 15.7333 16.6663 16.4334 16.3939 16.9681C16.1542 17.4386 15.7717 17.821 15.3013 18.0607C14.7665 18.3332 14.0665 18.3332 12.6663 18.3332H7.33301C5.93288 18.3332 5.23281 18.3332 4.69803 18.0607C4.22763 17.821 3.84517 17.4386 3.60549 16.9681C3.33301 16.4334 3.33301 15.7333 3.33301 14.3332V5.6665C3.33301 4.26637 3.33301 3.56631 3.60549 3.03153C3.84517 2.56112 4.22763 2.17867 4.69803 1.93899C5.23281 1.6665 5.93288 1.6665 7.33301 1.6665H12.6663C14.0665 1.6665 14.7665 1.6665 15.3013 1.93899C15.7717 2.17867 16.1542 2.56112 16.3939 3.03153C16.6663 3.56631 16.6663 4.26637 16.6663 5.6665Z"
                              stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </div>
                        <h2 class="text-lg font-bold text-primary-900">
                          المعلومات العامة للمنتج
                        </h2>
                      </div>
                      <div class="flex items-center gap-4">
                        <v-btn variant="flat" color="primary-700" height="40" class="font-semibold text-base"
                          @click="handleAddLanguage">
                          <span>أضف لغة جديدة</span>
                          <template #prepend>
                            <span v-html="langIcon"></span>
                          </template>
                        </v-btn>
                      </div>
                    </div>

                    <!-- Name Fields with Language Tabs -->
                    <LanguageTabs :languages="availableLanguages" label="الإسم" class="mb-[20px]">
                      <template #en>
                        <TextInput v-model="englishName" placeholder="Enter name in English" :rules="[
                          required('englishNameRequired'),
                          minLength(2),
                          maxLength(100),
                        ]" :hide-details="true" />
                      </template>
                      <template #ar>
                        <TextInput v-model="arabicName" placeholder="ادخل الاسم بالعربية" :rules="[
                          required('arabicNameRequired'),
                          minLength(2),
                          maxLength(100),
                          arabicOnly(),
                        ]" :hide-details="true" />
                      </template>
                    </LanguageTabs>

                    <!-- Category and Unit -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-[20px]">
                      <SelectWithIconInput v-model="category" label="التصنيف" placeholder="اختر التصنيف"
                        :items="categoryItems" :rules="[required()]" :hide-details="false" show-add-button
                        @add-click="handleAddCategory" />
                      <div class="flex flex-col">
                        <SelectWithIconInput v-model="unit" label="الوحدة" placeholder="اختر الوحدة" :items="unitItems"
                          :rules="[required()]" :hide-details="false" show-add-button @add-click="handleAddUnit" />
                        <CheckboxInput v-model="isMinUnit" label="اقل وحدة" color="primary" classes="mt-2" />
                      </div>
                    </div>

                    <!-- Description with Language Tabs -->
                    <LanguageTabs :languages="availableLanguages" label="الوصف" class="mb-[20px]">
                      <template #en>
                        <RichTextEditor v-model="englishDescription" placeholder="Enter description in English"
                          min-height="120px" :hide-details="false" />
                      </template>
                      <template #ar>
                        <RichTextEditor v-model="arabicDescription" placeholder="ادخل الوصف بالعربية" min-height="120px"
                          :hide-details="false" />
                      </template>
                    </LanguageTabs>

                    <!-- Product Image Section -->
                    <div>
                      <FileUploadInput v-model="productImages" label="صورة المنتج"
                        hint="PNG, JPG or GIF (max. 400x400px)" :max-files="4" layout="horizontal" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Action Buttons -->
            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
              <v-btn variant="flat" color="primary" height="48" rounded="4"
                class="font-semibold text-base px-6 md:!px-10" @click="handleSaveAndReturn">
                <template #prepend>
                  <span v-html="returnIcon"></span>
                </template>
                <span>حفظ والعودة للرئيسية</span>
              </v-btn>

              <v-btn variant="flat" color="primary-50" height="48" rounded="4"
                class="font-semibold text-base text-primary-700 px-6 md:!px-10" @click="handleSaveAndCreate">
                <template #prepend>
                  <span v-html="saveIcon"></span>
                </template>
                <span>حفظ وإنشاء جديد</span>
              </v-btn>

              <v-btn variant="flat" color="primary-50" height="48" rounded="4"
                class="font-semibold text-base text-primary-700 px-6 md:!px-10" @click="handleSaveAndContinue">
                <template #prepend>
                  <span v-html="arrowLeftIcon"></span>
                </template>
                <span>حفظ وإكمال</span>
              </v-btn>
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: بيانات الضرائب -->
        <v-tabs-window-item :value="1">
          <div class="mx-auto">
            <div class="-mx-6">
              <h3 class="text-lg font-bold text-gray-900 bg-gray-25 border-t-gray-300 border-t px-6 py-3">
                الضرائب المطبقة على المنتج
              </h3>
              <!-- Tax Fields Row -->
              <div
                class="grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-4 items-center px-6 bg-primary-50 py-3 border-t border-t-gray-300">
                <SelectWithIconInput v-model="taxType" placeholder="اختر النوع" :items="taxTypeItems"
                  :hide-details="true" show-add-button @add-click="handleAddTaxType" />
                <TextInput v-model="taxPercentage" placeholder="النسبة" :hide-details="true" disabled />
                <SelectInput v-model="taxMinValue" placeholder="اختر القيمة" :items="taxMinValueItems"
                  :hide-details="true" />
                <SelectInput v-model="taxPriority" placeholder="اختر الأولوية" :items="taxPriorityItems"
                  :hide-details="true" />
                <v-btn variant="flat" color="primary-500" border="sm" rounded="4" height="44"
                  class="font-semibold !text-white text-sm !border-primary-200" @click="handleAddTax">
                  <template #prepend>
                    <span v-html="plusIcon"></span>
                  </template>
                  <span>اضافة ضريبة</span>
                </v-btn>
              </div>

              <!-- Tax Table -->
              <DataTable :headers="taxTableHeaders" :items="taxTableItems" show-checkbox show-actions
                @edit="handleEditTax" @delete="handleDeleteTax" />
            </div>
          </div>
        </v-tabs-window-item>

        <!-- Tab 3: البيانات الإضافية -->
        <v-tabs-window-item :value="2">
          <!-- Supply and Internal Relations Section -->
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 class="text-lg font-bold text-primary-900 mb-6 text-right">
              التوريد والعلاقات الداخلية للمنتج
            </h2>

            <!-- Row 1: Country, Manufacturer, Brand -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
              <SelectWithIconInput v-model="originCountry" label="بلد المنشأ" placeholder="اختر البلد"
                :items="countryItems" :hide-details="true" show-add-button @add-click="handleAddCountry" />
              <SelectWithIconInput v-model="manufacturer" label="المصنع" placeholder="اختر المصنع"
                :items="manufacturerItems" :hide-details="true" show-add-button @add-click="handleAddManufacturer" />
              <SelectWithIconInput v-model="brand" label="العلامة التجارية" placeholder="ادخل العلامة التجارية"
                :items="brandItems" :hide-details="true" show-add-button @add-click="handleAddBrand" />
            </div>

            <!-- Row 2: Related, Attached, Alternative Products -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
              <SelectInput v-model="relatedProducts" label="المنتجات المرتبطة" placeholder="اختر المنتج"
                :items="productItems" :hide-details="true" />
              <SelectInput v-model="attachedProducts" label="المنتجات الملحقة" placeholder="اختر المنتج"
                :items="productItems" :hide-details="true" />
              <SelectInput v-model="alternativeProducts" label="المنتجات البديلة" placeholder="اختر المنتج"
                :items="productItems" :hide-details="true" />
            </div>

            <!-- Row 3: Best Suppliers -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
              <SelectInput v-model="bestSuppliers" label="افضل الموردين" placeholder="اختر المورد"
                :items="supplierItems" :hide-details="true" />
            </div>
          </div>

          <!-- Advanced Product Attributes Section -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-lg font-bold text-primary-900 mb-6 text-right">
              سمات/خصائص المنتج المتقدمة
            </h2>

            <div class="flex flex-wrap gap-8">
              <CheckboxInput v-model="isManufacturingProduct" label="منتج تصنيع" color="primary" />
              <CheckboxInput v-model="sellNegative" label="البيع بالسالب" color="primary" />
              <CheckboxInput v-model="isAvailableForRent" label="قابل للإيجار" color="primary" />
              <CheckboxInput v-model="isAvailableForReturn" label="قابل للمقايضة" color="primary" />
              <CheckboxInput v-model="isAvailableForRefund" label="قابل للارجاع" color="primary" />
              <CheckboxInput v-model="isAvailableForOffset" label="قابل للمقاصة" color="primary" />
              <CheckboxInput v-model="isAvailableForSelling" label="متاح للبيع" color="primary" />
              <CheckboxInput v-model="isAvailableForBuying" label="متاح للشراء" color="primary" />
              <CheckboxInput v-model="isAvailableForPurchase" label="متاح للمشاريع" color="primary" />
            </div>
          </div>
          <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
            <v-btn variant="flat" color="primary-50" rounded="4" height="48"
              class="font-semibold text-base text-primary-700 px-6 min-w-56" @click="handleSaveAndContinue">
              <span>حفظ</span>
            </v-btn>

            <v-btn variant="flat" color="primary" rounded="4" height="48" class="min-w-56" @click="handleSaveAndCreate">
              <span>حفظ / انشاء جديد</span>
            </v-btn>
          </div>
        </v-tabs-window-item>

        <!-- Tab 4: قائمة الاختبارات -->
        <v-tabs-window-item :value="3">
          <div class="mx-auto">
            <!-- Form Section (Separate from table) -->
            <div class="bg-white rounded-lg p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">قائمة الاختبارات</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">الاختبار</label>
                  <SelectInput v-model="testForm.testName" placeholder="اختر" :items="testItems" :hide-details="true" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">عدد الاختبارات</label>
                  <TextInput v-model="testForm.testsCount" placeholder="عدد الاختبارات" :hide-details="true"
                    type="number" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">عدد العينات</label>
                  <TextInput v-model="testForm.samplesCount" placeholder="عدد العينات" :hide-details="true"
                    type="number" />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">كمية العينات</label>
                  <TextInput v-model="testForm.sampleQuantity" placeholder="كمية العينات" :hide-details="true"
                    type="number" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">الحالة</label>
                  <div class="flex items-center gap-3 mt-1">
                    <v-radio-group v-model="testForm.status" inline hide-details>
                      <v-radio :value="true" color="primary">
                        <template #label>
                          <span :class="testForm.status ? 'text-primary font-semibold' : 'text-gray-600'">
                            فعال
                          </span>
                        </template>
                      </v-radio>
                      <v-radio :value="false" color="primary">
                        <template #label>
                          <span :class="!testForm.status ? 'text-primary font-semibold' : 'text-gray-600'">
                            غير فعال
                          </span>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </div>
                </div>
                <v-btn variant="flat" color="primary" rounded="4" height="48"
                  class="font-semibold text-base w-full md:col-span-2" @click="handleAddTest">
                  <span>+ اضف جديد</span>
                </v-btn>

              </div>

            </div>

            <!-- Tests Table -->
            <div class="-mx-6">
              <DataTable :headers="testsTableHeaders" :items="testsList" show-checkbox show-actions :show-view="false"
                @edit="handleEditTest" @delete="handleDeleteTest">
              </DataTable>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
              <v-btn variant="flat" color="primary" rounded="4" height="48" class="min-w-56"
                @click="handleSaveAndCreate">
                <template #prepend>
                  <span v-html="saveIcon"></span>
                </template>

                <span>حفظ</span>
              </v-btn>
              <v-btn variant="flat" color="primary-50" rounded="4" height="48"
                class="font-semibold text-base text-primary-700 px-6 min-w-56" @click="handleSaveAndContinue">
                <template #prepend>
                  <v-icon>mdi-close</v-icon>
                </template>

                <span>إغلاق</span>
              </v-btn>
            </div>
          </div>

          <!-- Edit Test Dialog -->
          <TestFormDialog v-model="showTestDialog" :test="editingTest" @save="handleSaveTest" />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </default-layout>
</template>

<style scoped></style>
