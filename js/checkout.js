document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar si el usuario ha iniciado sesión usando la clave (token)
    const token = localStorage.getItem("token_mommiel"); 
    
    if (!token) {
        localStorage.setItem('destino_post_login', 'checkout.html');
        alert("Por favor, inicia sesión para poder finalizar tu compra.");
        window.location.href = "login.html"; 
        return;
    }

    // 2. Obtener el carrito guardado
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    console.log("Contenido real del carrito recibido en Checkout:", carrito);
    
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. ¡Elige algunos productos de MomMiel primero!");
        window.location.href = "index.html";
        return;
    }

    // Elementos de la interfaz (DOM)
    const listaResumen = document.getElementById("listaResumenCarrito");
    const badgeCantidad = document.getElementById("badgeCantidad");
    const subtotalCheckout = document.getElementById("subtotalCheckout");
    const totalCheckout = document.getElementById("totalCheckout");
    const formCheckout = document.getElementById("formCheckout");

    // Bloque de verificación 
    if (!listaResumen || !subtotalCheckout || !totalCheckout) {
        console.error("⚠️ ERROR: No se encontraron uno o más elementos en tu checkout.html. Verifica que los IDs coincidan exactamente con: listaResumenCarrito, subtotalCheckout, totalCheckout.");
    }

    // 3. Renderizar (pintar) los productos en el resumen lateral
    let totalAcumulado = 0;
    let cantidadProductos = 0;
    
    if (listaResumen) listaResumen.innerHTML = ""; 

    carrito.forEach(producto => {
        // Aseguramos que precio y cantidad sean tratados como números reales 
        const precioUnitario = parseFloat(producto.precio) || 0;
        const cantidadUnidades = parseInt(producto.cantidad) || 0;
        
        const subtotalProducto = precioUnitario * cantidadUnidades;
        totalAcumulado += subtotalProducto;
        cantidadProductos += cantidadUnidades;

        // Estructura visual para cada artículo usando tus clases Bootstrap
        const itemHTML = `
            <div class="item-carrito d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="my-0 font-weight-bold" style="color: var(--color-oscuro);">${producto.nombre || 'Producto sin nombre'}</h6>
                    <small class="text-muted">Cantidad: ${cantidadUnidades} x $${precioUnitario.toFixed(2)}</small>
                </div>
                <span class="text-muted font-weight-bold">$${subtotalProducto.toFixed(2)}</span>
            </div>
        `;
        if (listaResumen) {
            listaResumen.insertAdjacentHTML("beforeend", itemHTML);
        }
    });

    // Actualizar los números del resumen en pantalla
    if (badgeCantidad) badgeCantidad.textContent = cantidadProductos;
    if (subtotalCheckout) subtotalCheckout.textContent = `$${totalAcumulado.toFixed(2)}`;
    if (totalCheckout) totalCheckout.textContent = `$${totalAcumulado.toFixed(2)}`;

    //  Procesar el envío del Formulario hacia la API en Go
    if (formCheckout) {
        formCheckout.addEventListener("submit", async (e) => {
            e.preventDefault(); 

            const btnFinalizar = document.getElementById("btnFinalizar");
            if (btnFinalizar) {
                btnFinalizar.disabled = true;
                btnFinalizar.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i>Procesando pedido...`;
            }

            // Recolectar datos del formulario de envío
            const telefono = document.getElementById("telefono").value.trim();
            const direccion = document.getElementById("direccion").value.trim();
            const ciudad = document.getElementById("ciudad").value.trim();
            const estado_republica = document.getElementById("estado_republica").value;
            const codigo_postal = document.getElementById("codigo_postal").value.trim();

            const detalles = carrito.map(producto => ({
                id_producto: producto.id || producto.id_producto, 
                cantidad: parseInt(producto.cantidad) || 1,
                precio_unitario: parseFloat(producto.precio) || 0
            }));

            const datosPedido = {
                total: parseFloat(totalAcumulado),
                direccion: direccion,
                ciudad: ciudad,
                estado_republica: estado_republica,
                codigo_postal: codigo_postal,
                telefono: telefono,
                detalles: detalles
            };

            try {
                const respuesta = await fetch("https://api-mommiel-1.onrender.com/api/pedidos", { 
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(datosPedido)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok && resultado.status === "success") {
                    alert(resultado.message || "¡Tu pedido ha sido registrado con éxito!");
                    localStorage.removeItem("carrito");
                    window.location.href = "perfil.html"; 
                } else {
                    alert(`Error al procesar la orden: ${resultado.message}`);
                    if (btnFinalizar) {
                        btnFinalizar.disabled = false;
                        btnFinalizar.innerHTML = `<i class="fa-solid fa-bag-shopping me-2"></i>Confirmar y Pagar Pedido`;
                    }
                }

            } catch (error) {
                console.error("Error de conexión:", error);
                alert("Hubo un problema de conexión con el servidor de MomMiel. Por favor intenta más tarde.");
                if (btnFinalizar) {
                    btnFinalizar.disabled = false;
                    btnFinalizar.innerHTML = `<i class="fa-solid fa-bag-shopping me-2"></i>Confirmar y Pagar Pedido`;
                }
            }
        });
    }
});