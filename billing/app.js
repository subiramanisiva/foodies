let products = [
    { id: 1, name: 'Vada', price: 20, category: 'Snacks', icon: '🍩' },
    { id: 2, name: 'Panipuri', price: 30, category: 'Snacks', icon: '🥣' },
    { id: 3, name: 'Masala Dosa', price: 50, category: 'Snacks', icon: '🥞' },
    { id: 4, name: 'Tea', price: 15, category: 'Beverages', icon: '☕' }
];

let cart = [];
let transactions = [];

// Load from local storage if available
const savedProducts = localStorage.getItem('bitepos_products');
if (savedProducts) products = JSON.parse(savedProducts);

const savedTransactions = localStorage.getItem('bitepos_transactions');
if (savedTransactions) transactions = JSON.parse(savedTransactions);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    initNavigation();
    initCategoryFilters();
    
    renderProducts();
    updateCart();
    initMonthFilter();
    renderTransactions();
});

// --- Date & Time ---
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('current-datetime').textContent = now.toLocaleDateString('en-US', options);
}

// --- Navigation ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-links li');
    const views = document.querySelectorAll('.view');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch view
            const targetTab = item.dataset.tab;
            views.forEach(view => {
                view.classList.remove('active');
                view.classList.add('hidden');
                if (view.id === `${targetTab}-view`) {
                    view.classList.add('active');
                    view.classList.remove('hidden');
                }
            });

            if (targetTab === 'statement') {
                renderTransactions();
            }
        });
    });
}

// --- Product Listing ---
function initCategoryFilters() {
    const catBtns = document.querySelectorAll('.categories .cat-btn');
    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Fix to ignore the add dish button which also has cat-btn class initially
            if (btn.hasAttribute('onclick')) return;

            // Only remove active from category selection buttons
            document.querySelectorAll('.categories .cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(btn.textContent.trim());
        });
    });
}

function renderProducts(filter = 'All Items') {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    
    const filteredProducts = filter === 'All Items' 
        ? products 
        : products.filter(p => p.category === filter);
        
    filteredProducts.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card glass-panel';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div class="product-icon" style="font-size: 2rem; margin-bottom: 10px;">${product.icon}</div>
            <h4 style="margin: 0 0 5px 0;">${product.name}</h4>
            <p style="margin: 0; color: var(--text-secondary, #ccc);">₹${product.price.toFixed(2)}</p>
        `;
        div.addEventListener('click', () => addToCart(product.id));
        productList.appendChild(div);
    });
}

// --- Cart Operations ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.product.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }
    
    updateCart();
}

function decreaseCart(productId) {
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        updateCart();
    }
}

function clearCart() {
    if(cart.length === 0) return;
    if(confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        updateCart();
    }
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = `
            <div class="empty-cart-msg">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Cart is empty</p>
            </div>
        `;
        document.getElementById('cart-subtotal').textContent = '₹0.00';
        document.getElementById('cart-tax').textContent = '₹0.00';
        document.getElementById('cart-total').textContent = '₹0.00';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '12px 0';
        div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="font-weight: 600; margin-bottom: 4px;">${item.product.name}</div>
                <div style="font-size: 0.85em; opacity: 0.8;">₹${item.product.price.toFixed(2)} each</div>
            </div>
            <div style="display:flex; align-items:center; gap: 12px; background: rgba(255,255,255,0.05); border-radius: 20px; padding: 4px 8px;">
                <button onclick="decreaseCart(${item.product.id})" style="background:none; border:none; color:inherit; cursor:pointer;"><i class="fa-solid fa-minus"></i></button>
                <span style="font-weight: 600; min-width: 15px; text-align: center;">${item.quantity}</span>
                <button onclick="addToCart(${item.product.id})" style="background:none; border:none; color:inherit; cursor:pointer;"><i class="fa-solid fa-plus"></i></button>
            </div>
            <div style="text-align: right; width: 80px; font-weight: 600;">₹${itemTotal.toFixed(2)}</div>
        `;
        cartItemsDiv.appendChild(div);
    });
    
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
}

// --- Checkout ---
function processCheckout() {
    if (cart.length === 0) {
        showToast('Cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const now = new Date();
    const monthYear = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    
    const transaction = {
        id: 'ORD' + Date.now().toString().slice(-6),
        date: now.toLocaleString(),
        items: cart.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
        total: total,
        monthYear: monthYear
    };
    
    transactions.push(transaction);
    localStorage.setItem('bitepos_transactions', JSON.stringify(transactions));
    
    // Bypass clearCart confirmation for checkout
    cart = [];
    updateCart();

    showToast('Payment Successful!');
    
    // Refresh statement data quietly
    initMonthFilter();
    
    // Provide a neat checkout animation if required
}

// --- Toast ---
function showToast(message) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = message;
    
    // Default styles for toast in case CSS doesn't cover it properly
    toast.style.visibility = 'visible';
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.visibility = 'hidden';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

// --- Statement & Reports ---
function initMonthFilter() {
    const filter = document.getElementById('month-filter');
    const months = new Set(transactions.map(t => t.monthYear));
    const now = new Date();
    const currentMonthYear = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
    months.add(currentMonthYear); // Always add current month
    
    const currentVal = filter.value;
    filter.innerHTML = '<option value="All">All Time</option>';
    
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        filter.appendChild(option);
    });
    
    if (currentVal && currentVal !== '') {
        // Try to keep previous selection
        if(months.has(currentVal) || currentVal === 'All') filter.value = currentVal;
    } else {
        // Default to current month
        filter.value = currentMonthYear;
    }
    
    filter.addEventListener('change', renderTransactions);
}

function renderTransactions() {
    const filter = document.getElementById('month-filter').value;
    const filteredTxs = filter === 'All' 
        ? transactions 
        : transactions.filter(t => t.monthYear === filter);
        
    const tbody = document.getElementById('transaction-list');
    tbody.innerHTML = '';
    
    let totalRev = 0;
    
    filteredTxs.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(tx => {
        totalRev += tx.total;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tx.id}</td>
            <td>${tx.date}</td>
            <td>${tx.items}</td>
            <td>₹${tx.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('total-revenue').textContent = `₹${totalRev.toFixed(2)}`;
    document.getElementById('total-orders').textContent = filteredTxs.length;
    
    calculateTopItem(filteredTxs);
}

function calculateTopItem(txs) {
    if (txs.length === 0) {
        document.getElementById('top-item').textContent = '-';
        return;
    }
    
    const itemCounts = {};
    txs.forEach(tx => {
        const itemsList = tx.items.split(', ');
        itemsList.forEach(itemStr => {
            const match = itemStr.match(/(.+?) \(x(\d+)\)/);
            if (match) {
                const name = match[1];
                const qty = parseInt(match[2]);
                itemCounts[name] = (itemCounts[name] || 0) + qty;
            }
        });
    });
    
    let topItem = '-';
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topItem = name;
        }
    }
    
    document.getElementById('top-item').textContent = topItem;
}

// --- Add Dish Modal ---
window.openAddDishModal = function() {
    document.getElementById('addDishModal').classList.remove('hidden');
    // Ensure display is flex if CSS uses classes for hiding
    document.getElementById('addDishModal').style.display = 'flex';
}

window.closeAddDishModal = function() {
    document.getElementById('addDishModal').classList.add('hidden');
    document.getElementById('addDishModal').style.display = 'none';
    
    // Clear inputs
    document.getElementById('newDishName').value = '';
    document.getElementById('newDishPrice').value = '';
    document.getElementById('newDishIcon').value = '';
}

window.saveNewDish = function() {
    const name = document.getElementById('newDishName').value.trim();
    const price = parseFloat(document.getElementById('newDishPrice').value);
    const category = document.getElementById('newDishCategory').value;
    const icon = document.getElementById('newDishIcon').value.trim() || '🍽️';
    
    if (!name || isNaN(price) || price <= 0) {
        alert('Please enter a valid item name and positive price.');
        return;
    }
    
    const newProduct = {
        id: Date.now(),
        name,
        price,
        category,
        icon
    };
    
    products.push(newProduct);
    localStorage.setItem('bitepos_products', JSON.stringify(products));
    
    closeAddDishModal();
    
    // Re-render products if current category matches
    const activeCatBtn = document.querySelector('.categories .cat-btn.active');
    if (activeCatBtn) {
        renderProducts(activeCatBtn.textContent.trim());
    } else {
        renderProducts();
    }
    
    showToast('Item added successfully!');
}

// Initial modal hide processing
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addDishModal');
    if(modal.classList.contains('hidden')) {
        modal.style.display = 'none';
    }
});
