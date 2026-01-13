<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import MapDialog from '@/components/common/MapDialog.vue';

interface Props {
  licenseNumber: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  geoArea: string;
  managerName: string;
  managerId: string;
  managerPhone: string;
  managerEmail: string;
  latitude: string;
  longitude: string;
}
const locationIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_818_75719)">
<path d="M16.666 10.0013C16.666 13.6832 13.6812 16.668 9.99935 16.668M16.666 10.0013C16.666 6.3194 13.6812 3.33464 9.99935 3.33464M16.666 10.0013H18.3327M9.99935 16.668C6.31745 16.668 3.33268 13.6832 3.33268 10.0013M9.99935 16.668V18.3346M3.33268 10.0013C3.33268 6.3194 6.31745 3.33464 9.99935 3.33464M3.33268 10.0013H1.66602M9.99935 3.33464V1.66797M12.4993 10.0013C12.4993 11.382 11.3801 12.5013 9.99935 12.5013C8.61864 12.5013 7.49935 11.382 7.49935 10.0013C7.49935 8.62059 8.61864 7.5013 9.99935 7.5013C11.3801 7.5013 12.4993 8.62059 12.4993 10.0013Z" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_818_75719">
<rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>
`

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: Partial<Props>];
}>();

const formData = reactive({
  licenseNumber: props.licenseNumber,
  licenseIssueDate: props.licenseIssueDate,
  licenseExpiryDate: props.licenseExpiryDate,
  geoArea: props.geoArea,
  managerName: props.managerName,
  managerId: props.managerId,
  managerPhone: props.managerPhone,
  managerEmail: props.managerEmail,
  latitude: props.latitude,
  longitude: props.longitude,
});

const showMapDialog = ref(false);

watch(() => props, (newProps) => {
  Object.assign(formData, {
    licenseNumber: newProps.licenseNumber,
    licenseIssueDate: newProps.licenseIssueDate,
    licenseExpiryDate: newProps.licenseExpiryDate,
    geoArea: newProps.geoArea,
    managerName: newProps.managerName,
    managerId: newProps.managerId,
    managerPhone: newProps.managerPhone,
    managerEmail: newProps.managerEmail,
    latitude: newProps.latitude,
    longitude: newProps.longitude,
  });
}, { deep: true });

const emitUpdate = () => {
  emit('update:formData', { ...formData });
};

const openMapDialog = () => {
  showMapDialog.value = true;
};

const handleLocationSelected = (location: { latitude: string; longitude: string }) => {
  formData.latitude = location.latitude;
  formData.longitude = location.longitude;
  emitUpdate();
};

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

const datepickerInput = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.834 7.50016H0.833984M11.6673 0.833496V4.16683M5.00065 0.833496V4.16683M4.83398 17.5002H11.834C13.2341 17.5002 13.9342 17.5002 14.469 17.2277C14.9394 16.988 15.3218 16.6055 15.5615 16.1351C15.834 15.6004 15.834 14.9003 15.834 13.5002V6.50016C15.834 5.10003 15.834 4.39997 15.5615 3.86519C15.3218 3.39478 14.9394 3.01233 14.469 2.77265C13.9342 2.50016 13.2341 2.50016 11.834 2.50016H4.83398C3.43385 2.50016 2.73379 2.50016 2.19901 2.77265C1.7286 3.01233 1.34615 3.39478 1.10647 3.86519C0.833984 4.39997 0.833984 5.10003 0.833984 6.50016V13.5002C0.833984 14.9003 0.833984 15.6004 1.10647 16.1351C1.34615 16.6055 1.7286 16.988 2.19901 17.2277C2.73379 17.5002 3.43385 17.5002 4.83398 17.5002Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات التجارية</h2>

    <!-- License Information -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput v-model="formData.licenseNumber" @blur="emitUpdate" label="رقم الرخصة"
        placeholder="رقم الرخصة" />
      <DatePickerInput v-model="formData.licenseIssueDate" @blur="emitUpdate" label="تاريخ إصدار الرخصة"
        placeholder="اختر التاريخ">
              <template #append-inner>
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                  </template>
                  <div>
                    تاريخ إصدار رخصة الكسارة الرسمي
                  </div>
                </v-tooltip>
              </template>
              <template #prepend-inner>
                <span v-html="datepickerInput"></span>
              </template>
        </DatePickerInput>
      <DatePickerInput v-model="formData.licenseExpiryDate" @blur="emitUpdate" label="تاريخ انتهاء الرخصة"
        placeholder="اختر التاريخ">
              <template #append-inner>
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                  </template>
                  <div>
                    تاريخ انتهاء صلاحية رخصة الكسارة
                  </div>
                </v-tooltip>
              </template>
              <template #prepend-inner>
                <span v-html="datepickerInput"></span>
              </template>
        </DatePickerInput>
      <div class="relative">
        <label class="text-sm font-medium text-gray-700 mb-2 block">الموقع الجغرافي</label>
        <div @click="openMapDialog"
          class="flex items-center justify-between px-4 py-2 bg-blue-50 border-2 border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
          <span class="text-base font-medium text-blue-900">حدد الموقع</span>
          <div class="flex items-center gap-2">
            <span v-html="locationIcon"></span>
          </div>
        </div>
      </div>
      <TextInput v-model="formData.latitude" v-if="formData.latitude" label="خط العرض (Latitude)" placeholder="24.7136"
        disabled dir="ltr" />
      <TextInput v-model="formData.longitude" v-if="formData.longitude" label="خط الطول (Longitude)"
        placeholder="46.6753" disabled dir="ltr" />
    </div>

    <!-- Manager Data Section -->
    <h3 class="text-md font-bold text-primary-900 mb-4 mt-6">بيانات المدير</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput v-model="formData.managerName" @blur="emitUpdate" label="اسم المدير / المسؤول"
        placeholder="اسم المدير / المسؤول" />
      <TextInput v-model="formData.managerId" @blur="emitUpdate" label="رقم الهوية / الإقامة" placeholder="845987565" />
      <TextInput v-model="formData.managerPhone" @blur="emitUpdate" label="الهاتف" placeholder="+966 (555) 000-0000"
        dir="ltr">
        <template #prepend-inner>
          <span class="text-gray-900 font-semibold me-2 block text-sm">KSA</span>
        </template>
      </TextInput>
      <TextInput v-model="formData.managerEmail" @blur="emitUpdate" label="البريد الإلكتروني"
        placeholder="info@buildtrans.sa" dir="ltr" />
    </div>

    <!-- Map Dialog -->
    <MapDialog v-model="showMapDialog" :latitude="formData.latitude" :longitude="formData.longitude"
      @location-selected="handleLocationSelected" />
  </div>
</template>
