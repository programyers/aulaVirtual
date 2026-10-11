# Aula Virtual — API REST (Backend)

API RESTful en Node.js + Express + TypeScript, construida con **Arquitectura Hexagonal (Puertos y Adaptadores)**. Gestiona la persistencia en PostgreSQL, el almacenamiento de archivos en MinIO (S3) y procesos asíncronos con Redis.

> Este repositorio es el backend del proyecto **Aula Virtual**. Visión general: [README general](https://github.com/TU_USUARIO/aula-virtual) · Cliente web: [aula-virtual-frontend](https://github.com/TU_USUARIO/aula-virtual-frontend).

## Contenido

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Arquitectura](#2-arquitectura)
3. [Puesta en marcha](#3-puesta-en-marcha)
4. [Base de datos y migraciones](#4-base-de-datos-y-migraciones)
5. [Capa HTTP compartida](#5-capa-http-compartida)
6. [Seguridad y autorización](#6-seguridad-y-autorización)
7. [Módulo de autenticación](#7-módulo-de-autenticación)
8. [Módulo de usuarios](#8-módulo-de-usuarios)
9. [Módulo de asignaturas e inscripciones](#9-módulo-de-asignaturas-e-inscripciones)
10. [Almacenamiento de archivos](#10-almacenamiento-de-archivos)
11. [Estado del proyecto](#11-estado-del-proyecto)

---

## 1. Stack tecnológico

| Área                    | Tecnología                           |
| ----------------------- | ------------------------------------ |
| Runtime / Framework     | Node.js, Express 5, TypeScript       |
| Base de datos           | PostgreSQL 15                        |
| ORM                     | TypeORM (entidades y migraciones)    |
| Almacenamiento          | MinIO / API compatible con Amazon S3 |
| Caché y colas           | Redis 7.4                            |
| Seguridad               | JWT (access token), Bcrypt, RBAC     |
| Validación              | class-validator + class-transformer  |
| Ejecución en desarrollo | tsx (esbuild)                        |
| Contenedores            | Docker Compose                       |

### Dependencias de producción

| Paquete                             | Versión          | Propósito                                      |
| ----------------------------------- | ---------------- | ---------------------------------------------- |
| express                             | ^5.2.1           | Framework HTTP, ruteo y middlewares            |
| typeorm                             | ^1.1.1           | ORM y migraciones SQL                          |
| pg                                  | ^8.23.1          | Driver de PostgreSQL                           |
| reflect-metadata                    | ^0.2.2           | Lectura de decoradores (requerido por TypeORM) |
| class-validator / class-transformer | ^0.15.1 / ^0.5.1 | Validación y transformación de DTOs            |
| bcrypt                              | ^6.0.0           | Hashing de contraseñas                         |
| jsonwebtoken                        | ^9.0.3           | Emisión y verificación de JWT                  |
| ioredis                             | ^5.11.1          | Cliente de Redis                               |
| @aws-sdk/client-s3                  | ^3.1144.0        | Cliente S3 para MinIO                          |
| cors                                | ^2.8.6           | Peticiones de origen cruzado                   |
| dotenv                              | ^18.0.5          | Variables de entorno desde `.env`              |

### Dependencias de desarrollo

| Paquete    | Versión  | Propósito                                                       |
| ---------- | -------- | --------------------------------------------------------------- |
| tsx        | ^4.23.15 | Ejecutor TypeScript (`tsx watch`) y runner de la CLI de TypeORM |
| typescript | ^7.0.2   | Tipado estático                                                 |
| @types/\*  | varias   | Definiciones de tipos                                           |

```bash
# Producción
npm install express pg typeorm reflect-metadata ioredis @aws-sdk/client-s3 jsonwebtoken bcrypt cors dotenv class-validator class-transformer

# Desarrollo
npm install -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt
```

---

## 2. Arquitectura

El código sigue una regla estricta de dependencia: el **dominio** no conoce detalles técnicos de la base de datos ni del framework web. Cada módulo se divide en cuatro capas:

| Capa              | Responsabilidad                                  |
| ----------------- | ------------------------------------------------ |
| `domain/`         | Interfaces, puertos y reglas de negocio          |
| `application/`    | Casos de uso                                     |
| `infrastructure/` | Adaptadores concretos (TypeORM, Bcrypt, JWT, S3) |
| `presentation/`   | Controladores, DTOs y rutas HTTP                 |

### Estructura del proyecto

```text
src/
├── index.ts             # Arranque: conexión TypeORM, migraciones y servidor
├── app.ts               # Aplicación Express; expone appRouter bajo /api/v1
├── modules/
│   ├── auth/            # Registro, login y perfil
│   ├── users/           # Usuarios, docentes pendientes y activación
│   ├── subjects/        # Asignaturas e inscripciones
│   ├── sections/        # Agrupamiento de contenido
│   ├── resources/       # Adaptador de almacenamiento S3 (puerto FileStorage)
│   ├── assignments/     # Tareas, entregas, plazos y evaluaciones
│   └── notifications/   # Productores y consumidores de colas Redis
└── shared/
    └── infrastructure/
        ├── http/
        │   ├── interfaces/    # AuthenticatedRequest
        │   ├── middlewares/   # auth, roles, validate-dto, error-handler
        │   ├── response/      # ApiResponse
        │   └── routes/        # app.router.ts
        └── persistence/       # data-source.ts y migraciones
```

### Entidades (8)

Las entidades viven en `src/modules/{modulo}/infrastructure/persistence/` para no romper el aislamiento hexagonal, y se descubren dinámicamente desde `data-source.ts`.

| Entidad              | Ubicación                                                                 | Estado    |
| -------------------- | ------------------------------------------------------------------------- | --------- |
| `UserEntity`         | `modules/users/infrastructure/persistence/user.entity.ts`                 | Listo     |
| `SubjectEntity`      | `modules/subjects/infrastructure/persistence/subject.entity.ts`           | Listo     |
| `EnrollmentEntity`   | `modules/subjects/infrastructure/persistence/enrollment.entity.ts`        | Listo     |
| `SectionEntity`      | `modules/sections/infrastructure/persistence/section.entity.ts`           | Pendiente |
| `ResourceEntity`     | `modules/resources/infrastructure/persistence/resource.entity.ts`         | Pendiente |
| `AssignmentEntity`   | `modules/assignments/infrastructure/persistence/assignment.entity.ts`     | Pendiente |
| `SubmissionEntity`   | `modules/assignments/infrastructure/persistence/submission.entity.ts`     | Pendiente |
| `NotificationEntity` | `modules/notifications/infrastructure/persistence/notification.entity.ts` | Pendiente |

---

## 3. Puesta en marcha

### Servicios (Docker Compose)

| Servicio   | Descripción       | Puertos                         |
| ---------- | ----------------- | ------------------------------- |
| `api`      | Servidor Node.js  | 3000                            |
| `postgres` | PostgreSQL 15     | 5432                            |
| `redis`    | Redis 7.4         | 6379                            |
| `minio`    | Almacenamiento S3 | 9000 (API) / 9001 (consola web) |

### Comandos

```bash
# Levantar el entorno y reconstruir imágenes
docker compose up --build -d

# Ver logs de la API en vivo
docker compose logs -f api

# Apagar los contenedores
docker compose down
```

### Variables de entorno

Crea un archivo `.env` a partir de `.env.example`. Variables de base de datos usadas por `data-source.ts`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=aula_virtual
```

Variables del JWT (`JwtTokenService`):

```env
JWT_SECRET=cambia-este-secreto
JWT_EXPIRES_IN=1d   # por defecto: 1 día
```

> Los valores por defecto del código son solo para desarrollo local. En producción define siempre credenciales propias.

### Scripts de `package.json`

| Script                     | Descripción                                               |
| -------------------------- | --------------------------------------------------------- |
| `npm run start:dev`        | Desarrollo con recarga en vivo (`tsx watch src/index.ts`) |
| `npm run build`            | Compila a `dist/` con `tsc`                               |
| `npm start`                | Ejecuta la build (`node dist/index.js`)                   |
| `npm run migration:run`    | Aplica las migraciones pendientes                         |
| `npm run migration:revert` | Revierte la última migración                              |

`tsconfig.json` debe mantener `"rootDir": "./src"` y `"outDir": "./dist"`.

---

## 4. Base de datos y migraciones

- El esquema evoluciona **únicamente mediante migraciones** versionadas (`synchronize: false`).
- Las migraciones se aplican automáticamente al arrancar: `src/index.ts` ejecuta `await AppDataSource.runMigrations()` tras conectar TypeORM, de modo que el esquema y los datos iniciales quedan al día antes de atender peticiones. También puedes ejecutarlas a mano con `npm run migration:run`.
- La CLI de TypeORM se ejecuta con `tsx` en lugar de `typeorm-ts-node-commonjs`, que falla con Node 20+ (ver [bitácora](docs/BITACORA.md)).
- **Sembrado del administrador:** la migración `1710000000000-SeedAdminUser.ts` inserta el usuario `ADMIN` inicial (`admin@aulavirtual.com`) con la contraseña cifrada con bcrypt.

```json
"scripts": {
  "start:dev": "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "migration:run": "npx tsx node_modules/typeorm/cli.js migration:run -d src/shared/infrastructure/persistence/data-source.ts",
  "migration:revert": "npx tsx node_modules/typeorm/cli.js migration:revert -d src/shared/infrastructure/persistence/data-source.ts"
}
```

Configuración del `DataSource`:

```typescript
import { DataSource } from "typeorm";
import * as path from "path";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "aula_virtual",
  synchronize: false,
  logging: true,
  entities: [
    path.join(
      __dirname,
      "../../../modules/**/infrastructure/persistence/*.entity.{ts,js}",
    ),
  ],
  migrations: [path.join(__dirname, "./migrations/*.{ts,js}")],
});
```

---

## 5. Capa HTTP compartida

Ubicada en `src/shared/infrastructure/http/`.

### Respuestas estandarizadas (`ApiResponse`)

Formateador centralizado que garantiza un contrato JSON homogéneo en toda la API:

```json
{
  "success": true,
  "message": "Descripción opcional",
  "data": {},
  "errors": []
}
```

### Middlewares

| Middleware               | Función                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `errorHandlerMiddleware` | Captura excepciones no controladas y responde un `500` estandarizado, sin filtrar _stack traces_                                                                      |
| `validateDto`            | Combina `class-transformer` y `class-validator`; filtra propiedades no permitidas (`whitelist: true`) y responde `400 Bad Request` con el detalle de campos inválidos |
| `authenticateJWT`        | Valida `Authorization: Bearer <token>` y verifica la firma del JWT                                                                                                    |
| `authorizeRoles`         | Restringe endpoints según el rol (`ADMIN`, `TEACHER`, `STUDENT`)                                                                                                      |

### Ruteo

- **Enrutador maestro** (`routes/app.router.ts`): reúne las rutas de los submódulos; `src/app.ts` lo expone bajo el prefijo global `/api/v1`.
- **Enrutadores modulares** (`src/modules/{modulo}/presentation/routes/`): cada módulo encapsula sus endpoints, asociando validadores DTO y middlewares de seguridad.

---

## 6. Seguridad y autorización

Modelo en dos niveles:

1. **Autenticación (JWT):** `authenticateJWT` valida el token de acceso y propaga el payload (`id`, `email`, `role`) en `AuthenticatedRequest`.
2. **Autorización por rol (RBAC):** `authorizeRoles('ADMIN')`, por ejemplo, restringe `PATCH /users/:id/status` a administradores.

Controles de nivel de recurso previstos para los módulos de secciones y recursos (ver [Estado del proyecto](#11-estado-del-proyecto)):

- **Pertenencia (ownership):** un docente solo edita secciones de asignaturas donde `subject.teacher_id === currentUser.id`.
- **Inscripción:** un estudiante solo descarga archivos o entrega tareas si existe un registro activo en `enrollments`.

---

## 7. Módulo de autenticación

### Capa de dominio

- **Puertos:** `IPasswordHasher` (hashing y verificación) e `ITokenService` (firma y verificación de JWT, con el tipo `TokenPayload`).
- **Contrato de persistencia:** `IUserRepository` propio del módulo (`findByEmail`, `findById`, `findAll`, `save`). Comparte la `UserEntity` del módulo `users`, pero mantiene su propio contrato y repositorio para conservar el desacoplamiento entre módulos.

### Capa de infraestructura

- `BcryptPasswordHasher`: bcrypt con costo de 10 rondas.
- `JwtTokenService`: `jsonwebtoken` con secreto (`JWT_SECRET`) y expiración (`JWT_EXPIRES_IN`) configurables por `.env`.
- `TypeOrmUserRepository`: persistencia sobre la tabla `users`.

### Capa de aplicación

- **`RegisterUseCase`**
  - Verifica colisión de correo (`409 Conflict`).
  - Cifra la contraseña mediante `IPasswordHasher`.
  - Estado inicial según rol: `ACTIVE` para `STUDENT` y `PENDING_APPROVAL` para `TEACHER`.
- **`LoginUseCase`**
  - Valida que el usuario exista y compara la contraseña con el hash.
  - Bloquea usuarios `DISABLED` o `PENDING_APPROVAL` con `403 Forbidden`.
  - Retorna un `accessToken` con el payload (`id`, `email`, `role`) y los datos del usuario (`id`, `email`, `fullName`, `role`, `status`), que el frontend guarda en su `authStore`.

### Capa de presentación

- **`LoginDto`:** formato de correo y contraseña obligatoria.
- **`RegisterDto`:** contraseña robusta (mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial `@$!%*?&.#_-`).
- **`AuthController`:** métodos `login` (200), `register` (201) y `me` (200). Los errores se delegan al manejador global con `next(error)`.

### Alcance de esta versión

Se emite un único token de acceso (JWT). El refresh token rotativo está pendiente.

### Endpoints

| Método | Ruta                    | Descripción                         | Protegido              |
| ------ | ----------------------- | ----------------------------------- | ---------------------- |
| POST   | `/api/v1/auth/register` | Registro de usuarios                | No                     |
| POST   | `/api/v1/auth/login`    | Inicio de sesión y emisión de token | No                     |
| GET    | `/api/v1/auth/me`       | Perfil del usuario autenticado      | Sí (`authenticateJWT`) |

### Estructura del módulo

```text
src/modules/auth/
├── application/
│   └── use-cases/
│       ├── login.use-case.ts
│       └── register.use-case.ts
├── domain/
│   ├── ports/
│   │   ├── password-hasher.interface.ts
│   │   └── token-service.interface.ts
│   └── repositories/
│       └── user-repository.interface.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── bcrypt-password-hasher.ts
│   │   └── jwt-token-service.ts
│   └── persistence/
│       └── typeorm-user.repository.ts
└── presentation/
    ├── controllers/
    │   └── auth.controller.ts
    ├── dtos/
    │   ├── login.dto.ts
    │   └── register.dto.ts
    └── routes/
        └── auth.routes.ts
```

---

## 8. Módulo de usuarios

Gestión de usuarios y aprobación de cuentas docentes, en `src/modules/users/`.

- **Dominio:** `IUserRepository` (`findById`, `findByEmail`, `findAll`, `save`) y `UserEntity` con estados (`ACTIVE`, `PENDING_APPROVAL`, `DISABLED`) y roles (`ADMIN`, `TEACHER`, `STUDENT`).
- **Aplicación:**
  - `GetUsersUseCase`: lista todos los usuarios y excluye `passwordHash` de la respuesta.
  - `ChangeUserStatusUseCase`: valida la existencia del usuario y aplica las transiciones de estado permitidas.
- **Infraestructura:** `TypeOrmUserRepository`, con `save(user: Partial<UserEntity>)` para soportar actualizaciones parciales.
- **Presentación:** `UserController` (`getAllUsers`, `changeStatus`), `UpdateUserStatusDto` (valida el estado con `class-validator`) y `user.routes.ts`.

| Método | Ruta                       | Rol requerido | Descripción                              |
| ------ | -------------------------- | ------------- | ---------------------------------------- |
| GET    | `/api/v1/users`            | `ADMIN`       | Lista los usuarios                       |
| PATCH  | `/api/v1/users/:id/status` | `ADMIN`       | Aprueba o cambia el estado de un usuario |

---

## 9. Módulo de asignaturas e inscripciones

Gestión de asignaturas y matrícula de estudiantes por código, en `src/modules/subjects/`.

- **Dominio:** `ISubjectRepository` (`create`, `findByCode`, `findByTeacherId`) e `IEnrollmentRepository` (`enroll`, `findEnrollment`, `findSubjectsByStudentId`).
- **Infraestructura:** entidades `SubjectEntity` y `EnrollmentEntity` (relaciones `ManyToOne` hacia `UserEntity`), `TypeOrmSubjectRepository`, `TypeOrmEnrollmentRepository` y la migración `CreateSubjectsAndEnrollmentsTables`.
- **Aplicación (4 casos de uso):**
  1. `CreateSubjectUseCase`: crea la asignatura y genera un código único de 6 caracteres alfanuméricos en mayúsculas.
  2. `GetTeacherSubjectsUseCase`: asignaturas creadas por un docente.
  3. `EnrollStudentUseCase`: inscribe al estudiante por código, evitando inscripciones duplicadas.
  4. `GetStudentSubjectsUseCase`: asignaturas en las que un estudiante está matriculado.
- **Presentación:** `CreateSubjectDto`, `EnrollSubjectDto`, `SubjectController` y `subject.routes.ts` protegido con `authenticateJWT` y `authorizeRoles`.

| Método | Ruta                       | Rol requerido | Descripción                                    |
| ------ | -------------------------- | ------------- | ---------------------------------------------- |
| POST   | `/api/v1/subjects`         | `TEACHER`     | Crea una asignatura y devuelve su código único |
| GET    | `/api/v1/subjects/teacher` | `TEACHER`     | Asignaturas del docente autenticado            |
| POST   | `/api/v1/subjects/enroll`  | `STUDENT`     | Inscribe al estudiante mediante el código      |
| GET    | `/api/v1/subjects/student` | `STUDENT`     | Asignaturas del estudiante autenticado         |

---

## 10. Almacenamiento de archivos

Diseño previsto para el módulo `resources` (aún pendiente). Para aislar la carga del servidor web:

- Los archivos **no** se guardan en el volumen Docker de la API.
- Los docentes suben archivos directamente al bucket de MinIO.
- Los estudiantes descargan recursos solicitando a la API una **URL prefirmada** con validez de 10 minutos. Si el acceso es denegado, la URL nunca se genera (`403 Forbidden`).

Para generar URLs prefirmadas con el SDK de AWS se necesita además el paquete `@aws-sdk/s3-request-presigner`.

---

## 11. Estado del proyecto

| Componente                                                                            | Estado    |
| ------------------------------------------------------------------------------------- | --------- |
| Docker Compose (api, postgres, redis, minio)                                          | Listo     |
| TypeORM, data-source y migraciones (con ejecución automática al arrancar)             | Listo     |
| Capa HTTP compartida (respuestas, errores, DTOs, JWT, roles)                          | Listo     |
| Módulo `auth` (register, login, me)                                                   | Listo     |
| Módulo `users` (sembrado ADMIN, listado y cambio de estado `PATCH /users/:id/status`) | Listo     |
| Módulo `subjects` (asignaturas e inscripciones por código)                            | Listo     |
| Refresh token rotativo en cookie HTTP-Only                                            | Pendiente |
| Módulos `sections`, `resources`, `assignments`                                        | Pendiente |
| Guards de pertenencia e inscripción                                                   | Pendiente |
| Notificaciones con colas Redis                                                        | Pendiente |

## Documentación adicional

- [Bitácora de desarrollo y resoluciones técnicas](docs/BITACORA.md)
