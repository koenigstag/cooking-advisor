import React from 'react';
import { ICON_MAP, type IconId } from './icon-map.ts';
import { Icon } from './icon.tsx';

const ICON_IDS = Object.keys(ICON_MAP) as IconId[];

export interface IconPickerProps {
  value?: IconId;
  onChange: (id: IconId | undefined) => void;
  title?: string;
}

export const IconPicker = ({ value, onChange, title }: IconPickerProps) => {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const handlePick = (id: IconId) => {
    onChange(value === id ? undefined : id);
    setOpen(false);
  };

  return (
    <div className='icon-picker-wrap' ref={wrapRef}>
      <button
        type='button'
        className='icon-picker-trigger'
        title={title}
        aria-haspopup='true'
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? <Icon id={value} /> : <span className='icon-picker-dot' />}
      </button>
      {open && (
        <div className='icon-picker-popover'>
          {ICON_IDS.map((id) => (
            <button
              key={id}
              type='button'
              className={id === value ? 'selected' : ''}
              title={id}
              onClick={() => handlePick(id)}
            >
              <Icon id={id} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
