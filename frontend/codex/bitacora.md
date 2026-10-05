## 02/10/2026 — Inicialización de la Arquitectura Base del Frontend (React + Vite)

### 1. Estructuración del Proyecto (Feature-Driven Architecture)

- **Creación de directorios:** Se organizó la estructura del código bajo `src/` dividida en `core/` (módulos transversales), `features/` (dominios de negocio aislados como `auth`, `admin`, `subjects`, `sections`, `assignments`) y `shared/` (componentes UI e utilidades comunes)[cite: 2, 3].
- **Justificación:** Mantiene simetría con la Arquitectura Hexagonal del backend y garantiza la modularidad[cite: 1, 3], permitiendo escalar el sistema mediante el desarrollo por Rebanadas Verticales (_Vertical Slices_).

### 2. Capa de Red y Seguridad HTTP

- **Cliente Axios e Interceptores (`src/core/api/axios.config.js`):** Configuración del cliente HTTP reutilizable utilizando `import.meta.env.VITE_API_URL` para la URL base[cite: 2].
  - _Interceptor de Peticiones:_ Inyección automática de la cabecera `Authorization: Bearer <token>` cuando existe sesión activa en `localStorage`[cite: 1, 2].
  - _Interceptor de Respuestas:_ Intercepción centralizada de errores `401 Unauthorized` con limpieza automática del almacenamiento local y redirección forzada a la vista de `/login`.
- **Justificación:** Elimina la necesidad de pasar el token manualmente en cada llamada a la API[cite: 2], garantiza la protección del token y desacopla la variable de entorno para evitar exponer URLs fijas (_hardcoding_).

### 3. Estado Global de Autenticación

- **Tienda de Sesión Zustand (`src/core/store/authStore.js`):** Implementación del estado reactivo para manejar `user`, `token` e `isAuthenticated`, con sincronización en tiempo real hacia `localStorage`[cite: 2].
- **Justificación:** Centraliza el ciclo de vida de la sesión de usuario de forma liviana sin necesidad de la complejidad adicional de Redux ni la sobrecarga de re-renders de React Context API.

### 4. Control de Acceso y Enrutamiento SPA

- **Guardia de Seguridad (`src/core/router/RoleGuard.jsx`):** Componente de protección de rutas que valida tres capas antes de renderizar una vista: autenticación activa, estado de la cuenta (`PENDING_APPROVAL` para docentes en revisión) y rol de usuario (`ADMIN`, `TEACHER`, `STUDENT`)[cite: 2].
- **Enrutador Central (`src/core/router/AppRouter.jsx`):** Configuración de `react-router-dom` con rutas públicas (`/login`, `/403`), protegidas por roles y comodín de redirección[cite: 2].
- **Justificación:** Garantiza la seguridad por diseño (_Security by Design_) en la SPA impidiendo que usuarios no autorizados visualicen vistas restringidas sin las credenciales requeridas[cite: 2].

## 03/10/2026 — Integración de la Feature 'Admin' con el Módulo de Usuarios del Backend

### 1. Correspondencia Arquitectónica (Feature-Driven vs DDD)

Se estableció la conexión de datos reales para la administración de usuarios. Aunque en el backend el dominio reside en `modules/users`, en el frontend se integró dentro del módulo funcional **`src/features/admin/`**, respetando la separación de responsabilidades:

- **UI Layer (`src/features/admin/components/`):**
  - `UserManagementTable.jsx`: Componente encargado de renderizar la tabla con la lista de usuarios (Nombre, Email, Rol, Estado y Acciones).
- **State & Logic Layer (`src/features/admin/hooks/`):**
  - `useAdminUsers.js`: Hook personalizado que gestiona el ciclo de vida de la petición (`isLoading`, `error`, `users`), expone la función `refetch` y la acción `changeUserStatus`.
- **Network Service Layer (`src/features/admin/services/`):**
  - `admin.service.js`: Capa de abstracción de red para las llamadas al backend.

### 2. Depuración del Contrato de Red y Rutas

- **Resolución del Error 404:** Se identificó que `admin.service.js` solicitaba `/admin/users` en lugar de `/users`. Como el `apiClient` posee la base `/api/v1`, la petición buscaba `/api/v1/admin/users` la cual no existe en Express.
- **Ajuste de Endpoints:**
  - Lectura de usuarios: Se actualizó a `apiClient.get('/users')`, resolviendo hacia `http://localhost:3000/api/v1/users`.
  - Actualización de estado: Se ajustó a `apiClient.patch('/users/${userId}/status', { status })`.
- **Normalización de Payload:** Se adaptó el parseo de respuestas en `admin.service.js` para extraer el arreglo directamente desde la estructura estandarizada del API `{ message, data: [...] }` mediante `response.data.data`.

### 3. Trazabilidad del Flujo de Datos (Vertical Slice completo)

1. **`UserManagementTable`** ejecuta `useEffect` al montarse[cite: 3].
2. **`useAdminUsers`** invoca `adminService.getUsers()`.
3. **`adminService`** realiza `GET /users` mediante `apiClient` adjuntando el JWT en la cabecera `Authorization`.
4. **Backend Express** valida JWT + Rol `ADMIN` ➔ delega a `UserController` ➔ ejecuta `GetUsersUseCase` ➔ consulta `TypeOrmUserRepository` (PostgreSQL).
5. **Frontend** recibe `200 OK` con el payload de usuarios y actualiza el estado local, poblando automáticamente la tabla en la interfaz gráfica.

## 05/10/2026 — Implementación de la Feature 'Subjects' e Inscripciones (Backend a Frontend)

### 1. Arquitectura del Módulo (`src/features/subjects/`)

Se desarrolló la rebanada vertical (_Vertical Slice_) para el módulo de Asignaturas e Inscripciones respetando el patrón **Feature-Driven Architecture**[cite: 1, 2, 8]:

- **Capa de Red (`src/features/subjects/services/subject.service.js`):** Abstracción de consumo HTTP sobre `apiClient` para consumir los endpoints `/subjects/teacher`, `/subjects`, `/subjects/student` y `/subjects/enroll`[cite: 1].
- **Capa de Lógica y Estado (`src/features/subjects/hooks/`):**
  - `useTeacherSubjects.js`: Hook para consultar las asignaturas impartidas y gestionar la actualización reactiva del estado tras la creación de una nueva asignatura[cite: 1].
  - `useStudentSubjects.js`: Hook para consultar las materias matriculadas e incorporar inmediatamente asignaturas inscritas mediante código único[cite: 1].
- **Capa de UI (`src/features/subjects/components/`):**
  - **Docente:** `CreateSubjectModal.jsx` (modal de registro de materia), `TeacherSubjectCard.jsx` (tarjeta con código de acceso de 6 caracteres y copiado al portapapeles) y `TeacherSubjectList.jsx`[cite: 1].
  - **Estudiante:** `EnrollSubjectModal.jsx` (modal para ingreso del código), `StudentSubjectCard.jsx` (tarjeta del curso matriculado e información del docente) y `StudentSubjectList.jsx`[cite: 1].

### 2. Integración en Dashboards y Enrutador

- **Sustitución de Vistas Temporales (`src/core/router/AppRouter.jsx`):** Se reemplazaron los componentes comodín (`TempTeacherPage`, `TempStudentPage`) vinculando `TeacherDashboard.jsx` y `StudentDashboard.jsx` a las rutas protegidas `/teacher/dashboard` y `/student/dashboard` bajo el control de `RoleGuard`[cite: 1, 2, 8].
- **Depuración en `admin.service.js`:** Se corrigió la ruta de actualización de estado de usuario a `PATCH /users/:id/status`, permitiendo aprobar cuentas docentes desde la interfaz de administración[cite: 1, 8].

### 3. Trazabilidad del Flujo Vertical (End-to-End)

1. **Docente:** Creación de asignatura desde el panel (`/teacher/dashboard`) ➔ generación del código aleatorio único en el backend Express/TypeORM (ej. `DCABLO`) ➔ almacenamiento en PostgreSQL[cite: 1].
2. **Estudiante:** Ingreso del código único desde el panel (`/student/dashboard`) ➔ creación del registro en la tabla `enrollments` del backend ➔ renderizado automático de la asignatura matriculada en la SPA[cite: 1].

### 4. Estrategia de Maquetación Estructural
- **Postergación de Estilos (Radix UI):** Se optó de forma deliberada por mantener la maquetación en HTML/JSX estructural nativo[cite: 7], asegurando la correcta validación funcional del flujo sin incurrir en refactorizaciones de clases CSS previas a la integración de la librería de componentes *headless* **Radix UI**.
