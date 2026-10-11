# Bitácora de desarrollo — Backend Aula Virtual

## 30/09/2026 — Instalación inicial de dependencias

```bash
# Producción
npm install express pg typeorm reflect-metadata ioredis @aws-sdk/client-s3 jsonwebtoken bcrypt dotenv class-validator class-transformer

# Desarrollo
npm install -D typescript @types/node @types/express @types/jsonwebtoken @types/bcrypt ts-node-dev
```

> Posteriormente `ts-node-dev` fue reemplazado por `tsx` (ver 01/10/2026) y se agregó `cors`.

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

---

## 02/10/2026 — Módulo de Autenticación (Auth) bajo Arquitectura Hexagonal

### 1. Desglose Arquitectónico (Capa por Capa)

Se implementó el módulo `src/modules/auth/` separando la lógica de negocio de las librerías externas mediante puertos y adaptadores:

- **Capa de Dominio (`src/modules/auth/domain/`):**
  - `ports/password-hasher.interface.ts` (`IPasswordHasher`): puerto para el hash de contraseñas (`hash`, `compare`).
  - `ports/token-service.interface.ts` (`ITokenService`): puerto para la gestión de tokens (`generateToken`, `verifyToken`) y tipo `TokenPayload`.
  - `repositories/user-repository.interface.ts` (`IUserRepository`): contrato de persistencia de usuarios (`findByEmail`, `findById`, `findAll`, `save`).
- **Capa de Aplicación (`src/modules/auth/application/use-cases/`):**
  - `LoginUseCase`: autenticación de credenciales y emisión del token.
  - `RegisterUseCase`: registro de nuevos usuarios.
- **Capa de Infraestructura (`src/modules/auth/infrastructure/`):**
  - `adapters/bcrypt-password-hasher.ts` (`BcryptPasswordHasher`): implementación de `IPasswordHasher` con bcrypt y 10 rondas de sal.
  - `adapters/jwt-token-service.ts` (`JwtTokenService`): implementación de `ITokenService` con `jsonwebtoken`. El secreto se lee de `JWT_SECRET` y la expiración de `JWT_EXPIRES_IN` (1 día por defecto).
  - `persistence/typeorm-user.repository.ts` (`TypeOrmUserRepository`): implementación de `IUserRepository` sobre TypeORM, reutilizando la `UserEntity` del módulo `users`.
- **Capa de Presentación (`src/modules/auth/presentation/`):**
  - `controllers/auth.controller.ts` (`AuthController`): expone `login` (200), `register` (201) y `me` (200, devuelve el perfil del usuario autenticado). Las respuestas usan el formato estandarizado `ApiResponse` (`{ message, data }`) y los errores se delegan al manejador global mediante `next(error)`.
  - `dtos/login.dto.ts` y `dtos/register.dto.ts`: validación de payloads HTTP.
  - `routes/auth.routes.ts`: definición de las rutas del módulo.

### 2. Endpoint Consumido por el Frontend

`POST /api/v1/auth/login`: consumido desde `authService.login()` en el frontend. La respuesta incluye el token y los datos del usuario (`id`, `email`, `fullName`, `role`, `status`), que el frontend guarda en `authStore` para el control de acceso con `RoleGuard`.

### 3. Alcance de esta Versión

- Se emite un único token de acceso (JWT); el refresh token no está implementado todavía.
- El módulo `auth` comparte la entidad `UserEntity` del módulo `users`, pero mantiene su propio contrato y repositorio para conservar el desacoplamiento entre módulos.

---

## 02/10/2026 — Módulo de Usuarios y Automatización de Migraciones

- **Sembrado automático de Administrador:** se creó la migración `1710000000000-SeedAdminUser.ts` para insertar de forma segura el usuario ADMIN inicial (`admin@aulavirtual.com`) en PostgreSQL, con hash de contraseña generado por bcrypt.
- **Ejecución automática de migraciones:** se integró `await AppDataSource.runMigrations()` en `src/index.ts` tras la conexión de TypeORM, garantizando que el esquema y los datos iniciales se sincronicen automáticamente al levantar el contenedor Docker.
- **Implementación de cambio de estado de usuario:**
  - **DTO (`UpdateUserStatusDto`):** validación de estados permitidos (`ACTIVE`, `PENDING_APPROVAL`, `DISABLED`) con `class-validator`.
  - **Caso de Uso (`ChangeUserStatusUseCase`):** lógica de dominio para modificar el estado del usuario respetando el modelo de `UserEntity` (`fullName`, `passwordHash`, etc.) e interactuando mediante `IUserRepository`.
  - **Controlador y Ruta (`PATCH /api/v1/users/:id/status`):** endpoint tipado con `AuthenticatedRequest`, protegido por los middlewares `authenticateJWT` y `authorizeRoles('ADMIN')`.
  - **Montaje en Ruteador Maestro:** registro de `userRoutes` bajo `/api/v1/users` en `app.router.ts`.

---

## 03/10/2026 — Consolidación del Módulo 'Users' (DDD) y Mapeo End-to-End con el Frontend

### 1. Desglose Arquitectónico del Módulo 'Users' (Capa por Capa)

Se completó la implementación del flujo vertical para la gestión de usuarios bajo Arquitectura Limpia/DDD en `src/modules/users/`:

- **Capa de Dominio (`src/modules/users/domain/`):**
  - `IUserRepository`: interfaz que define los contratos de persistencia (`findById`, `findByEmail`, `findAll`, `save`).
  - `UserEntity`: entidad con reglas de estado (`ACTIVE`, `PENDING_APPROVAL`, `DISABLED`) y roles (`ADMIN`, `TEACHER`, `STUDENT`).
- **Capa de Aplicación (`src/modules/users/application/`):**
  - `GetUsersUseCase`: ejecuta la consulta de todos los usuarios y sanitiza los datos excluyendo `passwordHash` antes de enviar la respuesta a la capa de presentación.
  - `ChangeUserStatusUseCase`: valida la existencia del usuario y aplica las transiciones de estado permitidas.
- **Capa de Infraestructura (`src/modules/users/infrastructure/`):**
  - `TypeOrmUserRepository`: implementación concreta con TypeORM. Se corrigió el fallo `this.userRepository.findAll is not a function` agregando formalmente la función `async findAll(): Promise<UserEntity[]>` mediante `this.repository.find()`.
  - Se tipó el método `save(user: Partial<UserEntity>)` para soportar actualizaciones parciales.
- **Capa de Presentación (`src/modules/users/presentation/`):**
  - `UserController`: controlador tipado con `AuthenticatedRequest` que expone `getAllUsers` y `changeStatus`. Se alineó la firma de su constructor con la inyección de dependencias en las rutas.
  - `user.routes.ts`: endpoints `GET /` y `PATCH /:id/status` protegidos por los middlewares `authenticateJWT` y `authorizeRoles('ADMIN')`.

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

---

## 05/10/2026 — Módulo Asignaturas (Subjects) e Inscripciones (Enrollments)

### 1. Resumen de Actividades Realizadas

#### Capa de Dominio (`src/modules/subjects/domain/`)

- Definición de abstracciones e interfaces del repositorio:
  - `ISubjectRepository`: contrato para gestión de asignaturas (`create`, `findByCode`, `findByTeacherId`).
  - `IEnrollmentRepository`: contrato para gestión de inscripciones (`enroll`, `findEnrollment`, `findSubjectsByStudentId`).

#### Capa de Infraestructura (`src/modules/subjects/infrastructure/`)

- **Persistencia O/RM:** creación de las entidades TypeORM `SubjectEntity` y `EnrollmentEntity` con relaciones `ManyToOne` hacia `UserEntity`.
- **Repositorios Concretos:** implementación de `TypeOrmSubjectRepository` y `TypeOrmEnrollmentRepository` usando `AppDataSource`.
- **Base de Datos & Migraciones:** creación y aplicación exitosa de la migración `CreateSubjectsAndEnrollmentsTables` en PostgreSQL, ejecutada dentro del contenedor Docker.

#### Capa de Aplicación (`src/modules/subjects/application/`)

Implementación de la lógica de negocio mediante 4 Casos de Uso:

1. `CreateSubjectUseCase`: creación de la asignatura y generación de código único de 6 caracteres alfanuméricos en mayúsculas.
2. `GetTeacherSubjectsUseCase`: consulta de asignaturas creadas por un docente específico.
3. `EnrollStudentUseCase`: validación e inscripción de un estudiante mediante el código de acceso, evitando inscripciones duplicadas.
4. `GetStudentSubjectsUseCase`: consulta de las asignaturas en las que un estudiante está matriculado.

#### Capa de Presentación (`src/modules/subjects/presentation/`)

- **DTOs con `class-validator`:** implementación de `CreateSubjectDto` y `EnrollSubjectDto` para la validación de payloads HTTP.
- **Controlador HTTP:** implementación de `SubjectController` para mapear las peticiones y gestionar las respuestas HTTP.
- **Rutas y Middleware:** configuración de `subject.routes.ts` protegiendo los endpoints con `authenticateJWT` y control de roles mediante `authorizeRoles` (`TEACHER` y `STUDENT`).

### 2. Especificación de Endpoints

| Método | Endpoint                   | Rol Requerido | Descripción                                              |
| :----- | :------------------------- | :------------ | :------------------------------------------------------- |
| `POST` | `/api/v1/subjects`         | `TEACHER`     | Crea una asignatura y devuelve su código único.          |
| `GET`  | `/api/v1/subjects/teacher` | `TEACHER`     | Obtiene las asignaturas del docente autenticado.         |
| `POST` | `/api/v1/subjects/enroll`  | `STUDENT`     | Inscribe al estudiante mediante el código de asignatura. |
| `GET`  | `/api/v1/subjects/student` | `STUDENT`     | Obtiene las asignaturas del estudiante autenticado.      |

### 3. Estado del Módulo

- [x] Arquitectura backend implementada bajo Clean Architecture / DDD.
- [x] Migración generada y ejecutada en PostgreSQL mediante Docker.
- [x] Endpoints configurados con middlewares de autenticación y roles.
- [x] Integración en el Frontend (conectado con maquetado base; ver bitácora del frontend, 05/10/2026).

---

## Estado General de Módulos (Primera Versión)

Resumen de los módulos que ya cuentan con una primera versión funcional y documentada en las bitácoras (actualizado al 05/10/2026).

| Módulo                 | Backend                       | Frontend                                                   | Documentado en |
| :--------------------- | :---------------------------- | :--------------------------------------------------------- | :------------- |
| Auth (core/ + login)   | ✅ Primera versión            | ✅ Conectado (interceptores, authStore, RoleGuard, /login) | 02/10          |
| Users (features/admin) | ✅ Primera versión (02–03/10) | ✅ Conectado, maquetado base (03/10)                       | 02/10 y 03/10  |
| Subjects / Enrollments | ✅ Primera versión (05/10)    | ✅ Conectado, maquetado base (05/10)                       | 05/10          |

**Pendientes (aún sin documentar):** sections, resources, assignments, notifications.
