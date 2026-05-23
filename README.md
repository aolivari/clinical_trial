# ClinTrack Pro - Clinical Trial Data Dashboard

This repository contains the containerized and modularized workspace for a Phase III clinical trial subject management and analytics dashboard. The architecture follows a monorepo design pattern and is visually integrated with Google Stitch design systems.

---

## 📁 Project Structure

The repository follows a clean, modular layout to separate concerns between the backend services and the frontend client:

```text
laboratorio/
├── backend/                  # API & Database Services (Python + FastAPI)
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py     # Database and security configurations
│   │   │   ├── database.py   # SQLModel engine and session dependency (get_db)
│   │   │   ├── logging.py    # Structured logging setups
│   │   │   └── security.py   # Password hashing and JWT generation utils
│   │   ├── crud/             # Create, Read, Update, Delete queries
│   │   ├── models/           # SQLModel database entity classes
│   │   ├── routers/          # FastAPI routes (auth, participants)
│   │   ├── schemas/          # Pydantic models for validation
│   │   ├── conftest.py       # Pytest configuration and isolated database fixture
│   │   ├── test_main.py      # Automated API integration and unit tests
│   │   └── main.py           # Application entry point & lifespan events
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
│   │   │   └── pages/        # Standalone views (LoginPage, DashboardPage, etc.)
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
├── .gitignore                # Git exclusions rules for local caches and databases
└── README.md                 # Primary documentation (this file)
```

---

## 🛠️ Technology Stack

*   **Backend**: Python 3.11, FastAPI (Lifespan events and Routing), SQLModel/SQLAlchemy (ORM compatible with Pydantic), SQLite (Local persistent DB), PyJWT (JSON Web Token security), Pytest (Automated test suites).
*   **Frontend**: React 18, TypeScript, Vite (HMR and dev server), Tailwind CSS v3 (Utility classes), React Router v6 (Data routers), TanStack Query v5 (Server state caching and queries), Google Material Symbols.
*   **Containers**: Docker and Docker Compose.

---

## 🚀 How to Run the Application

The entire application runs inside Docker. Both the frontend client and backend API services are orchestrated together using Docker Compose.

### Prerequisites
*   Ensure **Docker Desktop** is installed and running.

---

### Step 1: Spin Up the Stack
Run the following command in the project root directory:
```bash
docker-compose up -d --build
```
This builds both images and runs the containers in the background:
*   **Frontend Client**: Accessible at `http://localhost:3000`
*   **Backend API**: Accessible at `http://localhost:8000`
*   *Health check endpoint:* `http://localhost:8000/health` (verify database connectivity).

> [!TIP]
> **Dependency updates inside Docker:**
> If you install new packages or change dependencies in the host `package.json` files, make sure to tear down old volumes before rebuilding:
> ```bash
> docker-compose down -v
> docker-compose up -d --build
> ```
> This clears cached anonymous volumes (like `/app/node_modules`) and reinstalls fresh dependencies.

---

## 🧪 How to Run Tests

The backend features an automated test suite validating the API health, JWT login flow, and CRUD operations (authorized vs. unauthorized routes).

### Isolated Test Database
The test execution is completely isolated from local development data. A pytest session-scoped fixture in [conftest.py](file:///c:/personal/laboratorio/backend/app/conftest.py) redirects all database writes to a temporary SQLite file (`test_clinical_trial.db`) and destroys it cleanly when the test session finishes.

To run the test suite inside the running Docker container:
```bash
docker exec -e PYTHONPATH=. laboratorio-backend-1 pytest
```

---

## 🔑 Authentication & Protected Routes

All participant CRUD routes (`/api/v1/participants`) are protected using **Bearer JWT** authorization headers.

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
   *This yields a JSON response containing an `access_token`.*

2. **Step 2: Access Protected Resource**
   Send a GET request to the participants endpoint passing the token:
   ```bash
   curl -X GET http://localhost:8000/api/v1/participants \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
   ```
   *Omitting or providing an incorrect token results in a `403 Forbidden` response.*

---

## 📈 Observability & Monitoring (Roadmap)

For production deployment, the following observability enhancements are recommended:
1. **Metrics with Prometheus**: Expose a `/metrics` route in FastAPI via `prometheus-client` to monitor response latency, error rates, and resource utilization.
2. **Distributed Tracing with OpenTelemetry**: Instrument FastAPI and Axios endpoints to dispatch traces to collectors (Jaeger, Zipkin, or AWS X-Ray) for end-to-end latency analysis.
3. **Structured Logging (JSON)**: Replace standard python logging formatters with `structlog` to output structured JSON logs, optimizing ingestion into aggregators like Datadog, Kibana, or Grafana Loki.

---

## 🔄 CI/CD Pipeline (Roadmap)

The proposed automation pipeline using GitHub Actions involves:
1. **Linter & Type Checking**: Execute `flake8` / `black` for Python and `eslint` / `tsc` for React on pull request events.
2. **Ephemeral Tests Run**: Launch `pytest` inside a containerized setup before merging.
3. **Build & Push**: Package backend and frontend images and push them to registries like AWS ECR or Docker Hub.
4. **Deploy**: Update target container tasks in Amazon ECS or Kubernetes using Infrastructure as Code (Terraform).

---

## ⚖️ Architectural Decisions & Trade-offs

*   **SQLite over PostgreSQL**: SQLite was selected to facilitate local development bootstrapping and avoid additional database service requirements.
*   **Decoupled Frontend Structure**: The initial state-based routing was replaced with a robust SPA architecture featuring React Router and TanStack Query, separating UI components, routes, services, and types to guarantee long-term maintainability.
*   **Static Identity Seed**: The boilerplate authenticates using hardcoded user accounts. In production, this would integrate with an external Identity Provider (IdP) like Auth0, Keycloak, or Cognito via OAuth2 / OIDC.

---

## 🤖 AI Collaboration

This codebase was developed in collaboration with two Google artificial intelligence platforms:
*   **Google Stitch (Design AI)**: Generated the initial high-fidelity mockups, visual components, layout tokens, and UI styles.
*   **Antigravity (Agentic Coding AI by Google DeepMind)**: Structured the monorepo workspace, modularized the monolithic React client into reusable pages and custom hooks (using React Router and TanStack Query), configured secure JWT session handling, and established the isolated pytest database lifecycle.
