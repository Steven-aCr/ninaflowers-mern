import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verificarPagoStripe } from "../../services/stripeService.js";
import "./PagoEstado.css";

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
    <main className="pago-estado">
      <div className="pago-estado__tarjeta">
        {estado === "verificando" && (
          <>
            <span className="material-symbols-outlined pago-estado__icono pago-estado__icono--espera">hourglass_top</span>
            <h1>Verificando pago...</h1>
            <p>Estamos confirmando tu transacción.</p>
          </>
        )}

        {estado === "completado" && (
          <>
            <span className="material-symbols-outlined pago-estado__icono pago-estado__icono--ok">check_circle</span>
            <h1>Pago confirmado</h1>
            <p>Tu pedido fue pagado correctamente.</p>
            <p>El inventario correspondiente a tu compra ya fue actualizado.</p>
            <button className="ui-btn" onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Ver mi pedido</button>
          </>
        )}

        {estado === "pendiente" && (
          <>
            <span className="material-symbols-outlined pago-estado__icono pago-estado__icono--espera">schedule</span>
            <h1>Pago en verificación</h1>
            <p>El pago todavía está siendo procesado.</p>
            <button className="ui-btn" onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Ver pedido</button>
          </>
        )}

        {estado === "error" && (
          <>
            <span className="material-symbols-outlined pago-estado__icono pago-estado__icono--error">error</span>
            <h1>No pudimos verificar el pago</h1>
            <p>{error}</p>
            <button className="ui-btn" onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Volver al pedido</button>
          </>
        )}
      </div>
    </main>
  );
}

export default PagoExitoso;