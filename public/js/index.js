// Load best sellers
async function loadBestSellers() {
  const container = document.getElementById('best-sellers');
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const products = await apiCall('/api/products/bestsellers/all');

    if (!products.length) {
      container.innerHTML = '<div class="empty"><i class="fas fa-star"></i><p>No best sellers yet</p></div>';
      return;
    }

    container.innerHTML = products.map(p => renderProductCard(p)).join('');
  } catch (error) {
    container.innerHTML = '<div class="empty"><p>Error loading best sellers</p></div>';
  }
}

// Load categories on home page
async function loadHomeCategories() {
  const container = document.getElementById('home-categories');
  if (!container) return;

  try {
    const categories = await apiCall('/api/categories');

    if (!categories.length) {
      container.innerHTML = '<div class="empty"><p>No categories yet</p></div>';
      return;
    }

    container.innerHTML = categories.map(c => `
      <div class="category-card" onclick="window.location.href='/products.html?category=${encodeURIComponent(c.name)}'">
        ${c.image 
          ? `<img src="${c.image}" alt="${c.name}" onerror="this.style.display='none'"/>` 
          : `<div class="category-icon">${c.icon}</div>`
        }
        <div class="category-name">${c.name}</div>
      </div>
    `).join('');
  } catch (error) {
    console.log('Error loading categories');
  }
}

// Load nav categories (all pages)
async function loadNavCategories() {
  const container = document.getElementById('nav-categories');
  if (!container) return;

  try {
    const categories = await apiCall('/api/categories');
    container.innerHTML = categories.map(c => `
      <a href="/products.html?category=${encodeURIComponent(c.name)}">
        ${c.icon} ${c.name}
      </a>
    `).join('');
  } catch (error) {
    console.log('Error loading nav categories');
  }
}

loadBestSellers();
loadHomeCategories();
loadNavCategories();