<script setup lang="ts">
import { ref } from "vue";
import GeoSegmentFormDialog from "@/views/settings/geo-segments/components/GeoSegmentFormDialog.vue";

// Available languages
const availableLanguages = ref([
  { code: "en", name: "En", flag: "/img/en.svg", dir: "ltr" as const },
  { code: "ar", name: "AR", flag: "/img/sa.svg", dir: "rtl" as const },
]);

const formRef = ref<any | null>(null);
const isFormValid = ref(false);

const nameAr = ref("");
const nameEn = ref("");
const segmentType = ref<string | null>(null);
const truckType = ref<string | null>(null);
const isActive = ref(true);

const segmentTypeItems = [
  "نوع التقسيم 1",
  "نوع التقسيم 2",
  "نوع التقسيم 3",
];

const truckTypeItems = [
  "شاحنة صغيرة",
  "قلاب",
  "شاحنة كبيرة",
];

const geoSegmentsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M26 4.33301C18.0876 4.33301 11.6667 10.7539 11.6667 18.6663C11.6667 25.7604 17.4354 35.1195 23.0716 41.9692C24.015 43.109 24.4867 43.6789 25.122 43.9063C25.6669 44.1026 26.3331 44.1026 26.878 43.9063C27.5133 43.6789 27.985 43.109 28.9284 41.9692C34.5646 35.1195 40.3333 25.7604 40.3333 18.6663C40.3333 10.7539 33.9124 4.33301 26 4.33301ZM26 24.333C29.2216 24.333 31.8333 21.7213 31.8333 18.4997C31.8333 15.278 29.2216 12.6663 26 12.6663C22.7784 12.6663 20.1667 15.278 20.1667 18.4997C20.1667 21.7213 22.7784 24.333 26 24.333Z" fill="#1570EF"/>
</svg>`;

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.8359 5.00065H5.5026C5.03589 5.00065 4.80254 5.00065 4.62428 4.90982C4.46748 4.82993 4.33999 4.70244 4.2601 4.54564C4.16927 4.36738 4.16927 4.13403 4.16927 3.66732V0.833984M12.5026 15.834V10.5007C12.5026 10.0339 12.5026 9.80058 12.4118 9.62233C12.3319 9.46552 12.2044 9.33804 12.0476 9.25815C11.8693 9.16732 11.636 9.16732 11.1693 9.16732H5.5026C5.03589 9.16732 4.80254 9.16732 4.62428 9.25815C4.46748 9.33804 4.33999 9.46552 4.2601 9.62233C4.16927 9.80058 4.16927 10.0339 4.16927 10.5007V15.834M15.8359 6.10522V11.834C15.8359 13.2341 15.8359 13.9342 15.5635 14.469C15.3238 14.9394 14.9413 15.3218 14.4709 15.5615C13.9361 15.834 13.2361 15.834 11.8359 15.834H4.83594C3.43581 15.834 2.73574 15.834 2.20096 15.5615C1.73056 15.3218 1.3481 14.9394 1.10842 14.469C0.835938 13.9342 0.835938 13.2341 0.835938 11.834V4.83398C0.835938 3.43385 0.835938 2.73379 1.10842 2.19901C1.3481 1.7286 1.73056 1.34615 2.20096 1.10647C2.73574 0.833984 3.43581 0.833984 4.83594 0.833984H10.5647C10.9724 0.833984 11.1762 0.833984 11.368 0.880035C11.5381 0.920862 11.7006 0.988203 11.8497 1.07958C12.0179 1.18265 12.1621 1.32678 12.4503 1.61503L15.0549 4.2196C15.3431 4.50786 15.4873 4.65198 15.5903 4.82018C15.6817 4.9693 15.7491 5.13187 15.7899 5.30193C15.8359 5.49374 15.8359 5.69757 15.8359 6.10522Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
// Segments table
const segmentTableHeaders = [
  { key: "startDistance", title: "بداية النطاق (كم)", width: "140px" },
  { key: "endDistance", title: "نهاية النطاق (كم)", width: "140px" },
  { key: "tripTime", title: "زمن الرحلة", width: "140px" },
  { key: "basePrice", title: "سعر أساسي", width: "140px" },
  { key: "tripsCount", title: "عدد الطلعات", width: "120px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const segmentTableItems = ref([
  {
    id: 1,
    startDistance: "10 كم",
    endDistance: "10 كم",
    tripTime: "30 دقيقة",
    basePrice: "10.000",
    tripsCount: 20,
    status: true,
  },
  {
    id: 2,
    startDistance: "10 كم",
    endDistance: "10 كم",
    tripTime: "50 دقيقة",
    basePrice: "10.000",
    tripsCount: 20,
    status: false,
  },
  {
    id: 3,
    startDistance: "10 كم",
    endDistance: "10 كم",
    tripTime: "50 دقيقة",
    basePrice: "10.000",
    tripsCount: 20,
    status: true,
  },
]);

const showSegmentDialog = ref(false);
const editingSegment = ref<any | null>(null);

const handleSaveMain = async () => {
  if (formRef.value && typeof formRef.value.validate === "function") {
    const { valid } = await formRef.value.validate();
    if (!valid) return;
  }

  // TODO: integrate with API when available
  console.log("Save main geo segment settings", {
    nameAr: nameAr.value,
    nameEn: nameEn.value,
    segmentType: segmentType.value,
    truckType: truckType.value,
    isActive: isActive.value,
    segments: segmentTableItems.value,
  });
};

const openAddSegment = () => {
  editingSegment.value = null;
  showSegmentDialog.value = true;
};

const handleEditSegment = (item: any) => {
  editingSegment.value = { ...item };
  showSegmentDialog.value = true;
};

const handleDeleteSegment = (item: any) => {
  segmentTableItems.value = segmentTableItems.value.filter(
    (seg) => seg.id !== item.id,
  );
};

const handleSaveSegment = (payload: any) => {
  if (editingSegment.value && editingSegment.value.id) {
    const index = segmentTableItems.value.findIndex(
      (seg) => seg.id === editingSegment.value.id,
    );
    if (index !== -1) {
      segmentTableItems.value[index] = {
        ...segmentTableItems.value[index],
        ...payload,
      };
    }
  } else {
    const nextId = segmentTableItems.value.length
      ? Math.max(...segmentTableItems.value.map((s) => s.id)) + 1
      : 1;

    segmentTableItems.value.push({
      id: nextId,
      ...payload,
    });
  }

  editingSegment.value = null;
  showSegmentDialog.value = false;
};

const handleToggleStatus = (item: any, value: boolean) => {
  const index = segmentTableItems.value.findIndex((seg) => seg.id === item.id);
  if (index !== -1) {
    segmentTableItems.value[index] = {
      ...segmentTableItems.value[index],
      status: value,
    };
  }
};
</script>

<template>
  <default-layout>
    <div class="geo-segments-form-page">
      <div class="flex items-center flex-wrap justify-between mb-4">
        <PageHeader
          :icon="geoSegmentsIcon"
          title-key="pages.geoSegments.title"
          description-key="pages.geoSegments.description"
        />

        <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
          custom-class="font-semibold text-base sm:min-w-[200px]" :prepend-icon="saveIcon"
          label="حفظ" @click="handleSaveMain" />
      </div>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
        <div class="bg-gray-50 rounded-md p-4 -mx-6 sm:p-6 mb-15">
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6"
          >
            <div class="md:col-span-2">
              <LanguageTabs :languages="availableLanguages" label="الإسم">
                <template #en>
                  <TextInput
                    v-model="nameEn"
                    placeholder="Enter name in English"
                    :hide-details="true"
                  />
                </template>
                <template #ar>
                  <TextInput
                    v-model="nameAr"
                    placeholder="ادخل الاسم بالعربية"
                    :hide-details="true"
                  />
                </template>
              </LanguageTabs>
            </div>

            <SelectInput
              v-model="segmentType"
              label="نوع التقسيم"
              placeholder="اختر النوع"
              :items="segmentTypeItems"
              :hide-details="false"
            />

            <SelectWithIconInput
              v-model="truckType"
              label="نوع الشاحنة"
              placeholder="اختر النوع"
              :items="truckTypeItems"
              :hide-details="false"
              show-add-button
            />

            <div class="mt-1">
              <span class="text-sm font-semibold text-gray-700">الحالة</span>
              <div class="flex items-center gap-3 mt-1">
                <v-radio-group v-model="isActive" inline hide-details>
                  <v-radio :value="true" color="primary">
                    <template #label>
                      <span
                        :class="isActive ? 'text-primary font-semibold' : 'text-gray-600'"
                      >
                        فعال
                      </span>
                    </template>
                  </v-radio>
                  <v-radio :value="false" color="primary">
                    <template #label>
                      <span
                        :class="!isActive ? 'text-primary font-semibold' : 'text-gray-600'"
                      >
                        غير فعال
                      </span>
                    </template>
                  </v-radio>
                </v-radio-group>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-md -mx-6">
          <div class="flex items-center justify-between mb-4 px-4 sm:!px-6">
            <h2 class="text-lg font-bold text-primary-900">
              جدول النطاقات الجغرافية
            </h2>

            <ButtonWithIcon variant="flat" color="primary" height="40"
              custom-class="font-semibold text-base px-6" label="اضف المزيد"
              prepend-icon="mdi-plus-circle-outline" @click="openAddSegment" />
          </div>

          <DataTable
            :headers="segmentTableHeaders"
            :items="segmentTableItems"
            show-actions
            @edit="handleEditSegment"
            @delete="handleDeleteSegment"
          >
            <template #item.status="{ item }">
              <v-switch
                v-model="item.status"
                color="primary"
                inset
                hide-details
                @update:modelValue="(val: boolean) => handleToggleStatus(item, val)"
              />
            </template>
          </DataTable>
        </div>
      </v-form>

      <GeoSegmentFormDialog
        v-model="showSegmentDialog"
        :segment="editingSegment"
        @save="handleSaveSegment"
      />
    </div>
  </default-layout>
</template>

<style scoped></style>
