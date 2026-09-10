function mostrarMensaje() {
    alert("Bienvenido a Belleza Serena");
}

function confirmarReserva(event) {
    event.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let servicio = document.getElementById("servicio").value;

    alert(
        "Gracias, " + nombre +
        ". Hemos recibido tu solicitud para el servicio de " +
        servicio + "."
    );
}

function mostrarContacto() {
    alert("Gracias por comunicarte con Belleza Serena.");
}