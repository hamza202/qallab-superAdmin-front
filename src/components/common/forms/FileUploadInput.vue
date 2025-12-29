<script setup lang="ts">
import { ref, computed } from "vue";

interface FileUploadInputProps {
    modelValue: File[] | null;
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
}

const props = withDefaults(defineProps<FileUploadInputProps>(), {
    accept: "image/png, image/jpeg, image/gif",
    multiple: true,
    maxSize: 5,
    innerLabel: 'أرفق صورة',
    maxFiles: 4,
    disabled: false,
    labelClass: "",
    hint: "PNG, JPG or GIF (max. 400x400px)",
    layout: 'default',
});

const isHorizontalLayout = computed(() => props.layout === 'horizontal');

const emit = defineEmits<{
    (e: "update:modelValue", value: File[] | null): void;
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const previewUrls = computed(() => {
    if (!props.modelValue || props.modelValue.length === 0) return [];
    return props.modelValue.map((file) => URL.createObjectURL(file));
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

    const currentFiles = props.modelValue || [];
    const newFiles = [...currentFiles, ...validFiles].slice(0, props.maxFiles);
    emit("update:modelValue", newFiles);
};

const removeFile = (index: number) => {
    if (!props.modelValue) return;
    const newFiles = [...props.modelValue];
    newFiles.splice(index, 1);
    emit("update:modelValue", newFiles.length > 0 ? newFiles : null);
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
                            أرفق صورة
                        </button>
                    </div>
                    <p class="font-inter font-normal text-xs leading-[18px] text-gray-500 text-center">{{ hint }}</p>
                </div>
            </div>
            <!-- Preview Images (Left Side) -->
            <div v-if="previewUrls.length > 0" class="flex flex-row gap-3 flex-wrap flex-1 md:col-span-2">
                <div v-for="(url, index) in previewUrls" :key="index"
                    class="relative w-[137px] h-28 rounded overflow-hidden">
                    <img :src="url" alt="Preview" class="w-full h-full object-cover rounded" />
                    <button type="button"
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
                            {{ innerLabel }}
                        </button>
                    </div>

                    <!-- Hint -->
                    <p class="font-inter font-normal text-xs leading-[18px] text-gray-500 text-center">{{ hint }}</p>
                </div>
            </div>

            <!-- Preview Images -->
            <div v-if="previewUrls.length > 0" class="flex gap-3 mt-4 flex-wrap">
                <div v-for="(url, index) in previewUrls" :key="index" class="relative w-[137px] h-28">
                    <img :src="url" alt="Preview" class="w-full h-full object-cover rounded" />
                    <button type="button"
                        class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center p-2 bg-gray-50 border border-solid border-gray-300 rounded shadow-sm cursor-pointer transition-all duration-200 hover:bg-red-100 hover:border-red-300"
                        @click.stop="removeFile(index)">
                        <span v-html="trashIcon"></span>
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>
