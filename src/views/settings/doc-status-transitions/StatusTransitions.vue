<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useNotification } from "@/composables/useNotification";
import { SaveDoubleIcon, fileCheckIcon } from "@/components/icons/globalIcons";
import TopHeader from "@/components/price-offers/TopHeader.vue";

const api = useApi();
const route = useRoute();
const router = useRouter();
const { success, error } = useNotification();

const formErrors = reactive<Record<string, string>>({});
const canUpdateWorkflow = ref(false)

interface TransitionForm {
    id?: number;
    status_id: string | null;
    next_status: (number)[];
    previous_status: (number)[];
    rollback_status: (number)[];
}

const formRef = ref<any>(null);
const isFormValid = ref(false);
const loadingTransitionData = ref(false);
const saving = ref(false);
const status_label = ref('')
const form = reactive<TransitionForm>({
    status_id: null,
    next_status: [],
    previous_status: [],
    rollback_status: [],
});

const systemStatuses = ref<Array<{ title: string; value: number; slug: string }>>([]);


// Computed properties to filter available statuses for each input
const availablePreviousStatuses = computed(() => {
    // Exclude current status from the list
    return systemStatuses.value.filter(status => status.value !== Number(form.status_id) && !form.next_status.includes(status.value));
});

const availableNextStatuses = computed(() => {
    const selectedInPrevious = form.previous_status || [];
    // Exclude current status and previous statuses from the list
    return systemStatuses.value.filter(status =>
        status.value !== Number(form.status_id) &&
        !selectedInPrevious.includes(status.value)
    );
});

const availableRollbackStatuses = computed(() => {
    // Only show previously selected statuses
    const selectedInPrevious = form.previous_status || [];
    const selectedInNext = form.next_status || [];
    const excludedIds = [...selectedInPrevious, ...selectedInNext];

    return systemStatuses.value.filter(status => status.value !== Number(form.status_id) && !excludedIds.includes(status.value));
});

const fetchTransitionData = async (transitionId: string) => {
    try {
        const response = await api.get(`/doc-status-transitions/${transitionId}/workflow`);
        const transition = response.data;

        canUpdateWorkflow.value = transition.actions.can_update_workflow
        form.id = transition.id;
        form.status_id = transition.status_id || null;
        form.next_status = transition.next_status || [];
        form.previous_status = transition.previous_status || [];
        form.rollback_status = transition.rollback_status || [];

    } catch (err: any) {
        console.error('Error fetching transition details:', err);
        error(err?.response?.data?.message || 'Failed to fetch transition details');
    } finally {
    }
};

const fetchSystemStatuses = async () => {
    try {
        const response = await api.get('/system-statuses/list');
        systemStatuses.value = response.data.map((status: any) => ({
            title: status.name,
            value: status.id,
            slug: status.slug || ''
        }));


    } catch (err: any) {
        console.error('Error fetching system statuses:', err);
    }
};

const resetForm = () => {
    delete form.id;
    form.status_id = '';
    form.next_status = [];
    form.previous_status = [];
    form.rollback_status = [];
};

const handleCancel = () => {
    resetForm()
    router.push('/settings/doc-status-transitions/list');
};

const handleSave = async () => {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (formRef.value && typeof formRef.value.validate === "function") {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    try {
        saving.value = true;

        const payload = {
            _method: 'PUT',
            status_id: form.status_id,
            next_status: form.next_status,
            previous_status: form.previous_status,
            rollback_status: form.rollback_status,
        };

        await api.post(`/doc-status-transitions/${form.id}/workflow`, payload);
        success('تم تحديث مسار العمل بنجاح');

        router.push('/settings/doc-status-transitions/list');
    } catch (err: any) {
        console.error('Error saving transition:', err);

        if (err?.response?.status === 422 && err?.response?.data?.errors) {
            const apiErrors = err.response.data.errors;
            Object.keys(apiErrors).forEach(key => {
                formErrors[key] = apiErrors[key][0];
            });
            error(err?.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
        } else {
            error(err?.response?.data?.message || 'Failed to save transition');
        }
    } finally {
        saving.value = false;
    }
};




onMounted(async () => {
    loadingTransitionData.value = true;
    if (route.params.id) {
        await fetchSystemStatuses();
        await fetchTransitionData(route.params.id as string);
        status_label.value = systemStatuses.value.find((status: any) => status.value === form.status_id)?.title || '';
        loadingTransitionData.value = false;
    }
});

</script>

<template>
    <default-layout>
        <div class="doc-status-transitions-form-page -mx-6">
            <!-- Page Header -->
            <TopHeader :icon="fileCheckIcon" title-key="pages.docStatusTransitions.statusTransitionsTitle"
                description-key="pages.docStatusTransitions.FormDescription" :show-action="false" />

            <!-- Loading State -->
            <div v-if="loadingTransitionData" class="flex justify-center items-center py-20">
                <v-progress-circular indeterminate color="primary" size="48" />
            </div>

            <div v-else class="p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
                    <div class="flex items-center gap-2 text-primary-600 mb-4">
                        <span class="w-[17px] h-[20px]" v-html="fileCheckIcon"></span>
                        <h2 class="text-base font-bold">معلومات الانتقال</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <!-- Document Slug (Show only in edit mode) -->
                        <TextInput disabled v-model="status_label" label="الحالية" />

                        <!-- Previous Status Selection -->
                        <MultipleSelectInput v-model="form.previous_status" clearable :items="availablePreviousStatuses"
                            label="الحالات السابقة" placeholder="اختر الحالات" :rules="[required()]"
                            :error-messages="formErrors['previous_status']"
                            @update:model-value="delete formErrors['previous_status']" />

                        <!-- Next Status Selection -->
                        <MultipleSelectInput v-model="form.next_status" clearable :items="availableNextStatuses"
                            label="الحالات التالية" placeholder="اختر الحالات" :rules="[required()]"
                            :error-messages="formErrors['next_status']"
                            @update:model-value="delete formErrors['next_status']" />

                        <!-- Rollback Status Selection -->
                        <MultipleSelectInput v-model="form.rollback_status" clearable :items="availableRollbackStatuses"
                            label="حالات التراجع" placeholder="اختر الحالات"
                            :error-messages="formErrors['rollback_status']"
                            @update:model-value="delete formErrors['rollback_status']" />
                    </div>

                    <!-- <div class="flex items-center gap-2 text-primary-600 mb-8">
                        <span class="w-[17px] h-[20px]" v-html="fileCheckIcon"></span>
                        <h2 class="text-base font-bold">حالات الانتقال</h2>
                    </div>
                    <div class="grid grid-cols-1 xl:grid-cols-2 md:px-10">
                        <div class="!bg-gray-50 rounded-3xl p-6">
                            <div class="space-y-4">
                                <div class="grid grid-cols-3 gap-4 text-center text-base font-bold text-black">
                                    <div>الحالة السابقة</div>
                                    <div>الحالة الحالية</div>
                                    <div>الحالة التالية</div>
                                </div>

                                <div
                                    class="grid grid-cols-3 gap-4 text-center bg-gray-200 rounded-3xl py-2 text-sm text-gray-700 font-semibold">
                                    <span>قيد المراجعة</span>
                                    <span>تأكيد</span>
                                    <span>مكتمل</span>
                                </div>
                                <div
                                    class="grid grid-cols-3 gap-4 text-center bg-gray-200 rounded-3xl py-2 text-sm text-gray-700 font-semibold">
                                    <span>قيد المراجعة</span>
                                    <span>تأكيد</span>
                                    <span>مكتمل</span>
                                </div>
                                <div
                                    class="grid grid-cols-3 gap-4 text-center bg-gray-200 rounded-3xl py-2 text-sm text-gray-700 font-semibold">
                                    <span>قيد المراجعة</span>
                                    <span>تأكيد</span>
                                    <span>مكتمل</span>
                                </div>
                            </div>
                        </div>
                    </div> -->

                    <!-- Action Buttons -->
                    <div class="flex justify-center gap-5 sm:mt-20 lg:flex-row flex-col">
                        <ButtonWithIcon variant="flat" color="primary" rounded="4" height="48" custom-class="min-w-56"
                            :prepend-icon="SaveDoubleIcon" label="حفظ" :loading="saving" :disabled="saving"
                            @click="handleSave" v-if="canUpdateWorkflow" />

                        <ButtonWithIcon prepend-icon="mdi-close" variant="flat" color="primary-50" rounded="4"
                            height="48" custom-class="font-semibold text-base text-primary-700 px-6 min-w-56"
                            label="إغلاق" :disabled="saving" @click="handleCancel" />
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>
