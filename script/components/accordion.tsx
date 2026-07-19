import React from 'react';
import { FaChevronDown } from 'react-icons/fa6';

export const Accordion = ({
  title,
  count,
  open: controlledOpen,
  onToggle,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleClick = () => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onToggle?.(next);
  };

  return (
    <div className='accordion'>
      <button
        type='button'
        className='accordion-head'
        onClick={handleClick}
        aria-expanded={open}
      >
        <span className='accordion-title'>
          {title}
          {count != null && <span className='accordion-count'>{count}</span>}
        </span>
        <FaChevronDown className={`accordion-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && <div className='accordion-body'>{children}</div>}
    </div>
  );
};
