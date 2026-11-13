/* ==========================================================================
   BLOQUE 1: GESTIÓN DE CATÁLOGO Y COTIZADOR CON ARREGLOS Y OPERADORES
   ========================================================================== */

// 1. Arreglo Bidimensional con productos/tratamientos de Belleza Serena
// Formato: [Código, Nombre del Tratamiento, Precio en Soles (S/), Stock/Disponibilidad]
const matrizTratamientos = [
    ["PROD01", "Masaje Relajante con Piedras Calientes", 80.0, 15],
    ["PROD02", "Limpieza Facial Profunda con Hidratación", 95.0, 10],
    ["PROD03", "Aromaterapia y Terapia de Velas", 70.0, 20],
    ["PROD04", "Exfoliación Corporal Completa", 110.0, 8]
];

// 2. Función para mostrar el reporte del catálogo en la página usando el DOM y bucles
function generarReporteCatalogo() {
    let contenedorReporte = document.getElementById("seccion-reporte-js");
    if (!contenedorReporte) return;

    let htmlTabla = `
        <h3 style="color: #6b4c4c; text-align: center; margin-top: 20px;">Catálogo y Stock - Sistema Belleza Serena</h3>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-family: Arial, sans-serif;">
            <tr style="background-color: #f3e6e6; color: #5a3e3e; text-align: left;">
                <th style="padding: 8px;">Código</th>
                <th style="padding: 8px;">Tratamiento</th>
                <th style="padding: 8px;">Precio (S/)</th>
                <th style="padding: 8px;">Disponibilidad</th>
            </tr>`;

    // Uso de bucle for exigido por la rúbrica para recorrer arreglos bidimensionales
    for (let i = 0; i < matrizTratamientos.length; i++) {
        htmlTabla += `<tr>
            <td style="padding: 8px;">${matrizTratamientos[i][0]}</td>
            <td style="padding: 8px;">${matrizTratamientos[i][1]}</td>
            <td style="padding: 8px;">S/ ${matrizTratamientos[i][2].toFixed(2)}</td>
            <td style="padding: 8px;">${matrizTratamientos[i][3]} sesiones</td>
        </tr>`;
    }

    htmlTabla += `</table>`;
    contenedorReporte.innerHTML = htmlTabla;
}

// 3. Cotizador rápido aplicando operadores aritméticos y condicionales (If / Else)
function calcularCotizacionRapida() {
    let codigoIngresado = prompt("Ingrese el código del tratamiento (Ej: PROD01, PROD02, PROD03, PROD04):");
    if (!codigoIngresado) return;

    let tratamientoEncontrado = null;

    // Búsqueda con estructura repetitiva
    for (let i = 0; i < matrizTratamientos.length; i++) {
        if (matrizTratamientos[i][0].toUpperCase() === codigoIngresado.toUpperCase()) {
            tratamientoEncontrado = matrizTratamientos[i];
            break;
        }
    }

    if (tratamientoEncontrado) {
        let cantidadStr = prompt("Ha seleccionado: " + tratamientoEncontrado[1] + "\nPrecio unitario: S/ " + tratamientoEncontrado[2] + "\n¿Cuántas sesiones desea adquirir?");
        let cantidad = parseInt(cantidadStr);

        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Por favor, ingrese una cantidad válida mayor a 0.");
            return;
        }

        // Operaciones aritméticas y cálculo de subtotal / descuento
        let subtotal = tratamientoEncontrado[2] * cantidad;
        let descuento = 0;

        // Estructura condicional anidada para aplicar un beneficio por volumen
        if (cantidad >= 3) {
            descuento = subtotal * 0.15; // 15% de descuento por 3 o más sesiones
            alert("¡Aplicado 15% de descuento por paquete de 3 o más sesiones!");
        } else {
            descuento = subtotal * 0.05; // 5% de descuento base
            alert("¡Aplicado 5% de descuento especial por tu reserva!");
        }

        let totalPagar = subtotal - descuento;

        // Mostrar resultados en pantalla usando el DOM
        let divResultado = document.getElementById("resultado-cotizacion");
        if (divResultado) {
            divResultado.innerHTML = `
                <div style="background: #faf2f2; border: 1px solid #d4b5b5; padding: 15px; border-radius: 5px; margin-top: 15px;">
                    <h4 style="color: #5a3e3e; margin: 0 0 10px 0;">Resumen de Cotización - Belleza Serena</h4>
                    <p><strong>Servicio:</strong> ${tratamientoEncontrado[1]}</p>
                    <p><strong>Cantidad:</strong> ${cantidad} sesiones</p>
                    <p><strong>Subtotal:</strong> S/ ${subtotal.toFixed(2)}</p>
                    <p><strong>Descuento aplicado:</strong> - S/ ${descuento.toFixed(2)}</p>
                    <p style="color: #8c2d2d; font-size: 1.1em;"><strong>Total a Pagar: S/ ${totalPagar.toFixed(2)}</strong></p>
                </div>
            `;
        }
    } else {
        alert("El código ingresado no existe en el catálogo de Belleza Serena.");
    }
}