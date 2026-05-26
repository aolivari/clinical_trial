# Agent Context & Repository Guidelines

Welcome! This document provides context, architectural decisions, and development guidelines for **ClinTrack Pro**, a Phase III clinical trial subject management and analytics dashboard.

---

## 📖 Project Background & Core Purpose
We are collaborating with life sciences clients conducting clinical trials. The objective of this application is to help clinical researchers visualize and manage key trial metrics and participant data. 
The system is built as a robust, first-version foundation, with future needs in mind such as:
- Integration with AI agents
- Advanced clinical analytics
- GxP regulatory compliance reporting systems

---

## 👑 Reglas Primigenias de Desarrollo (Golden Rules)

Any agent or developer working on this codebase must strictly adhere to the following rules:

1. **Strict Typing**: Maintain strict static typing in both the frontend (TypeScript) and backend (Python schemas with SQLModel/Pydantic). Avoid using `any` or loose types.
2. **Hexagonal Architecture (Ports & Adapters)**:
   - The backend must strictly follow ports & adapters organization. Do not bypass layers. Keep domain logic decoupled from infrastructure databases or presentation routers.
3. **No UI Design Libraries**:
   - Do not install external component frameworks (such as Material UI, Radix UI, Bootstrap, etc.). Use native HTML/TSX elements styled with Vanilla CSS or local Tailwind CSS configuration tokens.
4. **Maximum Modularity & Reuse**:
   - Strive for maximum modularity. Do not write ad-hoc CSS or inline layouts if they can be unified.
   - Always query the common UI components list (`src/ui/components`) first.
   - If a pattern is needed but doesn't exist, create it as a reusable component, write unit tests for it, export it from `src/ui/components/index.ts`, and recycle it across views.

---

## 💾 Database Environment

- **Development Database**: SQLite file located at `backend/clinical_trial.db`. It is persisted as a Docker volume and contains seed values for the application metrics.
- **Test Database Isolation**: Integration tests run against an isolated SQLite file `test_clinical_trial.db` created dynamically during the Pytest session, ensuring development data is never altered by tests.

---

## 🔑 Credentials & Authentication

To sign in and query protected routes manually or via Swagger, use:
- **Email**: `researcher@clintrack.com`
- **Password**: `password123`

JWT tokens (short-lived access tokens and refresh tokens) are sent via HTTP Authorization headers `Bearer <token>` to protect participant endpoints.

---

## 🔄 CI/CD Pipeline

The repository integrates a GitHub Actions pipeline (`.github/workflows/ci.yml`) triggering on pushes/pull requests to `main`/`develop`:
1. **Backend checks**: installs dependencies and executes the pytest suite.
2. **Frontend checks**: runs ESLint, compiles TypeScript, and runs the Jest suite.
3. **Build verification**: validates that Vite successfully packages the frontend production bundle and verifies the multi-container Docker compilation.

*Before submitting a pull request, ensure all local tests pass.*

---

## ⚙️ Local Development Workflows

### Prerequisites
- Ensure **Docker Desktop** is running.

### Booting the Environment
Orchestrated via Docker Compose from the root directory:
```bash
docker-compose up -d --build
```
- **Frontend Client**: Served at `http://localhost:3000`
- **Backend API**: Served at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).

### Test Runners
We run full unit and integration test suites:
- **Unified Script (Root)**:
  - Windows: `.\run_tests.ps1`
  - Linux/macOS: `./run_tests.sh`
- **Backend Tests (Pytest)**:
  Runs inside the container against an isolated database `test_clinical_trial.db` setup and destroyed automatically per test session:
  ```bash
  docker exec -e PYTHONPATH=. laboratorio-backend-1 pytest
  ```
- **Frontend Tests (Jest)**:
  Runs Jest inside the container to test components and hooks:
  ```bash
  docker exec laboratorio-frontend-1 npm run test
  ```

---

## 💅 Reusable UI Components & Index Exports

To maintain a highly scalable design system and avoid duplicate styles, all common widgets are placed in `src/ui/components` and exported via a unified entry point `src/ui/components/index.ts`:

- `Tag`: Standard status/study group badges matching visual color configurations.
- `KpiCard`: Layout panel displaying calculated aggregated metrics.
- `GenericTable`: Scalable grid renderer accepting dynamic columns schemes and cell renderers.
- `Alert`: Unified message banner supporting `error`, `warning`, `success`, and `info` types.
- `Pagination`: Centralized pagination footer.
- `SuccessModal`: Interactive dialog showing confirmed transactions.
- `InputField`: Standardized form input wrapper.
- `Select`: Standardized dropdown select wrapper.

---

## 🔮 Future Roadmap & Guidelines
*(Note: There are no immediate priority tasks assigned here. These points serve to guide how upcoming features should be structured under the core rules.)*

1. **Server-Side Pagination & Filtering**: Offloading search query parameters from client-side state to SQLite SQL queries.
2. **Regulatory Auditing Log (GxP)**: Designing database tables tracking historical subject modifications (who edited what, and when).
3. **Advanced Charts**: Integrating a package like Recharts or Nivo to display enrollment metrics and gender demographics.
4. **Structured JSON Logging**: Incorporating structured logging (`structlog`) to prepare for distributed tracing setups (OpenTelemetry).
