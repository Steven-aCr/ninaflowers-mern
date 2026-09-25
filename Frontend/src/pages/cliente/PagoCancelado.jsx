import { useNavigate, useSearchParams } from "react-router-dom";

function PagoCancelado() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const pedidoId = params.get("pedido");

  return (
    <main style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ maxWidth: "520px", padding: "32px", textAlign: "center", background: "#fff", borderRadius: "12px" }}>
        <h1>Pago cancelado</h1>
        <p>No se realizó ningún cobro. Tu pedido continúa pendiente y puedes intentar pagarlo nuevamente.</p>
        <button onClick={() => navigate(`/mis-pedidos/${pedidoId}`)}>Volver al pedido</button>
      </div>
    </main>
  );
}

export default PagoCancelado;