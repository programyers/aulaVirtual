# Aula Virtual — Cliente Web (Frontend)

Aplicación de Página Única (SPA) construida con React y Vite, diseñada bajo el patrón **Feature-Driven Architecture**. Este cliente consume la API REST del backend para gestionar asignaturas, entregas y recursos de aprendizaje de manera reactiva y segura.

## 1. Tecnologías Principales
* **Core:** React, Vite (módulo 2)[cite: 2].
* **Enrutamiento:** React Router DOM (manejo de SPA y protección de rutas)[cite: 2].
* **Gestión de Estado:** Zustand o React Context (para sesión y notificaciones globales).
* **Consumo de API:** Fetch API / Axios con interceptores para inyección de JWT[cite: 1, 2].

## 2. Arquitectura de Directorios (Feature-Driven)

El código se organiza por dominios de negocio (features), aislando componentes, hooks y servicios, lo que mantiene la simetría con el backend[cite: 1, 3].

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
│   └── assignments/       # Entregas de archivos y vistas de calificación
├── shared/
│   ├── components/        # UI reutilizable (Botones, Inputs, Modales, Loaders)
│   └── utils/             # Formateadores de fecha, conversores de tamaño de archivo
└── App.tsx                # Punto de entrada y proveedor de contextos

Sistema de Rutas y Paneles por Rol (Dashboards)El acceso a la plataforma está estrictamente controlado mediante el componente <RoleGuard />, el cual verifica el rol del usuario en el estado global antes de renderizar la ruta.🛡️ Administrador (/admin/*)/admin/dashboard: Métricas globales de uso de la plataforma./admin/users: Tabla de gestión para activar/desactivar cuentas y aprobar solicitudes de docentes (PENDING_APPROVAL a ACTIVE).   👨‍🏫 Docente (/teacher/*)/teacher/dashboard: Panel con las asignaturas que imparte y alertas de entregas pendientes por evaluar.   /teacher/subjects/new: Formulario de creación de nuevas asignaturas (genera código único).   /teacher/subjects/:id: Constructor del aula. Permite agregar módulos, subir PDFs (hasta 25MB) a S3 y crear tareas evaluables.   /teacher/assignments/:id/grade: Panel de revisión de entregas para asignar calificaciones y retroalimentación.   🎓 Estudiante (/student/*)/student/dashboard: Resumen de cursos inscritos y tareas próximas a vencer.   /student/enroll: Modal interactivo para ingresar el código de inscripción de una nueva asignatura.   /student/subjects/:id: Visor del aula (solo lectura). Permite descargar recursos mediante URLs firmadas y ver tareas pendientes.   /student/assignments/:id/submit: Interfaz de carga para realizar entregas (texto y adjuntos) antes de la fecha límite (due_at).   4. Estrategias de UI/UXCarga y Errores: Todas las vistas implementan estados de carga (skeletons/spinners) y pantallas de error (ej. 404, 403 Sin Acceso).   Archivos: Validaciones en cliente del tamaño máximo (25MB) antes de intentar subir a MinIO para ahorrar ancho de banda.   

## 2. dependencies 
* **npm install
* **npm install axios 
* **npm install react-router-dom