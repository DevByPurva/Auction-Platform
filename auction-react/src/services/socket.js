import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let client = null;
const subscribers = {};
const pendingSubscriptions = {}; // guard against double-subscribe during waitForConnection

export function connectSocket(onConnected) {
  if (client && client.connected) {
    onConnected && onConnected();
    return;
  }
  // Already connecting — just queue the callback
  if (client && !client.connected) {
    waitForConnection(() => onConnected && onConnected());
    return;
  }
  const sock = new SockJS('/ws');
  client = Stomp.over(sock);
  client.debug = null;
  client.connect({}, () => {
    onConnected && onConnected();
  }, (err) => {
    console.warn('WebSocket error:', err);
    client = null;
  });
}

export function subscribeToAuction(auctionId, callback) {
  const topic = `/topic/auction/${auctionId}`;
  _subscribe(topic, callback);
}

export function subscribeToNotifications(userId, callback) {
  const topic = `/topic/notifications/${userId}`;
  _subscribe(topic, callback);
}

function _subscribe(topic, callback) {
  // Already subscribed or subscription in-flight — skip
  if (subscribers[topic] || pendingSubscriptions[topic]) return;
  pendingSubscriptions[topic] = true;

  waitForConnection(() => {
    // Double-check after async wait
    if (subscribers[topic]) {
      delete pendingSubscriptions[topic];
      return;
    }
    subscribers[topic] = client.subscribe(topic, (msg) => {
      callback(JSON.parse(msg.body));
    });
    delete pendingSubscriptions[topic];
  });
}

export function unsubscribe(topic) {
  if (subscribers[topic]) {
    try { subscribers[topic].unsubscribe(); } catch (_) {}
    delete subscribers[topic];
  }
  delete pendingSubscriptions[topic];
}

export function sendBid(data) {
  if (client && client.connected) {
    client.send('/app/bid', {}, JSON.stringify(data));
    return true;
  }
  return false;
}

export function disconnectSocket() {
  if (client) {
    try { client.disconnect(); } catch (_) {}
    client = null;
  }
  Object.keys(subscribers).forEach(k => delete subscribers[k]);
  Object.keys(pendingSubscriptions).forEach(k => delete pendingSubscriptions[k]);
}

function waitForConnection(fn, retries = 20) {
  if (client && client.connected) {
    fn();
  } else if (retries > 0) {
    setTimeout(() => waitForConnection(fn, retries - 1), 300);
  }
}
