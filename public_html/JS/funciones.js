const matrizTratamientos = [
    ["PROD01", "Masaje Relajante con Piedras Calientes", 80.00, 15],
    ["PROD02", "Limpieza Facial Profunda con Hidratación", 95.00, 10],
    ["PROD03", "Aromaterapia y Terapia de Velas", 70.00, 20],
    ["PROD04", "Exfoliación Corporal Completa", 110.00, 8]
];

document.addEventListener("DOMContentLoaded", () => {
    generarReporteCatalogo();
    cargarSelectorTratamientos();
    cargarResumenEnReserva();
});

function generarReporteCatalogo(lista = matrizTratamientos, titulo = "Tarifario y Disponibilidad Oficial") {
    const contenedorReporte = document.getElementById("seccion-reporte-js");
    if (!contenedorReporte) return;

    let htmlTabla = `
        <h3 class="titulo-tabla-dinamica">${titulo}</h3>
        <table id="tabla-catalogo" class="tabla-spa-profesional">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Tratamiento</th>
                    <th>Tarifa Oficial</th>
                    <th>Cupos Disponibles</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < lista.length; i++) {
        const codigo = lista[i][0];
        const nombre = lista[i][1];
        const precio = lista[i][2];
        const stock = lista[i][3];
        const agotado = stock <= 0;

        htmlTabla += `
            <tr data-codigo="${codigo}">
                <td>${codigo}</td>
                <td>${nombre}</td>
                <td>S/ ${precio.toFixed(2)}</td>
                <td>${agotado ? '<span class="badge-agotado">Agotado</span>' : stock + " sesiones"}</td>
                <td>
                    <button type="button" class="btn-fila-seleccionar" onclick="seleccionarDesdeTabla('${codigo}')" ${agotado ? "disabled" : ""}>
                        ${agotado ? "Sin cupo" : "Elegir"}
                    </button>
                </td>
            </tr>`;
    }

    htmlTabla += `</tbody></table>`;
    contenedorReporte.innerHTML = htmlTabla;
    resaltarFilaEconomica();
}

function cargarSelectorTratamientos() {
    const selector = document.getElementById("select-tratamiento");
    if (!selector) return;

    const valorPrevio = selector.value;
    selector.innerHTML = "";

    for (let i = 0; i < matrizTratamientos.length; i++) {
        const opcion = document.createElement("option");
        opcion.value = matrizTratamientos[i][0];
        const stock = matrizTratamientos[i][3];
        opcion.textContent = stock > 0
            ? `${matrizTratamientos[i][1]} — S/ ${matrizTratamientos[i][2].toFixed(2)}`
            : `${matrizTratamientos[i][1]} (Agotado)`;
        opcion.disabled = stock <= 0;
        selector.appendChild(opcion);
    }

    if (valorPrevio) {
        selector.value = valorPrevio;
    }

    if (!selector.value || selector.options[selector.selectedIndex]?.disabled) {
        for (let i = 0; i < selector.options.length; i++) {
            if (!selector.options[i].disabled) {
                selector.selectedIndex = i;
                break;
            }
        }
    }

    actualizarDatosSeleccion();
}

function buscarIndicePorCodigo(codigo) {
    for (let i = 0; i < matrizTratamientos.length; i++) {
        if (matrizTratamientos[i][0] === codigo) {
            return i;
        }
    }
    return -1;
}

function seleccionarDesdeTabla(codigo) {
    const selector = document.getElementById("select-tratamiento");
    if (!selector) return;
    selector.value = codigo;
    actualizarDatosSeleccion();
    selector.scrollIntoView({ behavior: "smooth", block: "center" });
}

function actualizarDatosSeleccion() {
    const selector = document.getElementById("select-tratamiento");
    const inputPrecio = document.getElementById("precio-unitario-vista");
    const inputCantidad = document.getElementById("cantidad-sesiones");
    const textoStock = document.getElementById("texto-stock-disponible");
    const btnConfirmar = document.getElementById("btn-confirmar-cotizacion");

    if (!selector || !inputPrecio || !inputCantidad) return;

    const indice = buscarIndicePorCodigo(selector.value);
    if (indice === -1) return;

    const tratamiento = matrizTratamientos[indice];
    const stock = tratamiento[3];

    inputPrecio.value = `S/ ${tratamiento[2].toFixed(2)}`;
    inputCantidad.setAttribute("max", stock);

    if (stock <= 0) {
        inputCantidad.value = 0;
        inputCantidad.disabled = true;
        if (btnConfirmar) btnConfirmar.disabled = true;
        if (textoStock) textoStock.textContent = "Sin sesiones disponibles actualmente.";
    } else {
        inputCantidad.disabled = false;
        if (btnConfirmar) btnConfirmar.disabled = false;
        const cantActual = parseInt(inputCantidad.value, 10);
        if (isNaN(cantActual) || cantActual > stock || cantActual < 1) {
            inputCantidad.value = 1;
        }
        if (textoStock) textoStock.textContent = `Máximo disponible: ${stock} sesiones (15% dto. desde 3 sesiones)`;
    }

    ocultarAvisoValidacion();
}

function actualizarVistaPrevia() {
    const selector = document.getElementById("select-tratamiento");
    const inputCantidad = document.getElementById("cantidad-sesiones");
    if (!selector || !inputCantidad) return;

    const indice = buscarIndicePorCodigo(selector.value);
    if (indice === -1) return;

    const stock = matrizTratamientos[indice][3];
    const cantidad = parseInt(inputCantidad.value, 10);

    if (isNaN(cantidad) || cantidad < 1) {
        mostrarAvisoValidacion("La cantidad mínima permitida es 1 sesión.");
    } else if (cantidad > stock) {
        mostrarAvisoValidacion(`Solo contamos con ${stock} sesiones disponibles para este tratamiento.`);
    } else {
        ocultarAvisoValidacion();
    }
}

function mostrarAvisoValidacion(mensaje) {
    const aviso = document.getElementById("aviso-validacion-cotizador");
    if (!aviso) return;
    aviso.textContent = mensaje;
    aviso.style.display = "block";
}

function ocultarAvisoValidacion() {
    const aviso = document.getElementById("aviso-validacion-cotizador");
    if (!aviso) return;
    aviso.textContent = "";
    aviso.style.display = "none";
}

function procesarCotizacionFormulario(evento) {
    evento.preventDefault();

    const selector = document.getElementById("select-tratamiento");
    const inputCantidad = document.getElementById("cantidad-sesiones");
    const divResultado = document.getElementById("resultado-cotizacion");
    if (!selector || !inputCantidad || !divResultado) return;

    const indice = buscarIndicePorCodigo(selector.value);
    if (indice === -1) {
        mostrarAvisoValidacion("Seleccione un tratamiento válido del catálogo.");
        return;
    }

    const tratamiento = matrizTratamientos[indice];
    const stockActual = tratamiento[3];
    const cantidad = parseInt(inputCantidad.value, 10);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
        mostrarAvisoValidacion("Ingrese un número entero válido mayor o igual a 1.");
        return;
    }

    if (cantidad > stockActual) {
        mostrarAvisoValidacion(`Stock insuficiente. Solo quedan ${stockActual} sesiones disponibles.`);
        return;
    }

    ocultarAvisoValidacion();

    const precioUnitario = tratamiento[2];
    const subtotal = precioUnitario * cantidad;
    const porcentajeDescuento = cantidad >= 3 ? 0.15 : 0.05;
    const etiquetaDescuento = cantidad >= 3 ? "15% Paquete Bienestar (3+ sesiones)" : "5% Reserva Web";
    const descuento = subtotal * porcentajeDescuento;
    const totalPagar = subtotal - descuento;

    matrizTratamientos[indice][3] -= cantidad;

    generarReporteCatalogo();
    cargarSelectorTratamientos();
    guardarResumenParaReserva(tratamiento[0], tratamiento[1], cantidad, totalPagar);

    divResultado.setAttribute("data-ultima-cotizacion", tratamiento[0]);
    divResultado.innerHTML = `
        <div class="tarjeta-comprobante-cotizacion">
            <h4>Detalle de Cotización — Belleza Serena</h4>
            <p><strong>Tratamiento:</strong> ${tratamiento[1]} (${tratamiento[0]})</p>
            <p><strong>Tarifa oficial por sesión:</strong> S/ ${precioUnitario.toFixed(2)}</p>
            <p><strong>Sesiones reservadas:</strong> ${cantidad}</p>
            <p><strong>Subtotal:</strong> S/ ${subtotal.toFixed(2)}</p>
            <p><strong>Beneficio aplicado (${etiquetaDescuento}):</strong> - S/ ${descuento.toFixed(2)}</p>
            <p class="total-cotizacion"><strong>Total a Pagar: S/ ${totalPagar.toFixed(2)}</strong></p>
            <a href="reservas.html" class="boton-secundario">Continuar a Reserva</a>
        </div>
    `;
}

function ordenarCatalogoPorPrecio(ascendente = true) {
    const copiaOrdenada = matrizTratamientos.slice();
    const n = copiaOrdenada.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
            const condicion = ascendente
                ? copiaOrdenada[j][2] > copiaOrdenada[j + 1][2]
                : copiaOrdenada[j][2] < copiaOrdenada[j + 1][2];

            if (condicion) {
                const temp = copiaOrdenada[j];
                copiaOrdenada[j] = copiaOrdenada[j + 1];
                copiaOrdenada[j + 1] = temp;
            }
        }
    }

    const textoOrden = ascendente ? "Menor a Mayor Tarifa" : "Mayor a Menor Tarifa";
    generarReporteCatalogo(copiaOrdenada, `Tarifario Ordenado (${textoOrden})`);
}

function resaltarFilaEconomica() {
    const tabla = document.getElementById("tabla-catalogo");
    if (!tabla || !tabla.lastElementChild) return;

    const filas = tabla.lastElementChild.children;
    if (!filas.length) return;

    let filaMenor = filas[0];

    for (let i = 1; i < filas.length; i++) {
        const precioActual = parseFloat(filas[i].children[2].textContent.replace("S/", "").trim());
        const precioMenor = parseFloat(filaMenor.children[2].textContent.replace("S/", "").trim());
        if (precioActual < precioMenor) {
            filaMenor = filas[i];
        }
    }

    if (filaMenor) {
        filaMenor.setAttribute("data-destacado", "true");
        filaMenor.style.backgroundColor = "#fdf8e8";
        if (filaMenor.nextElementSibling) {
            filaMenor.nextElementSibling.style.borderTop = "2px solid #d4b5b5";
        }
    }
}

function toggleMenuResponsive() {
    const menu = document.querySelector(".menu");
    const boton = document.querySelector(".boton-menu-hamburguesa");
    if (!menu) return;

    const estaAbierto = menu.classList.toggle("responsive");

    if (boton) {
        boton.setAttribute("aria-expanded", estaAbierto ? "true" : "false");
        boton.textContent = estaAbierto ? "✕ Cerrar" : "☰ Menú";
    }
}

function alternarPantallaCompleta() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function mostrarMensaje() {
    alert("¡Bienvenido a Belleza Serena! Te estamos redirigiendo a reservas.");
}

function guardarResumenParaReserva(codigo, nombre, cantidad, totalPagar) {
    const resumen = {
        codigo,
        nombre,
        cantidad,
        totalPagar: totalPagar.toFixed(2)
    };
    localStorage.setItem("cotizacionBellezaSerena", JSON.stringify(resumen));
}

function cargarResumenEnReserva() {
    const cajaResumen = document.getElementById("resumen-reserva-js");
    if (!cajaResumen) return;

    const guardado = localStorage.getItem("cotizacionBellezaSerena");
    if (!guardado) {
        cajaResumen.innerHTML = `
            <p class="subtitulo-cotizador">
                ¿Ya revisaste tarifas y descuentos? Puedes <a href="servicios.html">cotizar aquí</a> o completar tu solicitud directamente.
            </p>`;
        return;
    }

    const datos = JSON.parse(guardado);
    cajaResumen.innerHTML = `
        <div class="tarjeta-comprobante-cotizacion">
            <h4>Cotización Previa Seleccionada</h4>
            <p><strong>Tratamiento:</strong> ${datos.nombre} (${datos.codigo})</p>
            <p><strong>Sesiones cotizadas:</strong> ${datos.cantidad}</p>
            <p class="total-cotizacion"><strong>Total Estimado: S/ ${datos.totalPagar}</strong></p>
        </div>
    `;

    const selectServicio = document.getElementById("servicio");
    if (selectServicio) {
        const textoCotizado = datos.nombre.toLowerCase();
        for (let i = 0; i < selectServicio.options.length; i++) {
            const opcionTexto = selectServicio.options[i].text.toLowerCase();
            if (
                (textoCotizado.includes("masaje") && selectServicio.options[i].value === "masaje") ||
                (textoCotizado.includes("facial") && selectServicio.options[i].value === "facial") ||
                (textoCotizado.includes("aromaterapia") && selectServicio.options[i].value === "aromaterapia") ||
                (textoCotizado.includes("exfoliación") && selectServicio.options[i].value === "spa") ||
                opcionTexto.includes(textoCotizado)
            ) {
                selectServicio.selectedIndex = i;
                break;
            }
        }
    }
}

function confirmarReserva(evento) {
    evento.preventDefault();

    const form = evento.target;
    const errorBox = document.getElementById("mensaje-error-reserva");
    const exitoBox = document.getElementById("mensaje-exito-reserva");

    if (errorBox) errorBox.style.display = "none";
    if (exitoBox) exitoBox.style.display = "none";

    const nombre = (document.getElementById("nombre")?.value || "").trim();
    const apellido = (document.getElementById("apellido")?.value || "").trim();
    const correo = (document.getElementById("correo")?.value || "").trim();
    const telefono = (document.getElementById("telefono")?.value || "").trim();
    const servicioSelect = document.getElementById("servicio");
    const servicioValor = servicioSelect?.value || "";
    const servicioTexto = servicioSelect?.options[servicioSelect.selectedIndex]?.text.trim() || "";
    const fecha = document.getElementById("fecha")?.value || "";
    const hora = document.getElementById("hora")?.value || "";
    const metodoContacto = document.getElementById("metodo-contacto")?.value || "";
    const comentario = (document.getElementById("comentario")?.value || "").trim();

    if (nombre.length < 2 || apellido.length < 2) {
        mostrarAlertaReserva(errorBox, "Ingresa un nombre y apellido válidos (mínimo 2 caracteres cada uno).");
        return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!emailValido) {
        mostrarAlertaReserva(errorBox, "Ingresa un correo electrónico válido.");
        return;
    }

    const soloDigitosTel = telefono.replace(/\D/g, "");
    if (soloDigitosTel.length < 7) {
        mostrarAlertaReserva(errorBox, "Ingresa un número de teléfono válido de al menos 7 dígitos.");
        return;
    }

    if (!servicioValor || !fecha || !hora || !metodoContacto) {
        mostrarAlertaReserva(errorBox, "Completa el servicio, la fecha, la hora y el método de contacto.");
        return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const fechaElegida = new Date(anio, mes - 1, dia);

    if (fechaElegida < hoy) {
        mostrarAlertaReserva(errorBox, "La fecha de reserva no puede ser anterior a hoy.");
        return;
    }

    localStorage.removeItem("cotizacionBellezaSerena");

    if (exitoBox) {
        exitoBox.innerHTML = `
            <h4>Solicitud de Reserva Registrada — Belleza Serena</h4>
            <p><strong>Cliente:</strong> ${nombre} ${apellido}</p>
            <p><strong>Servicio:</strong> ${servicioTexto}</p>
            <p><strong>Fecha y Hora:</strong> ${fecha} a las ${hora}</p>
            <p><strong>Contacto preferido:</strong> ${metodoContacto} (${correo} / ${telefono})</p>
            ${comentario ? `<p><strong>Comentario:</strong> ${comentario}</p>` : ""}
        `;
        exitoBox.style.display = "block";
        exitoBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.reset();
}

function mostrarAlertaReserva(elemento, mensaje) {
    if (!elemento) return;
    elemento.textContent = mensaje;
    elemento.style.display = "block";
    elemento.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        const menu = document.querySelector(".menu");
        const boton = document.querySelector(".boton-menu-hamburguesa");
        if (menu) menu.classList.remove("responsive");
        if (boton) {
            boton.setAttribute("aria-expanded", "false");
            boton.textContent = "☰ Menú";
        }
    }
});

function mostrarMensajeFormulario(elemento, texto) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.style.display = "block";
    elemento.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function ocultarMensajeFormulario(elemento) {
    if (!elemento) return;
    elemento.textContent = "";
    elemento.style.display = "none";
}

function validarFormularioContacto(evento) {
    evento.preventDefault();
    const form = evento.target;

    const errorBox = document.getElementById("mensaje-error-contacto");
    const exitoBox = document.getElementById("mensaje-exito-contacto");
    ocultarMensajeFormulario(errorBox);
    ocultarMensajeFormulario(exitoBox);

    const nombre = (form.querySelector('input[name="nombre"], #nombre-contacto, #nombre')?.value || "").trim();
    const correo = (form.querySelector('input[type="email"], input[name="correo"], #correo-contacto, #correo')?.value || "").trim();
    const mensaje = (form.querySelector('textarea[name="mensaje"], textarea[name="comentario"], #mensaje-contacto, #mensaje')?.value || "").trim();

    if (nombre.length < 2) {
        mostrarMensajeFormulario(errorBox, "Por favor, ingresa tu nombre (mínimo 2 caracteres).");
        return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correoValido) {
        mostrarMensajeFormulario(errorBox, "Ingresa un correo electrónico válido.");
        return;
    }

    if (mensaje.length < 10) {
        mostrarMensajeFormulario(errorBox, "Escribe un mensaje un poco más detallado (mínimo 10 caracteres).");
        return;
    }

    if (exitoBox) {
        exitoBox.innerHTML = `
            <h4>Mensaje Enviado — Belleza Serena</h4>
            <p>Gracias, <strong>${nombre}</strong>. Recibimos tu consulta y te responderemos a <strong>${correo}</strong>.</p>
        `;
        exitoBox.style.display = "block";
        exitoBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.reset();
}

function validarFormularioReclamo(evento) {
    evento.preventDefault();
    const form = evento.target;

    const errorBox = document.getElementById("mensaje-error-reclamo");
    const exitoBox = document.getElementById("mensaje-exito-reclamo");
    ocultarMensajeFormulario(errorBox);
    ocultarMensajeFormulario(exitoBox);

    const nombre = (form.querySelector('input[name="nombre"], #nombre-reclamo, #nombre')?.value || "").trim();
    const correo = (form.querySelector('input[type="email"], input[name="correo"], #correo-reclamo, #correo')?.value || "").trim();
    const detalle = (form.querySelector('textarea[name="detalle"], textarea[name="descripcion"], textarea[name="mensaje"], #detalle-reclamo, #detalle')?.value || "").trim();

    if (nombre.length < 2) {
        mostrarMensajeFormulario(errorBox, "Ingresa el nombre de quien registra el reclamo.");
        return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correoValido) {
        mostrarMensajeFormulario(errorBox, "Ingresa un correo electrónico válido para el seguimiento.");
        return;
    }

    if (detalle.length < 15) {
        mostrarMensajeFormulario(errorBox, "Describe el motivo o detalle del reclamo (mínimo 15 caracteres).");
        return;
    }

    const codigoReclamo = "REC-" + Math.floor(1000 + Math.random() * 9000);

    if (exitoBox) {
        exitoBox.innerHTML = `
            <h4>Hoja de Reclamaciones Registrada — Belleza Serena</h4>
            <p><strong>Código de registro:</strong> ${codigoReclamo}</p>
            <p><strong>Usuario:</strong> ${nombre} (${correo})</p>
            <p>Tu solicitud ha quedado registrada para atención interna.</p>
        `;
        exitoBox.style.display = "block";
        exitoBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.reset();
}