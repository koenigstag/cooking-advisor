import React from 'react';
import { t } from '../lang/lang.ts';

export function LoadingState() {
  return (
    <div className='empty-state'>
      <div className='display'>{t('loading')}</div>
    </div>
  );
}
