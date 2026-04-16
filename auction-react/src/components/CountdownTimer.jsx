import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function CountdownTimer({ endTime, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const offsetRef = useRef(0); // server - local offset in ms

  useEffect(() => {
    // Sync with server time once
    api.serverTime().then(({ timestamp }) => {
      offsetRef.current = timestamp - Date.now();
    }).catch(() => { offsetRef.current = 0; });
  }, []);

  useEffect(() => {
    if (!endTime) return;
    const end = new Date(endTime).getTime();

    const tick = () => {
      const now = Date.now() + offsetRef.current;
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft(0);
        onExpire && onExpire();
        return;
      }
      setTimeLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  if (timeLeft === null) return <span className="timer">Loading...</span>;
  if (timeLeft <= 0)     return <span className="timer expired">Auction Ended</span>;

  const h = Math.floor(timeLeft / (1000 * 60 * 60));
  const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const urgent = timeLeft < 60000;

  const pad = n => String(n).padStart(2, '0');

  return (
    <span className={`timer ${urgent ? 'urgent' : ''}`}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
