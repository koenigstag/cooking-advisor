import React from 'react';
import { FaCircleCheck, FaCircleExclamation, FaCircleInfo, FaTriangleExclamation, FaXmark } from 'react-icons/fa6';
import { uid } from '../utils.ts';

export type SnackbarVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type EnqueueSnackbarOptions = {
  variant?: SnackbarVariant;
  autoHideDuration?: number | null;
};

type SnackbarItem = {
  key: string;
  message: string;
  variant: SnackbarVariant;
  autoHideDuration: number | null;
};

type SnackbarContextValue = {
  enqueueSnackbar: (message: string, options?: EnqueueSnackbarOptions) => string;
  closeSnackbar: (key: string) => void;
};

const SnackbarContext = React.createContext<SnackbarContextValue | null>(null);

const DEFAULT_AUTO_HIDE_DURATION = 4000;

const VARIANT_ICONS: Record<SnackbarVariant, React.ReactNode> = {
  default: <FaCircleInfo />,
  info: <FaCircleInfo />,
  success: <FaCircleCheck />,
  warning: <FaTriangleExclamation />,
  error: <FaCircleExclamation />,
};

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [snackbars, setSnackbars] = React.useState<SnackbarItem[]>([]);

  const closeSnackbar = React.useCallback((key: string) => {
    setSnackbars((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const enqueueSnackbar = React.useCallback(
    (message: string, options?: EnqueueSnackbarOptions) => {
      const key = uid();
      const autoHideDuration =
        options?.autoHideDuration === undefined
          ? DEFAULT_AUTO_HIDE_DURATION
          : options.autoHideDuration;
      setSnackbars((prev) => [
        ...prev,
        { key, message, variant: options?.variant ?? 'default', autoHideDuration },
      ]);
      return key;
    },
    []
  );

  const contextValue = React.useMemo(
    () => ({ enqueueSnackbar, closeSnackbar }),
    [enqueueSnackbar, closeSnackbar]
  );

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <div className='snackbar-stack'>
        {snackbars.map((s) => (
          <Snackbar key={s.key} item={s} onClose={() => closeSnackbar(s.key)} />
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

const Snackbar = ({ item, onClose }: { item: SnackbarItem; onClose: () => void }) => {
  React.useEffect(() => {
    if (item.autoHideDuration == null) return;
    const timer = setTimeout(onClose, item.autoHideDuration);
    return () => clearTimeout(timer);
  }, [item.autoHideDuration, onClose]);

  return (
    <div className={`snackbar snackbar-${item.variant}`} role='status'>
      <span className='snackbar-icon'>{VARIANT_ICONS[item.variant]}</span>
      <span className='snackbar-message'>{item.message}</span>
      <button className='snackbar-close' aria-label='Close' onClick={onClose}>
        <FaXmark />
      </button>
    </div>
  );
};

export function useSnackbar(): SnackbarContextValue {
  const ctx = React.useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return ctx;
}
