const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItems = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const CheckoutBtn = document.getElementById("checkout-btn")
const CloseModal = document.getElementById("close-modal-btn")
const cartCount = document.getElementById("cart-count")
const addresInput = document.getElementById("address")
const addresWarn = document.getElementById("address-warn")
const observationInput = document.getElementById("observation")

let cart = [];

// abrir o modal de carrinho
cartBtn.addEventListener("click", function(){
    cartModal.style.display = "flex"
    updateCartModal();
})

// fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event){
    if(event.target === cartModal){
        cartModal.style.display = "none"
    }
})

// fechar a aba de modal
CloseModal.addEventListener("click", function(){
    cartModal.style.display = "none"
})

menu.addEventListener("click", function(event){

    let parentButton = event.target.closest(".add-to-cart-btn")

    if(parentButton){
        const name  = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))

        //console.log(name)
        //console.log(price)

        addToCart(name, price);
    }
 
})

// Função para adicionar no carrinho
function addToCart(name, price){

    const existingItem = cart.find(item => item.name === name)

    if(existingItem){
        existingItem.quantity++;
        return;
    }
    else{
        cart.push({
            name,
            price,
            quantity: 1,
        })
    }
    
    updateCartModal()

    return;
}

// Atualiza o carrinho
function updateCartModal(){
    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(item =>{

        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")

        cartItemElement.innerHTML = `
            <div class = "flex items-center justify-between">
                <div>
                    <p class = "font-medium">${item.name}</p>
                    <p>Qtd: ${item.quantity}</p>
                    <p class = "font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>

                <div>
                    <button class = "remove-from-cart-btn" data-name="${item.name}" >Remover</button>
                </div>
            </div>
        `

        total += item.price * item.quantity;

        cartItems.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCount.innerHTML = cart.length;

    return total;
}

// Função para remover o item do carrinho
cartItems.addEventListener("click", function(event){
    if(event.target.classList.contains("remove-from-cart-btn")){
        const name = event.target.getAttribute("data-name")

        removeItemCart(name);
    }   
})

function removeItemCart(name){
   const index = cart.findIndex(item => item.name === name);

   if (index !== -1){
    const item = cart[index];

    if(item.quantity > 1){
        item.quantity--;
        updateCartModal();
        return;
    }

    cart.splice(index, 1);  // splice = pega a posição que estammos mandando e remove este objeto da lista
    updateCartModal();
    
   }
}

addresInput.addEventListener("input", function(event){
    let inputValue = event.target.value;

    if(inputValue !== ""){
        addresInput.classList.remove("border-red-700")
        addresWarn.classList.add("hidden")
    }
})

// Função para finalizar a compra
CheckoutBtn.addEventListener("click", function(){

    const isOpen = checkrestaurantOpen();
    if(!isOpen){

        Toastify({
            text: "Desculpe, o restaurante está fechado no momento.",
            duration: 3000,  
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
          }).showToast();
          
        return;
    }
    if(cart.length === 0) return;

    if(addresInput.value === ""){
        addresWarn.classList.remove("hidden")
        addresInput.classList.add("border-red-700")
        return;
    }

    // Enviar o pedido para api whatsaap
    const cartItems = cart.map((item) => {
        return(
             `${item.name}:  quantidade: ${item.quantity}, preço: R$ ${item.price} | `
        )
    }).join("%0A")
    
    const observation = observationInput.value.trim();
    
    let message = `*Pedido:*%0A${cartItems}%0A`;
    
    message += `*%0AEndereço:* ${addresInput.value}%0A`;
    
    if (observation){
        message += `%0A*Observação:* ${observation}`;
    }
    
    message += `%0A*Valor Total:* R$ ${total.toFixed(2)}`;
    
    const phone = "+5534996583889"

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")

    cart = [];
    updateCartModal();
    observationInput.value = ""; // Limpa o campo de observação
})

// verificar se oo restarante está aberto
function checkrestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    return hora >= 10 && hora < 22; //true
}

const spanItem = document.getElementById("date-span")
const isOpen = checkrestaurantOpen();
if(isOpen){
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else{
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}
