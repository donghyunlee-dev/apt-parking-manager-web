import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import useUiStore from '@/shared/store/uiStore';

const ToastListener = () => {
  const toastMessages = useUiStore((state) => state.toastMessages);
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    toastMessages.forEach((message) => {
      if (message.type === 'success') toast.success(message.message);
      if (message.type === 'error') toast.error(message.message);
      if (message.type === 'info') toast(message.message);
      removeToast(message.id);
    });
  }, [toastMessages, removeToast]);

  return null;
};

export default ToastListener;
