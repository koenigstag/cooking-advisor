import React from 'react';
import { t } from '../lang/lang.ts';

export type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmRequest = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  resolve: (result: boolean) => void;
};

type ConfirmContextValue = (message: string, options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [request, setRequest] = React.useState<ConfirmRequest | null>(null);

  const confirm = React.useCallback<ConfirmContextValue>((message, options) => {
    return new Promise<boolean>((resolve) => {
      setRequest({
        message,
        confirmLabel: options?.confirmLabel ?? t('common.confirm'),
        cancelLabel: options?.cancelLabel ?? t('common.cancel'),
        danger: options?.danger ?? false,
        resolve,
      });
    });
  }, []);

  const settle = (result: boolean) => {
    request?.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <div className='modal-overlay confirm-overlay' hidden={!request} onClick={() => settle(false)}>
        {request && (
          <div className='modal-card confirm-card' role='alertdialog' aria-modal='true' onClick={(e) => e.stopPropagation()}>
            <p className='confirm-message'>{request.message}</p>
            <div className='confirm-actions'>
              <button className='btn secondary' onClick={() => settle(false)}>
                {request.cancelLabel}
              </button>
              <button
                className={request.danger ? 'btn danger' : 'btn'}
                onClick={() => settle(true)}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </ConfirmContext.Provider>
  );
};

export function useConfirm(): ConfirmContextValue {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}
