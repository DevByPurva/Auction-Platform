export default function BidHistory({ history }) {
  if (!history || history.length === 0) {
    return <p className="no-bids">No bids yet. Be the first!</p>;
  }

  return (
    <table className="bid-table">
      <thead>
        <tr><th>Bidder</th><th>Amount</th></tr>
      </thead>
      <tbody>
        {history.map((b, i) => (
          <tr key={i} className={i === 0 ? 'top-bid' : ''}>
            <td>{b.username ?? b.user?.username}</td>
            <td>₹{(b.amount).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
