<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ t('navigation.dashboard') }}</h1>
    <v-card>
      <v-card-title>{{ t('app.welcome') }}</v-card-title>
    </v-card>
  </v-container>
</template>