import { useAuth } from "../../hooks/useAuth.js";

function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <p>Aquí se mostrará el resumen general del sistema (pedidos, ventas, stock bajo) cuando conectemos Pago e Inventario al 100%.</p>
    </div>
  );
}

export default Dashboard;