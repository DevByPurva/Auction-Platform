import { useNavigate } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

export default function AuctionCard({ auction, userId }) {
  const nav = useNavigate();

  return (
    <div className="card" onClick={() => nav(`/auction/${auction.id}?user=${userId}`)}>
      <img src={`http://localhost:8082${auction.imageUrl}`} alt={auction.itemName} />
      <div className="card-body">
        <h3>{auction.itemName}</h3>
        <p className="price">₹{auction.currentPrice.toLocaleString()}</p>
        <CountdownTimer endTime={auction.endTime} />
        <button className="btn-primary">View Auction</button>
      </div>
    </div>
  );
}
