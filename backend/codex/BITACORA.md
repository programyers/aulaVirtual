# Bitácora de desarrollo — Backend Aula Virtual

## 30/09/2026 — Instalación inicial de dependencias

```bash
# Producción
npm install express pg typeorm reflect-metadata ioredis @aws-sdk/client-s3 jsonwebtoken bcrypt dotenv class-validator class-transformer

# Desarrollo
npm install -D typescript @types/node @types/express @types/jsonwebtoken @types/bcrypt ts-node-dev
```

> Posteriormente `ts-node-dev` fue reemplazado por `tsx` y se agregó `cors` (ver 01/10/2026).

---

## 01/10/2026 — Depuración y resoluciones técnicas

Durante el setup e integración con Docker y TypeORM se identificaron y resolvieron los siguientes problemas de entorno.

### 1. Descuadre de rutas en compilación (`dist` corrupta)

- **Síntoma:** módulos no encontrados al ejecutar en producción o dentro de Docker.
- **Causa raíz:** `index.ts` estaba en la raíz (`/backend/index.ts`) mientras los módulos estaban en `/src`. Al ejecutar `tsc` se generó una estructura asimétrica en `dist/`, con `infrastructure/` dentro de `dist/shared/` e ignorando `modules/`.
- **Solución:**
  - Se reubicó `index.ts` dentro de `src/` (`/src/index.ts`).
  - Se limpió la carpeta `dist/` previa (`Remove-Item -Recurse -Force dist`).
  - Se aseguraron `"rootDir": "./src"` y `"outDir": "./dist"` en `tsconfig.json`.

### 2. Error `MODULE_NOT_FOUND` al resolver `data-source`

- **Síntoma:** `Cannot find module './src/shared/infrastructure/persistence/data-source'` al iniciar el servidor con `tsx`.
- **Causa raíz:** al mover `index.ts` a `src/index.ts`, los imports conservaron el prefijo `./src/`, buscando la ruta inexistente `src/src/...`.
- **Solución:** se corrigieron los imports en `src/index.ts` eliminando el prefijo `src/` sobrante (ej. `./shared/infrastructure/persistence/data-source`).

### 3. Incompatibilidad de `typeorm-ts-node-commonjs` con Node 20+ y `ts-node`

- **Síntoma:** `TypeError: Cannot read properties of undefined (reading 'fileExists')` al ejecutar migraciones en Docker.
- **Causa raíz:** el comando `typeorm-ts-node-commonjs` depende internamente de `ts-node`, que falla en Node.js v20+ con configuraciones de módulos mixtos.
- **Solución:** se migró el runtime de desarrollo y el ejecutor de TypeORM a `tsx` (esbuild), ejecutando la CLI directamente con `npx tsx node_modules/typeorm/cli.js`.

### 04. 2/10/2026 — Módulo de Usuarios y Automatización de Migraciones

Sembrado automático de Administrador: Se creó la migración 1710000000000-SeedAdminUser.ts para insertar de forma segura el 'usuario ADMIN inicial (admin@aulavirtual.com)' en PostgreSQL con hash de contraseña generado por bcrypt.

- Ejecución automática de migraciones: Se integró await AppDataSource.runMigrations() en src/index.ts tras la conexión de TypeORM, garantizando que el esquema y datos iniciales se sincronicen automáticamente al levantar el contenedor Docker.

- Implementación de cambio de estado de usuario:

- DTO (UpdateUserStatusDto): Validación de estados permitidos (ACTIVE, PENDING_APPROVAL, DISABLED) con class-validator.

- Caso de Uso (ChangeUserStatusUseCase): Lógica de dominio para modificar el estado del usuario respetando el modelo de UserEntity (fullName, passwordHash, etc.) e interactuando mediante IUserRepository.

- Controlador y Ruta (PATCH /api/v1/users/:id/status): Endpoint tipado con AuthenticatedRequest, protegido por los middlewares authenticateJWT y authorizeRoles('ADMIN').

- Montaje en Ruteador Maestro: Registro de userRoutes bajo /api/v1/users en app.router.ts.

## 03/10/2026 — Consolidación del Módulo 'Users' (DDD) y Mapeo End-to-End con el Frontend

### 1. Desglose Arquitectónico del Módulo 'Users' (Capa por Capa)

Se completó la implementación del flujo vertical para la gestión de usuarios bajo Arquitectura Limpia/DDD en `src/modules/users/`:

- **Capa de Dominio (`src/modules/users/domain/`):**
  - `IUserRepository`: Interfaz que define los contratos de persistencia (`findById`, `findByEmail`, `findAll`, `save`).
  - `UserEntity`: Entidad con reglas de estado (`ACTIVE`, `PENDING_APPROVAL`, `DISABLED`) y roles (`ADMIN`, `TEACHER`, `STUDENT`).
- **Capa de Aplicación (`src/modules/users/application/`):**
  - `GetUsersUseCase`: Ejecuta la consulta de todos los usuarios y sanitiza los datos excluyendo `passwordHash` antes de enviar la respuesta a la capa de presentación.
  - `ChangeUserStatusUseCase`: Valida la existencia del usuario y aplica las transiciones de estado permitidas.
- **Capa de Infraestructura (`src/modules/users/infrastructure/`):**
  - `TypeOrmUserRepository`: Implementación concreta con TypeORM. Se corrigió el fallo `this.userRepository.findAll is not a function` agregando formalmente la función `async findAll(): Promise<UserEntity[]>` mediante `this.repository.find()`.
  - Se tipó el método `save(user: Partial<UserEntity>)` para soportar actualizaciones parciales.
- **Capa de Presentación (`src/modules/users/presentation/`):**
  - `UserController`: Controlador tipado con `AuthenticatedRequest` que expone `getAllUsers` y `changeStatus`. Se alineó la firma de su constructor con la inyección de dependencias en las rutas.
  - `user.routes.ts`: Endpoints `GET /` y `PATCH /:id/status` protegidos por los middlewares `authenticateJWT` y `authorizeRoles('ADMIN')`.

### 2. Integración en el Ruteador Maestro

- Se confirmó el montaje de `userRoutes` dentro de `src/shared/infrastructure/http/app.router.ts` bajo la ruta relativa `/users`.
- Como `appRouter` está expuesto en `src/app.ts` bajo `/api/v1`, la URL final expuesta para el cliente es **`GET /api/v1/users`** y **`PATCH /api/v1/users/:id/status`**.

### 3. Matriz de Conexión Backend ➔ Frontend

| Capa Backend (`modules/users`) | Archivo Backend              | Archivo Frontend          | Componente/Servicio Frontend (`features/admin`) |
| :----------------------------- | :--------------------------- | :------------------------ | :---------------------------------------------- |
| **HTTP Entrypoint**            | `app.router.ts` (`/users`)   | `axios.config.js`         | `apiClient` (`baseURL: /api/v1`)                |
| **Routes & Security**          | `user.routes.ts`             | `admin.service.js`        | `adminService.getUsers()`                       |
| **Controller**                 | `UserController.getAllUsers` | `useAdminUsers.js`        | Custom Hook `fetchUsers()`                      |
| **Use Cases & Domain**         | `GetUsersUseCase`            | `UserManagementTable.jsx` | Componente de UI (Renderizado de tabla)         |
