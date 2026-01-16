<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter();
const api = useApi();
const { success, error } = useNotification();

const contractorsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.12" fill-rule="evenodd" clip-rule="evenodd" d="M40.3519 33.8018C40.236 33.1628 40.3142 32.5038 40.5764 31.9097C40.8261 31.3272 41.2407 30.8303 41.7691 30.4803C42.2976 30.1304 42.9168 29.9426 43.5506 29.94H43.7279C44.7727 29.94 45.7747 29.525 46.5135 28.7862C47.2523 28.0474 47.6673 27.0454 47.6673 26.0006C47.6673 24.9559 47.2523 23.9539 46.5135 23.2151C45.7747 22.4763 44.7727 22.0613 43.7279 22.0613H43.3931C42.7593 22.0587 42.14 21.8709 41.6116 21.521C41.0831 21.171 40.6685 20.6741 40.4188 20.0916V19.934C40.1566 19.3399 40.0784 18.6809 40.1943 18.0419C40.3101 17.403 40.6147 16.8134 41.0688 16.3491L41.187 16.231C41.5533 15.8651 41.8438 15.4306 42.0421 14.9524C42.2403 14.4742 42.3424 13.9615 42.3424 13.4438C42.3424 12.9261 42.2403 12.4135 42.0421 11.9353C41.8438 11.457 41.5533 11.0226 41.187 10.6567C40.8211 10.2904 40.3867 9.99987 39.9084 9.80163C39.4302 9.60338 38.9176 9.50134 38.3999 9.50134C37.8822 9.50134 37.3696 9.60338 36.8913 9.80163C36.4131 9.99987 35.9786 10.2904 35.6128 10.6567L35.4946 10.7749C35.0304 11.229 34.4408 11.5336 33.8018 11.6494C33.1628 11.7653 32.5038 11.6871 31.9097 11.4249C31.3272 11.1752 30.8303 10.7606 30.4803 10.2322C30.1304 9.70372 29.9426 9.08447 29.94 8.45065V8.27338C29.94 7.22859 29.525 6.22659 28.7862 5.48781C28.0474 4.74903 27.0454 4.33398 26.0006 4.33398C24.9559 4.33398 23.9539 4.74903 23.2151 5.48781C22.4763 6.22659 22.0613 7.22859 22.0613 8.27338V8.60823C22.0587 9.24205 21.8709 9.8613 21.521 10.3897C21.171 10.9182 20.6741 11.3328 20.0916 11.5825H19.934C19.3399 11.8447 18.6809 11.9229 18.0419 11.807C17.403 11.6912 16.8134 11.3866 16.3491 10.9325L16.231 10.8143C15.8651 10.448 15.4306 10.1575 14.9524 9.9592C14.4742 9.76096 13.9615 9.65892 13.4438 9.65892C12.9261 9.65892 12.4135 9.76096 11.9353 9.9592C11.457 10.1575 11.0226 10.448 10.6567 10.8143C10.2904 11.1802 9.99987 11.6146 9.80163 12.0929C9.60338 12.5711 9.50134 13.0837 9.50134 13.6014C9.50134 14.1191 9.60338 14.6317 9.80163 15.11C9.99987 15.5882 10.2904 16.0227 10.6567 16.3885L10.7749 16.5067C11.229 16.9709 11.5336 17.5605 11.6494 18.1995C11.7653 18.8385 11.6871 19.4975 11.4249 20.0916C11.1998 20.7036 10.7958 21.2338 10.2653 21.6132C9.7349 21.9926 9.10261 22.2036 8.45065 22.2188H8.27338C7.22859 22.2188 6.22659 22.6339 5.48781 23.3727C4.74903 24.1114 4.33398 25.1134 4.33398 26.1582C4.33398 27.203 4.74903 28.205 5.48781 28.9438C6.22659 29.6826 7.22859 30.0976 8.27338 30.0976H8.60823C9.24205 30.1001 9.8613 30.288 10.3897 30.6379C10.9182 30.9879 11.3328 31.4847 11.5825 32.0673C11.8447 32.6614 11.9229 33.3204 11.807 33.9594C11.6912 34.5983 11.3866 35.1879 10.9325 35.6522L10.8143 35.7703C10.448 36.1362 10.1575 36.5707 9.9592 37.0489C9.76096 37.5271 9.65892 38.0398 9.65892 38.5575C9.65892 39.0752 9.76096 39.5878 9.9592 40.066C10.1575 40.5443 10.448 40.9787 10.8143 41.3446C11.1802 41.7109 11.6146 42.0014 12.0929 42.1997C12.5711 42.3979 13.0837 42.5 13.6014 42.5C14.1191 42.5 14.6317 42.3979 15.11 42.1997C15.5882 42.0014 16.0227 41.7109 16.3885 41.3446L16.5067 41.2264C16.9709 40.7723 17.5605 40.4677 18.1995 40.3519C18.8385 40.236 19.4975 40.3142 20.0916 40.5764C20.7036 40.8015 21.2338 41.2055 21.6132 41.736C21.9926 42.2664 22.2036 42.8987 22.2188 43.5506V43.7279C22.2188 44.7727 22.6339 45.7747 23.3727 46.5135C24.1114 47.2523 25.1134 47.6673 26.1582 47.6673C27.203 47.6673 28.205 47.2523 28.9438 46.5135C29.6826 45.7747 30.0976 44.7727 30.0976 43.7279V43.3931C30.1001 42.7593 30.288 42.14 30.6379 41.6116C30.9879 41.0831 31.4847 40.6685 32.0673 40.4188C32.6614 40.1566 33.3204 40.0784 33.9594 40.1943C34.5983 40.3101 35.1879 40.6147 35.6522 41.0688L35.7703 41.187C36.1362 41.5533 36.5707 41.8438 37.0489 42.0421C37.5271 42.2403 38.0398 42.3424 38.5575 42.3424C39.0752 42.3424 39.5878 42.2403 40.066 42.0421C40.5443 41.8438 40.9787 41.5533 41.3446 41.187C41.7109 40.8211 42.0014 40.3867 42.1997 39.9084C42.3979 39.4302 42.5 38.9176 42.5 38.3999C42.5 37.8822 42.3979 37.3696 42.1997 36.8913C42.0014 36.4131 41.7109 35.9786 41.3446 35.6128L41.2264 35.4946C40.7723 35.0304 40.4677 34.4408 40.3519 33.8018ZM32.5006 26.0006C32.5006 29.5905 29.5905 32.5006 26.0006 32.5006C22.4108 32.5006 19.5006 29.5905 19.5006 26.0006C19.5006 22.4108 22.4108 19.5006 26.0006 19.5006C29.5905 19.5006 32.5006 22.4108 32.5006 26.0006Z" fill="#1570EF"/>
<path d="M26.0006 32.5006C29.5905 32.5006 32.5006 29.5905 32.5006 26.0006C32.5006 22.4108 29.5905 19.5006 26.0006 19.5006C22.4108 19.5006 19.5006 22.4108 19.5006 26.0006C19.5006 29.5905 22.4108 32.5006 26.0006 32.5006Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M40.5764 31.9097C40.3142 32.5038 40.236 33.1628 40.3519 33.8018C40.4677 34.4408 40.7723 35.0304 41.2264 35.4946L41.3446 35.6128C41.7109 35.9786 42.0014 36.4131 42.1997 36.8913C42.3979 37.3696 42.5 37.8822 42.5 38.3999C42.5 38.9176 42.3979 39.4302 42.1997 39.9084C42.0014 40.3867 41.7109 40.8211 41.3446 41.187C40.9787 41.5533 40.5443 41.8438 40.066 42.0421C39.5878 42.2403 39.0752 42.3424 38.5575 42.3424C38.0398 42.3424 37.5272 42.2403 37.0489 42.0421C36.5707 41.8438 36.1362 41.5533 35.7703 41.187L35.6522 41.0688C35.1879 40.6147 34.5983 40.3101 33.9594 40.1943C33.3204 40.0784 32.6614 40.1566 32.0673 40.4188C31.4847 40.6685 30.9879 41.0831 30.6379 41.6116C30.288 42.14 30.1001 42.7593 30.0976 43.3931V43.7279C30.0976 44.7727 29.6826 45.7747 28.9438 46.5135C28.205 47.2523 27.203 47.6673 26.1582 47.6673C25.1134 47.6673 24.1114 47.2523 23.3727 46.5135C22.6339 45.7747 22.2188 44.7727 22.2188 43.7279V43.5506C22.2036 42.8987 21.9926 42.2664 21.6132 41.736C21.2338 41.2055 20.7036 40.8015 20.0916 40.5764C19.4975 40.3142 18.8385 40.236 18.1995 40.3519C17.5605 40.4677 16.9709 40.7723 16.5067 41.2264L16.3885 41.3446C16.0227 41.7109 15.5882 42.0014 15.11 42.1997C14.6317 42.3979 14.1191 42.5 13.6014 42.5C13.0837 42.5 12.5711 42.3979 12.0929 42.1997C11.6146 42.0014 11.1802 41.7109 10.8143 41.3446C10.448 40.9787 10.1575 40.5443 9.9592 40.066C9.76096 39.5878 9.65892 39.0752 9.65892 38.5575C9.65892 38.0398 9.76096 37.5272 9.9592 37.0489C10.1575 36.5707 10.448 36.1362 10.8143 35.7703L10.9325 35.6522C11.3866 35.1879 11.6912 34.5983 11.807 33.9594C11.9229 33.3204 11.8447 32.6614 11.5825 32.0673C11.3328 31.4847 10.9182 30.9879 10.3897 30.6379C9.8613 30.288 9.24205 30.1001 8.60823 30.0976H8.27338C7.22859 30.0976 6.22659 29.6826 5.48781 28.9438C4.74903 28.205 4.33398 27.203 4.33398 26.1582C4.33398 25.1134 4.74903 24.1114 5.48781 23.3727C6.22659 22.6339 7.22859 22.2188 8.27338 22.2188H8.45065C9.10261 22.2036 9.7349 21.9926 10.2653 21.6132C10.7958 21.2338 11.1998 20.7036 11.4249 20.0916C11.6871 19.4975 11.7653 18.8385 11.6494 18.1995C11.5336 17.5605 11.229 16.9709 10.7749 16.5067L10.6567 16.3885C10.2904 16.0227 9.99987 15.5882 9.80163 15.11C9.60338 14.6317 9.50134 14.1191 9.50134 13.6014C9.50134 13.0837 9.60338 12.5711 9.80163 12.0929C9.99987 11.6146 10.2904 11.1802 10.6567 10.8143C11.0226 10.448 11.457 10.1575 11.9353 9.9592C12.4135 9.76096 12.9261 9.65892 13.4438 9.65892C13.9615 9.65892 14.4742 9.76096 14.9524 9.9592C15.4306 10.1575 15.8651 10.448 16.231 10.8143L16.3491 10.9325C16.8134 11.3866 17.403 11.6912 18.0419 11.807C18.6809 11.9229 19.3399 11.8447 19.934 11.5825H20.0916C20.6741 11.3328 21.171 10.9182 21.521 10.3897C21.8709 9.8613 22.0587 9.24205 22.0613 8.60823V8.27338C22.0613 7.22859 22.4763 6.22659 23.2151 5.48781C23.9539 4.74903 24.9559 4.33398 26.0006 4.33398C27.0454 4.33398 28.0474 4.74903 28.7862 5.48781C29.525 6.22659 29.94 7.22859 29.94 8.27338V8.45065C29.9426 9.08447 30.1304 9.70372 30.4803 10.2322C30.8303 10.7606 31.3272 11.1752 31.9097 11.4249C32.5038 11.6871 33.1628 11.7653 33.8018 11.6494C34.4408 11.5336 35.0304 11.229 35.4946 10.7749L35.6128 10.6567C35.9786 10.2904 36.4131 9.99987 36.8913 9.80163C37.3696 9.60338 37.8822 9.50134 38.3999 9.50134C38.9176 9.50134 39.4302 9.60338 39.9084 9.80163C40.3867 9.99987 40.8211 10.2904 41.187 10.6567C41.5533 11.0226 41.8438 11.457 42.0421 11.9353C42.2403 12.4135 42.3424 12.9261 42.3424 13.4438C42.3424 13.9615 42.2403 14.4742 42.0421 14.9524C41.8438 15.4306 41.5533 15.8651 41.187 16.231L41.0688 16.3491C40.6147 16.8134 40.3101 17.403 40.1943 18.0419C40.0784 18.6809 40.1566 19.3399 40.4188 19.934V20.0916C40.6685 20.6741 41.0831 21.171 41.6116 21.521C42.14 21.8709 42.7593 22.0587 43.3931 22.0613H43.7279C44.7727 22.0613 45.7747 22.4763 46.5135 23.2151C47.2523 23.9539 47.6673 24.9559 47.6673 26.0006C47.6673 27.0454 47.2523 28.0474 46.5135 28.7862C45.7747 29.525 44.7727 29.94 43.7279 29.94H43.5506C42.9168 29.9426 42.2976 30.1304 41.7691 30.4803C41.2407 30.8303 40.8261 31.3272 40.5764 31.9097Z" stroke="#194185" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
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
</svg>`;

interface TableHeader {
  key: string;
  title: string;
  width?: string;
}

interface Contractor {
  id: number;
  trade_name: string;
  commercial_register: string;
  tax_register: string;
  license_number: string | null;
  contractor_grade: string | null;
  scope_of_work: string;
  contractor_classification: string;
  projects: {
    ongoing: number;
    completed: number;
  };
  status: boolean;
  actions: {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
  };
}

interface Pagination {
  next_cursor: string | null;
  previous_cursor: string | null;
  per_page: number;
}

const tableItems = ref<Contractor[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const loading = ref(false);
const loadingMore = ref(false);

const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

const tableHeaders = computed(() => {
  return shownHeaders.value.map(header => ({
    key: header.key,
    title: header.title,
    width: "140px"
  }));
});

const selectedContractors = ref<number[]>([]);
const hasSelectedContractors = computed(() => selectedContractors.value.length > 0);

const showAdvancedFilters = ref(false);
const filterTradeName = ref("");
const filterCommercialRegister = ref("");
const filterTaxRegister = ref("");
const filterLicenseNumber = ref("");
const filterContractorGrade = ref<string | null>(null);
const filterClassification = ref<string | null>(null);
const filterScopeOfWork = ref<string | null>(null);
const filterStatus = ref<string | null>(null);

const showHeadersMenu = ref(false);
const updatingHeaders = ref(false);
const headerCheckStates = computed(() => {
  const states: Record<string, boolean> = {};
  allHeaders.value.forEach(header => {
    states[header.key] = shownHeaders.value.some(h => h.key === header.key);
  });
  return states;
});
const showDeleteDialog = ref(false);
const showStatusDialog = ref(false);
const itemToDelete = ref<number | null>(null);
const itemToChangeStatus = ref<number | null>(null);

const observerTarget = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const fetchContractors = async (cursor: string | null = null, append: boolean = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }

    const params: any = {
      per_page: perPage.value,
    };

    if (cursor) {
      params.cursor = cursor;
    }

    if (filterTradeName.value) params.trade_name = filterTradeName.value;
    if (filterCommercialRegister.value) params.commercial_register = filterCommercialRegister.value;
    if (filterTaxRegister.value) params.tax_register = filterTaxRegister.value;
    if (filterLicenseNumber.value) params.license_number = filterLicenseNumber.value;
    if (filterContractorGrade.value) params.contractor_grade = filterContractorGrade.value;
    if (filterClassification.value) params.contractor_classification = filterClassification.value;
    if (filterScopeOfWork.value) params.scope_of_work = filterScopeOfWork.value;
    if (filterStatus.value !== null) params.status = filterStatus.value;

    const response = await api.get('/admin/api/contractors', { params });

    if (append) {
      tableItems.value = [...tableItems.value, ...response.data.data];
    } else {
      tableItems.value = response.data.data;
    }

    if (response.data.headers) {
      allHeaders.value = response.data.headers;
    }
    if (response.data.shownHeaders) {
      shownHeaders.value = response.data.shownHeaders;
    }

    nextCursor.value = response.data.pagination?.next_cursor || null;
    previousCursor.value = response.data.pagination?.previous_cursor || null;
    canCreate.value = response.data.actions?.can_create || false;

  } catch (err: any) {
    console.error('Error fetching contractors:', err);
    error(err?.response?.data?.message || 'فشل تحميل المقاولين');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const handleEdit = (item: Contractor) => {
  router.push({ name: 'ContractorsEdit', params: { id: item.id } });
};

const handleView = (item: Contractor) => {
  router.push({ name: 'ContractorsEdit', params: { id: item.id } });
};

const confirmDelete = (id: number) => {
  itemToDelete.value = id;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  if (!itemToDelete.value) return;

  try {
    await api.delete(`/admin/api/contractors/${itemToDelete.value}`);
    success('تم حذف المقاول بنجاح');
    showDeleteDialog.value = false;
    itemToDelete.value = null;
    await fetchContractors();
  } catch (err: any) {
    console.error('Error deleting contractor:', err);
    error(err?.response?.data?.message || 'فشل حذف المقاول');
  }
};

const confirmStatusChange = (id: number) => {
  itemToChangeStatus.value = id;
  showStatusDialog.value = true;
};

const handleStatusChange = async () => {
  if (!itemToChangeStatus.value) return;

  try {
    await api.post(`/admin/api/contractors/${itemToChangeStatus.value}/change-status`);
    success('تم تغيير الحالة بنجاح');
    showStatusDialog.value = false;
    itemToChangeStatus.value = null;
    await fetchContractors();
  } catch (err: any) {
    console.error('Error changing status:', err);
    error(err?.response?.data?.message || 'فشل تغيير الحالة');
  }
};

const handleBulkDelete = async () => {
  if (selectedContractors.value.length === 0) return;

  try {
    await api.post('/admin/api/contractors/bulk-delete', {
      ids: selectedContractors.value
    });
    success('تم حذف المقاولين المحددين بنجاح');
    selectedContractors.value = [];
    await fetchContractors();
  } catch (err: any) {
    console.error('Error bulk deleting:', err);
    error(err?.response?.data?.message || 'فشل حذف المقاولين');
  }
};

const toggleSelectAll = () => {
  if (selectedContractors.value.length === tableItems.value.length) {
    selectedContractors.value = [];
  } else {
    selectedContractors.value = tableItems.value.map(item => item.id);
  }
};

const toggleHeader = (header: string) => {
  const index = shownHeaders.value.findIndex(h => h.key === header.key);
  if (index > -1) {
    shownHeaders.value.splice(index, 1);
  } else {
    shownHeaders.value.push(header);
  }
};

const applyFilters = () => {
  fetchContractors();
};

const resetFilters = () => {
  filterTradeName.value = "";
  filterCommercialRegister.value = "";
  filterTaxRegister.value = "";
  filterLicenseNumber.value = "";
  filterContractorGrade.value = null;
  filterClassification.value = null;
  filterScopeOfWork.value = null;
  filterStatus.value = null;
  fetchContractors();
};

const loadMore = () => {
  if (hasMoreData.value && !loadingMore.value) {
    fetchContractors(nextCursor.value, true);
  }
};

const setupInfiniteScroll = () => {
  nextTick(() => {
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreData.value && !loadingMore.value) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(observerTarget.value);
    }
  });
};

onMounted(() => {
  fetchContractors();
  setupInfiniteScroll();
});

onBeforeUnmount(() => {
  if (observer && observerTarget.value) {
    observer.unobserve(observerTarget.value);
  }
});

const openCreateContractors = () => {
  router.push({ name: 'ContractorsEdit', params: { id: 2 } });
};

const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value;
};

</script>

<template>
  <default-layout>
    <div class="contractors-page">
      <PageHeader :icon="contractorsIcon" title-key="pages.contractors.title"
        description-key="pages.contractors.description" />

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
        <div :class="hasSelectedContractors ? 'justify-between' : 'justify-end'"
          class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
          <!-- Actions when rows are selected -->
          <div v-if="hasSelectedContractors"
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
            <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500" height="40"
                  custom-class="font-semibold text-base border-gray-400" :prepend-icon="columnIcon"
                  :label="t('common.columns')" append-icon="mdi-chevron-down" />
              </template>
              <v-list>
                <v-list-item v-for="header in allHeaders" :key="header.key" @click="toggleHeader(header.key)">
                  <template v-slot:prepend>
                    <v-checkbox-btn :model-value="headerCheckStates[header.key]" :disabled="updatingHeaders"
                      @click.stop="toggleHeader(header.key)"></v-checkbox-btn>
                  </template>
                  <v-list-item-title>{{ header.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
              :prepend-icon="searchIcon" :label="t('common.advancedSearch')" @click="toggleAdvancedFilters" />

            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
              custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
              :prepend-icon="plusIcon" label="أضف مقاول" @click="openCreateContractors" />
          </div>

        </div>

        <!-- Advanced filters row -->
        <div v-if="showAdvancedFilters"
          class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3 sm:gap-2">
          <div class="flex flex-wrap xl:!flex-nowrap gap-3 justify-end sm:justify-start">
            <v-text-field v-model="filterTradeName" density="comfortable" variant="outlined" hide-details
              placeholder="الاسم التجاري" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterCommercialRegister" density="comfortable" variant="outlined" hide-details
              placeholder="السجل التجاري" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterTaxRegister" density="comfortable" variant="outlined" hide-details
              placeholder="الرقم الضريبي" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-text-field v-model="filterLicenseNumber" density="comfortable" variant="outlined" hide-details
              placeholder="رقم رخصة البلدية" class="w-full sm:w-40 bg-white" @keyup.enter="applyFilters" />
            <v-select v-model="filterContractorGrade" :items="[]" density="comfortable" variant="outlined" hide-details
              placeholder="درجة المقاول" class="w-full sm:w-40 bg-white" @update:model-value="applyFilters" />
            <v-select v-model="filterClassification" :items="[]" density="comfortable" variant="outlined" hide-details
              placeholder="التصنيف" class="w-full sm:w-40 bg-white" @update:model-value="applyFilters" />
            <v-select v-model="filterStatus" :items="['فعال', 'غير فعال']" density="comfortable" variant="outlined"
              hide-details placeholder="الحالة" class="w-full sm:w-40 bg-white" @update:model-value="applyFilters" />

            <div class="flex gap-2 items-center">
              <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                custom-class="px-5 font-semibold !text-white text-sm sm:text-base" :prepend-icon="searchIcon"
                label="ابحث" @click="applyFilters" />
              <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                prepend-icon="mdi-refresh" label="إعادة تعيين" />
            </div>
          </div>
        </div>

        <!-- Contractors Table -->
        <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" show-checkbox show-actions
          @edit="handleEdit" @delete="handleDelete" @select="handleSelectContractor"
          @selectAll="handleSelectAllContractors">
          <template #item.status="{ item }">
            <v-switch :model-value="item.status" hide-details inset density="compact" color="primary"
              @click="handleStatusChange(item)" />
          </template>
        </DataTable>

        <!-- Infinite Scroll Trigger & Loading Indicator -->
        <div ref="observerTarget" class="flex justify-center py-4">
          <v-progress-circular v-if="loading && tableItems.length > 0" indeterminate color="primary" size="32" />
          <span v-else-if="!hasMoreData && tableItems.length > 0" class="text-gray-500 text-sm">
            لا توجد المزيد من البيانات
          </span>
        </div>
      </div>

    </div>

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :loading="false" :item-name="''" title="حذف المقاول"
      message="هل أنت متأكد من حذف المقاول" @confirm="confirmDelete" />

    <!-- Status Change Confirmation Dialog -->
    <DeleteConfirmDialog v-model="showStatusDialog" :loading="false" title="تغيير الحالة"
      message="هل أنت متأكد من تغيير حالة المقاول؟" @confirm="confirmStatusChange" />
  </default-layout>
</template>

<style scoped>
.contractors-list-page {
  padding: 20px;
}
</style>
