# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are team members, project leads, and workspace collaborators who need to organize work in a shared Kanban environment. They typically work in a browser on desktop or laptop to create workspaces, manage boards, assign tasks, track progress, and review activity or notifications.

## Product Purpose

Taskly is a collaborative project and task management product for teams that want to plan work in boards, move tasks across workflow stages, and keep conversations, permissions, and activity visible in one place. Success means a user can create or join a workspace, manage boards and tasks, coordinate assignments, and keep track of deadlines and team activity without friction.

## Positioning

Taskly combines workspace-level collaboration, board-based task flow, and role-aware permissions in a single product. Its differentiated mechanism is the combination of Kanban operations with workspace management, activity logging, and task-level collaboration rather than a generic list or single-board tool.

## Operating Context

Taskly is used as a web app in a team environment, where multiple users share workspaces and boards. The product includes workspace membership, board creation, Kanban columns and tasks, task comments/checklists/attachments, labels, notifications, and activity history. The project is split into a NestJS + Prisma backend and a React + Vite frontend, and the repo itself documents a staged implementation with the realtime/WebSockets phase still pending.

## Capabilities and Constraints

Confirmed capabilities:
- Workspace creation and membership management
- Board management within workspaces
- Kanban columns and task movement between columns
- Task creation, editing, priority, due dates, and assignment
- Labels, comments, checklists, and attachments on tasks
- Activity feed and notification center
- Role-based permissions at workspace and board levels
- JWT-based authentication and refresh-token flow

Confirmed constraints and product facts:
- The project is a web application, not a native mobile app.
- The current implementation is designed around a REST backend with PostgreSQL and Prisma.
- The repo explicitly notes that realtime/WebSockets and Redis integration are planned for a later phase and are not part of the current implementation.
- Frontend documentation describes a dark, Blue-themed interface as the current visual baseline.
- Future work should not invent features beyond the repository evidence unless a user explicitly confirms them.

## Brand Commitments

The product name is Taskly. The repo repeatedly frames it as a collaborative project and task management tool, with a Kanban-style workflow and a professional team productivity focus.

## Evidence on Hand

- Root project README: `/home/efrain/Projects/taskly/README.md`
- Frontend roadmap and product goals: `/home/efrain/Projects/taskly/frontend/README.md`
- Backend architecture and feature documentation: `/home/efrain/Projects/taskly/backend/README.md`
- Runtime and app configuration: `/home/efrain/Projects/taskly/backend/package.json`, `/home/efrain/Projects/taskly/backend/src/app.module.ts`
- Database model evidence: `/home/efrain/Projects/taskly/backend/prisma/schema.prisma`

## Product Principles

1. Make team coordination visible: activity, notifications, and shared state should reduce uncertainty.
2. Keep work structured: boards, columns, roles, and permissions should preserve clarity as teams scale.
3. Favor task completion over abstraction: the core workflow should let users move from planning to execution quickly.
4. Preserve collaboration context: comments, checklists, attachments, and assignees belong directly to task execution.
5. Design for accountable workflows: permissions and role boundaries must be explicit and enforceable.

## Accessibility & Inclusion

No product-specific accessibility requirements were explicitly confirmed in the repository evidence. The frontend plan does call out a WCAG AA contrast target and keyboard/focus accessibility review as a future quality pass, so the product should treat accessibility as a baseline requirement rather than an optional enhancement.
