<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
const { t } = useI18n()
</script>

<template>
  <default-layout>
      <h1 class="text-h4 mb-4">{{ t('navigation.dashboard') }}</h1>
      <v-card>
        <v-card-title>{{ t('app.welcome') }}</v-card-title>
      </v-card>
  </default-layout>
</template>