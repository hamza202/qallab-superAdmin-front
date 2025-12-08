<script setup lang="ts">
import { ref, computed } from "vue";

interface FileUploadInputProps {
    modelValue: File[] | null;
    label?: string;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    maxFiles?: number;
    disabled?: boolean;
    labelClass?: string;
    hint?: string;
}

const props = withDefaults(defineProps<FileUploadInputProps>(), {
    accept: "image/png, image/jpeg, image/gif",
    multiple: true,
    maxSize: 5,
    maxFiles: 4,
    disabled: false,
    labelClass: "",
    hint: "PNG, JPG or GIF (max. 400x400px)",
});

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

        <!-- Upload Area -->
        <div
            class="file-upload-area"
            :class="{ 'is-dragging': isDragging, 'is-disabled': disabled }"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @click="triggerFileInput"
        >
            <input
                ref="fileInput"
                type="file"
                :accept="accept"
                :multiple="multiple"
                :disabled="disabled"
                class="hidden"
                @change="handleFileSelect"
            />

            <div class="upload-content">
                <!-- Upload Icon -->
                <div class="upload-icon">
                    <span v-html="uploadCloudIcon"></span>
                </div>

                <!-- Upload Text -->
                <div class="upload-text">
                    <button type="button" class="upload-button" :disabled="disabled">
                        أرفق صورة
                    </button>
                </div>

                <!-- Hint -->
                <p class="upload-hint">{{ hint }}</p>
            </div>
        </div>

        <!-- Preview Images -->
        <div v-if="previewUrls.length > 0" class="preview-container">
            <div v-for="(url, index) in previewUrls" :key="index" class="preview-item">
                <img :src="url" alt="Preview" class="preview-image" />
                <button
                    type="button"
                    class="delete-button"
                    @click.stop="removeFile(index)"
                >
                    <span v-html="trashIcon"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.file-upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 24px;
    border: 1px dashed #cdd5df;
    border-radius: 12px;
    background-color: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
}

.file-upload-area:hover {
    border-color: #84caff;
    background-color: #f5faff;
}

.file-upload-area.is-dragging {
    border-color: #1570ef;
    background-color: #eff8ff;
}

.file-upload-area.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.upload-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #d1e9ff;
    border: 6px solid #eff8ff;
    border-radius: 28px;
}

.upload-text {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
}

.upload-button {
    font-family: 'Cairo', sans-serif;
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    color: #1570ef;
    background: none;
    border: none;
    cursor: pointer;
}

.upload-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.upload-hint {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: #475467;
    text-align: center;
}

.preview-container {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
}

.preview-item {
    position: relative;
    width: 137px;
    height: 112px;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
}

.delete-button {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background-color: #f8fafc;
    border: 1px solid #cdd5df;
    border-radius: 4px;
    box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;
}

.delete-button:hover {
    background-color: #fee4e2;
    border-color: #fda29b;
}
</style>
