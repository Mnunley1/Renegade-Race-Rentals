import { toast } from 'sonner-native';

export function useToasts() {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showInfo = (message: string) => {
    toast.info(message);
  };

  const showWarning = (message: string) => {
    toast.warning(message);
  };

  const showLoading = (message: string) => {
    toast.loading(message);
  };

  const dismiss = () => {
    toast.dismiss();
  };

  const showFavoriteAdded = (vehicleName: string) => {
    toast.success(`${vehicleName} added to favorites`);
  };

  const showFavoriteRemoved = (vehicleName: string) => {
    toast.success(`${vehicleName} removed from favorites`);
  };

  const showComingSoon = (feature: string) => {
    toast.info(`${feature} coming soon!`);
  };

  const showNetworkError = () => {
    toast.error('Network error. Please check your connection.');
  };

  const showAuthError = (message: string) => {
    toast.error(`Authentication error: ${message}`);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
    showFavoriteAdded,
    showFavoriteRemoved,
    showComingSoon,
    showNetworkError,
    showAuthError,
  };
}
