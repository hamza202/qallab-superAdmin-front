<template>
    <div class="bank-card rounded-xl overflow-hidden border !border-gray-100">
        <!-- Header with gradient -->

        <!-- Card Content -->
        <div class="px-4 py-5 flex flex-col h-full">
            <!-- Bank/Treasury Info Section -->
            <div class="flex items-start gap-3">
                <!-- Details -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <div class="title-accent relative pe-5">
                            <h3 class="text-lg font-bold truncate text-primary-500">
                                {{ item.name }}
                            </h3>
                            <!-- <p v-else-if="bank?.currency" class="text-xs text-gray-600 truncate">{{ bank.currency }}</p> -->
                            <p class="text-xs text-gray-600 truncate">ريال سعودي</p>
                        </div>

                        <!-- Status Badge -->
                        <span class="px-3 py-1 text-xs font-medium rounded-full" :class="statusBadgeClass">
                            {{ statusText }}
                        </span>

                    </div>

                </div>
            </div>

            <!-- Balance Display -->
            <div class="mt-3 mb-auto">
                <div class="flex items-center justify-center p-2 text-4xl font-bold gap-2 text-primary-900">
                    {{ item.balance || 0 }}
                    <SarIcon :width="22" :height="25" color="#194185" />
                </div>
            </div>

            <!-- Actions Section -->
            <div class="flex items-center justify-end gap-3 mt-4 flex-wrap">
                <!-- <ButtonWithIcon label="مطابقة الرصيد" variant="flat" color="primary-600"
                    :custom-class="'px-6 text-base'" @click="handleViewBalance" /> -->
                            <p v-if="'code' in item && item.code" class="text-xs text-gray-600 truncate">كود: {{
                                item.code }}</p>

                <div class="flex items-center gap-2">
                    <!-- <ButtonWithIcon icon-only :icon="coinsIcon" variant="flat" color="primary-50"
                        :custom-class="'!text-gray-600'" size="x-small" :loading="statusLoading" /> -->

                    <!-- <ButtonWithIcon v-if="item.actions?.can_view" icon-only :icon="coinsIcon" variant="flat"
                        color="primary-50" :custom-class="'!text-gray-600'" size="x-small" @click="handleView" />

                    <ButtonWithIcon icon-only :icon="fileCheckIcon" variant="flat" color="primary-50"
                        :custom-class="'!text-success-600'" size="x-small" />
                    <ButtonWithIcon v-if="item.actions?.can_delete" icon-only icon="mdi-delete-outline" variant="flat"
                        color="primary-50" :custom-class="'!text-error-600'" size="x-small" @click="handleDelete" /> -->

                    <ButtonWithIcon v-if="item.actions?.can_update" icon-only :icon="binIcon" variant="flat"
                        size="x-small" color="primary-50" :custom-class="'!text-primary-700'" @click="handleEdit" />

                    <!-- <ButtonWithIcon v-if="item.actions?.can_change_status" icon-only :icon="switchHorisinralIcon"
                        variant="flat" color="primary-50" :custom-class="'!text-warning-600'" size="x-small"
                        :loading="statusLoading" @click="toggleStatus" /> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { binIcon, coinsIcon } from '@/components/icons/globalIcons'
import { switchHorisinralIcon } from '@/components/icons/priceOffersIcons'
import SarIcon from '@/components/icons/SarIcon.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Props
interface ItemActions {
    can_update?: boolean
    can_change_status?: boolean
    can_view?: boolean
    can_delete?: boolean
}

interface Bank {
    id: number
    name: string
    code?: string
    is_active: boolean
    balance: number
    currency?: string
    status?: string | boolean
    actions?: ItemActions
}

interface Treasury {
    id: number
    name: string
    balance: number
    status: string | boolean
    actions?: ItemActions
}

const props = defineProps<{
    bank?: Bank
    treasury?: Treasury
    index: number
    statusLoading?: boolean
    editRouteName?: string
    viewRouteName?: string
    deleteRouteName?: string
}>()

const emit = defineEmits<{
    (e: 'edit', item: Bank | Treasury): void
    (e: 'statusChange', item: Bank | Treasury, newStatus: boolean): void
    (e: 'viewBalance', item: Bank | Treasury): void
    (e: 'view', item: Bank | Treasury): void
    (e: 'delete', item: Bank | Treasury): void
}>()

const router = useRouter()

// Computed - get the item (bank or treasury)
const item = computed(() => props.bank || props.treasury!)

// Computed - status text and class
const statusText = computed(() => {
    const currentItem = item.value
    if ('is_active' in currentItem) {
        return currentItem.is_active ? 'فعال' : 'غير فعال'
    }
    const status = currentItem.status
    if (typeof status === 'boolean') {
        return status ? 'فعال' : 'غير فعال'
    }
    return status === 'active' || status === 'enabled' ? 'فعال' : 'غير فعال'
})

const statusBadgeClass = computed(() => {
    const currentItem = item.value
    let isActive = false

    if ('is_active' in currentItem) {
        isActive = currentItem.is_active
    } else {
        const status = currentItem.status
        isActive = typeof status === 'boolean'
            ? status
            : status === 'active' || status === 'enabled'
    }

    return isActive ? 'bg-success-500 text-white' : 'bg-red-500 text-white'
})

// Methods
const handleEdit = () => {
    if (props.editRouteName) {
        router.push({ name: props.editRouteName, params: { id: item.value.id } })
    } else {
        emit('edit', item.value)
    }
}

const handleView = () => {
    if (props.viewRouteName) {
        router.push({ name: props.viewRouteName, params: { id: item.value.id } })
    } else {
        emit('view', item.value)
    }
}

const handleDelete = () => {
    emit('delete', item.value)
}

const toggleStatus = () => {
    const currentItem = item.value
    let currentStatus = false

    if ('is_active' in currentItem) {
        currentStatus = currentItem.is_active
    } else {
        const status = currentItem.status
        currentStatus = typeof status === 'boolean'
            ? status
            : status === 'active' || status === 'enabled'
    }

    emit('statusChange', item.value, !currentStatus)
}

const handleViewBalance = () => {
    emit('viewBalance', item.value)
}

const fileCheckIcon = `<svg width="16" viewBox="0 0 41 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.6667 24.75V12.4C36.6667 8.75966 36.6667 6.93949 35.9582 5.54906C35.335 4.32601 34.3407 3.33163 33.1176 2.70846C31.7272 2 29.907 2 26.2667 2H12.4C8.75966 2 6.93949 2 5.54906 2.70846C4.32601 3.33163 3.33163 4.32601 2.70846 5.54906C2 6.93949 2 8.75966 2 12.4V34.9333C2 38.5737 2 40.3938 2.70846 41.7843C3.33163 43.0073 4.32601 44.0017 5.54906 44.6249C6.93949 45.3333 8.75966 45.3333 12.4 45.3333H19.3333M23.6667 21.5H10.6667M15 30.1667H10.6667M28 12.8333H10.6667M24.75 38.8333L29.0833 43.1667L38.8333 33.4167" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

</script>

<style scoped>
.bank-card {
    transition: all 0.2s ease;
}

.bank-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.title-accent::before {
    content: "";
    position: absolute;
    inset-inline-end: 113%;
    top: 2px;
    bottom: 2px;
    width: 4px;
    border-radius: 999px;
    background: linear-gradient(180deg, #2EA7FF 0%, #0F62D6 100%);
}
</style>
