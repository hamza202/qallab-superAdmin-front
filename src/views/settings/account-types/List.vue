<script setup lang="ts">
import { ref } from "vue";
import AccountTypeFormDialog from "@/views/settings/account-types/components/AccountTypeFormDialog.vue";

const accountTypesIcon = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8498 26H36.4835C37.6257 26 38.611 25.9999 39.4226 26.0662C40.2791 26.1362 41.1311 26.2907 41.9509 26.7085C43.174 27.3316 44.1684 28.326 44.7915 29.5491C45.2093 30.3689 45.3638 31.2209 45.4338 32.0774C45.5001 32.889 45.5 33.8743 45.5 35.0164V36.4836C45.5 37.6257 45.5001 38.611 45.4338 39.4226C45.3638 40.2791 45.2093 41.1311 44.7915 41.9509C44.1684 43.174 43.174 44.1684 41.9509 44.7915C41.1311 45.2093 40.2791 45.3638 39.4226 45.4338C38.611 45.5001 37.6256 45.5 36.4835 45.5H32.8499C31.7077 45.5 30.7224 45.5001 29.9108 45.4338C29.0542 45.3638 28.2022 45.2093 27.3824 44.7915C26.1593 44.1684 25.165 43.174 24.5418 41.9509C24.1241 41.1311 23.9696 40.2791 23.8996 39.4226C23.8333 38.611 23.8333 37.6257 23.8333 36.4835V35.0165C23.8333 33.8743 23.8333 32.889 23.8996 32.0774C23.9696 31.2209 24.1241 30.3689 24.5418 29.5491C25.165 28.326 26.1593 27.3316 27.3824 26.7085C28.2022 26.2907 29.0542 26.1362 29.9108 26.0662C30.7223 25.9999 31.7077 26 32.8498 26ZM30.2636 30.3852C29.675 30.4333 29.4568 30.5149 29.3497 30.5695C28.942 30.7772 28.6105 31.1087 28.4028 31.5164C28.3482 31.6235 28.2666 31.8417 28.2185 32.4303C28.1684 33.0442 28.1667 33.8508 28.1667 35.1V36.4C28.1667 37.6492 28.1684 38.4558 28.2185 39.0697C28.2666 39.6583 28.3482 39.8765 28.4028 39.9836C28.6105 40.3913 28.942 40.7228 29.3497 40.9305C29.4568 40.9851 29.675 41.0667 30.2636 41.1148C30.8775 41.165 31.6841 41.1667 32.9333 41.1667H36.4C37.6492 41.1667 38.4558 41.165 39.0697 41.1148C39.6583 41.0667 39.8765 40.9851 39.9836 40.9305C40.3913 40.7228 40.7228 40.3913 40.9305 39.9836C40.9851 39.8765 41.0667 39.6583 41.1148 39.0697C41.165 38.4558 41.1667 37.6492 41.1667 36.4V35.1C41.1667 33.8508 41.165 33.0442 41.1148 32.4303C41.0667 31.8417 40.9851 31.6235 40.9305 31.5164C40.7228 31.1087 40.3913 30.7772 39.9836 30.5695C39.8765 30.5149 39.6583 30.4333 39.0697 30.3852C38.4558 30.335 37.6492 30.3333 36.4 30.3333H32.9333C31.6841 30.3333 30.8775 30.335 30.2636 30.3852Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9016 6.49983C13.0767 6.49918 12.3664 6.49861 11.7319 6.62483C9.15341 7.13772 7.13778 9.15335 6.62489 11.7318C6.49867 12.3664 6.49924 13.0767 6.49989 13.9015L6.49999 14.0833L6.49989 14.265C6.49924 15.0899 6.49867 15.8002 6.62489 16.4347C7.13778 19.0132 9.15341 21.0288 11.7319 21.5417C12.3664 21.6679 13.0767 21.6673 13.9016 21.6667H38.0984C38.9233 21.6673 39.6336 21.6679 40.2681 21.5417C42.8466 21.0288 44.8622 19.0132 45.3751 16.4347C45.5013 15.8002 45.5007 15.0899 45.5001 14.2651L45.5 14.0833L45.5001 13.9015C45.5007 13.0767 45.5013 12.3663 45.3751 11.7318C44.8622 9.15335 42.8466 7.13772 40.2681 6.62483C39.6336 6.49861 38.9233 6.49918 38.0984 6.49983H13.9016ZM12.5773 10.8749C12.7338 10.8438 12.9727 10.8333 14.0833 10.8333H37.9167C39.0273 10.8333 39.2662 10.8438 39.4227 10.8749C40.2822 11.0459 40.9541 11.7177 41.125 12.5772C41.1562 12.7338 41.1667 12.9727 41.1667 14.0833C41.1667 15.1939 41.1562 15.4328 41.125 15.5893C40.9541 16.4488 40.2822 17.1207 39.4227 17.2916C39.2662 17.3228 39.0273 17.3333 37.9167 17.3333H14.0833C12.9727 17.3333 12.7338 17.3228 12.5773 17.2916C11.7178 17.1207 11.0459 16.4488 10.875 15.5893C10.8438 15.4328 10.8333 15.1939 10.8333 14.0833C10.8333 12.9727 10.8438 12.7338 10.875 12.5772C11.0459 11.7177 11.7178 11.0459 12.5773 10.8749Z" fill="#1570EF"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13 26C9.41015 26 6.5 28.9102 6.5 32.5V39C6.5 42.5899 9.41015 45.5 13 45.5C16.5899 45.5 19.5 42.5899 19.5 39V32.5C19.5 28.9102 16.5899 26 13 26ZM10.8333 32.5C10.8333 31.3034 11.8034 30.3333 13 30.3333C14.1966 30.3333 15.1667 31.3034 15.1667 32.5V39C15.1667 40.1966 14.1966 41.1667 13 41.1667C11.8034 41.1667 10.8333 40.1966 10.8333 39V32.5Z" fill="#1570EF"/>
</svg>`;

const accountTypesTableHeaders = [
  { key: "id", title: "#", width: "60px" },
  { key: "name", title: "الاسم", width: "200px" },
  { key: "role", title: "الدور", width: "160px" },
  { key: "createdAt", title: "تاريخ الإنشاء", width: "160px" },
  { key: "status", title: "الحالة", width: "120px" },
];

const accountTypesTableItems = ref([
  {
    id: 1,
    name: "اسم المنتج",
    nameEn: "Product Name",
    role: "مدير",
    createdAt: "12/06/2025",
    status: true,
  },
  {
    id: 2,
    name: "اسم المنتج",
    nameEn: "Product Name",
    role: "محاسب",
    createdAt: "12/06/2025",
    status: false,
  },
  {
    id: 3,
    name: "اسم المنتج",
    nameEn: "Product Name",
    role: "موظف",
    createdAt: "12/06/2025",
    status: true,
  },
]);

const showAccountTypeDialog = ref(false);
const editingAccountType = ref<any | null>(null);

const openCreateAccountType = () => {
  editingAccountType.value = null;
  showAccountTypeDialog.value = true;
};

const handleEditAccountType = (item: any) => {
  editingAccountType.value = {
    id: item.id,
    nameAr: item.name,
    nameEn: item.nameEn,
    role: item.role ?? "",
    description: item.description ?? "",
    status: typeof item.status === "boolean" ? item.status : true,
  };

  showAccountTypeDialog.value = true;
};

const handleDeleteAccountType = (item: any) => {
  accountTypesTableItems.value = accountTypesTableItems.value.filter((t) => t.id !== item.id);
};

const handleSaveAccountType = (payload: any) => {
  if (editingAccountType.value && editingAccountType.value.id) {
    const index = accountTypesTableItems.value.findIndex((t) => t.id === editingAccountType.value.id);
    if (index !== -1) {
      accountTypesTableItems.value[index] = {
        ...accountTypesTableItems.value[index],
        name: payload.nameAr,
        nameEn: payload.nameEn,
        role: payload.role,
        description: payload.description,
        status: payload.status,
      };
    }
  } else {
    const nextId = accountTypesTableItems.value.length
      ? Math.max(...accountTypesTableItems.value.map((t) => t.id)) + 1
      : 1;

    accountTypesTableItems.value.push({
      id: nextId,
      name: payload.nameAr,
      nameEn: payload.nameEn,
      role: payload.role,
      description: payload.description,
      createdAt: new Date().toLocaleDateString("ar-EG"),
      status: payload.status,
    });
  }

  editingAccountType.value = null;
  showAccountTypeDialog.value = false;
};
</script>

<template>
  <default-layout>
    <div class="account-types-page">
      <PageHeader
        :icon="accountTypesIcon"
        title-key="pages.accountTypes.title"
        description-key="pages.accountTypes.description"
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
              @click="openCreateAccountType"
            >
              اضف جديد
            </v-btn>
          </div>
        </div>

        <DataTable
          title="انواع الحسابات"
          :headers="accountTypesTableHeaders"
          :items="accountTypesTableItems"
          show-actions
          show-checkbox
          class="mt-4"
          @edit="handleEditAccountType"
          @delete="handleDeleteAccountType"
        />

        <AccountTypeFormDialog
          v-model="showAccountTypeDialog"
          :account-type="editingAccountType"
          @save="handleSaveAccountType"
        />
      </div>
    </div>
  </default-layout>
</template>

<style scoped></style>
