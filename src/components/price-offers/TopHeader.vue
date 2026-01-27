<template>
    <div
        class="bg-primary-500 flex flex-wrap justify-between items-center gap-3 text-white rounded-3xl -mt-6 px-6 py-12">
        <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
                <div class="w-[52px] h-[52px] flex items-center justify-center">
                    <span v-html="props.icon"></span>
                </div>
                <div>
                    <h1 class="text-lg font-bold">{{ t(props.titleKey) }}</h1>
                    <p class="text-sm">{{ t(props.descriptionKey) }}</p>
                </div>
            </div>
        </div>

        <slot name="actions">
            <ButtonWithIcon v-if="props.showAction && props.actionLabel" color="primary-50"
                class="!text-primary-900 font-bold" :prepend-icon="props.actionIcon" @click="onAction"
                :label="props.actionLabel" />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
    icon: string;
    titleKey: string;
    descriptionKey: string;
    actionLabel?: string;
    actionIcon?: string;
    showAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    actionLabel: undefined,
    actionIcon: undefined,
    showAction: true,
});

const emit = defineEmits<{
    (e: 'action'): void;
}>();

const onAction = () => {
    emit('action');
};
</script>