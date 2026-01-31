<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface TestItem {
    id: number;
    testGroup: string;
    testName: string;
    testsCount: number;
    samplesCount: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    notes: string;
}

// Collapsible sections state
const basicInfoOpen = ref(false);
const testsOpen = ref(true);
const servicesOpen = ref(false);
const financialOpen = ref(false);

// Step completion state
const basicInfoCompleted = ref(true);
const testsCompleted = ref(false);
const servicesCompleted = ref(false);
const financialCompleted = ref(false);

// Form data with static values
const formData = ref({
    requestNumber: '#124098',
    supplierName: 'كنود العربي',
    supplier: 'كنود العربي',
    project: 'مشروع إنشاء أبراج سكنية',
    paymentMethod: 'كاش',
    validityPeriod: '10 أيام',
    priceValidityDate: '2024-03-01',
    attachments: 'ملف مواصفات المشروعات - 200 KB - 100% uploaded'
});

// Static test items data
const testItems = ref<TestItem[]>([
    {
        id: 1,
        testGroup: 'جودة السيراميك',
        testName: 'امتصاص الماء',
        testsCount: 4,
        samplesCount: 5,
        unit: '2p',
        unitPrice: 132,
        totalPrice: 150,
        notes: ''
    },
    {
        id: 2,
        testGroup: 'المقاومة الفنية',
        testName: 'مقاومة الكسر',
        testsCount: 5,
        samplesCount: 6,
        unit: 'الوحدة',
        unitPrice: 44,
        totalPrice: 345,
        notes: ''
    },
    {
        id: 3,
        testGroup: 'المواصفات القياسية',
        testName: 'مقاومة التآكل',
        testsCount: 6,
        samplesCount: 7,
        unit: 'دورة',
        unitPrice: 780,
        totalPrice: 240,
        notes: ''
    }
]);

// Suppliers dropdown options
const supplierOptions = ref([
    { title: 'كنود العربي', value: 'كنود العربي' },
    { title: 'مورد آخر', value: 'مورد آخر' }
]);

// Projects dropdown options
const projectOptions = ref([
    { title: 'مشروع إنشاء أبراج سكنية', value: 'مشروع إنشاء أبراج سكنية' },
    { title: 'مشروع آخر', value: 'مشروع آخر' }
]);

// Payment methods dropdown options
const paymentMethodOptions = ref([
    { title: 'كاش', value: 'كاش' },
    { title: 'آجل', value: 'آجل' },
    { title: 'تحويل بنكي', value: 'تحويل بنكي' }
]);

const handleAddTest = () => {
    console.log('Add test clicked');
};

const handleEditTest = (item: TestItem) => {
    console.log('Edit test:', item);
};

const handleDeleteTest = (item: TestItem) => {
    const index = testItems.value.findIndex(t => t.id === item.id);
    if (index !== -1) {
        testItems.value.splice(index, 1);
    }
};

const handleNext = () => {
    console.log('Next clicked');
};

const toggleSection = (section: string) => {
    switch(section) {
        case 'basic':
            basicInfoOpen.value = !basicInfoOpen.value;
            break;
        case 'tests':
            testsOpen.value = !testsOpen.value;
            break;
        case 'services':
            servicesOpen.value = !servicesOpen.value;
            break;
        case 'financial':
            financialOpen.value = !financialOpen.value;
            break;
    }
}

const formIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" fill-rule="evenodd" clip-rule="evenodd" d="M13 6.5C13 5.39543 13.8954 4.5 15 4.5H28.1716C28.702 4.5 29.2107 4.71071 29.5858 5.08579L39.4142 14.9142C39.7893 15.2893 40 15.798 40 16.3284V45.5C40 46.6046 39.1046 47.5 38 47.5H15C13.8954 47.5 13 46.6046 13 45.5V6.5Z" fill="#194185"/>
<path d="M15 4.5H28.1716C28.702 4.5 29.2107 4.71071 29.5858 5.08579L39.4142 14.9142C39.7893 15.2893 40 15.798 40 16.3284V45.5C40 46.6046 39.1046 47.5 38 47.5H15C13.8954 47.5 13 46.6046 13 45.5V6.5C13 5.39543 13.8954 4.5 15 4.5Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28 4.5V13.5C28 14.6046 28.8954 15.5 30 15.5H40" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 25.5H33M20 33.5H33M20 17.5H25" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
    <default-layout>
        <div class="request-for-quotation-page px-6">
            <!-- Page Header -->
            <PageHeader :icon="formIcon" title-key="pages.requestForQuotation.title"
                description-key="pages.requestForQuotation.description" />

            <!-- Request Number and Supplier Name Header -->
            <div class="flex items-center gap-4 mb-6">
                <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2">
                    <v-icon size="20" color="primary">mdi-file-document-outline</v-icon>
                    <span class="text-primary-900 font-semibold">{{ formData.requestNumber }}</span>
                </div>
                <span class="text-gray-700">{{ formData.supplierName }}</span>
            </div>

            <!-- Step 1: Basic Information (Completed - Green) -->
            <div class="mb-4">
                <div 
                    :class="basicInfoCompleted ? 'bg-green-500' : 'bg-blue-500'"
                    class="rounded-lg cursor-pointer transition-all"
                    @click="toggleSection('basic')"
                >
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center gap-3 text-white">
                            <v-icon color="white" size="24">mdi-clipboard-text-outline</v-icon>
                            <span class="font-semibold text-lg">البيانات الأساسية</span>
                        </div>
                        <v-icon color="white" size="24">
                            {{ basicInfoOpen ? 'mdi-minus' : 'mdi-plus' }}
                        </v-icon>
                    </div>
                </div>

                <v-expand-transition>
                    <div v-show="basicInfoOpen" class="bg-white border border-gray-200 rounded-b-lg p-6 -mt-2">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Supplier -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">المورد</label>
                                <SelectInput 
                                    v-model="formData.supplier"
                                    :items="supplierOptions"
                                    item-title="title"
                                    item-value="value"
                                    placeholder="اسم المورد"
                                    density="comfortable"
                                    append-inner-icon="mdi-plus-circle"
                                />
                            </div>

                            <!-- Project -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">المشروع</label>
                                <SelectInput 
                                    v-model="formData.project"
                                    :items="projectOptions"
                                    item-title="title"
                                    item-value="value"
                                    placeholder="مشروع إنشاء أبراج سكنية"
                                    density="comfortable"
                                    append-inner-icon="mdi-plus-circle"
                                />
                            </div>

                            <!-- Payment Method -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                <SelectInput 
                                    v-model="formData.paymentMethod"
                                    :items="paymentMethodOptions"
                                    item-title="title"
                                    item-value="value"
                                    placeholder="كاش"
                                    density="comfortable"
                                />
                            </div>

                            <!-- Attachments -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">المرفقات</label>
                                <div class="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 flex items-center gap-2">
                                    <v-icon size="20" color="primary">mdi-paperclip</v-icon>
                                    <span class="text-sm text-gray-600">{{ formData.attachments }}</span>
                                </div>
                            </div>

                            <!-- Price Validity Date -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">تاريخ عرض السعر</label>
                                <TextInput 
                                    v-model="formData.priceValidityDate"
                                    type="date"
                                    density="comfortable"
                                    append-inner-icon="mdi-calendar"
                                />
                            </div>

                            <!-- Validity Period -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">فترة الصلاحية</label>
                                <TextInput 
                                    v-model="formData.validityPeriod"
                                    placeholder="10 أيام"
                                    density="comfortable"
                                />
                            </div>
                        </div>

                        <!-- Next Button -->
                        <div class="flex justify-center mt-6">
                            <v-btn 
                                color="primary" 
                                size="large"
                                rounded="lg"
                                class="px-12"
                                @click="handleNext"
                            >
                                التالي
                            </v-btn>
                        </div>
                    </div>
                </v-expand-transition>
            </div>

            <!-- Step 2: Tests (Active - Blue) -->
            <div class="mb-4">
                <div 
                    :class="testsCompleted ? 'bg-green-500' : 'bg-blue-500'"
                    class="rounded-lg cursor-pointer transition-all"
                    @click="toggleSection('tests')"
                >
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center gap-3 text-white">
                            <v-icon color="white" size="24">mdi-flask-outline</v-icon>
                            <span class="font-semibold text-lg">الاختبارات</span>
                        </div>
                        <v-icon color="white" size="24">
                            {{ testsOpen ? 'mdi-minus' : 'mdi-plus' }}
                        </v-icon>
                    </div>
                </div>

                <v-expand-transition>
                    <div v-show="testsOpen" class="bg-white border border-gray-200 rounded-b-lg p-6 -mt-2">
                        <!-- Add Test Button -->
                        <div class="flex justify-start mb-4">
                            <v-btn 
                                color="primary" 
                                variant="flat"
                                prepend-icon="mdi-plus"
                                @click="handleAddTest"
                            >
                                أضف اختبار
                            </v-btn>
                        </div>

                        <!-- Tests Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">مجموعة الاختبارات</th>
                                        <th class="border border-gray-300 px-4 py-3 text-right text-sm font-semibold">الاختبار</th>
                                        <th class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">عدد الاختبارات</th>
                                        <th class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">عدد العينات</th>
                                        <th class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">الوحدة</th>
                                        <th class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">سعر الوحدة</th>
                                        <th class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">المبلغ الإجمالي</th>
                                        <th class="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in testItems" :key="item.id" class="hover:bg-gray-50">
                                        <td class="border border-gray-300 px-4 py-3 text-sm">{{ item.testGroup }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-sm">{{ item.testName }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-center text-sm">{{ item.testsCount }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-center text-sm">{{ item.samplesCount }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-center text-sm">{{ item.unit }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-center text-sm">{{ item.unitPrice }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-center text-sm">{{ item.totalPrice }}</td>
                                        <td class="border border-gray-300 px-4 py-3 text-center">
                                            <div class="flex items-center justify-center gap-2">
                                                <v-btn 
                                                    icon 
                                                    size="small" 
                                                    variant="text"
                                                    color="primary"
                                                    @click="handleEditTest(item)"
                                                >
                                                    <v-icon size="18">mdi-pencil</v-icon>
                                                </v-btn>
                                                <v-btn 
                                                    icon 
                                                    size="small" 
                                                    variant="text"
                                                    color="error"
                                                    @click="handleDeleteTest(item)"
                                                >
                                                    <v-icon size="18">mdi-delete</v-icon>
                                                </v-btn>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Next Button -->
                        <div class="flex justify-center mt-6">
                            <v-btn 
                                color="primary" 
                                size="large"
                                rounded="lg"
                                class="px-12"
                                @click="handleNext"
                            >
                                التالي
                            </v-btn>
                        </div>
                    </div>
                </v-expand-transition>
            </div>

            <!-- Step 3: Services (Inactive - Blue) -->
            <div class="mb-4">
                <div 
                    :class="servicesCompleted ? 'bg-green-500' : 'bg-blue-500'"
                    class="rounded-lg cursor-pointer transition-all"
                    @click="toggleSection('services')"
                >
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center gap-3 text-white">
                            <v-icon color="white" size="24">mdi-view-grid-outline</v-icon>
                            <span class="font-semibold text-lg">الخدمات</span>
                        </div>
                        <v-icon color="white" size="24">
                            {{ servicesOpen ? 'mdi-minus' : 'mdi-plus' }}
                        </v-icon>
                    </div>
                </div>

                <v-expand-transition>
                    <div v-show="servicesOpen" class="bg-white border border-gray-200 rounded-b-lg p-6 -mt-2">
                        <p class="text-gray-600 text-center py-8">محتوى الخدمات سيتم إضافته هنا</p>
                        
                        <!-- Next Button -->
                        <div class="flex justify-center mt-6">
                            <v-btn 
                                color="primary" 
                                size="large"
                                rounded="lg"
                                class="px-12"
                                @click="handleNext"
                            >
                                التالي
                            </v-btn>
                        </div>
                    </div>
                </v-expand-transition>
            </div>

            <!-- Step 4: Financial Information (Inactive - Blue) -->
            <div class="mb-4">
                <div 
                    :class="financialCompleted ? 'bg-green-500' : 'bg-blue-500'"
                    class="rounded-lg cursor-pointer transition-all"
                    @click="toggleSection('financial')"
                >
                    <div class="flex items-center justify-between px-6 py-4">
                        <div class="flex items-center gap-3 text-white">
                            <v-icon color="white" size="24">mdi-currency-usd</v-icon>
                            <span class="font-semibold text-lg">البيانات المالية</span>
                        </div>
                        <v-icon color="white" size="24">
                            {{ financialOpen ? 'mdi-minus' : 'mdi-plus' }}
                        </v-icon>
                    </div>
                </div>

                <v-expand-transition>
                    <div v-show="financialOpen" class="bg-white border border-gray-200 rounded-b-lg p-6 -mt-2">
                        <p class="text-gray-600 text-center py-8">محتوى البيانات المالية سيتم إضافته هنا</p>
                        
                        <!-- Next Button -->
                        <div class="flex justify-center mt-6">
                            <v-btn 
                                color="primary" 
                                size="large"
                                rounded="lg"
                                class="px-12"
                                @click="handleNext"
                            >
                                التالي
                            </v-btn>
                        </div>
                    </div>
                </v-expand-transition>
            </div>
        </div>
    </default-layout>
</template>

<style scoped>
.request-for-quotation-page {
    direction: rtl;
}
</style>
