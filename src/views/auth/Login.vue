<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLocaleStore } from "@/stores/locale";
import AuthLayout from "@/layouts/AuthLayout.vue";

const { t } = useI18n();
const localeStore = useLocaleStore();

// Form data
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const isLoading = ref(false);
const showPassword = ref(false);

// Form validation
const formRef = ref<any>(null);
const isFormValid = ref(false);

// Translation key for AuthLayout
const layoutTranslationKey = 'auth.supplierDashboard';

// Handle login
const handleLogin = async () => {
  const { valid } = await formRef.value?.validate();
  if (valid) {
    isLoading.value = true;
    console.log("Login with:", { email: email.value, password: password.value, rememberMe: rememberMe.value });
    // Add your login logic here
    setTimeout(() => {
      isLoading.value = false;
    }, 2000);
  }
};

// Handle forgot password
const handleForgotPassword = () => {
  console.log("Forgot password clicked");
};

// Handle create account
const handleCreateAccount = () => {
  console.log("Create account clicked");
};
</script>

<template>
  <AuthLayout :translation-key="layoutTranslationKey">
    <div class="w-full">
      <!-- Logo for mobile -->
      <div class="flex mb-8">
        <img 
          src="/logo.svg" 
          alt="Qallab Logo" 
          class="w-[104px] h-auto"
        />
      </div>

      <!-- Header -->
      <div class="mb-8" :class="localeStore.isRtl ? 'text-right' : 'text-left'">
        <h1 class="text-[28px] font-semibold mb-3" :class="localeStore.isRtl ? 'text-right' : 'text-left'">
          <span class="text-[#121926]">{{ t('auth.loginText') }}&nbsp;</span>
          <span class="text-[#1570ef] font-bold inline-block"> {{ t('auth.supplierDashboardText') }}</span>
        </h1>
        <p class="text-base text-[#4B5565] leading-6">
          {{ t('auth.loginSubtitle') }}
        </p> 
      </div>

      <!-- Login Form -->
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleLogin">
        <div class="space-y-5">
          <!-- Email Field -->
          <TextInput
            v-model="email"
            :label="t('auth.email')"
            :placeholder="t('auth.emailPlaceholder')"
            type="email"
            :rules="[(v: string) => !!v || t('auth.emailRequired'), (v: string) => /.+@.+\..+/.test(v) || t('auth.emailInvalid')]"
            :hide-details="false"
          />

          <!-- Password Field -->
          <div class="relative">
            <TextInput
              v-model="password"
              :label="t('auth.password')"
              :placeholder="t('auth.passwordPlaceholder')"
              :type="showPassword ? 'text' : 'password'"
              :rules="[(v: string) => !!v || t('auth.passwordRequired'), (v: string) => v.length >= 6 || t('auth.passwordMinLength')]"
              :hide-details="false"
            >
              <template #append-inner>
                <ButtonWithIcon :icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" icon-only variant="text" size="small" @click="showPassword = !showPassword" />
              </template>
            </TextInput>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2" :class="localeStore.isRtl ? 'order-2' : 'order-1'">
              <CheckboxInput
                v-model="rememberMe"
                :label="t('auth.rememberMe')"
                color="primary"
                hide-details
              />
            </div>
            <button
              type="button"
              @click="handleForgotPassword"
              class="text-sm font-semibold text-[#175CD3] hover:text-[#1570EF] transition-colors"
              :class="localeStore.isRtl ? 'order-1' : 'order-2'"
            >
              {{ t('auth.forgotPassword') }}
            </button>
          </div>

          <!-- Login Button -->
          <ButtonWithIcon type="submit" variant="flat" color="primary" size="large" custom-class="mt-6" label="تسجيل الدخول" block :loading="isLoading" />

          <!-- Create Account Link -->
          <div class="flex items-center justify-center gap-1 text-sm" :class="localeStore.isRtl ? 'flex-row' : 'flex-row-reverse'">
            <button
              type="button"
              @click="handleCreateAccount"
              class="font-semibold text-[#175CD3] hover:text-[#1570EF] transition-colors"
              :class="localeStore.isRtl ? 'order-2' : 'order-1'"
            >
              {{ t('auth.createAccount') }}
            </button>
            <span class="text-[#697586]" :class="localeStore.isRtl ? 'order-1' : 'order-2'">{{ t('auth.noAccount') }}</span>
          </div>
        </div>
      </v-form>
    </div>
  </AuthLayout>
</template>

<style scoped>
.space-y-5 > * + * {
  margin-top: 1.25rem;
}
</style>