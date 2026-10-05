# Aula Virtual — API REST (Backend)

API RESTful en Node.js + Express + TypeScript, construida con **Arquitectura Hexagonal (Puertos y Adaptadores)**. Gestiona la persistencia en PostgreSQL, el almacenamiento de archivos en MinIO (S3) y procesos asíncronos con Redis.

## Contenido

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Arquitectura](#2-arquitectura)
3. [Puesta en marcha](#3-puesta-en-marcha)
4. [Base de datos y migraciones](#4-base-de-datos-y-migraciones)
5. [Capa HTTP compartida](#5-capa-http-compartida)
6. [Seguridad y autorización](#6-seguridad-y-autorización)
7. [Módulo de autenticación](#7-módulo-de-autenticación)
8. [Almacenamiento de archivos](#8-almacenamiento-de-archivos)
9. [Estado del proyecto](#9-estado-del-proyecto)

---

## 1. Stack tecnológico

| Área | Tecnología |
|---|---|
| Runtime / Framework | Node.js, Express 5, TypeScript |
| Base de datos | PostgreSQL 15 |
| ORM | TypeORM (entidades y migraciones) |
| Almacenamiento | MinIO / API compatible con Amazon S3 |
| Caché y colas | Redis 7.4 |
| Seguridad | JWT (access token), Bcrypt, RBAC |
| Validación | class-validator + class-transformer |
| Ejecución en desarrollo | tsx (esbuild) |
| Contenedores | Docker Compose |

### Dependencias de producción

| Paquete | Versión | Propósito |
|---|---|---|
| express | ^5.2.1 | Framework HTTP, ruteo y middlewares |
| typeorm | ^1.1.1 | ORM y migraciones SQL |
| pg | ^8.23.1 | Driver de PostgreSQL |
| reflect-metadata | ^0.2.2 | Lectura de decoradores (requerido por TypeORM) |
| class-validator / class-transformer | ^0.15.1 / ^0.5.1 | Validación y transformación de DTOs |
| bcrypt | ^6.0.0 | Hashing de contraseñas |
| jsonwebtoken | ^9.0.3 | Emisión y verificación de JWT |
| ioredis | ^5.11.1 | Cliente de Redis |
| @aws-sdk/client-s3 | ^3.1144.0 | Cliente S3 para MinIO |
| cors | ^2.8.6 | Peticiones de origen cruzado |
| dotenv | ^18.0.5 | Variables de entorno desde `.env` |

### Dependencias de desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| tsx | ^4.23.15 | Ejecutor TypeScript (`tsx watch`) y runner de la CLI de TypeORM |
| typescript | ^7.0.2 | Tipado estático |
| @types/* | varias | Definiciones de tipos |

```bash
# Producción
npm install express pg typeorm reflect-metadata ioredis @aws-sdk/client-s3 jsonwebtoken bcrypt cors dotenv class-validator class-transformer

# Desarrollo
npm install -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt
```

---

## 2. Arquitectura

El código sigue una regla estricta de dependencia: el **dominio** no conoce detalles técnicos de la base de datos ni del framework web. Cada módulo se divide en cuatro capas:

| Capa | Responsabilidad |
|---|---|
| `domain/` | Interfaces, puertos y reglas de negocio |
| `application/` | Casos de uso |
| `infrastructure/` | Adaptadores concretos (TypeORM, Bcrypt, JWT, S3) |
| `presentation/` | Controladores, DTOs y rutas HTTP |

### Estructura del proyecto

```text
src/
├── index.ts
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

| Entidad | Ubicación |
|---|---|
| `UserEntity` | `modules/users/infrastructure/persistence/user.entity.ts` |
| `SubjectEntity` | `modules/subjects/infrastructure/persistence/subject.entity.ts` |
| `EnrollmentEntity` | `modules/subjects/infrastructure/persistence/enrollment.entity.ts` |
| `SectionEntity` | `modules/sections/infrastructure/persistence/section.entity.ts` |
| `ResourceEntity` | `modules/resources/infrastructure/persistence/resource.entity.ts` |
| `AssignmentEntity` | `modules/assignments/infrastructure/persistence/assignment.entity.ts` |
| `SubmissionEntity` | `modules/assignments/infrastructure/persistence/submission.entity.ts` |
| `NotificationEntity` | `modules/notifications/infrastructure/persistence/notification.entity.ts` |

---

## 3. Puesta en marcha

### Servicios (Docker Compose)

| Servicio | Descripción | Puertos |
|---|---|---|
| `api` | Servidor Node.js | 3000 |
| `postgres` | PostgreSQL 15 | 5432 |
| `redis` | Redis 7.4 | 6379 |
| `minio` | Almacenamiento S3 | 9000 (API) / 9001 (consola web) |

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

> Los valores por defecto del código son solo para desarrollo local. En producción define siempre credenciales propias. Además, la clave secreta y el tiempo de expiración del JWT también se leen desde `.env`.

### Scripts de `package.json`

| Script | Descripción |
|---|---|
| `npm run start:dev` | Desarrollo con recarga en vivo (`tsx watch src/index.ts`) |
| `npm run build` | Compila a `dist/` con `tsc` |
| `npm start` | Ejecuta la build (`node dist/index.js`) |
| `npm run migration:run` | Aplica las migraciones pendientes |
| `npm run migration:revert` | Revierte la última migración |

`tsconfig.json` debe mantener `"rootDir": "./src"` y `"outDir": "./dist"`.

---

## 4. Base de datos y migraciones

- El esquema evoluciona **únicamente mediante migraciones** versionadas (`synchronize: false`).
- Al iniciar el contenedor Docker se ejecuta `npm run migration:run` para dejar la estructura al día antes de levantar el puerto HTTP.
- La CLI de TypeORM se ejecuta con `tsx` en lugar de `typeorm-ts-node-commonjs`, que falla con Node 20+ (ver [bitácora](docs/BITACORA.md)).

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
import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'aula_virtual',
  synchronize: false,
  logging: true,
  entities: [
    path.join(__dirname, '../../../modules/**/infrastructure/persistence/*.entity.{ts,js}')
  ],
  migrations: [
    path.join(__dirname, './migrations/*.{ts,js}')
  ],
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

| Middleware | Función |
|---|---|
| `errorHandlerMiddleware` | Captura excepciones no controladas y responde un `500` estandarizado, sin filtrar *stack traces* |
| `validateDto` | Combina `class-transformer` y `class-validator`; filtra propiedades no permitidas (`whitelist: true`) y responde `400 Bad Request` con el detalle de campos inválidos |
| `authenticateJWT` | Valida `Authorization: Bearer <token>` y verifica la firma del JWT |
| `authorizeRoles` | Restringe endpoints según el rol (`ADMIN`, `TEACHER`, `STUDENT`) |

### Ruteo

- **Enrutador maestro** (`routes/app.router.ts`): monta los submódulos bajo el prefijo global `/api/v1`.
- **Enrutadores modulares** (`src/modules/{modulo}/presentation/routes/`): cada módulo encapsula sus endpoints, asociando validadores DTO y middlewares de seguridad.

---

## 6. Seguridad y autorización

Modelo en dos niveles:

1. **Autenticación (JWT):** `authenticateJWT` valida el token de acceso y propaga el payload (`id`, `email`, `role`) en `AuthenticatedRequest`.
2. **Autorización por rol (RBAC):** `authorizeRoles('ADMIN')`, por ejemplo, restringe `PATCH /users/:id/status` a administradores.

Controles de nivel de recurso previstos para los módulos de asignaturas y recursos (ver [Estado del proyecto](#9-estado-del-proyecto)):

- **Pertenencia (ownership):** un docente solo edita secciones de asignaturas donde `subject.teacher_id === currentUser.id`.
- **Inscripción:** un estudiante solo descarga archivos o entrega tareas si existe un registro activo en `enrollments`.

---

## 7. Módulo de autenticación

### Capa de dominio
- **Puertos:** `IPasswordHasher` (hashing y verificación) e `ITokenService` (firma y decodificación de JWT).
- Consume `IUserRepository`, exportado por el módulo `users`.

### Capa de infraestructura
- `BcryptPasswordHasher`: bcrypt con costo de 10 rondas.
- `JwtTokenService`: `jsonwebtoken` con secreto y expiración configurables por `.env`.
- `TypeOrmUserRepository`: persistencia sobre la tabla `users`.

### Capa de aplicación
- **`RegisterUseCase`**
  - Verifica colisión de correo (`409 Conflict`).
  - Cifra la contraseña mediante `IPasswordHasher`.
  - Estado inicial según rol: `ACTIVE` para `STUDENT` y `PENDING_APPROVAL` para `TEACHER`.
- **`LoginUseCase`**
  - Valida que el usuario exista y compara la contraseña con el hash.
  - Bloquea usuarios `DISABLED` o `PENDING_APPROVAL` con `403 Forbidden`.
  - Retorna un `accessToken` con el payload (`id`, `email`, `role`).

### Capa de presentación
- **`LoginDto`:** formato de correo y contraseña obligatoria.
- **`RegisterDto`:** contraseña robusta (mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial `@$!%*?&.#_-`).
- **`AuthController`:** métodos `login`, `register` y `me`.

### Endpoints

| Método | Ruta | Descripción | Protegido |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Registro de usuarios | No |
| POST | `/api/v1/auth/login` | Inicio de sesión y emisión de token | No |
| GET | `/api/v1/auth/me` | Perfil del usuario autenticado | Sí (`authenticateJWT`) |

### Estructura del módulo

```text
src/modules/auth/
├── application/
│   └── use-cases/
│       ├── login.use-case.ts
│       └── register.use-case.ts
├── domain/
│   └── ports/
│       ├── password-hasher.interface.ts
│       └── token-service.interface.ts
├── infrastructure/
│   └── adapters/
│       ├── bcrypt-password-hasher.ts
│       └── jwt-token-service.ts
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

## 8. Almacenamiento de archivos

Para aislar la carga del servidor web:

- Los archivos **no** se guardan en el volumen Docker de la API.
- Los docentes suben archivos directamente al bucket de MinIO.
- Los estudiantes descargan recursos solicitando a la API una **URL prefirmada** con validez de 10 minutos. Si el acceso es denegado, la URL nunca se genera (`403 Forbidden`).

Para generar URLs prefirmadas con el SDK de AWS se necesita además el paquete `@aws-sdk/s3-request-presigner`.

---

## 9. Estado del proyecto

| Componente | Estado |
|---|---|
| Docker Compose (api, postgres, redis, minio) | Listo |
| TypeORM, data-source y migraciones | Listo |
| Capa HTTP compartida (respuestas, errores, DTOs, JWT, roles) | Listo |
| Módulo `auth` (register, login, me) | Listo |
| Refresh token rotativo en cookie HTTP-Only | Pendiente |
| Módulos `subjects`, `sections`, `resources`, `assignments` | Pendiente |
| Guards de pertenencia e inscripción | Pendiente |
| Notificaciones con colas Redis | Pendiente |
| Módulo users (sembrado ADMIN y aprobación/cambio de estado PATCH /users/:id/status) | Listo |

> Ajusta esta tabla según el avance real de cada módulo.

## Documentación adicional

- [Bitácora de depuración y resoluciones técnicas](docs/BITACORA.md)

