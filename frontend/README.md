# Aula Virtual — Plataforma de Gestión de Aprendizaje (LMS)

Plataforma web educativa orientada a la gestión de asignaturas, estructuración flexible de contenidos por módulos, entrega y calificación de actividades, y almacenamiento seguro de recursos. Diseñada bajo principios de **Arquitectura Hexagonal (DDD)** en el backend y **Feature-Driven Architecture** en el frontend.

---

## 1. Módulos del Sistema y Arquitectura de Software

El proyecto se estructura en capas desacopladas donde cada módulo del backend expone contratos REST consumidos por características independientes en el frontend.

### Frontend (React + Vite)
```text
src/
├── core/                  # Interceptores Axios/Fetch, React Router DOM, Zustand global
├── features/              # Módulos de dominio aislados
│   ├── auth/              # Formularios de Login, Registro y guards de rutas
│   ├── admin/             # Panel de aprobación de docentes y gestión de usuarios
│   ├── subjects/          # Listado, creación e inscripción por código
│   ├── sections/          # Constructor y visor de módulos/niveles dinámicos
│   ├── assignments/       # Creación de tareas, entregas de estudiantes y panel de calificación
│   └── notifications/     # Campana de avisos en tiempo real e historial
└── shared/                # Componentes UI reutilizables (Modales, Subidores de archivos, Tablas)
```

### Backend (Node.js / NestJS — Arquitectura Hexagonal)
```text
src/
├── modules/
│   ├── auth/              # Login, Refresh Tokens rotativos y hashing de contraseñas
│   ├── users/             # Aprobación de cuentas docentes y control de estado
│   ├── subjects/          # Gestión de asignaturas y códigos de inscripción
│   ├── sections/          # Secciones flexibles (CONTENT, LIBRARY, ASSIGNMENT)
│   ├── resources/         # Gestión de archivos mediante URLs firmadas S3/MinIO
│   ├── assignments/       # Lógica de tareas, límites de entregas y evaluaciones
│   └── notifications/     # Procesamiento asíncrono con Redis y colas
└── shared/                # Filtros globales de excepción, middlewares y logger JSON
```

---

## 2. Diagrama de Flujo Técnico e Infraestructura

```text
                       ┌─────────────────────────┐
                       │   React Frontend (SPA)  │
                       └────────────┬────────────┘
                                    │ HTTP / JWT
                                    ▼
                       ┌─────────────────────────┐
                       │   Backend REST API      │
                       └──────┬─────┬─────┬──────┘
                              │     │     │
            ┌─────────────────┘     │     └─────────────────┐
            ▼                       ▼                       ▼
   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
   │   PostgreSQL    │     │   MinIO (S3)    │     │   Redis Queue   │
   │   (Persistencia)│     │ (Almacenamiento)│     │ (Notificaciones)│
   └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 3. Modelo de Datos y Esquema Relacional (PostgreSQL)

El sistema utiliza UUIDv4 como clave primaria en todas las tablas y desabilita la sincronización automática en favor de migraciones versionadas.

```sql
-- Tabla de Usuarios
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

-- Tabla de Asignaturas
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Inscripciones de Estudiantes
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DROPPED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_subject UNIQUE (student_id, subject_id)
);

-- Tabla de Secciones / Módulos Flexibles
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

-- Tabla de Recursos de Archivo
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES sections(id),
    file_key VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tareas
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

-- Tabla de Entregas de Estudiantes
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

-- Tabla de Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento
CREATE INDEX idx_subjects_teacher ON subjects(teacher_id);
CREATE INDEX idx_sections_subject ON sections(subject_id);
CREATE INDEX idx_resources_section ON resources(section_id);
CREATE INDEX idx_assignments_section ON assignments(section_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

---

## 4. Despliegue Local con Docker Compose

Toda la infraestructura local (PostgreSQL, MinIO, Redis y servicios de aplicación) se ejecuta de forma orquestada.

### Requisitos Previos
* Docker Engine v24+
* Docker Compose v2+

### Pasos de Ejecución

1. **Clonar el repositorio y configurar variables de entorno:**
   ```bash
   git clone [https://github.com/usuario/aula-virtual.git](https://github.com/usuario/aula-virtual.git)
   cd aula-virtual
   cp .env.example .env
   ```

2. **Levantar el entorno completo:**
   ```bash
   docker compose up --build -d
   ```

3. **Verificar estado de los servicios:**
   ```bash
   docker compose ps
   ```

### Puertos de Servicios Locales
* **Frontend Web:** `http://localhost:5173`
* **API REST Backend:** `http://localhost:3000/api/v1`
* **Swagger Docs:** `http://localhost:3000/api/docs`
* **MinIO Console:** `http://localhost:9001` (Credenciales en `.env`)
* **PostgreSQL:** `localhost:5432`

---

## 5. Estrategia de Migraciones de Base de Datos

Las modificaciones al esquema de base de datos se gestionan exclusivamente mediante archivos de migración versionados ubicados en `backend/src/infrastructure/persistence/migrations`.

* **Crear nueva migración:**
  ```bash
  npm run migration:create --name=AñadirTablaQuizzes
  ```
* **Ejecutar migraciones manualmente:**
  ```bash
  npm run migration:run
  ```
* **Revertir última migración:**
  ```bash
  npm run migration:revert
  ```

> **Nota de despliegue:** Al ejecutar `docker compose up`, el servicio `api` invoca automáticamente `npm run migration:run` una vez confirmada la disponibilidad de PostgreSQL mediante el *healthcheck*.