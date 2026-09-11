function mostrarMensaje() {
    alert("Bienvenido a Belleza Serena");
}

function confirmarReserva(event) {
    event.preventDefault();

    let formulario = event.target;

    if (!formulario.checkValidity()) {
        alert("Por favor, completa todos los campos obligatorios.");
        formulario.reportValidity();
        return;
    }

    let nombre = document.getElementById("nombre").value;
    let servicio = document.getElementById("servicio").value;

    alert(
        "Gracias, " + nombre +
        ". Hemos recibido tu solicitud para el servicio de " +
        servicio + "."
    );

    formulario.reset();
}

function mostrarContacto() {
    alert("Gracias por comunicarte con Belleza Serena.");
}