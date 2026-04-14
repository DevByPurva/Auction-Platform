const BASE = 'http://localhost:8082';

export const api = {
  // Auth
  login:       (data)       => post('/login', data),
  adminLogin:  (data)       => post('/admin/login', data),

  // Auctions
  getAuctions: ()           => get('/auctions'),
  getAuction:  (id)         => get(`/auctions/${id}`),

  // Bids
  placeBid:    (data)       => post('/bid', data),
  getBidHistory:(id)        => get(`/bid/history/${id}`),
  getWinner:   (id)         => get(`/winner/${id}`),

  // Admin
  getAdminAuctions: ()      => get('/admin/auctions'),
  getAuctionBids:  (id)     => get(`/admin/auctions/${id}/bids`),
  closeAuction:    (id)     => post(`/admin/closeAuction/${id}`, {}),
  addAuction:      (params) => postForm('/admin/addAuction', params),
  uploadImage:     (form)   => postMultipart('/admin/uploadImage', form),

  // Server time
  serverTime: () => get('/server-time'),
};

async function get(path) {
  const res = await fetch(BASE + path);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // some endpoints return plain text
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

async function postForm(path, params) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  return res.json();
}

async function postMultipart(path, formData) {
  const res = await fetch(BASE + path, { method: 'POST', body: formData });
  return res.text();
}
