import { useNavigate, useSearchParams } from "react-router-dom";
import "./PagoEstado.css";

function PagoCancelado() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const pedidoId = params.get("pedido");

  return (
    <main className="pago-estado">
      <div className="pago-estado__tarjeta">
        <span className="material-symbols-outlined pago-estado__icono pago-estado__icono--error">cancel</span>
        <h1>Pago cancelado</h1>
        <p>No se realizó ningún cobro. Tu pedido continúa pendiente y puedes intentar pagarlo nuevamente.</p>
        <button className="ui-btn" onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Volver al pedido</button>
      </div>
    </main>
  );
}

export default PagoCancelado;