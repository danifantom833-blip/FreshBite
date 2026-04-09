const CART_KEY = 'freshbite_cart_v1';
const DELIVERY_FEE = 2.5;
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

let currentMenuCategory = 'all';
let currentMenuSearch = '';

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

function getCheckoutTotal() {
  return getCartTotal() + DELIVERY_FEE;
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
  // Update floating cart count
  document.querySelectorAll('.floating-cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
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

  // Add bounce animation to cart indicators
  document.querySelectorAll('.cart-indicator, .floating-cart').forEach(indicator => {
    indicator.classList.add('bounce');
    setTimeout(() => indicator.classList.remove('bounce'), 300);
  });
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

  const searchTerm = currentMenuSearch.trim().toLowerCase();
  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = currentMenuCategory === 'all' || item.category === currentMenuCategory;
    const matchesSearch = searchTerm === '' || item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (!filteredItems.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No meals found</h3>
        <p>Try a different category or search term.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  filteredItems.forEach(item => {
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
    requestAnimationFrame(() => card.classList.add('show'));
  });
}

function filterMenu(category) {
  currentMenuCategory = category;
  const buttons = document.querySelectorAll('[data-category]');
  buttons.forEach(button => button.classList.toggle('active', button.dataset.category === category));
  renderMenu();
}

function renderCartPage() {
  const cartList = document.getElementById('cart-list');
  if (!cartList) return;
  const cart = loadCart();
  if (!cart.length) {
    cartList.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some delicious items from our menu</p>
        <a href="Menu.html" class="btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }
  cartList.innerHTML = '';
  cart.forEach(entry => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === entry.id);
    if (!item) return;
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item fade-in';
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-title">${item.name}</h4>
        <p class="cart-item-description">${item.description}</p>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
          <span class="quantity">${entry.quantity}</span>
          <button class="quantity-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `;
    cartList.appendChild(cartItem);
  });
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
  const subtotal = getCartTotal();
  const deliveryFee = DELIVERY_FEE;
  const total = getCheckoutTotal();
  const itemsHtml = cart.map(entry => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === entry.id);
    if (!item) return '';
    return `
      <div class="order-summary-item">
        <div class="order-summary-item-info">
          <div class="order-summary-item-image"><img src="${item.image}" alt="${item.name}"></div>
          <div>
            <div class="order-summary-item-title">${item.name}</div>
            <div class="order-summary-item-meta">${entry.quantity} × ${formatPrice(item.price)}</div>
          </div>
        </div>
        <div class="order-summary-item-total">${formatPrice(item.price * entry.quantity)}</div>
      </div>
    `;
  }).join('');

  checkoutSummary.innerHTML = `
    <div class="checkout-card">
      <div class="checkout-summary-head">
        <div>
          <h3>Order Summary</h3>
          <p class="subtle">Review your items before placing your order.</p>
        </div>
        <span class="tag accent">Secure Checkout</span>
      </div>
      <div class="checkout-summary-list">
        ${itemsHtml}
      </div>
      <div class="summary-total-block">
        <div class="summary-line"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
        <div class="summary-line"><span>Delivery fee</span><strong>${formatPrice(deliveryFee)}</strong></div>
        <div class="summary-line total-line"><span>Total</span><strong>${formatPrice(total)}</strong></div>
      </div>
    </div>
  `;
}

function activatePageAnimations() {
  const animationItems = document.querySelectorAll('.slide-up:not(.show), .fade-in:not(.show)');
  if (!animationItems.length) return;
  requestAnimationFrame(() => {
    animationItems.forEach(el => el.classList.add('show'));
  });
}

function openWhatsAppOrder(customText) {
  const cart = loadCart();
  if (!cart.length) {
    window.location.href = 'Menu.html';
    return;
  }
  const lines = cart.map(entry => {
    const item = MENU_ITEMS.find(menuItem => menuItem.id === entry.id);
    return `${item?.name} x${entry.quantity}`;
  });
  const text = customText || `Hi FreshBite, I would like to order:\n${lines.join('\n')}\nTotal: ${formatPrice(getCartTotal())}`;
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

  const searchField = document.getElementById('menu-search');
  if (searchField) {
    searchField.addEventListener('input', event => {
      currentMenuSearch = event.target.value;
      renderMenu();
    });
  }

  // Check URL parameters for category
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  if (category) {
    filterMenu(category);
  } else {
    const initial = document.querySelector('[data-category="all"]');
    if (initial) initial.click();
  }
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
    const email = checkoutForm.email.value.trim();
    const address = checkoutForm.address.value.trim();
    const instructions = checkoutForm.instructions.value.trim();
    const paymentMethod = checkoutForm.paymentMethod.value;

    if (!name || !phone || !address) {
      showToast('Please fill in the required fields.');
      return;
    }

    const result = document.getElementById('checkout-result');
    if (paymentMethod === 'whatsapp') {
      openWhatsAppOrder(`Hi FreshBite, I would like to place this order:\nName: ${name}\nPhone: ${phone}${email ? `\nEmail: ${email}` : ''}\nAddress: ${address}${instructions ? `\nInstructions: ${instructions}` : ''}\n\nOrder details:`);
    }

    saveCart([]);
    updateCartCount();

    if (result) {
      result.style.display = 'block';
      result.innerHTML = `
        <h3>Order confirmed!</h3>
        <p>Thanks, ${name}. Your meal is on its way — expect fast delivery soon.</p>
        <p class="subtle">Payment method: ${paymentMethod === 'whatsapp' ? 'WhatsApp Order' : 'Pay on Delivery'}</p>
      `;
    }
    checkoutForm.style.display = 'none';
    document.getElementById('checkout-summary').style.display = 'none';
  });
}

let testimonialIndex = 0;
let testimonialTimer;
function showSlide(index) {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  if (!slides.length) return;
  testimonialIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === testimonialIndex);
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === testimonialIndex);
  });
  startTestimonialAuto();
}

function startTestimonialAuto() {
  clearInterval(testimonialTimer);
  testimonialTimer = setInterval(() => {
    showSlide(testimonialIndex + 1);
  }, 6000);
}

function initTestimonialSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  if (!slides.length) return;
  showSlide(0);
  startTestimonialAuto();
}

function initPage() {
  updateCartCount();
  renderMenu();
  handleCategoryButtons();
  renderCartPage();
  renderCheckoutSummary();
  setupNavigation();
  handleCheckoutForm();
  initTestimonialSlider();
  activatePageAnimations();
  document.body.classList.add('loaded');
}

window.addEventListener('DOMContentLoaded', initPage);

const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav-menu");

toggle.addEventListener("click", () => {
  nav.classList.toggle("active");
});

