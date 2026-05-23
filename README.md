# ClinTrack Pro - Clinical Trial Data Dashboard

This repository contains the containerized and modularized workspace for a Phase III clinical trial subject management and analytics dashboard. The architecture follows a monorepo design pattern and is visually integrated with Google Stitch design systems.

---

## 🏗️ High-Level Architecture Overview (Point 8)

The application follows a decoupled, API-centric architecture separating the client-side presentation layer from the server-side API services:

```text
                                       +-----------------------------------+
                                       |            User Agent             |
                                       |          (Web Browser)            |
                                       +-----------------+-----------------+
                                                         |  HTTP Requests
                                                         v  (Port 3000)
+--------------------------------------------------------+--------------------------------------------------------+
|                                              DOCKER ENVIRONMENT                                                 |
|                                                                                                                 |
|  +-----------------------------------------------------------------------------------------------------------+  |
|  |                                            Frontend Container                                             |  |
|  |                                          (React + TS + Vite)                                              |  |
|  |                                                                                                           |  |
|  |  +--------------------+      +--------------------+      +--------------------+      +-----------------+  |  |
|  |  |  React Components  | <--> |  React Router v6   | <--> |  TanStack Query v5 | <--> |  Axios Client   |  |  |
|  |  |   (UI / Views)     |      |  (Protected Rts)   |      |  (Server Caching)  |      | (JWT Intercept) |  |  |
|  |  +--------------------+      +--------------------+      +--------------------+      +--------+--------+  |  |
|  +-----------------------------------------------------------------------------------------------|-----------+  |
|                                                                                                  |              |
|                                                                                    REST API Calls| (Port 8000)  |
|                                                                                    (Bearer Auth) |              |
|                                                                                                  v              |
|  +-----------------------------------------------------------------------------------------------+-----------+  |
|  |                                            Backend Container                                              |  |
|  |                                            (FastAPI + Python)                                             |  |
|  |                                                                                                           |  |
|  |     +-------------------------+         +-------------------------+         +-------------------------+   |  |
|  |     |     FastAPI Routers     |  <---->  |     SQLModel (ORM)      |  <---->  |   SQLite Engine (DB)    |   |  |
|  |     |      (Auth/CRUD routes) |         |  (Pydantic/SQLAlchemy)  |         | (clinical_trial.db)     |   |  |
|  |     +-------------------------+         +-------------------------+         +-------------------------+   |  |
|  +-----------------------------------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------------------------------+
```

---

## 📁 Project Structure

The repository follows a clean, modular layout to separate concerns:

```text
laboratorio/
├── backend/                  # API & Database Services (Python + FastAPI)
│   ├── app/
│   │   ├── application/      # Use cases and operations (CRUD logic)
│   │   ├── domain/           # Core business logic and schemas
│   │   ├── infrastructure/   # Database, models, and external services
│   │   ├── presentation/     # FastAPI routers and external entrypoints
│   │   └── main.py           # Application entry point & lifespan events
│   ├── tests/                # Automated API integration and unit tests
│   ├── Dockerfile            # Optimized backend build recipe
│   └── requirements.txt      # Python package dependencies
├── frontend/                 # User Interface Client (React + TS + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts     # Axios client equipped with automated JWT request interceptor
│   │   ├── context/
│   │   │   └── AuthContext.tsx # React Context for global auth state and hooks (useAuth)
│   │   ├── types/
│   │   │   └── index.ts      # Strictly-typed domain models and API payload contracts
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Service layer for authentication endpoints
│   │   │   └── participant.service.ts # Service layer for participant CRUD queries
│   │   ├── hooks/
│   │   │   └── useParticipants.ts    # Custom TanStack Query queries & mutations
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx # App route configuration & protected route guards
│   │   ├── ui/
│   │   │   ├── components/   # Reusable UI widgets (e.g., ParticipantDetailsModal)
│   │   │   ├── layouts/      # Dashboard layouts (e.g., AppLayout sidebar and header)
│   │   │   └── pages/        # Feature-Sliced modules (Hooks + UI Components)
│   │   ├── App.tsx           # Entry wrapper for global QueryClient and Router Providers
│   │   ├── index.css         # Tailwind injection & custom styled scrollbars
│   │   ├── vite-env.d.ts     # Vite environment variables typings
│   │   └── main.tsx          # React application mount script
│   ├── index.html            # Core HTML template containing Google Material Symbols
│   ├── tailwind.config.js    # System design color tokens config
│   ├── postcss.config.js     # PostCSS configurations
│   ├── tsconfig.json         # Strict TypeScript compiler options
│   └── Dockerfile            # Node 20 Slim development image
├── docker-compose.yml        # Multi-container local execution orchestrator
├── run_tests.ps1             # PowerShell script to run all tests in Docker
├── run_tests.sh              # Bash script to run all tests in Docker
├── .gitignore                # Git exclusions rules for local caches and databases
└── README.md                 # Primary documentation (this file)
```

---

## 🛠️ Technologies Used & Choice Justifications (Point 3)

### Backend
*   **FastAPI & Python 3.11**: FastAPI was chosen due to its high execution performance, native async support, automated OpenAPI (Swagger) documentation, and built-in type validation via Pydantic.
*   **SQLModel**: Combines SQLAlchemy (robust ORM) and Pydantic (data parsing/validation) into a single library, avoiding duplicated schemas and enhancing code cleanliness.
*   **SQLite**: Handled as a self-contained local database file. Excellent choice for rapid prototyping, simplified local orchestration, and test isolation.
*   **Pytest**: Used for API integration tests. Coupled with custom fixtures, it enables clean test setup/teardown.

### Frontend
*   **React 18 & TypeScript**: TypeScript enforces strict compilation-time types over the React components, reducing runtime errors and improving readability.
*   **React Router v6**: Manages declarative nested routes, route guarding (protecting URLs from unauthorized access), and URL parameter synchronization.
*   **TanStack Query v5 (React Query)**: Manages server-state synchronization. It abstracts loading, error states, and caches API responses automatically, ensuring immediate data rendering.
*   **Axios**: Chosen over the fetch API due to its clean request/response interceptor capability, which automatically appends authorization tokens to requests.

---

## 🚀 How to Run the Application (Point 1)

The entire application is containerized. Both services are orchestrated using Docker Compose.

### Prerequisites
*   Ensure **Docker Desktop** is installed and running on your system.

### Running with Docker Compose
Run the following command in the project root directory:
```bash
docker-compose up -d --build
```
This builds both images and boots up the containers in the background:
*   **Frontend Client**: Accessible at `http://localhost:3000`
*   **Backend API**: Accessible at `http://localhost:8000`
*   *Health check endpoint:* `http://localhost:8000/health` (verify DB connectivity).

> [!TIP]
> **Dependency Updates inside Docker:**
> If you install new packages on the host, clear the cached Docker volumes before building to prevent caching outdated `node_modules`:
> ```bash
> docker-compose down -v
> docker-compose up -d --build
> ```

---

## 🧪 How to Run Tests (Point 2)

We provide automated test suites for both frontend and backend.

### Running Both Suites (Unified Script)
You can run the entire project's tests consecutively using the cross-platform scripts in the project root:

*   **On Windows (PowerShell):**
    ```powershell
    .\run_tests.ps1
    ```
*   **On Linux / macOS (Bash):**
    ```bash
    chmod +x run_tests.sh
    ./run_tests.sh
    ```

### Running Individual Suites

#### Backend Tests (Pytest with isolated DB)
Backend tests execute inside Docker against an isolated SQLite file (`test_clinical_trial.db`), which is automatically set up, seeded, and destroyed on each test session.
```bash
docker exec -e PYTHONPATH=. laboratorio-backend-1 pytest
```

#### Frontend Tests (Jest)
Frontend tests use Jest inside the container to validate component behavior and sanity rules.
```bash
docker exec laboratorio-frontend-1 npm run test
```

---

## 📋 Completed vs. Skipped Scope (Point 4)

### Completed Scope
*   **Complete RESTful API**: Implemented auth endpoints (`/login`, `/refresh`) and participant CRUD endpoints (`/participants`) with Pydantic type validation and error handling.
*   **Feature-Sliced Frontend**: Transitioned the monolithic React client into a modern Hook-based architecture, unifying Views and Controllers into feature-sliced folders (`ui/` and `hooks/`) per page.
*   **Hexagonal Backend**: Refactored the backend into Hexagonal Architecture (Ports and Adapters) separating `domain`, `application`, `infrastructure`, and `presentation` layers.
*   **Access Guards**: Created a `ProtectedRoute` component to intercept accesses to dashboards and details modals, validating JWTs.
*   **Details Modal with Editing**: Designed a detail view modal for individual participants that allows real-time edits, syncing changes using React Query mutations.
*   **Isolated Testing Environment**: Configured a `conftest.py` setup to isolate test data in a separate SQLite database file.
*   **Multi-container Orchestration**: Set up `docker-compose.yml` to build and serve the application globally.
*   **Unified Testing Scripts**: Created root PowerShell and Bash scripts to run both test suites in one step.

### Skipped Scope
*   **Dynamic Metrics Aggregations**: The visual charts and KPIs on the Dashboard (e.g., the Enrollment Trend bar chart, Diversity Index circle, and Retention Rate metric) utilize the static mockup structures generated by Google Stitch. They are not dynamically computed from live database records as the backend does not expose metrics/analytics aggregation endpoints in this version.

---

## ⚖️ Architectural Decisions & Trade-offs (Point 6)

*   **SQLite over PostgreSQL**: SQLite was selected to facilitate immediate setup and avoid hosting database engines. In production, we would switch the `DATABASE_URL` config to PostgreSQL in `docker-compose.yml` since the ORM (SQLModel) supports it out of the box.
*   **Stateless JWT Sessions**: Authentications are managed statelessly using short-lived JWT access tokens and database-tracked refresh tokens. This is highly scalable but requires clients to securely handle tokens (currently stored in `localStorage` for simplicity).
*   **Client-Side Filtering per Page**: Search filtering is done client-side over the paginated records fetched. This provides high responsiveness but is limited to the current visible page. In a larger-scale application, search terms would be passed as query arguments to a search backend database query.

---

## 🔮 Future Improvements & Roadmap (Point 5)

If given more time, we would implement the following production-ready features:
1. **Metrics with Prometheus**: Expose a `/metrics` route in FastAPI via `prometheus-client` to monitor response latency, error rates, and resource utilization.
2. **Distributed Tracing with OpenTelemetry**: Instrument FastAPI and Axios endpoints to dispatch traces to collectors (Jaeger or AWS X-Ray) for end-to-end latency analysis.
3. **Structured Logging (JSON)**: Replace standard python logging formatters with `structlog` to output structured JSON logs, optimizing ingestion into aggregators like Datadog, Kibana, or Grafana Loki.
4. **Third-Party Identity Provider (IdP)**: Replace local credentials and token issuance with an OAuth2/OIDC-compliant provider like Auth0 or Keycloak.

---

## 🤖 AI Collaboration & Prompts (Point 7)

This project was built using collaboration between two Google artificial intelligence platforms:

1.  **Google Stitch (Design AI)**:
    *   **Role**: Generated the high-fidelity mockups, visual assets, layouts, responsive sidebars, custom scrollbars, and color themes.
2.  **Antigravity (Agentic Coding AI by Google DeepMind)**:
    *   **Role**: Assisted in monorepo setup, modularized the monolithic frontend code into React pages, custom hooks, and context stores, implemented JWT endpoint security, created the isolated pytest database lifecycle, and wrote the unified test runner scripts.

### Prompts that guided the AI Assistant:
*   *"Write a pytest conftest.py file that overrides the FastAPI application's database configuration to use a temporary SQLite file named test_clinical_trial.db during test runs. Ensure all active engine connections are disposed and the temporary file is deleted after the tests complete to prevent file locking on Windows."*
*   *"Refactor the monolithic React client into a structured architecture using React Router v6. Share the user authentication token globally using a React Context. Implement TanStack Query (React Query) hooks to manage and fetch participant lists and details, including mutation invalidations to auto-refresh tables."*

---

## 🔑 Authentication & Protected Routes

All participant CRUD routes are protected using **Bearer JWT** tokens.

### Pre-seeded Credentials
*   **Email**: `researcher@clintrack.com`
*   **Password**: `password123`

### Manual API Verification (curl)
1. **Step 1: Obtain a JWT Access Token**
   Submit a POST request to `/api/v1/auth/login`:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "researcher@clintrack.com", "password": "password123"}'
   ```
   *This returns a JSON containing the `access_token`.*

2. **Step 2: Access Protected Resource**
   Send a GET request to the participants endpoint passing the token:
   ```bash
   curl -X GET http://localhost:8000/api/v1/participants \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```
   *Omitting or providing an incorrect token results in a `403 Forbidden` response.*
