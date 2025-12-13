<script setup lang="ts">
import UnitFormDialog from "@/views/settings/units/components/UnitFormDialog.vue";

const unitsIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;


const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const deleteIcon = `
<svg width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.1247 5.00065L8.12467 10.0007M8.12467 5.00065L13.1247 10.0007M1.22467 8.30065L4.82467 13.1007C5.11801 13.4918 5.26467 13.6873 5.45055 13.8284C5.61518 13.9533 5.8016 14.0465 6.00032 14.1032C6.22468 14.1673 6.46912 14.1673 6.95801 14.1673H13.2913C14.6915 14.1673 15.3915 14.1673 15.9263 13.8948C16.3967 13.6552 16.7792 13.2727 17.0189 12.8023C17.2913 12.2675 17.2913 11.5674 17.2913 10.1673V4.83398C17.2913 3.43385 17.2913 2.73379 17.0189 2.19901C16.7792 1.7286 16.3967 1.34615 15.9263 1.10647C15.3915 0.833984 14.6915 0.833984 13.2913 0.833984H6.95801C6.46912 0.833984 6.22468 0.833984 6.00032 0.89806C5.8016 0.954812 5.61518 1.04802 5.45055 1.17294C5.26467 1.31399 5.11801 1.50954 4.82467 1.90065L1.22467 6.70065C1.00951 6.98753 0.901932 7.13097 0.860462 7.28851C0.823856 7.42757 0.823856 7.57373 0.860462 7.71279C0.901932 7.87033 1.00951 8.01377 1.22467 8.30065Z" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
// Units table data
const taxTableHeaders = [
    { key: "id", title: "#", width: "60px" },
    { key: "unitName", title: "اسم الوحدة", width: "176px" },
    { key: "shortName", title: "الاختصار", width: "176px" },
    { key: "unitCode", title: "كود الوحدة", width: "176px" },
    { key: "type", title: "النوع", width: "176px" },
    { key: "createdAt", title: "تاريخ الإنشاء", width: "176px" },
    { key: "status", title: "الحالة", width: "176px" },
];

const taxTableItems = ref([
    {
        id: 1,
        unitName: "القطعة",
        shortName: "قطعة",
        unitCode: "U-001",
        type: "أساسي",
        createdAt: "2025-01-01",
        status: "نشطة",
    },
    {
        id: 2,
        unitName: "الكرتون",
        shortName: "كرتون",
        unitCode: "U-002",
        type: "مشتق",
        createdAt: "2025-01-05",
        status: "غير نشطة",
    },
    {
        id: 3,
        unitName: "الصندوق",
        shortName: "صندوق",
        unitCode: "U-003",
        type: "أساسي",
        createdAt: "2025-01-10",
        status: "نشطة",
    },
]);

const editingUnit = ref<any | null>(null);

const handleEditTax = (item: any) => {
    editingUnit.value = {
        id: item.id,
        nameAr: item.unitName,
        nameEn: item.shortName,
        code: item.unitCode,
        relatedUnit: null,
        type: item.type === "أساسي" ? "basic" : "مشتق",
        status: item.status === "نشطة",
        notes: "",
    };

    showUnitDialog.value = true;
};

const handleDeleteTax = (item: any) => {
    taxTableItems.value = taxTableItems.value.filter((t) => t.id !== item.id);
};

const showUnitDialog = ref(false);

const handleSaveUnit = (payload: any) => {
    if (editingUnit.value && editingUnit.value.id) {
        const index = taxTableItems.value.findIndex((t) => t.id === editingUnit.value.id);
        if (index !== -1) {
            taxTableItems.value[index] = {
                ...taxTableItems.value[index],
                unitName: payload.nameAr,
                shortName: payload.nameEn,
                unitCode: payload.code,
                type: payload.type === "basic" ? "أساسي" : "مشتق",
                status: payload.status ? "نشطة" : "غير نشطة",
            };
        }
    } else {
        const nextId = taxTableItems.value.length
            ? Math.max(...taxTableItems.value.map((t) => t.id)) + 1
            : 1;

        taxTableItems.value.push({
            id: nextId,
            unitName: payload.nameAr,
            shortName: payload.nameEn,
            unitCode: payload.code,
            type: payload.type === "basic" ? "أساسي" : "مشتق",
            createdAt: new Date().toISOString().slice(0, 10),
            status: payload.status ? "نشطة" : "غير نشطة",
        });
    }

    editingUnit.value = null;
    showUnitDialog.value = false;
};

const openCreateUnit = () => {
    editingUnit.value = null;
    showUnitDialog.value = true;
};

</script>

<template>
    <default-layout>
        <div class="units-page">
            <PageHeader :icon="unitsIcon" title-key="pages.units.title" description-key="pages.units.description" />
            <div class="bg-gray-50 rounded-md p-4 sm:p-6">
                <div class="flex gap-1 items-cenetr justify-between flex-wrap">
                    <div class="flex flex-wrap gap-3">
                        <!-- Save/Apply Button -->
                        <v-btn variant="flat" color="primary" height="48" class="px-7 font-semibold text-base"
                            prepend-icon="mdi-plus-circle-outline" @click="openCreateUnit">
                            اضف جديد
                        </v-btn>

                        <!-- Close/Cancel Button -->
                        <v-btn variant="flat" color="primary-50" height="48"
                            class="px-7 font-semibold text-base text-primary-700">
                            <template #prepend>
                                <span v-html="editIcon"></span>
                            </template>
                            تعديل
                        </v-btn>

                        <!-- Delete Button - only visible when editing -->
                        <v-btn variant="flat" color="error-50" height="48"
                            class="px-7 font-semibold text-base text-error-700">
                            <template #prepend>
                                <span v-html="deleteIcon"></span>
                            </template>
                            حذف
                        </v-btn>

                    </div>

                    <div class="flex flex-wrap gap-3">
                        <!-- Export Button -->
                        <v-btn variant="outlined" color="gray-700" height="48"
                            class="px-7 font-semibold text-base bg-white border-gray-300" prepend-icon="mdi-upload">
                            تصدير
                        </v-btn>

                        <!-- Columns Button -->
                        <v-btn variant="flat" color="primary-50" height="48"
                            class="px-7 font-semibold text-base text-primary-700"
                            prepend-icon="mdi-plus-circle-outline">
                            الأعمدة
                        </v-btn>

                    </div>
                </div>
                <!-- Tax Table -->
                <DataTable title="الوحدات" :headers="taxTableHeaders" :items="taxTableItems" show-actions class="mt-6"
                    @edit="handleEditTax" @delete="handleDeleteTax" />

                <UnitFormDialog v-model="showUnitDialog" :unit="editingUnit" @save="handleSaveUnit" />
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
