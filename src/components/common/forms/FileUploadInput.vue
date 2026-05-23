<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

interface FileUploadInputProps {
    modelValue: File[] | string | null;
    label?: string;
    innerLabel?: string;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    maxFiles?: number;
    disabled?: boolean;
    labelClass?: string;
    hint?: string;
    layout?: 'default' | 'horizontal';
    hideRemove?: boolean;
}

const { t } = useI18n();

const props = withDefaults(defineProps<FileUploadInputProps>(), {
    accept: "image/png, image/jpeg, image/gif",
    multiple: true,
    maxSize: 5,
    innerLabel: '',
    maxFiles: 4,
    disabled: false,
    labelClass: "",
    hint: "PNG, JPG or GIF (max. 400x400px)",
    layout: 'default',
    hideRemove: false,
});

const isHorizontalLayout = computed(() => props.layout === 'horizontal');
const resolvedInnerLabel = computed(() => props.innerLabel || t('common.uploads.attachImage'));

const emit = defineEmits<{
    (e: "update:modelValue", value: File[] | string | null): void;
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

interface PreviewItem {
    url: string;
    isPdf: boolean;
    name: string;
}

const previews = computed<PreviewItem[]>(() => {
    if (!props.modelValue) return [];

    if (typeof props.modelValue === 'string') {
        const url = props.modelValue;
        const cleanPath = url.split('?')[0];
        return [{
            url,
            isPdf: /\.pdf$/i.test(cleanPath),
            name: cleanPath.split('/').pop() || '',
        }];
    }

    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
        return props.modelValue.map((file) => ({
            url: URL.createObjectURL(file),
            isPdf: file.type === 'application/pdf' || /\.pdf$/i.test(file.name),
            name: file.name,
        }));
    }

    return [];
});


const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = true;
};

const handleDragLeave = () => {
    isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    isDragging.value = false;
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
};

const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
        const isValidType = props.accept.split(", ").some((type) => {
            const [, ext] = type.split("/");
            return file.type.includes(ext) || file.name.toLowerCase().endsWith(`.${ext}`);
        });
        const isValidSize = file.size <= props.maxSize * 1024 * 1024;
        return isValidType && isValidSize;
    });

    // If current value is a string URL, replace it with new files
    const currentFiles = (Array.isArray(props.modelValue) ? props.modelValue : []) as File[];
    const newFiles = [...currentFiles, ...validFiles].slice(0, props.maxFiles);
    emit("update:modelValue", newFiles);
};

const removeFile = (index: number) => {
    if (!props.modelValue) return;
    
    // If modelValue is a string URL, just clear it
    if (typeof props.modelValue === 'string') {
        emit("update:modelValue", null);
        return;
    }
    
    // If modelValue is File[], remove the specific file
    if (Array.isArray(props.modelValue)) {
        const newFiles = [...props.modelValue];
        newFiles.splice(index, 1);
        emit("update:modelValue", newFiles.length > 0 ? newFiles : null);
    }
};

const triggerFileInput = () => {
    fileInput.value?.click();
};

// Upload cloud icon SVG
const uploadCloudIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6.667 13.333L10 10m0 0l3.333 3.333M10 10v7.5m6.667-3.548a4.583 4.583 0 0 0-2.917-8.12.516.516 0 0 1-.444-.25 6.25 6.25 0 1 0-9.816 7.58" stroke="#1570EF" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Trash icon SVG
const trashIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.333 4.5v-.567c0-.746 0-1.12-.145-1.405a1.333 1.333 0 0 0-.583-.583c-.285-.145-.659-.145-1.405-.145H7.8c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583-.145.285-.145.659-.145 1.405V4.5m1.666 4.083v3.334m2.334-3.334v3.334M2.333 4.5h13.334m-1.667 0v9.333c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.428.218-.988.218-2.108.218H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108V4.5" stroke="#4B5565" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const pdfIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="64" viewBox="0 0 56 64"><g><path fill="#8C181A" d="M5.1,0C2.3,0,0,2.3,0,5.1v53.8C0,61.7,2.3,64,5.1,64h45.8c2.8,0,5.1-2.3,5.1-5.1V20.3L37.1,0H5.1z"/><path fill="#6B0D12" d="M56,20.4v1H43.2c0,0-6.3-1.3-6.1-6.7c0,0,0.2,5.7,6,5.7H56z"/><path opacity="0.5" fill="#FFFFFF" d="M37.1,0v14.6c0,1.7,1.1,5.8,6.1,5.8H56L37.1,0z"/></g><path fill="#FFFFFF" d="M14.9,49h-3.3v4.1c0,0.4-0.3,0.7-0.8,0.7c-0.4,0-0.7-0.3-0.7-0.7V42.9c0-0.6,0.5-1.1,1.1-1.1h3.7c2.4,0,3.8,1.7,3.8,3.6C18.7,47.4,17.3,49,14.9,49z M14.8,43.1h-3.2v4.6h3.2c1.4,0,2.4-0.9,2.4-2.3C17.2,44,16.2,43.1,14.8,43.1z M25.2,53.8h-3c-0.6,0-1.1-0.5-1.1-1.1v-9.8c0-0.6,0.5-1.1,1.1-1.1h3c3.7,0,6.2,2.6,6.2,6C31.4,51.2,29,53.8,25.2,53.8z M25.2,43.1h-2.6v9.3h2.6c2.9,0,4.6-2.1,4.6-4.7C29.9,45.2,28.2,43.1,25.2,43.1z M41.5,43.1h-5.8V47h5.7c0.4,0,0.6,0.3,0.6,0.7s-0.3,0.6-0.6,0.6h-5.7v4.8c0,0.4-0.3,0.7-0.8,0.7c-0.4,0-0.7-0.3-0.7-0.7V42.9c0-0.6,0.5-1.1,1.1-1.1h6.2c0.4,0,0.6,0.3,0.6,0.7C42.2,42.8,41.9,43.1,41.5,43.1z"/></svg>`;
</script>

<template>
    <div class="mb-4">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <!-- Horizontal Layout -->
        <div v-if="isHorizontalLayout" class="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            <!-- Upload Area (Right Side) -->
            <div class="flex flex-col items-center justify-center py-4 px-6 border border-solid border-gray-300 rounded-[8px] bg-white cursor-pointer transition-all duration-200 min-w-[200px] flex-shrink-0 hover:border-blue-300 hover:bg-blue-50"
                :class="{ 'border-blue-500 bg-blue-100': isDragging, 'opacity-60 cursor-not-allowed': disabled }"
                @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" @click="triggerFileInput">
                <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" :disabled="disabled"
                    class="hidden" @change="handleFileSelect" />

                <div class="flex flex-col items-center gap-3">
                    <div
                        class="flex items-center justify-center w-10 h-10 bg-blue-200 border-[6px] border-solid border-blue-50 rounded-full">
                        <span v-html="uploadCloudIcon"></span>
                    </div>
                    <div class="flex gap-1 items-center justify-center">
                        <button type="button"
                            class="font-cairo font-bold text-sm leading-5 text-primary-600 bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            :disabled="disabled">
                            {{ resolvedInnerLabel }}
                        </button>
                    </div>
                    <p class="font-inter font-normal text-xs leading-[18px] text-gray-500 text-center">{{ hint }}</p>
                </div>
            </div>
            <!-- Preview Images (Left Side) -->
            <div v-if="previews.length > 0" class="flex flex-row gap-3 flex-wrap flex-1 md:col-span-2">
                <div v-for="(preview, index) in previews" :key="index"
                    class="relative w-[137px] h-28 rounded overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                    <a v-if="preview.isPdf" :href="preview.url" target="_blank" rel="noopener noreferrer"
                        class="flex flex-col items-center justify-center gap-1 p-2 w-full h-full text-decoration-none"
                        @click.stop>
                        <span v-html="pdfIcon" class="block w-10 h-12"></span>
                        <span class="text-[10px] text-gray-600 truncate w-full text-center">{{ preview.name }}</span>
                    </a>
                    <img v-else :src="preview.url" alt="Preview" class="w-full h-full object-cover rounded" />
                    <button v-if="!hideRemove" type="button"
                        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-2 bg-gray-50 border border-solid border-gray-300 rounded shadow-sm cursor-pointer transition-all duration-200 hover:bg-red-100 hover:border-red-300"
                        @click.stop="removeFile(index)">
                        <span v-html="trashIcon"></span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Default Layout -->
        <template v-else>
            <!-- Upload Area -->
            <div class="flex flex-col items-center py-4 px-6 border border-dashed border-gray-300 rounded-[8px] bg-white cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
                :class="{ 'border-blue-500 bg-blue-100': isDragging, 'opacity-60 cursor-not-allowed': disabled }"
                @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" @click="triggerFileInput">
                <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" :disabled="disabled"
                    class="hidden" @change="handleFileSelect" />

                <div class="flex flex-col items-center gap-3">
                    <!-- Upload Icon -->
                    <div
                        class="flex items-center justify-center w-10 h-10 bg-blue-200 border-[6px] border-solid border-blue-50 rounded-full">
                        <span v-html="uploadCloudIcon"></span>
                    </div>

                    <!-- Upload Text -->
                    <div class="flex gap-1 items-center justify-center">
                        <button type="button"
                            class="font-cairo font-bold text-sm leading-5 text-primary-600 bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            :disabled="disabled">
                            {{ resolvedInnerLabel }}
                        </button>
                    </div>

                    <!-- Hint -->
                    <p class="font-inter font-normal text-xs leading-[18px] text-gray-500 text-center">{{ hint }}</p>
                </div>
            </div>

            <!-- Preview Images -->
            <div v-if="previews.length > 0" class="flex gap-3 mt-4 flex-wrap">
                <div v-for="(preview, index) in previews" :key="index"
                    class="relative w-[137px] h-28 rounded overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                    <a v-if="preview.isPdf" :href="preview.url" target="_blank" rel="noopener noreferrer"
                        class="flex flex-col items-center justify-center gap-1 p-2 w-full h-full text-decoration-none"
                        @click.stop>
                        <span v-html="pdfIcon" class="block w-10 h-12"></span>
                        <span class="text-[10px] text-gray-600 truncate w-full text-center">{{ preview.name }}</span>
                    </a>
                    <img v-else :src="preview.url" alt="Preview" class="w-full h-full object-cover rounded" />
                    <button v-if="!hideRemove" type="button"
                        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center p-2 bg-gray-50 border border-solid border-gray-300 rounded shadow-sm cursor-pointer transition-all duration-200 hover:bg-red-100 hover:border-red-300"
                        @click.stop="removeFile(index)">
                        <span v-html="trashIcon"></span>
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>
