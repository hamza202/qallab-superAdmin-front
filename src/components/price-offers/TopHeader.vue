<template>
    <div
        class="bg-primary-500 flex flex-wrap justify-between items-center gap-3 text-white rounded-3xl -mt-6 px-6 py-12">
        <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
                <div class="w-[52px] h-[52px] flex items-center justify-center">
                    <span class="w-[37px] h-[44px]" v-html="props.icon"></span>
                </div>
                <div>
                    <h1 class="text-lg font-bold">{{ t(props.titleKey) }}</h1>
                    <p class="text-sm">{{ t(props.descriptionKey) }}</p>
                </div>
            </div>
        </div>


        <slot name="code">
            <div class="flex items-center lg:gap-3 gap-2" v-if="code">
                <!-- Label -->
                <span class="text-sm font-semibold text-white">{{ codeLabel }}</span>
                <!-- Code Badge -->
                <div
                    class="flex items-center gap-2 px-2.5 py-1.5 bg-primary-100 border border-primary-300 rounded shadow-xs">
                    <ButtonWithIcon @click="copyCode" icon-only :icon="fileIcon" color="transparent" size="x-small"
                        class="!py-0" height="30" />

                    <span class="font-bold text-primary-800 dir-ltr">
                        {{ code }}
                    </span>
                </div>
            </div>

        </slot>
        <slot name="actions">
            <ButtonWithIcon v-if="props.showAction && props.actionLabel" color="primary-50"
                class="!text-primary-900 font-bold" :prepend-icon="props.actionIcon" @click="onAction"
                :label="props.actionLabel" />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { fileIcon } from '@/components/icons/priceOffersIcons'
const { t } = useI18n();

interface Props {
    icon: string;
    titleKey: string;
    descriptionKey: string;
    actionLabel?: string;
    actionIcon?: string;
    codeLabel?: string;
    codeIcon?: string;
    code?: string;
    showAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    actionLabel: undefined,
    actionIcon: undefined,
    showAction: true,
    codeLabel: 'كود الطلب',
    code: '#000'
});

const emit = defineEmits<{
    (e: 'action'): void;
}>();

const onAction = () => {
    emit('action');
};

// Copy product code function
const copyCode = async () => {
    try {
        await navigator.clipboard.writeText(props.code || '');
        toast.success("تم نسخ الكود بنجاح");
    } catch (err) {
        console.error("Failed to copy:", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = props.code || '';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("تم نسخ الكود بنجاح");
    }
};

</script>