<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { debounce } from "lodash-es";
import { searchIcon } from "@/components/icons/globalIcons";
import { useI18n } from "vue-i18n";

type Density = "default" | "comfortable" | "compact";

type TextVariant =
    | "filled"
    | "outlined"
    | "plain"
    | "solo"
    | "solo-filled"
    | "solo-inverted"
    | "underlined";

interface SelectInputProps {
    modelValue: string | number | null | (string | number)[];
    label?: string;
    placeholder?: string;
    items: any[];
    color?: string;
    variant?: TextVariant;
    bgColor?: string;
    density?: Density;
    rounded?: string | number | boolean;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    rules?: any[];
    errorMessages?: string | string[];
    hideDetails?: boolean | "auto";
    hint?: string;
    persistentHint?: boolean;
    multiple?: boolean;
    inputProps?: Record<string, any>;
    labelClass?: string;
    itemProps?: any;
    serverSide?: boolean;
    fetchFunction?: (search: string, cursor?: string, perPage?: number) => Promise<any>;
    itemTitleKey?: string;
    itemValueKey?: string;
    debounceTime?: number;
    perPage?: number;
    /** Merged into the menu/chips for serverSide (e.g. multiple) so selected values show labels before fetch matches */
    presetItems?: any[];
}

const props = withDefaults(defineProps<SelectInputProps>(), {
    color: "primary-300",
    bgColor: "#FFF",
    density: "comfortable" as Density,
    hideDetails: true,
    clearable: false,
    inputProps: () => ({}),
    labelClass: "",
    serverSide: false,
    itemTitleKey: "title",
    itemValueKey: "value",
    debounceTime: 500,
    perPage: 15,
    presetItems: () => [],
});
const { t } = useI18n();

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number | null | (string | number)[]): void;
}>();

const internalValue = computed({
    get: () => props.modelValue,
    set: (val) => emit("update:modelValue", val),
});

const searchQuery = ref("");
const isLoading = ref(false);
const serverItems = ref<any[]>([]);
const selectedItem = ref<any | null>(null);
const cursor = ref<string | undefined>(undefined);
const hasMore = ref(true);
const loadMoreRef = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);

const displayItems = computed(() => {
    if (props.serverSide) {
        const valueKey = props.itemValueKey || 'value';
        const titleKey = props.itemTitleKey || 'title';
        let merged = [...serverItems.value];

        const addIfMissing = (entry: Record<string, any>) => {
            const v = entry[valueKey] ?? entry.id;
            if (v === null || v === undefined || v === '') return;
            if (merged.some((item: any) => item[valueKey] === v)) return;
            const title = entry.title ?? entry[titleKey] ?? entry.name ?? String(v);
            merged.unshift({ ...entry, title, value: v, [valueKey]: v });
        };

        if (props.multiple && Array.isArray(props.modelValue)) {
            for (const val of props.modelValue) {
                const preset = (props.presetItems || []).find(
                    (p: any) =>
                        p[valueKey] === val ||
                        p.id === val ||
                        Number(p.id) === Number(val) ||
                        String(p[valueKey]) === String(val)
                );
                if (preset) {
                    addIfMissing(preset);
                } else {
                    addIfMissing({ [valueKey]: val, value: val, title: String(val) });
                }
            }
        } else if (selectedItem.value) {
            const selectedValue = selectedItem.value[valueKey];
            const existsInList = merged.some((item: any) => item[valueKey] === selectedValue);
            if (!existsInList) {
                merged = [selectedItem.value, ...merged];
            }
        }
        return merged;
    }
    return props.items;
});

const fetchData = async (search: string = "", reset: boolean = true) => {
    if (!props.serverSide || !props.fetchFunction) return;

    isLoading.value = true;
    try {
        if (reset) {
            cursor.value = undefined;
            serverItems.value = [];
        }

        const response = await props.fetchFunction(search, cursor.value, props.perPage);

        if (response && response.data) {
            const newItems = Array.isArray(response.data) ? response.data : [];
            const mappedItems = newItems.map((item: any) => ({
                title: item[props.itemTitleKey || "title"],
                value: item[props.itemValueKey || "value"],
                ...item
            }));

            if (reset) {
                serverItems.value = mappedItems;
            } else {
                // Filter out duplicates by checking if the value already exists
                const valueKey = props.itemValueKey || 'value';
                const existingValues = new Set(serverItems.value.map((item: any) => item[valueKey]));
                const uniqueNewItems = mappedItems.filter((item: any) => !existingValues.has(item[valueKey]));
                serverItems.value = [...serverItems.value, ...uniqueNewItems];
            }

            // Update selectedItem if the current single selection is in the new results
            if (props.modelValue != null && !props.multiple) {
                const valueKey = props.itemValueKey || 'value';
                const found = mappedItems.find(
                    (item: any) => item[valueKey] === props.modelValue
                );
                if (found) {
                    selectedItem.value = found;
                }
            }

            cursor.value = response.next_cursor || response.meta?.next_cursor;
            hasMore.value = !!cursor.value;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        serverItems.value = [];
    } finally {
        isLoading.value = false;
    }
};

const debouncedFetch = debounce((search: string) => {
    fetchData(search, true);
}, props.debounceTime);

watch(searchQuery, (newValue) => {
    if (props.serverSide) {
        debouncedFetch(newValue);
    }
});

const handleLoadMore = async () => {
    if (props.serverSide && hasMore.value && !isLoading.value && cursor.value) {
        await fetchData(searchQuery.value, false);
    }
};

const setupIntersectionObserver = () => {
    if (observer.value) {
        observer.value.disconnect();
    }

    observer.value = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    handleLoadMore();
                }
            });
        },
        {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        }
    );

    if (loadMoreRef.value) {
        observer.value.observe(loadMoreRef.value);
    }
};

const customFilter = (itemTitle: string, queryText: string, item: any) => {
    if (!props.serverSide) {
        return itemTitle.toLowerCase().includes(queryText.toLowerCase());
    }
    return true;
};

const setupObserver = async () => {
    await nextTick();
    if (loadMoreRef.value && props.serverSide) {
        setupIntersectionObserver();
    }
};

// Watch for changes in modelValue to update selectedItem (single-select serverSide only)
watch(() => props.modelValue, async (newValue) => {
    if (props.serverSide && newValue != null && !props.multiple) {
        const valueKey = props.itemValueKey || 'value';
        const found = serverItems.value.find(
            (item: any) => item[valueKey] === newValue
        );
        if (found) {
            selectedItem.value = found;
        }
    } else if (!props.multiple) {
        selectedItem.value = null;
    }
}, { immediate: true });

onMounted(() => {
    if (props.serverSide && props.fetchFunction) {
        fetchData("", true);
    }
});

watch(() => loadMoreRef.value, async (newVal) => {
    if (newVal && props.serverSide) {
        await nextTick();
        setupIntersectionObserver();
    }
});

watch(() => displayItems.value.length, async () => {
    if (props.serverSide && hasMore.value) {
        await setupObserver();
    }
});

</script>

<template>
    <div class="select-input-wrapper">
        <label v-if="label" class="qallab-label" :class="labelClass">
            {{ label }}
        </label>

        <v-select v-model="internalValue" :items="displayItems" :placeholder="placeholder" variant="outlined"
            :color="color" :density="density" :disabled="disabled" :readonly="readonly" :clearable="clearable"
            :rules="rules" :error-messages="errorMessages" :hide-details="false" :hint="hint"
            :persistent-hint="persistentHint" :multiple="multiple" item-title="title" item-value="value"
            :item-props="itemProps" :loading="isLoading" :auto-select-first="false" :menu-props="{ maxHeight: 300 }"
            :custom-filter="customFilter" v-bind="{ ...inputProps, ...$attrs }">
            <template v-if="serverSide" #prepend-item>
                <div class="px-3 py-2" @mousedown.stop @click.stop @keydown.stop>
                    <TextInput v-model="searchQuery" density="compact" :placeholder="t('common.actions.search')" clearable hide-details>
                        <template #prepend-inner>
                            <span class="text-gray-500" v-html="searchIcon"></span>
                        </template>
                    </TextInput>
                </div>
                <v-divider class="mb-2" />
            </template>
            <template v-if="serverSide" #no-data>
                <v-list-item>
                    <v-list-item-title class="text-center text-gray-500">
                        {{ isLoading ? t('common.ui.loading') : t('common.ui.noData') }}
                    </v-list-item-title>
                </v-list-item>
            </template>

            <template v-if="serverSide && hasMore && displayItems.length > 0" #append-item>
                <div ref="loadMoreRef" style="height: 1px; visibility: hidden;"></div>
                <v-list-item v-if="isLoading" class="py-2">
                    <v-list-item-title class="text-center">
                        <v-progress-circular indeterminate size="20" color="blue-grey" width="2" class="me-2" />
                        <span class="text-gray-500">{{ t('common.ui.loading') }}</span>
                    </v-list-item-title>
                </v-list-item>
            </template>
            <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps" :title="item.raw.title || item.raw.name || item.raw[itemTitleKey]">
                </v-list-item>
            </template>
        </v-select>
    </div>
</template>

<style scoped></style>
