import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// BrowserRouter debe envolver TODO el árbol de la app.
// Es lo que le permite a react-router leer/cambiar la URL
// y decidir qué página mostrar sin recargar el navegador.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);