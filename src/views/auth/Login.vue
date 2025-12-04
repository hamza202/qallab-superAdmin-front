<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import AuthLayout from "@/layouts/AuthLayout.vue";
import TextInput from "@/components/common/forms/textInput.vue";
import CheckboxInput from "@/components/common/forms/checkboxInput.vue";
import SelectInput from "@/components/common/forms/selectInput.vue";

const { t } = useI18n();

// Form data
const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const branchAccount = ref(false);
const multiAccounts = ref(false);
const accountType = ref<string | number | null>(null);
const businessName = ref("");
const isLoading = ref(false);

const accountTypeItems = computed(() => [
  { title: t('auth.accountTypeMain'), value: 'main' },
  { title: t('auth.accountTypeBranch'), value: 'branch' },
]);

watch(branchAccount, (val) => {
  if (val) {
    multiAccounts.value = false;
  }
});

watch(multiAccounts, (val) => {
  if (val) {
    branchAccount.value = false;
  }
});

</script>

<template>
  <AuthLayout>
    <v-card class="mx-auto shadow-[0_0_14.6px_0_#0000000F]" rounded="xl">
      <v-card-text class="px-6 py-8">
        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-lg font-bold mb-2">
            {{ t('auth.welcomeBack') }}
          </h1>
          <div class="text-sm text-gray-600">
            {{ t('auth.loginSubtitle') }}
          </div>
        </div>

        <!-- Login Form -->
        <v-form>
          <!-- Username Field -->
          <TextInput v-model="username" :label="t('auth.username')" :placeholder="t('auth.usernamePlaceholder')"
            bg-color="#FAFAFA" :rounded="'sm'" :hide-details="true" label-class="text-sm font-semibold text-gray-800"
            class="mb-5" />

          <!-- Password Field -->
          <TextInput v-model="password" :label="t('auth.password')" :placeholder="t('auth.passwordPlaceholder')"
            type="password" passwordToggle bg-color="#FAFAFA" :rounded="'sm'" :hide-details="true"
            label-class="text-sm font-semibold text-gray-800" class="mb-5" />


          <!-- Checkboxes & Forgot Password -->
          <div class="mb-6 text-sm">
            <div class="flex justify-between items-center flex-wrap">
              <div class="flex items-center justify-end gap-1">
                <CheckboxInput v-model="branchAccount" :label="t('auth.branchAccount')" color="indigo" />
              </div>


              <div class="flex items-center justify-start gap-1">
                <CheckboxInput v-model="multiAccounts" :label="t('auth.multiAccounts')" color="indigo" />
              </div>
            </div>

            <Transition name="fade-slide">
              <div v-if="branchAccount || multiAccounts" class="mt-4">
                <SelectInput v-model="accountType" :label="t('auth.accountType')"
                  :placeholder="t('auth.accountTypePlaceholder')" :items="accountTypeItems" bg-color="#FAFAFA"
                  :rounded="'lg'" :hide-details="true" label-class="text-sm font-semibold text-gray-800" />
              </div>
            </Transition>

            <Transition name="fade-slide">
              <div v-if="branchAccount" class="mt-4">
                <TextInput v-model="businessName" :label="t('auth.businessName')"
                  :placeholder="t('auth.businessNamePlaceholder')" bg-color="#FAFAFA" :rounded="'lg'"
                  :hide-details="true" label-class="text-sm font-semibold text-gray-800" />
              </div>
            </Transition>

            <div class="flex justify-between items-center flex-wrap">
              <div class="flex items-center justify-end gap-2">
                <CheckboxInput v-model="rememberMe" :label="t('auth.rememberMeShort')" color="indigo" />
              </div>

              <div class="flex items-center justify-start">
                <button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {{ t('auth.forgotPassword') }}
                </button>
              </div>
            </div>
          </div>

          <v-btn type="submit" color="#1868DB" rounded="lg"
            class="text-none transition-colors duration-200 hover:!bg-[#FFB73F] font-bold" block height="44"
            :loading="isLoading" :disabled="!username || !password">
            {{ t('auth.loginButton') }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </AuthLayout>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
