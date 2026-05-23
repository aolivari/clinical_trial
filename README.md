# ClinTrack Pro - Panel de Datos de Ensayos Clínicos

Este repositorio contiene la estructura inicial, contenedorizada y modular para un panel de análisis y gestión de sujetos en ensayos clínicos de Fase III. La arquitectura sigue el patrón de diseño de **monorrepo** y ha sido integrada visualmente a partir de los diseños exportados de Google Stitch.

---

## 📁 Estructura del Proyecto

La estructura actual del repositorio sigue las mejores prácticas de modularidad:

```text
laboratorio/
├── backend/                  # API y Base de Datos (Python + FastAPI)
│   ├── app/
│   │   ├── database.py       # Configuración de SQLite y gestión de sesiones (Depends)
│   │   ├── models.py         # Tablas y entidades de base de datos (SQLModel)
│   │   ├── schemas.py        # Validaciones de entrada/salida y modelos JWT (Pydantic)
│   │   ├── test_main.py      # Casos de prueba automatizados (pytest)
│   │   └── main.py           # Rutas, Middleware de CORS, control de errores, JWT Auth y lifespan
│   ├── Dockerfile            # Construcción multi-etapa optimizada
│   └── requirements.txt      # Dependencias de Python (FastAPI, SQLModel, PyJWT, pytest, etc.)
├── frontend/                 # Interfaz de Usuario (React + TS + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts     # Cliente Axios configurado para comunicar con la API
│   │   ├── App.tsx           # Componente principal con los 4 flujos integrados de Stitch
│   │   ├── types.ts          # Interfaces de tipado TypeScript estrictas
│   │   ├── index.css         # Inyección de Tailwind y scrollbars personalizadas
│   │   ├── vite-env.d.ts     # Tipado de cliente y variables de entorno para Vite
│   │   └── main.tsx          # Punto de entrada de React
│   ├── index.html            # Plantilla base HTML con fuentes y Google Material Symbols
│   ├── tailwind.config.js    # Paleta de colores extendida del sistema de diseño
│   ├── postcss.config.js     # Configuración de PostCSS
│   ├── tsconfig.json         # Configuración estricta de TypeScript
│   └── Dockerfile            # Contenedor de desarrollo (Node 20 Slim)
├── docker-compose.yml        # Orquestación de contenedores locales
├── .gitignore                # Reglas de exclusión de Git para caché y SQLite local
└── README.md                 # Documentación principal (este archivo)
```

---

## 🛠️ Tecnologías Utilizadas

*   **Backend**: Python 3.11, FastAPI (Routing y ciclo de vida), SQLModel/SQLAlchemy (ORM compatible con Pydantic), SQLite (Base de datos local persistente), PyJWT (Generación de tokens JWT), Pytest (Pruebas unitarias).
*   **Frontend**: React 18, TypeScript, Vite (Servidor de desarrollo y HMR), Tailwind CSS v3 (Estilos basados en tokens de diseño), Axios (Llamadas a API), Google Material Symbols (Iconos).
*   **Contenedores**: Docker y Docker Compose para empaquetado y portabilidad.

---

## 🚀 Guía de Inicio Rápido (Desarrollo Local)

Para garantizar la máxima velocidad de desarrollo y evitar bloqueos en la red virtual de Docker (WSL2), se recomienda usar el **Esquema de Ejecución Híbrido** (Backend en Docker y Frontend local en tu máquina).

### Requisitos Previos
*   Tener **Docker Desktop** iniciado y corriendo.
*   Tener **Node.js 20+** instalado localmente.

---

### Paso 1: Levantar el Backend (Docker)
Construye la imagen del backend e inicia el contenedor en segundo plano:
```bash
# Construir la imagen del backend
docker build -t laboratorio-backend ./backend

# Correr el contenedor en el puerto 8000
docker run -d -p 8000:8000 --name clintrack-backend laboratorio-backend
```
*Puedes verificar que la API está activa y conectada a la base de datos visitando `http://localhost:8000/health` en tu navegador.*

---

### Paso 2: Iniciar el Frontend (Local en Windows)
Entra en la carpeta del frontend, instala las dependencias de Node de forma nativa e inicia el servidor Vite:
```bash
# Entrar a la carpeta del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor local
npm run dev
```
*Esto iniciará el servidor de desarrollo y te indicará la URL (usualmente `http://localhost:3000` o `http://localhost:5173`).*

---

## 🧪 Pruebas Automatizadas (Test Suite)

El backend cuenta con una suite de pruebas automatizadas que valida la salud de la API, el proceso de login por JWT y las llamadas CRUD autorizadas / no autorizadas.

### Cómo ejecutar las pruebas
Para correr el suite de pruebas en tu entorno virtual local (desde la raíz de `backend/`):
```bash
# Activar entorno virtual
.\venv\Scripts\activate

# Instalar dependencias con pytest
pip install -r requirements.txt

# Ejecutar pytest apuntando a la carpeta de la app
python -m pytest app/
```

Alternativamente, puedes ejecutarlas dentro del contenedor Docker sin instalar nada localmente:
```bash
docker exec -it clintrack-backend python -m pytest app/
```

---

## 🔑 Autenticación y Rutas Protegidas

El backend protege todas las rutas CRUD de participantes (`/api/v1/participants`) utilizando cabeceras **Bearer JWT**.

### Credenciales Predefinidas
*   **Correo Electrónico**: `researcher@clintrack.com`
*   **Contraseña**: `password123`

### Cómo probar la ruta protegida manualmente
1. **Paso 1: Obtener el Token JWT**
   Realiza una petición POST a `/api/v1/auth/login`:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "researcher@clintrack.com", "password": "password123"}'
   ```
   *Esto te devolverá un JSON con la propiedad `access_token`.*

2. **Paso 2: Consultar la Ruta Protegida**
   Usa el token obtenido para consultar los participantes:
   ```bash
   curl -X GET http://localhost:8000/api/v1/participants \
     -H "Authorization: Bearer INSERTA_AQUI_EL_TOKEN"
   ```
   *Si no provees la cabecera correcta, recibirás un error `403 Forbidden`.*

---

## 📈 Observabilidad y Monitoreo (Roadmap)

En una versión productiva, implementaríamos las siguientes prácticas de observabilidad:
1. **Métricas con Prometheus**: Exponer un endpoint `/metrics` en FastAPI usando `prometheus-client` para medir tiempos de respuesta de endpoints, tasa de error y uso de memoria.
2. **Trazas Distribuidas con OpenTelemetry**: Instrumentar FastAPI y Axios para enviar trazas distribuidas a colectores como Jaeger o AWS X-Ray, permitiendo visualizar la latencia de extremo a extremo.
3. **Logs Estructurados (JSON)**: Sustituir el formateador de Python por defecto por `structlog` para generar registros estructurados en JSON listos para ser consumidos por agregadores de logs (Datadog, Kibana o Grafana Loki).

---

## 🔄 Pipeline CI/CD (Roadmap)

El flujo de integración y despliegue continuo propuesto mediante GitHub Actions incluye:
1. **Linter & Type Checking**: Ejecución automática de `flake8` / `black` para Python y `eslint` / `tsc` para React ante cada Pull Request.
2. **Unit Tests Run**: Ejecución del suite de `pytest` en un ambiente Docker efímero.
3. **Build & Push**: Construcción de las imágenes Docker de frontend y backend, y almacenamiento en AWS ECR o Docker Hub.
4. **Deploy**: Actualización automática de las tareas de Amazon ECS o Kubernetes utilizando infraestructura como código (Terraform).

---

## ⚖️ Trade-offs (Decisiones de Diseño)

*   **SQLite sobre PostgreSQL**: Se optó por SQLite para agilizar la puesta en marcha en desarrollo local y evitar requerir levantar motores adicionales de base de datos complejos.
*   **Ruteo de React basado en Estado**: Para mantener el monorrepo simple y evitar meter complejidad adicional en el boilerplate, se utilizó un estado global (`currentPage`) para navegar entre las vistas de Stitch en lugar de configurar `react-router-dom`.
*   **Credenciales Estáticas**: Por ser un boilerplate de desafío técnico, el login utiliza credenciales fijas. En producción se integraría contra un proveedor Identity Provider (IdP) como Auth0, Keycloak o Cognito mediante OAuth2 / OIDC.

---

## 🤖 Uso de Herramientas de IA

Este proyecto fue desarrollado en colaboración con **Antigravity**, el asistente de codificación de inteligencia artificial de Google DeepMind.
*   **Asistencia**: Utilizado para la estructuración del monorrepo, generación de los componentes React a partir del análisis directo de los archivos HTML de Stitch y diseño de la suite de pruebas unitarias automatizadas en pytest.
