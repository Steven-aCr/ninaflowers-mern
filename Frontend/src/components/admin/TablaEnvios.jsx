import { formatearPrecio } from "../../utils/formatearPrecio.js";

const txt = v => v?.replaceAll("_", " ") || "—";

export default function TablaEnvios({ envios, onEditar }) {
    if (!envios.length)
        return
    <div className="gestion-vacio">No hay envíos registrados.</div>;
    return <div className="gestion-tabla-wrap">
        <table className="gestion-tabla">
            <thead><tr><th>Envío</th><th>Pedido</th><th>Tipo</th><th>Costo</th><th>Estado pedido</th><th></th></tr></thead><tbody>{envios.map(e => <tr key={e._id}><td className="gestion-id">#{e._id.slice(-6).toUpperCase()}</td><td>{e.pedidoId?._id ? `#${e.pedidoId._id.slice(-6).toUpperCase()}` : "—"}</td><td>{txt(e.tipo)}</td><td>{formatearPrecio(e.costoEnvio)}</td><td><span className={`gestion-badge gestion-badge--${e.pedidoId?.estadoPedido}`}>{txt(e.pedidoId?.estadoPedido)}</span></td><td><button className="gestion-link" onClick={() => onEditar(e)}>Editar</button></td></tr>)}</tbody></table></div>
}
