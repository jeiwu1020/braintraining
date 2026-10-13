import React, { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

/** Guards an action that would discard an in-progress activity. */
export const useConfirmAction = (hasProgress: boolean): {
  requestAction: (action: () => void, message: string, confirmLabel?: string) => void;
  confirmationDialog: ReactNode;
} => {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmLabel, setConfirmLabel] = useState('確認繼續');
  const actionRef = useRef<(() => void) | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  const cancel = useCallback(() => {
    actionRef.current = null;
    setMessage(null);
  }, []);

  const requestAction = useCallback((action: () => void, nextMessage: string, nextConfirmLabel = '確認繼續') => {
    if (actionRef.current) return;
    if (!hasProgress) {
      action();
      return;
    }
    openerRef.current = typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null;
    actionRef.current = action;
    setConfirmLabel(nextConfirmLabel);
    setMessage(nextMessage);
  }, [hasProgress]);

  const confirm = useCallback(() => {
    const action = actionRef.current;
    actionRef.current = null;
    setMessage(null);
    action?.();
  }, []);

  useEffect(() => {
    if (message === null) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cancel();
      } else if (event.key === 'Tab') {
        if (event.shiftKey && document.activeElement !== confirmRef.current) {
          event.preventDefault();
          confirmRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement !== cancelRef.current) {
          event.preventDefault();
          cancelRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, [message, cancel]);

  const confirmationDialog = message === null ? null : (
    <div className="facilitator-confirm-overlay">
      <section role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId}
        className="facilitator-confirm-dialog">
        <h2 id={titleId} className="text-lg font-bold text-slate-900">確認離開目前進度</h2>
        <p id={messageId} className="mt-2 text-base leading-relaxed text-slate-700">{message}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button ref={cancelRef} type="button" onClick={cancel}
            className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 font-bold text-slate-800 focus-visible:ring-4 focus-visible:ring-sky-300">繼續活動</button>
          <button ref={confirmRef} type="button" onClick={confirm}
            className="min-h-11 rounded-xl bg-indigo-700 px-3 font-bold text-white focus-visible:ring-4 focus-visible:ring-sky-300">{confirmLabel}</button>
        </div>
      </section>
    </div>
  );

  return { requestAction, confirmationDialog };
};
