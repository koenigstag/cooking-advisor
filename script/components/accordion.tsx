import React from 'react';
import { FaChevronDown } from 'react-icons/fa6';

export const Accordion = ({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className='accordion'>
      <button
        type='button'
        className='accordion-head'
        onClick={() => setOpen(!open)}
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
