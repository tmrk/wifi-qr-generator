import { useEffect, useRef } from 'react';

// While an overlay is open, keep one extra history entry so the system back
// gesture closes the overlay instead of leaving the app.
export default function useBackClose(open, onClose) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;
    let pushed = true;
    window.history.pushState(window.history.state, '');
    const onPop = () => {
      pushed = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closed from the UI: drop the entry we added.
      if (pushed) window.history.back();
    };
  }, [open]);
}
