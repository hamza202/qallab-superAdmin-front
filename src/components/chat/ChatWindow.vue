<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import { emptyChatIcon } from "../icons/globalIcons";

interface ChatMessageType {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  isRead: boolean;
}

const props = defineProps<{
  chatId: string;
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const { t } = useI18n();

const messages = ref<ChatMessageType[]>([
  {
    id: "1",
    text: "مرحباً .. شكراً لله",
    timestamp: "23:10",
    isSent: false,
    isRead: true,
  },
  {
    id: "2",
    text: "نود اعلامك ان الطلبية قيد التجهيز حاليا، سيتم التسليم منها لك في غضون 24 ساعة",
    timestamp: "23:10",
    isSent: true,
    isRead: true,
  },
  {
    id: "3",
    text: "شكراً لكم وتأمل منكم استلامها في الوقت وقت",
    timestamp: "23:15",
    isSent: false,
    isRead: true,
  },
  {
    id: "4",
    text: "ان شاء الله في اقرب وقت",
    timestamp: "23:15",
    isSent: true,
    isRead: true,
  },
]);

const messagesContainer = ref<HTMLElement | null>(null);
const isEmpty = computed(() => messages.value.length === 0);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function handleSendMessage(text: string) {
  const newMessage: ChatMessageType = {
    id: Date.now().toString(),
    text,
    timestamp: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isSent: true,
    isRead: false,
  };
  messages.value.push(newMessage);
  scrollToBottom();
}

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="flex-1 flex flex-col bg-white border-0 md:border !border-gray-100 overflow-hidden rounded-none md:rounded-xl">
    <div class="p-3 md:p-4 border-b !border-gray-100">
      <div class="flex items-center gap-3">
        <!-- Back button for mobile -->
        <button 
          class="md:hidden text-gray-500 p-2 -mr-2 hover:bg-gray-100 bg-gray-50 active:bg-gray-200 rounded-lg transition-colors"
          @click="emit('back')"
          aria-label="Back to chat list"
        >
          <v-icon> mdi-chevron-right </v-icon>
        </button>
        
        <div
          class="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center bg-[#78BCBB] justify-center text-white font-bold text-sm shrink-0">
          MC</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 m-0 text-base md:text-lg leading-tight truncate">شركة مكة للمقاولات</p>
        </div>
      </div>
    </div>

    <div v-if="isEmpty" class="flex-1 flex flex-col gap-4 items-center justify-center text-center p-4 md:p-8">
      <span v-html="emptyChatIcon" class="scale-75 md:scale-100"></span>
      <p class="text-base md:text-lg font-semibold text-gray-400">{{ t("chat.noMessages") }}</p>
      <ButtonWithIcon :label="t('chat.startChat')" size="large" color="primary" rounded="lg" variant="flat" height="44"
        class="px-6 md:px-8" />
    </div>

    <template v-else>
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 max-h-none md:max-h-[450px] light-scroll">
        <div class="text-center mb-6">
          <span class="text-xs font-bold text-gray-500 py-4">
            {{ t("chat.today") }}
          </span>
        </div>

        <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
      </div>

      <ChatInput @send="handleSendMessage" />
    </template>
  </div>
</template>

<style scoped>
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
</style>
