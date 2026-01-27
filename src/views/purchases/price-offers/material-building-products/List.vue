<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'
import DatePickerInput from '@/components/common/forms/DatePickerInput.vue';

const { t } = useI18n()

const router = useRouter();

// Prices Offers icon
const pricesOffersIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.85 26H36.4837C37.6258 26 38.6112 25.9999 39.4227 26.0662C40.2793 26.1362 41.1313 26.2907 41.9511 26.7085C43.1742 27.3316 44.1685 28.326 44.7917 29.5491C45.2094 30.3689 45.3639 31.2209 45.4339 32.0774C45.5002 32.889 45.5002 33.8743 45.5002 35.0164V36.4836C45.5002 37.6257 45.5002 38.611 45.4339 39.4226C45.3639 40.2791 45.2094 41.1311 44.7917 41.9509C44.1685 43.174 43.1742 44.1684 41.9511 44.7915C41.1313 45.2093 40.2793 45.3638 39.4227 45.4338C38.6111 45.5001 37.6258 45.5 36.4836 45.5H32.85C31.7079 45.5 30.7225 45.5001 29.9109 45.4338C29.0544 45.3638 28.2024 45.2093 27.3826 44.7915C26.1595 44.1684 25.1651 43.174 24.542 41.9509C24.1242 41.1311 23.9697 40.2791 23.8997 39.4226C23.8334 38.611 23.8335 37.6257 23.8335 36.4835V35.0165C23.8335 33.8743 23.8334 32.889 23.8997 32.0774C23.9697 31.2209 24.1242 30.3689 24.542 29.5491C25.1651 28.326 26.1595 27.3316 27.3826 26.7085C28.2024 26.2907 29.0544 26.1362 29.9109 26.0662C30.7225 25.9999 31.7078 26 32.85 26ZM30.2638 30.3852C29.6752 30.4333 29.457 30.5149 29.3499 30.5695C28.9422 30.7772 28.6107 31.1087 28.403 31.5164C28.3484 31.6235 28.2668 31.8417 28.2187 32.4303C28.1685 33.0442 28.1668 33.8508 28.1668 35.1V36.4C28.1668 37.6492 28.1685 38.4558 28.2187 39.0697C28.2668 39.6583 28.3484 39.8765 28.403 39.9836C28.6107 40.3913 28.9422 40.7228 29.3499 40.9305C29.457 40.9851 29.6752 41.0667 30.2638 41.1148C30.8777 41.165 31.6843 41.1667 32.9335 41.1667H36.4002C37.6494 41.1667 38.456 41.165 39.0699 41.1148C39.6585 41.0667 39.8767 40.9851 39.9838 40.9305C40.3915 40.7228 40.723 40.3913 40.9307 39.9836C40.9853 39.8765 41.0669 39.6583 41.115 39.0697C41.1652 38.4558 41.1668 37.6492 41.1668 36.4V35.1C41.1668 33.8508 41.1652 33.0442 41.115 32.4303C41.0669 31.8417 40.9853 31.6235 40.9307 31.5164C40.723 31.1087 40.3915 30.7772 39.9838 30.5695C39.8767 30.5149 39.6585 30.4333 39.0699 30.3852C38.456 30.335 37.6494 30.3333 36.4002 30.3333H32.9335C31.6843 30.3333 30.8777 30.335 30.2638 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9018 6.49985C13.0769 6.49919 12.3666 6.49863 11.7321 6.62484C9.15361 7.13773 7.13798 9.15337 6.62508 11.7319C6.49887 12.3664 6.49944 13.0767 6.50009 13.9015L6.50019 14.0833L6.50009 14.265C6.49944 15.0899 6.49887 15.8002 6.62508 16.4347C7.13798 19.0132 9.15361 21.0288 11.7321 21.5417C12.3666 21.6679 13.0769 21.6674 13.9018 21.6667H38.0986C38.9235 21.6674 39.6338 21.6679 40.2683 21.5417C42.8468 21.0288 44.8624 19.0132 45.3753 16.4347C45.5015 15.8002 45.5009 15.0899 45.5003 14.2651L45.5002 14.0833L45.5003 13.9015C45.5009 13.0767 45.5015 12.3663 45.3753 11.7319C44.8624 9.15337 42.8468 7.13773 40.2683 6.62484C39.6338 6.49863 38.9235 6.49919 38.0986 6.49985H13.9018ZM12.5775 10.8749C12.734 10.8438 12.9729 10.8333 14.0835 10.8333H37.9169C39.0275 10.8333 39.2663 10.8438 39.4229 10.8749C40.2824 11.0459 40.9543 11.7178 41.1252 12.5772C41.1564 12.7338 41.1669 12.9727 41.1669 14.0833C41.1669 15.1939 41.1564 15.4328 41.1252 15.5893C40.9543 16.4488 40.2824 17.1207 39.4229 17.2916C39.2663 17.3228 39.0275 17.3333 37.9169 17.3333H14.0835C12.9729 17.3333 12.734 17.3228 12.5775 17.2916C11.718 17.1207 11.0461 16.4488 10.8752 15.5893C10.844 15.4328 10.8335 15.1939 10.8335 14.0833C10.8335 12.9727 10.844 12.7338 10.8752 12.5772C11.0461 11.7178 11.718 11.0459 12.5775 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.0002 26C9.41035 26 6.5002 28.9102 6.5002 32.5V39C6.5002 42.5899 9.41035 45.5 13.0002 45.5C16.59 45.5 19.5002 42.5899 19.5002 39V32.5C19.5002 28.9102 16.5901 26 13.0002 26ZM10.8335 32.5C10.8335 31.3034 11.8036 30.3334 13.0002 30.3334C14.1968 30.3334 15.1669 31.3034 15.1669 32.5V39C15.1669 40.1966 14.1968 41.1667 13.0002 41.1667C11.8036 41.1667 10.8335 40.1966 10.8335 39V32.5Z" fill="#1570EF"/>
</svg>`;

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const importIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 11V12C16 13.4001 16 14.1002 15.7275 14.635C15.4878 15.1054 15.1054 15.4878 14.635 15.7275C14.1002 16 13.4001 16 12 16H5C3.59987 16 2.8998 16 2.36502 15.7275C1.89462 15.4878 1.51217 15.1054 1.27248 14.635C1 14.1002 1 13.4001 1 12V11M12.6667 6.83333L8.5 11M8.5 11L4.33333 6.83333M8.5 11V1" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const refreshIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.1667 17.6667C10.1667 17.6667 10.8744 17.5656 13.8033 14.6366C16.7322 11.7077 16.7322 6.95897 13.8033 4.03003C12.7656 2.9923 11.4994 2.32224 10.1667 2.01986M10.1667 17.6667H15.1667M10.1667 17.6667L10.1667 12.6667M6.83333 1.00016C6.83333 1.00016 6.12563 1.10126 3.1967 4.0302C0.267767 6.95913 0.267767 11.7079 3.1967 14.6368C4.23443 15.6745 5.5006 16.3446 6.83333 16.647M6.83333 1.00016L1.83333 1M6.83333 1.00016L6.83333 6" stroke="#175CD3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trashIcon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.6666 4.16668V3.50001C11.6666 2.56659 11.6666 2.09988 11.4849 1.74336C11.3251 1.42976 11.0702 1.17479 10.7566 1.015C10.4 0.833344 9.93334 0.833344 8.99992 0.833344H7.66658C6.73316 0.833344 6.26645 0.833344 5.90993 1.015C5.59633 1.17479 5.34136 1.42976 5.18157 1.74336C4.99992 2.09988 4.99992 2.56659 4.99992 3.50001V4.16668M6.66659 8.75001V12.9167M9.99992 8.75001V12.9167M0.833252 4.16668H15.8333M14.1666 4.16668V13.5C14.1666 14.9001 14.1666 15.6002 13.8941 16.135C13.6544 16.6054 13.272 16.9878 12.8016 17.2275C12.2668 17.5 11.5667 17.5 10.1666 17.5H6.49992C5.09979 17.5 4.39972 17.5 3.86494 17.2275C3.39454 16.9878 3.01209 16.6054 2.7724 16.135C2.49992 15.6002 2.49992 14.9001 2.49992 13.5V4.16668" stroke="#D92D20" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const eyeIcon = `<svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.26387 8.71318C1.12769 8.49754 1.05959 8.38972 1.02147 8.22342C0.992842 8.0985 0.992842 7.9015 1.02147 7.77658C1.05959 7.61028 1.12769 7.50246 1.26387 7.28682C2.38928 5.50484 5.73915 1 10.8442 1C15.9492 1 19.299 5.50484 20.4244 7.28682C20.5606 7.50246 20.6287 7.61028 20.6668 7.77658C20.6955 7.9015 20.6955 8.0985 20.6668 8.22342C20.6287 8.38972 20.5606 8.49754 20.4244 8.71318C19.299 10.4952 15.9492 15 10.8442 15C5.73915 15 2.38928 10.4952 1.26387 8.71318Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.8442 11C12.501 11 13.8442 9.65685 13.8442 8C13.8442 6.34315 12.501 5 10.8442 5C9.1873 5 7.84415 6.34315 7.84415 8C7.84415 9.65685 9.1873 11 10.8442 11Z" stroke="#4B5565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Prices Offers table data
const tableHeaders = [
    { key: "requestName", title: "كود الطلب", width: "150px" },
    { key: "requestCode", title: "نوع الطلب", width: "120px" },
    { key: "startDate", title: "اسم المورد", width: "130px" },
    { key: "endDate", title: "تاريخ الطلب", width: "130px" },
    { key: "type", title: "موقع المشروع", width: "100px" },
    { key: "name", title: "طريقة الدفع", width: "120px" },
    { key: "address", title: "دفعة مقدمة", width: "120px" },
    { key: "status", title: "الحالة", width: "120px" },
];

const tableItems = ref([
    {
        id: 1,
        requestName: "CASD",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "الرياض",
        status: "مكتمل",
    },
    {
        id: 2,
        requestName: "QALLAB",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "مكة",
        status: "قيد المراجعة",
    },
    {
        id: 3,
        requestName: "YSTW",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "جدة",
        status: "تأكيد",
    },
    {
        id: 4,
        requestName: "QALLAB",
        requestCode: "#1234778",
        startDate: "22/07/2025",
        endDate: "22/07/2025",
        type: "قطعة",
        name: "QALLAB",
        address: "تبوك",
        status: "الغاء",
    },
]);

// Selection state
const selectedRequests = ref<number[]>([]);
const hasselectedRequests = computed(() => selectedRequests.value.length > 0);

// Filters
const showAdvancedFilters = ref(false);
const filterRequestNumber = ref("");
const filterNameArabic = ref(null);
const filterNameEnglish = ref("");
const filterStartDateMin = ref("");
const filterStartDateMax = ref("");

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const resetFilters = () => {
    filterRequestNumber.value = "";
    filterNameArabic.value = null;
    filterNameEnglish.value = "";
    filterStartDateMin.value = "";
    filterStartDateMax.value = "";
};

const applyFilters = () => {
    console.log("Applying filters...");
};

// Handlers
const handleEdit = (item: any) => {
    router.push({ name: "RequestForQuotationMaterialProductEdit", params: { id: item.id } });
};

const handleDelete = (item: any) => {
    tableItems.value = tableItems.value.filter((t) => t.id !== item.id);
};

const handleSelectRequest = (item: any, selected: boolean) => {
    if (selected) {
        selectedRequests.value.push(item.id);
    } else {
        selectedRequests.value = selectedRequests.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllRequests = (checked: boolean) => {
    if (checked) {
        selectedRequests.value = tableItems.value.map((item) => item.id);
    } else {
        selectedRequests.value = [];
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'مكتمل':
            return 'bg-[#ECFDF3] text-[#027A48]';
        case 'قيد المراجعة':
            return 'bg-[#FEF0C7] text-[#DC6803]';
        case 'تأكيد':
            return 'bg-[#F2F4F7] text-[#344054]';
        case 'الغاء':
            return 'bg-[#FEE4E2] text-[#D92D20]';
        default:
            return 'bg-[#F2F4F7] text-[#344054]';
    }
};

const openCreateRequest = () => {
    router.push({ name: "RequestForQuotationMaterialProductCreate" });
};

</script>

<template>
    <default-layout>
        <div class="pricesOffers-page">
            <PageHeader :icon="pricesOffersIcon" title-key="pages.requestForQuotationMaterialProduct.title"
                description-key="pages.requestForQuotationMaterialProduct.description" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
                    :prepend-icon="importIcon" :label="t('common.import')" />
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" :label="t('common.export')" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasselectedRequests ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="hasselectedRequests"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')" />
                    </div>

                    <!-- Main header controls -->
                    <div class="flex flex-wrap gap-3">
                        <ButtonWithIcon variant="outlined" append-icon="mdi-chevron-down" rounded="4" color="gray-500"
                            height="40" custom-class="font-semibold text-base border-gray-400"
                            :prepend-icon="columnIcon" :label="t('common.columns')">
                            <template #append>
                                <v-icon>mdi-chevron-down</v-icon>
                            </template>
                        </ButtonWithIcon>

                        <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف مشروع" @click="openCreateRequest" />
                    </div>
                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 gap-3 flex justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3 items-end">
                        <TextInput v-model="filterRequestNumber" density="comfortable" variant="outlined" hide-details
                            placeholder="كود الطلب" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterNameEnglish" density="comfortable" variant="outlined" hide-details
                            placeholder="اسم المورد" class="w-full sm:w-40 bg-white" />
                        <TextInput v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
                            placeholder="دفعة مقدمة" class="w-full sm:w-40 bg-white" />
                        <SelectInput :items="['الموقع','الموقع']" v-model="filterNameArabic" density="comfortable" variant="outlined" hide-details
                            placeholder="موقع المشروع" class="w-full sm:w-40 bg-white" />
                        <DatePickerInput v-model="filterStartDateMin" density="comfortable" hide-details
                            placeholder="تاريخ الطلب" class="w-full sm:w-40 bg-white" />
                    </div>
                    <div class="flex gap-2 items-center">
                        <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                            custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                            :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />
                        <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                            custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                            prepend-icon="mdi-refresh" label="إعادة تعيين" />
                    </div>
                </div>

                <!-- Prices Offers Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" show-checkbox show-actions force-show-delete
                    force-show-edit force-show-view @edit="handleEdit" @delete="handleDelete"
                    @select="handleSelectRequest" @selectAll="handleSelectAllRequests">
                    <template #item.status="{ item }">
                        <span
                            :class="['inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap', getStatusClass(item.status)]">
                            {{ item.status }}
                        </span>
                    </template>
                    <template #item.actions="{ item }">
                        <div class="flex items-center">
                            <v-btn icon variant="text" size="small">
                                <span v-html="refreshIcon"></span>
                            </v-btn>
                            <v-btn icon variant="text" size="small">
                                <span v-html="eyeIcon"></span>
                            </v-btn>
                            <v-btn icon variant="text" color="primary" size="small">
                                <span v-html="editIcon"></span>
                            </v-btn>
                            <v-btn icon variant="text" size="small" color="error">
                                <span v-html="trashIcon"></span>
                            </v-btn>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>