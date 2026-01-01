<script setup lang="ts">
import { ref } from 'vue';

interface Document {
  id: number;
  name: string;
  type: string;
  file: File[] | null;
  date: string;
}

interface Props {
  documents?: Document[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [data: { documents: Document[] }];
}>();

const documents = ref<Document[]>(props.documents || []);
const documentName = ref("");
const documentType = ref<string | null>(null);
const documentFile = ref<File[] | null>(null);

const documentTypeItems = [
  { title: 'تصريح', value: 'export' },
  { title: 'ترخيص كسارة', value: 'license' }
];

const addDocument = () => {
  if (!documentName.value || !documentType.value) {
    return;
  }
  
  documents.value.push({
    id: Date.now(),
    name: documentName.value,
    type: documentType.value,
    file: documentFile.value,
    date: new Date().toLocaleDateString('ar-SA'),
  });
  
  documentName.value = "";
  documentType.value = null;
  documentFile.value = null;
  
  emitUpdate();
};

const removeDocument = (id: number) => {
  documents.value = documents.value.filter(doc => doc.id !== id);
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:formData', { documents: documents.value });
};

const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const eyeIcon = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.25781 7C1.25781 7 4.25781 1 10.2578 1C16.2578 1 19.2578 7 19.2578 7C19.2578 7 16.2578 13 10.2578 13C4.25781 13 1.25781 7 1.25781 7Z" stroke="#175CD3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.2578 9.5C11.6385 9.5 12.7578 8.38071 12.7578 7C12.7578 5.61929 11.6385 4.5 10.2578 4.5C8.87709 4.5 7.75781 5.61929 7.75781 7C7.75781 8.38071 8.87709 9.5 10.2578 9.5Z" stroke="#175CD3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
  <div class="mb-6 bg-gray-50 rounded-lg p-6">
    <h2 class="text-lg font-bold text-primary-900 mb-4">المستندات</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <TextInput v-model="documentName" label="اسم الملف" placeholder="ادخل الاسم" />
      <SelectWithIconInput v-model="documentType" label="نوع الملف" placeholder="اختر" :items="documentTypeItems" />
      <FileUploadInput v-model="documentFile" label="ارفق ملف" hint="Click to upload or drag and drop" />
    </div>

    <v-btn variant="flat" color="primary" @click="addDocument" class="mb-6">
      إضافة
    </v-btn>

    <div v-if="documents.length > 0" class="mt-6">
      <v-table class="bg-white rounded-lg">
        <thead>
          <tr class="bg-gray-100">
            <th class="text-right font-semibold text-gray-700 py-3 px-4">اسم المرفق</th>
            <th class="text-right font-semibold text-gray-700 py-3 px-4">تاريخ المرفق</th>
            <th class="text-right font-semibold text-gray-700 py-3 px-4">نوع المرفق</th>
            <th class="text-right font-semibold text-gray-700 py-3 px-4">الملف</th>
            <th class="text-right font-semibold text-gray-700 py-3 px-4">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in documents" :key="doc.id" class="border-b border-gray-200">
            <td class="py-3 px-4">{{ doc.name }}</td>
            <td class="py-3 px-4">{{ doc.date }}</td>
            <td class="py-3 px-4">{{ doc.type }}</td>
            <td class="py-3 px-4">
              <v-btn size="small" variant="text" color="primary">
                اسم المرفق<br>200 KB - 100% uploaded
              </v-btn>
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <v-btn icon size="small" variant="text" @click="removeDocument(doc.id)">
                  <span v-html="trashIcon"></span>
                </v-btn>
                <v-btn icon size="small" variant="text">
                  <span v-html="editIcon"></span>
                </v-btn>
                <v-btn icon size="small" variant="text">
                  <span v-html="eyeIcon"></span>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
