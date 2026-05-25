import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import apiRoutes from "../src/routes/routes.js"; // Importamos las rutas que acabas de renombrar

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middlewares principales
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("dev")); // Nos servirá para ver qué peticiones llegan en la terminal
app.use(express.json());

// Montar todas tus rutas bajo el prefijo /api
app.use("/api", apiRoutes);

// Arrancar el servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor Fintech corriendo en el puerto ${PORT}`);
});