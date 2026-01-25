<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

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
  {
    title: "معلومات المشروع", value: 0, icon: `<svg width="19" height="22" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 11.5V5.8C17 4.11984 17 3.27976 16.673 2.63803C16.3854 2.07354 15.9265 1.6146 15.362 1.32698C14.7202 1 13.8802 1 12.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H9M11 10H5M7 14H5M13 6H5M11.5 18L13.5 20L18 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`},
  {
    title: "جهة اتصال المشروع", value: 1, icon: `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 3.5H17.3C18.4201 3.5 18.9802 3.5 19.408 3.71799C19.7843 3.90973 20.0903 4.21569 20.282 4.59202C20.5 5.01984 20.5 5.57989 20.5 6.7V8C20.5 8.93188 20.5 9.39783 20.3478 9.76537C20.1448 10.2554 19.7554 10.6448 19.2654 10.8478C18.8978 11 18.4319 11 17.5 11M12 18.5H4.7C3.5799 18.5 3.01984 18.5 2.59202 18.282C2.21569 18.0903 1.90973 17.7843 1.71799 17.408C1.5 16.9802 1.5 16.4201 1.5 15.3V14C1.5 13.0681 1.5 12.6022 1.65224 12.2346C1.85523 11.7446 2.24458 11.3552 2.73463 11.1522C3.10218 11 3.56812 11 4.5 11M9.3 13.5H12.7C12.98 13.5 13.12 13.5 13.227 13.4455C13.3211 13.3976 13.3976 13.3211 13.4455 13.227C13.5 13.12 13.5 12.98 13.5 12.7V9.3C13.5 9.01997 13.5 8.87996 13.4455 8.773C13.3976 8.67892 13.3211 8.60243 13.227 8.5545C13.12 8.5 12.98 8.5 12.7 8.5H9.3C9.01997 8.5 8.87996 8.5 8.773 8.5545C8.67892 8.60243 8.60243 8.67892 8.5545 8.773C8.5 8.87996 8.5 9.01997 8.5 9.3V12.7C8.5 12.98 8.5 13.12 8.5545 13.227C8.60243 13.3211 8.67892 13.3976 8.773 13.4455C8.87996 13.5 9.01997 13.5 9.3 13.5ZM16.8 21H20.2C20.48 21 20.62 21 20.727 20.9455C20.8211 20.8976 20.8976 20.8211 20.9455 20.727C21 20.62 21 20.48 21 20.2V16.8C21 16.52 21 16.38 20.9455 16.273C20.8976 16.1789 20.8211 16.1024 20.727 16.0545C20.62 16 20.48 16 20.2 16H16.8C16.52 16 16.38 16 16.273 16.0545C16.1789 16.1024 16.1024 16.1789 16.0545 16.273C16 16.38 16 16.52 16 16.8V20.2C16 20.48 16 20.62 16.0545 20.727C16.1024 20.8211 16.1789 20.8976 16.273 20.9455C16.38 21 16.52 21 16.8 21ZM1.8 6H5.2C5.48003 6 5.62004 6 5.727 5.9455C5.82108 5.89757 5.89757 5.82108 5.9455 5.727C6 5.62004 6 5.48003 6 5.2V1.8C6 1.51997 6 1.37996 5.9455 1.273C5.89757 1.17892 5.82108 1.10243 5.727 1.0545C5.62004 1 5.48003 1 5.2 1H1.8C1.51997 1 1.37996 1 1.273 1.0545C1.17892 1.10243 1.10243 1.17892 1.0545 1.273C1 1.37996 1 1.51997 1 1.8V5.2C1 5.48003 1 5.62004 1.0545 5.727C1.10243 5.82108 1.17892 5.89757 1.273 5.9455C1.37996 6 1.51997 6 1.8 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
` },
  {
    title: "مرفقات المشروع", value: 2, icon: `<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.9779 9.44975L9.96231 18.4654C7.91206 20.5156 4.58794 20.5156 2.53769 18.4654C0.487437 16.4151 0.487437 13.091 2.53769 11.0407L11.5533 2.02513C12.9201 0.658291 15.1362 0.658291 16.503 2.02513C17.8699 3.39196 17.8699 5.60804 16.503 6.97487L7.84099 15.6369C7.15757 16.3203 6.04953 16.3203 5.36612 15.6369C4.6827 14.9535 4.6827 13.8455 5.36612 13.1621L12.9675 5.56066" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>` },
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
const projectsIcon = `<svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M41 41V2M2 41V2M15 12.8333V30.1667C15 32.1857 15 33.1953 15.3299 33.9916C15.7697 35.0534 16.6133 35.897 17.675 36.3368C18.4714 36.6667 19.4809 36.6667 21.5 36.6667C23.5191 36.6667 24.5286 36.6667 25.325 36.3368C26.3868 35.897 27.2303 35.0534 27.6701 33.9916C28 33.1953 28 32.1857 28 30.1667V12.8333C28 10.8143 28 9.80472 27.6701 9.00837C27.2303 7.94659 26.3868 7.103 25.325 6.66319C24.5286 6.33334 23.5191 6.33334 21.5 6.33334C19.4809 6.33333 18.4714 6.33333 17.675 6.66319C16.6133 7.103 15.7697 7.94658 15.3299 9.00837C15 9.80471 15 10.8143 15 12.8333Z" stroke="#2E90FA" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
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

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.14662 14.1201C1.18491 13.7755 1.20405 13.6032 1.25618 13.4422C1.30243 13.2993 1.36778 13.1633 1.45045 13.038C1.54363 12.8967 1.66621 12.7741 1.91136 12.5289L12.9166 1.5237C13.8371 0.603225 15.3295 0.603226 16.2499 1.5237C17.1704 2.44417 17.1704 3.93656 16.2499 4.85703L5.24469 15.8623C4.99954 16.1074 4.87696 16.23 4.73566 16.3232C4.61029 16.4058 4.47433 16.4712 4.33146 16.5174C4.17042 16.5696 3.99813 16.5887 3.65356 16.627L0.833252 16.9404L1.14662 14.1201Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const viewIcon = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.66699 7.00033C1.66699 7.00033 4.16699 1.16699 10.0003 1.16699C15.8337 1.16699 18.3337 7.00033 18.3337 7.00033C18.3337 7.00033 15.8337 12.8337 10.0003 12.8337C4.16699 12.8337 1.66699 7.00033 1.66699 7.00033Z" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.0003 9.50033C11.381 9.50033 12.5003 8.38104 12.5003 7.00033C12.5003 5.61961 11.381 4.50033 10.0003 4.50033C8.61961 4.50033 7.50033 5.61961 7.50033 7.00033C7.50033 8.38104 8.61961 9.50033 10.0003 9.50033Z" stroke="#667085" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const fileIcon = `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6667 1.5V6.5C11.6667 6.96667 11.6667 7.2 11.7575 7.37833C11.8374 7.53513 11.9649 7.66261 12.1217 7.7425C12.3 7.83333 12.5333 7.83333 13 7.83333H18M11.6667 17.3333H5M15 13.6667H5M18.3333 9.32386V17.5C18.3333 18.9001 18.3333 19.6002 18.0608 20.135C17.8212 20.6054 17.4387 20.9878 16.9683 21.2275C16.4335 21.5 15.7335 21.5 14.3333 21.5H5.66667C4.26654 21.5 3.56647 21.5 3.03169 21.2275C2.56129 20.9878 2.17883 20.6054 1.93915 20.135C1.66667 19.6002 1.66667 18.9001 1.66667 17.5V5.83333C1.66667 4.4332 1.66667 3.73314 1.93915 3.19836C2.17883 2.72795 2.56129 2.3455 3.03169 2.10582C3.56647 1.83333 4.26654 1.83333 5.66667 1.83333H10.1762C10.7868 1.83333 11.0921 1.83333 11.3797 1.90267C11.6346 1.96414 11.8779 2.06622 12.1 2.20519C12.3517 2.36252 12.5668 2.57761 12.9969 3.00778L17.4921 7.50289C17.9223 7.93306 18.1374 8.14815 18.2947 8.39989C18.4337 8.62199 18.5358 8.86531 18.5973 9.12019C18.6667 9.40783 18.6667 9.71314 18.6667 10.3238V9.32386Z" stroke="#1570EF" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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

const locationIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 9.33333C16 13.0152 13.0152 16 9.33333 16M16 9.33333C16 5.65144 13.0152 2.66667 9.33333 2.66667M16 9.33333H17.6667M9.33333 16C5.65144 16 2.66667 13.0152 2.66667 9.33333M9.33333 16V17.6667M2.66667 9.33333C2.66667 5.65144 5.65144 2.66667 9.33333 2.66667M2.66667 9.33333H1M9.33333 2.66667V1M11.8333 9.33333C11.8333 10.714 10.714 11.8333 9.33333 11.8333C7.95262 11.8333 6.83333 10.714 6.83333 9.33333C6.83333 7.95262 7.95262 6.83333 9.33333 6.83333C10.714 6.83333 11.8333 7.95262 11.8333 9.33333Z" stroke="#9AA4B2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
</script>

<template>
  <default-layout>
    <div class="project-form-page">
      <!-- Header -->
      <PageHeader :icon="projectsIcon" title-key="pages.projects.title"
        description-key="pages.projects.formDescription" />

      <!-- Tabs -->
      <div class="flex gap-2 overflow-y-auto py-4 px-6 border-y border-gray-200 -mx-6 mb-4">
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
        <!-- Tab 1: معلومات المشروع -->
        <v-tabs-window-item :value="0">
          <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
            <!-- Project Data Section -->
            <div class="mb-6 bg-gray-50 rounded-lg p-6">
              <h2 class="text-lg font-bold text-primary-900 mb-4">بيانات المشروع</h2>

              <!-- Row 1: Customer Type, License Issue Date, Customer Name -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <SelectInput v-model="customerType" label="نوع العميل" placeholder="نوع العميل"
                  :items="customerTypeItems" :hide-details="false" />
                <DatePickerInput v-model="licenseIssueDate" label="تاريخ اصدار الرخصة" placeholder="اختر التاريخ"
                  :hide-details="false">
                  <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip" >
                      <template #activator="{ props: tooltipProps }">
                        <ButtonWithIcon variant="text" size="small" density="compact"
                          custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                      </template>
                      <div>
                        تاريخ إصدار الرخصة الرسمي للمشروع
                      </div>
                    </v-tooltip>
                  </template>
                </DatePickerInput>
                <SelectInput v-model="customerName" label="اسم العميل" placeholder="اسم العميل"
                  :items="customerNameItems" :hide-details="false" />
                <div class="md:col-span-2">
                  <LanguageTabs :languages="availableLanguages" label="اسم المشروع">
                    <template #en>
                      <TextInput v-model="projectNameEnglish" placeholder="Enter project name in English"
                        :rules="[required()]" :hide-details="true" />
                    </template>
                    <template #ar>
                      <TextInput v-model="projectNameArabic" placeholder="ادخل اسم المشروع بالعربية"
                        :rules="[required()]" :hide-details="true" />
                    </template>
                  </LanguageTabs>
                </div>
                <DatePickerInput v-model="startDate" label="تاريخ البدء" placeholder="اختر التاريخ"
                  :hide-details="false">
                  <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                      <template #activator="{ props: tooltipProps }">
                        <ButtonWithIcon variant="text" size="small" density="compact"
                          custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                      </template>
                      <div>
                        تاريخ بدء المشروع الفعلي
                      </div>
                    </v-tooltip>
                  </template>
                </DatePickerInput>
                <DatePickerInput v-model="endDate" label="تاريخ الانتهاء" placeholder="اختر التاريخ"
                  :hide-details="false">
                  <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                      <template #activator="{ props: tooltipProps }">
                        <ButtonWithIcon variant="text" size="small" density="compact"
                          custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                      </template>
                      <div>
                        تاريخ انتهاء المشروع المتوقع
                      </div>
                    </v-tooltip>
                  </template>
                </DatePickerInput>
                <div class="md:col-span-2">
                  <LanguageTabs :languages="availableLanguages" label="العنوان">
                    <template #en>
                      <TextInput v-model="addressEnglish" placeholder="Enter address in English" :hide-details="true">
                        <template #append-inner>
                          <v-tooltip location="top" content-class="custom-tooltip">
                            <template #activator="{ props: tooltipProps }">
                              <ButtonWithIcon variant="text" size="small" density="compact"
                                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                            </template>
                            <div>
                              العنوان الكامل للمشروع باللغة الإنجليزية
                            </div>
                          </v-tooltip>
                        </template>
                      </TextInput>
                    </template>
                    <template #ar>
                      <TextInput v-model="addressArabic" placeholder="ادخل العنوان بالعربية" :hide-details="true">
                        <template #append-inner>
                          <v-tooltip location="top" content-class="custom-tooltip">
                            <template #activator="{ props: tooltipProps }">
                              <ButtonWithIcon variant="text" size="small" density="compact"
                                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                            </template>
                            <div>
                              العنوان الكامل للمشروع باللغة العربية
                            </div>
                          </v-tooltip>
                        </template>
                      </TextInput>
                    </template>
                  </LanguageTabs>
                </div>


                <TextInput v-model="commercialRegister" label="السجل التجاري" placeholder="ادخل الرقم"
                  :hide-details="false">
                  <template #append-inner>
                    <v-tooltip location="top" content-class="custom-tooltip">
                      <template #activator="{ props: tooltipProps }">
                        <ButtonWithIcon variant="text" size="small" density="compact"
                          custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                      </template>
                      <div>
                        رقم السجل التجاري الرسمي للمشروع
                      </div>
                    </v-tooltip>
                  </template>
                </TextInput>
                <div class="md:col-span-2 md:row-span-2">

                  <LanguageTabs :languages="availableLanguages" label="الوصف">
                    <template #en>
                      <TextareaInput v-model="descriptionEnglish" placeholder="Enter description in English"
                        min-height="120px" hide-details />
                    </template>
                    <template #ar>
                      <TextareaInput v-model="descriptionArabic" placeholder="ادخل الوصف بالعربية" min-height="120px"
                        hide-details />
                    </template>
                  </LanguageTabs>
                </div>
                <TextInput v-model="geoLocation" label="الموقع الجغرافي" placeholder="حدد الموقع" :hide-details="false">
                  <template #append-inner>
                    <span v-html="locationIcon"></span>
                  </template>
                </TextInput>
              </div>
            </div>
          </v-form>
        </v-tabs-window-item>

        <!-- Tab 2: جهة اتصال المشروع -->
        <v-tabs-window-item :value="1">
          <div class="mb-6">
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
                    <v-switch v-model="contact.showInPrice" inset color="primary" hide-details density="compact" />
                  </td>
                  <td class="py-3 px-4">
                    <v-switch v-model="contact.showInReports" inset color="primary" hide-details density="compact" />
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <ButtonWithIcon :icon="editIcon" icon-only size="small" variant="text" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-tabs-window-item>

        <!-- Tab 3: مرفقات المشروع -->
        <v-tabs-window-item :value="2">
          <div class="mb-6">
            <!-- Add Attachment Button -->
            <div class="flex justify-end mb-4">
              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                custom-class="px-5 font-semibold text-base !text-primary-800 border !border-primary-200"
                :prepend-icon="plusIcon" label="أضف مرفق" @click="addAttachment" />
            </div>

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
                    <div
                      class="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 max-w-xs">
                      <span v-html="fileIcon"></span>
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-900">{{ attachment.file.name }}</span>
                        <span class="text-xs text-gray-500">{{ attachment.file.size }} – {{ attachment.file.progress }}%
                          uploaded</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <ButtonWithIcon size="small" variant="text" :icon="viewIcon" icon-only @click="viewAttachment(attachment)" />
                      <ButtonWithIcon size="small" variant="text" :icon="editIcon" icon-only />
                      <ButtonWithIcon size="small" variant="text" :icon="trashIcon" icon-only @click="deleteAttachment(attachment.id)" />

                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48"
          custom-class="min-w-56" :prepend-icon="saveIcon" label="حفظ" @click="handleSave" />
        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
          custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق" @click="handleClose" />
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
