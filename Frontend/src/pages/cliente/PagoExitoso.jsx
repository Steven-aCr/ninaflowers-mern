import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verificarPagoStripe } from "../../services/stripeService.js";

function PagoExitoso() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState("verificando");
  const [error, setError] = useState("");

  const pagoId = params.get("pago");
  const pedidoId = params.get("pedido");

  useEffect(() => {
    const verificar = async () => {
      if (!pagoId) {
        setError("No se recibió el identificador del pago.");
        setEstado("error");
        return;
      }

      try {
        const resultado = await verificarPagoStripe(pagoId);
        setEstado(resultado.estado === "completado" ? "completado" : "pendiente");
      } catch (e) {
        setError(e.response?.data?.error || "No se pudo verificar el pago.");
        setEstado("error");
      }
    };

    verificar();
  }, [pagoId]);

  return (
    <main style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ maxWidth: "520px", width: "100%", padding: "32px", textAlign: "center", background: "#fff", borderRadius: "12px" }}>
        {estado === "verificando" && (
          <>
            <h1>Verificando pago...</h1>
            <p>Estamos confirmando tu transacción.</p>
          </>
        )}

        {estado === "completado" && (
          <>
            <h1>Pago confirmado</h1>
            <p>Tu pedido fue pagado correctamente.</p>
            <p>El inventario correspondiente a tu compra ya fue actualizado.</p>
            <button onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Ver mi pedido</button>
          </>
        )}

        {estado === "pendiente" && (
          <>
            <h1>Pago en verificación</h1>
            <p>El pago todavía está siendo procesado.</p>
            <button onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Ver pedido</button>
          </>
        )}

        {estado === "error" && (
          <>
            <h1>No pudimos verificar el pago</h1>
            <p>{error}</p>
            <button onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Volver al pedido</button>
          </>
        )}
      </div>
    </main>
  );
}

export default PagoExitoso;