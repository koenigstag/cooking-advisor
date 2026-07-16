import React from 'react';
import { FaXmark } from 'react-icons/fa6';
import { t } from '../lang/lang.ts';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
}

export const Modal = ({ open, onClose }: ModalProps) => {
  return (
    <div className='modal-overlay' id='modalOverlay' hidden={!open}>
      <div
        className='modal-card'
        role='dialog'
        aria-modal='true'
        aria-labelledby='ioModalTitle'
      >
        <div className='modal-head'>
          <h3 id='ioModalTitle'>{t('exportImport.modalTitle')}</h3>
          <button
            id='ioModalClose'
            className='modal-close'
            aria-label={t('common.close')}
            onClick={onClose}
          >
            <FaXmark />
          </button>
        </div>
        <div className='modal-body'>
          <div className='io-block'>
            <h4>{t('exportImport.export.title')}</h4>
            <p>{t('exportImport.export.description')}</p>
            <button id='exportBtn' className='btn'>
              {t('exportImport.export.downloadBtn')}
            </button>
          </div>
          <div className='io-block'>
            <h4>{t('exportImport.import.title')}</h4>
            <p>{t('exportImport.import.description')}</p>
            <button id='importBtn' className='btn secondary'>
              {t('exportImport.import.uploadBtn')}
            </button>
            <input
              type='file'
              style={{ display: 'none' }}
              id='importFile'
              accept='application/json'
            />
          </div>
        </div>
      </div>
    </div>
  );
};
