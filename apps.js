/* ========= CISKO -- Front statique =========
   - Catalogue en mémoire (PRODUCTS)
   - Panier dans localStorage
   - Checkout par e-mail (modifiable)
   Intègre et ouvre index.html : tout fonctionne sans serveur.
============================================ */

const PRODUCTS = [
  {
    id: 1,
    name: "Tee-shirt Noir Logo",
    slug: "tee-noir-logo",
    description: "Coton bio 180g, coupe unisexe.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format",
    stock: 50
  },
  {
    id: 2,
    name: "Casquette Classique",
    slug: "casquette-classique",
    description: "Casquette réglable, broderie avant.",
    price: 1999,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format",
    stock: 120
  },
  {
    id: 3,
    name: "Hoodie Zip",
    slug: "hoodie-zip",
    description: "Molleton premium, zip YKK.",
    price: 5499,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1200&auto=format",
    stock: 35
  },
  {
    id: 4,
    name: "Tote Bag",
    slug: "tote-bag",
    description: "Coton épais, impression durable.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1515586000437-636c904b22d2?q=80&w=1200&auto=format",
    stock: 80
  },
  {
    id: 5,
    name: "Sweat Crewneck",
    slug: "sweat-crew",
    description: "Molleton 350g, col rond.",
    price: 4499,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format",
    stock: 40
  },
  {
    id: 6,
    name: "Bonnet",
    slug: "bonnet",
    description: "Maille douce, taille unique.",
    price: 1699,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format",
    stock: 70
  }
];

// -------- Utils
const € = (cents) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const byId = (id) => document.getElementById(id);
const qs = (sel, el = document) => el.querySelector(sel);
const params = new URLSearchParams(location.search);
const YEAR = new Date().getFullYear();

// -------- Header commun
function renderHeader() {
  const header = byId("site-header");
  if (!header) return;

  header.innerHTML = `
    <nav class="nav" aria-label="Navigation principale">
      <div class="nav-inner container">
        <a href="index.html" class="brand">🛍️ CISKO</a>
        <div class="row">
          <a class="btn" href="catalog.html">Catalogue</a>
          <a class="btn primary" href="checkout.html" aria-label="Ouvrir le panier">
            Panier <span class="badge" id="nav-cart-qty" aria-live="polite">0</span>
          </a>
        </div>
      </div>
    </nav>
  `;
  updateCartBadge();
}

// -------- Stockage Panier
const CART_KEY = "cisko_cart_v1";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '{"items":[]}'); }
  catch { return { items: [] }; }
}
function saveCart(state) {
  localStorage.setItem(CART_KEY, JSON.stringify(state));
}
function cartItems() { return loadCart().items; }

function addToCart(slug, qty = 1) {
  const p = PRODUCTS.find(x => x.slug === slug);
  if (!p) return;

  const state = loadCart();
  const idx = state.items.findIndex(i => i.slug === slug);
  if (idx >= 0) {
    state.items[idx].qty += qty;
  } else {
    state.items.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, qty });
  }
  saveCart(state);
  updateCartBadge();
}

function setQty(slug, qty) {
  const state = loadCart();
  const idx = state.items.findIndex(i => i.slug === slug);
  if (idx < 0) return;
  if (qty <= 0) state.items.splice(idx, 1);
  else state.items[idx].qty = qty;
  saveCart(state);
  updateCartBadge();
}
function inc(slug) { const it = cartItems().find(i=>i.slug===slug); setQty(slug, (it?.qty||0)+1); }
function dec(slug) { const it = cartItems().find(i=>i.slug===slug); setQty(slug, (it?.qty||0)-1); }
function removeItem(slug) { setQty(slug, 0); }
function clearCart() { saveCart({ items: [] }); updateCartBadge(); }

function totalQty() { return cartItems().reduce((s,i)=>s+i.qty,0); }
function totalPrice() { return cartItems().reduce((s,i)=>s+i.qty*i.price,0); }

function updateCartBadge() {
  const el = byId("nav-cart-qty");
  if (el) el.textContent = String(totalQty());
  const footerYear = Array.from(document.querySelectorAll("#year"));
  footerYear.forEach(n => n.textContent = YEAR);
}

// -------- Rendus

function renderCatalog() {
  const list = byId("product-list");
  if (!list) return;

  const input = byId("search");
  const paint = () => {
    const q = (input?.value || "").trim().toLowerCase();
    const filtered = PRODUCTS.filter(p =>
      !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    );

    list.innerHTML = filtered.map(p => `
      <article class="card" aria-label="${p.name}">
        <a href="product.html?slug=${encodeURIComponent(p.slug)}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" width="640" height="640" />
        </a>
        <div class="card-body">
          <a href="product.html?slug=${encodeURIComponent(p.slug)}" style="display:block;font-weight:600;margin-bottom:6px">
            ${p.name}
          </a>
          <div class="row between">
            <span class="price">${€(p.price)}</span>
            <button class="btn" data-add="${p.slug}">Ajouter</button>
          </div>
        </div>
      </article>
    `).join("");

    // Bind add buttons
    list.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        addToCart(btn.getAttribute("data-add"));
      });
    });
  };

  input?.addEventListener("input", paint, { passive: true });
  paint();
}

function renderProductDetail() {
  const wrap = byId("product-detail");
  if (!wrap) return;
  const slug = params.get("slug");
  const p = PRODUCTS.find(x => x.slug === slug);

  if (!p) {
    wrap.innerHTML = `<p>Produit introuvable.</p>`;
    return;
  }

  wrap.innerHTML = `
    <div><img src="${p.image}" alt="${p.name}" /></div>
    <div>
      <h1 class="m0">${p.name}</h1>
      <div style="font-size:22px;font-weight:700;margin:1rem 0">${€(p.price)}</div>
      <p>${p.description || ""}</p>
      <div class="row" style="margin-top:1rem">
        <div class="qty" aria-label="Quantité">
          <button id="minus">−</button><span id="qty">1</span><button id="plus">+</button>
        </div>
        <button class="btn primary" id="add">Ajouter au panier</button>
      </div>
    </div>
  `;

  let qty = 1;
  const qtyEl = byId("qty");
  byId("minus").addEventListener("click", ()=>{ qty = Math.max(1, qty-1); qtyEl.textContent = String(qty); });
  byId("plus").addEventListener("click", ()=>{ qty = qty+1; qtyEl.textContent = String(qty); });
  byId("add").addEventListener("click", ()=> addToCart(p.slug, qty));
}

function renderCart() {
  const box = byId("cart");
  if (!box) return;

  const items = cartItems();
  if (items.length === 0) {
    box.innerHTML = `<p>Votre panier est vide.</p>`;
  } else {
    box.innerHTML = items.map(it => `
      <div class="row between">
        <div class="row">
          <img src="${it.image}" alt="${it.name}" />
          <div>
            <div style="font-weight:600">${it.name}</div>
            <div class="muted small">${€(it.price)}</div>
            <div class="row" style="margin-top:6px">
              <div class="qty" aria-label="Quantité ${it.name}">
                <button data-dec="${it.slug}">−</button>
                <span>${it.qty}</span>
                <button data-inc="${it.slug}">+</button>
              </div>
              <button class="btn" data-rem="${it.slug}">Retirer</button>
            </div>
          </div>
        </div>
        <strong>${€(it.price * it.qty)}</strong>
      </div>
    `).join("");
  }

  const totalEl = byId("cart-total");
  if (totalEl) totalEl.textContent = "Total : " + €(totalPrice());

  // Bind actions
  box.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", ()=>{ inc(b.getAttribute("data-inc")); renderCart(); }));
  box.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", ()=>{ dec(b.getAttribute("data-dec")); renderCart(); }));
  box.querySelectorAll("[data-rem]").forEach(b => b.addEventListener("click", ()=>{ removeItem(b.getAttribute("data-rem")); renderCart(); }));

  const clearBtn = byId("clear-cart");
  if (clearBtn) clearBtn.onclick = () => { clearCart(); renderCart(); };
}

function handleCheckoutForm() {
  const form = byId("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const items = cartItems();
    if (items.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    const summary = [
      `Commande CISKO`,
      ``,
      `Client: ${data.name}`,
      `Email: ${data.email}`,
      `Adresse: ${data.address}, ${data.zip} ${data.city}`,
      ``,
      `Articles:`,
      ...items.map(i => `- ${i.name} x${i.qty} = ${€(i.price*i.qty)}`),
      ``,
      `Total: ${€(totalPrice())}`,
      ``,
      `---`,
      `Message généré automatiquement par le site CISKO`
    ].join("\n");

    // 👉 Remplace cet e-mail par le tien (ex: commandes@cisko.com)
    const ORDER_EMAIL = "contact@cisko-shop.example";
    const subject = encodeURIComponent("Commande CISKO");
    const body = encodeURIComponent(summary);
    location.href = `mailto:${ORDER_EMAIL}?subject=${subject}&body=${body}`;
  });
}

// -------- Boot
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  const page = document.body.getAttribute("data-page");

  if (page === "catalog") renderCatalog();
  if (page === "product") renderProductDetail();
  if (page === "checkout") { renderCart(); handleCheckoutForm(); }

  updateCartBadge();
});// ====== Utils (si pas déjà présentes) ======
const € = (cents) => (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const byId = (id) => document.getElementById(id);

// --- Panier minimal (si tu n'as rien pour le badge)
const CART_KEY = "cisko_cart_v1";
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '{"items":[]}'); }catch{ return {items:[]} } }
function totalQty(){ return loadCart().items.reduce((s,i)=>s+i.qty,0); }
function updateCartBadge(){ const el = byId("nav-cart-qty"); if(el) el.textContent = String(totalQty()); const y = byId("year"); if(y) y.textContent = new Date().getFullYear(); }

// ====== Rendu du catalogue ======
function renderCatalog() {
  const list = byId("product-list");
  const input = byId("search");
  if (!list) return;

  const paint = () => {
    const q = (input?.value || "").trim().toLowerCase();
    const filtered = (window.PRODUCTS || []).filter(p =>
      !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    );

    list.innerHTML = filtered.map(p => `
      <article class="card" aria-label="${p.name}">
        <a href="product.html?slug=${encodeURIComponent(p.slug)}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" width="640" height="640" />
        </a>
        <div class="card-body">
          <a href="product.html?slug=${encodeURIComponent(p.slug)}" style="display:block;font-weight:600;margin-bottom:6px">
            ${p.name}
          </a>
          <div class="row between">
            <span class="price">${€(p.price)}</span>
            <button class="btn" data-add="${p.slug}">Ajouter</button>
          </div>
        </div>
      </article>
    `).join("");

    // Boutons "Ajouter" → panier localStorage simple
    list.querySelectorAll("[data-add]").forEach(btn => {
      btn.addEventListener("click", () => {
        const slug = btn.getAttribute("data-add");
        const p = (window.PRODUCTS || []).find(x => x.slug === slug);
        if (!p) return;
        const state = loadCart();
        const idx = state.items.findIndex(i => i.slug === slug);
        if (idx >= 0) state.items[idx].qty += 1;
        else state.items.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, qty: 1 });
        localStorage.setItem(CART_KEY, JSON.stringify(state));
        updateCartBadge();
      });
    });
  };

  input?.addEventListener("input", paint, { passive: true });
  paint();
}

// ====== Boot catalogue (ne s'exécutera que sur catalog.html) ======
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  if (byId("product-list")) renderCatalog();
});
// ---------- Panier (déjà défini en partie) ----------
const CART_KEY = "cisko_cart_v1";
function loadCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY) || '{"items":[]}'); }catch{ return {items:[]} } }
function saveCart(state){ localStorage.setItem(CART_KEY, JSON.stringify(state)); }
function cartItems(){ return loadCart().items; }
function totalQty(){ return cartItems().reduce((s,i)=>s+i.qty,0); }
function totalPrice(){ return cartItems().reduce((s,i)=>s+i.qty*i.price,0); }
function updateCartBadge(){
  const el = document.getElementById("nav-cart-qty");
  if (el) el.textContent = String(totalQty());
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
}
function addToCartBySlug(slug, qty=1){
  const p = (window.PRODUCTS||[]).find(x=>x.slug===slug);
  if(!p) return;
  const state = loadCart();
  const idx = state.items.findIndex(i=>i.slug===slug);
  if(idx>=0) state.items[idx].qty += qty;
  else state.items.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, qty });
  saveCart(state); updateCartBadge();
}
function setQty(slug, qty){
  const state = loadCart();
  const idx = state.items.findIndex(i=>i.slug===slug);
  if(idx<0) return;
  if(qty<=0) state.items.splice(idx,1); else state.items[idx].qty = qty;
  saveCart(state); updateCartBadge();
}
function inc(slug){ const it = cartItems().find(i=>i.slug===slug); setQty(slug, (it?.qty||0)+1); }
function dec(slug){ const it = cartItems().find(i=>i.slug===slug); setQty(slug, (it?.qty||0)-1); }
function clearCart(){ saveCart({items:[]}); updateCartBadge(); }

// ---------- Fiche produit ----------
function renderProductDetail(){
  const wrap = document.getElementById("product-detail");
  if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const p = (window.PRODUCTS||[]).find(x=>x.slug===slug);

  if(!p){ wrap.innerHTML = `<p>Produit introuvable.</p>`; return; }

  wrap.innerHTML = `
    <div><img src="${p.image}" alt="${p.name}" /></div>
    <div>
      <h1 class="m0">${p.name}</h1>
      <div style="font-size:22px;font-weight:700;margin:1rem 0">${€(p.price)}</div>
      <p>${p.description || ""}</p>
      <div class="row" style="margin-top:1rem">
        <div class="qty" aria-label="Quantité">
          <button id="minus">−</button><span id="qty">1</span><button id="plus">+</button>
        </div>
        <button class="btn primary" id="add">Ajouter au panier</button>
      </div>
    </div>
  `;
  let qty = 1;
  const qtyEl = document.getElementById("qty");
  document.getElementById("minus").addEventListener("click", ()=>{ qty=Math.max(1,qty-1); qtyEl.textContent=String(qty); });
  document.getElementById("plus").addEventListener("click", ()=>{ qty=qty+1; qtyEl.textContent=String(qty); });
  document.getElementById("add").addEventListener("click", ()=> addToCartBySlug(p.slug, qty));
}

// ---------- Panier + Checkout ----------
function renderCart(){
  const box = document.getElementById("cart");
  if(!box) return;
  const items = cartItems();
  if(items.length===0){ box.innerHTML = `<p>Votre panier est vide.</p>`; }
  else {
    box.innerHTML = items.map(it=>`
      <div class="row between">
        <div class="row">
          <img src="${it.image}" alt="${it.name}" />
          <div>
            <div style="font-weight:600">${it.name}</div>
            <div class="muted small">${€(it.price)}</div>
            <div class="row" style="margin-top:6px">
              <div class="qty" aria-label="Quantité ${it.name}">
                <button data-dec="${it.slug}">−</button>
                <span>${it.qty}</span>
                <button data-inc="${it.slug}">+</button>
              </div>
              <button class="btn" data-rem="${it.slug}">Retirer</button>
            </div>
          </div>
        </div>
        <strong>${€(it.price*it.qty)}</strong>
      </div>
    `).join("");
  }
  const totalEl = document.getElementById("cart-total");
  if(totalEl) totalEl.textContent = "Total : " + €(totalPrice());

  box.querySelectorAll("[data-inc]").forEach(b=>b.addEventListener("click",()=>{ inc(b.getAttribute("data-inc")); renderCart(); }));
  box.querySelectorAll("[data-dec]").forEach(b=>b.addEventListener("click",()=>{ dec(b.getAttribute("data-dec")); renderCart(); }));
  box.querySelectorAll("[data-rem]").forEach(b=>b.addEventListener("click",()=>{ setQty(b.getAttribute("data-rem"),0); renderCart(); }));
  const clearBtn = document.getElementById("clear-cart");
  if(clearBtn) clearBtn.onclick = ()=>{ clearCart(); renderCart(); };
}

function handleCheckoutForm(){
  const form = document.getElementById("checkout-form");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const items = cartItems();
    if(items.length===0){ alert("Votre panier est vide."); return; }

    const summary = [
      `Commande CISKO`,
      ``,
      `Client: ${data.name}`,
      `Email: ${data.email}`,
      `Adresse: ${data.address}, ${data.zip} ${data.city}`,
      ``,
      `Articles:`,
      ...items.map(i=>`- ${i.name} x${i.qty} = ${€(i.price*i.qty)}`),
      ``,
      `Total: ${€(totalPrice())}`,
      ``,
      `---`,
      `Message généré automatiquement par le site CISKO`
    ].join("\n");

    const ORDER_EMAIL = "ahmed151199@hotmail.fr"; // ← REMPLACE par ton email de réception
    const subject = encodeURIComponent("Commande CISKO");
    const body = encodeURIComponent(summary);
    location.href = `mailto:${ORDER_EMAIL}?subject=${subject}&body=${body}`;
  });
}

// ---------- Boot commun ----------
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartBadge();
  if (document.getElementById("product-list")) { /* catalog.html */ }
  if (document.getElementById("product-detail")) renderProductDetail();
  if (document.getElementById("cart")) { renderCart(); handleCheckoutForm(); }
});
