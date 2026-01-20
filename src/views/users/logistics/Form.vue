<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import BasicInfoTab from "./components/BasicInfoTab.vue";
import FinancialInfoTab, { LogisticBankAccount } from './components/FinancialInfoTab.vue';
import CommercialInfoTab from "./components/CommercialInfoTab.vue";
import OperationalInfoTab from "./components/OperationalInfoTab.vue";
import DocumentsTab from "./components/DocumentsTab.vue";

const route = useRoute();
const router = useRouter();
const api = useApi();

const logisticsIcon = `<svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.6667 2.4919C27.6147 1.84743 25.4313 1.5 23.1667 1.5C11.2005 1.5 1.5 11.2005 1.5 23.1667C1.5 35.1328 11.2005 44.8333 23.1667 44.8333C35.1328 44.8333 44.8333 35.1328 44.8333 23.1667C44.8333 19.4501 43.8976 15.9521 42.2488 12.8955M34 9.625H34.0108M19.9168 44.5912L19.917 39.8173C19.917 39.5588 20.0095 39.3087 20.1778 39.1124L25.5637 32.8287C26.0063 32.3123 25.8691 31.5205 25.2786 31.1831L19.0902 27.6468C18.922 27.5507 18.7827 27.4113 18.6867 27.2431L14.6527 20.1737C14.4427 19.8058 14.0376 19.594 13.6156 19.6316L1.63906 20.6983M42.6667 10.1667C42.6667 14.9531 38.3333 18.8333 34 23.1667C29.6667 18.8333 25.3333 14.9531 25.3333 10.1667C25.3333 5.3802 29.2135 1.5 34 1.5C38.7865 1.5 42.6667 5.3802 42.6667 10.1667ZM34.5417 9.625C34.5417 9.92415 34.2992 10.1667 34 10.1667C33.7008 10.1667 33.4583 9.92415 33.4583 9.625C33.4583 9.32585 33.7008 9.08333 34 9.08333C34.2992 9.08333 34.5417 9.32585 34.5417 9.625Z" stroke="#1570EF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
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

const isEditing = computed(() => !!route.params.id);
const pageTitle = computed(() => isEditing.value ? "تعديل الكسارة" : "إضافة كسارة");
const logisticId = ref<number | null>(null);

const formRef = ref<any>(null);
const isFormValid = ref(false);
const formErrors = reactive<Record<string, string>>({});
const hasValidationErrors = ref(false);

const activeTab = ref(0);
const tabs = [
    { title: "البيانات الاساسية", value: 0 },
    { title: "البيانات المالية", value: 1 },
    { title: "المعلومات التشغيلية", value: 2 },
    { title: "البيانات التجارية", value: 3 },
];

const isTabActive = (value: number) => activeTab.value === value;

const handleTabChange = (newTab: number, event?: Event) => {
    activeTab.value = newTab;
};

const businessName = ref("");
const businessNameTranslations = ref({ ar: "", en: "" });
const ownerName = ref("");
const mobile = ref("");
const phone = ref("");
const email = ref("");
const buisnessno = ref<string>("");
const taxno = ref("");
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

const countryItems = ref<Array<{ title: string; value: number }>>([]);
const cityItems = ref<Array<{ title: string; value: number }>>([]);
const languageItems = ref<Array<{ title: string; value: number }>>([]);
const bankItems = ref<Array<{ title: string; value: number }>>([]);
const rockTypeItems = ref<Array<{ title: string; value: string }>>([]);
const logisticTypeItems = ref<Array<{ title: string; value: string }>>([]);
const logisticDesignItems = ref<Array<{ title: string; value: string }>>([]);

// New constants for logistics
const operationScopeItems = ref<Array<{ title: string; value: string }>>([]);
const operationModeItems = ref<Array<{ title: string; value: string }>>([]);
const maintenanceStrategyItems = ref<Array<{ title: string; value: string }>>([]);
const activityClassificationItems = ref<Array<{ title: string; value: string }>>([]);
const safetyClassificationItems = ref<Array<{ title: string; value: string }>>([]);
const ownershipTypeItems = ref<Array<{ title: string; value: string }>>([]);
const materialTypesItems = ref<Array<{ title: string; value: string }>>([]);

const saving = ref(false);

const handleSave = async () => {
    try {
        // Clear previous errors
        Object.keys(formErrors).forEach(key => delete formErrors[key]);

        saving.value = true;

        // Map activeTab to actual step numbers: 0->1, 1->2, 2->3, 3->5
        const stepMapping = [1, 2, 3, 5];
        const step = stepMapping[activeTab.value];
        const payload: any = { step };

        // Add _method for PUT requests when editing
        if (isEditing.value) {
            payload._method = 'PUT';
        }

        // Step 1: Basic Info
        if (step === 1) {
            payload.business_name = {
                en: businessNameTranslations.value.en || businessName.value,
                ar: businessNameTranslations.value.ar || businessName.value
            };
            payload.owner_name = ownerName.value;
            payload.mobile = mobile.value;
            if (phone.value) payload.phone = phone.value;
            if (email.value) payload.email = email.value;
            if (buisnessno.value) payload.buisnessno = String(buisnessno.value);
            if (taxno.value) payload.taxno = String(taxno.value);
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
        }

        // Step 2: Financial Info
        if (step === 2) {
            if (!isEditing.value) {
                toast.error('يجب حفظ البيانات الأساسية أولاً');
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
                // Only include id if it exists (editing existing account)
                if (account.id !== null && account.id !== undefined && String(account.id).length <=5) {
                    accountData.id = account.id;
                }
                return accountData;
            });
            if (debitLimit.value) payload.debit_limit = debitLimit.value;
            if (creditLimit.value) payload.credit_limit = creditLimit.value;
        }

        // Step 3: Operational Info (new structure)
        if (step === 3) {
            if (!isEditing.value) {
                toast.error('يجب حفظ البيانات الأساسية أولاً');
                saving.value = false;
                return;
            }
            if (materialTypes.value && materialTypes.value.length > 0) {
                payload.material_types = materialTypes.value;
            }
            if (fleetSize.value) payload.fleet_size = fleetSize.value;
            if (branchesCount.value) payload.branches_count = branchesCount.value;
            if (operationScope.value) payload.operation_scope = operationScope.value;
            if (driversCount.value) payload.drivers_count = driversCount.value;
            if (supervisorsCount.value) payload.supervisors_count = supervisorsCount.value;
            if (dailyTripsAvg.value) payload.daily_trips_avg = dailyTripsAvg.value;
            if (operationMode.value) payload.operation_mode = operationMode.value;
            if (maintenanceStrategy.value) payload.maintenance_strategy = maintenanceStrategy.value;
            payload.fleet_management_system = fleetManagementSystem.value;
            payload.gps_tracking = gpsTracking.value;
        }

        // Step 5: Transport Licensing & Compliance (new step)
        if (step === 5) {
            if (!isEditing.value) {
                toast.error('يجب حفظ البيانات الأساسية أولاً');
                saving.value = false;
                return;
            }
            if (transportMinistryLicenseNumber.value) payload.transport_ministry_license_number = transportMinistryLicenseNumber.value;
            if (transportLicenseIssueDate.value) payload.license_issue_date = transportLicenseIssueDate.value;
            if (transportLicenseExpiryDate.value) payload.license_expiry_date = transportLicenseExpiryDate.value;
            if (activityClassification.value) payload.activity_classification = activityClassification.value;
            payload.hazardous_transport = hazardousTransport.value;
            payload.civil_defense_permit = civilDefensePermit.value;
            if (safetyClassification.value) payload.safety_classification = safetyClassification.value;
            payload.fleet_insurance_coverage = fleetInsuranceCoverage.value;
            if (insuranceProvider.value) payload.insurance_provider = insuranceProvider.value;
            if (ownershipType.value) payload.ownership_type = ownershipType.value;
        }

        // Step 5: Documents (commented out for later)
        // if (step === 5) {
        //     // Documents logic here
        // }

        // Save based on step - all steps use the same endpoint
        let response: any;
        if (isEditing.value) {
            response = await api.post(`/logistics-companies/${route.params.id}`, payload);
        } else {
            response = await api.post('/logistics-companies', payload);
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

        toast.success(response.message || stepMessages[step]);

        // Auto-advance to next step after successful save
        if (activeTab.value < 3) {
            activeTab.value = activeTab.value + 1; // Move to next tab
        } else if (activeTab.value === 3) {
            // After completing all steps, redirect to list
            router.push({ name: 'LogisticsList' });
        }
    } catch (err: any) {
        console.error('Error saving logistic:', err);

        // Handle validation errors (422 status)
        if (err?.response?.status === 422 && err?.response?.data?.errors) {
            hasValidationErrors.value = true;
            const apiErrors = err.response.data.errors;
            Object.keys(apiErrors).forEach(key => {
                formErrors[key] = apiErrors[key][0];
            });
            toast.error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
        } else {
            toast.error(err?.response?.data?.message || 'فشل حفظ الكسارة');
        }
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    router.push({ name: 'LogisticsList' });
};

const handleBasicInfoUpdate = (data: any) => {
    console.log(data.mobile);

    if (data.businessName !== undefined) businessName.value = data.businessName;
    if (data.businessNameTranslations !== undefined) businessNameTranslations.value = data.businessNameTranslations;
    if (data.ownerName !== undefined) ownerName.value = data.ownerName;
    if (data.mobile !== undefined) mobile.value = data.mobile;
    if (data.phone !== undefined) phone.value = data.phone;
    if (data.email !== undefined) email.value = data.email;
    if (data.buisnessno !== undefined) buisnessno.value = data.buisnessno;
    if (data.taxno !== undefined) taxno.value = data.taxno;
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
    if (data.licenseNumber !== undefined) licenseNumber.value = data.licenseNumber;
    if (data.licenseIssueDate !== undefined) licenseIssueDate.value = data.licenseIssueDate;
    if (data.licenseExpiryDate !== undefined) licenseExpiryDate.value = data.licenseExpiryDate;
    if (data.geoArea !== undefined) geoArea.value = data.geoArea;
    if (data.managerName !== undefined) managerName.value = data.managerName;
    if (data.managerId !== undefined) managerId.value = data.managerId;
    if (data.managerPhone !== undefined) managerPhone.value = data.managerPhone;
    if (data.managerEmail !== undefined) managerEmail.value = data.managerEmail;
    if (data.latitude !== undefined) latitude.value = data.latitude;
    if (data.longitude !== undefined) longitude.value = data.longitude;
};

const handleOperationalInfoUpdate = (data: any) => {
    // New fields for step 3
    if (data.materialTypes !== undefined) materialTypes.value = data.materialTypes;
    if (data.fleetSize !== undefined) fleetSize.value = data.fleetSize;
    if (data.branchesCount !== undefined) branchesCount.value = data.branchesCount;
    if (data.operationScope !== undefined) operationScope.value = data.operationScope;
    if (data.driversCount !== undefined) driversCount.value = data.driversCount;
    if (data.supervisorsCount !== undefined) supervisorsCount.value = data.supervisorsCount;
    if (data.dailyTripsAvg !== undefined) dailyTripsAvg.value = data.dailyTripsAvg;
    if (data.operationMode !== undefined) operationMode.value = data.operationMode;
    if (data.maintenanceStrategy !== undefined) maintenanceStrategy.value = data.maintenanceStrategy;
    if (data.fleetManagementSystem !== undefined) fleetManagementSystem.value = data.fleetManagementSystem;
    if (data.gpsTracking !== undefined) gpsTracking.value = data.gpsTracking;
    
    // Old fields (keeping for backward compatibility)
    if (data.productionLines !== undefined) productionLines.value = data.productionLines;
    if (data.rockType !== undefined) rockType.value = data.rockType;
    if (data.logisticType !== undefined) logisticType.value = data.logisticType;
    if (data.feedRate !== undefined) feedRate.value = data.feedRate;
    if (data.maxProduction !== undefined) maxProduction.value = data.maxProduction;
    if (data.currentProduction !== undefined) currentProduction.value = data.currentProduction;
    if (data.design !== undefined) design.value = data.design;
    if (data.workersCount !== undefined) workersCount.value = data.workersCount;
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

const fetchLogisticData = async () => {
    if (!isEditing.value) return;

    // Don't fetch data if there are validation errors (to preserve user input)
    if (hasValidationErrors.value) return;

    try {
        const response = await api.get(`/logistics-companies/${route.params.id}`);
        const data = response.data;

        logisticId.value = data.id;
        businessName.value = data.business_name || '';
        if (data.business_name_translations) {
            businessNameTranslations.value = data.business_name_translations;
        }
        ownerName.value = data.owner_name || '';
        mobile.value = data.mobile || '';
        phone.value = data.phone || '';
        email.value = data.email || '';
        buisnessno.value = data.buisnessno || '';
        taxno.value = data.taxno || '';
        languageId.value = data.language_id || null;

        countryId.value = data.country_id || null;
        cityId.value = data.city_id || null;
        neighborhood.value = data.neighborhood || '';
        streetName.value = data.street_name || '';
        postalCode.value = data.postal_code || '';
        buildingNumber.value = data.building_number || '';
        address1.value = data.address1 || '';
        latitude.value = data.latitude || '';
        longitude.value = data.longitude || '';

        bankAccounts.value = data.bank_accounts || [];
        debitLimit.value = data.debit_limit || '';
        creditLimit.value = data.credit_limit || '';

        licenseNumber.value = data.license_number || '';
        licenseIssueDate.value = data.license_issue_date || '';
        licenseExpiryDate.value = data.license_expiry_date || '';
        geoArea.value = data.geo_area || '';

        // Step 3: Operational Info (new fields)
        materialTypes.value = data.material_types || [];
        fleetSize.value = data.fleet_size || '';
        branchesCount.value = data.branches_count || '';
        operationScope.value = data.operation_scope || null;
        driversCount.value = data.drivers_count || '';
        supervisorsCount.value = data.supervisors_count || '';
        dailyTripsAvg.value = data.daily_trips_avg || '';
        operationMode.value = data.operation_mode || null;
        maintenanceStrategy.value = data.maintenance_strategy || null;
        fleetManagementSystem.value = data.fleet_management_system === 'true' || data.fleet_management_system === true;
        gpsTracking.value = data.gps_tracking === 'true' || data.gps_tracking === true;

        // Step 5: Transport Licensing (new fields)
        transportMinistryLicenseNumber.value = data.transport_ministry_license_number || '';
        transportLicenseIssueDate.value = data.license_issue_date || '';
        transportLicenseExpiryDate.value = data.license_expiry_date || '';
        activityClassification.value = data.activity_classification || null;
        hazardousTransport.value = data.hazardous_transport === 'true' || data.hazardous_transport === true;
        civilDefensePermit.value = data.civil_defense_permit === 'true' || data.civil_defense_permit === true;
        safetyClassification.value = data.safety_classification || null;
        fleetInsuranceCoverage.value = data.fleet_insurance_coverage === 'true' || data.fleet_insurance_coverage === true;
        insuranceProvider.value = data.insurance_provider || '';
        ownershipType.value = data.ownership_type || null;

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
        console.error('Error fetching logistic:', err);
        toast.error(err?.response?.data?.message || 'فشل تحميل بيانات الكسارة');
    }
};

const fetchConstants = async () => {
    try {
        const response = await api.get('/logistics-companies/constants');
        const constants = response.data;

        // Old constants (keeping for backward compatibility)
        if (constants.rock_types) {
            rockTypeItems.value = constants.rock_types.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.logistic_types) {
            logisticTypeItems.value = constants.logistic_types.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.logistic_designs) {
            logisticDesignItems.value = constants.logistic_designs.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        // New constants for logistics
        if (constants.operation_scope) {
            operationScopeItems.value = constants.operation_scope.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.operation_mode) {
            operationModeItems.value = constants.operation_mode.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.maintenance_strategy) {
            maintenanceStrategyItems.value = constants.maintenance_strategy.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.activity_classification) {
            activityClassificationItems.value = constants.activity_classification.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.safety_classification) {
            safetyClassificationItems.value = constants.safety_classification.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.ownership_types) {
            ownershipTypeItems.value = constants.ownership_types.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }

        if (constants.material_types) {
            materialTypesItems.value = constants.material_types.map((el: { label: string; key: string | number }) => ({
                title: el.label,
                value: el.key.toString()
            }))
        }
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
    await fetchLogisticData();
    pageLoading.value = false
});

</script>

<template>
    <default-layout>
        <div class="logistic-form-page">
            <PageHeader :icon="logisticsIcon" title-key="pages.logistics.title"
                description-key="pages.logistics.description" />

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
                            :buisnessno="buisnessno" :taxno="taxno" :countryId="countryId" :cityId="cityId"
                            :neighborhood="neighborhood" :streetName="streetName" :postalCode="postalCode"
                            :buildingNumber="buildingNumber" :address1="address1" :languageId="languageId"
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
                        <OperationalInfoTab :materialTypes="materialTypes" :fleetSize="fleetSize"
                            :branchesCount="branchesCount" :operationScope="operationScope" :driversCount="driversCount"
                            :supervisorsCount="supervisorsCount" :dailyTripsAvg="dailyTripsAvg"
                            :operationMode="operationMode" :maintenanceStrategy="maintenanceStrategy"
                            :fleetManagementSystem="fleetManagementSystem" :gpsTracking="gpsTracking"
                            :materialTypesItems="materialTypesItems" :operationScopeItems="operationScopeItems"
                            :operationModeItems="operationModeItems" :maintenanceStrategyItems="maintenanceStrategyItems"
                            :formErrors="formErrors" @update:formData="handleOperationalInfoUpdate"
                            @clear:error="clearFieldError" />
                    </v-tabs-window-item>

                    <v-tabs-window-item :value="3">
                        <CommercialInfoTab :transportMinistryLicenseNumber="transportMinistryLicenseNumber"
                            :transportLicenseIssueDate="transportLicenseIssueDate"
                            :transportLicenseExpiryDate="transportLicenseExpiryDate"
                            :activityClassification="activityClassification" :hazardousTransport="hazardousTransport"
                            :civilDefensePermit="civilDefensePermit" :safetyClassification="safetyClassification"
                            :fleetInsuranceCoverage="fleetInsuranceCoverage" :insuranceProvider="insuranceProvider"
                            :ownershipType="ownershipType" :activityClassificationItems="activityClassificationItems"
                            :safetyClassificationItems="safetyClassificationItems"
                            :ownershipTypeItems="ownershipTypeItems" :formErrors="formErrors"
                            @update:formData="handleTransportLicensingUpdate" @clear:error="clearFieldError" />
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
