<template>
    <default-layout>
        <div class="user-form-page -mx-6">
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
                <router-link to="/users/list" class="text-gray-600 hover:text-primary-600">
                    ادارة المستخدمين
                </router-link>
                <span class="text-lg text-gray-300">/</span>
                <span class="text-primary-700 font-medium bg-primary-50 px-2 py-1 rounded-md">
                    {{ isEditing ? 'تعديل المستخدم' : 'اضافة مستخدم جديد' }}
                </span>
            </div>

            <!-- Page Header -->
            <div class="bg-white px-6 py-6 border-y border-gray-200">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 flex items-center justify-center">
                        <span v-html="userPlusIcon" class="text-primary-500"></span>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900 mb-1">
                            {{ isEditing ? 'تعديل المستخدم' : 'اضافة مستخدم جديد' }}
                        </h1>
                        <p class="text-sm text-gray-500">
                            قم بملئ البيانات الأساسية واختيار الأدوار للمستخدم
                        </p>
                    </div>
                </div>
            </div>

            <!-- Form Content -->
            <div class="p-6">
                <v-form ref="formRef" @submit.prevent="handleSubmit">
                    <!-- Section Title -->
                    <div class="flex items-center gap-2 mb-6">
                        <span v-html="clipboardIcon" class="text-primary-500"></span>
                        <h2 class="text-lg font-bold text-primary-600">البيانات الأساسية</h2>
                    </div>

                    <!-- Form Fields -->
                    <div class="space-y-6">
                        <!-- Row 1: Name, Phone, Email -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Name -->
                            <div>
                                <label class="qallab-label">الاسم</label>
                                <TextInput v-model="form.name" placeholder="ادخل الاسم" :rules="[required()]" />
                            </div>

                            <!-- Phone -->
                            <div>
                                <label class="qallab-label">الهاتف</label>
                                <div class="flex gap-2">
                                    <TextInput v-model="form.phone" placeholder="+966 (555) 000-0000" 
                                        class="flex-1" :rules="[required()]" />
                                    <v-select v-model="form.country_code" :items="countryCodes" item-title="title"
                                        item-value="value" variant="outlined" density="comfortable" hide-details
                                        class="w-24" />
                                </div>
                            </div>

                            <!-- Email -->
                            <div>
                                <label class="qallab-label">البريد الإلكتروني</label>
                                <TextInput v-model="form.email" placeholder="info@example.com"
                                    :rules="[required(), email()]" />
                            </div>
                        </div>

                        <!-- Row 2: Password, Confirm Password, Roles -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Password -->
                            <div>
                                <label class="qallab-label">كلمة المرور</label>
                                <TextInput v-model="form.password" type="password" placeholder="كلمة المرور"
                                    :rules="isEditing ? [] : [required(), minLength(8)]" />
                            </div>

                            <!-- Confirm Password -->
                            <div>
                                <label class="qallab-label">تأكيد كلمة المرور</label>
                                <TextInput v-model="form.password_confirmation" type="password"
                                    placeholder="تأكيد كلمة المرور"
                                    :rules="isEditing ? [] : [required(), confirmPassword(form.password)]" />
                            </div>

                            <!-- Roles -->
                            <div>
                                <label class="qallab-label">الأدوار</label>
                                <v-select v-model="form.roles" :items="rolesOptions" item-title="title"
                                    item-value="value" variant="outlined" density="comfortable" hide-details multiple
                                    chips closable-chips placeholder="اختر الأدوار" :rules="[required()]">
                                    <template #chip="{ item, props }">
                                        <v-chip v-bind="props" closable color="primary" variant="flat" size="small">
                                            {{ item.title }}
                                        </v-chip>
                                    </template>
                                </v-select>
                            </div>
                        </div>

                        <!-- Row 3: Status -->
                        <div>
                            <label class="qallab-label">الحالة</label>
                            <div class="flex items-center gap-6">
                                <v-radio-group v-model="form.is_active" inline hide-details class="mt-0">
                                    <v-radio label="فعال" :value="true" color="primary" />
                                    <v-radio label="غير فعال" :value="false" color="primary" />
                                </v-radio-group>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-center gap-4 mt-10">
                        <v-btn type="submit" color="primary" size="large" class="px-10" :loading="loading">
                            <span v-html="userPlusSmallIcon" class="me-2"></span>
                            {{ isEditing ? 'حفظ التعديلات' : 'أضف مستخدم جديد' }}
                        </v-btn>
                        <v-btn variant="outlined" color="gray-300" size="large" class="px-10" @click="handleCancel">
                            <span v-html="closeIcon" class="me-2"></span>
                            الغاء
                        </v-btn>
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
import { required, email, minLength, confirmPassword } from '@/utils/validators'

// Composables
const api = useApi()
const { success, error: errorNotification } = useNotification()
const router = useRouter()
const route = useRoute()

// === State ===
const formRef = ref()
const loading = ref(false)

const isEditing = computed(() => !!route.params.id)
const userId = computed(() => route.params.id as string)

// Form Data
const form = ref({
    name: '',
    email: '',
    phone: '',
    country_code: 'KSA',
    password: '',
    password_confirmation: '',
    roles: [] as number[],
    is_active: true
})

// Options
const countryCodes = ref([
    { title: 'KSA', value: 'KSA' },
    { title: 'UAE', value: 'UAE' },
    { title: 'EGY', value: 'EGY' }
])

interface RoleOption {
    id: number
    name: string
}

interface RolesApiResponse {
    status: number
    data: RoleOption[]
}

const rolesOptions = ref<{ title: string; value: number }[]>([])

// === API Functions ===
const fetchRoles = async () => {
    try {
        const response = await api.get<RolesApiResponse>('/roles/list')
        rolesOptions.value = response.data.map(role => ({
            title: role.name,
            value: role.id
        }))
    } catch (err: any) {
        console.error('Error fetching roles:', err)
    }
}

const fetchUser = async () => {
    if (!isEditing.value) return

    try {
        loading.value = true
        const response = await api.get<any>(`/users/${userId.value}`)
        const user = response.data

        form.value = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            country_code: user.country_code || 'KSA',
            password: '',
            password_confirmation: '',
            roles: user.roles?.map((r: any) => r.id) || [],
            is_active: user.is_active ?? true
        }
    } catch (err: any) {
        console.error('Error fetching user:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء جلب بيانات المستخدم')
    } finally {
        loading.value = false
    }
}

const handleSubmit = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    try {
        loading.value = true

        const payload: any = {
            name: form.value.name,
            email: form.value.email,
            phone: form.value.phone,
            country_code: form.value.country_code,
            roles: form.value.roles,
            is_active: form.value.is_active ? 1 : 0
        }

        // Only include password if it's provided
        if (form.value.password) {
            payload.password = form.value.password
            payload.password_confirmation = form.value.password_confirmation
        }

        if (isEditing.value) {
            await api.put(`/users/${userId.value}`, payload)
            success('تم تحديث المستخدم بنجاح')
        } else {
            await api.post('/users', payload)
            success('تم إضافة المستخدم بنجاح')
        }

        router.push({ name: 'UsersList' })
    } catch (err: any) {
        console.error('Error saving user:', err)
        errorNotification(err?.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات')
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    router.push({ name: 'UsersList' })
}

// === Lifecycle ===
onMounted(() => {
    fetchRoles()
    fetchUser()
})

// === Icons ===
const homeIcon = `<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.00016 13.1109H11.6668M7.51491 1.24755L1.86299 5.64348C1.48518 5.93734 1.29628 6.08426 1.16019 6.26826C1.03963 6.43125 0.949831 6.61487 0.895186 6.81009C0.833496 7.03048 0.833496 7.26979 0.833496 7.74842V13.7775C0.833496 14.711 0.833496 15.1777 1.01515 15.5342C1.17494 15.8478 1.42991 16.1028 1.74351 16.2625C2.10003 16.4442 2.56674 16.4442 3.50016 16.4442H13.1668C14.1003 16.4442 14.567 16.4442 14.9235 16.2625C15.2371 16.1028 15.4921 15.8478 15.6518 15.5342C15.8335 15.1777 15.8335 14.711 15.8335 13.7775V7.74842C15.8335 7.26979 15.8335 7.03048 15.7718 6.81009C15.7172 6.61487 15.6274 6.43125 15.5068 6.26826C15.3707 6.08426 15.1818 5.93734 14.804 5.64349L9.15208 1.24755C8.85931 1.01984 8.71293 0.90598 8.55129 0.862214C8.40866 0.823598 8.25833 0.823598 8.11571 0.862214C7.95407 0.90598 7.80768 1.01984 7.51491 1.24755Z" stroke="#697586" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const userPlusIcon = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.6667 29.0833H13.9167C10.8929 29.0833 9.38108 29.0833 8.15086 29.4565C5.38099 30.2968 3.21342 32.4643 2.37319 35.2342C2 36.4644 2 37.9763 2 41M38.8333 41V28M32.3333 34.5H45.3333M29.0833 11.75C29.0833 17.1348 24.7181 21.5 19.3333 21.5C13.9486 21.5 9.58333 17.1348 9.58333 11.75C9.58333 6.36522 13.9486 2 19.3333 2C24.7181 2 29.0833 6.36522 29.0833 11.75Z" stroke="#1570EF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const clipboardIcon = `<svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 5H4.2C3.0799 5 2.51984 5 2.09202 5.21799C1.71569 5.40973 1.40973 5.71569 1.21799 6.09202C1 6.51984 1 7.0799 1 8.2V17.8C1 18.9201 1 19.4802 1.21799 19.908C1.40973 20.2843 1.71569 20.5903 2.09202 20.782C2.51984 21 3.0799 21 4.2 21H15.8C16.9201 21 17.4802 21 17.908 20.782C18.2843 20.5903 18.5903 20.2843 18.782 19.908C19 19.4802 19 18.9201 19 17.8V8.2C19 7.0799 19 6.51984 18.782 6.09202C18.5903 5.71569 18.2843 5.40973 17.908 5.21799C17.4802 5 16.9201 5 15.8 5H14M6 5V3C6 1.89543 6.89543 1 8 1H12C13.1046 1 14 1.89543 14 3V5M6 5H14M10 11V17M7 14H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const closeIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const userPlusSmallIcon = `<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 17V15C16 13.1362 14.7252 11.5701 13 11.126M11 1.29076C12.4659 1.88415 13.5 3.32131 13.5 5C13.5 6.67869 12.4659 8.11585 11 8.70924M12.5 17C12.5 15.1362 12.5 14.2044 12.1955 13.4693C11.7895 12.4892 11.0108 11.7105 10.0307 11.3045C9.29565 11 8.36377 11 6.5 11H5C3.13623 11 2.20435 11 1.46927 11.3045C0.489151 11.7105 -0.289536 12.4892 -0.695521 13.4693C-1 14.2044 -1 15.1362 -1 17M9 5C9 7.20914 7.20914 9 5 9C2.79086 9 1 7.20914 1 5C1 2.79086 2.79086 1 5 1C7.20914 1 9 2.79086 9 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 5V11M19 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
</script>

<style scoped>
.user-form-page {
    min-height: 100vh;
}
</style>