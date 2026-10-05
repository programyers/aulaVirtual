# Aula Virtual — Cliente Web (Frontend)

Aplicación de Página Única (SPA) construida con React y Vite, diseñada bajo el patrón **Feature-Driven Architecture**. Este cliente consume la API REST del backend para gestionar asignaturas, entregas y recursos de aprendizaje de manera reactiva y segura.

---

## 1. Tecnologías Principales

* **Core:** React + Vite, en **JavaScript (JSX)**.
* **Enrutamiento:** React Router DOM (manejo de SPA y protección de rutas).
* **Gestión de Estado:** Zustand o React Context (sesión y notificaciones globales).
* **Consumo de API:** Axios con interceptores para inyección de JWT.
* **Maquetado actual:** JSX plano, estructurado como HTML limpio (etiquetas semánticas y clases CSS simples), sin librería de componentes.

### Decisiones de stack

* **JavaScript en el frontend (por ahora):** el cliente ya tiene un avance considerable en JS, por lo que se mantiene para no frenar el desarrollo. El backend sí está en TypeScript. Una migración a TS puede hacerse de forma gradual más adelante, archivo por archivo, sin reescribir el proyecto.
* **UI diferida:** la librería de componentes **shadcn/ui + Radix UI (con Tailwind CSS)** se incorporará **después de que todos los módulos del frontend estén construidos y probados**. Mientras tanto, el maquetado se mantiene en JSX plano para evitar refactorizaciones intermedias. Cuando llegue el momento, se reemplazarán los elementos HTML por los componentes equivalentes (`Dialog`, `Table`, `Form`, `Skeleton`, `Popover`, etc.) manteniendo intacta la lógica de features, hooks y servicios.

---

## 2. Arquitectura de Directorios (Feature-Driven)

El código se organiza por dominios de negocio (features), aislando componentes, hooks y servicios, lo que mantiene la simetría con el backend.

```text
src/
├── core/
│   ├── api/               # Instancias de cliente HTTP e interceptores de tokens JWT
│   ├── router/            # Configuración de React Router y RoleGuards
│   └── store/             # Estado global (sesión del usuario actual)
├── features/
│   ├── auth/              # Login, registro y hooks de autenticación
│   ├── admin/             # Vistas de gestión de usuarios y aprobación de docentes
│   ├── subjects/          # Tarjetas de cursos, inscripción por código
│   ├── sections/          # Constructor de módulos (CONTENT, LIBRARY, ASSIGNMENT)
│   ├── assignments/       # Entregas de archivos y vistas de calificación
│   └── notifications/     # Campana de avisos e historial
├── shared/
│   ├── components/        # UI reutilizable (Botones, Inputs, Modales, Loaders)
│   └── utils/             # Formateadores de fecha, conversores de tamaño de archivo
└── App.jsx                # Punto de entrada y proveedor de contextos
```

---

## 3. Sistema de Rutas y Paneles por Rol (Dashboards)

El acceso a la plataforma está estrictamente controlado mediante el componente `<RoleGuard />`, el cual verifica el rol del usuario en el estado global antes de renderizar la ruta.

### 🛡️ Administrador (`/admin/*`)

* `/admin/dashboard`: métricas globales de uso de la plataforma.
* `/admin/users`: tabla de gestión para activar/desactivar cuentas y aprobar solicitudes de docentes (`PENDING_APPROVAL` → `ACTIVE`).

### 👨‍🏫 Docente (`/teacher/*`)

* `/teacher/dashboard`: panel con las asignaturas que imparte y alertas de entregas pendientes por evaluar.
* `/teacher/subjects/new`: formulario de creación de nuevas asignaturas (genera código único).
* `/teacher/subjects/:id`: constructor del aula. Permite agregar módulos, subir PDFs (hasta 25 MB) a S3/MinIO y crear tareas evaluables.
* `/teacher/assignments/:id/grade`: panel de revisión de entregas para asignar calificaciones y retroalimentación.

### 🎓 Estudiante (`/student/*`)

* `/student/dashboard`: resumen de cursos inscritos y tareas próximas a vencer.
* `/student/enroll`: modal interactivo para ingresar el código de inscripción de una nueva asignatura.
* `/student/subjects/:id`: visor del aula (solo lectura). Permite descargar recursos mediante URLs firmadas y ver tareas pendientes.
* `/student/assignments/:id/submit`: interfaz de carga para realizar entregas (texto y adjuntos) antes de la fecha límite (`due_at`).

---

## 4. Estrategias de UI/UX

* **Carga y errores:** todas las vistas implementan estados de carga (skeletons/spinners) y pantallas de error (ej. 404, 403 Sin Acceso).
* **Archivos:** validación en cliente del tamaño máximo (25 MB) antes de intentar subir a MinIO, para ahorrar ancho de banda.
* **Estilos (fase actual):** CSS simple sobre JSX plano; el rediseño con shadcn/ui + Radix se aplica en la fase final.

---

## 5. Dependencias

### Instalación base

```bash
npm install
npm install react-router-dom axios zustand
```

### Fase final (después de probar todos los módulos)

```bash
# Tailwind + shadcn/ui (Radix UI se instala por componente)
npx shadcn@latest init

# Opcionales recomendados para formularios y datos del servidor
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-query
```
