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

        <v-btn
          variant="flat"
          color="primary"
          height="44"
          class="font-semibold text-base px-8"
          prepend-icon="mdi-content-save-outline"
          @click="handleSaveMain"
        >
          حفظ
        </v-btn>
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

            <v-btn
              variant="flat"
              color="primary"
              height="40"
              class="font-semibold text-base px-6"
              prepend-icon="mdi-plus-circle-outline"
              @click="openAddSegment"
            >
              اضف المزيد
            </v-btn>
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
