// Глобальний список товарів для Каталогу
const products = [
    { id: 1, name: "Крем Гіалурон", price: 650, category: "face", image: 
    { id: 2, name: "Сироватка Віт. C", price: 890, category: "face", image: "images/product-2.jpg" },
    { id: 3, name: "Гель для душу 'Океан'", price: 250, category: "body", image: https://profistyle.in.ua/image/cache/catalog/Brendj/Christina/crs3706_result-326x326.webp"images/product-3.jpg" },
    { id: 4, name: "Маска для волосся з кератином", price: 580, category: "hair",https://hair-expert.com.ua/image/cache/catalog/import_yml/104/110/989/531/kaypro-keratin-speci-450x450.jpg
    { id: 5, name: "Нічний крем-регенератор", price: 920, category: "face",https://cosmeticus.com.ua/files/resized/products/10057-pelart-laboratory-trifolium-pretense-collagen-night-cream-50-01.1200x1200.webp
    { id: 6, name: "Скраб для тіла з кавою", price: 340, category: "body", https://tinitun.com.ua/files/resized/products/img_4795.1200x1200.jpg-1.1200x1200.webp
    // Додайте більше товарів тут
];

// 1. Функції для роботи з кошиком (LocalStorage)
function getCart() {
    return JSON.parse(localStorage.getItem('cosmeticsCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cosmeticsCart', JSON.stringify(cart));
    updateCartCount(); // Оновлення лічильника щоразу при збереженні
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
            // Видаляємо товар, якщо кількість <= 0
            cart = cart.filter(i => i.id !== productId);
        }
    }
    saveCart(cart);
    // *** ВИПРАВЛЕНО: обов'язковий рендеринг кошика після зміни кількості
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


// 2. Ініціалізація та обробники подій
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); // Ініціалізуємо лічильник кошика

    // Обробник для кнопок "Додати в кошик" (на index.html та catalog.html)
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            addToCart(id, name, price);
        }
    });

    // 3. Функції для сторінки КАТАЛОГУ
    const catalogContainer = document.getElementById('product-catalog');
    const priceRange = document.getElementById('price-range');
    
    if (catalogContainer) {
        renderCatalog(); // Відображаємо всі товари
        
        // *** НОВИЙ КОД: Обробники фільтрів ***
        const filterElements = document.querySelectorAll('.filter-sidebar input[type="checkbox"], #price-range');
        filterElements.forEach(element => {
            element.addEventListener('change', renderCatalog);
            element.addEventListener('input', renderCatalog); // Для range input
        });
    }

    function renderCatalog() {
        if (!catalogContainer) return;
        
        // Отримання поточних значень фільтрів
        const selectedCategories = Array.from(document.querySelectorAll('.filter-sidebar input[type="checkbox"]:checked'))
                                      .map(checkbox => checkbox.id);
        const maxPrice = parseFloat(priceRange.value);

        // Фільтрація товарів
        const filteredProducts = products.filter(product => {
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const priceMatch = product.price <= maxPrice;
            return categoryMatch && priceMatch;
        });
        
        catalogContainer.innerHTML = ''; // Очищаємо перед рендерингом

        if (filteredProducts.length === 0) {
             catalogContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Товарів, що відповідають вашим фільтрам, не знайдено.</p>';
             return;
        }
        
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.classList.add('product-card');
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.price} грн</p>
                <button class="button add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                    Додати в кошик
                </button>
            `;
            catalogContainer.appendChild(card);
        });
    }

    // 4. Функції для сторінки КОШИКА
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const orderForm = document.getElementById('order-form');
    
    if (cartContainer) {
        renderCart();

        // Обробник змін кількості
        cartContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-quantity-input')) {
                const id = parseInt(e.target.dataset.id);
                const quantity = parseInt(e.target.value);
                changeQuantity(id, quantity);
            }
        });

        // Обробник видалення товару
        cartContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item-btn')) {
                const id = parseInt(e.target.dataset.id);
                removeItem(id);
            }
        });

        // Обробник очищення кошика
        const clearCartButton = document.querySelector('.clear-cart-btn');
        if(clearCartButton) clearCartButton.addEventListener('click', clearCart);
    }
    
    // Відображення товарів кошика
    function renderCart() {
        const cart = getCart();
        
        // Перевірка, чи елементи існують на сторінці (для уникнення помилок)
        if (!cartContainer || !cartTotalElement) return;
        
        cartContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Ваш кошик порожній. Перейдіть до <a href="catalog.html">каталогу</a>, щоб додати товари.</p>';
            cartTotalElement.textContent = '0.00';
            if(orderForm) orderForm.style.display = 'none'; // Ховаємо форму, якщо кошик порожній
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

        cartTotalElement.textContent = total.toFixed(2); // Оновлення загальної суми
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
            
            // Збір даних
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                items: cart,
                total: parseFloat(document.getElementById('cart-total').textContent)
            };
            
            // Імітація успішного оформлення
            console.log('Оформлення замовлення:', formData);

            document.getElementById('order-message').style.display = 'block';
            orderForm.reset();
            clearCart(); // Очищення кошика після успішного оформлення
            
            // Приховати повідомлення через 5 секунд
            setTimeout(() => {
                document.getElementById('order-message').style.display = 'none';
            }, 5000);
        });
    }

});
