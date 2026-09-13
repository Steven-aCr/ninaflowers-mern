import Navbar from "./components/cliente/Navbar.jsx";
import Footer from "./components/cliente/Footer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./App.css";

function App() {
  return (
    <>
      <Navbar cantidadCarrito={0} />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;