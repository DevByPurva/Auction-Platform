import { useNavigate } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const CATEGORY_ICON = { PHONE: '', LAPTOP: '', EQUIPMENT: '' };

export default function AuctionCard({ auction, userId }) {
  const nav = useNavigate();

  return (
    <div className="card" onClick={() => nav(`/auction/${auction.id}?user=${userId}`)}>
      <img src={`http://localhost:8082${auction.imageUrl}`} alt={auction.itemName} />
      <div className="card-body">
        <div className="card-meta">
          {auction.category && (
            <span className="category-badge">
              {CATEGORY_ICON[auction.category] } {auction.category}
            </span>
          )}
        </div>
        <h3>{auction.itemName}</h3>
        {(auction.brand || auction.model) && (
          <p className="card-subtitle">{[auction.brand, auction.model].filter(Boolean).join(' · ')}</p>
        )}
        <p className="price">₹{auction.currentPrice.toLocaleString()}</p>
        <CountdownTimer endTime={auction.endTime} />
        <button className="btn-primary">View Auction</button>
      </div>
    </div>
  );
}
