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
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">البيانات التجارية</h2>

    <!-- License Information -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput v-model="formData.licenseNumber" @blur="emitUpdate" label="رقم الرخصة"
        placeholder="رقم الرخصة" />
      <TextInput v-model="formData.licenseIssueDate" @blur="emitUpdate" type="date" label="تاريخ إصدار الرخصة"
        placeholder="2024-03-01" />
      <TextInput v-model="formData.licenseExpiryDate" @blur="emitUpdate" type="date" label="تاريخ انتهاء الرخصة"
        placeholder="2024-03-01" />
      <div class="relative">
        <label class="text-sm font-medium text-gray-700 mb-2 block">الموقع الجغرافي</label>
        <div @click="openMapDialog"
          class="flex items-center justify-between px-4 py-2 bg-blue-50 border-2 border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
          <span class="text-base font-medium text-blue-900">حدد الموقع</span>
          <div class="flex items-center gap-2">
            <v-icon size="20" color="blue">mdi-crosshairs-gps</v-icon>
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
        <template #append-inner>
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
