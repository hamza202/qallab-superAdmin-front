<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '@/composables/useApi';
import TopHeader from '@/components/price-offers/TopHeader.vue';
import AppFormBreadcrumb from '@/components/common/AppFormBreadcrumb.vue';

const router = useRouter();
const route = useRoute();
const api = useApi();

const coins = `<svg width="48" height="43" viewBox="0 0 48 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.8333 6.33333C25.8333 8.72657 20.4981 10.6667 13.9167 10.6667C7.33527 10.6667 2 8.72657 2 6.33333M25.8333 6.33333C25.8333 3.9401 20.4981 2 13.9167 2C7.33527 2 2 3.9401 2 6.33333M25.8333 6.33333V9.58333M2 6.33333V32.3333C2 34.7266 7.33527 36.6667 13.9167 36.6667M13.9167 19.3333C13.5515 19.3333 13.1901 19.3274 12.8333 19.3157C6.75962 19.1166 2 17.2604 2 15M13.9167 28C7.33527 28 2 26.0599 2 23.6667M45.3333 20.4167C45.3333 22.8099 39.9981 24.75 33.4167 24.75C26.8353 24.75 21.5 22.8099 21.5 20.4167M45.3333 20.4167C45.3333 18.0234 39.9981 16.0833 33.4167 16.0833C26.8353 16.0833 21.5 18.0234 21.5 20.4167M45.3333 20.4167V36.6667C45.3333 39.0599 39.9981 41 33.4167 41C26.8353 41 21.5 39.0599 21.5 36.6667V20.4167M45.3333 28.5417C45.3333 30.9349 39.9981 32.875 33.4167 32.875C26.8353 32.875 21.5 30.9349 21.5 28.5417" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

const formRef = ref<any>(null);
const isFormValid = ref(false);
const saving = ref(false);
const loading = ref(false);

const firstQueryString = (q: unknown): string => {
    if (q == null) return '';
    const v = Array.isArray(q) ? q[0] : q;
    return typeof v === 'string' ? v.trim() : String(v ?? '').trim();
};

const zoneCitySuburbIdFromQuery = computed(() => {
    const direct = firstQueryString(route.query.zone_city_suburb_id);
    if (direct) return direct;
    return firstQueryString(route.query.zone_city_track_id);
});

const zoneId = computed(() => firstQueryString(route.query.zone_id));
const cityId = computed(() => firstQueryString(route.query.city_id));
const zoneLabelFromQuery = computed(() => firstQueryString(route.query.zone));

interface CustomPricingForm {
    id?: number;
    zone_city_suburb_id: string;
    min_distance_km: string;
    max_distance_km: string;
    trip_time_slot: string | null;
    trip_duration_hours: string;
    road_type: string | null;
    waiting_time_hours: string;
    item_ids: number[];
    transport_type: number[];
    transports_no: string;
    weight: string;
    unit_id: number | null;
    price_amount: string;
    is_active: boolean;
}

const form = reactive<CustomPricingForm>({
    zone_city_suburb_id: '',
    min_distance_km: '',
    max_distance_km: '',
    trip_time_slot: null,
    trip_duration_hours: '',
    road_type: null,
    waiting_time_hours: '',
    item_ids: [],
    transport_type: [],
    transports_no: '',
    weight: '',
    unit_id: null,
    price_amount: '',
    is_active: true,
});

const formErrors = reactive<Record<string, string>>({});

// Constants from API
const tripTimeSlots = ref<{ title: string; value: string }[]>([]);
const roadTypes = ref<{ title: string; value: string }[]>([]);
const transportTypes = ref<{ title: string; value: number }[]>([]);

// Units
const unitItems = ref<{ title: string; value: number }[]>([]);

const fetchConstants = async () => {
    try {
        const res = await api.get<any>('/zone-pricing/constants');
        if (res.data) {
            tripTimeSlots.value = (res.data.trip_time_slots || []).map((item: any) => ({
                title: item.label,
                value: item.key,
            }));
            roadTypes.value = (res.data.road_types || []).map((item: any) => ({
                title: item.label,
                value: item.key,
            }));
            transportTypes.value = (res.data.transport_types || []).map((item: any) => ({
                title: item.label,
                value: item.key,
            }));
        }
    } catch (err: any) {
        console.error('Error fetching constants:', err);
    }
};

const fetchUnits = async () => {
    try {
        const res = await api.get<any>('/units/list');
        if (Array.isArray(res.data)) {
            unitItems.value = res.data.map((i: any) => ({ title: i.name, value: i.id }));
        }
    } catch (err: any) {
        console.error('Error fetching units:', err);
    }
};

// Items lazy loading
const fetchItemsList = async (search = '', cursor?: string, perPage = 15) => {
    const params: any = { per_page: perPage };
    if (search) params.name = search;
    if (cursor) params.cursor = cursor;

    const res = await api.get<any>('/items/list', { params });
    return {
        data: res.data || [],
        next_cursor: res.pagination?.next_cursor || null,
    };
};

const isEditing = computed(() => !!route.params.id);

const fetchPricingData = async () => {
    if (!route.params.id) return;

    try {
        loading.value = true;
        const res = await api.get<any>(`/zone-city-suburb-custom-pricings/${route.params.id}`);
        if (res.data) {
            const d = res.data;
            form.zone_city_suburb_id = String(
                d.zone_city_suburb_id ?? d.zone_city_track_id ?? ''
            );
            form.min_distance_km = String(d.min_distance_km ?? '');
            form.max_distance_km = String(d.max_distance_km ?? '');
            form.trip_time_slot = d.trip_time_slot || null;
            form.trip_duration_hours = String(d.trip_duration_hours ?? '');
            form.road_type = d.road_type || null;
            form.waiting_time_hours = String(d.waiting_time_hours ?? '');
            form.item_ids = d.item_ids || [];
            form.transport_type = d.transport_type || [];
            form.transports_no = String(d.transports_no ?? '');
            form.weight = String(d.weight ?? '');
            form.unit_id = d.unit_id || null;
            form.price_amount = String(d.price_amount ?? '');
            form.is_active = Boolean(d.is_active);
        }
    } catch (err: any) {
        console.error('Error fetching pricing data:', err);
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
        loading.value = false;
    }
};

const buildPayload = () => {
    return {
        zone_city_suburb_id: Number(
            form.zone_city_suburb_id || zoneCitySuburbIdFromQuery.value
        ),
        min_distance_km: Number(form.min_distance_km),
        max_distance_km: Number(form.max_distance_km),
        trip_time_slot: form.trip_time_slot,
        trip_duration_hours: Number(form.trip_duration_hours),
        road_type: form.road_type,
        waiting_time_hours: Number(form.waiting_time_hours),
        item_ids: form.item_ids,
        transport_type: form.transport_type,
        transports_no: Number(form.transports_no),
        weight: Number(form.weight),
        unit_id: form.unit_id,
        price_amount: Number(form.price_amount),
        is_active: form.is_active,
    };
};

const handleSave = async (navigateTo: 'tracks' | 'list') => {
    Object.keys(formErrors).forEach(key => delete formErrors[key]);

    if (formRef.value && typeof formRef.value.validate === "function") {
        const { valid } = await formRef.value.validate();
        if (!valid) return;
    }

    try {
        saving.value = true;
        const payload = buildPayload();

        if (isEditing.value) {
            await api.put(`/zone-city-suburb-custom-pricings/${route.params.id}`, payload);
            toast.success('تم تحديث التسعير المخصص بنجاح');
        } else {
            await api.post('/zone-city-suburb-custom-pricings', payload);
            toast.success('تم إضافة التسعير المخصص بنجاح');
        }

        if (navigateTo === 'list') {
            router.push('/settings/custom-pricing-suburbs/list');
        } else if (zoneId.value && cityId.value) {
            router.push({
                path: `/settings/central-paths/${zoneId.value}/${cityId.value}/zone-suburbs`,
                query: zoneLabelFromQuery.value ? { zone: zoneLabelFromQuery.value } : {},
            });
        } else if (navigateTo === 'tracks') {
            router.push(`/settings/central-paths`);
        } else {
            router.push('/settings/custom-pricing-suburbs/list');
        }
    } catch (err: any) {
        console.error('Error saving pricing:', err);
        if (err?.response?.data?.errors) {
            Object.entries(err.response.data.errors).forEach(([key, messages]: any) => {
                formErrors[key] = Array.isArray(messages) ? messages[0] : messages;
            });
        }
        toast.error(err?.response?.data?.message || 'حدث خطأ أثناء حفظ التسعير المخصص');
    } finally {
        saving.value = false;
    }
};

const handleCancel = () => {
    if (zoneId.value && cityId.value) {
        router.push({
            path: `/settings/central-paths/${zoneId.value}/${cityId.value}/zone-suburbs`,
            query: zoneLabelFromQuery.value ? { zone: zoneLabelFromQuery.value } : {},
        });
    } else if (zoneId.value) {
        router.push(`/settings/central-paths/${zoneId.value}/site-tracks`);
    } else {
        router.push('/settings/custom-pricing-suburbs/list');
    }
};

onMounted(async () => {
    await Promise.all([fetchConstants(), fetchUnits()]);
    if (isEditing.value) {
        await fetchPricingData();
    } else {
        form.zone_city_suburb_id = zoneCitySuburbIdFromQuery.value;
    }
});
</script>

<template>
    <default-layout>
        <div class="custom-pricing-form-page -mx-6">
            <AppFormBreadcrumb list-path="/settings/custom-pricing-suburbs/list" module-root-key="الإعدادات"
                list-label-key="إدارة الأحياء" create-label-key="إضافة تسعيرة مخصصة للأحياء" edit-label-key="تعديل تسعيرة مخصصة للأحياء"
                :is-edit-mode="isEditing" />

            <TopHeader :icon="coins" title-key="إضافة تسعيرة مخصصة للأحياء" description-key="تمكنك من إضافة تسعيرة مخصصة للأحياء"
                :show-action="false" />

            <div class="bg-white rounded-lg shadow-sm p-6">
                <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
                    <div v-if="loading" class="flex justify-center items-center py-12">
                        <v-progress-circular indeterminate color="primary" size="48" />
                    </div>

                    <div v-else class="space-y-6">
                        <h2 class="text-xl font-bold text-primary-800 mb-6">معلومات التسعيرة</h2>

                        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            <TextInput v-model="form.min_distance_km" label="أدنى مسافة" placeholder="0" type="number"
                                :rules="[required()]" :error-messages="formErrors['min_distance_km']"
                                @input="delete formErrors['min_distance_km']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">كم</span>
                                </template>
                            </TextInput>

                            <TextInput v-model="form.max_distance_km" label="أقصى مسافة" placeholder="30" type="number"
                                :rules="[required()]" :error-messages="formErrors['max_distance_km']"
                                @input="delete formErrors['max_distance_km']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">كم</span>
                                </template>
                            </TextInput>

                            <TextInput v-model="form.trip_duration_hours" label="زمن الرحلة" placeholder="1" type="number"
                                :rules="[required()]" :error-messages="formErrors['trip_duration_hours']"
                                @input="delete formErrors['trip_duration_hours']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">ساعة</span>
                                </template>
                            </TextInput>

                            <SelectWithIconInput v-model="form.trip_time_slot" label="وقت الرحلة" placeholder="صباحاً"
                                :items="tripTimeSlots" :rules="[required()]" :error-messages="formErrors['trip_time_slot']"
                                @update:model-value="delete formErrors['trip_time_slot']" density="comfortable" />

                            <SelectWithIconInput v-model="form.road_type" label="نوع الطريق" placeholder="اختر النوع"
                                :items="roadTypes" :rules="[required()]" :error-messages="formErrors['road_type']"
                                @update:model-value="delete formErrors['road_type']" density="comfortable" />

                            <PriceInput v-model="form.price_amount" label="السعر" placeholder="500" showRialIcon type="number"
                                :rules="[required()]" :error-messages="formErrors['price_amount']"
                                @input="delete formErrors['price_amount']" density="comfortable" />

                            <TextInput v-model="form.waiting_time_hours" label="وقت الانتظار" placeholder="0" type="number"
                                :rules="[required()]" :error-messages="formErrors['waiting_time_hours']"
                                @input="delete formErrors['waiting_time_hours']" density="comfortable">
                                <template #append-inner>
                                    <span class="text-gray-500 text-sm">ساعة</span>
                                </template>
                            </TextInput>

                            <SelectWithIconInput v-model="form.transport_type" label="نوع الشاحنة" placeholder="اختر النوع"
                                :items="transportTypes" :rules="[required()]" multiple chips
                                :error-messages="formErrors['transport_type']"
                                @update:model-value="delete formErrors['transport_type']" density="comfortable" />

                            <SelectInput v-model="form.item_ids" :items="[]" label="المواد" placeholder="اختر المواد"
                                :rules="[required()]" :error-messages="formErrors['item_ids']"
                                @update:model-value="delete formErrors['item_ids']" density="comfortable"
                                :server-side="true" :fetch-function="fetchItemsList" multiple
                                item-title-key="name" item-value-key="id" :debounce-time="500" />

                            <TextInput v-model="form.weight" label="الوزن" placeholder="10" type="number"
                                :rules="[required()]" :error-messages="formErrors['weight']"
                                @input="delete formErrors['weight']" density="comfortable" />

                            <TextInput v-model="form.transports_no" label="عدد الشاحنات" placeholder="1" type="number"
                                :rules="[required()]" :error-messages="formErrors['transports_no']"
                                @input="delete formErrors['transports_no']" density="comfortable" />

                            <SelectWithIconInput v-model="form.unit_id" label="الوحدة" placeholder="اختر الوحدة"
                                :items="unitItems" :error-messages="formErrors['unit_id']"
                                @update:model-value="delete formErrors['unit_id']" density="comfortable" />
                        </div>

                        <div class="flex gap-3 justify-center pt-4 sm:w-[75%] mx-auto mt-12">
                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1"
                                label="حفظ والعودة إلى قائمة المسارات" @click="handleSave('tracks')" :loading="saving"
                                :disabled="saving" />

                            <ButtonWithIcon variant="flat" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1"
                                label="حفظ والعودة إلى قائمة التسعيرة المخصصة" @click="handleSave('list')" :loading="saving"
                                :disabled="saving" />

                            <ButtonWithIcon variant="outlined" color="primary" height="44" rounded="4"
                                custom-class="font-semibold text-base px-12 flex-1" label="إلغاء"
                                @click="handleCancel" />
                        </div>
                    </div>
                </v-form>
            </div>
        </div>
    </default-layout>
</template>

<style scoped></style>
