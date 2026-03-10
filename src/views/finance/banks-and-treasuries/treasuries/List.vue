<template>
    <default-layout>
        <div class="treasuries-page -mx-6">
            <!-- Content -->
            <div>
                <div class="px-6">
                    <PageHeader :icon="financeIcon" title-key="pages.banksAndTreasuries.title"
                        description-key="pages.banksAndTreasuries.description" />
                </div>

                <!-- Tabs Navigation -->
                <div
                    class="flex lg:items-center lg:justify-between py-4 border-y border-gray-200 flex-col lg:flex-row gap-3 px-6">
                    <div class="flex gap-2 overflow-y-auto">
                        <ButtonWithIcon to="/banks/list" variant="flat" size="large" label="إدارة البنوك" color="white"
                            :rounded="'md'" custom-class="!text-gray-400">
                        </ButtonWithIcon>
                        <ButtonWithIcon to="/treasuries/list" variant="flat" size="large" label="إدارة الخزائن"
                            color="primary-500" :rounded="'md'" custom-class="text-white">
                        </ButtonWithIcon>
                    </div>
                </div>

                <!-- Treasuries Cards Section -->
                <div class="p-6">
                    <!-- Add Treasury Button -->
                    <div class="flex mb-6" v-if="canCreate">
                        <ButtonWithIcon @click="handleAddTreasury" variant="flat" size="large" label="اضافة خزينة جديدة"
                            color="primary-500" :rounded="'md'" :prepend-icon="plusIcon" custom-class="text-white">
                        </ButtonWithIcon>
                    </div>
                    <!-- Treasuries Cards Section -->
                    <div class="p-6">
                        <!-- Loading State -->
                        <div v-if="loading" class="flex justify-center items-center py-12">
                            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                        </div>

                        <!-- Treasuries Grid -->
                        <div v-else-if="treasuries.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            <Card v-for="(treasury, index) in treasuries" :key="treasury.id" :treasury="treasury"
                                :index="index" :status-loading="statusLoadingId === treasury.id"
                                edit-route-name="TreasuriesEdit" view-route-name="TreasuriesView"
                                @status-change="handleStatusChange"
                                @view-balance="handleViewBalance"
                                @delete="handleDelete" />
                        </div>

                        <!-- Empty State -->
                        <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
                            <p class="text-lg font-medium">لا يوجد خزائن</p>
                        </div>

                        <!-- Infinite Scroll Trigger & Loading Indicator -->
                        <div ref="loadMoreTrigger" class="flex justify-center py-4">
                            <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <DeleteConfirmDialog v-model="showDeleteDialog" :loading="deleteLoading" title="حذف الخزينة"
            :message="`هل أنت متأكد من حذف ${itemToDelete?.name}؟`" @confirm="confirmDelete" />
    </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../component/Card.vue'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { plusIcon } from '@/components/icons/globalIcons'
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog.vue'

// Composables
const api = useApi()
const { success, error: errorNotification } = useNotification()
const router = useRouter()

// === TypeScript Interfaces ===
interface TreasuryActions {
    can_update?: boolean
    can_change_status?: boolean
    can_view?: boolean
    can_delete?: boolean
}

interface Treasury {
    id: number
    name: string
    balance: number
    status: string | boolean
    actions?: TreasuryActions
}

interface Pagination {
    next_cursor: string | null
    previous_cursor: string | null
    per_page: number
}

interface ApiResponse {
    status: number
    code: number
    locale: string
    message: string
    data: Treasury[]
    pagination: Pagination
    actions: {
        can_create: boolean
        can_bulk_delete?: boolean
    }
}

interface TreasuryFilters {
    per_page?: number
    cursor?: string | null
    name?: string
    status?: string
}

// === State ===
const treasuries = ref<Treasury[]>([])
const canCreate = ref(false)
const canBulkDelete = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const statusLoadingId = ref<number | null>(null)

// Pagination
const nextCursor = ref<string | null>(null)
const previousCursor = ref<string | null>(null)
const perPage = ref(15)
const hasMoreData = computed(() => nextCursor.value !== null)

// Delete confirmation
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)
const itemToDelete = ref<Treasury | null>(null)


// === API Functions ===
const fetchTreasuries = async (cursor?: string | null, append = false) => {
    try {
        if (append) {
            loadingMore.value = true
        } else {
            loading.value = true
        }

        const filters: TreasuryFilters = {
            per_page: perPage.value,
            cursor: cursor || undefined,
        }

        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value))
            }
        })

        const queryString = params.toString()
        const url = queryString ? `/treasuries?${queryString}` : '/treasuries'

        const response = await api.get<ApiResponse>(url)

        if (append) {
            treasuries.value = [...treasuries.value, ...response.data]
        } else {
            treasuries.value = response.data
            canCreate.value = response.actions.can_create
            canBulkDelete.value = response.actions.can_bulk_delete ?? false
        }

        nextCursor.value = response.pagination.next_cursor
        previousCursor.value = response.pagination.previous_cursor
        perPage.value = response.pagination.per_page
    } catch (err: any) {
        console.error('Error fetching treasuries:', err)
        errorNotification(err?.response?.data?.message || 'فشل في تحميل الخزائن')
    } finally {
        loading.value = false
        loadingMore.value = false
    }
}

// Load more data (lazy loading)
const loadMore = () => {
    if (hasMoreData.value && !loadingMore.value) {
        fetchTreasuries(nextCursor.value, true)
    }
}


const handleStatusChange = async (treasury: Treasury, newStatus: boolean) => {
    try {
        statusLoadingId.value = treasury.id

        await api.patch(`/treasuries/${treasury.id}/change-status`, {
            status: newStatus
        })

        // Update local state
        const treasuryIndex = treasuries.value.findIndex(r => r.id === treasury.id)
        if (treasuryIndex !== -1) {
            treasuries.value[treasuryIndex].status = newStatus
        }

        success(newStatus ? 'تم تفعيل الخزينة بنجاح' : 'تم تعطيل الخزينة بنجاح')
    } catch (err: any) {
        console.error('Error changing status:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء تغيير الحالة')
        await fetchTreasuries()
    } finally {
        statusLoadingId.value = null
    }
}

const handleViewBalance = (treasury: Treasury) => {
    console.log('View balance for treasury:', treasury)
}

const handleDelete = (treasury: Treasury) => {
    itemToDelete.value = treasury
    showDeleteDialog.value = true
}

const confirmDelete = async () => {
    if (!itemToDelete.value) return

    try {
        deleteLoading.value = true
        await api.delete(`/treasuries/${itemToDelete.value.id}`)
        success('تم حذف الخزينة بنجاح')
        await fetchTreasuries()
    } catch (err: any) {
        console.error('Error deleting treasury:', err)
        errorNotification(err?.response?.data?.message || 'فشل في حذف الخزينة')
    } finally {
        deleteLoading.value = false
        showDeleteDialog.value = false
        itemToDelete.value = null
    }
}

// === Handlers ===
const handleAddTreasury = () => {
    router.push({ name: 'TreasuriesCreate' })
}

// Infinite scroll with Intersection Observer
const loadMoreTrigger = ref<HTMLElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

const setupInfiniteScroll = () => {
    if (!loadMoreTrigger.value) return

    observer.value = new IntersectionObserver(
        (entries) => {
            const entry = entries[0]
            if (entry.isIntersecting && hasMoreData.value && !loadingMore.value && !loading.value) {
                loadMore()
            }
        },
        {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        }
    )

    observer.value.observe(loadMoreTrigger.value)
}

const cleanupInfiniteScroll = () => {
    if (observer.value && loadMoreTrigger.value) {
        observer.value.unobserve(loadMoreTrigger.value)
        observer.value.disconnect()
    }
}

const financeIcon = `<svg width="47" height="42" viewBox="0 0 47 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.3333 5.83333C25.3333 8.22657 19.9981 10.1667 13.4167 10.1667C6.83527 10.1667 1.5 8.22657 1.5 5.83333M25.3333 5.83333C25.3333 3.4401 19.9981 1.5 13.4167 1.5C6.83527 1.5 1.5 3.4401 1.5 5.83333M25.3333 5.83333V9.08333M1.5 5.83333V31.8333C1.5 34.2266 6.83527 36.1667 13.4167 36.1667M13.4167 18.8333C13.0515 18.8333 12.6901 18.8274 12.3333 18.8157C6.25962 18.6166 1.5 16.7604 1.5 14.5M13.4167 27.5C6.83527 27.5 1.5 25.5599 1.5 23.1667M44.8333 19.9167C44.8333 22.3099 39.4981 24.25 32.9167 24.25C26.3353 24.25 21 22.3099 21 19.9167M44.8333 19.9167C44.8333 17.5234 39.4981 15.5833 32.9167 15.5833C26.3353 15.5833 21 17.5234 21 19.9167M44.8333 19.9167V36.1667C44.8333 38.5599 39.4981 40.5 32.9167 40.5C26.3353 40.5 21 38.5599 21 36.1667V19.9167M44.8333 28.0417C44.8333 30.4349 39.4981 32.375 32.9167 32.375C26.3353 32.375 21 30.4349 21 28.0417" stroke="#1570EF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

// === Lifecycle ===
onMounted(() => {
    fetchTreasuries()
    nextTick(() => {
        setupInfiniteScroll()
    })
})

onBeforeUnmount(() => {
    cleanupInfiniteScroll()
})
</script>
