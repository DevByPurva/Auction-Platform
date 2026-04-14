/* =========================
   GLOBAL TIMER CONTROL
========================= */

let auctionTimer = null;

/* =========================
   WEBSOCKET (STOMP/SockJS)
========================= */

let stompClient = null;
let wsConnected  = false;

/**
 * Connect to /ws and subscribe to /topic/auction/{auctionId}.
 * Called once when auction-detail.html loads.
 */
function connectWebSocket(auctionId) {

    // SockJS + STOMP loaded via CDN in auction-detail.html
    const socket = new SockJS('/ws');
    stompClient  = Stomp.over(socket);

    stompClient.debug = null; // silence STOMP debug logs

    stompClient.connect({}, function () {

        wsConnected = true;

        stompClient.subscribe('/topic/auction/' + auctionId, function (message) {
            const payload = JSON.parse(message.body);
            applyRealtimeUpdate(payload);
        });

    }, function (error) {
        console.warn('WebSocket connection failed, falling back to REST.', error);
        wsConnected = false;
    });
}

/**
 * Apply a real-time broadcast payload to the UI.
 * payload: { auctionId, currentPrice, highestBidder, bidHistory[] }
 */
function applyRealtimeUpdate(payload) {

    // Update price
    const priceEl = document.getElementById('price');
    if (priceEl) priceEl.innerText = '₹' + payload.currentPrice;

    // Update bid history table
    let html = '';
    (payload.bidHistory || []).forEach(function (b) {
        html += '<tr><td>' + b.username + '</td><td>₹' + b.amount + '</td></tr>';
    });
    const historyEl = document.getElementById('history');
    if (historyEl) historyEl.innerHTML = html;

    // Update winner banner if auction has ended (timer already stopped)
    const winnerEl = document.getElementById('winnerBanner');
    if (winnerEl && payload.highestBidder && payload.highestBidder !== 'None') {
        // Only show winner banner when auction is over (timer section shows "Auction Ended")
        const timerEl = document.getElementById('timer');
        if (timerEl && timerEl.innerText === 'Auction Ended') {
            winnerEl.innerHTML = '🏆 Winner: ' + payload.highestBidder +
                                 ' with ₹' + payload.currentPrice;
        }
    }
}

/* =========================
   LOGIN (USER + ADMIN)
========================= */

function login(){

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let role     = document.getElementById("role").value;

    if(!username || !password){
        alert("Enter username and password");
        return;
    }

    let url = role === "admin" ? "/admin/login" : "/login";

    fetch(url,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ username:username, password:password })
    })
    .then(res => res.json())
    .then(user => {

        if(!user){
            alert("Invalid login");
            return;
        }

        if(role === "admin"){
            window.location = "admin.html";
        } else {
            window.location = "dashboard.html?user=" + user.id;
        }

    })
    .catch(err => {
        console.error("Login error", err);
        alert("Login failed");
    });
}

/* =========================
   LOGOUT
========================= */

function logout(){
    if (stompClient && wsConnected) stompClient.disconnect();
    window.location = "login.html";
}

/* =========================
   LOAD AUCTIONS (USER DASHBOARD)
========================= */

function loadAuctions(){

    let userId = new URLSearchParams(window.location.search).get("user");

    if(!userId){
        alert("Please login first");
        window.location = "login.html";
        return;
    }

    fetch("/auctions")
    .then(res => res.json())
    .then(data => {

        let html = "";

        data.forEach(a => {
            html += `
<div class="card">
  <img src="${a.imageUrl}" alt="auction item">
  <div class="card-content">
    <h3>${a.itemName}</h3>
    <p class="price">₹${a.currentPrice}</p>
    <p class="card-timer" id="timer${a.id}"></p>
    <a href="auction-detail.html?id=${a.id}&user=${userId}">
      <button>View Auction</button>
    </a>
  </div>
</div>`;
        });

        document.getElementById("auctionList").innerHTML = html;
        data.forEach(a => startCardTimer(a.endTime, a.id));

    })
    .catch(err => console.error("Auction load error", err));
}

/* =========================
   CARD COUNTDOWN TIMER
========================= */

function startCardTimer(endTime, id){

    let end = new Date(endTime).getTime();

    let timer = setInterval(function(){

        let now      = new Date().getTime();
        let distance = end - now;

        if(distance <= 0){
            clearInterval(timer);
            let el = document.getElementById("timer" + id);
            if(el) el.innerHTML = "Auction Ended";
            return;
        }

        let minutes = Math.floor(distance / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        let el = document.getElementById("timer" + id);
        if(el) el.innerHTML = "Ends in " + minutes + "m " + seconds + "s";

    }, 1000);
}

/* =========================
   AUCTION DETAIL PAGE
========================= */

function loadAuction(){

    let params    = new URLSearchParams(window.location.search);
    let auctionId = params.get("id");

    if(!auctionId){
        alert("Invalid auction");
        return;
    }

    fetch("/auctions/" + auctionId)
    .then(res => res.json())
    .then(a => {

        document.getElementById("itemName").innerText = a.itemName;
        document.getElementById("price").innerText    = "₹" + a.currentPrice;
        document.getElementById("image").src          = a.imageUrl;

        startTimer(a.endTime);
        loadBidHistory();

        // Connect WebSocket for real-time updates (no more polling)
        connectWebSocket(auctionId);

    })
    .catch(err => console.error("Auction detail error", err));
}

/* =========================
   PLACE BID
========================= */

function placeBid(){

    let params    = new URLSearchParams(window.location.search);
    let auctionId = params.get("id");
    let userId    = params.get("user");

    if(!userId){
        alert("User session lost. Login again.");
        window.location = "login.html";
        return;
    }

    let amount = document.getElementById("amount").value;

    if(!amount || amount <= 0){
        alert("Enter valid bid amount");
        return;
    }

    const bidData = {
        auctionId : auctionId,
        userId    : userId,
        amount    : amount
    };

    if(wsConnected && stompClient){
        // --- WebSocket path (primary) ---
        stompClient.send("/app/bid", {}, JSON.stringify(bidData));
        document.getElementById("amount").value = "";
    } else {
        // --- REST fallback ---
        fetch("/bid", {
            method  : "POST",
            headers : { "Content-Type": "application/json" },
            body    : JSON.stringify(bidData)
        })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            document.getElementById("amount").value = "";
            loadAuction();
        })
        .catch(err => console.error("Bid error", err));
    }
}

/* =========================
   BID HISTORY (initial load)
========================= */

function loadBidHistory(){

    let params    = new URLSearchParams(window.location.search);
    let auctionId = params.get("id");

    fetch("/bid/history/" + auctionId)
    .then(res => res.json())
    .then(data => {

        let html = "";
        data.forEach(b => {
            html += `<tr><td>${b.user.username}</td><td>₹${b.amount}</td></tr>`;
        });
        document.getElementById("history").innerHTML = html;

    });
}

/* =========================
   AUCTION TIMER
========================= */

function startTimer(endTime){

    let params    = new URLSearchParams(window.location.search);
    let auctionId = params.get("id");
    let end       = new Date(endTime).getTime();

    let timer = setInterval(function(){

        let now      = new Date().getTime();
        let distance = end - now;

        if(distance <= 0){
            clearInterval(timer);
            document.getElementById("timer").innerHTML    = "Auction Ended";
            document.getElementById("amount").disabled   = true;
            showWinner(auctionId);
            return;
        }

        let minutes = Math.floor(distance / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById("timer").innerHTML = "Time Left: " + minutes + "m " + seconds + "s";

    }, 1000);
}

/* =========================
   WINNER DISPLAY
========================= */

function showWinner(auctionId){

    fetch("/winner/" + auctionId)
    .then(res => res.json())
    .then(w => {

        if(!w){
            document.getElementById("winnerBanner").innerHTML = "No bids placed";
            return;
        }

        document.getElementById("winnerBanner").innerHTML =
            "🏆 Winner: " + w.user.username + " with ₹" + w.amount;

    });
}

/* =========================
   ADMIN CREATE AUCTION
========================= */

async function createAuction(){

    let name      = document.getElementById("name").value;
    let price     = document.getElementById("price").value;
    let startTime = document.getElementById("startTime").value;
    let endTime   = document.getElementById("endTime").value;
    let file      = document.getElementById("image").files[0];

    if(!name || !price || !startTime || !endTime || !file){
        alert("Please fill all fields");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    let upload    = await fetch("/admin/uploadImage", { method:"POST", body:formData });
    let imagePath = await upload.text();

    let params = new URLSearchParams();
    params.append("itemName",   name);
    params.append("price",      price);
    params.append("startTime",  startTime);
    params.append("endTime",    endTime);
    params.append("imagePath",  imagePath);

    let response = await fetch("/admin/addAuction", {
        method  : "POST",
        headers : { "Content-Type": "application/x-www-form-urlencoded" },
        body    : params.toString()
    });

    if(response.ok){
        alert("Auction Added Successfully");
    } else {
        alert("Error adding auction");
    }
}

/* =========================
   PAGE ROUTING
========================= */

if(window.location.pathname.includes("dashboard.html")){
    loadAuctions();
}

if(window.location.pathname.includes("auction-detail.html")){
    loadAuction();
}
