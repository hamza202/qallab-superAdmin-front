<script setup lang="ts">
interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  isRead: boolean;
}

defineProps<{
  message: ChatMessage;
}>();
</script>

<template>
  <div class="flex" :class="message.isSent ? 'justify-start' : 'justify-end'">
    <div class="max-w-[85%] md:max-w-[70%]">
      <div class="rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm" :class="message.isSent
          ? 'bg-[#2972FF] text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
        ">

        <p class="m-0 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {{ message.text }}
        </p>
      </div>
      <div class="flex items-center gap-1 mt-1 md:mt-2 text-xs text-gray-500 " :class="message.isSent ?  'justify-start' : 'justify-end'">
        <span class="text-[10px] md:text-xs">{{ message.timestamp }}</span>
        <span v-if="message.isSent && message.isRead" class="text-[10px] md:text-xs">✓✓</span>
        <span v-else-if="message.isSent" class="text-[10px] md:text-xs">✓</span>
      </div>
    </div>
  </div>
</template>
