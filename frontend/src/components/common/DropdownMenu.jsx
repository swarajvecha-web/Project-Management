import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, MoreHorizontal } from 'lucide-react';

/**
 * DropdownMenu — renders its panel with position:fixed so it's never
 * clipped by parent overflow:hidden / overflow:auto containers (e.g. DataTable).
 */
export default function DropdownMenu({ actions = [], horizontal = false, buttonClassName = '' }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [coords, setCoords]     = useState({ top: 0, left: 0 });
  const buttonRef               = useRef(null);
  const panelRef                = useRef(null);

  /* ── Position the fixed panel below the trigger button ── */
  const open = (e) => {
    e.stopPropagation();
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top:  rect.bottom + 4,
      left: rect.right,          // anchor right edge; we'll shift left via transform
    });
    setIsOpen((prev) => !prev);
  };

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  /* ── Close on scroll/resize so panel doesn't float away ── */
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const handleAction = (e, fn) => {
    e.stopPropagation();
    setIsOpen(false);
    if (fn) fn();
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        ref={buttonRef}
        onClick={open}
        className={`p-1.5 rounded-md text-sidebar-foreground transition-colors hover:bg-secondary ${buttonClassName}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {horizontal ? <MoreHorizontal size={18} /> : <MoreVertical size={18} />}
      </button>

      {/* ── Fixed panel — rendered via a portal-like fixed position ── */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            position:   'fixed',
            top:        coords.top,
            left:       coords.left,
            transform:  'translateX(-100%)',   // right-align to button edge
            zIndex:     9999,
            minWidth:   '10rem',
          }}
          className="bg-background border border-border rounded-lg shadow-xl py-1"
        >
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={(e) => handleAction(e, action.onClick)}
                className={`flex items-center w-full gap-2 px-4 py-2 text-sm transition-colors hover:bg-secondary ${action.color || 'text-foreground'}`}
              >
                {Icon && <Icon size={14} aria-hidden="true" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
