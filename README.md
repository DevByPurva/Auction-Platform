# AuctionHub — Real-Time Electronics Auction Platform

A full-stack real-time auction system built with **Spring Boot**, **React.js**, **WebSocket (STOMP/SockJS)**, and **MySQL**. Multiple users can bid simultaneously and see live price updates instantly — no page refresh needed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 4, Spring WebSocket, Spring Data JPA |
| Frontend | React 19, Vite, React Router v7 |
| Database | MySQL 8 |
| Real-time | WebSocket, STOMP, SockJS |
| Build | Maven (backend), npm (frontend) |

---

## Project Structure

```
Auction/
├── AuctionBidding/          ← Spring Boot backend
│   ├── src/main/java/
│   │   └── com/example/auctionbidding/
│   │       ├── controller/  ← REST + WebSocket controllers
│   │       ├── service/     ← Business logic
│   │       ├── model/       ← JPA entities
│   │       ├── repository/  ← Spring Data repositories
│   │       └── config/      ← WebSocket + CORS config
│   └── src/main/resources/
│       ├── application.properties
│       └── static/          ← Legacy HTML/JS frontend (kept for reference)
│
└── auction-react/           ← React frontend
    └── src/
        ├── pages/           ← LoginPage, SignupPage, DashboardPage, AuctionDetailPage, AdminDashboardPage
        ├── components/      ← AuctionCard, BidPanel, BidHistory, CountdownTimer, NotificationToast
        └── services/        ← api.js (REST), socket.js (WebSocket)
```

---

## Features

### User
- Register and login with username, email, password
- Browse all live auctions on a dashboard grid
- View auction details — product info, current price, countdown timer
- Place bids via WebSocket (REST fallback if socket unavailable)
- See live price and bid history updates without refreshing
- Receive real-time toast notification when outbid
- See winner announcement when auction ends

### Admin
- Separate login (admin table, not user table)
- Create auctions with full product details (brand, model, color, years used, description)
- View all auctions with live price updates
- Expand any auction to see current bid history
- Force-close a live auction
- Place bids directly from the admin dashboard

### System
- Server-synchronized countdown timer (HH:mm:ss) — no client clock drift
- Concurrent bid safety — `@Transactional` + `synchronized` on `placeBid()`
- Dual-layer validation — frontend + backend for all inputs
- Role-based route protection — users cannot access admin pages and vice versa
- Session isolated per browser tab via `sessionStorage`

---

## Database Setup

Make sure MySQL is running, then:

```sql
CREATE DATABASE IF NOT EXISTS auctiondb;

USE auctiondb;

-- Tables are auto-created by Spring on first run (ddl-auto=update)
-- After first run, add these columns:

ALTER TABLE auction
  ADD COLUMN IF NOT EXISTS brand       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS model       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS color       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS years_used  INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS category    VARCHAR(50);

ALTER TABLE bid
  ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Seed data
INSERT INTO users (username, email, password, role) VALUES
  ('alice',   'alice@example.com',   '123',      'USER'),
  ('bob',     'bob@example.com',     '123',      'USER'),
  ('charlie', 'charlie@example.com', '123',      'USER');

INSERT INTO admins (username, password) VALUES ('admin', 'admin123');
```

---

## Running the Project

### Prerequisites
- Java 17+
- Maven
- Node.js 18+
- MySQL running on port 3306

### 1. Configure database credentials

Edit `AuctionBidding/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/auctiondb
spring.datasource.username=root
spring.datasource.password=****
```

### 2. Start the backend

```bash
cd AuctionBidding
.\mvnw.cmd spring-boot:run
```

Backend runs on `http://localhost:8082`

### 3. Start the frontend

```bash
cd auction-react
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Usage

Open `http://localhost:5173` in your browser.

| Role | Username | Password |
|---|---|---|
| User | alice | 123 |
| User | bob | 123 |
| Admin | admin | admin123 |

**To test real-time bidding:**
1. Open two browser tabs at `http://localhost:5173`
2. Log in as different users in each tab
3. Navigate to the same auction in both tabs
4. Place a bid in one tab — the other updates instantly

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | User login |
| POST | `/signup` | User registration |
| POST | `/admin/login` | Admin login |
| GET | `/auctions` | Get all auctions |
| GET | `/auctions/{id}` | Get single auction |
| POST | `/bid` | Place a bid (REST) |
| GET | `/bid/history/{id}` | Get bid history |
| GET | `/winner/{id}` | Get auction winner |
| GET | `/server-time` | Get server timestamp |
| POST | `/admin/addAuction` | Create auction |
| POST | `/admin/uploadImage` | Upload item image |
| GET | `/admin/auctions` | Get all auctions (admin) |
| POST | `/admin/closeAuction/{id}` | Force close auction |

## WebSocket Topics

| Direction | Destination | Description |
|---|---|---|
| Client → Server | `/app/bid` | Place a bid |
| Server → Client | `/topic/auction/{id}` | Live auction updates |
| Server → Client | `/topic/notifications/{userId}` | Personal notifications |

---

## Architecture

The project follows **MVC architecture**:

- **Model** — JPA entities (`Auction`, `Bid`, `User`, `Admin`) mapped to MySQL
- **Controller** — Spring `@RestController` classes handle all HTTP and WebSocket routing
- **Service** — Business logic in `BidService`, `UserService`, `AuctionService`, `AdminService`
- **View** — React components consume REST APIs and WebSocket events

---

## Author

Developed as part of a full-stack web technologies assignment covering:
HTML/CSS/JS · AJAX · REST API · WebSocket (Socket Programming) · MVC Architecture · Spring Boot · React
