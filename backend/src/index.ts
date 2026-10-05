import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { AppDataSource } from "./shared/infrastructure/persistence/data-source";
import { appRouter } from "./shared/infrastructure/http/routes/app.router";
import { errorHandlerMiddleware } from "./shared/infrastructure/http/middlewares/error-handler.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Endpoint de verificación (Healthcheck)
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Backend en TypeScript iniciado correctamente",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", appRouter);

// Middleware global de errores
app.use(errorHandlerMiddleware);

AppDataSource.initialize()
  .then(async () => {
    console.log(
      "✅ Conexión con PostgreSQL establecida correctamente via TypeORM",
    );

    // Ejecutar las migraciones pendientes automáticamente
    await AppDataSource.runMigrations();
    console.log("✅ Migraciones ejecutadas correctamente");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "❌ Error al conectar con PostgreSQL durante la inicialización:",
      error,
    );
  });
