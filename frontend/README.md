# Aula Virtual — Frontend (React + Vite)

SPA del **Aula Virtual**, construida con React + Vite y una **Feature-Driven Architecture**. Consume la API REST del backend (Node.js + Express + TypeScript, Arquitectura Hexagonal) bajo el prefijo `/api/v1`.

> Este repositorio es el cliente web del proyecto **Aula Virtual**. Visión general: [README general](https://github.com/TU_USUARIO/aula-virtual) · API: [aula-virtual-backend](https://github.com/TU_USUARIO/aula-virtual-backend).

## Contenido

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Arquitectura](#2-arquitectura)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Capa de red y seguridad HTTP](#4-capa-de-red-y-seguridad-http)
5. [Autenticación y control de acceso](#5-autenticación-y-control-de-acceso)
6. [Features implementadas](#6-features-implementadas)
7. [Puesta en marcha](#7-puesta-en-marcha)
8. [Decisiones de diseño](#8-decisiones-de-diseño)
9. [Estado del proyecto](#9-estado-del-proyecto)

---

## 1. Stack tecnológico

| Área                             | Tecnología                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------- |
| UI                               | React                                                                             |
| Bundler / servidor de desarrollo | Vite                                                                              |
| Lenguaje                         | JavaScript (JSX)                                                                  |
| Enrutamiento                     | React Router DOM                                                                  |
| Cliente HTTP                     | Axios (con interceptores)                                                         |
| Estado global                    | Zustand                                                                           |
| Estilos (planificado)            | shadcn/ui + Radix UI + Tailwind CSS, a aplicar una vez probados todos los módulos |

---

## 2. Arquitectura

El código se organiza por **features** (dominios de negocio aislados) y se desarrolla mediante **rebanadas verticales** (_Vertical Slices_): cada feature incluye su UI, su lógica y su acceso a red. Esto mantiene simetría con la Arquitectura Hexagonal del backend y permite escalar el sistema de forma modular.

Cada feature se divide en tres capas:

| Capa             | Carpeta       | Responsabilidad                                 |
| ---------------- | ------------- | ----------------------------------------------- |
| UI               | `components/` | Componentes de presentación                     |
| Estado y lógica  | `hooks/`      | Hooks personalizados (carga, errores, acciones) |
| Servicios de red | `services/`   | Llamadas al backend sobre `apiClient`           |

Correspondencia con el backend: el dominio `modules/users` del backend se integra en el frontend dentro de `features/admin/`.

---

## 3. Estructura del proyecto

```text
src/
├── core/                       # Módulos transversales
│   ├── api/
│   │   └── axios.config.js     # apiClient + interceptores
│   ├── store/
│   │   └── authStore.js        # Sesión (Zustand)
│   └── router/
│       ├── AppRouter.jsx       # Enrutador central
│       └── RoleGuard.jsx       # Guardia de rutas por autenticación, estado y rol
├── features/                   # Dominios de negocio aislados
│   ├── auth/                   # Login y acceso (guards en core/router)
│   ├── admin/                  # Gestión de usuarios y aprobación de docentes
│   │   ├── components/         # UserManagementTable.jsx
│   │   ├── hooks/              # useAdminUsers.js
│   │   └── services/           # admin.service.js
│   ├── subjects/               # Asignaturas e inscripción por código
│   │   ├── components/         # Modales, tarjetas y listas (docente / estudiante)
│   │   ├── hooks/              # useTeacherSubjects.js, useStudentSubjects.js
│   │   └── services/           # subject.service.js
│   ├── sections/               # (pendiente) Constructor y visor de secciones
│   ├── assignments/            # (pendiente) Tareas, entregas y calificación
│   └── notifications/          # (pendiente) Avisos e historial
└── shared/                     # Componentes UI y utilidades reutilizables
```

---

## 4. Capa de red y seguridad HTTP

El cliente HTTP vive en `src/core/api/axios.config.js` y es reutilizable en todas las features.

- **URL base:** se lee de `import.meta.env.VITE_API_URL`, sin URLs fijas en el código (_hardcoding_). El `apiClient` apunta a la base `/api/v1`, por lo que los servicios usan rutas relativas (por ejemplo `apiClient.get('/users')`).
- **Interceptor de peticiones:** inyecta automáticamente `Authorization: Bearer <token>` cuando existe sesión activa en `localStorage`.
- **Interceptor de respuestas:** captura de forma centralizada los errores `401 Unauthorized`, limpia el almacenamiento local y redirige a `/login`.
- **Formato de respuesta:** los servicios extraen los datos de la estructura estandarizada del API `{ message, data }` mediante `response.data.data`.

---

## 5. Autenticación y control de acceso

### Estado de sesión (`authStore`)

Tienda Zustand con `user`, `token` e `isAuthenticated`, sincronizada en tiempo real con `localStorage`. Al iniciar sesión guarda los datos que devuelve `POST /auth/login` (`id`, `email`, `fullName`, `role`, `status`).

### Guardia de rutas (`RoleGuard`)

Valida tres capas antes de renderizar una vista:

1. Autenticación activa.
2. Estado de la cuenta (`PENDING_APPROVAL` para docentes en revisión).
3. Rol del usuario (`ADMIN`, `TEACHER`, `STUDENT`).

### Enrutador (`AppRouter`)

| Ruta                    | Acceso                      | Vista                 |
| ----------------------- | --------------------------- | --------------------- |
| `/login`                | Pública                     | Inicio de sesión      |
| `/403`                  | Pública                     | Acceso denegado       |
| `/teacher/dashboard`    | `TEACHER` (vía `RoleGuard`) | `TeacherDashboard`    |
| `/student/dashboard`    | `STUDENT` (vía `RoleGuard`) | `StudentDashboard`    |
| Panel de administración | `ADMIN` (vía `RoleGuard`)   | Gestión de usuarios   |
| `*`                     | —                           | Redirección (comodín) |

---

## 6. Features implementadas

### Admin (`src/features/admin/`)

Gestión de usuarios y aprobación de cuentas docentes.

**Flujo de datos (rebanada vertical completa):**

1. `UserManagementTable` ejecuta `useEffect` al montarse.
2. `useAdminUsers` invoca `adminService.getUsers()` (expone `isLoading`, `error`, `users`, `refetch` y `changeUserStatus`).
3. `adminService` realiza `GET /users` mediante `apiClient`, adjuntando el JWT.
4. El backend valida JWT + rol `ADMIN` y responde con los usuarios.
5. El frontend actualiza el estado local y puebla la tabla.

### Subjects (`src/features/subjects/`)

Asignaturas e inscripciones.

- **Docente:** crea asignaturas con `CreateSubjectModal`; cada `TeacherSubjectCard` muestra el código de acceso de 6 caracteres con copiado al portapapeles.
- **Estudiante:** se inscribe con `EnrollSubjectModal` ingresando el código; `StudentSubjectCard` muestra el curso y la información del docente.
- Los hooks `useTeacherSubjects` y `useStudentSubjects` actualizan el estado de forma reactiva tras crear o inscribir.

### Endpoints consumidos

| Feature               | Método     | Endpoint (relativo a `/api/v1`)          |
| --------------------- | ---------- | ---------------------------------------- |
| Auth                  | POST       | `/auth/login`                            |
| Admin                 | GET        | `/users`                                 |
| Admin                 | PATCH      | `/users/:id/status`                      |
| Subjects (docente)    | POST / GET | `/subjects` · `/subjects/teacher`        |
| Subjects (estudiante) | POST / GET | `/subjects/enroll` · `/subjects/student` |

---

## 7. Puesta en marcha

### Requisitos

- Node.js 20+
- API del backend en ejecución (ver el [repositorio del backend](https://github.com/TU_USUARIO/aula-virtual-backend))

### Pasos

```bash
cp .env.example .env
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Scripts

| Script            | Descripción                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Servidor de desarrollo de Vite |
| `npm run build`   | Compilación para producción    |
| `npm run preview` | Vista previa de la compilación |

---

## 8. Decisiones de diseño

- **Feature-Driven + Vertical Slices:** simetría con el backend hexagonal y modularidad para escalar.
- **Zustand para la sesión:** estado liviano, sin la complejidad de Redux ni la sobrecarga de re-renders de React Context.
- **Axios con interceptores y `VITE_API_URL`:** el token se adjunta solo, los `401` se manejan en un único lugar y no hay URLs fijas en el código.
- **Seguridad por diseño:** `RoleGuard` impide que usuarios no autorizados vean vistas restringidas.
- **Maquetación estructural primero:** se mantiene JSX/HTML nativo para validar el flujo funcional sin refactorizar clases CSS; shadcn/ui (Radix UI + Tailwind CSS) se aplicará cuando todos los módulos estén probados.
- **Desarrollo módulo a módulo:** cada módulo se construye primero en el backend y luego se conecta en el frontend.

---

## 9. Estado del proyecto

| Componente                                                                | Estado                 |
| ------------------------------------------------------------------------- | ---------------------- |
| Core: cliente Axios, interceptores, `authStore`, `RoleGuard`, `AppRouter` | Listo                  |
| Auth: login (`/login`)                                                    | Listo                  |
| Admin: gestión de usuarios y aprobación de docentes                       | Listo (maquetado base) |
| Subjects: asignaturas e inscripción por código                            | Listo (maquetado base) |
| Estilos con shadcn/ui + Radix UI + Tailwind CSS                           | Pendiente              |
| Sections, Assignments, Notifications                                      | Pendiente              |

## Documentación adicional

- [Bitácora de desarrollo del frontend](docs/BITACORA.md)
