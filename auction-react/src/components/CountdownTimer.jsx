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

  const m = Math.floor(timeLeft / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  const urgent = timeLeft < 60000;

  return (
    <span className={`timer ${urgent ? 'urgent' : ''}`}>
      ⏱ {m}m {s.toString().padStart(2, '0')}s
    </span>
  );
}
