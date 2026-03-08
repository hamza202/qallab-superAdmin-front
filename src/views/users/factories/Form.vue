<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import BasicInfoTab from "./components/BasicInfoTab.vue";
import FinancialInfoTab, { LogisticBankAccount } from './components/FinancialInfoTab.vue';
import CommercialInfoTab from "./components/CommercialInfoTab.vue";
import OperationalInfoTab from "./components/OperationalInfoTab.vue";
import 'vue3-toastify/dist/index.css';
import DocumentsTab from "./components/DocumentsTab.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();
const { apiError, success } = useNotification();

const logisticsIcon = `<svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.1667 29.6667C26.7565 29.6667 29.6667 26.7565 29.6667 23.1667C29.6667 19.5768 26.7565 16.6667 23.1667 16.6667C19.5768 16.6667 16.6667 19.5768 16.6667 23.1667C16.6667 26.7565 19.5768 29.6667 23.1667 29.6667Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M37.7424 29.0758C37.4802 29.6698 37.402 30.3289 37.5179 30.9678C37.6337 31.6068 37.9383 32.1964 38.3924 32.6606L38.5106 32.7788C38.8769 33.1446 39.1674 33.5791 39.3657 34.0574C39.5639 34.5356 39.666 35.0482 39.666 35.5659C39.666 36.0836 39.5639 36.5962 39.3657 37.0745C39.1674 37.5527 38.8769 37.9872 38.5106 38.353C38.1447 38.7193 37.7103 39.0099 37.232 39.2081C36.7538 39.4064 36.2412 39.5084 35.7235 39.5084C35.2058 39.5084 34.6932 39.4064 34.2149 39.2081C33.7367 39.0099 33.3022 38.7193 32.9364 38.353L32.8182 38.2348C32.354 37.7808 31.7644 37.4761 31.1254 37.3603C30.4864 37.2444 29.8274 37.3226 29.2333 37.5848C28.6508 37.8345 28.1539 38.2491 27.8039 38.7776C27.454 39.306 27.2662 39.9253 27.2636 40.5591V40.8939C27.2636 41.9387 26.8486 42.9407 26.1098 43.6795C25.371 44.4183 24.369 44.8333 23.3242 44.8333C22.2794 44.8333 21.2774 44.4183 20.5387 43.6795C19.7999 42.9407 19.3848 41.9387 19.3848 40.8939V40.7167C19.3696 40.0647 19.1586 39.4324 18.7792 38.902C18.3998 38.3716 17.8696 37.9675 17.2576 37.7424C16.6635 37.4802 16.0045 37.402 15.3655 37.5179C14.7265 37.6337 14.1369 37.9383 13.6727 38.3924L13.5545 38.5106C13.1887 38.8769 12.7542 39.1674 12.276 39.3657C11.7977 39.5639 11.2851 39.666 10.7674 39.666C10.2497 39.666 9.73711 39.5639 9.25887 39.3657C8.78064 39.1674 8.34617 38.8769 7.9803 38.5106C7.61403 38.1447 7.32347 37.7103 7.12522 37.232C6.92697 36.7538 6.82493 36.2412 6.82493 35.7235C6.82493 35.2058 6.92697 34.6932 7.12522 34.2149C7.32347 33.7367 7.61403 33.3022 7.9803 32.9364L8.09848 32.8182C8.55257 32.354 8.85718 31.7644 8.97304 31.1254C9.08889 30.4864 9.01068 29.8274 8.74848 29.2333C8.4988 28.6508 8.08422 28.1539 7.55576 27.8039C7.02731 27.454 6.40806 27.2662 5.77424 27.2636H5.43939C4.3946 27.2636 3.3926 26.8486 2.65382 26.1098C1.91504 25.371 1.5 24.369 1.5 23.3242C1.5 22.2794 1.91504 21.2774 2.65382 20.5387C3.3926 19.7999 4.3946 19.3848 5.43939 19.3848H5.61667C6.26863 19.3696 6.90092 19.1586 7.43135 18.7792C7.96177 18.3998 8.3658 17.8696 8.59091 17.2576C8.85311 16.6635 8.93132 16.0045 8.81546 15.3655C8.69961 14.7265 8.395 14.1369 7.94091 13.6727L7.82273 13.5545C7.45646 13.1887 7.16589 12.7542 6.96764 12.276C6.7694 11.7977 6.66736 11.2851 6.66736 10.7674C6.66736 10.2497 6.7694 9.73711 6.96764 9.25887C7.16589 8.78064 7.45646 8.34617 7.82273 7.9803C8.18859 7.61403 8.62306 7.32347 9.1013 7.12522C9.57953 6.92697 10.0922 6.82493 10.6098 6.82493C11.1275 6.82493 11.6402 6.92697 12.1184 7.12522C12.5966 7.32347 13.0311 7.61403 13.397 7.9803L13.5152 8.09848C13.9794 8.55257 14.569 8.85718 15.2079 8.97304C15.8469 9.08889 16.5059 9.01068 17.1 8.74848H17.2576C17.8402 8.4988 18.337 8.08422 18.687 7.55576C19.0369 7.02731 19.2247 6.40806 19.2273 5.77424V5.43939C19.2273 4.3946 19.6423 3.3926 20.3811 2.65382C21.1199 1.91504 22.1219 1.5 23.1667 1.5C24.2115 1.5 25.2135 1.91504 25.9522 2.65382C26.691 3.3926 27.1061 4.3946 27.1061 5.43939V5.61667C27.1086 6.25049 27.2964 6.86974 27.6464 7.39819C27.9963 7.92664 28.4932 8.34122 29.0758 8.59091C29.6698 8.85311 30.3289 8.93132 30.9678 8.81546C31.6068 8.69961 32.1964 8.395 32.6606 7.94091L32.7788 7.82273C33.1446 7.45646 33.5791 7.16589 34.0574 6.96764C34.5356 6.7694 35.0482 6.66736 35.5659 6.66736C36.0836 6.66736 36.5962 6.7694 37.0745 6.96764C37.5527 7.16589 37.9872 7.45646 38.353 7.82273C38.7193 8.18859 39.0099 8.62306 39.2081 9.1013C39.4064 9.57953 39.5084 10.0922 39.5084 10.6098C39.5084 11.1275 39.4064 11.6402 39.2081 12.1184C39.0099 12.5966 38.7193 13.0311 38.353 13.397L38.2348 13.5152C37.7808 13.9794 37.4761 14.569 37.3603 15.2079C37.2444 15.8469 37.3226 16.5059 37.5848 17.1V17.2576C37.8345 17.8402 38.2491 18.337 38.7776 18.687C39.306 19.0369 39.9253 19.2247 40.5591 19.2273H40.8939C41.9387 19.2273 42.9407 19.6423 43.6795 20.3811C44.4183 21.1199 44.8333 22.1219 44.8333 23.1667C44.8333 24.2115 44.4183 25.2135 43.6795 25.9522C42.9407 26.691 41.9387 27.1061 40.8939 27.1061H40.7167C40.0828 27.1086 39.4636 27.2964 38.9351 27.6464C38.4067 27.9963 37.9921 28.4932 37.7424 29.0758Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8333 5.00016H5.49992C5.03321 5.00016 4.79985 5.00016 4.62159 4.90933C4.46479 4.82944 4.33731 4.70196 4.25741 4.54515C4.16659 4.3669 4.16659 4.13354 4.16659 3.66683V0.833496M12.4999 15.8335V10.5002C12.4999 10.0335 12.4999 9.8001 12.4091 9.62184C12.3292 9.46504 12.2017 9.33755 12.0449 9.25766C11.8667 9.16683 11.6333 9.16683 11.1666 9.16683H5.49992C5.03321 9.16683 4.79985 9.16683 4.62159 9.25766C4.46479 9.33755 4.33731 9.46504 4.25741 9.62184C4.16659 9.8001 4.16659 10.0335 4.16659 10.5002V15.8335M15.8333 6.10473V11.8335C15.8333 13.2336 15.8333 13.9337 15.5608 14.4685C15.3211 14.9389 14.9386 15.3213 14.4682 15.561C13.9334 15.8335 13.2334 15.8335 11.8333 15.8335H4.83325C3.43312 15.8335 2.73306 15.8335 2.19828 15.561C1.72787 15.3213 1.34542 14.9389 1.10574 14.4685C0.833252 13.9337 0.833252 13.2336 0.833252 11.8335V4.8335C0.833252 3.43336 0.833252 2.7333 1.10574 2.19852C1.34542 1.72811 1.72787 1.34566 2.19828 1.10598C2.73306 0.833496 3.43312 0.833496 4.83325 0.833496H10.562C10.9697 0.833496 11.1735 0.833496 11.3653 0.879546C11.5354 0.920374 11.6979 0.987715 11.8471 1.0791C12.0153 1.18217 12.1594 1.32629 12.4476 1.61454L15.0522 4.21911C15.3405 4.50737 15.4846 4.65149 15.5877 4.81969C15.679 4.96881 15.7464 5.13138 15.7872 5.30144C15.8333 5.49326 15.8333 5.69708 15.8333 6.10473Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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

const logisticId = ref<number | null>(null);

const formRef = ref<any>(null);
const isFormValid = ref(false);
const formErrors = reactive<Record<string, string>>({});
const hasValidationErrors = ref(false);

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

const businessName = ref("");
const businessNameTranslations = ref({ ar: "", en: "" });
const tradeNameTranslations = ref({ ar: "", en: "" });
const ownerName = ref("");
const mobile = ref("");
const phone = ref("");
const email = ref("");
const buisnessno = ref<string>("");
const taxno = ref("");
const unifiedLoginId = ref("");
const entityType = ref<string | null>(null);
const isActive = ref(true);
const languageId = ref<number | null>(null);

const countryId = ref<number | null>(null);
const cityId = ref<number | null>(null);
const neighborhood = ref("");
const streetName = ref("");
const postalCode = ref("");
const buildingNumber = ref("");
const address1 = ref("");
const latitude = ref("");
const longitude = ref("");

const bankAccounts = ref<LogisticBankAccount[]>([]);
const debitLimit = ref('');
const creditLimit = ref('');

const contractorClassification = ref<string | null>(null);
const classificationGrade = ref<string | null>(null);
const scopeOfWork = ref<string | null>(null);
const municipalLicenseNumber = ref('');
const municipalLicenseExpiry = ref('');
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

const licenseNumber = ref("");
const licenseIssueDate = ref("");
const licenseExpiryDate = ref("");
const geoArea = ref("");

// Step 3: Operational Info (new fields)
const materialTypes = ref<string[]>([]);
const fleetSize = ref<string>("");
const branchesCount = ref<string>("");
const operationScope = ref<string | null>(null);
const driversCount = ref<string>("");
const supervisorsCount = ref<string>("");
const dailyTripsAvg = ref<string>("");
const operationMode = ref<string | null>(null);
const maintenanceStrategy = ref<string | null>(null);
const fleetManagementSystem = ref<boolean>(false);
const gpsTracking = ref<boolean>(false);

// Step 5: Transport Licensing & Compliance (new step)
const transportMinistryLicenseNumber = ref<string>("");
const transportLicenseIssueDate = ref<string>("");
const transportLicenseExpiryDate = ref<string>("");
const activityClassification = ref<string | null>(null);
const hazardousTransport = ref<boolean>(false);
const civilDefensePermit = ref<boolean>(false);
const safetyClassification = ref<string | null>(null);
const fleetInsuranceCoverage = ref<boolean>(false);
const insuranceProvider = ref<string>("");
const ownershipType = ref<string | null>(null);

// Old fields (keeping for backward compatibility if needed)
const productionLines = ref<number | null>(null);
const rockType = ref<string | null>(null);
const logisticType = ref<string | null>(null);
const feedRate = ref<string>("");
const maxProduction = ref<string>("");
const currentProduction = ref<string>("");
const design = ref<string | null>(null);
const workersCount = ref<number | null>(null);
const managerName = ref("");
const managerId = ref("");
const managerPhone = ref("");
const managerEmail = ref("");

const documents = ref<any[]>([]);
const documentName = ref("");
const documentType = ref<string | null>(null);
const documentFile = ref<File[] | null>(null);
const pageLoading = ref(false)

const constants = ref<any>({});

const countryItems = ref<Array<{ title: string; value: number }>>([]);
const cityItems = ref<Array<{ title: string; value: number }>>([]);
const languageItems = ref<Array<{ title: string; value: number }>>([]);
const bankItems = ref<Array<{ title: string; value: number }>>([]);

// Computed items from constants
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

const saving = ref(false);

const handleSave = async () => {
    try {
        // Clear previous errors
        Object.keys(formErrors).forEach(key => delete formErrors[key]);

        saving.value = true;

        // Map activeTab to actual step numbers: 0->1, 1->2, 2->3, 3->4
        const stepMapping = [1, 2, 3, 4];
        const step = stepMapping[activeTab.value];
        const payload: any = { step };

        // Add _method for PUT requests when editing
        payload._method = 'PUT';

        // Step 1: Basic Info
        if (step === 1) {
            // اسم المالك يُرسل كـ owner_name
            if (ownerName.value) payload.owner_name = ownerName.value;
            payload.trade_name = {
                en: tradeNameTranslations.value.en || '',
                ar: tradeNameTranslations.value.ar || ''
            };
            payload.mobile = mobile.value;
            if (phone.value) payload.phone = phone.value;
            if (email.value) payload.email = email.value;
            if (buisnessno.value) {
                payload.buisnessno = String(buisnessno.value);
                payload.commercial_register = String(buisnessno.value);
            }
            if (taxno.value) {
                 payload.taxno = String(taxno.value);
                 payload.tax_register = String(taxno.value);
            }
            if (unifiedLoginId.value) payload.unified_login_id = String(unifiedLoginId.value);
            if (entityType.value) payload.entity_type = entityType.value;
            payload.is_active = isActive.value;

            if (countryId.value) payload.country_id = countryId.value;
            if (cityId.value) payload.city_id = cityId.value;
            if (neighborhood.value) payload.neighborhood = neighborhood.value;
            if (streetName.value) payload.street_name = streetName.value;
            if (buildingNumber.value) payload.building_number = buildingNumber.value;
            if (postalCode.value) payload.postal_code = postalCode.value;
            if (address1.value) payload.address_1 = address1.value;
            if (latitude.value) payload.latitude = latitude.value;
            if (longitude.value) payload.longitude = longitude.value;
            if (languageId.value) payload.language_id = languageId.value;
            
            console.log('Step 1 Payload:', payload);
            console.log('tradeNameTranslations.value:', tradeNameTranslations.value);
        }

        // Step 2: Financial Info
        if (step === 2) {
            payload.bank_accounts = bankAccounts.value.map(account => {
                const accountData: any = {
                    bank_id: account.bank_id,
                    bank_branch: account.bank_branch,
                    iban: account.iban,
                    account_number: account.account_number,
                    is_active: account.is_active
                };
                // Only include id if it exists (editing existing account)
                if (account.id !== null && account.id !== undefined && String(account.id).length <= 5) {
                    accountData.id = account.id;
                }
                return accountData;
            });
            if (debitLimit.value) payload.debit_limit = debitLimit.value;
            if (creditLimit.value) payload.credit_limit = creditLimit.value;
        }


        // Step 3: Commercial Info (contractor classification, licenses, certifications)
        if (step === 3) {
            if (contractorClassification.value) payload.contractor_classification = contractorClassification.value;
            if (classificationGrade.value) payload.classification_grade = classificationGrade.value;
            if (scopeOfWork.value) payload.scope_of_work = scopeOfWork.value;
            if (municipalLicenseNumber.value) payload.municipal_license_number = municipalLicenseNumber.value;
            if (municipalLicenseExpiry.value) payload.municipal_license_expiry = municipalLicenseExpiry.value;
            if (municipalLicenseStatus.value) payload.municipal_license_status = municipalLicenseStatus.value;
            if (safetyCertification.value) payload.safety_certification = safetyCertification.value;
            if (environmentalCertification.value) payload.environmental_certification = environmentalCertification.value;
            payload.civil_defense_approval = civilDefenseApproval.value;
            
            console.log('Step 3 Payload (Commercial):', payload);
        }


        // Step 4: Operational Info (contractor capacity and projects)
        if (step === 4) {
            if (ongoingProjects.value !== null) payload.ongoing_projects = ongoingProjects.value;
            if (completedProjects.value !== null) payload.completed_projects = completedProjects.value;
            if (employeesCount.value !== null) payload.employees_count = employeesCount.value;
            if (engineersCount.value !== null) payload.engineers_count = engineersCount.value;
            if (techniciansCount.value !== null) payload.technicians_count = techniciansCount.value;
            if (operationalCapacity.value) payload.operational_capacity = operationalCapacity.value;
            if (specialization.value) payload.specialization = specialization.value;
            if (siteReadiness.value) payload.site_readiness = siteReadiness.value;
            payload.safety_management_system = safetyManagementSystem.value;
            payload.environmental_compliance = environmentalCompliance.value;
            
            console.log('Step 4 Payload (Operational):', payload);
        }


        // Step 5: Documents (commented out for later)
        // if (step === 5) {
        //     // Documents logic here
        // }

        // Save based on step - all steps use the same endpoint
        let response: any;
        const factoryId = route.params.id;
        if (factoryId) {
            response = await api.put(`/factories/${factoryId}`, payload);
        } else {
            response = await api.post(`/factories`, payload);
        }

        // Show success message based on step
        const stepMessages: Record<number, string> = {
            1: 'تم حفظ البيانات الأساسية بنجاح',
            2: 'تم حفظ البيانات المالية بنجاح',
            3: 'تم حفظ المعلومات التشغيلية بنجاح',
            5: 'تم حفظ بيانات الترخيص والامتثال بنجاح'
        };
        // Clear validation errors on successful save
        hasValidationErrors.value = false;
        Object.keys(formErrors).forEach(key => delete formErrors[key]);

        success(response.message || stepMessages[step]);

        // Auto-advance to next step after successful save
        if (activeTab.value < 3) {
            activeTab.value = activeTab.value + 1; // Move to next tab
        } else if (activeTab.value === 3) {
            activeTab.value = 0
        }
    } catch (err: any) {
        console.error('Error saving factory:', err);

        // Handle validation errors (422 status)
        if (err?.response?.status === 422 && err?.response?.data?.errors) {
            hasValidationErrors.value = true;
            const errorsObj = err.response.data.errors;
            Object.keys(errorsObj).forEach(key => {
                formErrors[key] = errorsObj[key][0];
            });
        }
        
        // Show API errors as toast notifications
        apiError(err, 'فشل حفظ البيانات');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push({ name: 'FactoriesList' });
};

const handleBasicInfoUpdate = (data: any) => {
    console.log('BasicInfoUpdate received:', data);
    console.log('tradeNameTranslations:', data.tradeNameTranslations);

    if (data.businessName !== undefined) businessName.value = data.businessName;
    if (data.businessNameTranslations !== undefined) businessNameTranslations.value = data.businessNameTranslations;
    if (data.tradeNameTranslations !== undefined) tradeNameTranslations.value = data.tradeNameTranslations;
    if (data.ownerName !== undefined) ownerName.value = data.ownerName;
    if (data.entityType !== undefined) entityType.value = data.entityType;
    if (data.isActive !== undefined) isActive.value = data.isActive;
    if (data.mobile !== undefined) mobile.value = data.mobile;
    if (data.phone !== undefined) phone.value = data.phone;
    if (data.email !== undefined) email.value = data.email;
    if (data.buisnessno !== undefined) buisnessno.value = data.buisnessno;
    if (data.taxno !== undefined) taxno.value = data.taxno;
    if (data.unifiedLoginId !== undefined) unifiedLoginId.value = data.unifiedLoginId;
    if (data.countryId !== undefined) countryId.value = data.countryId;
    if (data.cityId !== undefined) cityId.value = data.cityId;
    if (data.neighborhood !== undefined) neighborhood.value = data.neighborhood;
    if (data.streetName !== undefined) streetName.value = data.streetName;
    if (data.postalCode !== undefined) postalCode.value = data.postalCode;
    if (data.buildingNumber !== undefined) buildingNumber.value = data.buildingNumber;
    if (data.address1 !== undefined) address1.value = data.address1;
    if (data.languageId !== undefined) languageId.value = data.languageId;
};

const clearFieldError = (field: string) => {
    if (formErrors[field]) {
        delete formErrors[field];
    }

    // Check if all errors are cleared
    if (Object.keys(formErrors).length === 0) {
        hasValidationErrors.value = false;
    }
};

const handleFinancialInfoUpdate = (data: any) => {
    if (data.bankAccounts !== undefined) bankAccounts.value = data.bankAccounts;
    if (data.debitLimit !== undefined) debitLimit.value = data.debitLimit;
    if (data.creditLimit !== undefined) creditLimit.value = data.creditLimit;
};

const handleCommercialInfoUpdate = (data: any) => {
    console.log('CommercialInfoUpdate received:', data);
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
    console.log('OperationalInfoUpdate received:', data);
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

const handleTransportLicensingUpdate = (data: any) => {
    if (data.transportMinistryLicenseNumber !== undefined) transportMinistryLicenseNumber.value = data.transportMinistryLicenseNumber;
    if (data.transportLicenseIssueDate !== undefined) transportLicenseIssueDate.value = data.transportLicenseIssueDate;
    if (data.transportLicenseExpiryDate !== undefined) transportLicenseExpiryDate.value = data.transportLicenseExpiryDate;
    if (data.activityClassification !== undefined) activityClassification.value = data.activityClassification;
    if (data.hazardousTransport !== undefined) hazardousTransport.value = data.hazardousTransport;
    if (data.civilDefensePermit !== undefined) civilDefensePermit.value = data.civilDefensePermit;
    if (data.safetyClassification !== undefined) safetyClassification.value = data.safetyClassification;
    if (data.fleetInsuranceCoverage !== undefined) fleetInsuranceCoverage.value = data.fleetInsuranceCoverage;
    if (data.insuranceProvider !== undefined) insuranceProvider.value = data.insuranceProvider;
    if (data.ownershipType !== undefined) ownershipType.value = data.ownershipType;
};

// const addDocument = (document: { name: string; type: string; file: File[] | null }) => {
//     documents.value.push({
//         id: Date.now(),
//         name: document.name,
//         type: document.type,
//         file: document.file,
//         date: new Date().toLocaleDateString('ar-SA'),
//     });
// };

// const removeDocument = (id: number) => {
//     documents.value = documents.value.filter(doc => doc.id !== id);
// };

const fetchFactoryData = async () => {
    // Don't fetch data if there are validation errors (to preserve user input)
    if (hasValidationErrors.value) return;
    
    const factoryId = route.params.id;
    if (!factoryId) return;

    try {
        const response = await api.get(`/factories/${factoryId}`);
        const data = response.data;

        logisticId.value = data.id;
        
        // اسم المالك / الشركة المالكة يأتي من owner_name
        ownerName.value = data.owner_name || '';
        
        businessName.value = data.full_name || data.business_name || '';
        if (data.business_name_translations) {
            businessNameTranslations.value = data.business_name_translations;
        }
        
        if (data.trade_name_translations) {
             tradeNameTranslations.value = data.trade_name_translations;
        }



        mobile.value = data.mobile || '';
        phone.value = data.phone || '';
        email.value = data.email || '';
        buisnessno.value = data.buisnessno || data.commercial_register || '';
        taxno.value = data.taxno || data.tax_register || '';
        unifiedLoginId.value = data.unified_login_id || '';
        entityType.value = data.entity_type || null;
        isActive.value = data.is_active === true || data.is_active === 'true' || data.is_active === 1;
        languageId.value = data.language_id || null;

        countryId.value = data.country_id || null;
        cityId.value = data.city_id || null;
        neighborhood.value = data.neighborhood || '';
        streetName.value = data.street_name || '';
        postalCode.value = data.postal_code || '';
        buildingNumber.value = data.building_number || '';
        address1.value = data.address_1 || '';
        latitude.value = data.latitude || '';
        longitude.value = data.longitude || '';

        bankAccounts.value = data.bank_accounts || [];
        debitLimit.value = data.debit_limit || '';
        creditLimit.value = data.credit_limit || '';

        licenseNumber.value = data.license_number || '';
        licenseIssueDate.value = data.license_issue_date || '';
        licenseExpiryDate.value = data.license_expiry_date || '';
        geoArea.value = data.geo_area || '';

        // Step 3: Commercial Info (contractor classification, licenses, certifications)
        contractorClassification.value = data.contractor_classification || null;
        classificationGrade.value = data.classification_grade || null;
        scopeOfWork.value = data.scope_of_work || null;
        municipalLicenseNumber.value = data.municipal_license_number || '';
        municipalLicenseExpiry.value = data.municipal_license_expiry || '';
        municipalLicenseStatus.value = data.municipal_license_status || null;
        safetyCertification.value = data.safety_certification || null;
        environmentalCertification.value = data.environmental_certification || null;
        civilDefenseApproval.value = data.civil_defense_approval === 'true' || data.civil_defense_approval === true;

        // Step 4: Operational Info (contractor capacity and projects)
        ongoingProjects.value = data.ongoing_projects || null;
        completedProjects.value = data.completed_projects || null;
        employeesCount.value = data.employees_count || null;
        engineersCount.value = data.engineers_count || null;
        techniciansCount.value = data.technicians_count || null;
        operationalCapacity.value = data.operational_capacity || null;
        specialization.value = data.specialization || null;
        siteReadiness.value = data.site_readiness || null;
        safetyManagementSystem.value = data.safety_management_system === 'true' || data.safety_management_system === true;
        environmentalCompliance.value = data.environmental_compliance === 'true' || data.environmental_compliance === true;


        // Old fields (keeping for backward compatibility)
        productionLines.value = data.production_lines || null;
        rockType.value = data.rock_type || null;
        logisticType.value = data.logistic_type || null;
        feedRate.value = data.feed_rate || '';
        maxProduction.value = data.max_production || '';
        currentProduction.value = data.current_production || '';
        design.value = data.design || null;
        workersCount.value = data.workers_count || null;

        managerName.value = data.manager_name || '';
        managerId.value = data.manager_id || '';
        managerPhone.value = data.manager_phone || '';
        managerEmail.value = data.manager_email || '';
    } catch (err: any) {
        console.error('Error fetching factory:', err);
        apiError(err, 'فشل تحميل بيانات المصنع');
    }
};

const fetchConstants = async () => {
    try {
        const response = await api.get('/factories/constants');
        constants.value = response.data;
    } catch (err: any) {
        console.error('Error fetching constants:', err);
    }
};

const fetchBanksList = async () => {
    try {
        const response = await api.get('/banks/list');
        if (response.data && Array.isArray(response.data)) {
            bankItems.value = response.data.map((bank: any) => ({
                title: bank.name || bank.title,
                value: bank.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching banks list:', err);
    }
};

const fetchLanguagesList = async () => {
    try {
        const response = await api.get('/languages/list');
        if (response.data && Array.isArray(response.data)) {
            languageItems.value = response.data.map((lang: any) => ({
                title: lang.name || lang.title,
                value: lang.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching languages list:', err);
    }
};

const fetchCountriesList = async () => {
    try {
        const response = await api.get('/countries/list');
        if (response.data && Array.isArray(response.data)) {
            countryItems.value = response.data.map((country: any) => ({
                title: country.name || country.title,
                value: country.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching countries list:', err);
    }
};

const fetchCitiesList = async (countryIdParam?: number) => {
    try {
        const url = countryIdParam
            ? `/cities/list?country_id=${countryIdParam}`
            : '/cities/list';
        const response = await api.get(url);
        if (response.data && Array.isArray(response.data)) {
            cityItems.value = response.data.map((city: any) => ({
                title: city.name || city.title,
                value: city.id
            }));
        }
    } catch (err: any) {
        console.error('Error fetching cities list:', err);
    }
};

onMounted(async () => {
    pageLoading.value = true
    await Promise.all([
        fetchConstants(),
        fetchBanksList(),
        fetchLanguagesList(),
        fetchCountriesList(),
        fetchCitiesList()
    ]);
    await fetchFactoryData();
    pageLoading.value = false
});

</script>

<template>
    <default-layout>
        <div class="logistic-form-page">
            <PageHeader :icon="logisticsIcon" title-key="pages.profile.title"
                description-key="pages.profile.description" />

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

            <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                <v-tabs-window v-model="activeTab">
                    <v-tabs-window-item :value="0">
                        <BasicInfoTab :businessName="businessName" :businessNameTranslations="businessNameTranslations"
                            :ownerName="ownerName" :mobile="mobile" :phone="phone" :email="email"
                            :buisnessno="buisnessno" :taxno="taxno" :unifiedLoginId="unifiedLoginId" :countryId="countryId" :cityId="cityId"
                            :neighborhood="neighborhood" :streetName="streetName" :postalCode="postalCode"
                            :buildingNumber="buildingNumber" :address1="address1" :languageId="languageId"
                            :tradeNameTranslations="tradeNameTranslations" :entityType="entityType" :isActive="isActive"
                            :entityTypeItems="entityTypeItems"
                            :countryItems="countryItems" :cityItems="cityItems" :languageItems="languageItems"
                            :formErrors="formErrors" @update:formData="handleBasicInfoUpdate"
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="1">
                        <FinancialInfoTab :bankAccounts="bankAccounts" :bankItems="bankItems" :debitLimit="debitLimit"
                            :creditLimit="creditLimit" :formErrors="formErrors"
                            @update:formData="handleFinancialInfoUpdate" @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="2">
                        <CommercialInfoTab 
                            :contractorClassification="contractorClassification"
                            :classificationGrade="classificationGrade" 
                            :scopeOfWork="scopeOfWork"
                            :municipalLicenseNumber="municipalLicenseNumber" 
                            :municipalLicenseExpiry="municipalLicenseExpiry"
                            :municipalLicenseStatus="municipalLicenseStatus" 
                            :safetyCertification="safetyCertification"
                            :environmentalCertification="environmentalCertification" 
                            :civilDefenseApproval="civilDefenseApproval"
                            :contractorClassificationItems="contractorClassificationItems"
                            :classificationGradeItems="classificationGradeItems" 
                            :scopeOfWorkItems="scopeOfWorkItems"
                            :municipalLicenseStatusItems="municipalLicenseStatusItems"
                            :safetyCertificationItems="safetyCertificationItems"
                            :environmentalCertificationItems="environmentalCertificationItems"
                            :formErrors="formErrors"
                            @update:formData="handleCommercialInfoUpdate" 
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="3">
                        <OperationalInfoTab 
                            :ongoingProjects="ongoingProjects" 
                            :completedProjects="completedProjects"
                            :employeesCount="employeesCount" 
                            :engineersCount="engineersCount" 
                            :techniciansCount="techniciansCount"
                            :operationalCapacity="operationalCapacity" 
                            :specialization="specialization" 
                            :siteReadiness="siteReadiness"
                            :safetyManagementSystem="safetyManagementSystem" 
                            :environmentalCompliance="environmentalCompliance"
                            :operationalCapacityItems="operationalCapacityItems" 
                            :specializationItems="specializationItems"
                            :siteReadinessItems="siteReadinessItems"
                            :formErrors="formErrors"
                            @update:formData="handleOperationalInfoUpdate" 
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-form>

            <div class="flex justify-center gap-5 mt-6 lg:flex-row flex-col">
                <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
                    :prepend-icon="saveIcon" label="حفظ التعديلات" @click="handleSave" :loading="saving" />

                <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4" height="48"
                    custom-class="font-semibold text-base text-primary-700 px-6 min-w-56" label="إغلاق"
                    :disabled="saving" @click="handleCancel" />
            </div>
        </div>

        <v-overlay :model-value="pageLoading" contained class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" />
        </v-overlay>
    </default-layout>
</template>

<style scoped>
.custom-tab {
    border-radius: 8px !important;
    text-transform: none;
    font-weight: 500;
}


.custom-tab--completed {
    color: #039855;
}
</style>
