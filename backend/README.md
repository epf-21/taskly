# Taskly

API REST + WebSockets para **Taskly**, una herramienta de gestión de proyectos y tareas colaborativa estilo Linear/Trello, construida con NestJS, PostgreSQL, Prisma y React.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Estado de implementación](#estado-de-implementación)
- [Módulos y funcionalidades](#módulos-y-funcionalidades)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Sistema de roles y permisos](#sistema-de-roles-y-permisos)
- [Base de datos](#base-de-datos)
- [Buenas prácticas aplicadas](#buenas-prácticas-aplicadas)
- [Endpoints principales](#endpoints-principales)

---

## Descripción general

Taskly es una plataforma de gestión de proyectos que permite a equipos organizar su trabajo en tableros Kanban con colaboración en tiempo real. La arquitectura del backend está pensada para ser modular, mantenible y defendible.

**Características principales:**

- Workspaces (organizaciones) con múltiples boards por workspace
- Tableros Kanban con columnas y tarjetas movibles mediante drag & drop
- Colaboración en tiempo real vía WebSockets (Socket.io)
- Sistema de roles y permisos en dos niveles (workspace y board)
- Historial de actividad y auditoría de acciones
- Notificaciones en tiempo real
- Autenticación JWT con refresh tokens rotables y revocación por sesión

---

## Stack tecnológico

| Capa              | Tecnología                          | Versión |
| ----------------- | ----------------------------------- | ------- |
| Framework         | NestJS                              | 11.1.27 |
| Lenguaje          | TypeScript                          | 5.9.3   |
| ORM               | Prisma                              | 7.8     |
| Base de datos     | PostgreSQL                          | 15      |
| Autenticación     | JWT (access + refresh)              | —       |
| Validación        | class-validator / class-transformer | —       |
| Tiempo real       | Socket.io (@nestjs/websockets)      | —       |
| Cache / pub-sub   | Redis (fase WebSockets)             | —       |
| Hashing passwords | bcrypt                              | —       |
| Contenedores      | Docker + Docker Compose             | —       |

---

## Arquitectura

Se sigue una **arquitectura modular por dominio** (Feature Modules), que es el patrón estándar recomendado por NestJS para proyectos de escala media/grande.

### Principios que guían la arquitectura

**1. Un módulo = un dominio de negocio**
No hay carpetas globales de `controllers/` o `services/` con todo mezclado. Cada módulo (`auth`, `users`, `workspaces`, `boards`, `tasks`, etc.) es autocontenido: tiene su propio controller, service, DTOs y guards. Exporta solo lo que otros módulos necesitan.

**2. Separación en capas dentro de cada módulo**

```
Controller  →  valida el request (DTOs, guards), delega al service
Service     →  lógica de negocio pura, orquesta acciones
Repository  →  encapsula las queries de Prisma
```

**3. Infraestructura transversal en `common/`**
Guards, interceptors, decorators y filtros que se reutilizan entre módulos viven en `common/`, separados del código de dominio. No dependen de ningún módulo de negocio específico.

**4. Utilidades puras en `shared/`**
Enums, tipos e interfaces sin lógica de framework (no dependen de NestJS).

**5. Sub-módulos anidados para sub-dominios**
`tasks/comments/`, `tasks/checklists/` y `workspaces/members/` viven dentro de su módulo padre porque no tienen sentido sin él. Esto evita una carpeta plana con 20 módulos al mismo nivel.

**6. Módulos globales solo para infraestructura**
`PrismaModule` y `ConfigModule` son `@Global()`. Los módulos de dominio nunca son globales — se importan explícitamente donde se necesitan, lo que hace transparentes las dependencias.

**7. Comunicación entre módulos vía EventEmitter**
El módulo `realtime` (WebSockets) no depende directamente de `tasks` o `boards`. En su lugar, los services emiten eventos de dominio con `EventEmitter2` y el gateway de sockets los escucha y los retransmite.

---

## Estructura de carpetas

```
taskly-backend/
├── src/
│   ├── main.ts                           # bootstrap
│   ├── app.module.ts                     # módulo raíz
│   │
│   ├── config/
│   │   ├── env.validation.ts             # esquema Joi: falla en arranque si falta una variable de entorno
│   │   └── app.config.ts                 # configs namespaceados (app, jwt, database, redis)
│   │
│   ├── common/                           # infraestructura de Nest reutilizable
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── workspace-roles.guard.ts
│   │   │   └── board-roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response-transform.interceptor.ts
│   │   │   └── logging.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── parse-uuid.pipe.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   └── interfaces/
│   │       └── authenticated-request.interface.ts
│   │
│   ├── database/
│   │   ├── prisma.module.ts              # @Global(), exporta PrismaService
│   │   └── prisma.service.ts             # PrismaClient con ciclo de vida de Nest
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.interface.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.mapper.ts
│   │   │   ├── users.repository.ts
│   │   │   ├── users.interface.ts
│   │   │   └── dto/
│   │   │       ├── update-user.dto.ts
│   │   │       ├── create-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   │
│   │   ├── workspaces/
│   │   │   ├── workspaces.module.ts
│   │   │   ├── workspaces.controller.ts
│   │   │   ├── workspaces.service.ts
│   │   │   ├── workspaces.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-workspace.dto.ts
│   │   │   │   └── update-workspace.dto.ts
│   │   │   ├── members/
│   │   │   │   ├── members.controller.ts
│   │   │   │   ├── members.service.ts
│   │   │   │   └── dto/update-member-role.dto.ts
│   │   │   └── invitations/
│   │   │       ├── invitations.controller.ts
│   │   │       ├── invitations.service.ts
│   │   │       └── dto/create-invitation.dto.ts
│   │   │
│   │   ├── boards/
│   │   │   ├── boards.module.ts
│   │   │   ├── boards.controller.ts
│   │   │   ├── boards.service.ts
│   │   │   ├── boards.repository.ts
│   │   │   └── dto/
│   │   │       ├── create-board.dto.ts
│   │   │       └── update-board.dto.ts
│   │   │
│   │   ├── columns/
│   │   │   ├── columns.module.ts
│   │   │   ├── columns.controller.ts
│   │   │   ├── columns.service.ts
│   │   │   └── dto/
│   │   │       ├── create-column.dto.ts
│   │   │       └── reorder-column.dto.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── tasks.module.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-task.dto.ts
│   │   │   │   ├── update-task.dto.ts
│   │   │   │   ├── move-task.dto.ts
│   │   │   │   └── filter-tasks.dto.ts
│   │   │   ├── checklists/
│   │   │   │   ├── checklists.controller.ts
│   │   │   │   ├── checklists.service.ts
│   │   │   │   └── dto/create-checklist-item.dto.ts
│   │   │   ├── comments/
│   │   │   │   ├── comments.controller.ts
│   │   │   │   ├── comments.service.ts
│   │   │   │   └── dto/create-comment.dto.ts
│   │   │   └── attachments/
│   │   │       ├── attachments.controller.ts
│   │   │       ├── attachments.service.ts
│   │   │       └── dto/create-attachment.dto.ts
│   │   │
│   │   ├── labels/
│   │   │   ├── labels.module.ts
│   │   │   ├── labels.controller.ts
│   │   │   ├── labels.service.ts
│   │   │   └── dto/create-label.dto.ts
│   │   │
│   │   ├── activity/
│   │   │   ├── activity.module.ts
│   │   │   ├── activity.controller.ts
│   │   │   ├── activity.service.ts
│   │   │   └── dto/activity-filter.dto.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── dto/notification-response.dto.ts
│   │   │
│   │   └── realtime/
│   │       ├── realtime.module.ts
│   │       ├── realtime.gateway.ts
│   │       ├── presence.service.ts
│   │       └── events/
│   │           ├── task-moved.event.ts
│   │           └── board-presence.event.ts
│   │
│   └── shared/
│       ├── enums/
│       │   ├── workspace-role.enum.ts
│       │   ├── board-role.enum.ts
│       │   └── task-priority.enum.ts
│       └── utils/
│           └── fractional-index.util.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── test/
│   ├── unit/
│   └── e2e/
│
├── .env
├── .env.example
├── .eslintrc.mjs
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

| Variable                 | Descripción                                   | Requerida                   |
| ------------------------ | --------------------------------------------- | --------------------------- |
| `NODE_ENV`               | `development` / `production` / `test`         | No (default: `development`) |
| `PORT`                   | Puerto del servidor                           | No (default: `3000`)        |
| `FRONTEND_URL`           | URL del frontend, para CORS                   | Sí                          |
| `DATABASE_URL`           | Connection string de PostgreSQL               | Sí                          |
| `JWT_ACCESS_SECRET`      | Secret del access token (mín. 32 chars)       | Sí                          |
| `JWT_ACCESS_EXPIRES_IN`  | Expiración del access token                   | No (default: `15m`)         |
| `JWT_REFRESH_SECRET`     | Secret del refresh token (distinto al access) | Sí                          |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token                  | No (default: `7d`)          |
| `BCRYPT_SALT_ROUNDS`     | Rondas de hashing para passwords              | No (default: `10`)          |
| `REDIS_URL`              | URL de Redis (fase WebSockets)                | No                          |

Generar secrets seguros:

```bash
openssl rand -base64 48
```

---

## Instalación y puesta en marcha

### Prerrequisitos

- Node.js 22+
- Docker y Docker Compose

### 1. Instalar dependencias

```bash
bun install
```

### 2. Levantar la base de datos

```bash
docker compose up -d
```

### 3. Ejecutar migraciones

```bash
bunx prisma migrate dev
```

### 4. Iniciar el servidor

```bash
# desarrollo (hot reload)
bun run start:dev

# producción
bun run build && bun run start:prod
```

### Scripts disponibles

| Comando               | Descripción                                |
| --------------------- | ------------------------------------------ |
| `bun run start:dev`   | Servidor en modo desarrollo con hot reload |
| `bun run build`       | Compilar TypeScript a dist/                |
| `bun run lint`        | Ejecutar ESLint con autofix                |
| `bun run format`      | Formatear código con Prettier              |
| `bun run test`        | Tests unitarios                            |
| `bunx prisma studio`  | Explorador visual de la base de datos      |
| `bunx prisma db seed` | Sembrar datos de desarrollo                |

---

## Estado de implementación

### Fase 0 — Setup

- [x] Proyecto NestJS con TypeScript
- [x] Validación de variables de entorno con Joi (fail-fast al arrancar)
- [x] Configuraciones namespaceadas (`app`, `jwt`, `database`, `redis`)
- [x] PrismaModule global con ciclo de vida manejado por Nest
- [x] `cleanDatabase()` en PrismaService (para tests e2e)
- [x] Seed de datos de desarrollo
- [x] ESLint (flat config) + Prettier configurados
- [x] `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`

### Fase 1 — Autenticación

- [x] Registro con hash de password (bcrypt)
- [x] Login con credenciales
- [x] JWT: access token (15m) + refresh token (7d)
- [x] Almacenamiento de refresh tokens hasheados en DB
- [x] Rotación de refresh tokens en cada uso
- [x] Revocación de sesión individual (logout)
- [x] `JwtStrategy` + `JwtRefreshStrategy` (Passport)
- [x] `JwtAuthGuard` + `JwtRefreshGuard`
- [x] Decorator `@CurrentUser()` para extraer el usuario del request
- [x] Interfaz `AuthenticatedRequest` tipada

### Fase 2 — Workspaces y permisos

- [x] CRUD de workspaces
- [x] `WorkspaceMember` (el creador se vuelve `owner` automáticamente)
- [x] `WorkspaceRolesGuard` + decorator `@RequireWorkspaceRole()`
- [x] Gestión de miembros (listar, cambiar rol, remover)
- [x] Invitaciones por email/link con expiración
- [x] `BoardRolesGuard` (override opcional de rol a nivel de board)

### Fase 3 — Boards y columnas

- [ ] CRUD de boards dentro de un workspace
- [ ] CRUD de columnas con fractional indexing
- [ ] Reordenar columnas
- [ ] `fractional-index.util.ts`

### Fase 4 — Tasks (núcleo del producto)

- [ ] CRUD de tareas dentro de una columna
- [ ] Mover tarea entre columnas (recalcula `position`)
- [ ] Reordenar tareas dentro de la misma columna
- [ ] Asignar usuarios a tareas (`task_assignees`)
- [ ] Asignar etiquetas a tareas (`task_labels`)
- [ ] CRUD de etiquetas por workspace
- [ ] Filtros: asignado, etiqueta, prioridad
- [ ] Búsqueda por texto (índice trigram de PostgreSQL)

### Fase 5 — Sub-recursos de tasks

- [ ] Comentarios (crear, editar, eliminar)
- [ ] Checklists (crear listas, agregar ítems, toggle de completado)
- [ ] Archivos adjuntos (registrar nombre, URL, tamaño, tipo MIME)

### Fase 6 — Activity log y notificaciones

- [ ] `ActivityService.log()` inyectable en otros servicios
- [ ] Feed de actividad por workspace / board / tarea
- [ ] Notificaciones: tarea asignada, mención en comentario, tarea próxima a vencer
- [ ] Marcar notificaciones como leídas

### Fase 7 — Tiempo real (WebSockets)

- [ ] `RealtimeGateway` con namespace por board (`board:{boardId}`)
- [ ] Sincronización en vivo de cambios en el tablero
- [ ] `PresenceService`: indicadores de qué usuarios están viendo un board
- [ ] Configurar Redis adapter (para escalar a múltiples instancias)

### Fase 8 — Testing y hardening

- [ ] Tests unitarios: `fractional-index.util`, `auth.service`, guards de roles
- [ ] Tests e2e: registro→login, crear workspace, crear board→tarea→mover
- [ ] Rate limiting en endpoints de auth (`@nestjs/throttler`)
- [ ] `HttpExceptionFilter` global para respuestas de error consistentes

### Fase 9 — Deploy

- [ ] Dockerizar el backend
- [ ] Configurar Swagger (`@nestjs/swagger`)
- [ ] Deploy en Railway / Render / Fly.io

---

## Módulos y funcionalidades

### Auth

Maneja todo el ciclo de vida de la sesión: registro, login, refresh de tokens y logout.

- `POST /auth/register` — Crear cuenta
- `POST /auth/login` — Iniciar sesión
- `POST /auth/refresh` — Emitir nuevos tokens (requiere refresh token válido)
- `POST /auth/logout` — Revocar sesión actual (invalidar refresh token)

### Users

Perfil del usuario autenticado.

- `GET /users/me` — Ver mi perfil
- `PATCH /users/me` — Actualizar nombre o avatar

### Workspaces _(próximamente)_

Contenedor de alto nivel: todo board, label y miembro pertenece a un workspace.

- `POST /workspaces` — Crear workspace
- `GET /workspaces` — Listar workspaces del usuario
- `GET /workspaces/:id` — Ver workspace
- `PATCH /workspaces/:id` — Actualizar workspace _(admin/owner)_
- `DELETE /workspaces/:id` — Eliminar workspace _(owner)_
- `GET /workspaces/:id/members` — Listar miembros
- `PATCH /workspaces/:id/members/:userId` — Cambiar rol _(admin/owner)_
- `DELETE /workspaces/:id/members/:userId` — Remover miembro _(admin/owner)_
- `POST /workspaces/:id/invitations` — Invitar por email _(admin/owner)_
- `POST /workspaces/invitations/accept` — Aceptar invitación (vía token)

### Boards _(próximamente)_

Tableros Kanban dentro de un workspace.

- `POST /workspaces/:id/boards` — Crear board
- `GET /workspaces/:id/boards` — Listar boards del workspace
- `GET /boards/:id` — Ver board completo (con columnas y tareas)
- `PATCH /boards/:id` — Actualizar board _(admin/owner)_
- `DELETE /boards/:id` — Archivar board _(admin/owner)_

### Columns _(próximamente)_

Listas dentro de un board (ej. To Do, In Progress, Done).

- `POST /boards/:id/columns` — Crear columna
- `PATCH /columns/:id` — Renombrar / actualizar WIP limit
- `PATCH /boards/:id/columns/reorder` — Reordenar columnas (fractional indexing)
- `DELETE /columns/:id` — Eliminar columna

### Tasks _(próximamente)_

Tarjetas dentro de una columna.

- `POST /columns/:id/tasks` — Crear tarea
- `GET /boards/:id/tasks` — Listar tareas del board con filtros
- `GET /tasks/:id` — Ver detalle de tarea
- `PATCH /tasks/:id` — Editar tarea
- `PATCH /tasks/:id/move` — Mover tarea (cambia columna y/o posición)
- `DELETE /tasks/:id` — Archivar tarea
- `POST /tasks/:id/assignees` — Asignar usuario
- `DELETE /tasks/:id/assignees/:userId` — Desasignar usuario
- `POST /tasks/:id/labels` — Agregar etiqueta
- `DELETE /tasks/:id/labels/:labelId` — Quitar etiqueta

### Comments, Checklists, Attachments _(próximamente)_

Sub-recursos de una tarea.

- `POST /tasks/:id/comments` — Comentar
- `PATCH /comments/:id` — Editar comentario
- `DELETE /comments/:id` — Eliminar comentario
- `POST /tasks/:id/checklists` — Crear checklist
- `POST /checklists/:id/items` — Agregar ítem
- `PATCH /checklist-items/:id/toggle` — Marcar como hecho/pendiente
- `POST /tasks/:id/attachments` — Registrar adjunto

### Activity y Notifications _(próximamente)_

- `GET /workspaces/:id/activity` — Feed de actividad del workspace
- `GET /boards/:id/activity` — Feed de actividad del board
- `GET /notifications` — Listar mis notificaciones
- `PATCH /notifications/:id/read` — Marcar como leída
- `PATCH /notifications/read-all` — Marcar todas como leídas

---

## Autenticación y seguridad

### Flujo de tokens

```
Cliente                          Servidor
  │                                  │
  │── POST /auth/login ─────────────>│
  │<── { accessToken, refreshToken }─│
  │                                  │
  │── GET /users/me                  │
  │   Authorization: Bearer <access> │
  │<── 200 { user }─────────────────│
  │                                  │
  │ (access token expirado)          │
  │── POST /auth/refresh             │
  │   body: { refreshToken } ───────>│  valida firma + DB (no revocado)
  │<── { accessToken, refreshToken }─│  rota el token (invalida el viejo)
  │                                  │
  │── POST /auth/logout              │
  │   body: { refreshToken } ───────>│  marca como revokedAt en DB
  │<── 204 No Content ───────────────│
```

### Decisiones de seguridad

| Decisión                                | Razón                                                           |
| --------------------------------------- | --------------------------------------------------------------- |
| Access token con TTL corto (15m)        | Si se intercepta, expira rápido                                 |
| Refresh token hasheado en DB (SHA-256)  | Si la tabla se filtra, los hashes no sirven sin el secret       |
| Secrets distintos para access y refresh | Evita que un token de un tipo se use como el otro               |
| Rotación de refresh tokens              | Detecta reuso de tokens robados (el viejo queda revocado)       |
| Revocación individual por sesión        | Logout en un dispositivo no afecta a los demás                  |
| Mensajes de error genéricos en login    | No revela si el email está registrado o no                      |
| `whitelist: true` en ValidationPipe     | Propiedades no declaradas en el DTO se eliminan automáticamente |
| `forbidNonWhitelisted: true`            | Propiedades extra en el request lanzan un error 400             |

---

## Sistema de roles y permisos

Taskly maneja roles en **dos niveles**, con herencia del workspace al board.

### Roles en workspace (`WorkspaceRole`)

| Rol      | Permisos                                     |
| -------- | -------------------------------------------- |
| `owner`  | Control total, puede eliminar el workspace   |
| `admin`  | Gestiona miembros, crea/elimina boards       |
| `member` | Crea y edita tareas, comenta, mueve tarjetas |
| `viewer` | Solo lectura                                 |

### Roles en board (`BoardRole`) — override opcional

Permite dar a un usuario un rol diferente al que tiene en el workspace, pero solo dentro de un board específico.

| Rol      | Permisos en ese board     |
| -------- | ------------------------- |
| `admin`  | Administra ese board      |
| `member` | Edita tareas en ese board |
| `viewer` | Solo lectura en ese board |

---

## Base de datos

### Esquema (19 tablas)

| Tabla                   | Descripción                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `users`                 | Cuentas de usuario                                              |
| `refresh_tokens`        | Tokens de sesión hasheados (permite revocación por dispositivo) |
| `workspaces`            | Organizaciones o equipos                                        |
| `workspace_members`     | Membresías con rol global en el workspace                       |
| `workspace_invitations` | Invitaciones pendientes por email/link                          |
| `boards`                | Tableros Kanban dentro de un workspace                          |
| `board_members`         | Override opcional de rol a nivel de board                       |
| `columns`               | Listas dentro de un board (con fractional indexing)             |
| `labels`                | Etiquetas reutilizables a nivel de workspace                    |
| `tasks`                 | Tarjetas (con boardId denormalizado para evitar JOINs)          |
| `task_assignees`        | Asignados a una tarea (muchos a muchos)                         |
| `task_labels`           | Etiquetas de una tarea (muchos a muchos)                        |
| `checklists`            | Listas de verificación dentro de una tarea                      |
| `checklist_items`       | Ítems individuales de un checklist                              |
| `comments`              | Comentarios en tareas                                           |
| `attachments`           | Archivos adjuntos (solo metadata + URL)                         |
| `activity_logs`         | Auditoría de todas las acciones con metadata en JSONB           |
| `notifications`         | Notificaciones dirigidas a un usuario                           |

---

## Buenas prácticas aplicadas

### Arquitectura y organización

- **Feature modules**: un módulo por dominio, autocontenido, con sus propios controllers, services y DTOs
- **Separación controller/service**: el controller solo valida y delega; el service no sabe nada de HTTP
- **Patrón Repository** : aísla las queries de Prisma del service para facilitar testing y eventuales cambios de ORM
- **EventEmitter para desacoplamiento**: los services emiten eventos de dominio; el gateway de WebSockets los escucha sin que los modules de dominio sepan nada de sockets

### Seguridad

- Secrets de JWT distintos para access y refresh
- Refresh tokens hasheados en DB, con rotación en cada uso
- `ValidationPipe` global con `whitelist: true` y `forbidNonWhitelisted: true`
- Contraseñas hasheadas con bcrypt (nunca almacenadas en texto plano)
- Mensajes de error genéricos en autenticación (no revelan si el email existe)
- Variables de entorno validadas al arrancar (fail-fast con Joi)

### TypeScript

- `strict: true` en `tsconfig.json`
- Interfaces tipadas para `AuthenticatedRequest` y `AuthenticatedUser`
- DTOs con `class-validator` en todos los endpoints
- Enums de Prisma usados como tipos en lugar de strings sueltos

### Base de datos

- UUIDs como PKs (no secuenciales, más seguros para URLs públicas)
- `ON DELETE CASCADE` / `SET NULL` / `RESTRICT` bien pensados para cada relación

### Código

- `PrismaModule` global: inyectable sin reimportar en cada módulo
- Decorator `@CurrentUser()` parametrizable: `@CurrentUser()` o `@CurrentUser('id')`
- Configs namespaceados con `registerAs`: `config.get('jwt.accessSecret')` en lugar de variables sueltas
- `.env.example` siempre actualizado
