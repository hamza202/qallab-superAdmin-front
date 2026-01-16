<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { watch, onBeforeUnmount, computed, ref } from "vue";

interface RichTextEditorProps {
  modelValue: string;
  placeholder?: string;
  label?: string;
  labelClass?: string;
  disabled?: boolean;
  readonly?: boolean;
  minHeight?: string;
  maxLength?: number;
  rules?: any[];
  errorMessages?: string | string[];
  hideDetails?: boolean | "auto";
}

const props = withDefaults(defineProps<RichTextEditorProps>(), {
  modelValue: "",
  placeholder: "",
  label: "",
  labelClass: "",
  disabled: false,
  readonly: false,
  minHeight: "120px",
  hideDetails: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const validationErrors = ref<string[]>([]);

// Strip HTML tags to get plain text content
const getPlainTextContent = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const validateRules = () => {
  if (!props.rules || props.rules.length === 0) {
    validationErrors.value = [];
    return true;
  }

  // Strip HTML tags before validation
  const plainTextValue = getPlainTextContent(props.modelValue);
  validationErrors.value = [];

  for (const rule of props.rules) {
    const result = rule(plainTextValue);
    if (result !== true) {
      validationErrors.value.push(result);
    }
  }

  return validationErrors.value.length === 0;
};

const displayError = computed(() => {
  if (props.errorMessages) {
    return Array.isArray(props.errorMessages) ? props.errorMessages[0] : props.errorMessages;
  }
  if (validationErrors.value.length > 0) {
    return validationErrors.value[0];
  }
  return null;
});

const hasError = computed(() => {
  return !!displayError.value;
});

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled && !props.readonly,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary-500 underline",
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
    if (props.rules && props.rules.length > 0) {
      validateRules();
    }
  },
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue, { emitUpdate: false });
    }
  }
);

watch(
  () => props.disabled,
  (newValue) => {
    editor.value?.setEditable(!newValue && !props.readonly);
  }
);

watch(
  () => props.readonly,
  (newValue) => {
    editor.value?.setEditable(!newValue && !props.disabled);
  }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const setLink = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  if (url === null) return;

  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.value
    ?.chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

const isActive = (type: string, attrs?: Record<string, any>) => {
  return editor.value?.isActive(type, attrs) ?? false;
};
</script>

<template>
  <div class="rich-text-editor-wrapper">
    <label v-if="label" class="qallab-label" :class="labelClass">
      {{ label }}
    </label>

    <div
      class="editor-container bg-white border rounded-lg overflow-hidden transition-colors duration-200 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
      :class="{
        'opacity-50 pointer-events-none': disabled,
        'border-red-600': hasError,
        'border-gray-300': !hasError,
        'focus-within:border-[#9155fd]': !hasError
      }"
    >
      <!-- Editor Content Area -->
      <div class="editor-content-area px-[14px] py-[12px]" :style="{ minHeight }">
        <EditorContent :editor="editor" class="tiptap-content" />
      </div>

      <!-- Toolbar -->
      <div
        v-if="editor && !readonly"
        class="toolbar bg-gray-50 p-[6px] flex rounded-[4px] mx-[14px] mb-[12px]"
      >
        <div class="flex gap-[2px] items-center">
          <!-- Bold -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('bold') }"
            @click="editor?.chain().focus().toggleBold().run()"
            title="Bold"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            </svg>
          </button>

          <!-- Italic -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('italic') }"
            @click="editor?.chain().focus().toggleItalic().run()"
            title="Italic"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="19" y1="4" x2="10" y2="4" />
              <line x1="14" y1="20" x2="5" y2="20" />
              <line x1="15" y1="4" x2="9" y2="20" />
            </svg>
          </button>

          <!-- Heading -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('heading', { level: 2 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
            title="Heading"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 12h8" />
              <path d="M4 18V6" />
              <path d="M12 18V6" />
              <path d="M17 12a2 2 0 0 1 2 2v4" />
              <path d="M17 18h4" />
              <path d="M21 12h-4" />
            </svg>
          </button>

          <!-- Blockquote -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('blockquote') }"
            @click="editor?.chain().focus().toggleBlockquote().run()"
            title="Quote"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"
              />
            </svg>
          </button>

          <!-- Link -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('link') }"
            @click="setLink"
            title="Link"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          <!-- Bullet List -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('bulletList') }"
            @click="editor?.chain().focus().toggleBulletList().run()"
            title="Bullet List"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>

          <!-- Ordered List -->
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#4b5565] transition-all duration-150 cursor-pointer border-0 bg-transparent hover:bg-[#e3e8ef] hover:text-[#121926]"
            :class="{ 'bg-[#e3e8ef] text-[#121926]': isActive('orderedList') }"
            @click="editor?.chain().focus().toggleOrderedList().run()"
            title="Numbered List"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" />
              <path d="M4 10h2" />
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Validation/Details -->
    <div v-if="!hideDetails" class="mt-1 text-xs">
      <div v-if="displayError" class="text-red-600">
        {{ displayError }}
      </div>
      <div v-else class="text-gray-500">
        <slot name="details"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-content-area :deep(.tiptap) {
  outline: none;
  min-height: inherit;
}

.editor-content-area :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.editor-content-area :deep(.tiptap p) {
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  color: #121926;
  font-family: "Be Vietnam Pro", sans-serif;
}

.editor-content-area :deep(.tiptap h1),
.editor-content-area :deep(.tiptap h2),
.editor-content-area :deep(.tiptap h3) {
  font-weight: 600;
  margin-top: 0.5em;
  margin-bottom: 0.25em;
}

.editor-content-area :deep(.tiptap h1) {
  font-size: 1.5em;
}

.editor-content-area :deep(.tiptap h2) {
  font-size: 1.25em;
}

.editor-content-area :deep(.tiptap h3) {
  font-size: 1.1em;
}

.editor-content-area :deep(.tiptap ul),
.editor-content-area :deep(.tiptap ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
  list-style-type: revert;
}

.editor-content-area :deep(.tiptap blockquote) {
  border-left: 3px solid #e3e8ef;
  padding-left: 1em;
  margin: 0.5em 0;
  color: #4b5565;
}

.editor-content-area :deep(.tiptap a) {
  color: #9155fd;
  text-decoration: underline;
}
</style>
