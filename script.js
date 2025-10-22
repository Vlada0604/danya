// Глобальний список товарів (використовується для фільтрації та кошика)
const products = [
    { id: 1, name: "Крем Гіалурон", price: 650, category: "face", image: "images/product-1.jpg" },
    { id: 2, name: "Сироватка Віт. C", price: 890, category: "face", image: "images/product-2.jpg" },
    { id: 3, name: "Гель для душу 'Океан'", price: 250, category: "body", image: "images/product-3.jpg" },
    { id: 4, name: "Маска для волосся з кератином", price: 580, category: "hair", image: "images/product-4.jpg" },
    { id: 5, name: "Нічний крем-регенератор", price: 920, category: "face", image: "images/product-5.jpg" },
    { id: 6, name: "Скраб для тіла з кавою", price: 340, category: "body", image: "images/product-6.jpg" }
];

// 1. Функції для роботи з кошиком (LocalStorage)
function getCart() {
    return JSON.parse(localStorage.getItem('cosmeticsCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cosmeticsCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function addToCart(productId, name, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, name: name, price: price, quantity: 1 });
    }

    saveCart(cart);
    alert(`${name} додано до кошика!`);
}

function changeQuantity(productId, newQuantity) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);

    if (item) {
        const quantity = parseInt(newQuantity);
        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    saveCart(cart);
    if (document.getElementById('cart-items-container')) {
        renderCart(); 
    }
}

function removeItem(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    renderCart();
}

function clearCart() {
    saveCart([]);
    renderCart();
    alert('Кошик очищено!');
}

// ===========================================
// 3. ЛОГІКА ФІЛЬТРАЦІЇ ТА ВІДОБРАЖЕННЯ КАТАЛОГУ
// ===========================================
const catalogContainer = document.getElementById('product-catalog');
const priceRange = document.getElementById('price-range');

function applyFilters() {
    if (!catalogContainer) return;

    // 1. Отримання обраних категорій
    const categoryCheckboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.id); // face, body, hair

    // 2. Отримання максимальної ціни
    const maxPrice = parseFloat(priceRange ? priceRange.value : 1000); 

    // 3. Фільтрація статичних карток товарів
    const productCards = catalogContainer.querySelectorAll('.product-card');
    let foundProducts = 0;

    productCards.forEach(card => {
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        if (!addToCartBtn) return;
        
        const productId = parseInt(addToCartBtn.dataset.id);
        const product = products.find(p => p.id === productId);
        
        if (!product) return; 

        // Перевірка відповідності фільтрам
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const priceMatch = product.price <= maxPrice;

        if (categoryMatch && priceMatch) {
            // Товар відповідає - показуємо його
            card.style.display = 'block'; 
            foundProducts++;
        } else {
            // Товар не відповідає - приховуємо
            card.style.display = 'none';
        }
    });

    // 4. Управління повідомленням про відсутність результатів
    let noResultsMessage = document.getElementById('no-results-message');
    
    if (foundProducts === 0) {
        if (!noResultsMessage) {
            const msg = document.createElement('p');
            msg.id = 'no-results-message';
            msg.style.gridColumn = '1 / -1'; 
            msg.style.textAlign = 'center';
            msg.style.color = '#ff69b4';
            msg.textContent = 'Товарів за вибраними фільтрами не знайдено.';
            catalogContainer.appendChild(msg);
            noResultsMessage = msg;
        }
        noResultsMessage.style.display = 'block';
    } else {
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }
}

// 2. Ініціалізація та обробники подій
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Обробник для кнопок "Додати в кошик"
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            addToCart(id, name, price);
        }
    });

    // *** ІНІЦІАЛІЗАЦІЯ ФІЛЬТРІВ КАТАЛОГУ ***
    if (catalogContainer) {
        // Обробник для зміни категорій
        document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });

        // Обробник для зміни цінового діапазону
        if(priceRange) {
            priceRange.addEventListener('input', () => {
                document.getElementById('price-value').textContent = priceRange.value;
                applyFilters();
            });
            const priceValueDisplay = document.getElementById('price-value');
            if (priceValueDisplay) {
                priceValueDisplay.textContent = priceRange.value;
            }
        }
        
        // !!! ЦЕЙ ВИКЛИК ПОКАЗУЄ ВСІ ТОВАРИ ПРИ ЗАВАНТАЖЕННІ І АКТИВУЄ ФІЛЬТРИ !!!
        applyFilters(); 
    }
    // *** КІНЕЦЬ ЛОГІКИ ФІЛЬТРІВ КАТАЛОГУ ***


    // 4. Функції для сторінки КОШИКА (залишаємо без змін)
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const orderForm = document.getElementById('order-form');
    
    if (cartContainer) {
        renderCart();

        cartContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-quantity-input')) {
                const id = parseInt(e.target.dataset.id);
                const quantity = parseInt(e.target.value);
                changeQuantity(id, quantity);
            }
        });

        cartContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const id = parseInt(e.target.dataset.id);
                removeItem(id);
            }
        });

        const clearCartButton = document.querySelector('.clear-cart-btn');
        if(clearCartButton) clearCartButton.addEventListener('click', clearCart);
    }
    
    // Відображення товарів кошика
    function renderCart() {
        const cart = getCart();
        
        if (!cartContainer || !cartTotalElement) return;
        
        cartContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Ваш кошик порожній. Перейдіть до <a href="catalog.html">каталогу</a>, щоб додати товари.</p>';
            cartTotalElement.textContent = '0.00';
            if(orderForm) orderForm.style.display = 'none';
            return;
        }

        if(orderForm) orderForm.style.display = 'block';

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            itemElement.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} грн/шт</p>
                </div>
                <div class="item-quantity">
                    Кількість: 
                    <input type="number" class="item-quantity-input" data-id="${item.id}" value="${item.quantity}" min="1">
                </div>
                <div class="item-subtotal">
                    <p>Сума: ${itemTotal.toFixed(2)} грн</p>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">Видалити</button>
            `;
            cartContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = total.toFixed(2);
    }
    
    // 5. Обробник ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const cart = getCart();
            if (cart.length === 0) {
                alert('Не можна оформити порожнє замовлення!');
                return;
            }
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                items: cart,
                total: parseFloat(document.getElementById('cart-total').textContent)
            };
            
            console.log('Оформлення замовлення:', formData);

            document.getElementById('order-message').style.display = 'block';
            orderForm.reset();
            clearCart();
            
            setTimeout(() => {
                document.getElementById('order-message').style.display = 'none';
            }, 5000);
        });
    }

});
