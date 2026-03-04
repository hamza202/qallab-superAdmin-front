<script setup lang="ts">
import { ref } from "vue";
import { pdfIcon, excelIcon, imgIcon, wordIcon, deleteIcon } from '@/components/icons/globalIcons';

interface DocumentUploadInputProps {
    modelValue: (File | string)[] | null;
    label?: string;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    maxFiles?: number;
    disabled?: boolean;
    hint?: string;
}

const props = withDefaults(defineProps<DocumentUploadInputProps>(), {
    accept: ".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/gif,image/jpg",
    multiple: true,
    maxSize: 10,
    maxFiles: 5,
    disabled: false,
    hint: "PNG, JPG, PDF, XLS",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: (File | string)[] | null): void;
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!props.disabled) {
        isDragging.value = true;
    }
};

const handleDragLeave = () => {
    isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;
    if (props.disabled) return;
    
    const files = e.dataTransfer?.files;
    if (files) {
        handleFiles(Array.from(files));
    }
};

const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
        handleFiles(Array.from(target.files));
    }
    // Reset file input so the same file can be selected again if removed
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
        // Validate by extension or mime type
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif'];
        const isValidType = ext && validExtensions.includes(ext);
        
        const isValidSize = file.size <= props.maxSize * 1024 * 1024;
        return isValidType && isValidSize;
    });

    const currentFiles = props.modelValue || [];
    const newFiles = props.multiple 
        ? [...currentFiles, ...validFiles].slice(0, props.maxFiles)
        : validFiles.slice(0, 1);
        
    emit("update:modelValue", newFiles.length > 0 ? newFiles : null);
};

const removeFile = (index: number) => {
    if (!props.modelValue) return;
    const newFiles = [...props.modelValue];
    newFiles.splice(index, 1);
    emit("update:modelValue", newFiles.length > 0 ? newFiles : null);
};

const triggerFileInput = () => {
    if (!props.disabled) {
        fileInput.value?.click();
    }
};

const formatSize = (bytes: number | string | undefined) => {
    if (bytes === undefined || typeof bytes === 'string') return ''; // Strings don't have local size
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileName = (file: File | string) => {
    if (typeof file === 'string') {
        return file.split('/').pop() || 'ملف مرفق';
    }
    return file.name;
};

const getFileIcon = (fileName: File | string) => {
    const ext = getFileName(fileName).split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return pdfIcon;
    if (['doc', 'docx'].includes(ext)) return wordIcon;
    if (['xls', 'xlsx'].includes(ext)) return excelIcon;
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return imgIcon;
    return imgIcon; // Default fallback
};

// Custom upload icon matching the user's design reference
const uploadCloudIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 16L12 11M12 11L17 16M12 11V21M21 15C21.0553 14.1207 20.8436 13.242 20.3906 12.4716C19.9377 11.7011 19.2635 11.0717 18.45 10.66C18.2526 9.07639 17.4727 7.63588 16.2415 6.58196C15.0104 5.52803 13.4055 4.92383 11.75 4.86996C10.0945 4.81609 8.48784 5.31599 7.19946 6.28445C5.91109 7.25291 5.02013 8.63102 4.68 10.19C3.41113 10.4285 2.27457 11.1119 1.4883 12.109C0.70204 13.106 0.323537 14.3448 0.42841 15.5898C0.533282 16.8349 1.11364 17.9972 2.05269 18.8524C2.99175 19.7076 4.22329 20.1963 5.5 20.21H7" stroke="#367AF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
</script>

<template>
    <div class="mb-4">
        <label v-if="label" class="qallab-label mb-2 block">
            {{ label }}
        </label>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
            
            <!-- Upload Button (Put first to appear on the right side in RTL context) -->
            <div v-if="!modelValue || modelValue.length < maxFiles"
                 class="flex flex-col items-center justify-center p-5 border border-dashed border-blue-300 rounded-xl bg-white cursor-pointer w-full hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                 :class="{ 'opacity-50 pointer-events-none': disabled, 'border-solid border-blue-500 bg-blue-50': isDragging }"
                 @click="triggerFileInput" @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
                <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" class="hidden" @change="handleFileSelect" />
                
                <div class="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full mb-3">
                    <span v-html="uploadCloudIcon"></span>
                </div>
                <p class="text-blue-600 font-bold text-sm mb-1">أرفق ملف</p>
                <p class="text-xs text-gray-500">{{ hint }}</p>
            </div>

            <!-- Upload Cards/files (Using dir="ltr" to properly align File Icon (left) -> Text -> Delete Icon (right)) -->
            <div v-for="(file, index) in modelValue" :key="index" dir="ltr"
                 class="flex items-center gap-4 p-4 border border-solid border-gray-200 rounded-xl bg-white w-full shadow-sm hover:border-blue-300 transition-colors">
                <!-- File Icon (Left) -->
                <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full" v-html="getFileIcon(file)">
                </div>
                
                <!-- File Info (Middle) -->
                <div class="flex-1 min-w-0 flex flex-col justify-center text-left">
                    <p class="text-sm font-semibold text-gray-800 truncate" :title="getFileName(file)">{{ getFileName(file) }}</p>
                    <p class="text-xs text-gray-500 mt-1" v-if="typeof file !== 'string'">{{ formatSize((file as File).size) }}</p>
                </div>
                
                <!-- Delete Action (Right) -->
                <button type="button" @click.stop="removeFile(index)"
                        class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer focus:outline-none">
                    <span v-html="deleteIcon"></span>
                </button>
            </div>
            
        </div>
    </div>
</template>

<style scoped>
.qallab-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
}
</style>
