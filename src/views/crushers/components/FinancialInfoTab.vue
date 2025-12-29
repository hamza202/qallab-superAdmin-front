<script setup lang="ts">
import { ref } from 'vue';

interface BankAccount {
  id: number | null;
  bank_id: number;
  bank_branch: string;
  iban: string;
  account_number: string;
  is_active: boolean;
}

interface Props {
  bankAccounts?: BankAccount[];
  bankItems: Array<{ title: string; value: number }>;
  debitLimit?: string;
  creditLimit?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: { bankAccounts: BankAccount[]; debitLimit?: string; creditLimit?: string }];
}>();

const bankAccounts = ref<BankAccount[]>(props.bankAccounts || []);
const debitLimit = ref(props.debitLimit || '');
const creditLimit = ref(props.creditLimit || '');

const addAccount = () => {
  bankAccounts.value.push({
    id: null,
    bank_id: 0,
    bank_branch: '',
    iban: '',
    account_number: '',
    is_active: true,
  });
  emitUpdate();
};

const deleteAccount = (index: number) => {
  bankAccounts.value.splice(index, 1);
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:formData', { 
    bankAccounts: bankAccounts.value,
    debitLimit: debitLimit.value,
    creditLimit: creditLimit.value
  });
};

const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const addIcon = `<svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 17V11M15 14H21M21 6H1M21 8V4.2C21 3.0799 21 2.51984 20.782 2.09202C20.5903 1.7157 20.2843 1.40974 19.908 1.21799C19.4802 1 18.9201 1 17.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.7157 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V11.8C1 12.9201 1 13.4802 1.21799 13.908C1.40973 14.2843 1.71569 14.5903 2.09202 14.782C2.51984 15 3.0799 15 4.2 15H11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <div class="mb-6 bg-gray-50 -mx-6">
    <!-- Credit and Debt Limits -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pt-6 pb-4">
      <TextInput v-model="creditLimit" @blur="emitUpdate"
        label="الحد الأعلى للائتمان" placeholder="ادخل الحد">
        <template #prepend-inner>
          <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
        </template>
      </TextInput>
      <TextInput v-model="debitLimit" @blur="emitUpdate"
        label="الحد الأعلى للدين" placeholder="ادخل الحد">
        <template #prepend-inner>
          <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
        </template>
      </TextInput>
    </div>

    <div class="flex justify-between items-center mb-4 border-y border-gray-200 px-6 py-2">
      <h2 class="text-lg font-bold text-primary-900">الحسابات البنكية</h2>
      <v-btn variant="flat" color="primary" height="40" class="font-bold px-5" @click="addAccount">
        <template #prepend>
          <span v-html="addIcon"></span>
        </template>
        أضف حساب بنكي
      </v-btn>
    </div>

    <!-- Bank Accounts Table with Editable Inputs -->
    <v-table v-if="bankAccounts.length > 0" class="bg-white rounded-none">
      <thead>
        <tr class="bg-gray-100">
          <th class="text-right font-semibold text-gray-700 py-3 px-4">اسم البنك</th>
          <th class="text-right font-semibold text-gray-700 py-3 px-4">فرع البنك</th>
          <th class="text-right font-semibold text-gray-700 py-3 px-4">الآيبان/IBAN</th>
          <th class="text-right font-semibold text-gray-700 py-3 px-4">رقم الحساب البنكي</th>
          <th class="text-right font-semibold text-gray-700 py-3 px-4">الحالة</th>
          <th class="text-right font-semibold text-gray-700 py-3 px-4">الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in bankAccounts" :key="index" class="border-b border-gray-200">
          <td class="py-3 px-4">
            <SelectInput v-model="account.bank_id" density="compact" variant="outlined" hide-details
              placeholder="اسم البنك" :items="bankItems" @update:model-value="emitUpdate" />
          </td>
          <td class="py-3 px-4">
            <TextInput v-model="account.bank_branch" density="compact" variant="outlined" hide-details
              placeholder="فرع البنك" @blur="emitUpdate" />
          </td>
          <td class="py-3 px-4">
            <TextInput v-model="account.iban" density="compact" variant="outlined" hide-details
              placeholder="الآيبان/IBAN" @blur="emitUpdate">
              <template #append-inner>
                <v-icon size="small" color="gray">mdi-help-circle-outline</v-icon>
              </template>
            </TextInput>
          </td>
          <td class="py-3 px-4">
            <TextInput v-model="account.account_number" density="compact" variant="outlined" hide-details
              placeholder="رقم الحساب البنكي" @blur="emitUpdate" />
          </td>
          <td class="py-3 px-4">
            <v-switch v-model="account.is_active" @update:model-value="emitUpdate" hide-details inset density="compact"
              color="primary" />
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <v-btn icon size="small" variant="text" @click="deleteAccount(index)">
                <span v-html="trashIcon"></span>
              </v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div v-else class="text-center py-8 text-gray-500">
      لا توجد حسابات بنكية. انقر على "أضف حساب بنكي" لإضافة حساب جديد.
    </div>
  </div>
</template>
