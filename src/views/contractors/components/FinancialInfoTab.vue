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
  debitLimit?: number | string | null;
  creditLimit?: number | string | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: { bankAccounts: BankAccount[]; debitLimit?: number | string | null; creditLimit?: number | string | null }];
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
</svg>`;

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
`;
</script>

<template>
  <div class="mb-6 bg-gray-50 -mx-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pt-6 pb-4">
      <TextInput v-model="debitLimit" @blur="emitUpdate"
        label="الحد الأعلى للدين" placeholder="ادخل الحد">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
            </template>
            <div>
              الحد الأقصى المسموح به للديون
            </div>
          </v-tooltip>
        </template>
      </TextInput>
      <TextInput v-model="creditLimit" @blur="emitUpdate"
        label="الحد الأعلى للائتمان" placeholder="ادخل الحد">
        <template #append-inner>
          <v-tooltip location="top" content-class="custom-tooltip">
            <template #activator="{ props: tooltipProps }">
              <ButtonWithIcon variant="text" size="small" density="compact"
                custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
            </template>
            <div>
              الحد الأقصى المسموح به للائتمان
            </div>
          </v-tooltip>
        </template>
      </TextInput>
    </div>

    <div class="flex justify-between items-center mb-4 border-y border-gray-200 px-6 py-2">
      <h2 class="text-lg font-bold text-primary-900">الحسابات البنكية</h2>
      <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
        custom-class="font-bold px-5 !text-white" :prepend-icon="addIcon"
        label="إضافة حساب" @click="addAccount" />
    </div>

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
                <v-tooltip location="top" content-class="custom-tooltip">
                  <template #activator="{ props: tooltipProps }">
                    <ButtonWithIcon variant="text" size="small" density="compact"
                      custom-class="!min-w-0 p-0" :prepend-icon="infoIcon" v-bind="tooltipProps" />
                  </template>
                  <div>
                    الرقم التعريفي الدولي للحساب البنكي
                  </div>
                </v-tooltip>
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
              <ButtonWithIcon :icon="trashIcon" icon-only size="small" variant="text"
                @click="deleteAccount(index)" />
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
