import "dotenv/config";
import readline from "readline/promises";

const API = `http://localhost:${process.env.PORT || 3000}/api`;

// Helper: llama a tu API y lanza un error claro si algo falla.
const llamar = async (ruta, { metodo = "GET", token, cuerpo } = {}) => {
    const res = await fetch(`${API}${ruta}`, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const datos = await res.json();
    if (!res.ok) {
        throw new Error(`${metodo} ${ruta} -> ${res.status}: ${datos.error || datos.mensaje}`);
    }
    return datos;
};

const probar = async () => {
    try {
        // 1. Login
        console.log("\n1) Login...");
        const { usuario, token } = await llamar("/usuarios/login", {
            metodo: "POST",
            cuerpo: { correo: process.env.PRUEBA_CORREO, password: process.env.PRUEBA_PASSWORD }
        });
        console.log("   OK:", usuario.correo, `(${usuario.rol})`);

        // 2. Crear pedido de prueba (pendiente, $25)
        console.log("\n2) Creando pedido de prueba...");
        const pedido = await llamar("/pedidos", {
            metodo: "POST",
            token,
            cuerpo: {
                usuarioId: usuario.id,
                productos: [{
                    productoId: "64b000000000000000000001", // ID ficticio, solo para la prueba
                    nombreProducto: "Ramo de prueba",
                    cantidad: 1,
                    precioUnitario: 25,
                    subtotal: 25
                }],
                direccionEntrega: { etiqueta: "Casa", linea1: "Calle de prueba 123", ciudad: "Sonsonate" },
                subtotal: 25,
                total: 25,
                estadoPedido: "pendiente",
                fechaEntregaEstimada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            }
        });
        console.log("   OK: pedido", pedido._id, "| estado:", pedido.estadoPedido);

        // 3. Crear sesión de Checkout
        console.log("\n3) Creando sesión de Stripe Checkout...");
        const { url, pagoId } = await llamar("/stripe/checkout", {
            metodo: "POST",
            token,
            cuerpo: { pedidoId: pedido._id }
        });
        console.log("   OK: pago", pagoId);
        console.log("\n   ABRE ESTA URL EN TU NAVEGADOR Y PAGA:");
        console.log("   " + url);
        console.log("\n   Tarjeta: 4242 4242 4242 4242 | Fecha: cualquiera futura | CVC: cualquiera");

        // 4. Esperar a que pagues
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        await rl.question("\n   Cuando termines de pagar, presiona ENTER aquí... ");
        rl.close();

        // 5. Verificar con Stripe
        console.log("\n5) Verificando el pago con Stripe...");
        const verificado = await llamar(`/stripe/verificar/${pagoId}`, { token });
        console.log("   Estado del pago:", verificado.estado);

        const pagoBD = await llamar(`/pago/${pagoId}`, { token });
        console.log("   Referencia guardada:", pagoBD.referenciaTransaccion, "(debe empezar con pi_)");

        const pedidoBD = await llamar(`/pedidos/${pedido._id}`, { token });
        console.log("   Estado del pedido:", pedidoBD.estadoPedido, "(debe ser confirmado)");
        console.log("   Historial:", JSON.stringify(pedidoBD.historialEstados));

        // 6. Reporte
        console.log("\n6) Reporte del admin:");
        const reporte = await llamar("/pago/reporte", { token });
        console.log(JSON.stringify(reporte, null, 2));

        console.log("\nPrueba terminada.");
    } catch (error) {
        console.error("\nFALLÓ:", error.message);
    }
};

probar();