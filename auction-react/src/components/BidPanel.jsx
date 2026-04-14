import { useState } from 'react';
import { api } from '../services/api';
import { sendBid } from '../services/socket';

export default function BidPanel({ auctionId, userId, currentPrice, expired }) {
  const [amount, setAmount]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  function validate(val) {
    if (!val || val.trim() === '')        return 'Please enter a bid amount.';
    if (isNaN(val))                       return 'Amount must be a number.';
    if (parseFloat(val) <= currentPrice)  return `Bid must be higher than ₹${currentPrice.toLocaleString()}.`;
    return '';
  }

  async function handleBid() {
    const err = validate(amount);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    const data = { auctionId: String(auctionId), userId: String(userId), amount };

    // Try WebSocket first, fall back to REST
    const sent = sendBid(data);
    if (!sent) {
      const msg = await api.placeBid(data);
      alert(msg);
    }

    setAmount('');
    setLoading(false);
  }

  const isInvalid = validate(amount) !== '';

  return (
    <div className="bid-panel">
      <h3>Place Your Bid</h3>
      <div className="bid-input-row">
        <input
          type="number"
          value={amount}
          onChange={e => { setAmount(e.target.value); setError(validate(e.target.value)); }}
          placeholder={`Enter more than ₹${currentPrice}`}
          disabled={expired}
        />
        <button
          className="btn-primary"
          onClick={handleBid}
          disabled={expired || isInvalid || loading}
        >
          {loading ? 'Placing...' : 'Place Bid'}
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {expired && <p className="error-msg">This auction has ended.</p>}
    </div>
  );
}
