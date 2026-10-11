# Aula Virtual — Plataforma de Gestión de Aprendizaje (LMS)

Plataforma web educativa para gestionar asignaturas, estructurar contenidos en secciones flexibles, entregar y calificar actividades, y almacenar recursos de forma segura. El backend sigue **Arquitectura Hexagonal (Puertos y Adaptadores)** y el frontend una **arquitectura orientada a features**.

> Este es el README general del proyecto. Cada repositorio tiene su propia documentación técnica detallada.

## Repositorios

| Parte              | Repositorio                                                                    | Documentación                                                                                       |
| ------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Backend (API REST) | [`aula-virtual-backend`](https://github.com/TU_USUARIO/aula-virtual-backend)   | README + [Bitácora](https://github.com/TU_USUARIO/aula-virtual-backend/blob/main/docs/BITACORA.md)  |
| Frontend (SPA)     | [`aula-virtual-frontend`](https://github.com/TU_USUARIO/aula-virtual-frontend) | README + [Bitácora](https://github.com/TU_USUARIO/aula-virtual-frontend/blob/main/docs/BITACORA.md) |

## Contenido

1. [Visión general y roles](#1-visión-general-y-roles)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Modelo de datos](#4-modelo-de-datos)
5. [Puesta en marcha](#5-puesta-en-marcha)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Migraciones](#7-migraciones)
8. [API y seguridad](#8-api-y-seguridad)
9. [Almacenamiento de archivos](#9-almacenamiento-de-archivos)
10. [Estado del proyecto](#10-estado-del-proyecto)

---

## 1. Visión general y roles

| Rol       | Qué puede hacer                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `ADMIN`   | Aprueba cuentas de docentes, activa/desactiva usuarios y supervisa la plataforma                                 |
| `TEACHER` | Crea asignaturas, organiza secciones libremente (contenido, biblioteca, tareas), crea tareas y califica entregas |
| `STUDENT` | Se inscribe por código, consulta el contenido, descarga recursos y sube entregas                                 |

El usuario `ADMIN` inicial se siembra automáticamente mediante una migración.

**Flujo básico:** un docente se registra (queda en `PENDING_APPROVAL`) → el admin lo aprueba → el docente crea una asignatura con su código de inscripción → los estudiantes se inscriben, consultan secciones y entregan tareas.

---

## 2. Stack tecnológico

| Área                  | Tecnología                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Frontend              | React, Vite, JavaScript (JSX), React Router DOM, Axios, Zustand                           |
| Estilos (planificado) | shadcn/ui + Radix UI + Tailwind CSS, a aplicar tras probar todos los módulos del frontend |
| Backend               | Node.js, Express 5, TypeScript                                                            |
| Base de datos         | PostgreSQL 15 + TypeORM (migraciones versionadas)                                         |
| Almacenamiento        | MinIO (compatible con S3) en local; Cloudflare R2 como destino de despliegue              |
| Caché y colas         | Redis 7.4                                                                                 |
| Seguridad             | JWT, Bcrypt, RBAC                                                                         |
| Validación            | class-validator + class-transformer                                                       |
| Contenedores          | Docker Compose                                                                            |

---

## 3. Arquitectura

```text
                  ┌─────────────────────────┐
                  │   React Frontend (SPA)  │
                  └────────────┬────────────┘
                               │ HTTP / JWT
                               ▼
                  ┌─────────────────────────┐
                  │   Backend REST API      │
                  │   /api/v1               │
                  └──────┬─────┬─────┬──────┘
                         │     │     │
          ┌──────────────┘     │     └──────────────┐
          ▼                    ▼                    ▼
 ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
 │   PostgreSQL    │  │   MinIO (S3)    │  │   Redis         │
 │  (Persistencia) │  │ (Archivos)      │  │ (Colas / avisos)│
 └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Backend (Arquitectura Hexagonal)

Regla estricta de dependencia: el **dominio** no conoce detalles de la base de datos ni del framework web. Cada módulo se divide en:

| Capa              | Responsabilidad                                  |
| ----------------- | ------------------------------------------------ |
| `domain/`         | Interfaces, puertos y reglas de negocio          |
| `application/`    | Casos de uso                                     |
| `infrastructure/` | Adaptadores concretos (TypeORM, Bcrypt, JWT, S3) |
| `presentation/`   | Controladores, DTOs y rutas HTTP                 |

```text
src/
├── index.ts
├── modules/
│   ├── auth/            # Registro, login y perfil
│   ├── users/           # Usuarios, docentes pendientes y activación
│   ├── subjects/        # Asignaturas e inscripciones
│   ├── sections/        # Secciones (CONTENT, LIBRARY, ASSIGNMENT)
│   ├── resources/       # Archivos vía URLs prefirmadas (puerto FileStorage)
│   ├── assignments/     # Tareas, entregas, plazos y evaluaciones
│   └── notifications/   # Productores y consumidores de colas Redis
└── shared/
    └── infrastructure/
        ├── http/        # Middlewares, ApiResponse, enrutador maestro
        └── persistence/ # data-source.ts y migraciones
```

### Frontend (Feature-Driven)

```text
src/
├── core/        # Cliente HTTP, React Router, estado global (Zustand)
├── features/
│   ├── auth/            # Login, registro y guards de rutas
│   ├── admin/           # Aprobación de docentes y gestión de usuarios
│   ├── subjects/        # Listado, creación e inscripción por código
│   ├── sections/        # Constructor y visor de secciones
│   ├── assignments/     # Tareas, entregas y panel de calificación
│   └── notifications/   # Avisos e historial
└── shared/      # Componentes UI reutilizables
```

---

## 4. Modelo de datos

UUIDv4 como clave primaria en todas las tablas. El esquema evoluciona **solo mediante migraciones** (`synchronize: false`).

| Entidad         | Descripción                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `users`         | Cuentas con rol (`ADMIN`, `TEACHER`, `STUDENT`) y estado (`ACTIVE`, `PENDING_APPROVAL`, `DISABLED`) |
| `subjects`      | Asignaturas de un docente, con código único de inscripción                                          |
| `enrollments`   | Inscripción de estudiantes (`ACTIVE`, `DROPPED`); única por estudiante + asignatura                 |
| `sections`      | Secciones flexibles por asignatura, con tipo, posición y estado de publicación                      |
| `resources`     | Metadatos de archivos almacenados en MinIO/S3                                                       |
| `assignments`   | Tareas con fecha límite, puntaje máximo y política de entregas tardías                              |
| `submissions`   | Entregas de estudiantes con puntaje, retroalimentación y estado (`SUBMITTED`, `RETURNED`, `GRADED`) |
| `notifications` | Avisos por usuario con estado de lectura                                                            |

<details>
<summary>Ver esquema SQL de referencia</summary>

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_APPROVAL', 'DISABLED')),
    token_version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DROPPED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_subject UNIQUE (student_id, subject_id)
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CONTENT', 'LIBRARY', 'ASSIGNMENT')),
    position INT NOT NULL DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id),
    file_key VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    due_at TIMESTAMP NOT NULL,
    max_score DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    allow_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    student_id UUID NOT NULL REFERENCES users(id),
    text_content TEXT,
    score DECIMAL(5, 2) NULL,
    feedback TEXT NULL,
    status VARCHAR(20) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'RETURNED', 'GRADED')),
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_assignment_student UNIQUE (assignment_id, student_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_teacher ON subjects(teacher_id);
CREATE INDEX idx_sections_subject ON sections(subject_id);
CREATE INDEX idx_resources_section ON resources(section_id);
CREATE INDEX idx_assignments_section ON assignments(section_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

</details>

---

## 5. Puesta en marcha

### Requisitos

- Docker Engine v24+ y Docker Compose v2+
- Node.js 20+ (solo si ejecutas fuera de Docker)

### Pasos

```bash
# 1. Clonar ambos repositorios
git clone https://github.com/TU_USUARIO/aula-virtual-backend.git
git clone https://github.com/TU_USUARIO/aula-virtual-frontend.git

# 2. Backend: configurar variables y levantar la infraestructura
cd aula-virtual-backend
cp .env.example .env
docker compose up --build -d

# 3. Frontend
cd ../aula-virtual-frontend
cp .env.example .env
npm install
npm run dev
```

```bash
# Comandos útiles del backend
docker compose ps              # Estado de los servicios
docker compose logs -f api     # Logs de la API en vivo
docker compose down            # Apagar los contenedores
```

### Servicios y puertos locales

| Servicio            | URL / Puerto                   |
| ------------------- | ------------------------------ |
| Frontend web        | `http://localhost:5173`        |
| API REST            | `http://localhost:3000/api/v1` |
| PostgreSQL          | `localhost:5432`               |
| Redis               | `localhost:6379`               |
| MinIO (API)         | `localhost:9000`               |
| MinIO (consola web) | `http://localhost:9001`        |

---

## 6. Variables de entorno

Crea un `.env` a partir de `.env.example` en cada repositorio.

**Backend**

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=aula_virtual
# Además: secreto y expiración del JWT, y credenciales de MinIO/Redis
```

> Los valores por defecto son solo para desarrollo local. En producción define siempre credenciales propias.

---

## 7. Migraciones

El esquema solo cambia mediante migraciones versionadas. Se aplican automáticamente al arrancar la API (`AppDataSource.runMigrations()` en `src/index.ts`), incluido el sembrado del ADMIN inicial; también pueden ejecutarse a mano con `npm run migration:run`.

| Script (backend)           | Descripción                                  |
| -------------------------- | -------------------------------------------- |
| `npm run start:dev`        | Desarrollo con recarga en vivo (`tsx watch`) |
| `npm run build`            | Compila a `dist/`                            |
| `npm start`                | Ejecuta la build                             |
| `npm run migration:run`    | Aplica las migraciones pendientes            |
| `npm run migration:revert` | Revierte la última migración                 |

> La CLI de TypeORM se ejecuta con `tsx` porque `typeorm-ts-node-commonjs` falla con Node 20+. Detalles en la bitácora del backend.

---

## 8. API y seguridad

Todas las rutas cuelgan del prefijo `/api/v1` y responden con un contrato JSON homogéneo:

```json
{
  "success": true,
  "message": "Descripción opcional",
  "data": {},
  "errors": []
}
```

**Autenticación y autorización en dos niveles:**

1. **JWT:** `authenticateJWT` valida el token y propaga `id`, `email` y `role`.
2. **RBAC:** `authorizeRoles('ADMIN')` restringe endpoints por rol.

**Controles de recurso:**

- **Pertenencia:** un docente solo edita secciones de asignaturas donde `subject.teacher_id === currentUser.id`.
- **Inscripción:** un estudiante solo descarga archivos o entrega tareas con una inscripción `ACTIVE`.

**Endpoints implementados**

| Método | Ruta                       | Descripción                                                | Protegido      |
| ------ | -------------------------- | ---------------------------------------------------------- | -------------- |
| POST   | `/api/v1/auth/register`    | Registro (estudiante `ACTIVE`, docente `PENDING_APPROVAL`) | No             |
| POST   | `/api/v1/auth/login`       | Inicio de sesión y emisión de token                        | No             |
| GET    | `/api/v1/auth/me`          | Perfil del usuario autenticado                             | Sí             |
| PATCH  | `/api/v1/users/:id/status` | Aprobar o cambiar estado de un usuario                     | Sí (`ADMIN`)   |
| GET    | `/api/v1/users`            | Listar usuarios                                            | Sí (`ADMIN`)   |
| POST   | `/api/v1/subjects`         | Crear asignatura y obtener su código único de 6 caracteres | Sí (`TEACHER`) |
| GET    | `/api/v1/subjects/teacher` | Asignaturas del docente autenticado                        | Sí (`TEACHER`) |
| POST   | `/api/v1/subjects/enroll`  | Inscribirse mediante el código de la asignatura            | Sí (`STUDENT`) |
| GET    | `/api/v1/subjects/student` | Asignaturas del estudiante autenticado                     | Sí (`STUDENT`) |

---

## 9. Almacenamiento de archivos

- Los archivos **no** se guardan en el volumen de la API: viven en el bucket de MinIO (S3).
- Los estudiantes descargan mediante **URLs prefirmadas** con validez de 10 minutos.
- Si el acceso es denegado, la URL nunca se genera (`403 Forbidden`).
- Se desarrolla y prueba en local con MinIO y luego se migra a Cloudflare R2.

---

## 10. Estado del proyecto

| Componente                                                                       | Backend   | Frontend               |
| -------------------------------------------------------------------------------- | --------- | ---------------------- |
| Infraestructura (Docker, Postgres, Redis, MinIO)                                 | Listo     | —                      |
| Capa HTTP compartida / Core (cliente Axios, `authStore`, `RoleGuard`, enrutador) | Listo     | Listo                  |
| Auth (registro, login, perfil)                                                   | Listo     | Login conectado        |
| Users / Admin (aprobación y estado)                                              | Listo     | Listo (maquetado base) |
| Subjects (asignaturas e inscripciones)                                           | Listo     | Listo (maquetado base) |
| Sections                                                                         | Pendiente | Pendiente              |
| Resources (URLs prefirmadas)                                                     | Pendiente | Pendiente              |
| Assignments (tareas, entregas, calificación)                                     | Pendiente | Pendiente              |
| Refresh token rotativo en cookie HTTP-Only                                       | Pendiente | Pendiente              |
| Guards de pertenencia e inscripción                                              | Pendiente | —                      |
| Notificaciones con colas Redis                                                   | Pendiente | Pendiente              |
| Estilos con shadcn/ui + Radix UI + Tailwind CSS                                  | —         | Pendiente              |
| Tablero Kanban de entregas (opcional)                                            | —         | Pendiente              |

---

## Licencia

_Define aquí la licencia del proyecto._
