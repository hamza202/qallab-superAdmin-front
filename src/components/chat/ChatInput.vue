<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { cameraIcon, sendIcon } from "../icons/globalIcons";

const emit = defineEmits<{
  (e: "send", text: string): void;
}>();

const { t } = useI18n();

const messageText = ref("");

function sendMessage() {
  if (messageText.value.trim()) {
    emit("send", messageText.value.trim());
    messageText.value = "";
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}
</script>

<template>
  <div class="border-t !border-gray-200 p-3 md:p-4 bg-white">
    <div class="flex items-end gap-2 md:gap-3">
      <TextInput v-model="messageText" :placeholder="t('chat.typeMessage')" density="comfortable"
        class="flex-1 chat-input " @keydown="handleKeydown">
        <template #append-inner>
          <ButtonWithIcon color="#F1F5F9" size="x-small" icon-only :icon="cameraIcon"></ButtonWithIcon>
        </template>
      </TextInput>

      <ButtonWithIcon icon-only :icon="sendIcon" color="primary" size="small" height="44" class="shrink-0 !rounded-xl md:h-[48px]" :disabled="!messageText.trim()"
        @click="sendMessage" />
      
    </div>
  </div>
</template>


<style>
.chat-input .v-field__prepend-inner,
.chat-input .v-field__field,
.chat-input .v-field {
  background-color: #F1F5F9 !important;
}

.chat-input .v-field {
  border-radius: 16px !important;
}
</style>