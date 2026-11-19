const matrizTratamientos = [
    ["SRV01", "Cuidado Facial", 50.00, 15],
    ["SRV02", "Masaje Relajante", 70.00, 15],
    ["SRV03", "Aromaterapia", 45.00, 20],
    ["PRD01", "Crema Hidratante (100 ml)", 35.00, 12],
    ["PRD02", "Aceite Esencial (30 ml)", 28.00, 18],
    ["PRD03", "Mascarilla Facial (80 g)", 30.00, 14],
    ["PRM01", "Paquete Relax Total", 90.00, 10],
    ["PRM02", "Dúo Facial Brillante", 110.00, 8],
    ["PRM03", "Escapada Anti-estrés", 130.00, 8]
];

document.addEventListener("DOMContentLoaded", () => {
    const inputFechaReserva = document.getElementById("fecha");
if (inputFechaReserva) {
    inputFechaReserva.addEventListener("change", validarHorarioPorFecha);
}
    generarReporteCatalogo();
    cargarSelectorTratamientos();
    cargarSelectorReservaCompleto();
    cargarResumenEnReserva();
});

function cancelarCotizacionPrevia() {
    localStorage.removeItem("cotizacionBellezaSerena");

    const selectServicio = document.getElementById("servicio");
    const labelServicio = document.getElementById("label-servicio-reserva");

    if (labelServicio) {
        labelServicio.textContent = "Selecciona un servicio o producto:";
    }

    cargarSelectorReservaCompleto();

    if (selectServicio) {
        selectServicio.selectedIndex = 0;
    }

    cargarResumenEnReserva();
}

function cargarSelectorReservaCompleto() {
    const selectServicio = document.getElementById("servicio");
    if (!selectServicio) return;

    if (typeof matrizTratamientos === "undefined" || !Array.isArray(matrizTratamientos) || matrizTratamientos.length === 0) {
        return;
    }

    const valorActual = selectServicio.value;
    selectServicio.innerHTML = `<option value="">Selecciona una opción</option>`;

    for (let i = 0; i < matrizTratamientos.length; i++) {
        const item = matrizTratamientos[i];
        const codigo = String(item[0]);
        const nombre = String(item[1]);
        const precio = Number(item[2]);

        const opcion = document.createElement("option");
        opcion.value = `${codigo} - ${nombre}`;
        opcion.textContent = `${nombre} (${codigo}) — S/ ${precio.toFixed(2)}`;
        selectServicio.appendChild(opcion);
    }

    if (valorActual) {
        selectServicio.value = valorActual;
    }
}
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
                <td>${agotado ? '<span class="badge-agotado">Agotado</span>' : stock + (String(codigo).startsWith("PRD") ? " unidades" : " sesiones")}</td>
                <td>
                    <button type="button" class="btn-fila-seleccionar" onclick="seleccionarDesdeTabla('${codigo}')" ${agotado ? "disabled" : ""}>
                        ${agotado ? "Sin cupo" : "Elegir"}
                    </button>
                </td>
            </tr>`;
    }

    htmlTabla += `</tbody></table>`;
    contenedorReporte.innerHTML = htmlTabla;
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

    document.querySelectorAll("#tabla-catalogo tbody tr").forEach((fila) => {
        fila.style.outline = "";
    });

    const filaElegida = document.querySelector(`#tabla-catalogo tbody tr[data-codigo="${codigo}"]`);
    if (filaElegida) {
        filaElegida.style.outline = "2px solid #9e6b7b";
    }

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
        const unidadTexto = String(tratamiento[0]).startsWith("PRD") ? "unidades" : "sesiones";
        if (textoStock) textoStock.textContent = `Máximo disponible: ${stock} ${unidadTexto} (15% dto. desde 3 ${unidadTexto})`;

        const etiquetaCantidad = document.getElementById("etiqueta-cantidad");
        if (etiquetaCantidad) {
            etiquetaCantidad.textContent = String(tratamiento[0]).startsWith("PRD") ? "Unidades:" : "N.º de sesiones:";
        }
    }

    const etiquetaItem = document.getElementById("etiqueta-item");
    if (etiquetaItem) {
        const codigoActual = String(tratamiento[0]);
        if (codigoActual.startsWith("PRD")) {
            etiquetaItem.textContent = "Producto:";
        } else if (codigoActual.startsWith("PRM")) {
            etiquetaItem.textContent = "Promoción:";
        } else {
            etiquetaItem.textContent = "Servicio:";
        }
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
        mostrarAvisoValidacion("Seleccione una opción válida del catálogo.");
        return;
    }

    const tratamiento = matrizTratamientos[indice];
    const codigoItem = String(tratamiento[0]);
    const esProducto = codigoItem.startsWith("PRD");
    const unidadDesc = esProducto ? "unidades" : "sesiones";
    const labelCantidad = esProducto ? "Unidades solicitadas" : "Sesiones reservadas";
    const labelTarifa = esProducto ? "Tarifa unitaria" : "Tarifa oficial por sesión";
    const labelItem = esProducto ? "Producto" : (codigoItem.startsWith("PRM") ? "Promoción" : "Tratamiento");

    const stockActual = tratamiento[3];
    const cantidad = parseInt(inputCantidad.value, 10);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
        mostrarAvisoValidacion("Ingrese un número entero válido mayor o igual a 1.");
        return;
    }

    if (cantidad > stockActual) {
        mostrarAvisoValidacion(`Stock insuficiente. Solo quedan ${stockActual} ${unidadDesc} disponibles.`);
        return;
    }

    ocultarAvisoValidacion();

    const precioUnitario = tratamiento[2];
    const subtotal = precioUnitario * cantidad;
    const porcentajeDescuento = cantidad >= 3 ? 0.15 : 0.05;
    const etiquetaDescuento = cantidad >= 3
        ? `15% Paquete Bienestar (3+ ${unidadDesc})`
        : "5% Reserva Web";
    const descuento = subtotal * porcentajeDescuento;
    const totalPagar = subtotal - descuento;

    matrizTratamientos[indice][3] -= cantidad;

    generarReporteCatalogo();
    cargarSelectorTratamientos();
    guardarResumenParaReserva(tratamiento[0], tratamiento[1], cantidad, totalPagar);

    divResultado.setAttribute("data-ultima-cotizacion", tratamiento[0]);
    divResultado.innerHTML =
        `
        <div class="tarjeta-comprobante-cotizacion">
            <h4>Detalle de Cotización — Belleza Serena</h4>
            <p><strong>${labelItem}:</strong> ${tratamiento[1]} (${tratamiento[0]})</p>
            <p><strong>${labelTarifa}:</strong> S/ ${precioUnitario.toFixed(2)}</p>
            <p><strong>${labelCantidad}:</strong> ${cantidad}</p>
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
        const labelServicio = document.getElementById("label-servicio-reserva");
if (labelServicio) labelServicio.textContent = "Selecciona un servicio o producto:";
        return;
    }

    const datos = JSON.parse(guardado);
    const codigoItem = String(datos.codigo || "");
    const esProducto = codigoItem.startsWith("PRD");
    const esPromocion = codigoItem.startsWith("PRM");

    const etiquetaItem = esProducto ? "Producto" : (esPromocion ? "Promoción" : "Tratamiento");
    const etiquetaCantidad = esProducto ? "Unidades cotizadas" : "Sesiones cotizadas";

    cajaResumen.innerHTML = `
        <div class="tarjeta-comprobante-cotizacion">
            <h4>Cotización Previa Seleccionada</h4>
            <p><strong>${etiquetaItem}:</strong> ${datos.nombre} (${datos.codigo})</p>
            <p><strong>${etiquetaCantidad}:</strong> ${datos.cantidad}</p>
            <p class="total-cotizacion"><strong>Total Estimado: S/ ${datos.totalPagar}</strong></p>
            <button type="button" class="boton-limpiar" onclick="cancelarCotizacionPrevia()">
                ${esProducto ? "Cancelar pedido previo" : "Cancelar cotización previa"}
            </button>
        </div>
    `;

    const selectServicio = document.getElementById("servicio");
    const labelServicio = document.getElementById("label-servicio-reserva");

    if (labelServicio) {
        if (esProducto) {
            labelServicio.textContent = "Producto cotizado / seleccionado:";
        } else if (esPromocion) {
            labelServicio.textContent = "Promoción / servicio seleccionado:";
        } else {
            labelServicio.textContent = "Selecciona un servicio:";
        }
    }

    if (selectServicio) {
        const valorItem = `${datos.codigo} - ${datos.nombre}`;
        let existeOpcion = false;

        for (let i = 0; i < selectServicio.options.length; i++) {
            if (selectServicio.options[i].value === valorItem || selectServicio.options[i].text === valorItem) {
                existeOpcion = true;
                break;
            }
        }

        if (!existeOpcion && datos.nombre) {
            const nuevaOpcion = document.createElement("option");
            nuevaOpcion.value = valorItem;
            nuevaOpcion.textContent = valorItem;
            selectServicio.appendChild(nuevaOpcion);
        }

        const textoCotizado = datos.nombre.toLowerCase();
        for (let i = 0; i < selectServicio.options.length; i++) {
            const opcionTexto = selectServicio.options[i].text.toLowerCase();
            const opcionValor = selectServicio.options[i].value.toLowerCase();
            if (
                opcionValor === valorItem.toLowerCase() ||
                (textoCotizado.includes("masaje") && selectServicio.options[i].value === "masaje") ||
                (textoCotizado.includes("facial") && !esProducto && selectServicio.options[i].value === "facial") ||
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

function validarHorarioPorFecha() {
    const inputFecha = document.getElementById("fecha");
    const selectHora = document.getElementById("hora");
    const avisoFecha = document.getElementById("aviso-fecha-reserva");
    if (!inputFecha || !selectHora) return;

    if (avisoFecha) {
        avisoFecha.style.display = "none";
        avisoFecha.textContent = "";
    }

    // Habilitar todas las horas primero
    for (let i = 0; i < selectHora.options.length; i++) {
        selectHora.options[i].disabled = false;
    }

    if (!inputFecha.value) return;

    const [anio, mes, dia] = inputFecha.value.split("-").map(Number);
    const fechaObj = new Date(anio, mes - 1, dia);
    const diaSemana = fechaObj.getDay(); // 0 = Domingo, 6 = Sábado

    if (diaSemana === 0) {
        inputFecha.value = "";
        selectHora.value = "";
        if (avisoFecha) {
            avisoFecha.textContent = "Los domingos el local está cerrado. Por favor selecciona un día de lunes a sábado.";
            avisoFecha.style.display = "block";
        }
        return;
    }

    if (diaSemana === 6) {
        for (let i = 0; i < selectHora.options.length; i++) {
            const valHora = selectHora.options[i].value;
            if (valHora && valHora > "17:00") {
                selectHora.options[i].disabled = true;
            }
        }
        if (selectHora.value > "17:00") {
            selectHora.value = "";
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
    const diaSemana = fechaElegida.getDay();
    if (diaSemana === 0) {
        mostrarAlertaReserva(errorBox, "Los domingos permanecemos cerrados. Selecciona una fecha de lunes a sábado.");
        return;
    }
    if (diaSemana === 6 && hora > "17:00") {
        mostrarAlertaReserva(errorBox, "Los sábados atendemos únicamente hasta las 5:00 p.m.");
        return;
    }

    if (exitoBox) {
        const etiquetaConfirmacion = servicioValor.startsWith("PRD")
            ? "Producto"
            : (servicioValor.startsWith("PRM") ? "Promoción" : "Servicio");
        exitoBox.innerHTML = `
            <h4>Solicitud de Reserva Registrada — Belleza Serena</h4>
            <p><strong>Cliente:</strong> ${nombre} ${apellido}</p>
            <p><strong>${etiquetaConfirmacion}:</strong> ${servicioTexto}</p>
            <p><strong>Fecha y Hora:</strong> ${fecha} a las ${hora}</p>
            <p><strong>Contacto preferido:</strong> ${metodoContacto} (${correo} / ${telefono})</p>
            ${comentario ? `<p><strong>Comentario:</strong> ${comentario}</p>` : ""}
        `;
        exitoBox.style.display = "block";
        exitoBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        localStorage.removeItem("cotizacionBellezaSerena");
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
    const tipoSelect = document.getElementById("tipo");
    const tipoTexto = tipoSelect && tipoSelect.value.toLowerCase().includes("queja")
        ? "Queja"
        : "Reclamo";

    if (exitoBox) {
        exitoBox.innerHTML = `
            <h4>Constancia de ${tipoTexto} Recibida — Belleza Serena</h4>
            <p><strong>Código de registro:</strong> ${codigoReclamo}</p>
            <p><strong>Consumidor:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Tipo:</strong> ${tipoTexto}</p>
            <p>Su ${tipoTexto.toLowerCase()} ha sido recibido y registrado correctamente. Nuestro equipo revisará su caso y se pondrá en contacto a la brevedad.</p>
        `;
        exitoBox.style.display = "block";
        exitoBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    form.reset();
}