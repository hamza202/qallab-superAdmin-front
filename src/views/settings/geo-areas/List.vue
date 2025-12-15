<script setup lang="ts">
import { ref } from "vue";
import GeoAreaFormDialog from "@/views/settings/geo-areas/components/GeoAreaFormDialog.vue";

const geoAreasIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 4.33301C18.0876 4.33301 11.6667 10.7539 11.6667 18.6663C11.6667 25.7604 17.4354 35.1195 23.0716 41.9692C24.015 43.109 24.4867 43.6789 25.122 43.9063C25.6669 44.1026 26.3331 44.1026 26.878 43.9063C27.5133 43.6789 27.985 43.109 28.9284 41.9692C34.5646 35.1195 40.3333 25.7604 40.3333 18.6663C40.3333 10.7539 33.9124 4.33301 26 4.33301ZM26 24.333C29.2216 24.333 31.8333 21.7213 31.8333 18.4997C31.8333 15.278 29.2216 12.6663 26 12.6663C22.7784 12.6663 20.1667 15.278 20.1667 18.4997C20.1667 21.7213 22.7784 24.333 26 24.333Z" fill="#1570EF"/>
</svg>`;

const geoAreasTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "nameAr", title: "الاسم بالعربية", width: "200px" },
  { key: "nameEn", title: "الاسم بالانجليزية", width: "200px" },
  { key: "description", title: "الوصف", width: "260px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const geoAreasTableItems = ref([
  {
    id: 1,
    nameAr: "منطقة شمالية",
    nameEn: "Northern Area",
    description: "الوصف",
    status: true,
  },
  {
    id: 2,
    nameAr: "منطقة جنوبية",
    nameEn: "Southern Area",
    description: "الوصف",
    status: false,
  },
]);

const showGeoAreaDialog = ref(false);
const editingGeoArea = ref<any | null>(null);

const openCreateGeoArea = () => {
  editingGeoArea.value = null;
  showGeoAreaDialog.value = true;
};

const handleEditGeoArea = (item: any) => {
  editingGeoArea.value = {
    id: item.id,
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    description: item.description,
    status: typeof item.status === "boolean" ? item.status : item.status === "فعال",
  };

  showGeoAreaDialog.value = true;
};

const handleDeleteGeoArea = (item: any) => {
  geoAreasTableItems.value = geoAreasTableItems.value.filter((g) => g.id !== item.id);
};

const handleSaveGeoArea = (payload: any) => {
  if (editingGeoArea.value && editingGeoArea.value.id) {
    const index = geoAreasTableItems.value.findIndex((g) => g.id === editingGeoArea.value.id);
    if (index !== -1) {
      geoAreasTableItems.value[index] = {
        ...geoAreasTableItems.value[index],
        nameAr: payload.nameAr,
        nameEn: payload.nameEn,
        description: payload.description,
        status: payload.status,
      };
    }
  } else {
    const nextId = geoAreasTableItems.value.length
      ? Math.max(...geoAreasTableItems.value.map((g) => g.id)) + 1
      : 1;

    geoAreasTableItems.value.push({
      id: nextId,
      nameAr: payload.nameAr,
      nameEn: payload.nameEn,
      description: payload.description,
      status: payload.status,
    });
  }

  editingGeoArea.value = null;
  showGeoAreaDialog.value = false;
};
</script>

<template>
  <default-layout>
    <div class="geo-areas-page">
      <PageHeader
        :icon="geoAreasIcon"
        title-key="pages.geoAreas.title"
        description-key="pages.geoAreas.description"
      />

      <div class="bg-gray-50 rounded-md p-4 sm:p-6 mt-4">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex flex-wrap gap-3">
            <v-btn
              variant="flat"
              color="primary"
              height="48"
              class="px-7 font-semibold text-base"
              prepend-icon="mdi-plus-circle-outline"
              @click="openCreateGeoArea"
            >
              اضف جديد
            </v-btn>

            <v-btn
              variant="flat"
              color="primary-50"
              height="48"
              class="px-7 font-semibold text-base text-primary-700"
              prepend-icon="mdi-magnify"
            >
              بحث متقدم
            </v-btn>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
            <v-text-field
              density="comfortable"
              variant="outlined"
              hide-details
              placeholder="بحث"
              prepend-inner-icon="mdi-magnify"
              class="w-full sm:w-64"
            />
          </div>
        </div>

        <DataTable
          title="تقسيمات المناطق الجغرافية"
          :headers="geoAreasTableHeaders"
          :items="geoAreasTableItems"
          show-actions
          :show-delete="false"
          class="mt-4"
          @edit="handleEditGeoArea"
          @delete="handleDeleteGeoArea"
        />

        <GeoAreaFormDialog
          v-model="showGeoAreaDialog"
          :area="editingGeoArea"
          @save="handleSaveGeoArea"
        />
      </div>
    </div>
  </default-layout>
</template>

<style scoped></style>
