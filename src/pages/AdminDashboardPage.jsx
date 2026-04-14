import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { connectSocket, subscribeToAuction, unsubscribe } from '../services/socket';

export default function AdminDashboardPage() {
  const [auctions, setAuctions]   = useState([]);
  const [bidsMap, setBidsMap]     = useState({});
  const [expanded, setExpanded]   = useState(null);
  const [msg, setMsg]             = useState({ text: '', ok: true });
  const [bidInputs, setBidInputs] = useState({});   // auctionId -> amount string

  // Create auction form
  const [form, setForm] = useState({
    name: '', price: '',
    startDate: '', startTime: '',
    endDate: '',   endTime: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const nav = useNavigate();
  const adminUsername = sessionStorage.getItem('username') || 'Admin';

  const loadAuctions = useCallback(() => {
    api.getAdminAuctions().then(data => {
      setAuctions(data);
      data.forEach(a => {
        subscribeToAuction(a.id, (payload) => {
          setAuctions(prev => prev.map(x =>
            x.id === payload.auctionId ? { ...x, currentPrice: payload.currentPrice } : x
          ));
          setBidsMap(prev => ({ ...prev, [payload.auctionId]: payload.bidHistory }));
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem('adminId')) { nav('/'); return; }
    connectSocket(loadAuctions);
    return () => auctions.forEach(a => unsubscribe(`/topic/auction/${a.id}`));
  }, [nav, loadAuctions]);

  async function handleClose(id) {
    if (!window.confirm('Force-close this auction now?')) return;
    const res = await api.closeAuction(id);
    flash(res, true);
    loadAuctions();
  }

  async function toggleBids(id) {
    if (expanded === id) { setExpanded(null); return; }
    const bids = await api.getAuctionBids(id);
    setBidsMap(prev => ({
      ...prev,
      [id]: bids.map(b => ({ username: b.user?.username, amount: b.amount }))
    }));
    setExpanded(id);
  }

  async function handleAdminBid(auctionId) {
    const amount = bidInputs[auctionId];
    if (!amount) return;
    const adminId = sessionStorage.getItem('adminId');
    const res = await api.placeBid({
      auctionId: String(auctionId),
      userId: String(adminId),
      amount
    });
    flash(typeof res === 'string' ? res : JSON.stringify(res), !String(res).includes('higher') && !String(res).includes('Invalid'));
    setBidInputs(prev => ({ ...prev, [auctionId]: '' }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      let imagePath = '/images/default.jpg';
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        imagePath = await api.uploadImage(fd);
      }
      await api.addAuction({
        itemName:  form.name,
        price:     form.price,
        startTime: `${form.startDate}T${form.startTime}`,
        endTime:   `${form.endDate}T${form.endTime}`,
        imagePath,
      });
      flash('Auction created!', true);
      setForm({ name: '', price: '', startDate: '', startTime: '', endDate: '', endTime: '' });
      setImageFile(null);
      setShowCreate(false);
      loadAuctions();
    } catch {
      flash('Error creating auction.', false);
    }
  }

  function flash(text, ok) {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 3500);
  }

  function logout() { sessionStorage.clear(); nav('/'); }

  // Stats
  const liveCount   = auctions.filter(a => new Date(a.endTime) > new Date()).length;
  const endedCount  = auctions.length - liveCount;
  const totalBids   = Object.values(bidsMap).reduce((s, b) => s + (b?.length || 0), 0);

  return (
    <div className="page">
      <nav className="navbar">
        <h2>🏷 AuctionHub <span className="admin-badge">Admin</span></h2>
        <div className="nav-links">
          <span>👤 {adminUsername}</span>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="container">

        {/* Flash message */}
        {msg.text && (
          <div className={`flash-msg ${msg.ok ? 'flash-ok' : 'flash-err'}`}>{msg.text}</div>
        )}

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{auctions.length}</span>
            <span className="stat-label">Total Auctions</span>
          </div>
          <div className="stat-card live-stat">
            <span className="stat-num">{liveCount}</span>
            <span className="stat-label">Live Now</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{endedCount}</span>
            <span className="stat-label">Ended</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{totalBids}</span>
            <span className="stat-label">Bids Loaded</span>
          </div>
        </div>

        {/* Create Auction toggle */}
        <div className="section-header">
          <h3>Auctions</h3>
          <button className="btn-primary" onClick={() => setShowCreate(v => !v)}>
            {showCreate ? '✕ Cancel' : '+ New Auction'}
          </button>
        </div>

        {showCreate && (
          <section className="admin-section create-section">
            <h3>Create New Auction</h3>
            <form className="create-form" onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Item Name</label>
                  <input placeholder="e.g. iPhone 15 Pro" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Starting Price (₹)</label>
                  <input type="number" placeholder="e.g. 50000" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={form.startTime}
                    onChange={e => setForm({...form, startTime: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate}
                    onChange={e => setForm({...form, endDate: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={form.endTime}
                    onChange={e => setForm({...form, endTime: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Item Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </div>
              <button type="submit" className="btn-primary">Create Auction</button>
            </form>
          </section>
        )}

        {/* Auctions Table */}
        <section className="admin-section">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Current Price</th>
                <th>Ends At</th>
                <th>Status</th>
                <th>Place Bid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:'2rem'}}>No auctions yet</td></tr>
              )}
              {auctions.map(a => {
                const isLive = new Date(a.endTime).getTime() > Date.now();
                return (
                  <>
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td className="item-cell">
                        <img src={`http://localhost:8082${a.imageUrl}`} alt="" className="table-thumb" />
                        {a.itemName}
                      </td>
                      <td className="price-cell">₹{a.currentPrice?.toLocaleString()}</td>
                      <td>{new Date(a.endTime).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${isLive ? 'live' : 'ended'}`}>
                          {isLive ? '🟢 Live' : '🔴 Ended'}
                        </span>
                      </td>
                      <td>
                        {isLive ? (
                          <div className="inline-bid-row">
                            <input
                              type="number"
                              className="inline-bid-input"
                              placeholder={`> ₹${a.currentPrice}`}
                              value={bidInputs[a.id] || ''}
                              onChange={e => setBidInputs(prev => ({...prev, [a.id]: e.target.value}))}
                            />
                            <button className="btn-sm" onClick={() => handleAdminBid(a.id)}>Bid</button>
                          </div>
                        ) : <span style={{color:'#555'}}>—</span>}
                      </td>
                      <td>
                        <button className="btn-sm" onClick={() => toggleBids(a.id)}>
                          {expanded === a.id ? 'Hide' : 'Bids'}
                        </button>
                        {isLive && (
                          <button className="btn-sm btn-danger" onClick={() => handleClose(a.id)}>
                            Close
                          </button>
                        )}
                      </td>
                    </tr>

                    {expanded === a.id && (
                      <tr key={`bids-${a.id}`} className="bids-row">
                        <td colSpan={7}>
                          <div className="inline-bids">
                            {(bidsMap[a.id] || []).length === 0
                              ? <em style={{color:'#888'}}>No bids yet</em>
                              : (bidsMap[a.id] || []).map((b, i) => (
                                  <span key={i} className={`bid-chip ${i === 0 ? 'top' : ''}`}>
                                    {i === 0 ? '🏆 ' : ''}{b.username} — ₹{b.amount?.toLocaleString()}
                                  </span>
                                ))
                            }
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
}
