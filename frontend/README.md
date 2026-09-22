# Taskly

Aplicación de gestión de proyectos y tareas colaborativa, con tableros Kanban,
workspaces, actividad y notificaciones. El backend está construido con NestJS,
PostgreSQL y Prisma; el frontend usa React, TypeScript, Vite y TanStack.

La documentación detallada del backend se encuentra en
[`backend/README.md`](./backend/README.md).

## Estado actual

- Backend: implementado hasta la fase 6 (activity log y notificaciones).
- Backend pendiente: fase 7 de tiempo real con WebSockets/Redis.
- Frontend: F0 completada y F1 iniciada con React, TanStack Router, TanStack Query,
  TanStack Form, Zustand, Axios y Tailwind CSS.
- Frontend pendiente: integración REST completa, layout de aplicación,
  workspaces, boards Kanban, tareas, actividad y notificaciones.

## Objetivo del frontend

Construir una interfaz responsive, rápida y consistente que permita:

1. Crear una cuenta, iniciar sesión y mantener la sesión activa.
2. Navegar entre workspaces y sus boards.
3. Visualizar y gestionar un board Kanban.
4. Crear, editar, mover, asignar y etiquetar tareas.
5. Consultar comentarios, checklists, adjuntos y actividad.
6. Leer y marcar notificaciones.
7. Dejar preparada la capa de tiempo real para cuando el backend complete la
   fase 7.

## Plan de desarrollo del frontend

### Fase F0 — Decisiones y fundación visual

- [x] Definir tokens de color, tipografía, espaciado, bordes, sombras y estados.
- [x] Crear la estructura base de carpetas y convenciones de nombres.
- [x] Configurar un layout público y un layout autenticado.
- [x] Crear componentes UI base: `Button`, `Input`, `Textarea`, `Dialog`,
      `Dropdown`, `Badge`, `Avatar`, `Skeleton`, `EmptyState` y `Toast`.
- [x] Eliminar las vistas de ejemplo de Vite/TanStack.
- [x] Definir el estado visual oscuro azul.

**Resultado:** una shell navegable, visualmente consistente y lista para conectar
datos reales.

### Fase F1 — Cliente API y autenticación

- [x] Crear un cliente HTTP centralizado usando Axios.
- [x] Definir `VITE_API_URL` y la configuración de entornos.
- [x] Centralizar tipos TypeScript de respuestas y payloads del backend.
- [x] Implementar almacenamiento de `accessToken` y `refreshToken`.
- [x] Implementar refresh automático ante respuestas `401`, con protección
      contra múltiples refresh simultáneos.
- [x] Crear store de sesión con Zustand.
- [x] Crear rutas y pantallas de login, registro y estados de error.
- [x] Proteger el dashboard y redirigir sin sesión.
- [x] Implementar logout y limpieza de sesión en el store.
- [x] Integrar `GET /users/me` en el arranque autenticado.

**Resultado:** un usuario puede registrarse, iniciar sesión, refrescar su token
y entrar de forma segura a la aplicación.

### Fase F2 — App shell y workspaces

- [x] Crear sidebar, header, breadcrumbs y navegación responsive.
- [x] Consultar y seleccionar workspaces con `GET /workspaces`.
- [x] Crear y editar workspaces según el rol del usuario.
- [x] Listar boards de un workspace.
- [x] Crear, editar y archivar boards respetando permisos.
- [x] Añadir estados de carga, error, vacío y reintento.
- [x] Sincronizar datos remotos con TanStack Query e invalidaciones explícitas.

**Resultado:** el usuario puede navegar por su organización y abrir un board.

### Fase F3 — Board Kanban

- [x] Consultar el detalle del board con columnas y tareas.
- [x] Construir columnas y tarjetas con estados visuales por prioridad.
- [x] Crear, editar y eliminar columnas.
- [x] Crear tareas desde cada columna.
- [x] Implementar drag and drop de tareas entre columnas y dentro de una columna.
- [x] Enviar `beforeId`, `afterId` y/o `columnId` según el contrato de
      `PATCH /tasks/:id/move`.
- [x] Actualizar optimistamente la interfaz y revertir si la API falla.
- [x] Implementar filtros por prioridad y búsqueda. Los filtros por asignado y
      etiqueta quedan preparados para la gestión de miembros y etiquetas.
- [x] Añadir vista responsive y comportamiento para overflow horizontal.

**Resultado:** el flujo principal de Taskly funciona como un tablero Kanban real.

### Fase F4 — Detalle y edición de tareas

- [x] Crear panel o modal de detalle de tarea.
- [x] Editar título, descripción, prioridad y fecha límite.
- [x] Gestionar asignados y etiquetas desde el detalle de tarea.
- [x] Mostrar y crear comentarios; editar/eliminar cuando corresponda.
- [x] Mostrar checklists y permitir crear listas, ítems y toggles.
- [x] Mostrar adjuntos registrados por el backend.
- [x] Reutilizar formularios y validación en creación y edición.

**Resultado:** una tarea puede gestionarse sin abandonar el contexto del board.

### Fase F5 — Actividad, notificaciones y miembros

- [x] Crear feed de actividad para tarea y dejar hooks preparados para workspace y board.
- [x] Convertir `ActivityAction` en textos legibles.
- [x] Crear centro de notificaciones con contador de no leídas.
- [x] Marcar notificaciones individualmente y todas como leídas.
- [x] Navegar desde una notificación hacia la tarea relacionada.
- [x] Crear gestión de miembros, roles e invitaciones desde `/workspaces`.
- [x] Ocultar o deshabilitar acciones según `WorkspaceRole` y permisos efectivos disponibles.
      La pantalla del board usa el rol de workspace; los overrides específicos de
      `BoardRole` aún requieren que el backend exponga ese rol en la respuesta.

**Resultado:** colaboración, auditoría y permisos son visibles en la interfaz.

### Fase F6 — Calidad y preparación para tiempo real

- [ ] Añadir pruebas unitarias para stores, transformadores y utilidades.
- [ ] Añadir pruebas de componentes para auth, board y formularios críticos.
- [ ] Añadir pruebas end-to-end del flujo login → workspace → board → tarea.
- [ ] Revisar accesibilidad: teclado, foco, labels, contraste y diálogos.
- [ ] Revisar responsive, performance y estados de error.
- [ ] Preparar una capa `realtime/` con eventos tipados.
- [ ] Integrar `socket.io-client` únicamente cuando el backend complete la fase 7.

**Resultado:** frontend mantenible, verificable y preparado para colaboración
en tiempo real.

## Arquitectura propuesta

La aplicación se organizará por responsabilidad y dominio:

```text
frontend/src/
├── app/                 # providers, router, configuración global
├── routes/              # páginas y loaders de TanStack Router
├── features/
│   ├── auth/
│   ├── workspaces/
│   ├── boards/
│   ├── tasks/
│   ├── activity/
│   ├── notifications/
│   └── members/
├── components/
│   ├── ui/              # primitives reutilizables
│   └── layout/          # sidebar, header, navegación
├── lib/
│   ├── api/             # cliente HTTP, endpoints y tipos
│   ├── auth/
│   └── query/
├── stores/              # estado local/global de UI y sesión
├── hooks/
├── types/
└── utils/
```

TanStack Query será la fuente de verdad para datos del servidor. Zustand se
reservará para sesión y estado efímero de interfaz; no se duplicarán en Zustand
las listas de workspaces, boards o tareas que ya administra Query.

## Sistema visual inicial

La dirección visual será una interfaz oscura y sobria, con fondos azul marino,
superficies elevadas y azul brillante para acciones y estados de foco.

| Token        | Color     | Uso                                 |
| ------------ | --------- | ----------------------------------- |
| `brand-600`  | `#2563EB` | Acciones primarias |
| `brand-500`  | `#3B82F6` | Hover y foco |
| `brand-100`  | `#172554` | Selección y fondos suaves |
| `background` | `#07111F` | Fondo principal |
| `surface`    | `#0D1B2A` | Cards y paneles |
| `surface-muted` | `#13263B` | Sidebar e inputs |
| `foreground` | `#E6F0FF` | Texto principal |
| `muted`      | `#8EA4BF` | Texto secundario |
| `border`     | `#1F3A56` | Separadores |
| `success`    | `#22C55E` | Completado |
| `warning`    | `#F59E0B` | Advertencias |
| `danger`     | `#F87171` | Errores y acciones destructivas |

Las prioridades de tareas usarán una semántica separada:

- `low`: azul/gris.
- `medium`: amarillo.
- `high`: naranja.
- `urgent`: rojo.

Se debe validar contraste WCAG AA durante F0. Este tema oscuro es el modo
principal de la primera entrega y los componentes deben usar tokens semánticos.

## Librerías y decisiones técnicas

### Ya instaladas y aprobadas

| Librería           | Responsabilidad                                 |
| ------------------ | ----------------------------------------------- |
| React + TypeScript | UI y tipado                                     |
| Vite               | Desarrollo y build                              |
| Tailwind CSS       | Estilos y tokens visuales                       |
| TanStack Router    | Rutas, layouts y protección de navegación       |
| TanStack Query     | Cache, mutations, loading y sincronización REST |
| Axios              | Peticiones HTTP e interceptores                 |
| Zustand            | Sesión y estado local de interfaz               |

### Necesarias para el producto

| Librería                              | Motivo                                              |
| ------------------------------------- | --------------------------------------------------- |
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag and drop accesible para columnas/tareas Kanban |
| `TanStack Form`                       | Formularios eficientes y composables                |
| `zod`                                 | Validación de formularios y contratos en runtime    |
| `lucide-react`                        | Iconos consistentes sin crear un sistema propio     |
| `date-fns`                            | Formateo y comparación de fechas de vencimiento     |
| `sonner`                              | Toasts de éxito/error no intrusivos                 |
| `clsx` + `tailwind-merge`             | Composición segura de clases Tailwind               |

### Necesarias más adelante

| Librería                   | Cuándo usarla                                 |
| -------------------------- | --------------------------------------------- |
| `socket.io-client`         | Al implementar la fase 7 del backend          |
| `vitest` + Testing Library | Pruebas unitarias y de componentes            |
| `playwright`               | Flujos end-to-end en CI o antes de producción |

## Contrato de integración con el backend

- Base URL configurable mediante `VITE_API_URL`.
- Access token en `Authorization: Bearer <token>`.
- `POST /auth/refresh` con `{ refreshToken }`; el backend rota ambos tokens.
- `POST /auth/logout` con `{ refreshToken }`.
- Las respuestas y errores se normalizarán en `lib/api`, no en cada componente.
- Los errores `401`, `403`, `404` y `422/400` tendrán mensajes y UX distintos.
- Los roles se reflejarán en la interfaz, pero la autorización real siempre
  seguirá siendo responsabilidad del backend.
- El frontend consumirá primero REST; WebSockets se incorporará sin acoplarlo a
  los componentes mediante una capa de eventos/invalidation.

## Orden recomendado para comenzar

1. F0: tokens visuales, componentes UI base y layout.
2. F1: cliente API, sesión, login y registro.
3. F2: app shell, workspaces y boards.
4. F3: board Kanban con creación y movimiento de tareas.
5. F4: detalle completo de tareas.
6. F5: actividad, notificaciones, miembros y permisos visuales.
7. F6: pruebas, accesibilidad, performance y tiempo real.
