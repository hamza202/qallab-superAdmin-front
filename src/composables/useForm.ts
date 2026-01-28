import { ref, nextTick } from 'vue';

export function useForm() {
  const formRef = ref<any>(null);
  const isFormValid = ref(false);

  const scrollToFirstError = async () => {
    await nextTick();
    const firstError = document.querySelector('.v-input--error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validate = async (): Promise<boolean> => {
    if (!formRef.value) return false;
    
    const { valid } = await formRef.value.validate();
    
    if (!valid) {
      await scrollToFirstError();
      return false;
    }
    
    return true;
  };

  return {
    formRef,
    isFormValid,
    validate,
    scrollToFirstError
  };
}

export default useForm;
