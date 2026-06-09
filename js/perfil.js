document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token_mommiel");
    const nombreActual = localStorage.getItem("user_nombre") || "";
    
    const contenedor = document.getElementById("contenedorPedidos");
    const formActualizar = document.getElementById("formActualizarPerfil");
    const inputNombre = document.getElementById("updateNombre");

    // Si no hay token, fuera
    if (!token) {
        alert("Por favor, inicia sesión para ver tu perfil.");
        window.location.href = "login.html";
        return;
    }

    // Colocar el nombre actual del LocalStorage dentro del input
    if (inputNombre) {
        inputNombre.value = nombreActual;
    }

  
    // CARGAR PEDIDOS HISTÓRICOS
   
    try {
        const respuesta = await fetch("https://api-mommiel-1.onrender.com/api/pedidos", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const resultado = await respuesta.json();

        if (respuesta.ok && resultado.status === "success") {
            const pedidos = resultado.data || [];

            console.log(" Estructura de pedidos recibida:", pedidos);

            if (pedidos.length === 0) {
                contenedor.innerHTML = `
                    <div style="text-align: center; padding: 30px; color: #888;">
                        <i class="fa-solid fa-bag-shopping fa-3x" style="margin-bottom: 15px; color: #ddd;"></i>
                        <p>Aún no has realizado ninguna compra. ¡Tu próximo paquete te espera!</p>
                    </div>`;
            } else {
                contenedor.innerHTML = ""; // Limpiamos cargador
                
                pedidos.forEach(pedido => {
                    // Control de colores dinámicos para los estados de los pedidos
                    let badgeColor = "#f0ad4e"; // Naranja para 'procesado'
                    if (pedido.estado === "en camino") badgeColor = "#0275d8"; // Azul
                    if (pedido.estado === "entregado") badgeColor = "#5cb85c"; // Verde
                    if (pedido.estado === "cancelado") badgeColor = "#d9534f"; // Rojo

                    // Convertir la columna 'fecha' a formato legible
                    const fecha = pedido.fecha ? new Date(pedido.fecha).toLocaleDateString() : 'Reciente';

                    // Generamos la tarjeta del pedido omitiendo dirección y teléfono
                    const pedidoHTML = `
                        <div style="border: 1px solid #eee; border-radius: 10px; padding: 20px; margin-bottom: 20px; background: #fafafa;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #5c4b47; font-size: 1.05rem;">Pedido #${pedido.id}</strong>
                                    <span style="font-size: 0.85rem; color: #999; margin-left: 15px;">Fecha: ${fecha}</span>
                                </div>
                                <span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">
                                    ${pedido.estado || 'procesando'}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 15px; border-top: 1px solid #eee;">
                                <span style="color: #888; font-size: 0.85rem;">Método: Contra entrega / Transferencia</span>
                                <strong style="color: #C8A98D; font-size: 1.2rem;">Total: $${parseFloat(pedido.total).toFixed(2)}</strong>
                            </div>
                        </div>`;
                    contenedor.insertAdjacentHTML("beforeend", pedidoHTML);
                });
            }
        } else {
            contenedor.innerHTML = `<p style="color: red; text-align: center;">Error al cargar el historial: ${resultado.message}</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `<p style="color: red; text-align: center;">Hubo un problema de conexión para obtener tus pedidos.</p>`;
    }

  
    // ACTUALIZAR NOMBRE Y CONTRASEÑA

    formActualizar.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevoNombre = inputNombre.value.trim();
        const nuevaContrasena = document.getElementById("updatePassword").value;
        const confirmarContrasena = document.getElementById("updatePasswordConfirm").value;

        if (nuevaContrasena || confirmarContrasena) {
            if (nuevaContrasena !== confirmarContrasena) {
                alert("✘Las nuevas contraseñas no coinciden. Verifica de nuevo.");
                return;
            }
            if (nuevaContrasena.length < 6) {
                alert("✘La contraseña nueva debe tener al menos 6 caracteres.");
                return;
            }
        }

        const btnGuardar = document.getElementById("btnGuardarDatos");
        btnGuardar.disabled = true;
        btnGuardar.innerText = "Guardando cambios...";

        const datosActualizar = {
            nombre: nuevoNombre,
            contrasena: nuevaContrasena ? nuevaContrasena : "" 
        };

        try {
            const respuestaUpdate = await fetch("https://api-mommiel-1.onrender.com/api/usuarios/perfil", {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizar)
            });

            const resData = await respuestaUpdate.json();

            if (respuestaUpdate.ok && resData.status === "success") {
                alert("✿ ¡Tus datos han sido actualizados con éxito!");
                localStorage.setItem("user_nombre", nuevoNombre);
                document.getElementById("updatePassword").value = "";
                document.getElementById("updatePasswordConfirm").value = "";
            } else {
                alert(`Error al actualizar datos: ${resData.message}`);
            }
        } catch (error) {
            console.error("Error de actualización:", error);
            alert("No se pudo conectar al servidor de MomMiel para actualizar tu perfil.");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar Cambios";
        }
    });
});