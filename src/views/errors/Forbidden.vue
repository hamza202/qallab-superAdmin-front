<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="flex min-h-screen w-full bg-white">
    <!-- Left Content Section -->
    <div class="flex flex-1 items-center justify-center py-24 min-w-[50%]">
      <div class="w-full max-w-[576px] px-8 pr-16 flex flex-col gap-9">
        <!-- 403 SVG Illustration -->
        <div class="inline-flex">
          <svg width="213" height="68" viewBox="0 0 213 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="55" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#1570EF">403</text>
          </svg>
        </div>

        <!-- Heading and Supporting Text -->
        <div class="flex flex-col gap-6">
          <h1 class="lg:text-[50px] font-bold text-xl tracking-[-1.2px] text-[#121926] my-6 lg:my-8">
            {{ t('common.errors.accessDenied') }}
          </h1>
          <p class="text-xl leading-[30px] text-[#697586] m-0 font-[Be_Vietnam_Pro]">
            {{ t('common.errors.accessDeniedDescription') }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 flex-wrap">
          <v-btn
            variant="outlined"
            size="large"
            class="go-back-btn !font-semibold !text-base !normal-case !border-[#CDD5DF] !text-[#364152] !px-[18px] !py-[10px] !h-[44px]"
            @click="goBack"
          >
            <v-icon start size="18" class="rtl:rotate-180">mdi-arrow-left</v-icon>
            {{ t('common.errors.goBack') }}
          </v-btn>

          <v-btn
            variant="flat"
            color="primary"
            size="large"
            class="home-btn !font-semibold !text-base !normal-case !bg-[#1570EF] !text-white !px-[18px] !py-[10px] !h-[44px]"
            @click="goHome"
          >
            {{ t('common.errors.takeMeHome') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Right Background Section -->
    <div class="flex-1 relative min-w-[50%] overflow-hidden">
      <!-- Background Image -->
      <img src="/404-bg.webp" alt="" class="w-full h-full object-cover" />
      
      <!-- White Logo -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <img src="/white-logo.svg" alt="Qallab Logo" class="w-[200px] h-auto" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.go-back-btn:hover {
  background-color: #f9fafb !important;
  border-color: #9aa4b2 !important;
}

.home-btn:hover {
  background-color: #175CD3 !important;
}

/* Responsive styles */
@media (max-width: 1024px) {
  .flex.min-h-screen {
    flex-direction: column;
  }
}
</style>
