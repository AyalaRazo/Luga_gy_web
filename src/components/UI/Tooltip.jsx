import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip accesible con portal — se renderiza en document.body para
 * evitar que sea recortado por overflow/stacking contexts de padres.
 */
export default function Tooltip({
  content,
  position = 'top',
  delay = 120,
  maxWidth = 'max-w-xs',
  children,
}) {
  const [visible, setVisible]   = useState(false);
  const [coords,  setCoords]    = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timer      = useRef(null);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap  = 8;

    let top, left;
    switch (position) {
      case 'bottom':
        top  = rect.bottom + gap + window.scrollY;
        left = rect.left   + rect.width / 2 + window.scrollX;
        break;
      case 'left':
        top  = rect.top    + rect.height / 2 + window.scrollY;
        left = rect.left   - gap + window.scrollX;
        break;
      case 'right':
        top  = rect.top    + rect.height / 2 + window.scrollY;
        left = rect.right  + gap + window.scrollX;
        break;
      case 'top':
      default:
        top  = rect.top    - gap + window.scrollY;
        left = rect.left   + rect.width / 2 + window.scrollX;
        break;
    }
    setCoords({ top, left });
  }, [position]);

  const show = useCallback(() => {
    calcPosition();
    timer.current = setTimeout(() => setVisible(true), delay);
  }, [calcPosition, delay]);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setVisible(false);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Transforms to center the tooltip on the trigger
  const transformMap = {
    top:    'translateX(-50%) translateY(-100%)',
    bottom: 'translateX(-50%)',
    left:   'translateX(-100%) translateY(-50%)',
    right:  'translateY(-50%)',
  };

  const arrowStyle = {
    top: {
      bottom: '-4px', left: '50%',
      transform: 'translateX(-50%)',
      borderTop: '4px solid #1f2937',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
    },
    bottom: {
      top: '-4px', left: '50%',
      transform: 'translateX(-50%)',
      borderBottom: '4px solid #1f2937',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
    },
    left: {
      right: '-4px', top: '50%',
      transform: 'translateY(-50%)',
      borderLeft: '4px solid #1f2937',
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent',
    },
    right: {
      left: '-4px', top: '50%',
      transform: 'translateY(-50%)',
      borderRight: '4px solid #1f2937',
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent',
    },
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {children}
      </span>

      {visible && content && createPortal(
        <span
          role="tooltip"
          style={{
            position:  'absolute',
            top:       coords.top,
            left:      coords.left,
            transform: transformMap[position],
            zIndex:    99999,
            pointerEvents: 'none',
          }}
          className={`${maxWidth} whitespace-normal`}
        >
          <span
            className="relative block bg-gray-800 text-white font-poppins text-xs leading-relaxed rounded-lg px-3 py-2 shadow-xl"
            style={{ display: 'inline-block' }}
          >
            {content}
            <span style={{ position: 'absolute', width: 0, height: 0, ...arrowStyle[position] }} />
          </span>
        </span>,
        document.body
      )}
    </>
  );
}
