import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { connectSocket, subscribeToAuction, subscribeToNotifications, unsubscribe } from '../services/socket';
import BidPanel from '../components/BidPanel';
import BidHistory from '../components/BidHistory';
import CountdownTimer from '../components/CountdownTimer';
import NotificationToast from '../components/NotificationToast';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  const userId   = sessionStorage.getItem('userId');
  const username = sessionStorage.getItem('username');

  const [auction, setAuction]           = useState(null);
  const [history, setHistory]           = useState([]);
  const [winner, setWinner]             = useState(null);
  const [expired, setExpired]           = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifId = useRef(0);

  const addNotification = useCallback((type, message) => {
    const nid = ++notifId.current;
    setNotifications(prev => [...prev, { id: nid, type, message }]);
  }, []);

  const dismissNotification = useCallback((nid) => {
    setNotifications(prev => prev.filter(n => n.id !== nid));
  }, []);

  const handleExpire = useCallback(() => {
    setExpired(true);
    api.getWinner(id).then(w => {
      setWinner(w);
      if (w && String(w.user?.id) === String(userId)) {
        addNotification('win', `You won "${auction?.itemName}" with ₹${w.amount}!`);
      }
    });
  }, [id, userId, auction, addNotification]);

  useEffect(() => {
    if (!userId) { nav('/'); return; }

    api.getAuction(id).then(a => {
      setAuction(a);
      const now = Date.now();
      if (new Date(a.endTime).getTime() <= now) setExpired(true);
    });

    api.getBidHistory(id).then(data => {
      setHistory(data.map(b => ({ username: b.user?.username, amount: b.amount, createdAt: b.createdAt })));
    });

    connectSocket(() => {
      subscribeToAuction(id, (payload) => {
        setAuction(prev => prev ? { ...prev, currentPrice: payload.currentPrice } : prev);
        setHistory((payload.bidHistory || []).map(b => ({
          username: b.username, amount: b.amount, createdAt: b.createdAt
        })));
      });

      subscribeToNotifications(userId, (notif) => {
        addNotification(notif.type, notif.message);
      });
    });

    return () => {
      unsubscribe(`/topic/auction/${id}`);
    };
  }, [id, userId, nav, addNotification]);

  if (!auction) return <div className="loading">Loading auction...</div>;

  return (
    <div className="page">
      <nav className="navbar">
        <h2 onClick={() => nav('/dashboard')} style={{ cursor: 'pointer' }}>🏷 AuctionHub</h2>
        <div className="nav-links">
          <span>{username}</span>
          <button className="btn-outline" onClick={() => { sessionStorage.clear(); nav('/'); }}>Logout</button>
        </div>
      </nav>

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      <div className="detail-container">
        <div className="detail-left">
          <img src={`http://localhost:8082${auction.imageUrl}`} alt={auction.itemName} className="detail-img" />
        </div>

        <div className="detail-right">
          <h2>{auction.itemName}</h2>

          {/* Product details */}
          <div className="product-details">
            {auction.category && <span className="category-badge lg">{auction.category}</span>}
            {auction.brand    && <span className="detail-chip"> {auction.brand}</span>}
            {auction.model    && <span className="detail-chip"> {auction.model}</span>}
            {auction.color    && <span className="detail-chip"> {auction.color}</span>}
            {auction.yearsUsed != null && <span className="detail-chip"> {auction.yearsUsed}yr used</span>}
          </div>
          {auction.description && <p className="auction-desc">{auction.description}</p>}

          <p className="current-price">Current Price: <strong>₹{auction.currentPrice?.toLocaleString()}</strong></p>
          <CountdownTimer endTime={auction.endTime} onExpire={handleExpire} />

          {winner && (
            <div className="winner-banner">
              Winner: <strong>{winner.user?.username}</strong> — ₹{winner.amount?.toLocaleString()}
            </div>
          )}

          <BidPanel
            auctionId={id}
            userId={userId}
            currentPrice={auction.currentPrice}
            expired={expired}
          />

          <h3>Bid History</h3>
          <BidHistory history={history} />
        </div>
      </div>
    </div>
  );
}
