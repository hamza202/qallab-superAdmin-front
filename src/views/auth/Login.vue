<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue";

const { t } = useI18n();

// Form data
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);

</script>

<template>
  <AuthLayout>
    <div>
      test
    </div>
  </AuthLayout>
</template>
