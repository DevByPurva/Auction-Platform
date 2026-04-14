import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import AuctionCard from '../components/AuctionCard';

export default function DashboardPage() {
  const [auctions, setAuctions] = useState([]);
  const nav = useNavigate();
  const userId = sessionStorage.getItem('userId');
  const username = sessionStorage.getItem('username');

  useEffect(() => {
    if (!userId) { nav('/'); return; }
    api.getAuctions().then(setAuctions).catch(console.error);
  }, [userId, nav]);

  function logout() {
    sessionStorage.clear();
    nav('/');
  }

  return (
    <div className="page">
      <nav className="navbar">
        <h2>🏷 AuctionHub</h2>
        <div className="nav-links">
          <span>Welcome, {username}</span>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2 className="section-title">Live Auctions</h2>
        {auctions.length === 0
          ? <p>No auctions available.</p>
          : <div className="auction-grid">
              {auctions.map(a => (
                <AuctionCard key={a.id} auction={a} userId={userId} />
              ))}
            </div>
        }
      </div>
    </div>
  );
}
