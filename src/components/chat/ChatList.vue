<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { searchIcon } from "../icons/globalIcons";

interface ChatConversation {
  id: string;
  companyName: string;
  avatar: string;
  avatarColor: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

const props = defineProps<{
  searchQuery: string;
  selectedChatId: string | null;
}>();

const emit = defineEmits<{
  (e: "selectChat", chatId: string): void;
  (e: "update:searchQuery", value: string): void;
}>();

const { t } = useI18n();

const conversations = ref<ChatConversation[]>([
  {
    id: "1",
    companyName: "شركة مكة للمقاولات",
    avatar: "MC",
    avatarColor: "#7DD3C0",
    lastMessage: "شرطا أولى الشركة الموحدة",
    timestamp: "23:15",
    unread: false,
  },
  {
    id: "2",
    companyName: "شركة زهد للمواد الأولية",
    avatar: "NK",
    avatarColor: "#2E5C99",
    lastMessage: "شرطا أولى الشركة الموحدة",
    timestamp: "23:15",
    unread: false,
  },
  {
    id: "3",
    companyName: "شركة أرض الأحلام",
    avatar: "SA",
    avatarColor: "#E74C3C",
    lastMessage: "شرطا أولى الشركة الموحدة",
    timestamp: "23:15",
    unread: false,
  },
  {
    id: "4",
    companyName: "شركة الحديد والصلب",
    avatar: "CM",
    avatarColor: "#27AE60",
    lastMessage: "شرطا أولى الشركة الموحدة",
    timestamp: "23:15",
    unread: false,
  },
  {
    id: "5",
    companyName: "شركة الموحدة",
    avatar: "RM",
    avatarColor: "#95A5A6",
    lastMessage: "شرطا أولى الشركة الموحدة",
    timestamp: "23:15",
    unread: false,
  },
]);

const filteredConversations = computed(() => {
  if (!props.searchQuery) return conversations.value;
  return conversations.value.filter((conv) =>
    conv.companyName.toLowerCase().includes(props.searchQuery.toLowerCase())
  );
});

function selectChat(chatId: string) {
  emit("selectChat", chatId);
}

function updateSearch(value: string | number | null) {
  emit("update:searchQuery", value?.toString() || "");
}
</script>

<template>
  <div class="w-full md:w-[450px] border-0 md:border !border-gray-100 rounded-none md:rounded-xl flex flex-col bg-white">
    <div class="p-3 md:p-4 border-b !border-gray-100">
      <TextInput :model-value="searchQuery" :placeholder="t('chat.search')" variant="outlined" density="comfortable"
        hide-details class="chat-search" :inputProps="{ class: '!bg-gary-50'}" @update:model-value="updateSearch">
        <template #prepend-inner>
          <span class="text-gray-500" v-html="searchIcon"></span>
        </template>

      </TextInput>
    </div>

    <div class="flex-1 overflow-y-auto light-scroll max-h-none md:max-h-[500px]">
      <div v-for="conversation in filteredConversations" :key="conversation.id"
        class="flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-colors border-b !border-gray-100 hover:bg-gray-50 active:bg-gray-100"
        :class="{ 'bg-blue-50': selectedChatId === conversation.id }" @click="selectChat(conversation.id)">
        <div class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          :style="{ backgroundColor: conversation.avatarColor }">
          {{ conversation.avatar }}
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-bold text-gray-900 m-0 text-sm leading-tight truncate">
            {{ conversation.companyName }}
          </p>
          <p class="text-xs text-gray-500 m-0 mt-1 truncate">
            {{ conversation.lastMessage }}
          </p>
        </div>

        <div class="shrink-0 text-xs text-gray-400">
          {{ conversation.timestamp }}
        </div>
      </div>

      <div v-if="filteredConversations.length === 0" class="text-center text-gray-400 py-12 text-sm">
        {{ t("chat.noConversations") }}
      </div>
    </div>
  </div>
</template>

<style>
.light-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d9dee5 transparent;
}

.light-scroll::-webkit-scrollbar {
  width: 6px;
}

.light-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.light-scroll::-webkit-scrollbar-thumb {
  background: #d9dee5;
  border-radius: 999px;
}

.light-scroll::-webkit-scrollbar-thumb:hover {
  background: #cfd6de;
}
.chat-search .v-field__prepend-inner,
.chat-search .v-field__field,
.chat-search .v-field {
  background-color: #F8FAFC !important;
}

</style>
