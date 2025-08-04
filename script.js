const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItems = document.getElementById("cart-items")
const cartCount = document.getElementById("cart-count"); // Já está correto aqui
const closeModalBtn = document.getElementById("close-modal-btn")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")
const observationInput = document.getElementById("observation")

let cart = [];

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    updateCartModal();
    cartModal.classList.remove("hidden");
});

// Fechar o modal quando clicar fora ou no botão de fechar
cartModal.addEventListener("click", function(event) {
    if (event.target === cartModal) {
        cartModal.classList.add("hidden");
    }
});

closeModalBtn.addEventListener("click", function() {
    cartModal.classList.add("hidden");
});

// Adicionar item ao carrinho
document.querySelectorAll(".add-to-cart-btn").forEach(button => {
    button.addEventListener("click", function (event) {
        // Usamos currentTarget para garantir que estamos pegando o botão pai, e não o ícone
        const parentButton = event.currentTarget;
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));
        
        addToCart(name, price);
    });
});

// Adicionar ao carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }

    Toastify({
        text: "Item adicionado ao carrinho",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "#16a34a",
        },
    }).showToast();

    updateCartModal();
}

// Atualiza o carrinho
function updateCartModal() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class="font-bold mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `;

        total += item.price * item.quantity;

        cartItems.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.length; // Adicionada linha para atualizar o contador
}

// Remover item do carrinho
cartItems.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
            updateCartModal();
            return;
        }

        cart.splice(index, 1);
        updateCartModal();
    }
}

// Finalizar pedido
checkoutBtn.addEventListener("click", function() {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops o restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    if (cart.length === 0) {
        Toastify({
            text: "Seu carrinho está vazio!",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    // Enviar o pedido para a API do Whatsapp
    const cartItems = cart.map((item) => {
        return `*${item.name}* \n Quantidade: (${item.quantity}) \n Preço: R$${(item.price * item.quantity).toFixed(2)}\n\n`;
    }).join("");

    const message = `
    *NOVO PEDIDO* \n\n
    Endereço: ${addressInput.value} \n
    Observação: ${observationInput.value} \n
    Total: R$${cartTotal.textContent} \n\n
    ${cartItems}`;

    const phoneNumber = "5534999999999";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");

    cart = [];
    updateCartModal();
    cartModal.classList.add("hidden");
});

// Verificar se o restaurante está aberto
function checkRestaurantOpen() {
    const date = new Date();
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda...
    const hour = date.getHours();

    const isOpen = (dayOfWeek >= 2 && dayOfWeek <= 6) && (hour >= 18 && hour < 23);
    
    const dateSpan = document.getElementById("date-span");
    if (isOpen) {
        dateSpan.classList.remove("bg-red-500");
        dateSpan.classList.add("bg-green-600");
    } else {
        dateSpan.classList.remove("bg-green-600");
        dateSpan.classList.add("bg-red-500");
    }

    return isOpen;
}

checkRestaurantOpen();
