const API = '';

// Get token
function getToken() {
  return localStorage.getItem('token');
}

// Get user
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Update navbar
function updateNavbar() {
  const user = getUser();
  const navLogin = document.getElementById('nav-login');
  const navLogout = document.getElementById('nav-logout');
  const navUsername = document.getElementById('nav-username');
  const navAdmin = document.getElementById('nav-admin');
  const navOrders = document.getElementById('nav-orders');

  if (user) {
    if (navLogin) navLogin.style.display = 'none';
    if (navLogout) navLogout.style.display = 'inline';
    if (navUsername) navUsername.textContent = `Hi, ${user.name}`;
    if (navOrders) navOrders.style.display = 'inline';
    if (navAdmin) navAdmin.style.display = user.isAdmin ? 'inline' : 'none';
  } else {
    if (navLogin) navLogin.style.display = 'inline';
    if (navLogout) navLogout.style.display = 'none';
    if (navUsername) navUsername.textContent = '';
    if (navOrders) navOrders.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
  }
  // Logout
 if (navLogout) {
    navLogout.addEventListener('click', (e) => {
      e.preventDefault();
      showLogoutModal();
    });
  }
}

// Cart functions
function getCart() {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = count;
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item._id === product._id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  showAlert('Product added to cart! 🛒', 'success');
}

// Show alert
function showAlert(message, type) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  document.body.appendChild(alert);
  alert.style.position = 'fixed';
  alert.style.top = '80px';
  alert.style.right = '20px';
  alert.style.zIndex = '999';
  setTimeout(() => alert.remove(), 3000);
}

// Render product card
function renderProductCard(product) {
  return `
    <div class="product-card" onclick="window.location.href='/product.html?id=${product._id}'">
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x200?text=No+Image'"/>
      <div class="product-info">
        <div class="category">${product.category}</div>
        <h3>${product.name}</h3>
        <div class="price">$${product.price.toFixed(2)}</div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

// API call helper
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${endpoint}`, options);
  return res.json();
}
function showLogoutModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-icon">👋</div>
      <h3>Leaving so soon?</h3>
      <p>Are you sure you want to logout from SHOPTOP?</p>
      <div class="modal-buttons">
        <button class="modal-btn-cancel" onclick="this.closest('.modal-overlay').remove()">
          Stay
        </button>
        <button class="modal-btn-confirm" onclick="confirmLogout()">
          Yes, Logout
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function confirmLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}
// Init
updateNavbar();
updateCartCount();