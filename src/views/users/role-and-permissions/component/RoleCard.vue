<template>
    <div class="role-card rounded-[16px] overflow-hidden bg-[#F8FAFC]">
        <!-- Header with gradient -->
        <div class="h-[13px]" :class="headerGradientClass"></div>

        <!-- Card Content -->
        <div class="p-4 flex flex-col h-full">
            <!-- Role Info Section -->
            <div class="flex items-start gap-3">
                <!-- Role Avatar -->
                <div class="flex-shrink-0">
                    <img :src="avatarSrc" :alt="role.role_name" class="w-[51px] h-[51px] rounded-full object-cover" />
                </div>

                <!-- Role Details -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <h3 class="text-lg font-bold truncate" :class="nameColorClass">
                            {{ role.role_name }}
                        </h3>
                        <!-- Status Badge -->
                        <span class="px-2 py-0.5 text-[12px] font-medium rounded-full" :class="statusBadgeClass">
                            {{ role.is_active ? 'فعال' : 'غير فعال' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Groups/Permissions Tags -->
            <div class="flex flex-wrap gap-1.5 mb-auto mt-3">
                <span v-for="group in displayedGroups" :key="group.group_name"
                    class="px-2 py-0.5 text-[11px] font-medium rounded-full" :class="groupTagClass">
                    {{ group.group_name }} ({{ group.active_permissions_count }})
                </span>
                <span v-if="hiddenGroupsCount > 0"
                    class="px-2 py-0.5 text-[11px] font-medium rounded-full text-gray-500 bg-gray-100">
                    +{{ hiddenGroupsCount }}
                </span>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-100 my-3"></div>

            <!-- Actions Section -->
            <div class="flex items-center justify-end">
                <!-- Edit Button -->
                <button v-if="role.actions?.can_update" @click="handleEdit"
                    class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors !text-[#697586] hover:!text-primary-600 bg-transparent">
                    <span v-html="editIcon"></span>
                </button>
                <!-- Toggle Switch -->
                <v-switch v-model="isActive" hide-details density="compact" v-if="role.actions?.can_change_status"
                    color="primary" class="small-switch rtl:!origin-left ltr:!origin-right" inset
                    @update:model-value="handleStatusChange" :loading="statusLoading" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Props
interface Group {
    group_name: string
    active_permissions_count: number
}

interface RoleActions {
    can_update: boolean
    can_change_status: boolean
}

interface Role {
    id: number
    role_name: string
    is_active: boolean
    groups: Group[]
    actions?: RoleActions
}

const props = defineProps<{
    role: Role
    index: number
    statusLoading?: boolean
    editRouteName?: string
}>()

const emit = defineEmits<{
    (e: 'edit', role: Role): void
    (e: 'statusChange', role: Role, newStatus: boolean): void
}>()

const router = useRouter()

// Local state
const isActive = ref(props.role.is_active)

// Computed
const isEven = computed(() => props.index % 2 === 0)

const headerGradientClass = computed(() =>
    isEven.value
        ? 'bg-primary-500'
        : 'bg-gray-600'
)

const nameColorClass = computed(() =>
    isEven.value
        ? 'text-primary-600'
        : 'text-gray-700'
)

const statusBadgeClass = computed(() =>
    props.role.is_active
        ? 'bg-success-50 text-success-700'
        : 'bg-gray-100 text-gray-600'
)

const groupTagClass = computed(() =>
    isEven.value
        ? 'bg-primary-50 text-primary-600'
        : 'bg-gray-100 text-gray-600'
)

const avatarSrc = computed(() =>
    isEven.value ? '/logo-icon-1.svg' : '/logo-icon-2.svg'
)

const displayedGroups = computed(() =>
    props.role.groups.slice(0, 3)
)

const hiddenGroupsCount = computed(() =>
    Math.max(0, props.role.groups.length - 3)
)

// Methods
const handleEdit = () => {
    if (props.editRouteName) {
        router.push({ name: props.editRouteName, params: { id: props.role.id } })
    } else {
        emit('edit', props.role)
    }
}

const handleStatusChange = (newStatus: boolean | null) => {
    if (newStatus !== null) {
        emit('statusChange', props.role, newStatus)
    }
}

// Icons
const editIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33594 2.5998H4.83594C3.43581 2.5998 2.73574 2.5998 2.20096 2.87228C1.73056 3.11197 1.3481 3.49442 1.10842 3.96482C0.835938 4.4996 0.835938 5.19967 0.835938 6.5998V13.5998C0.835938 14.9999 0.835938 15.7 1.10842 16.2348C1.3481 16.7052 1.73056 17.0876 2.20096 17.3273C2.73574 17.5998 3.43581 17.5998 4.83594 17.5998H11.8359C13.2361 17.5998 13.9361 17.5998 14.4709 17.3273C14.9413 17.0876 15.3238 16.7052 15.5635 16.2348C15.8359 15.7 15.8359 14.9999 15.8359 13.5998V10.0998M5.83592 12.5998H7.23137C7.63902 12.5998 7.84284 12.5998 8.03466 12.5537C8.20472 12.5129 8.36729 12.4456 8.51641 12.3542C8.68461 12.2511 8.82873 12.107 9.11699 11.8188L17.0859 3.8498C17.7763 3.15944 17.7763 2.04015 17.0859 1.3498C16.3956 0.659443 15.2763 0.659442 14.5859 1.3498L6.61697 9.31875C6.32871 9.607 6.18459 9.75113 6.08152 9.91932C5.99013 10.0684 5.92279 10.231 5.88197 10.4011C5.83592 10.5929 5.83592 10.7967 5.83592 11.2044V12.5998Z" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`
</script>

<style scoped>
.role-card {
    transition: all 0.2s ease;
}

.role-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}
</style>
