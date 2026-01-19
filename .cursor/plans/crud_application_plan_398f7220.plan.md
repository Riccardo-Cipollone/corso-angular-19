---
name: CRUD Application Plan
overview: Create a complete CRUD application for all 5 entities (corso, studente, docente, aula, corso_studente) using Angular 19 with signals, Tailwind 4, and json-server. Implement sidebar navigation with separate routes for each entity.
todos:
  - id: setup-deps
    content: Install json-server, Tailwind 4, and configure build tools
    status: completed
  - id: create-models
    content: Create TypeScript interfaces for all 5 entities
    status: completed
  - id: create-services
    content: Create services with signals for state management and HTTP operations
    status: completed
  - id: create-layout
    content: Create sidebar and main layout components
    status: completed
  - id: create-corso-components
    content: Create list and form components for corso entity
    status: completed
  - id: create-studente-components
    content: Create list and form components for studente entity
    status: completed
  - id: create-docente-components
    content: Create list and form components for docente entity
    status: completed
  - id: create-aula-components
    content: Create list and form components for aula entity
    status: completed
  - id: create-corso-studente-components
    content: Create list and form components for corso_studente entity
    status: completed
  - id: setup-routing
    content: Configure routes for all entities and update app component
    status: completed
  - id: create-db-json
    content: Create db.json with seed data for json-server
    status: completed
  - id: configure-http
    content: Configure HttpClient in app.config.ts
    status: completed
---

# CRUD Application Implementation Plan

## Overview

Build a CRUD application following the database schema with 5 entities: `corso`, `studente`, `docente`, `aula`, and `corso_studente`. Use Angular 19 standalone components, signals for state management, Tailwind 4 for styling, and json-server as the backend API.

## Architecture

```
src/app/
├── models/           # TypeScript interfaces for all entities
├── services/         # Services with signals for state management
├── components/       # Feature components
│   ├── corso/
│   ├── studente/
│   ├── docente/
│   ├── aula/
│   └── corso-studente/
├── layout/           # Layout components (sidebar, main layout)
└── app.routes.ts     # Route configuration
```

## Implementation Steps

### 1. Setup Dependencies

- Install `json-server` as dev dependency
- Install `@tailwindcss/vite` and configure Tailwind 4
- Create `db.json` with initial seed data for all entities
- Add npm script to run json-server

### 2. Create Data Models

Create TypeScript interfaces in `src/app/models/`:

- `corso.model.ts` - Course interface
- `studente.model.ts` - Student interface
- `docente.model.ts` - Instructor interface
- `aula.model.ts` - Classroom interface
- `corso-studente.model.ts` - Junction table interface

### 3. Create Services with Signals

Create services in `src/app/services/` using Angular 19 signals:

- `corso.service.ts` - CRUD operations with `signal()` for state
- `studente.service.ts` - CRUD operations with `signal()` for state
- `docente.service.ts` - CRUD operations with `signal()` for state
- `aula.service.ts` - CRUD operations with `signal()` for state
- `corso-studente.service.ts` - CRUD operations for enrollment

Each service will:

- Use `signal()` for reactive state (e.g., `corsi = signal<Corso[]>([])`)
- Use `computed()` for derived state
- Implement HTTP methods using `HttpClient` (inject via `inject()`)
- Use `effect()` if needed for side effects

### 4. Create Components

For each entity, create:

- **List Component** (`*-list.component.ts/html`): Display table with actions (view, edit, delete)
- **Form Component** (`*-form.component.ts/html`): Create/edit form using reactive forms
- **Detail Component** (optional): View single entity details

Components will:

- Use standalone component syntax
- Inject services using `inject()`
- Use signals from services for reactive data
- Use Tailwind classes for basic styling

### 5. Setup Routing

Configure routes in `app.routes.ts`:

- `/corsi` - Course list
- `/corsi/new` - Create course
- `/corsi/:id` - Edit course
- `/studenti` - Student list
- `/studenti/new` - Create student
- `/studenti/:id` - Edit student
- `/docenti` - Instructor list
- `/docenti/new` - Create instructor
- `/docenti/:id` - Edit instructor
- `/aule` - Classroom list
- `/aule/new` - Create classroom
- `/aule/:id` - Edit classroom
- `/iscrizioni` - Enrollment list (corso_studente)
- `/iscrizioni/new` - Create enrollment
- `/iscrizioni/:id` - Edit enrollment

### 6. Create Layout Components

- `sidebar.component.ts/html` - Navigation sidebar with links to all entities
- `main-layout.component.ts/html` - Wrapper component with sidebar and router outlet

### 7. Configure HttpClient

- Add `provideHttpClient()` to `app.config.ts`
- Configure base URL for json-server (typically `http://localhost:3000`)

### 8. Styling

- Configure Tailwind 4 in `angular.json` or via Vite plugin
- Add basic Tailwind classes for tables, forms, buttons, sidebar
- Keep styling minimal and functional

## Key Files to Create/Modify

**New Files:**

- `db.json` - json-server database
- `src/app/models/*.model.ts` - 5 model files
- `src/app/services/*.service.ts` - 5 service files
- `src/app/components/*/` - Component directories and files
- `src/app/layout/sidebar.component.ts/html`
- `src/app/layout/main-layout.component.ts/html`

**Modified Files:**

- `package.json` - Add json-server, Tailwind dependencies
- `angular.json` - Configure Tailwind
- `src/app/app.config.ts` - Add HttpClient provider
- `src/app/app.routes.ts` - Add all routes
- `src/app/app.component.html` - Use main layout
- `src/styles.css` - Tailwind directives

## Angular 19 Best Practices

- Use standalone components exclusively
- Use `inject()` function for dependency injection
- Use `signal()`, `computed()`, and `effect()` for reactive state
- Use `HttpClient` with signals for async operations
- Use reactive forms with `FormBuilder`
- Leverage new control flow syntax (`@if`, `@for`, `@switch`)

## Data Relationships

- When creating/editing `corso`, show dropdowns for `aula` and `docente`
- When creating/editing `corso_studente`, show dropdowns for `corso` and `studente`
- Display related data in lists (e.g., show docente name in corso list)