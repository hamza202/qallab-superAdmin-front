<template>
    <default-layout>
        <div class="role-form-page -mx-6">
            <!-- Breadcrumb -->
            <div class="flex items-center gap-3 mb-6 text-sm px-6">
                <router-link to="/" class="text-gray-500 hover:text-primary-600">
                    <span v-html="homeIcon"></span>
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <router-link to="/users/list" class="text-gray-600 hover:text-primary-600">
                    المستخدمين
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <router-link to="/roles/list" class="text-gray-600 hover:text-primary-600">
                    ادارة المستخدمين
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
                    {{ isEditing ? 'تعديل الدور' : 'اضافة دور' }}
                </span>
            </div>

            <!-- Page Header -->
            <div class="bg-white px-6 py-6 border-y border-gray-200">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 flex items-center justify-center">
                        <span v-html="checksIcon" class="text-primary-500"></span>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900 mb-1">
                            {{ isEditing ? 'تعديل الدور' : 'اضافة دور جديد' }}
                        </h1>
                        <p class="text-sm text-gray-500">
                            قم بملئ البيانات الأساسية واختيار الأدوار
                        </p>
                    </div>
                </div>
            </div>

            <!-- Form Content -->
            <div class="p-6">
                <v-form ref="formRef" @submit.prevent="handleSubmit">
                    <!-- Section Title: البيانات الأساسية -->
                    <div class="flex items-center gap-2 mb-6">
                        <span v-html="clipboardIcon" class="text-primary-500"></span>
                        <h2 class="text-lg font-bold text-primary-600">البيانات الأساسية</h2>
                    </div>

                    <!-- Role Name Field -->
                    <div class="max-w-md mb-8">
                        <label class="qallab-label">اسم الدور</label>
                        <TextInput v-model="form.name" placeholder="الاسم" :rules="[required()]" />
                    </div>

                    <!-- Section Title: الصلاحيات -->
                    <div class="flex items-center gap-2 mb-6">
                        <span v-html="shieldIcon" class="text-primary-500"></span>
                        <h2 class="text-lg font-bold text-primary-600">الصلاحيات</h2>
                    </div>

                    <!-- Loading State -->
                    <div v-if="permissionsLoading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                    </div>

                    <!-- Permissions Groups -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div v-for="(group, groupKey) in permissionGroups" :key="groupKey"
                            class="rounded-2xl border overflow-hidden transition-all"
                            :class="expandedGroups.includes(groupKey) 
                                ? 'bg-[#F8FAFC] border-gray-100' 
                                : 'bg-white border-gray-200'">
                            
                            <!-- Group Header (Collapsible) -->
                            <div 
                                @click="toggleGroup(groupKey)"
                                class="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
                                :class="expandedGroups.includes(groupKey) 
                                    ? 'bg-[#F8FAFC]' 
                                    : 'bg-white hover:bg-gray-50'"
                            >
                                <h3 class="text-base font-bold text-gray-700">{{ group.group }}</h3>
                                <v-icon 
                                    :icon="expandedGroups.includes(groupKey) ? 'mdi-minus-circle-outline' : 'mdi-plus-circle-outline'"
                                    color="primary"
                                    size="24"
                                />
                            </div>

                            <!-- Group Content (Expanded) -->
                            <v-expand-transition>
                                <div v-show="expandedGroups.includes(groupKey)" 
                                    class="px-4 pb-4 bg-[#F8FAFC]">
                                    <!-- Select All Checkbox -->
                                    <div class="flex items-center mb-3 border-b border-gray-100 pb-2 pt-2">
                                        <label class="flex items-center gap-2 cursor-pointer flex-row-reverse">
                                            <span class="text-sm font-medium text-primary-600">جميع الصلاحيات</span>
                                            <v-checkbox
                                                :model-value="isGroupAllSelected(groupKey)"
                                                :indeterminate="isGroupPartiallySelected(groupKey)"
                                                @update:model-value="toggleGroupAll(groupKey, $event)"
                                                hide-details
                                                density="compact"
                                                color="primary"
                                            />
                                        </label>
                                    </div>

                                    <!-- Permissions Grid -->
                                    <div class="grid grid-cols-2 gap-2">
                                        <label 
                                            v-for="permission in group.permissions" 
                                            :key="permission.id"
                                            class="flex items-center gap-2 cursor-pointer py-1 flex-row-reverse"
                                        >
                                            <span class="text-sm text-gray-600 flex-1">{{ permission.display_name }}</span>
                                            <v-checkbox
                                                :model-value="form.permissions.includes(permission.name)"
                                                @update:model-value="togglePermission(permission.name, $event)"
                                                hide-details
                                                density="compact"
                                                color="primary"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </v-expand-transition>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-center gap-4 mt-10">
                        <ButtonWithIcon
                            variant="flat"
                            rounded="4"
                            color="primary"
                            height="44"
                            custom-class="font-semibold text-base px-10 text-white"
                            :prepend-icon="saveIcon"
                            :label="isEditing ? 'حفظ التعديلات' : 'أضف دور جديد'"
                            :loading="loading"
                            @click="handleSubmit"
                        />
                        <ButtonWithIcon
                            variant="flat"
                            rounded="4"
                            color="primary-50"
                            height="44"
                            custom-class="font-semibold text-base text-primary-700 px-10"
                            :prepend-icon="closeIcon"
                            label="الغاء"
                            @click="handleCancel"
                        />
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useApi } from '@/composables/useApi'
import { useNotification } from '@/composables/useNotification'
import { required } from '@/utils/validators'

// Composables
const api = useApi()
const { success, error: errorNotification } = useNotification()
const router = useRouter()
const route = useRoute()

// === TypeScript Interfaces ===
interface Permission {
    id: number
    name: string
    display_name: string
}

interface PermissionGroup {
    group: string
    permissions: Permission[]
}

interface PermissionsApiResponse {
    status: number
    data: Record<string, PermissionGroup>
}

interface RoleApiResponse {
    status: number
    data: {
        id: number
        name: string
        permissions: string[]
    }
}

// === State ===
const formRef = ref()
const loading = ref(false)
const permissionsLoading = ref(false)

const isEditing = computed(() => !!route.params.id)
const roleId = computed(() => route.params.id as string)

// Form Data
const form = ref({
    name: '',
    permissions: [] as string[]
})

// Permissions Data
const permissionGroups = ref<Record<string, PermissionGroup>>({})
const expandedGroups = ref<string[]>([])

// === Computed ===
const isGroupAllSelected = (groupKey: string) => {
    const group = permissionGroups.value[groupKey]
    if (!group) return false
    return group.permissions.every(p => form.value.permissions.includes(p.name))
}

const isGroupPartiallySelected = (groupKey: string) => {
    const group = permissionGroups.value[groupKey]
    if (!group) return false
    const selectedCount = group.permissions.filter(p => form.value.permissions.includes(p.name)).length
    return selectedCount > 0 && selectedCount < group.permissions.length
}

// === Methods ===
const toggleGroup = (groupKey: string) => {
    const index = expandedGroups.value.indexOf(groupKey)
    if (index > -1) {
        expandedGroups.value.splice(index, 1)
    } else {
        expandedGroups.value.push(groupKey)
    }
}

const toggleGroupAll = (groupKey: string, selected: boolean | null) => {
    const group = permissionGroups.value[groupKey]
    if (!group) return

    if (selected) {
        // Add all permissions from this group
        group.permissions.forEach(p => {
            if (!form.value.permissions.includes(p.name)) {
                form.value.permissions.push(p.name)
            }
        })
    } else {
        // Remove all permissions from this group
        group.permissions.forEach(p => {
            const index = form.value.permissions.indexOf(p.name)
            if (index > -1) {
                form.value.permissions.splice(index, 1)
            }
        })
    }
}

const togglePermission = (permissionName: string, selected: boolean | null) => {
    if (selected) {
        if (!form.value.permissions.includes(permissionName)) {
            form.value.permissions.push(permissionName)
        }
    } else {
        const index = form.value.permissions.indexOf(permissionName)
        if (index > -1) {
            form.value.permissions.splice(index, 1)
        }
    }
}

// === API Functions ===
const fetchPermissions = async () => {
    try {
        permissionsLoading.value = true
        const response = await api.get<PermissionsApiResponse>('/permissions')
        permissionGroups.value = response.data
        
        // Expand first two groups by default
        const groupKeys = Object.keys(response.data)
        if (groupKeys.length > 0) {
            expandedGroups.value = groupKeys.slice(0, 2)
        }
    } catch (err: any) {
        console.error('Error fetching permissions:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء جلب الصلاحيات')
    } finally {
        permissionsLoading.value = false
    }
}

const fetchRole = async () => {
    if (!isEditing.value) return

    try {
        loading.value = true
        const response = await api.get<RoleApiResponse>(`/roles/${roleId.value}`)
        const role = response.data

        form.value = {
            name: role.name || '',
            permissions: role.permissions || []
        }
    } catch (err: any) {
        console.error('Error fetching role:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الدور')
    } finally {
        loading.value = false
    }
}

const handleSubmit = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    try {
        loading.value = true

        // Build FormData for multipart/form-data request
        const formData = new FormData()
        
        // Add _method for PUT request when editing
        if (isEditing.value) {
            formData.append('_method', 'PUT')
        }
        
        formData.append('name', form.value.name)
        
        // Append permissions as permissions[0], permissions[1], etc.
        form.value.permissions.forEach((permissionName, index) => {
            formData.append(`permissions[${index}]`, permissionName)
        })

        if (isEditing.value) {
            await api.post(`/roles/${roleId.value}`, formData)
            success('تم تحديث الدور بنجاح')
        } else {
            await api.post('/roles', formData)
            success('تم إضافة الدور بنجاح')
        }

        router.push({ name: 'RolesList' })
    } catch (err: any) {
        console.error('Error saving role:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات')
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'RolesList' })
}

// === Lifecycle ===
onMounted(() => {
    fetchPermissions()
    fetchRole()
})

// === Icons ===
const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const checksIcon = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32 15V9.6C32 7.33983 32 6.20976 31.564 5.34731C31.1805 4.59159 30.5607 3.97188 29.805 3.5884C28.9425 3.15265 27.8125 3.15265 25.5523 3.15265H10.8C8.53983 3.15265 7.40976 3.15265 6.54731 3.5884C5.79159 3.97188 5.17188 4.59159 4.7884 5.34731C4.35265 6.20976 4.35265 7.33983 4.35265 9.6V25.2C4.35265 27.4602 4.35265 28.5902 4.7884 29.4527C5.17188 30.2084 5.79159 30.8281 6.54731 31.2116C7.40976 31.6474 8.53983 31.6474 10.8 31.6474H15M23.5 30L27.5 34L37 24.5M22.4 44.5H38.8C41.0602 44.5 42.1902 44.5 43.0527 44.0642C43.8084 43.6807 44.4281 43.061 44.8116 42.3053C45.2474 41.4428 45.2474 40.3128 45.2474 38.0526V22.6C45.2474 20.3398 45.2474 19.2098 44.8116 18.3473C44.4281 17.5916 43.8084 16.9719 43.0527 16.5884C42.1902 16.1527 41.0602 16.1527 38.8 16.1527H22.4C20.1398 16.1527 19.0098 16.1527 18.1473 16.5884C17.3916 16.9719 16.7719 17.5916 16.3884 18.3473C15.9527 19.2098 15.9527 20.3398 15.9527 22.6V38.0526C15.9527 40.3128 15.9527 41.4428 16.3884 42.3053C16.7719 43.061 17.3916 43.6807 18.1473 44.0642C19.0098 44.5 20.1398 44.5 22.4 44.5Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const clipboardIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 12.5V6.8C20 5.11984 20 4.27976 19.673 3.63803C19.3854 3.07354 18.9265 2.6146 18.362 2.32698C17.7202 2 16.8802 2 15.2 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H12M14 11H8M10 15H8M16 7H8M14.5 19L16.5 21L21 16.5" stroke="#1570EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const shieldIcon = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 7V4.2C15 3.0799 15 2.51984 14.782 2.09202C14.5903 1.71569 14.2843 1.40973 13.908 1.21799C13.4802 1 12.9201 1 11.8 1H4.2C3.0799 1 2.51984 1 2.09202 1.21799C1.71569 1.40973 1.40973 1.71569 1.21799 2.09202C1 2.51984 1 3.0799 1 4.2V11.8C1 12.9201 1 13.4802 1.21799 13.908C1.40973 14.2843 1.71569 14.5903 2.09202 14.782C2.51984 15 3.0799 15 4.2 15H7M11 14L13 16L17.5 11.5M10.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V10.2C21 9.07989 21 8.51984 20.782 8.09202C20.5903 7.71569 20.2843 7.40973 19.908 7.21799C19.4802 7 18.9201 7 17.8 7H10.2C9.07989 7 8.51984 7 8.09202 7.21799C7.71569 7.40973 7.40973 7.71569 7.21799 8.09202C7 8.51984 7 9.07989 7 10.2V17.8C7 18.9201 7 19.4802 7.21799 19.908C7.40973 20.2843 7.71569 20.5903 8.09202 20.782C8.51984 21 9.07989 21 10.2 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const closeIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const saveIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 9.16667L10 11.6667L18.3333 3.33333M13.3333 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H13.5C14.9001 17.5 15.6002 17.5 16.135 17.2275C16.6054 16.9878 16.9878 16.6054 17.2275 16.135C17.5 15.6002 17.5 14.9001 17.5 13.5V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>

<style scoped>
.role-form-page {
    min-height: 100vh;
}
</style>
