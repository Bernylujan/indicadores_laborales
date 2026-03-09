import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cambia "NOMBRE_REPO" por el nombre exacto de tu repositorio en GitHub
// Ejemplo: si tu repo es github.com/bernardo/dashboard-laboral
// pon base: "/dashboard-laboral/"
export default defineConfig({
  plugins: [react()],
  base: "indicadores_laborales",
});
