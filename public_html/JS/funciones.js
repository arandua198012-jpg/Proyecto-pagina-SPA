/* ==========================================================================
   FUNCIONES Y VALIDACIONES JAVASCRIPT - BELLEZA SERENA
   ========================================================================== */

function mostrarMensaje() {
    alert("Bienvenido a Belleza Serena. ¡Gracias por elegir nuestro spa!");
}

function confirmarReserva(event) {
    event.preventDefault();

    let formulario = event.target;

    if (!formulario.checkValidity()) {
        alert("Por favor, completa todos los campos obligatorios.");
        formulario.reportValidity();
        return;
    }

    let nombreElem = document.getElementById("nombre");
    let servicioElem = document.getElementById("servicio");
    let horaElem = document.getElementById("hora");

    let nombre = nombreElem ? nombreElem.value.trim() : "Cliente";
    let servicio = servicioElem ? servicioElem.value : "servicio";
    let hora = horaElem ? horaElem.value : "";

    // VALIDACIÓN OBLIGATORIA UTP: Horario de atención (09:00 a 19:00)
    if (hora !== "") {
        if (hora < "09:00" || hora > "19:00") {
            alert("Nuestro horario de atención es de 09:00 AM a 07:00 PM (19:00 hs). Por favor, selecciona una hora dentro de este rango.");
            return;
        }
    }

    // Mensaje de confirmación visual
    alert(
        "Gracias, " + nombre +
        ". Hemos recibido tu solicitud para el servicio de " +
        servicio + ". Nos comunicaremos contigo en breve para confirmar la cita."
    );

    formulario.reset();
}

// 3. Mensaje para el formulario de contacto
function mostrarContacto(event) {
    if (event) event.preventDefault();
    alert("Gracias por comunicarte con Belleza Serena. Te responderemos a la brevedad.");
}