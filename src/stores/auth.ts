import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(
    "1|1SL94sqmJrmGQu9TCY8ohKcAwzsstWyQhK00j0h58683027a"
  );

  return {
    token,
  };
});
