const CART_KEY = 'freshbite_cart_v1';
const MENU_ITEMS = [
  { id: 'meal-1', name: 'Crispy Chicken Combo', category: 'grills', price: 12.5, description: 'Crispy chicken, soft bun, fries and drink.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-2', name: 'Beef Burger', category: 'grills', price: 11.0, description: 'Classic beef burger with cheddar and fresh greens.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-3', name: 'Spicy Rice Bowl', category: 'rice', price: 9.9, description: 'Seasoned rice bowl with chicken, veggies, and spice.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-4', name: 'Veggie Wrap', category: 'snacks', price: 8.4, description: 'Fresh wrap with greens, hummus, and crunchy veggies.', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-5', name: 'French Fries', category: 'snacks', price: 4.5, description: 'Golden fries with a crisp finish and garlic seasoning.', image: 'https://images.unsplash.com/photo-1541542684-4fb3e77c44d0?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-6', name: 'Mango Smoothie', category: 'drinks', price: 5.2, description: 'Refreshing mango smoothie, chilled and creamy.', image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-7', name: 'Loaded Nachos', category: 'snacks', price: 7.9, description: 'Crispy nachos topped with cheese, salsa, and jalapeños.', image: 'https://images.unsplash.com/photo-1601924582970-65dbf07eb9b0?auto=format&fit=crop&w=900&q=80' },
  { id: 'meal-8', name: 'Fish Tacos', category: 'snacks', price: 10.0, description: 'Crispy fish tacos with slaw and spicy sauce.', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80' }
];

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function getCartCount() {
  return loadCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return loadCart().reduce((sum, cartItem) => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === cartItem.id);
    return sum + (item ? item.price * cartItem.quantity : 0);
  }, 0);
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toast.hideTimeout);
  toast.hideTimeout = window.setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function addToCart(id) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showToast('Added to cart');
}

function removeFromCart(id) {
  const cart = loadCart().filter(item => item.id !== id);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
  showToast('Removed item');
}

function changeQuantity(id, value) {
  const cart = loadCart();
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + value);
  saveCart(cart);
  updateCartCount();
  renderCartPage();
}

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  grid.innerHTML = '';
  MENU_ITEMS.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card slide-up';
    card.innerHTML = `
      <div class="card-image"><img src="${item.image}" alt="${item.name}"></div>
      <div class="card-body">
        <h3 class="card-title">${item.name}</h3>
        <p class="card-text">${item.description}</p>
        <div class="card-meta">
          <span class="price">${formatPrice(item.price)}</span>
          <div class="card-actions">
            <button class="btn-secondary" type="button" onclick="addToCart('${item.id}')">Add to Cart</button>
            <button class="btn-primary" type="button" onclick="orderItem('${item.id}')">Order</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterMenu(category) {
  const buttons = document.querySelectorAll('[data-category]');
  buttons.forEach(button => button.classList.toggle('active', button.dataset.category === category));
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  grid.innerHTML = '';
  MENU_ITEMS.filter(item => category === 'all' || item.category === category).forEach(item => {
    const card = document.createElement('article');
    card.className = 'card slide-up';
    card.innerHTML = `
      <div class="card-image"><img src="${item.image}" alt="${item.name}"></div>
      <div class="card-body">
        <h3 class="card-title">${item.name}</h3>
        <p class="card-text">${item.description}</p>
        <div class="card-meta">
          <span class="price">${formatPrice(item.price)}</span>
          <div class="card-actions">
            <button class="btn-secondary" type="button" onclick="addToCart('${item.id}')">Add to Cart</button>
            <button class="btn-primary" type="button" onclick="orderItem('${item.id}')">Order</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderCartPage() {
  const cartList = document.getElementById('cart-list') || document.getElementById('order-summary');
  const actionPanel = document.getElementById('cart-actions') || document.getElementById('order-actions');
  if (!cartList || !actionPanel) return;
  const cart = loadCart();
  if (!cart.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <h3>Your tray is empty</h3>
        <p>Add items from the menu to see them here.</p>
      </div>
    `;
    actionPanel.innerHTML = `
      <div class="summary-card">
        <p class="subtle">Start browsing to add tasty meals, then come back to review or checkout.</p>
        <a class="btn-primary" href="Menu.html">Browse Menu</a>
      </div>
    `;
    return;
  }
  cartList.innerHTML = '';
  cart.forEach(entry => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === entry.id);
    if (!item) return;
    const orderItemCard = document.createElement('article');
    orderItemCard.className = 'order-item';
    orderItemCard.innerHTML = `
      <div class="order-item-content">
        <img src="${item.image}" alt="${item.name}">
        <div class="order-details">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="order-actions">
            <button class="btn-secondary" type="button" onclick="changeQuantity('${item.id}', -1)">-</button>
            <span class="price">${formatPrice(item.price * entry.quantity)}</span>
            <button class="btn-secondary" type="button" onclick="changeQuantity('${item.id}', 1)">+</button>
            <button class="btn-secondary" type="button" onclick="removeFromCart('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
    cartList.appendChild(orderItemCard);
  });
  const total = formatPrice(getCartTotal());
  actionPanel.innerHTML = `
    <div class="summary-card">
      <div class="summary-line"><span>Items</span><strong>${cart.length}</strong></div>
      <div class="summary-line"><span>Total</span><strong>${total}</strong></div>
      <div class="order-actions">
        <a class="btn-secondary" href="checkout.html">Checkout</a>
        <button class="btn-primary" type="button" onclick="openWhatsAppOrder()">Order on WhatsApp</button>
      </div>
    </div>
  `;
}

function renderCheckoutSummary() {
  const checkoutSummary = document.getElementById('checkout-summary');
  if (!checkoutSummary) return;
  const cart = loadCart();
  if (!cart.length) {
    checkoutSummary.innerHTML = `
      <div class="empty-state">
        <h3>Cart is empty</h3>
        <p>Add items before checkout so we can prepare your order.</p>
      </div>
    `;
    document.getElementById('checkout-form')?.classList.add('hidden');
    return;
  }
  const total = formatPrice(getCartTotal());
  const summaryLines = cart.map(entry => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === entry.id);
    return `<div class="summary-line"><span>${item?.name} × ${entry.quantity}</span><strong>${item ? formatPrice(item.price * entry.quantity) : ''}</strong></div>`;
  }).join('');
  checkoutSummary.innerHTML = `
    <div class="summary-card">
      ${summaryLines}
      <div class="summary-line summary-total"><span>Total</span><strong>${total}</strong></div>
    </div>
  `;
}

function openWhatsAppOrder() {
  const cart = loadCart();
  if (!cart.length) {
    window.location.href = 'Menu.html';
    return;
  }
  const lines = cart.map(entry => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === entry.id);
    return `${item?.name} x${entry.quantity}`;
  });
  const text = `Hi FreshBite, I would like to order:\n${lines.join('\n')}\nTotal: ${formatPrice(getCartTotal())}`;
  const phone = '1234567890';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function orderItem(id) {
  addToCart(id);
  setTimeout(() => {
    window.location.href = 'cart.html';
  }, 300);
}

function handleCategoryButtons() {
  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      filterMenu(button.dataset.category);
    });
  });
  const initial = document.querySelector('[data-category="all"]');
  if (initial) initial.click();
}

function setupNavigation() {
  document.querySelectorAll('.top-nav a, .bottom-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('wa.me')) return;
    const isSamePage = href.split('/').pop().toLowerCase() === window.location.pathname.split('/').pop().toLowerCase();
    if (isSamePage) link.classList.add('active');
    link.addEventListener('click', event => {
      const targetUrl = link.href;
      if (targetUrl.includes(window.location.host) || targetUrl.startsWith(window.location.origin) || !link.hostname) {
        event.preventDefault();
        document.body.classList.add('exiting');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 220);
      }
    });
  });
}

function handleCheckoutForm() {
  const checkoutForm = document.getElementById('checkout-form');
  if (!checkoutForm) return;
  checkoutForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = checkoutForm.name.value.trim();
    const phone = checkoutForm.phone.value.trim();
    const address = checkoutForm.address.value.trim();
    if (!name || !phone || !address) {
      showToast('Please fill in every field.');
      return;
    }
    saveCart([]);
    updateCartCount();
    const result = document.getElementById('checkout-result');
    if (result) {
      result.style.display = 'block';
      result.innerHTML = `
        <h3>Order placed!</h3>
        <p>Thanks, ${name}. Your order will be prepared and delivered soon.</p>
      `;
    }
    checkoutForm.style.display = 'none';
    document.getElementById('checkout-summary').style.display = 'none';
  });
}

function initPage() {
  updateCartCount();
  renderMenu();
  handleCategoryButtons();
  renderCartPage();
  renderCheckoutSummary();
  setupNavigation();
  handleCheckoutForm();
  document.body.classList.add('loaded');
}

window.addEventListener('DOMContentLoaded', initPage);
