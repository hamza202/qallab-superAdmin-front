<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter();
const api = useApi();

interface LogisticAction {
    can_update: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_change_status: boolean;
}

interface Logistic {
    id: number;
    business_name: string;
    owner_name: string;
    buisness_number: number;
    tax_number: number;
    license_number: string;
    license_issue_date: string;
    license_expiry_date: string;
    balance: boolean;
    city: string;
    is_active: boolean | null;
    created_at: string;
    actions: LogisticAction;
}

interface TableHeader {
    key: string;
    title: string;
}

interface Pagination {
    next_cursor: string | null;
    previous_cursor: string | null;
    per_page: number;
}

interface LogisticsResponse {
    status: number;
    code: number;
    locale: string;
    message: string;
    data: Logistic[];
    pagination: Pagination;
    headers: TableHeader[];
    shownHeaders: TableHeader[];
    header_table: string;
    actions: {
        can_create: boolean;
    };
}

interface LogisticFilters {
    per_page?: number;
    cursor?: string | null;
    business_name?: string;
    owner_name?: string;
    buisness_number?: string;
    tax_number?: string;
    license_number?: string;
    city_id?: string;
    status?: string;
    license_issue_date?: string;
    license_expiry_date?: string;
    production_lines?: string;
    rock_type?: string;
    logistic_type?: string;
    max_production_from?: string;
    max_production_to?: string;
    current_production_from?: string;
    current_production_to?: string;
}

const logisticsIcon = `<svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.6667 2.4919C27.6147 1.84743 25.4313 1.5 23.1667 1.5C11.2005 1.5 1.5 11.2005 1.5 23.1667C1.5 35.1328 11.2005 44.8333 23.1667 44.8333C35.1328 44.8333 44.8333 35.1328 44.8333 23.1667C44.8333 19.4501 43.8976 15.9521 42.2488 12.8955M34 9.625H34.0108M19.9168 44.5912L19.917 39.8173C19.917 39.5588 20.0095 39.3087 20.1778 39.1124L25.5637 32.8287C26.0063 32.3123 25.8691 31.5205 25.2786 31.1831L19.0902 27.6468C18.922 27.5507 18.7827 27.4113 18.6867 27.2431L14.6527 20.1737C14.4427 19.8058 14.0376 19.594 13.6156 19.6316L1.63906 20.6983M42.6667 10.1667C42.6667 14.9531 38.3333 18.8333 34 23.1667C29.6667 18.8333 25.3333 14.9531 25.3333 10.1667C25.3333 5.3802 29.2135 1.5 34 1.5C38.7865 1.5 42.6667 5.3802 42.6667 10.1667ZM34.5417 9.625C34.5417 9.92415 34.2992 10.1667 34 10.1667C33.7008 10.1667 33.4583 9.92415 33.4583 9.625C33.4583 9.32585 33.7008 9.08333 34 9.08333C34.2992 9.08333 34.5417 9.32585 34.5417 9.625Z" stroke="#1570EF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33301 2.60175H4.83301C3.43288 2.60175 2.73281 2.60175 2.19803 2.87424C1.72763 3.11392 1.34517 3.49637 1.10549 3.96678C0.833008 4.50156 0.833008 5.20162 0.833008 6.60175V13.6018C0.833008 15.0019 0.833008 15.7019 1.10549 16.2367C1.34517 16.7071 1.72763 17.0896 2.19803 17.3293C2.73281 17.6018 3.43288 17.6018 4.83301 17.6018H11.833C13.2331 17.6018 13.9332 17.6018 14.468 17.3293C14.9384 17.0896 15.3208 16.7071 15.5605 16.2367C15.833 15.7019 15.833 15.0019 15.833 13.6018V10.1018M5.83299 12.6018H7.22844C7.63609 12.6018 7.83992 12.6018 8.03173 12.5557C8.20179 12.5149 8.36436 12.4475 8.51348 12.3562C8.68168 12.2531 8.8258 12.109 9.11406 11.8207L17.083 3.85175C17.7734 3.1614 17.7734 2.04211 17.083 1.35175C16.3927 0.661396 15.2734 0.661395 14.583 1.35175L6.61404 9.3207C6.32578 9.60896 6.18166 9.75308 6.07859 9.92128C5.9872 10.0704 5.91986 10.233 5.87904 10.403C5.83299 10.5948 5.83299 10.7987 5.83299 11.2063V12.6018Z" stroke="#175CD3" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const trash_1_icon = `<svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.5833 4.08333V3.41667C11.5833 2.48325 11.5833 2.01654 11.4017 1.66002C11.2419 1.34641 10.9869 1.09144 10.6733 0.931656C10.3168 0.75 9.85009 0.75 8.91667 0.75H7.58333C6.64991 0.75 6.1832 0.75 5.82668 0.931656C5.51308 1.09144 5.25811 1.34641 5.09832 1.66002C4.91667 2.01654 4.91667 2.48325 4.91667 3.41667V4.08333M0.75 4.08333H15.75M14.0833 4.08333V13.4167C14.0833 14.8168 14.0833 15.5169 13.8108 16.0516C13.5712 16.522 13.1887 16.9045 12.7183 17.1442C12.1835 17.4167 11.4835 17.4167 10.0833 17.4167H6.41667C5.01654 17.4167 4.31647 17.4167 3.78169 17.1442C3.31129 16.9045 2.92883 16.522 2.68915 16.0516C2.41667 15.5169 2.41667 14.8168 2.41667 13.4167V4.08333" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const trash_2_icon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 0.75H10.75M0.75 3.25H15.75M14.0833 3.25L13.4989 12.0161C13.4112 13.3313 13.3674 13.9889 13.0833 14.4875C12.8333 14.9265 12.456 15.2794 12.0014 15.4997C11.485 15.75 10.8259 15.75 9.50779 15.75H6.99221C5.67409 15.75 5.01503 15.75 4.49861 15.4997C4.04396 15.2794 3.66674 14.9265 3.41665 14.4875C3.13259 13.9889 3.08875 13.3313 3.00107 12.0161L2.41667 3.25M6.58333 7V11.1667M9.91667 7V11.1667" stroke="#D92D20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const searchIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8333 15.8335L12.9167 12.9168M14.9999 7.91683C14.9999 11.8288 11.8286 15.0002 7.91659 15.0002C4.00457 15.0002 0.833252 11.8288 0.833252 7.91683C0.833252 4.00481 4.00457 0.833496 7.91659 0.833496C11.8286 0.833496 14.9999 4.00481 14.9999 7.91683Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const plusIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1V15M1 8H15" stroke="#1849A9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
const columnIcon = `<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M6 13.5V3.5C6 2.72343 6 2.33515 5.87313 2.02886C5.70398 1.62048 5.37952 1.29602 4.97114 1.12687C4.66485 1 4.27657 1 3.5 1C2.72343 1 2.33515 1 2.02886 1.12687C1.62048 1.29602 1.29602 1.62048 1.12687 2.02886C1 2.33515 1 2.72343 1 3.5V13.5C1 14.2766 1 14.6649 1.12687 14.9711C1.29602 15.3795 1.62048 15.704 2.02886 15.8731C2.33515 16 2.72343 16 3.5 16C4.27657 16 4.66485 16 4.97114 15.8731C5.37952 15.704 5.70398 15.3795 5.87313 14.9711C6 14.6649 6 14.2766 6 13.5Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <path
    d="M14.3333 10.1667V3.5C14.3333 2.72343 14.3333 2.33515 14.2065 2.02886C14.0373 1.62048 13.7129 1.29602 13.3045 1.12687C12.9982 1 12.6099 1 11.8333 1C11.0568 1 10.6685 1 10.3622 1.12687C9.95381 1.29602 9.62936 1.62048 9.4602 2.02886C9.33333 2.33515 9.33333 2.72343 9.33333 3.5V10.1667C9.33333 10.9432 9.33333 11.3315 9.4602 11.6378C9.62936 12.0462 9.95381 12.3706 10.3622 12.5398C10.6685 12.6667 11.0568 12.6667 11.8333 12.6667C12.6099 12.6667 12.9982 12.6667 13.3045 12.5398C13.7129 12.3706 14.0373 12.0462 14.2065 11.6378C14.3333 11.3315 14.3333 10.9432 14.3333 10.1667Z"
    stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

const exportIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.16732 7.50065C3.39234 7.50065 3.00485 7.50065 2.68694 7.58584C1.82421 7.817 1.15034 8.49087 0.91917 9.3536C0.833984 9.67152 0.833984 10.059 0.833984 10.834V11.834C0.833984 13.2341 0.833984 13.9342 1.10647 14.469C1.34615 14.9394 1.7286 15.3218 2.19901 15.5615C2.73379 15.834 3.43385 15.834 4.83398 15.834H11.834C13.2341 15.834 13.9342 15.834 14.469 15.5615C14.9394 15.3218 15.3218 14.9394 15.5615 14.469C15.834 13.9342 15.834 13.2341 15.834 11.834V10.834C15.834 10.059 15.834 9.67152 15.7488 9.3536C15.5176 8.49087 14.8438 7.817 13.981 7.58584C13.6631 7.50065 13.2756 7.50065 12.5007 7.50065M11.6673 4.16732L8.33398 0.833984M8.33398 0.833984L5.00065 4.16732M8.33398 0.833984V10.834" stroke="#194185" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const importIcon = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 11V12C16 13.4001 16 14.1002 15.7275 14.635C15.4878 15.1054 15.1054 15.4878 14.635 15.7275C14.1002 16 13.4001 16 12 16H5C3.59987 16 2.8998 16 2.36502 15.7275C1.89462 15.4878 1.51217 15.1054 1.27248 14.635C1 14.1002 1 13.4001 1 12V11M12.6667 6.83333L8.5 11M8.5 11L4.33333 6.83333M8.5 11V1" stroke="#194185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const tableItems = ref<Logistic[]>([]);
const allHeaders = ref<TableHeader[]>([]);
const shownHeaders = ref<TableHeader[]>([]);
const canCreate = ref(false);
const loading = ref(false);
const loadingMore = ref(false);
const header_table = ref('')

const nextCursor = ref<string | null>(null);
const previousCursor = ref<string | null>(null);
const perPage = ref(15);
const hasMoreData = computed(() => nextCursor.value !== null);

const tableHeaders = computed(() => {
    return shownHeaders.value.map(header => ({
        key: header.key,
        title: header.title,
        width: "140px"
    }));
});

const selectedLogistics = ref<number[]>([]);
const hasSelectedLogistics = computed(() => selectedLogistics.value.length > 0);

const showAdvancedFilters = ref(false);
const filterProductionLines = ref("");
const filterLogisticType = ref<string | null>(null);
const filterMaxProductionFrom = ref("");
const filterMaxProductionTo = ref("");
const filterCurrentProductionFrom = ref("");
const filterCurrentProductionTo = ref("");

const logisticTypeItems = ref<Array<{ title: string; value: string }>>([]);
const loadingConstants = ref(false);

const toggleAdvancedFilters = () => {
    showAdvancedFilters.value = !showAdvancedFilters.value;
};

const showBulkDeleteDialog = ref(false);
const deleteLoading = ref(false);

const showStatusChangeDialog = ref(false);
const statusChangeLoading = ref(false);
const itemToChangeStatus = ref<Logistic | null>(null);

const showHeadersMenu = ref(false);
const updatingHeaders = ref(false);

const headerCheckStates = computed(() => {
    const states: Record<string, boolean> = {};
    allHeaders.value.forEach(header => {
        states[header.key] = shownHeaders.value.some(sh => sh.key === header.key);
    });
    return states;
});

const fetchLogistics = async (cursor?: string | null, append = false) => {
    try {
        if (append) {
            loadingMore.value = true;
        } else {
            loading.value = true;
        }

        const filters: LogisticFilters = {
            per_page: perPage.value,
            cursor: cursor || undefined,
        };

        if (filterProductionLines.value) filters.production_lines = filterProductionLines.value;
        if (filterLogisticType.value) filters.logistic_type = filterLogisticType.value;
        if (filterMaxProductionFrom.value) filters.max_production_from = filterMaxProductionFrom.value;
        if (filterMaxProductionTo.value) filters.max_production_to = filterMaxProductionTo.value;
        if (filterCurrentProductionFrom.value) filters.current_production_from = filterCurrentProductionFrom.value;
        if (filterCurrentProductionTo.value) filters.current_production_to = filterCurrentProductionTo.value;

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `/logistics-companies?${queryString}` : '/logistics-companies';

        const response = await api.get<LogisticsResponse>(url);

        if (append) {
            tableItems.value = [...tableItems.value, ...response.data];
        } else {
            tableItems.value = response.data;
            allHeaders.value = response.headers.filter(h => h.key !== 'id' && h.key !== 'actions')
            shownHeaders.value = response.shownHeaders.filter(h => h.key !== 'id' && h.key !== 'actions')
            canCreate.value = response.actions.can_create;
            header_table.value = response.header_table
        }

        nextCursor.value = response.pagination.next_cursor;
        previousCursor.value = response.pagination.previous_cursor;
        perPage.value = response.pagination.per_page;
    } catch (err: any) {
        console.error('Error fetching logistics:', err);
        toast.error(err?.response?.data?.message || 'Failed to fetch logistics');
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

const loadMore = () => {
    if (hasMoreData.value && !loadingMore.value) {
        fetchLogistics(nextCursor.value, true);
    }
};

const applyFilters = () => {
    fetchLogistics();
};

const resetFilters = () => {
    filterProductionLines.value = '';
    filterLogisticType.value = null;
    filterMaxProductionFrom.value = '';
    filterMaxProductionTo.value = '';
    filterCurrentProductionFrom.value = '';
    filterCurrentProductionTo.value = '';
    fetchLogistics();
};

const toggleHeader = async (headerKey: string) => {
    const isCurrentlyShown = shownHeaders.value.some(h => h.key === headerKey);

    if (isCurrentlyShown) {
        shownHeaders.value = shownHeaders.value.filter(h => h.key !== headerKey);
    } else {
        const headerToAdd = allHeaders.value.find(h => h.key === headerKey);
        if (headerToAdd) {
            shownHeaders.value.push(headerToAdd);
        }
    }

    await updateHeadersOnServer();
};

const updateHeadersOnServer = async () => {
    try {
        updatingHeaders.value = true;
        const headerKeys = shownHeaders.value.map(h => h.key);

        const formData = new FormData();
        formData.append('table', header_table.value);
        headerKeys.forEach((header, index) => {
            formData.append(`header[${index}]`, header);
        });

        await api.post('/headers', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (err: any) {
        console.error('Error updating headers:', err);
        toast.error(err?.response?.data?.message || 'Failed to update headers');
    } finally {
        updatingHeaders.value = false;
    }
};

const handleEdit = (item: any) => {
    router.push({ name: "LogisticsEdit", params: { id: item.id } });
};

const handleStatusChange = (item: any) => {
    itemToChangeStatus.value = { ...item }
    showStatusChangeDialog.value = true
}


const confirmStatusChange = async () => {
    if (!itemToChangeStatus.value) return;

    try {
        statusChangeLoading.value = true;
        const newStatus = !itemToChangeStatus.value.is_active;

        await api.patch(`/logistics-companies/${itemToChangeStatus.value.id}/change-status`, {
            status: newStatus
        });

        toast.success(`تم ${newStatus ? 'تفعيل' : 'تعطيل'} الكسارة بنجاح`);

        const index = tableItems.value.findIndex(t => t.id === itemToChangeStatus.value!.id)
        if (index !== -1) {
            tableItems.value[index].is_active = newStatus
        }

    } catch (err: any) {
        console.error('Error changing logistic status:', err);
        toast.error(err?.response?.data?.message || 'فشل تغيير حالة الكسارة');
    } finally {
        statusChangeLoading.value = false;
        showStatusChangeDialog.value = false;
        itemToChangeStatus.value = null;
    }
};

const confirmDelete = async (item: any) => {
    try {
        deleteLoading.value = true;
        await api.delete(`/logistics-companies/${item.id}`);
        toast.success('تم حذف الكسارة بنجاح');
        await fetchLogistics();
    } catch (err: any) {
        console.error('Error deleting logistic:', err);
        toast.error(err?.response?.data?.message || 'Failed to delete logistic');
    } finally {
        deleteLoading.value = false;
    }
};

const handleBulkDelete = () => {
    if (selectedLogistics.value.length === 0) return;
    showBulkDeleteDialog.value = true;
};

const confirmBulkDelete = async () => {
    try {
        deleteLoading.value = true;
        await api.post('/logistics-companies/bulk-delete', { ids: selectedLogistics.value });
        toast.success(`تم حذف ${selectedLogistics.value.length} كسارة بنجاح`);
        selectedLogistics.value = [];
        await fetchLogistics();
    } catch (err: any) {
        console.error('Error bulk deleting logistics:', err);
        toast.error(err?.response?.data?.message || 'Failed to delete logistics');
    } finally {
        deleteLoading.value = false;
        showBulkDeleteDialog.value = false;
    }
};

const handleSelectLogistic = (item: any, selected: boolean) => {
    if (selected) {
        selectedLogistics.value.push(item.id);
    } else {
        selectedLogistics.value = selectedLogistics.value.filter((id) => id !== item.id);
    }
};

const handleSelectAllLogistics = (checked: boolean) => {
    if (checked) {
        selectedLogistics.value = tableItems.value.map((item) => item.id);
    } else {
        selectedLogistics.value = [];
    }
};


const fetchConstants = async () => {
    try {
        loadingConstants.value = true;
        const response = await api.get<{
            status: number;
            code: number;
            locale: string;
            message: string;
            data: {
                logistic_types: Array<{ key: string; label: string }>;
            };
        }>('/logistics-companies/constants');

        if (response.data && response.data.logistic_types) {
            logisticTypeItems.value = response.data.logistic_types.map(ct => ({
                title: ct.label,
                value: ct.key
            }));
        }
    } catch (err: any) {
        console.error('Fetch constants error:', err);
        toast.error(err?.response?.data?.message || 'فشل تحميل الثوابت');
    } finally {
        loadingConstants.value = false;
    }
};

const loadMoreTrigger = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const setupInfiniteScroll = () => {
    if (!loadMoreTrigger.value) return;

    observer.value = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
                loadMore();
            }
        },
        {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        }
    );

    observer.value.observe(loadMoreTrigger.value);
};

const cleanupInfiniteScroll = () => {
    if (observer.value && loadMoreTrigger.value) {
        observer.value.unobserve(loadMoreTrigger.value);
        observer.value.disconnect();
    }
};

onMounted(async () => {
    fetchConstants();
    await fetchLogistics();
    nextTick(() => {
        setupInfiniteScroll();
    });
});

onBeforeUnmount(() => {
    cleanupInfiniteScroll();
});
</script>

<template>
    <default-layout>
        <div class="logistics-page">
            <PageHeader :icon="logisticsIcon" title-key="pages.logistics.title"
                description-key="pages.logistics.description" />

            <div
                class="flex justify-end items-stretch rounded border border-gray-300 w-fit ms-auto mb-4 overflow-hidden bg-white text-sm">
                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-100 !text-primary-900"
                    :prepend-icon="importIcon" :label="t('common.import')" />

                <ButtonWithIcon variant="flat" height="40" rounded="0"
                    custom-class="font-semibold text-base border-gray-300 bg-primary-50 !text-primary-900"
                    :prepend-icon="exportIcon" :label="t('common.export')" />
            </div>

            <div class="bg-gray-50 rounded-md -mx-6">
                <div :class="hasSelectedLogistics ? 'justify-between' : 'justify-end'"
                    class="flex flex-wrap items-center gap-3 border-y border-y-slate-300 px-4 sm:px-6 py-3">
                    <!-- Actions when rows are selected -->
                    <div v-if="hasSelectedLogistics"
                        class="flex flex-wrap items-stretch rounded overflow-hidden border border-gray-200 bg-white text-sm">
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_1_icon" color="white" :label="t('common.delete')"
                            @click="handleBulkDelete" />
                        <div class="w-px bg-gray-200"></div>
                        <ButtonWithIcon variant="flat" height="40" rounded="0"
                            custom-class="px-4 font-semibold text-error-600 hover:bg-error-50/40 !rounded-none"
                            :prepend-icon="trash_2_icon" color="white" :label="t('common.deleteAll')"
                            @click="handleBulkDelete" />
                    </div>


                    <!-- Main header controls -->
                    <div class="flex flex-wrap gap-3">
                        <v-menu v-model="showHeadersMenu" :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <ButtonWithIcon v-bind="props" variant="outlined" rounded="4" color="gray-500"
                                    height="40" custom-class="font-semibold text-base border-gray-400"
                                    :prepend-icon="columnIcon" :label="t('common.columns')"
                                    append-icon="mdi-chevron-down" />
                            </template>
                            <v-list>
                                <v-list-item v-for="header in allHeaders" :key="header.key"
                                    @click="toggleHeader(header.key)">
                                    <template v-slot:prepend>
                                        <v-checkbox-btn :model-value="headerCheckStates[header.key]"
                                            :disabled="updatingHeaders"
                                            @click.stop="toggleHeader(header.key)"></v-checkbox-btn>
                                    </template>
                                    <v-list-item-title>{{ header.title }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <ButtonWithIcon variant="flat" color="primary-500" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base text-white border !border-primary-200"
                            :prepend-icon="searchIcon" :label="t('common.advancedSearch')"
                            @click="toggleAdvancedFilters" />

                        <!-- <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4"
                            custom-class="px-7 font-semibold text-base !text-primary-800 border !border-primary-200"
                            :prepend-icon="plusIcon" label="أضف كسارة" @click="openCreateLogistic" /> -->
                    </div>

                </div>

                <!-- Advanced filters row -->
                <div v-if="showAdvancedFilters"
                    class="border-y border-y-primary-100 bg-primary-50 px-4 sm:px-6 py-3 flex flex-col gap-3">
                    <div class="flex flex-wrap xl:!flex-nowrap gap-3 items-center">
                        <div class="flex flex-wrap gap-3 flex-1">
                            <!-- Production Lines -->
                            <TextInput v-model="filterProductionLines" density="comfortable" variant="outlined"
                                hide-details placeholder="عدد خطوط الإنتاج" type="number"
                                class="w-full sm:w-40 bg-white" @update:model-value="applyFilters" />

                            <!-- Logistic Type -->
                            <SelectInput v-model="filterLogisticType" :items="logisticTypeItems" item-title="title"
                                item-value="value" density="comfortable" variant="outlined" hide-details
                                placeholder="نوع الكسارة" class="w-full sm:w-40 bg-white" :loading="loadingConstants"
                                @update:model-value="applyFilters" />

                            <!-- Current Production Range From-To -->
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-700 w-full whitespace-nowrap">الإنتاج الحالي من</span>
                                <div
                                    class="flex items-center gap-2 bg-white rounded-lg border border-gray-300 py-2.5 px-2">
                                    <input v-model="filterCurrentProductionFrom" type="number" placeholder="من"
                                        class="w-16 text-center text-gray-700 outline-none border-none bg-transparent no-spinner" />
                                    <span class="text-gray-400">-</span>
                                    <input v-model="filterCurrentProductionTo" type="number" placeholder="إلى"
                                        class="w-16 text-center text-gray-700 outline-none border-none bg-transparent no-spinner" />
                                </div>
                            </div>

                            <!-- Max Production Range From-To -->
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-700 w-full whitespace-nowrap">الإنتاج الأقصى من</span>
                                <div
                                    class="flex items-center gap-2 bg-white rounded-lg border border-gray-300 py-2.5 px-2">
                                    <input v-model="filterMaxProductionFrom" type="number" placeholder="من"
                                        class="w-16 text-center text-gray-700 outline-none border-none bg-transparent no-spinner" />
                                    <span class="text-gray-400">-</span>
                                    <input v-model="filterMaxProductionTo" type="number" placeholder="إلى"
                                        class="w-16 text-center text-gray-700 outline-none border-none bg-transparent no-spinner" />
                                </div>
                            </div>
                        </div>

                        <!-- Search Button -->
                        <div class="flex gap-2 items-center">
                            <ButtonWithIcon variant="flat" color="primary-500" rounded="4" height="40"
                                custom-class="px-5 font-semibold !text-white text-sm sm:text-base"
                                :prepend-icon="searchIcon" label="ابحث" @click="applyFilters" />

                            <ButtonWithIcon variant="flat" color="primary-100" height="40" rounded="4" border="sm"
                                custom-class="px-5 font-semibold text-sm sm:text-base !text-primary-800 !border-primary-200"
                                prepend-icon="mdi-refresh" label="إعادة تعيين" @click="resetFilters" />
                        </div>
                    </div>
                </div>

                <!-- Logistics Table -->
                <DataTable :headers="tableHeaders" :items="tableItems" :loading="loading" :show-view="false"
                    show-checkbox show-actions @edit="handleEdit" @delete="confirmDelete" @select="handleSelectLogistic"
                    @selectAll="handleSelectAllLogistics">
                    <template #item.is_active="{ item }">
                        <v-switch :model-value="item.is_active" hide-details inset density="compact"
                            @update:model-value="() => handleStatusChange(item)" class="small-switch"
                            color="primary-600" />
                    </template>
                    <template #item.material_types="{ item }">
                        {{ item?.material_types?.join(', ') || '--' }}
                    </template>
                </DataTable>

                <!-- Infinite Scroll Trigger & Loading Indicator -->
                <div ref="loadMoreTrigger" class="flex justify-center py-4">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                </div>
            </div>
        </div>

        <!-- Bulk Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showBulkDeleteDialog" :loading="deleteLoading" title="حذف الكسارات"
            :message="`هل أنت متأكد من حذف ${selectedLogistics.length} كسارة؟`" @confirm="confirmBulkDelete" />

        <!-- Status Change Confirmation Dialog -->
        <StatusChangeDialog v-model="showStatusChangeDialog" :loading="statusChangeLoading"
            :item-name="itemToChangeStatus?.business_name" :current-status="itemToChangeStatus?.is_active || false"
            @confirm="confirmStatusChange" />
    </default-layout>
</template>

<style scoped></style>
