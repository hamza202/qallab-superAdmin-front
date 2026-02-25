import { ref, nextTick } from 'vue';

export function useForm() {
  const formRef = ref<any>(null);
  const isFormValid = ref(false);

  const scrollToFirstError = async () => {
    await nextTick();
    
    // Find all errors in the form
    const errors = document.querySelectorAll('.v-input--error');
    if (errors.length > 0) {
      const firstError = errors[0] as HTMLElement;
      
      // If the element is hidden (e.g. inside a hidden tab), scroll to its closest visible container
      // such as .language-tabs-wrapper, so the user knows where the error is
      if (firstError.offsetParent === null) {
        let wrapper = firstError.closest('.language-tabs-wrapper') as HTMLElement;
        if (wrapper) {
           wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
           return;
        }
      }
      
      // Fallback: normal scroll
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
