import { useEffect } from 'react';

export default function NotificationToast({ notifications, onDismiss }) {
  // Only show the most recent one
  const latest = notifications[notifications.length - 1];

  useEffect(() => {
    if (!latest) return;
    const id = setTimeout(() => onDismiss(latest.id), 5000);
    return () => clearTimeout(id);
  }, [latest?.id]); // only re-run when a new notification arrives

  if (!latest) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${latest.type}`}>
        <span>{latest.message}</span>
        <button onClick={() => onDismiss(latest.id)}>✕</button>
      </div>
    </div>
  );
}
