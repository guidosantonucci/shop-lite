// Shop Lite: a tiny storefront with cart, discount codes and checkout.
const PRODUCTS = [
  { id: 'spf50-sunscreen', name: 'SPF 50 Daily Sunscreen', price: 34.0 },
  { id: 'spf30-lip-balm', name: 'SPF 30 Lip Balm', price: 9.5 },
  { id: 'mineral-mist', name: 'Mineral Face Mist', price: 22.0 },
  { id: 'after-sun-gel', name: 'After-Sun Cooling Gel', price: 18.0 },
];

const CODES = {
  SUN10: { type: 'percent', value: 10, label: '10% off applied' },
  SAVE5: { type: 'fixed', value: 5, label: '$5 off applied' },
  FREESHIP: { type: 'shipping', label: 'Free shipping applied' },
};

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_FEE = 5;
const STORAGE_KEY = 'shop-lite-cart';

const money = (n) => `$${n.toFixed(2)}`;
const $ = (sel) => document.querySelector(sel);

let state = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { lines: {}, code: null };
  } catch {
    return { lines: {}, code: null };
  }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function totals() {
  const subtotal = Object.entries(state.lines).reduce(
    (sum, [id, qty]) => sum + PRODUCTS.find((p) => p.id === id).price * qty, 0);
  const code = state.code && CODES[state.code];
  let discount = 0;
  if (code?.type === 'percent') discount = +(subtotal * code.value / 100).toFixed(2);
  if (code?.type === 'fixed') discount = Math.min(code.value, subtotal);
  const afterDiscount = subtotal - discount;
  const freeShip = code?.type === 'shipping' || afterDiscount >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shipping = freeShip ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: afterDiscount + shipping };
}

function renderProducts() {
  $('#product-grid').innerHTML = PRODUCTS.map((p) => `
    <li class="card" data-testid="product-card" data-product-id="${p.id}">
      <h3 data-testid="product-name">${p.name}</h3>
      <p data-testid="product-price">${money(p.price)}</p>
      <button data-testid="add-to-cart" data-id="${p.id}">Add to cart</button>
    </li>`).join('');
}

function renderCart() {
  const ids = Object.keys(state.lines);
  const count = Object.values(state.lines).reduce((a, b) => a + b, 0);
  $('[data-testid="cart-count"]').textContent = count;
  $('[data-testid="cart-empty"]').hidden = ids.length > 0;
  $('#cart-lines').innerHTML = ids.map((id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    const qty = state.lines[id];
    return `
      <li data-testid="cart-line" data-product-id="${id}">
        <span class="name" data-testid="line-name">${p.name}</span>
        <button data-testid="qty-decrease" data-id="${id}" aria-label="Decrease quantity">−</button>
        <span data-testid="line-qty">${qty}</span>
        <button data-testid="qty-increase" data-id="${id}" aria-label="Increase quantity">+</button>
        <span data-testid="line-total">${money(p.price * qty)}</span>
        <button data-testid="remove-line" data-id="${id}" aria-label="Remove ${p.name}">✕</button>
      </li>`;
  }).join('');
  const t = totals();
  $('[data-testid="subtotal"]').textContent = money(t.subtotal);
  $('[data-testid="discount"]').textContent = `-${money(t.discount)}`;
  $('[data-testid="shipping"]').textContent = t.shipping === 0 ? 'Free' : money(t.shipping);
  $('[data-testid="total"]').textContent = money(t.total);
  $('#checkout-btn').disabled = ids.length === 0;
}

function setQty(id, qty) {
  if (qty <= 0) delete state.lines[id];
  else state.lines[id] = Math.min(qty, 10); // max 10 per item
  save();
  renderCart();
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  switch (btn.dataset.testid) {
    case 'add-to-cart': setQty(id, (state.lines[id] || 0) + 1); $('#cart').hidden = false; break;
    case 'qty-increase': setQty(id, state.lines[id] + 1); break;
    case 'qty-decrease': setQty(id, state.lines[id] - 1); break;
    case 'remove-line': setQty(id, 0); break;
    case 'cart-toggle': $('#cart').hidden = !$('#cart').hidden; break;
    case 'checkout-btn': $('#checkout').hidden = false; $('#name').focus(); break;
    case 'continue-shopping': $('#confirmation').hidden = true; break;
  }
});

$('#discount-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = $('#discount-code').value.trim().toUpperCase();
  const msg = $('[data-testid="discount-message"]');
  if (!raw) {
    msg.textContent = 'Enter a discount code';
    msg.className = 'msg error';
  } else if (!CODES[raw]) {
    msg.textContent = `"${raw}" is not a valid code`;
    msg.className = 'msg error';
  } else {
    state.code = raw;
    msg.textContent = CODES[raw].label;
    msg.className = 'msg ok';
    save();
  }
  renderCart();
});

$('#checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const zip = $('#zip').value.trim();
  const error = $('[data-testid="checkout-error"]');
  if (!name) return (error.textContent = 'Full name is required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return (error.textContent = 'Enter a valid email address');
  if (!/^\d{5}$/.test(zip)) return (error.textContent = 'ZIP code must be 5 digits');
  error.textContent = '';

  const { total } = totals();
  $('[data-testid="order-number"]').textContent = `SL-${Date.now().toString().slice(-6)}`;
  $('[data-testid="order-total"]').textContent = money(total);
  state = { lines: {}, code: null };
  save();
  renderCart();
  e.target.reset();
  $('#checkout').hidden = true;
  $('#cart').hidden = true;
  $('#confirmation').hidden = false;
});

renderProducts();
renderCart();
