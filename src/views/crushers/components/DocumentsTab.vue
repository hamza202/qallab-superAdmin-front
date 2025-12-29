<script setup lang="ts">
import { ref } from 'vue';

interface Document {
    id: number | null;
    name: string;
    type: string;
    file: File | null;
    fileName: string;
    fileSize: string;
    date: string;
    selected?: boolean;
}

interface Props {
    documents: Document[];
    documentTypeItems: Array<{ title: string; value: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:formData': [data: { documents: Document[] }];
}>();

const documents = ref<Document[]>(props.documents || []);

const trashIcon = `<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3333 5.00033V4.33366C12.3333 3.40024 12.3333 2.93353 12.1517 2.57701C11.9919 2.2634 11.7369 2.00844 11.4233 1.84865C11.0668 1.66699 10.6001 1.66699 9.66667 1.66699H8.33333C7.39991 1.66699 6.9332 1.66699 6.57668 1.84865C6.26308 2.00844 6.00811 2.2634 5.84832 2.57701C5.66667 2.93353 5.66667 3.40024 5.66667 4.33366V5.00033M7.33333 9.58366V13.7503M10.6667 9.58366V13.7503M1.5 5.00033H16.5M14.8333 5.00033V14.3337C14.8333 15.7338 14.8333 16.4339 14.5608 16.9686C14.3212 17.439 13.9387 17.8215 13.4683 18.0612C12.9335 18.3337 12.2335 18.3337 10.8333 18.3337H7.16667C5.76654 18.3337 5.06647 18.3337 4.53169 18.0612C4.06129 17.8215 3.67883 17.439 3.43915 16.9686C3.16667 16.4339 3.16667 15.7338 3.16667 14.3337V5.00033" stroke="#B42318" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const editIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.1454 14.1197C1.18368 13.7752 1.20283 13.6029 1.25496 13.4418C1.30121 13.299 1.36656 13.163 1.44923 13.0376C1.54241 12.8963 1.66499 12.7737 1.91014 12.5286L12.9154 1.52336C13.8359 0.602889 15.3282 0.60289 16.2487 1.52336C17.1692 2.44384 17.1692 3.93622 16.2487 4.8567L5.24347 15.8619C4.99832 16.1071 4.87574 16.2297 4.73444 16.3228C4.60907 16.4055 4.47311 16.4709 4.33024 16.5171C4.1692 16.5692 3.99691 16.5884 3.65234 16.6267L0.832031 16.94L1.1454 14.1197Z" stroke="#1570EF" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const eyeIcon = `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.25781 7.00033C1.25781 7.00033 4.09115 1.33366 9.92448 1.33366C15.7578 1.33366 18.5911 7.00033 18.5911 7.00033C18.5911 7.00033 15.7578 12.667 9.92448 12.667C4.09115 12.667 1.25781 7.00033 1.25781 7.00033Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.92448 9.00033C11.0291 9.00033 11.9245 8.10489 11.9245 7.00033C11.9245 5.89576 11.0291 5.00033 9.92448 5.00033C8.81991 5.00033 7.92448 5.89576 7.92448 7.00033C7.92448 8.10489 8.81991 9.00033 9.92448 9.00033Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const documentIcon = `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3333 1.33301V5.99967C11.3333 6.46671 11.3333 6.70023 11.4239 6.87834C11.5036 7.03513 11.6314 7.16292 11.7882 7.24264C11.9663 7.33301 12.1998 7.33301 12.6668 7.33301H17.3335M11.3333 17.333H5.33333M14.6667 13.333H5.33333M17.3333 9.46835V17.9997C17.3333 19.3998 17.3333 20.0999 17.0608 20.6346C16.8212 21.105 16.4387 21.4875 15.9683 21.7271C15.4335 21.9997 14.7335 21.9997 13.3333 21.9997H6.66667C5.26654 21.9997 4.56647 21.9997 4.03169 21.7271C3.56129 21.4875 3.17883 21.105 2.93915 20.6346C2.66667 20.0999 2.66667 19.3998 2.66667 17.9997V5.99967C2.66667 4.59954 2.66667 3.89948 2.93915 3.3647C3.17883 2.8943 3.56129 2.51184 4.03169 2.27216C4.56647 1.99967 5.26654 1.99967 6.66667 1.99967H9.86501C10.5316 1.99967 10.8649 1.99967 11.1801 2.06434C11.4609 2.12185 11.7318 2.22031 11.9841 2.35634C12.2677 2.50967 12.5178 2.72969 13.018 3.16972L15.8297 5.83639C16.3297 6.27642 16.5798 6.49644 16.7331 6.78005C16.8691 7.03233 16.9676 7.30321 17.0251 7.58405C17.0898 7.89924 17.0898 8.23258 17.0898 8.89925" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const copyIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16667 12.5003C3.39067 12.5003 3.00267 12.5003 2.69733 12.3735C2.28179 12.2038 1.96302 11.8851 1.79329 11.4695C1.66667 11.1642 1.66667 10.7762 1.66667 10.0002V4.33366C1.66667 3.39975 1.66667 2.9328 1.84832 2.57628C2.00811 2.26267 2.26308 2.00771 2.57668 1.84792C2.9332 1.66626 3.40024 1.66626 4.33333 1.66626H10C10.776 1.66626 11.164 1.66626 11.4693 1.79288C11.8849 1.96261 12.2036 2.28138 12.3734 2.69692C12.5 3.00226 12.5 3.39026 12.5 4.16626M10.1667 18.3329H15.6667C16.6001 18.3329 17.0668 18.3329 17.4233 18.1513C17.7369 17.9915 17.9919 17.7365 18.1517 17.4229C18.3333 17.0664 18.3333 16.5993 18.3333 15.6663V10.1663C18.3333 9.23285 18.3333 8.76614 18.1517 8.40962C17.9919 8.09602 17.7369 7.84105 17.4233 7.68126C17.0668 7.49959 16.6001 7.49959 15.6667 7.49959H10.1667C9.23324 7.49959 8.76653 7.49959 8.41002 7.68126C8.09641 7.84105 7.84145 8.09602 7.68166 8.40962C7.5 8.76614 7.5 9.23285 7.5 10.1663V15.6663C7.5 16.5993 7.5 17.0664 7.68166 17.4229C7.84145 17.7365 8.09641 17.9915 8.41002 18.1513C8.76653 18.3329 9.23324 18.3329 10.1667 18.3329Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const documentName = ref("");
const documentType = ref<string | null>(null);
const documentFile = ref<File[] | null>(null);

const addDocument = () => {
    const firstFile = documentFile.value?.[0] || null;
    documents.value.push({
        id: Date.now(),
        name: documentName.value || 'اسم المرفوق',
        type: documentType.value || '',
        file: firstFile,
        fileName: firstFile?.name || '',
        fileSize: '200 KB',
        date: new Date().toLocaleDateString('ar-SA'),
        selected: false,
    });

    documentName.value = "";
    documentType.value = null;
    documentFile.value = null;

    emitUpdate();
};

const deleteDocument = (index: number) => {
    documents.value.splice(index, 1);
    emitUpdate();
};

const emitUpdate = () => {
    emit('update:formData', { documents: documents.value });
};

const saveIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.832 4.99967H5.4987C5.03199 4.99967 4.79863 4.99967 4.62037 4.90885C4.46357 4.82895 4.33609 4.70147 4.25619 4.54467C4.16536 4.36641 4.16536 4.13305 4.16536 3.66634V0.833008M12.4987 15.833V10.4997C12.4987 10.033 12.4987 9.79961 12.4079 9.62135C12.328 9.46455 12.2005 9.33706 12.0437 9.25717C11.8654 9.16634 11.6321 9.16634 11.1654 9.16634H5.4987C5.03199 9.16634 4.79863 9.16634 4.62037 9.25717C4.46357 9.33706 4.33609 9.46455 4.25619 9.62135C4.16536 9.79961 4.16536 10.033 4.16536 10.4997V15.833M15.832 6.10424V11.833C15.832 13.2331 15.832 13.9332 15.5595 14.468C15.3199 14.9384 14.9374 15.3208 14.467 15.5605C13.9322 15.833 13.2322 15.833 11.832 15.833H4.83203C3.4319 15.833 2.73183 15.833 2.19705 15.5605C1.72665 15.3208 1.3442 14.9384 1.10451 14.468C0.832031 13.9332 0.832031 13.2331 0.832031 11.833V4.83301C0.832031 3.43288 0.832031 2.73281 1.10451 2.19803C1.3442 1.72763 1.72665 1.34517 2.19705 1.10549C2.73183 0.833008 3.4319 0.833008 4.83203 0.833008H10.5608C10.9684 0.833008 11.1723 0.833008 11.3641 0.879058C11.5341 0.919886 11.6967 0.987226 11.8458 1.07861C12.014 1.18168 12.1582 1.3258 12.4464 1.61406L15.051 4.21863C15.3392 4.50688 15.4834 4.65101 15.5864 4.8192C15.6778 4.96832 15.7452 5.13089 15.786 5.30095C15.832 5.49277 15.832 5.69659 15.832 6.10424Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
</script>

<template>
    <div class="mb-6 bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-bold text-primary-900 mb-4">المستندات</h2>

        <!-- Form Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TextInput v-model="documentName" label="اسم الملف" placeholder="اسم الملف" />
            <SelectWithIconInput v-model="documentType" label="نوع الملف" placeholder="اختر"
                :items="documentTypeItems" />
            <FileUploadInput v-model="documentFile" :innerLabel="'أختر ملف'" label="إرفاق الملف"
                hint="لا يتجاوز حجم الملف (10 MB)" />
            <div class="flex items-end pb-4">
                <v-btn variant="flat" color="primary" height="40" class="font-bold px-8" @click="addDocument">
                    <template #prepend>
                        <span v-html="saveIcon"></span>
                    </template>
                    إضافة
                </v-btn>

            </div>


        </div>

        <!-- Table Section -->
        <v-table v-if="documents.length > 0" class="bg-white rounded-lg mt-6">
            <thead>
                <tr class="bg-gray-100">
                    <th class="text-right font-semibold text-gray-700 py-3 px-4">اسم المرفوق</th>
                    <th class="text-right font-semibold text-gray-700 py-3 px-4">تاريخ المرفوق</th>
                    <th class="text-right font-semibold text-gray-700 py-3 px-4">نوع المرفوق</th>
                    <th class="text-right font-semibold text-gray-700 py-3 px-4">الملف</th>
                    <th class="text-right font-semibold text-gray-700 py-3 px-4">الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(doc, index) in documents" :key="index" class="border-b border-gray-200">
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                            <v-checkbox v-model="doc.selected" hide-details density="compact" />
                            <span>{{ doc.name }}</span>
                        </div>
                    </td>
                    <td class="py-3 px-4">{{ doc.date }}</td>
                    <td class="py-3 px-4">{{ doc.type }}</td>
                    <td class="py-3 px-4">
                        <div class="border border-primary-200 rounded-lg p-3 bg-primary-50 flex items-center gap-2">
                            <span v-html="documentIcon"></span>
                            <div class="flex-1">
                                <div class="text-sm font-semibold text-gray-900">{{ doc.fileName || doc.name }}</div>
                                <div class="text-xs text-gray-500">{{ doc.fileSize }} - 100% uploaded</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                            <v-btn icon size="small" variant="text" color="primary">
                                <span v-html="editIcon"></span>
                            </v-btn> 
                            <v-btn icon size="small" variant="text" color="error" @click="deleteDocument(index)">
                                <span v-html="trashIcon"></span>
                            </v-btn>
                        </div>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </div>
</template>
