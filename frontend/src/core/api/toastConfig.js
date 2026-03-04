export function withErrorToast(options = {}, errorMessage) {
  return {
    ...options,
    toastError: options.toastError ?? errorMessage,
  };
}

export function withMutationToast(options = {}, { success, error }) {
  return {
    ...options,
    toastSuccess: options.toastSuccess ?? success,
    toastError: options.toastError ?? error,
  };
}
