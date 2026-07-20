import React from 'react';
import { t } from '../lang/lang.ts';

export type ConfirmDialogOptions = {
  text: string;
  cancelText?: string;
  confirmText?: string;
  danger?: boolean;
};

type ConfirmRequest = {
  text: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
  resolve: (result: boolean) => void;
};

type ConfirmContextValue = (options: ConfirmDialogOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [request, setRequest] = React.useState<ConfirmRequest | null>(null);

  const confirmDialog = React.useCallback<ConfirmContextValue>((options) => {
    return new Promise<boolean>((resolve) => {
      setRequest({
        text: options.text,
        confirmText: options.confirmText ?? t('common.confirm'),
        cancelText: options.cancelText ?? t('common.cancel'),
        danger: options.danger ?? false,
        resolve,
      });
    });
  }, []);

  const settle = (result: boolean) => {
    request?.resolve(result);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirmDialog}>
      {children}
      <div className='modal-overlay confirm-overlay' hidden={!request} onClick={() => settle(false)}>
        {request && (
          <div className='modal-card confirm-card' role='alertdialog' aria-modal='true' onClick={(e) => e.stopPropagation()}>
            <p className='confirm-message'>{request.text}</p>
            <div className='confirm-actions'>
              <button className='btn secondary' onClick={() => settle(false)}>
                {request.cancelText}
              </button>
              <button
                className={request.danger ? 'btn danger' : 'btn'}
                onClick={() => settle(true)}
              >
                {request.confirmText}
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
