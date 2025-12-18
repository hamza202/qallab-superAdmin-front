<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// Check if editing
const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? 'تعديل مشروع' : 'إضافة مشروع');

// Form ref
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Tabs
const activeTab = ref(0);
const tabs = [
  { title: "معلومات المشروع", value: 0 },
  { title: "جهة اتصال المشروع", value: 1 },
  { title: "مرفقات المشروع", value: 2 },
];

const isTabActive = (value: number) => activeTab.value === value;
const isTabCompleted = (value: number) => {
  if (value === 0) return projectInfoCompleted.value;
  if (value === 1) return contactInfoCompleted.value;
  if (value === 2) return attachmentsCompleted.value;
  return false;
};

// Project Info completion check
const projectInfoCompleted = computed(() => {
  return !!(projectNameArabic.value && projectNameEnglish.value);
});

const contactInfoCompleted = computed(() => {
  return contacts.value.length > 0;
});

const attachmentsCompleted = computed(() => {
  return attachments.value.length > 0;
});

// Form data - Project Info
const customerType = ref(null);
const licenseIssueDate = ref("");
const customerName = ref(null);
const projectNameArabic = ref("");
const projectNameEnglish = ref("");
const startDate = ref("");
const endDate = ref("");
const addressArabic = ref("");
const addressEnglish = ref("");
const commercialRegister = ref("");
const descriptionArabic = ref("");
const descriptionEnglish = ref("");
const geoLocation = ref("");

// Contact List
const contacts = ref([
  {
    id: 1,
    nameEnglish: "Mohammed",
    email: "Mannager@gmail.com",
    phone: "0096645745547",
    position: "مدير",
    showInPrice: true,
    showInReports: true,
  },
]);

const newContact = ref({
  nameEnglish: "",
  email: "",
  phone: "",
  position: "",
  showInPrice: false,
  showInReports: false,
});

// Attachments
const attachments = ref([
  {
    id: 1,
    fileName: "اسم الملف",
    file: {
      name: "ملف مشروع البيوت",
      size: "200 KB",
      progress: 100,
    },
  },
]);

const newAttachment = ref({
  fileName: "",
  file: null as File | null,
});

// Select items
const customerTypeItems = [
  { title: "نوع العميل", value: "type1" },
  { title: "نوع العميل 2", value: "type2" },
];

const customerNameItems = [
  { title: "اسم العميل", value: "customer1" },
  { title: "اسم العميل 2", value: "customer2" },
];

// Handlers
const addContact = () => {
  if (newContact.value.nameEnglish) {
    contacts.value.push({
      id: contacts.value.length + 1,
      ...newContact.value,
    });
    newContact.value = {
      nameEnglish: "",
      email: "",
      phone: "",
      position: "",
      showInPrice: false,
      showInReports: false,
    };
  }
};

const deleteContact = (contactId: number) => {
  contacts.value = contacts.value.filter(c => c.id !== contactId);
};

const addAttachment = () => {
  if (newAttachment.value.fileName) {
    attachments.value.push({
      id: attachments.value.length + 1,
      fileName: newAttachment.value.fileName,
      file: {
        name: newAttachment.value.file?.name || "ملف جديد",
        size: newAttachment.value.file ? `${Math.round(newAttachment.value.file.size / 1024)} KB` : "0 KB",
        progress: 100,
      },
    });
    newAttachment.value = {
      fileName: "",
      file: null,
    };
  }
};

const deleteAttachment = (attachmentId: number) => {
  attachments.value = attachments.value.filter(a => a.id !== attachmentId);
};

const viewAttachment = (attachment: any) => {
  console.log("Viewing attachment:", attachment);
};

const handleSave = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    console.log("Form is valid! Saving project...");
    router.push({ name: "ProjectsList" });
  }
};

const handleClose = () => {
  router.push({ name: "ProjectsList" });
};

// Icons
const projectsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="6" y="6" width="40" height="40" rx="4" stroke="#1570EF" stroke-width="3"/>
<path d="M6 16H46" stroke="#1570EF" stroke-width="3"/>
<path d="M16 6V16" stroke="#1570EF" stroke-width="3"/>
<path d="M36 6V16" stroke="#1570EF" stroke-width="3"/>
<rect x="14" y="24" width="8" height="8" rx="1" fill="#1570EF"/>
<rect x="28" y="24" width="8" height="8" rx="1" fill="#1570EF"/>
<rect x="14" y="36" width="8" height="8" rx="1" fill="#1570EF"/>
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

const viewIcon = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.66699 7.00033C1.66699 7.00033 4.16699 1.16699 10.0003 1.16699C15.8337 1.16699 18.3337 7.00033 18.3337 7.00033C18.3337 7.00033 15.8337 12.8337 10.0003 12.8337C4.16699 12.8337 1.66699 7.00033 1.66699 7.00033Z" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.0003 9.50033C11.381 9.50033 12.5003 8.38104 12.5003 7.00033C12.5003 5.61961 11.381 4.50033 10.0003 4.50033C8.61961 4.50033 7.50033 5.61961 7.50033 7.00033C7.50033 8.38104 8.61961 9.50033 10.0003 9.50033Z" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const fileIcon = `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6667 1.5V6.5C11.6667 6.96667 11.6667 7.2 11.7575 7.37833C11.8374 7.53513 11.9649 7.66261 12.1217 7.7425C12.3 7.83333 12.5333 7.83333 13 7.83333H18M11.6667 17.3333H5M15 13.6667H5M18.3333 9.32386V17.5C18.3333 18.9001 18.3333 19.6002 18.0608 20.135C17.8212 20.6054 17.4387 20.9878 16.9683 21.2275C16.4335 21.5 15.7335 21.5 14.3333 21.5H5.66667C4.26654 21.5 3.56647 21.5 3.03169 21.2275C2.56129 20.9878 2.17883 20.6054 1.93915 20.135C1.66667 19.6002 1.66667 18.9001 1.66667 17.5V5.83333C1.66667 4.4332 1.66667 3.73314 1.93915 3.19836C2.17883 2.72795 2.56129 2.3455 3.03169 2.10582C3.56647 1.83333 4.26654 1.83333 5.66667 1.83333H10.1762C10.7868 1.83333 11.0921 1.83333 11.3797 1.90267C11.6346 1.96414 11.8779 2.06622 12.1 2.20519C12.3517 2.36252 12.5668 2.57761 12.9969 3.00778L17.4921 7.50289C17.9223 7.93306 18.1374 8.14815 18.2947 8.39989C18.4337 8.62199 18.5358 8.86531 18.5973 9.12019C18.6667 9.40783 18.6667 9.71314 18.6667 10.3238V9.32386Z" stroke="#1570EF" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 1V11M1 6H11" stroke="#344054" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

</script>

<template>
  <default-layout>
    <div class="project-form-page">
      <!-- Header -->
      <PageHeader :icon="projectsIcon" title-key="pages.projects.title"
        description-key="pages.projects.description" />

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
        <!-- Tab 1: معلومات المشروع -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <!-- Project Data Section -->
            <div class="mb-6 bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-bold text-primary-900 mb-4">بيانات المشروع</h2>

              <!-- Row 1: Customer Type, License Issue Date, Customer Name -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <SelectInput v-model="customerType" label="نوع العميل" placeholder="نوع العميل" :items="customerTypeItems"
                  :hide-details="false" />
                <TextInput v-model="licenseIssueDate" type="date" label="تاريخ اصدار الرخصة" placeholder="22/05/2025"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
                <SelectInput v-model="customerName" label="اسم العميل" placeholder="اسم العميل" :items="customerNameItems"
                  :hide-details="false" />
              </div>

              <!-- Row 2: Project Name Arabic, Project Name English, Start Date -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="projectNameArabic" label="اسم المشروع بالعربية" placeholder="اسم المشروع"
                  :rules="[required()]" :hide-details="false" />
                <TextInput v-model="projectNameEnglish" label="اسم المشروع بالانجليزية" placeholder="name company"
                  :rules="[required()]" :hide-details="false" />
                <TextInput v-model="startDate" type="date" label="تاريخ البدء" placeholder="22/05/2025"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
              </div>

              <!-- Row 3: End Date, Address Arabic, Address English -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="endDate" type="date" label="تاريخ الانتهاء" placeholder="22/05/2025"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
                <TextInput v-model="addressArabic" label="العنوان بالعربية" placeholder="ادخل العنوان"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
                <TextInput v-model="addressEnglish" label="العنوان بالانجليزية" placeholder="address"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
              </div>

              <!-- Row 4: Commercial Register, Description Arabic, Description English -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <TextInput v-model="commercialRegister" label="السجل التجاري" placeholder="ادخل الرقم"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
                  </template>
                </TextInput>
                <v-textarea v-model="descriptionArabic" label="الوصف بالعربية" placeholder="تفاصيل المنتج"
                  variant="outlined" density="comfortable" rows="3" hide-details class="bg-white" />
                <v-textarea v-model="descriptionEnglish" label="الوصف بالانجليزية" placeholder="details"
                  variant="outlined" density="comfortable" rows="3" hide-details class="bg-white" />
              </div>

              <!-- Row 5: Geo Location -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextInput v-model="geoLocation" label="الموقع الجغرافي" placeholder="حدد الموقع"
                  :hide-details="false">
                  <template #prepend-inner>
                    <v-icon size="small" color="gray">mdi-crosshairs-gps</v-icon>
                  </template>
                </TextInput>
              </div>
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: جهة اتصال المشروع -->
        <v-tabs-window-item :value="1">
          <div class="mb-6 bg-gray-50 rounded-lg p-6">
            <!-- Contacts Table -->
            <v-table class="bg-white rounded-lg">
              <thead>
                <tr class="bg-gray-100">
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">
                    <v-checkbox hide-details density="compact" />
                  </th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">الاسم بالانجليزية</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">البريد الالكتروني</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">رقم الهاتف</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">المنصب</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">اظهاره في عرض السعر</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">العرض في التقارير</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">الاجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="contact in contacts" :key="contact.id" class="border-b border-gray-200">
                  <td class="py-3 px-4">
                    <v-checkbox hide-details density="compact" />
                  </td>
                  <td class="py-3 px-4 text-gray-900">{{ contact.nameEnglish }}</td>
                  <td class="py-3 px-4 text-gray-900">{{ contact.email }}</td>
                  <td class="py-3 px-4 text-gray-900">{{ contact.phone }}</td>
                  <td class="py-3 px-4 text-gray-900">{{ contact.position }}</td>
                  <td class="py-3 px-4">
                    <v-switch v-model="contact.showInPrice" color="primary" hide-details density="compact" />
                  </td>
                  <td class="py-3 px-4">
                    <v-switch v-model="contact.showInReports" color="primary" hide-details density="compact" />
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <v-btn icon size="small" variant="text">
                        <span v-html="editIcon"></span>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-tabs-window-item>

        <!-- Tab 3: مرفقات المشروع -->
        <v-tabs-window-item :value="2">
          <div class="mb-6 bg-gray-50 rounded-lg p-6">
            <!-- Add Attachment Button -->
            <v-btn variant="outlined" height="40" class="font-semibold text-base border-gray-300 mb-4"
              @click="addAttachment">
              <template #prepend>
                <span v-html="plusIcon"></span>
              </template>
              أضف مرفق
            </v-btn>

            <!-- Attachments Table -->
            <v-table class="bg-white rounded-lg">
              <thead>
                <tr class="bg-gray-100">
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">
                    <v-checkbox hide-details density="compact" />
                  </th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">اسم الملف</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">الملف</th>
                  <th class="text-right font-semibold text-gray-700 py-3 px-4">الاجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attachment in attachments" :key="attachment.id" class="border-b border-gray-200">
                  <td class="py-3 px-4">
                    <v-checkbox hide-details density="compact" />
                  </td>
                  <td class="py-3 px-4 text-gray-900">{{ attachment.fileName }}</td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 max-w-xs">
                      <span v-html="fileIcon"></span>
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-900">{{ attachment.file.name }}</span>
                        <span class="text-xs text-gray-500">{{ attachment.file.size }} – {{ attachment.file.progress }}% uploaded</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <v-btn icon size="small" variant="text" @click="deleteAttachment(attachment.id)">
                        <span v-html="trashIcon"></span>
                      </v-btn>
                      <v-btn icon size="small" variant="text">
                        <span v-html="editIcon"></span>
                      </v-btn>
                      <v-btn icon size="small" variant="text" @click="viewAttachment(attachment)">
                        <span v-html="viewIcon"></span>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
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
