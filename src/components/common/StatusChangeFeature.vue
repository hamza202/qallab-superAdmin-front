<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { useNotification } from '@/composables/useNotification';
import { changeStatusIcon } from '@/components/icons/priceOffersIcons';
import StatusChangeDialog from '@/components/common/StatusChangeDialog.vue';

/** Option from full-document-workflow API (allowed_next_statuses / allowed_rollback_statuses) */
interface WorkflowStatusOption {
  id: number;
  name: string;
  color?: string;
}

/** Item interface - the item must have these properties for status change to work */
interface StatusChangeItem {
  uuid: string;
  id?: string | number;
  doc_id?: string | number;
  status_id: number;
  [key: string]: unknown;
}

interface Props {
  modelValue: boolean;
  item: StatusChangeItem | null;
  changeStatusUrl: string;
  title?: string;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'تغيير الحالة',
  message: 'تغيير الحالة:',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
  error: [message: string];
}>();

const api = useApi();
const { success, error } = useNotification();

// Internal state
const selectedStatus = ref<number | null>(null);
const statusTransitionOptions = ref<{ title: string; value: number }[]>([]);
const statusTransitionLoading = ref(false);
const submitting = ref(false);

// Two-way binding for dialog visibility
const internalOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Fetch status transitions when dialog opens with a valid item
watch(
  [() => props.modelValue, () => props.item],
  async ([open, item]) => {
    if (open && item) {
      await fetchStatusTransitions(item);
    } else if (!open) {
      // Reset state when dialog closes
      selectedStatus.value = null;
      statusTransitionOptions.value = [];
    }
  },
  { immediate: true }
);

const fetchStatusTransitions = async (item: StatusChangeItem) => {
  selectedStatus.value = null;
  statusTransitionOptions.value = [];
  statusTransitionLoading.value = true;

  const docId = item.doc_id ?? item.id ?? item.uuid;

  try {
    const res = await api.get('/doc-status-transitions/full-document-workflow', {
      params: { doc_id: docId, current_status_id: item.status_id },
    });

    // API: { data: { allowed_next_statuses: [{ id, name, color }], ... } } or sometimes inner data is res.data directly
    const raw = res.data as Record<string, unknown>;
    const payload = (raw?.data as Record<string, unknown> | undefined) ?? raw;
    const next = (payload?.allowed_next_statuses as WorkflowStatusOption[] | undefined) ?? [];
    const rollback = (payload?.allowed_rollback_statuses as WorkflowStatusOption[] | undefined) ?? [];
    const all = [...next, ...rollback];

    statusTransitionOptions.value = all.map((s) => ({
      title: s.name ?? String(s.id),
      value: s.id,
    }));
  } catch (err: any) {
    console.error('Error fetching status transitions:', err);
    const errorMessage = err?.response?.data?.message || 'فشل تحميل الحالات المتاحة';
    error(errorMessage);
    emit('error', errorMessage);
  } finally {
    statusTransitionLoading.value = false;
  }
};

const handleStatusChange = async (convertedStatusId: any) => {
  if (!props.item || !convertedStatusId) {
    internalOpen.value = false;
    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();
    const docId = props.item.doc_id ?? props.item.id ?? props.item.uuid;
    formData.append('doc_id', String(docId));
    formData.append('current_status_id', String(props.item.status_id));
    formData.append('converted_status_id', String(convertedStatusId));

    await api.post(props.changeStatusUrl, formData);
    success('تم تغيير الحالة بنجاح');
    emit('success');
  } catch (err: any) {
    console.error('Error changing status:', err);
    const errorMessage = err?.response?.data?.message || 'فشل تغيير الحالة';
    error(errorMessage);
    emit('error', errorMessage);
  } finally {
    submitting.value = false;
    internalOpen.value = false;
    selectedStatus.value = null;
  }
};
</script>

<template>
  <StatusChangeDialog
    v-model="internalOpen"
    v-model:selectValue="selectedStatus"
    :title="title"
    :message="message"
    :show-select="true"
    :select-items="statusTransitionOptions"
    :loading="statusTransitionLoading || submitting"
    :dialog-icon="changeStatusIcon"
    @confirm="handleStatusChange"
  />
</template>
