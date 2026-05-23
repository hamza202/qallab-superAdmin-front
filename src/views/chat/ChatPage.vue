<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ChatList from "@/components/chat/ChatList.vue";
import ChatWindow from "@/components/chat/ChatWindow.vue";
import { emptyChatIcon, messageSquareIcon } from "@/components/icons/globalIcons";

const { t } = useI18n();

const selectedChatId = ref<string | null>(null);
const searchQuery = ref("");

function onSelectChat(chatId: string) {
  selectedChatId.value = chatId;
}

function onBackToList() {
  selectedChatId.value = null;
}

const hasSelectedChat = computed(() => selectedChatId.value !== null);
</script>

<template>
  <default-layout>
    <div class="flex flex-col h-full -mx-6 bg-gray-50">
      <!-- Header - Hidden on mobile when chat is selected -->
      <div 
        class="flex items-center gap-3 bg-primary-500 rounded-xl mb-4 p-4 md:p-6"
        :class="{ 'hidden md:flex': hasSelectedChat }"
      >
        <span v-html="messageSquareIcon" class="hidden md:block"></span>
        <div>
          <h1 class="text-lg md:text-xl font-bold m-0 text-white">
            {{ t("chat.title") }}
          </h1>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden gap-0 md:gap-3 mb-0 md:mb-6">
        <!-- Chat List - Hidden on mobile when chat is selected -->
        <ChatList 
          :search-query="searchQuery" 
          :selected-chat-id="selectedChatId" 
          :class="{ 'hidden md:flex': hasSelectedChat }"
          @select-chat="onSelectChat"
          @update:search-query="searchQuery = $event" 
        />

        <!-- Chat Window - Full width on mobile -->
        <ChatWindow 
          v-if="hasSelectedChat" 
          :chat-id="selectedChatId!" 
          class="w-full md:flex-1"
          @back="onBackToList"
        />

        <!-- Empty State - Hidden on mobile, shown on desktop -->
        <div 
          v-else 
          class="hidden md:flex flex-1 items-center justify-center bg-white border !border-gray-100 rounded-xl"
        >
          <div class="text-center space-y-4">
            <span v-html="emptyChatIcon"></span>
            <p class="text-lg font-semibold text-gray-400">{{ t("chat.selectConversation") }}</p>
            <ButtonWithIcon 
              :label="t('chat.startNewConversation')" 
              size="large" 
              color="primary" 
              rounded="lg" 
              variant="flat"
              height="44" 
              class="px-8" 
            />
          </div>
        </div>
      </div>
    </div>
  </default-layout>
</template>

<style scoped>
.flex-1 {
  min-height: 0;
}
</style>
