<script setup lang="ts">
import { computed } from 'vue';

interface CategoryListItem {
  id: number;
  name: string;
  parentId?: number | null;
  children?: CategoryListItem[];
  taxes?: any[];
}

interface Props {
  category: CategoryListItem;
  level?: number;
  selectedCategoryIds: number[];
  expandedCategoryIds: number[];
  isCategorySelected: (id: number) => boolean;
  isCategoryExpanded: (id: number) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0
});

const emit = defineEmits<{
  select: [category: CategoryListItem, isSubcategory: boolean];
  toggleExpand: [id: number];
  'update:selected-ids': [ids: number[]];
}>();

const isChecked = computed(() => props.selectedCategoryIds.includes(props.category.id));

const handleCheckboxChange = (checked: boolean | null) => {
  let newIds = [...props.selectedCategoryIds];
  if (checked) {
    if (!newIds.includes(props.category.id)) {
      newIds.push(props.category.id);
    }
  } else {
    newIds = newIds.filter(id => id !== props.category.id);
  }
  emit('update:selected-ids', newIds);
};

const handleSelect = () => {
  emit('select', props.category, props.level > 0);
};

const handleToggleExpand = () => {
  emit('toggleExpand', props.category.id);
};
</script>

<template>
  <div class="space-y-2">
    <!-- Category Row -->
    <div 
      class="flex items-center gap-2 px-2 py-1 rounded-lg transition-all cursor-pointer"
      :class="[
        level === 0 
          ? 'text-white ' + (isCategorySelected(category.id) ? 'bg-primary-900 shadow-md' : 'bg-primary-500 hover:bg-primary-600')
          : 'border ' + (isCategorySelected(category.id) ? 'bg-gray-300 border-gray-400 text-white shadow-sm' : 'bg-gray-100 border-gray-100 text-gray-700 hover:bg-gray-200')
      ]"
      :style="{ marginLeft: level > 0 ? (level * 16) + 'px' : '0' }"
      @click="handleSelect"
    >
      <!-- Checkbox -->
      <div class="flex items-center">
        <CheckboxInput 
          :model-value="isChecked"
          @update:model-value="handleCheckboxChange"
          density="compact" 
          hide-details
          :input-props="{ class: 'white-checkbox' }"
          :color="level === 0 && isCategorySelected(category.id) ? 'white' : (level > 0 && isCategorySelected(category.id) ? 'white' : 'primary')"
          class="m-0" 
          @click.stop 
        />
      </div>

      <!-- Category Name -->
      <span class="flex-1 text-base" :class="level === 0 ? 'font-normal' : 'font-semibold'">
        {{ category.name }}
      </span>

      <!-- Expand/Collapse Icon -->
      <button 
        v-if="category.children && category.children.length" 
        type="button" 
        class="flex-shrink-0"
        @click.stop="handleToggleExpand"
      >
        <v-icon size="20" :color="level === 0 && isCategorySelected(category.id) ? 'white' : 'gray'">
          {{ isCategoryExpanded(category.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
      </button>
      <div v-else class="w-5"></div>
    </div>

    <!-- Recursive Children -->
    <div 
      v-if="category.children && category.children.length && isCategoryExpanded(category.id)"
      class="space-y-2"
    >
      <CategoryTreeItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        :selected-category-ids="selectedCategoryIds"
        :expanded-category-ids="expandedCategoryIds"
        :is-category-selected="isCategorySelected"
        :is-category-expanded="isCategoryExpanded"
        @select="(cat, isSub) => emit('select', cat, isSub)"
        @toggle-expand="(id) => emit('toggleExpand', id)"
        @update:selected-ids="(ids) => emit('update:selected-ids', ids)"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
