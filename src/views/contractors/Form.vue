<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import BasicInfoTab from "./components/BasicInfoTab.vue";
import FinancialInfoTab from "./components/FinancialInfoTab.vue";
import CommercialInfoTab from "./components/CommercialInfoTab.vue";
import OperationalInfoTab from "./components/OperationalInfoTab.vue";
import DocumentsTab from "./components/DocumentsTab.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const contractorsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" fill-rule="evenodd" clip-rule="evenodd" d="M40.3519 33.8018C40.236 33.1628 40.3142 32.5038 40.5764 31.9097C40.8261 31.3272 41.2407 30.8303 41.7691 30.4803C42.2976 30.1304 42.9168 29.9426 43.5506 29.94H43.7279C44.7727 29.94 45.7747 29.525 46.5135 28.7862C47.2523 28.0474 47.6673 27.0454 47.6673 26.0006C47.6673 24.9559 47.2523 23.9539 46.5135 23.2151C45.7747 22.4763 44.7727 22.0613 43.7279 22.0613H43.3931C42.7593 22.0587 42.14 21.8709 41.6116 21.521C41.0831 21.171 40.6685 20.6741 40.4188 20.0916V19.934C40.1566 19.3399 40.0784 18.6809 40.1943 18.0419C40.3101 17.403 40.6147 16.8134 41.0688 16.3491L41.187 16.231C41.5533 15.8651 41.8438 15.4306 42.0421 14.9524C42.2403 14.4742 42.3424 13.9615 42.3424 13.4438C42.3424 12.9261 42.2403 12.4135 42.0421 11.9353C41.8438 11.457 41.5533 11.0226 41.187 10.6567C40.8211 10.2904 40.3867 9.99987 39.9084 9.80163C39.4302 9.60338 38.9176 9.50134 38.3999 9.50134C37.8822 9.50134 37.3696 9.60338 36.8913 9.80163C36.4131 9.99987 35.9786 10.2904 35.6128 10.6567L35.4946 10.7749C35.0304 11.229 34.4408 11.5336 33.8018 11.6494C33.1628 11.7653 32.5038 11.6871 31.9097 11.4249C31.3272 11.1752 30.8303 10.7606 30.4803 10.2322C30.1304 9.70372 29.9426 9.08447 29.94 8.45065V8.27338C29.94 7.22859 29.525 6.22659 28.7862 5.48781C28.0474 4.74903 27.0454 4.33398 26.0006 4.33398C24.9559 4.33398 23.9539 4.74903 23.2151 5.48781C22.4763 6.22659 22.0613 7.22859 22.0613 8.27338V8.60823C22.0587 9.24205 21.8709 9.8613 21.521 10.3897C21.171 10.9182 20.6741 11.3328 20.0916 11.5825H19.934C19.3399 11.8447 18.6809 11.9229 18.0419 11.807C17.403 11.6912 16.8134 11.3866 16.3491 10.9325L16.231 10.8143C15.8651 10.448 15.4306 10.1575 14.9524 9.9592C14.4742 9.76096 13.9615 9.65892 13.4438 9.65892C12.9261 9.65892 12.4135 9.76096 11.9353 9.9592C11.457 10.1575 11.0226 10.448 10.6567 10.8143C10.2904 11.1802 9.99987 11.6146 9.80163 12.0929C9.60338 12.5711 9.50134 13.0837 9.50134 13.6014C9.50134 14.1191 9.60338 14.6317 9.80163 15.11C9.99987 15.5882 10.2904 16.0227 10.6567 16.3885L10.7749 16.5067C11.229 16.9709 11.5336 17.5605 11.6494 18.1995C11.7653 18.8385 11.6871 19.4975 11.4249 20.0916C11.1998 20.7036 10.7958 21.2338 10.2653 21.6132C9.7349 21.9926 9.10261 22.2036 8.45065 22.2188H8.27338C7.22859 22.2188 6.22659 22.6339 5.48781 23.3727C4.74903 24.1114 4.33398 25.1134 4.33398 26.1582C4.33398 27.203 4.74903 28.205 5.48781 28.9438C6.22659 29.6826 7.22859 30.0976 8.27338 30.0976H8.60823C9.24205 30.1001 9.8613 30.288 10.3897 30.6379C10.9182 30.9879 11.3328 31.4847 11.5825 32.0673C11.8447 32.6614 11.9229 33.3204 11.807 33.9594C11.6912 34.5983 11.3866 35.1879 10.9325 35.6522L10.8143 35.7703C10.448 36.1362 10.1575 36.5707 9.9592 37.0489C9.76096 37.5271 9.65892 38.0398 9.65892 38.5575C9.65892 39.0752 9.76096 39.5878 9.9592 40.066C10.1575 40.5443 10.448 40.9787 10.8143 41.3446C11.1802 41.7109 11.6146 42.0014 12.0929 42.1997C12.5711 42.3979 13.0837 42.5 13.6014 42.5C14.1191 42.5 14.6317 42.3979 15.11 42.1997C15.5882 42.0014 16.0227 41.7109 16.3885 41.3446L16.5067 41.2264C16.9709 40.7723 17.5605 40.4677 18.1995 40.3519C18.8385 40.236 19.4975 40.3142 20.0916 40.5764C20.7036 40.8015 21.2338 41.2055 21.6132 41.736C21.9926 42.2664 22.2036 42.8987 22.2188 43.5506V43.7279C22.2188 44.7727 22.6339 45.7747 23.3727 46.5135C24.1114 47.2523 25.1134 47.6673 26.1582 47.6673C27.203 47.6673 28.205 47.2523 28.9438 46.5135C29.6826 45.7747 30.0976 44.7727 30.0976 43.7279V43.3931C30.1001 42.7593 30.288 42.14 30.6379 41.6116C30.9879 41.0831 31.4847 40.6685 32.0673 40.4188C32.6614 40.1566 33.3204 40.0784 33.9594 40.1943C34.5983 40.3101 35.1879 40.6147 35.6522 41.0688L35.7703 41.187C36.1362 41.5533 36.5707 41.8438 37.0489 42.0421C37.5271 42.2403 38.0398 42.3424 38.5575 42.3424C39.0752 42.3424 39.5878 42.2403 40.066 42.0421C40.5443 41.8438 40.9787 41.5533 41.3446 41.187C41.7109 40.8211 42.0014 40.3867 42.1997 39.9084C42.3979 39.4302 42.5 38.9176 42.5 38.3999C42.5 37.8822 42.3979 37.3696 42.1997 36.8913C42.0014 36.4131 41.7109 35.9786 41.3446 35.6128L41.2264 35.4946C40.7723 35.0304 40.4677 34.4408 40.3519 33.8018ZM32.5006 26.0006C32.5006 29.5905 29.5905 32.5006 26.0006 32.5006C22.4108 32.5006 19.5006 29.5905 19.5006 26.0006C19.5006 22.4108 22.4108 19.5006 26.0006 19.5006C29.5905 19.5006 32.5006 22.4108 32.5006 26.0006Z" fill="#1570EF"/>
<path d="M26.0006 32.5006C29.5905 32.5006 32.5006 29.5905 32.5006 26.0006C32.5006 22.4108 29.5905 19.5006 26.0006 19.5006C22.4108 19.5006 19.5006 22.4108 19.5006 26.0006C19.5006 29.5905 22.4108 32.5006 26.0006 32.5006Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M40.5764 31.9097C40.3142 32.5038 40.236 33.1628 40.3519 33.8018C40.4677 34.4408 40.7723 35.0304 41.2264 35.4946L41.3446 35.6128C41.7109 35.9786 42.0014 36.4131 42.1997 36.8913C42.3979 37.3696 42.5 37.8822 42.5 38.3999C42.5 38.9176 42.3979 39.4302 42.1997 39.9084C42.0014 40.3867 41.7109 40.8211 41.3446 41.187C40.9787 41.5533 40.5443 41.8438 40.066 42.0421C39.5878 42.2403 39.0752 42.3424 38.5575 42.3424C38.0398 42.3424 37.5272 42.2403 37.0489 42.0421C36.5707 41.8438 36.1362 41.5533 35.7703 41.187L35.6522 41.0688C35.1879 40.6147 34.5983 40.3101 33.9594 40.1943C33.3204 40.0784 32.6614 40.1566 32.0673 40.4188C31.4847 40.6685 30.9879 41.0831 30.6379 41.6116C30.288 42.14 30.1001 42.7593 30.0976 43.3931V43.7279C30.0976 44.7727 29.6826 45.7747 28.9438 46.5135C28.205 47.2523 27.203 47.6673 26.1582 47.6673C25.1134 47.6673 24.1114 47.2523 23.3727 46.5135C22.6339 45.7747 22.2188 44.7727 22.2188 43.7279V43.5506C22.2036 42.8987 21.9926 42.2664 21.6132 41.736C21.2338 41.2055 20.7036 40.8015 20.0916 40.5764C19.4975 40.3142 18.8385 40.236 18.1995 40.3519C17.5605 40.4677 16.9709 40.7723 16.5067 41.2264L16.3885 41.3446C16.0227 41.7109 15.5882 42.0014 15.11 42.1997C14.6317 42.3979 14.1191 42.5 13.6014 42.5C13.0837 42.5 12.5711 42.3979 12.0929 42.1997C11.6146 42.0014 11.1802 41.7109 10.8143 41.3446C10.448 40.9787 10.1575 40.5443 9.9592 40.066C9.76096 39.5878 9.65892 39.0752 9.65892 38.5575C9.65892 38.0398 9.76096 37.5272 9.9592 37.0489C10.1575 36.5707 10.448 36.1362 10.8143 35.7703L10.9325 35.6522C11.3866 35.1879 11.6912 34.5983 11.807 33.9594C11.9229 33.3204 11.8447 32.6614 11.5825 32.0673C11.3328 31.4847 10.9182 30.9879 10.3897 30.6379C9.8613 30.288 9.24205 30.1001 8.60823 30.0976H8.27338C7.22859 30.0976 6.22659 29.6826 5.48781 28.9438C4.74903 28.205 4.33398 27.203 4.33398 26.1582C4.33398 25.1134 4.74903 24.1114 5.48781 23.3727C6.22659 22.6339 7.22859 22.2188 8.27338 22.2188H8.45065C9.10261 22.2036 9.7349 21.9926 10.2653 21.6132C10.7958 21.2338 11.1998 20.7036 11.4249 20.0916C11.6871 19.4975 11.7653 18.8385 11.6494 18.1995C11.5336 17.5605 11.229 16.9709 10.7749 16.5067L10.6567 16.3885C10.2904 16.0227 9.99987 15.5882 9.80163 15.11C9.60338 14.6317 9.50134 14.1191 9.50134 13.6014C9.50134 13.0837 9.60338 12.5711 9.80163 12.0929C9.99987 11.6146 10.2904 11.1802 10.6567 10.8143C11.0226 10.448 11.457 10.1575 11.9353 9.9592C12.4135 9.76096 12.9261 9.65892 13.4438 9.65892C13.9615 9.65892 14.4742 9.76096 14.9524 9.9592C15.4306 10.1575 15.8651 10.448 16.231 10.8143L16.3491 10.9325C16.8134 11.3866 17.403 11.6912 18.0419 11.807C18.6809 11.9229 19.3399 11.8447 19.934 11.5825H20.0916C20.6741 11.3328 21.171 10.9182 21.521 10.3897C21.8709 9.8613 22.0587 9.24205 22.0613 8.60823V8.27338C22.0613 7.22859 22.4763 6.22659 23.2151 5.48781C23.9539 4.74903 24.9559 4.33398 26.0006 4.33398C27.0454 4.33398 28.0474 4.74903 28.7862 5.48781C29.525 6.22659 29.94 7.22859 29.94 8.27338V8.45065C29.9426 9.08447 30.1304 9.70372 30.4803 10.2322C30.8303 10.7606 31.3272 11.1752 31.9097 11.4249C32.5038 11.6871 33.1628 11.7653 33.8018 11.6494C34.4408 11.5336 35.0304 11.229 35.4946 10.7749L35.6128 10.6567C35.9786 10.2904 36.4131 9.99987 36.8913 9.80163C37.3696 9.60338 37.8822 9.50134 38.3999 9.50134C38.9176 9.50134 39.4302 9.60338 39.9084 9.80163C40.3867 9.99987 40.8211 10.2904 41.187 10.6567C41.5533 11.0226 41.8438 11.457 42.0421 11.9353C42.2403 12.4135 42.3424 12.9261 42.3424 13.4438C42.3424 13.9615 42.2403 14.4742 42.0421 14.9524C41.8438 15.4306 41.5533 15.8651 41.187 16.231L41.0688 16.3491C40.6147 16.8134 40.3101 17.403 40.1943 18.0419C40.0784 18.6809 40.1566 19.3399 40.4188 19.934V20.0916C40.6685 20.6741 41.0831 21.171 41.6116 21.521C42.14 21.8709 42.7593 22.0587 43.3931 22.0613H43.7279C44.7727 22.0613 45.7747 22.4763 46.5135 23.2151C47.2523 23.9539 47.6673 24.9559 47.6673 26.0006C47.6673 27.0454 47.2523 28.0474 46.5135 28.7862C45.7747 29.525 44.7727 29.94 43.7279 29.94H43.5506C42.9168 29.9426 42.2976 30.1304 41.7691 30.4803C41.2407 30.8303 40.8261 31.3272 40.5764 31.9097Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const checkCircleIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_12506_1251)">
<path d="M16.5 8.34375V9C16.4991 10.5993 15.9754 12.1574 15.007 13.4429C14.0386 14.7284 12.6775 15.6733 11.1265 16.1377C9.57557 16.6021 7.91794 16.5614 6.39209 16.0216C4.86624 15.4817 3.55402 14.4709 2.64836 13.1352C1.7427 11.7994 1.29008 10.2083 1.35681 8.61019C1.42354 7.01205 2.00608 5.46414 3.01878 4.20164C4.03148 2.93913 5.42182 2.02527 6.98338 1.59033C8.54495 1.15539 10.2003 1.21851 11.7263 1.77188M16.5 2.25L9 9.7575L6.75 7.5075" stroke="#039855" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_12506_1251">
<rect width="18" height="18" fill="white"/>
</clipPath>
</defs>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const isEditing = computed(() => route.params.id !== 'new');
const pageTitle = computed(() => isEditing.value ? "تعديل المقاول" : "إضافة مقاول");
const contractorId = ref<number | null>(null);

const formRef = ref<any>(null);
const isFormValid = ref(false);

const activeTab = ref(0);
const tabs = [
  { title: "البيانات الاساسية", value: 0 },
  { title: "البيانات المالية", value: 1 },
  { title: "البيانات التجارية", value: 2 },
  { title: "المعلومات التشغيلية", value: 3 },
];

const isTabActive = (value: number) => activeTab.value === value;

const handleTabChange = (newTab: number, event?: Event) => {
  activeTab.value = newTab;
};


const fullNameTranslations = ref({ ar: "", en: "" });
const tradeNameTranslations = ref({ ar: "", en: "" });
const commercialRegister = ref("");
const taxRegister = ref("");
const entityType = ref<string | null>(null);
const isActive = ref(true);
const crIssueDate = ref("");
const crExpiryDate = ref("");
const languageId = ref<number | null>(null);
const phone = ref("");
const email = ref("");
const mobile = ref("");
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

const contractorClassification = ref<string | null>(null);
const classificationGrade = ref<string | null>(null);
const scopeOfWork = ref<string | null>(null);
const municipalLicenseNumber = ref("");
const municipalLicenseExpiry = ref("");
const municipalLicenseStatus = ref<string | null>(null);
const safetyCertification = ref<string | null>(null);
const environmentalCertification = ref<string | null>(null);
const civilDefenseApproval = ref<boolean>(false);

const ongoingProjects = ref<number | null>(null);
const completedProjects = ref<number | null>(null);
const employeesCount = ref<number | null>(null);
const engineersCount = ref<number | null>(null);
const techniciansCount = ref<number | null>(null);
const operationalCapacity = ref<string | null>(null);
const specialization = ref<string | null>(null);
const siteReadiness = ref<string | null>(null);
const safetyManagementSystem = ref<boolean>(false);
const environmentalCompliance = ref<boolean>(false);

const documents = ref<any[]>([]);
const documentName = ref("");
const documentType = ref<string | null>(null);
const documentFile = ref<File[] | null>(null);

const constants = ref<any>({});
const banks = ref<Array<{ id: number; name: string }>>([]);
const languages = ref<Array<{ id: number; name: string }>>([]);
const countries = ref<Array<{ id: number; name: string }>>([]);
const cities = ref<Array<{ id: number; name: string }>>([]);

const entityTypeItems = computed(() =>
  constants.value.entity_type?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const contractorClassificationItems = computed(() =>
  constants.value.contractor_classification?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const classificationGradeItems = computed(() =>
  constants.value.classification_grade?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const scopeOfWorkItems = computed(() =>
  constants.value.scope_of_work?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const municipalLicenseStatusItems = computed(() =>
  constants.value.municipal_license_status?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const safetyCertificationItems = computed(() =>
  constants.value.safety_certification?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const environmentalCertificationItems = computed(() =>
  constants.value.environmental_certification?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const operationalCapacityItems = computed(() =>
  constants.value.operational_capacity?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const specializationItems = computed(() =>
  constants.value.specialization?.map((item: any) => ({ title: item.label, value: item.key })) || []
);
const siteReadinessItems = computed(() =>
  constants.value.site_readiness?.map((item: any) => ({ title: item.label, value: item.key })) || []
);

const bankItems = computed(() =>
  banks.value.map(bank => ({ title: bank.name, value: bank.id }))
);
const languageItems = computed(() =>
  languages.value.map(lang => ({ title: lang.name, value: lang.id }))
);
const countryItems = computed(() =>
  countries.value.map(country => ({ title: country.name, value: country.id }))
);
const cityItems = computed(() =>
  cities.value.map(city => ({ title: city.name, value: city.id }))
);

const saving = ref(false);

const handleSave = async () => {
  try {
    saving.value = true;

    const step = activeTab.value + 1;
    const payload: any = { step };

    if (step === 1) {
      payload.full_name = {
        ar: fullNameTranslations.value.ar,
        en: fullNameTranslations.value.en
      };
      payload.trade_name = {
        ar: tradeNameTranslations.value.ar,
        en: tradeNameTranslations.value.en
      };
      if (commercialRegister.value) payload.commercial_register = commercialRegister.value;
      if (taxRegister.value) payload.tax_register = taxRegister.value;
      if (entityType.value) payload.entity_type = entityType.value;
      payload.is_active = isActive.value;
      if (crIssueDate.value) payload.cr_issue_date = crIssueDate.value;
      if (crExpiryDate.value) payload.cr_expiry_date = crExpiryDate.value;
      if (languageId.value) payload.language_id = languageId.value;
      if (phone.value) payload.phone = phone.value;
      if (email.value) payload.email = email.value;
      if (mobile.value) payload.mobile = mobile.value;
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
        error('يجب حفظ البيانات الأساسية أولاً');
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

    if (step === 3) {
      if (!isEditing.value) {
        error('يجب حفظ البيانات الأساسية أولاً');
        saving.value = false;
        return;
      }
      if (contractorClassification.value) payload.contractor_classification = contractorClassification.value;
      if (classificationGrade.value) payload.classification_grade = classificationGrade.value;
      if (scopeOfWork.value) payload.scope_of_work = scopeOfWork.value;
      if (municipalLicenseNumber.value) payload.municipal_license_number = municipalLicenseNumber.value;
      if (municipalLicenseExpiry.value) payload.municipal_license_expiry = municipalLicenseExpiry.value;
      if (municipalLicenseStatus.value) payload.municipal_license_status = municipalLicenseStatus.value;
      if (safetyCertification.value) payload.safety_certification = safetyCertification.value;
      if (environmentalCertification.value) payload.environmental_certification = environmentalCertification.value;
      payload.civil_defense_approval = civilDefenseApproval.value;
    }

    if (step === 4) {
      if (!isEditing.value) {
        error('يجب حفظ البيانات الأساسية أولاً');
        saving.value = false;
        return;
      }
      if (ongoingProjects.value) payload.ongoing_projects = ongoingProjects.value;
      if (completedProjects.value) payload.completed_projects = completedProjects.value;
      if (employeesCount.value) payload.employees_count = employeesCount.value;
      if (engineersCount.value) payload.engineers_count = engineersCount.value;
      if (techniciansCount.value) payload.technicians_count = techniciansCount.value;
      if (operationalCapacity.value) payload.operational_capacity = operationalCapacity.value;
      if (specialization.value) payload.specialization = specialization.value;
      if (siteReadiness.value) payload.site_readiness = siteReadiness.value;
      payload.safety_management_system = safetyManagementSystem.value;
      payload.environmental_compliance = environmentalCompliance.value;
    }

    if (step === 1) {
      if (isEditing.value) {
        await api.put(`/admin/api/contractors/${route.params.id}`, payload);
        success('تم حفظ البيانات الأساسية بنجاح');
      } else {
        const response = await api.post('/admin/api/contractors', payload);
        success('تم حفظ البيانات الأساسية بنجاح');
        if (response.data?.id) {
          contractorId.value = response.data.id;
          router.replace({ name: 'ContractorsEdit', params: { id: response.data.id } });
        }
      }
    } else if (step === 2) {
      await api.put(`/admin/api/contractors/${route.params.id}`, payload);
      success('تم حفظ البيانات المالية بنجاح');
    } else if (step === 3) {
      await api.put(`/admin/api/contractors/${route.params.id}`, payload);
      success('تم حفظ البيانات التجارية بنجاح');
    } else if (step === 4) {
      await api.put(`/admin/api/contractors/${route.params.id}`, payload);
      success('تم حفظ المعلومات التشغيلية بنجاح');
    }
  } catch (err: any) {
    console.error('Error saving contractor:', err);
    if (err?.response?.data?.errors) {
      const errors = err.response.data.errors;
      Object.keys(errors).forEach(key => {
        errors[key].forEach((msg: string) => error(msg));
      });
    } else {
      error(err?.response?.data?.message || 'فشل حفظ المقاول');
    }
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push({ name: 'ContractorsList' });
};

const handleBasicInfoUpdate = (data: any) => {
  if (data.fullNameTranslations !== undefined) fullNameTranslations.value = data.fullNameTranslations;
  if (data.tradeNameTranslations !== undefined) tradeNameTranslations.value = data.tradeNameTranslations;
  if (data.commercialRegister !== undefined) commercialRegister.value = data.commercialRegister;
  if (data.taxRegister !== undefined) taxRegister.value = data.taxRegister;
  if (data.entityType !== undefined) entityType.value = data.entityType;
  if (data.isActive !== undefined) isActive.value = data.isActive;
  if (data.crIssueDate !== undefined) crIssueDate.value = data.crIssueDate;
  if (data.crExpiryDate !== undefined) crExpiryDate.value = data.crExpiryDate;
  if (data.languageId !== undefined) languageId.value = data.languageId;
  if (data.phone !== undefined) phone.value = data.phone;
  if (data.email !== undefined) email.value = data.email;
  if (data.mobile !== undefined) mobile.value = data.mobile;
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

const handleCommercialInfoUpdate = (data: any) => {
  if (data.contractorClassification !== undefined) contractorClassification.value = data.contractorClassification;
  if (data.classificationGrade !== undefined) classificationGrade.value = data.classificationGrade;
  if (data.scopeOfWork !== undefined) scopeOfWork.value = data.scopeOfWork;
  if (data.municipalLicenseNumber !== undefined) municipalLicenseNumber.value = data.municipalLicenseNumber;
  if (data.municipalLicenseExpiry !== undefined) municipalLicenseExpiry.value = data.municipalLicenseExpiry;
  if (data.municipalLicenseStatus !== undefined) municipalLicenseStatus.value = data.municipalLicenseStatus;
  if (data.safetyCertification !== undefined) safetyCertification.value = data.safetyCertification;
  if (data.environmentalCertification !== undefined) environmentalCertification.value = data.environmentalCertification;
  if (data.civilDefenseApproval !== undefined) civilDefenseApproval.value = data.civilDefenseApproval;
};

const handleOperationalInfoUpdate = (data: any) => {
  if (data.ongoingProjects !== undefined) ongoingProjects.value = data.ongoingProjects;
  if (data.completedProjects !== undefined) completedProjects.value = data.completedProjects;
  if (data.employeesCount !== undefined) employeesCount.value = data.employeesCount;
  if (data.engineersCount !== undefined) engineersCount.value = data.engineersCount;
  if (data.techniciansCount !== undefined) techniciansCount.value = data.techniciansCount;
  if (data.operationalCapacity !== undefined) operationalCapacity.value = data.operationalCapacity;
  if (data.specialization !== undefined) specialization.value = data.specialization;
  if (data.siteReadiness !== undefined) siteReadiness.value = data.siteReadiness;
  if (data.safetyManagementSystem !== undefined) safetyManagementSystem.value = data.safetyManagementSystem;
  if (data.environmentalCompliance !== undefined) environmentalCompliance.value = data.environmentalCompliance;
};

const handleDocumentsUpdate = (data: any) => {
  if (data.documents !== undefined) documents.value = data.documents;
};

const fetchConstants = async () => {
  try {
    const response = await api.get('/admin/api/contractors/constants');
    constants.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching constants:', err);
  }
};

const fetchBanks = async () => {
  try {
    const response = await api.get('/admin/api/banks/list');
    banks.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching banks:', err);
  }
};

const fetchLanguages = async () => {
  try {
    const response = await api.get('/admin/api/languages/list');
    languages.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching languages:', err);
  }
};

const fetchCountries = async () => {
  try {
    const response = await api.get('/admin/api/countries/list');
    countries.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching countries:', err);
  }
};

const fetchCities = async () => {
  try {
    const response = await api.get('/admin/api/cities/list');
    cities.value = response.data.data;
  } catch (err: any) {
    console.error('Error fetching cities:', err);
  }
};

const fetchContractorData = async () => {
  if (!isEditing.value) return;

  try {
    const response = await api.get(`/admin/api/contractors/${route.params.id}`);
    const data = response.data.data;

    contractorId.value = data.id;
    fullNameTranslations.value = data.full_name_translations || { ar: "", en: "" };
    tradeNameTranslations.value = data.trade_name_translations || { ar: "", en: "" };
    commercialRegister.value = data.commercial_register || "";
    taxRegister.value = data.tax_register || "";
    entityType.value = data.entity_type;
    isActive.value = data.is_active;
    crIssueDate.value = data.cr_issue_date || "";
    crExpiryDate.value = data.cr_expiry_date || "";
    languageId.value = data.language_id;
    phone.value = data.phone || "";
    email.value = data.email || "";
    mobile.value = data.mobile || "";
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

    contractorClassification.value = data.contractor_classification;
    classificationGrade.value = data.classification_grade;
    scopeOfWork.value = data.scope_of_work;
    municipalLicenseNumber.value = data.municipal_license_number || "";
    municipalLicenseExpiry.value = data.municipal_license_expiry || "";
    municipalLicenseStatus.value = data.municipal_license_status;
    safetyCertification.value = data.safety_certification;
    environmentalCertification.value = data.environmental_certification;
    civilDefenseApproval.value = data.civil_defense_approval || false;

    ongoingProjects.value = data.ongoing_projects;
    completedProjects.value = data.completed_projects;
    employeesCount.value = data.employees_count;
    engineersCount.value = data.engineers_count;
    techniciansCount.value = data.technicians_count;
    operationalCapacity.value = data.operational_capacity;
    specialization.value = data.specialization;
    siteReadiness.value = data.site_readiness;
    safetyManagementSystem.value = data.safety_management_system || false;
    environmentalCompliance.value = data.environmental_compliance || false;
  } catch (err: any) {
    console.error('Error fetching contractor:', err);
    error(err?.response?.data?.message || 'فشل تحميل بيانات المقاول');
  }
};

onMounted(async () => {
  await Promise.all([
    fetchConstants(),
    fetchBanks(),
    fetchLanguages(),
    fetchCountries(),
    fetchCities(),
  ]);
  await fetchContractorData();
});

</script>

<template>
  <default-layout>
    <div class="contractor-form-page">
      <PageHeader :icon="contractorsIcon" title-key="pages.contractors.title"
        description-key="pages.contractors.editDescription" />

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
          <BasicInfoTab :fullNameTranslations="fullNameTranslations" :tradeNameTranslations="tradeNameTranslations"
            :commercialRegister="commercialRegister" :taxRegister="taxRegister" :entityType="entityType"
            :isActive="isActive" :crIssueDate="crIssueDate" :crExpiryDate="crExpiryDate" :languageId="languageId"
            :phone="phone" :email="email" :mobile="mobile" :countryId="countryId" :cityId="cityId"
            :neighborhood="neighborhood" :streetName="streetName" :buildingNumber="buildingNumber"
            :postalCode="postalCode" :address1="address1" :entityTypeItems="entityTypeItems"
            :languageItems="languageItems" :countryItems="countryItems" :cityItems="cityItems"
            @update:formData="handleBasicInfoUpdate" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="1">
          <FinancialInfoTab :bankAccounts="bankAccounts" :bankItems="bankItems" :debitLimit="debitLimit"
            :creditLimit="creditLimit" @update:formData="handleFinancialInfoUpdate" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="2">
          <CommercialInfoTab :contractorClassification="contractorClassification"
            :classificationGrade="classificationGrade" :scopeOfWork="scopeOfWork"
            :municipalLicenseNumber="municipalLicenseNumber" :municipalLicenseExpiry="municipalLicenseExpiry"
            :municipalLicenseStatus="municipalLicenseStatus" :safetyCertification="safetyCertification"
            :environmentalCertification="environmentalCertification" :civilDefenseApproval="civilDefenseApproval"
            :contractorClassificationItems="contractorClassificationItems"
            :classificationGradeItems="classificationGradeItems" :scopeOfWorkItems="scopeOfWorkItems"
            :municipalLicenseStatusItems="municipalLicenseStatusItems"
            :safetyCertificationItems="safetyCertificationItems"
            :environmentalCertificationItems="environmentalCertificationItems"
            @update:formData="handleCommercialInfoUpdate" />
        </v-tabs-window-item>

        <v-tabs-window-item :value="3">
          <OperationalInfoTab :ongoingProjects="ongoingProjects" :completedProjects="completedProjects"
            :employeesCount="employeesCount" :engineersCount="engineersCount" :techniciansCount="techniciansCount"
            :operationalCapacity="operationalCapacity" :specialization="specialization" :siteReadiness="siteReadiness"
            :safetyManagementSystem="safetyManagementSystem" :environmentalCompliance="environmentalCompliance"
            :operationalCapacityItems="operationalCapacityItems" :specializationItems="specializationItems"
            :siteReadinessItems="siteReadinessItems" @update:formData="handleOperationalInfoUpdate" />
        </v-tabs-window-item>
      </v-tabs-window>

      <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
        <v-btn variant="flat" color="primary" rounded="4" height="48" class="min-w-56" @click="handleSave">
          <template #prepend>
            <span v-html="saveIcon"></span>
          </template>

          <span>حفظ التعديلات</span>
        </v-btn>
        <v-btn variant="flat" color="primary-50" rounded="4" height="48"
          class="font-semibold text-base text-primary-700 px-6 min-w-56" @click="handleCancel">
          <template #prepend>
            <v-icon>mdi-close</v-icon>
          </template>
          <span>إغلاق</span>
        </v-btn>
      </div>

    </div>
  </default-layout>
</template>

<style scoped>
.custom-tab {
  border-radius: 8px !important;
  text-transform: none;
  font-weight: 500;
}

.custom-tab--active {
  background: #1570EF;
  color: white;
}
</style>
