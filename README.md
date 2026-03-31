# > Interview\_Quiz 🟢

> **Plataforma de simulación de entrevistas técnicas con análisis de respuestas mediante IA utilizando transformers**

Proyecto desarrollado por **Juan** y **Benjamín**.

🔗 **Demo en vivo:** (![]https://interviewquiz.404.mn/)
| Imagen 1 | Imagen 2 |
|----------|----------|
| ![](https://github.com/user-attachments/assets/f4368903-ce09-47ab-bf6c-0d95ec383eae) | ![](https://github.com/user-attachments/assets/7dfeb427-a80d-4ffd-aa53-e3c9c462aac7) |

| Imagen 3 |
|----------|
|<img width="1680" height="936" alt="image" src="https://github.com/user-attachments/assets/1b9d14cb-907b-4b8e-a806-44d00e3a7911" />|


## ¿Qué es Interview\_Quiz?

Interview\_Quiz es una aplicación web para prepararse para **entrevistas técnicas de trabajo** en desarrollo de software. El sistema te presenta preguntas reales de entrevistas con tiempo límite, evalúa tus respuestas usando **modelos de transformers (IA)**, te muestra la respuesta correcta y te da feedback detallado para que puedas mejorar.

### ¿Cómo funciona?

1. 🗂️ **Elegís un módulo** — Frontend con React, Backend con Node.js, Base de datos SQL, Fullstack, etc.
2. ⏱️ **Configurás la duración** — 5, 10, 15 o 30 minutos según tu disponibilidad
3. ✍️ **Respondés preguntas** — Respuesta libre bajo presión de tiempo, como en una entrevista real
4. 🤖 **La IA analiza tu respuesta** — Transformers evalúan semánticamente qué tan cerca estás de la respuesta correcta
5. 📊 **Obtenés un análisis completo** — Puntaje por pregunta, feedback individual y overview general

---

## ✨ Características principales

| Feature | Descripción |
|---------|-------------|
| ⏱️ **Modo contrarreloj** | Tiempo límite configurable (5, 10, 15, 30 minutos) |
| 🤖 **Análisis con Transformers** | Evaluación semántica, no solo por keywords |
| ✅ **Respuesta correcta** | Visible después de responder para aprender del error |
| 📊 **AI Overview en tiempo real** | Panel lateral que acumula tu puntaje mientras avanzás |
| 🏷️ **Filtrado por etiquetas** | Módulos por tecnología: React, Node.js, SQL, TypeScript... |
| 🔍 **Buscador de módulos** | Encontrá el tema que necesitás practicar |
| 📈 **Reporte final** | Feedback por pregunta + análisis integral de desempeño |

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL |
| IA / Análisis | Transformers (análisis semántico de respuestas) |
| Infraestructura local | Docker + Docker Compose |
| Infraestructura cloud | CubePath + Dokploy |

---

## ☁️ Despliegue con CubePath y Dokploy

El proyecto está alojado usando **CubePath** como plataforma de infraestructura cloud, con **Dokploy** como herramienta de deployment y gestión de servicios.

### Arquitectura en producción

```
                    ┌──────────────────────────────────┐
                    │            CubePath               │
                    │      (Infraestructura cloud)      │
                    │                                   │
                    │   ┌───────────────────────────┐   │
                    │   │          Dokploy           │   │
                    │   │  (Gestión de deployments)  │   │
                    │   └────────────┬──────────────┘   │
                    │                │                  │
                    │   ┌────────────┼────────────┐     │
                    │   ▼            ▼            ▼     │
                    │ [Frontend]  [Backend]    [DB]     │
                    │  (Vite)    (Express)  (Postgres)  │
                    └──────────────────────────────────┘
                                    │
                            Acceso del cliente
                                    │
                                 🌐 Web
```

### Servicios desplegados

| Servicio | Tecnología | Descripción |
|----------|-----------|-------------|
| **Frontend** | Vite (React) | Interfaz de usuario servida como SPA |
| **Backend** | Express (Node.js) | API REST que procesa preguntas y analiza respuestas |
| **Base de datos** | PostgreSQL | Almacena módulos, preguntas y etiquetas |

### ¿Por qué Docker + CubePath?

Cada servicio corre en su propio **contenedor Docker**, lo que permite:

- 🚀 **Despliegue rápido** — `docker-compose up --build` y el entorno está listo
- 🔁 **Consistencia** — El mismo entorno en desarrollo y producción
- 📦 **Aislamiento** — Frontend, backend y base de datos independientes entre sí
- 🔧 **Gestión visual** — Dokploy permite monitorear y redesplegar servicios desde una interfaz web

---

## 🚀 Setup y ejecución local

### Prerrequisitos

- Docker y Docker Compose instalados
- Node.js (para desarrollo local sin Docker)

### Primera vez — Inicializar con semilla

Antes de correr el proyecto por primera vez, **activá la semilla en el Dockerfile del backend**:

```dockerfile
# En el Dockerfile del backend, seteá SEED=true la primera vez
ENV SEED=true
```

Luego ejecutá:

```bash
npm run docker:up
```

> ⚠️ **Importante:** Una vez inicializada la base de datos, **desactivá la semilla** (`SEED=false`) en el Dockerfile. A partir de ahí podés correr normalmente con `docker-compose up --build` o `docker-compose up`.

---

### Comandos principales

| Comando | Descripción |
|---------|-------------|
| `npm run docker:up` | Ejecuta frontend, backend y base de datos con Docker Compose |
| `npm run docker:down` | Detiene y elimina los contenedores |
| `npm run dev:frontend` | Ejecuta solo el frontend en modo desarrollo (Vite). Requiere DB y backend corriendo |
| `npm run dev:backend` | Ejecuta solo el backend en modo desarrollo (ts-node/Express). Requiere DB corriendo |
| `npm run build:frontend` | Compila el frontend para producción (TypeScript + Vite build) |
| `npm run build:backend` | Compila el backend a JavaScript (TypeScript → `dist/`) |
| `npm run lint:frontend` | Ejecuta ESLint en el frontend |

> Todos los comandos están centralizados en el **root folder** del proyecto para simplificar el workflow.

---

## 🗄️ Base de datos — Notas importantes

### Unicidad de etiquetas (obligatorio en producción)

Para evitar etiquetas duplicadas en la tabla `etiqueta`, aplicá estas constraints en PostgreSQL:

```sql
-- 1. Unicidad básica
ALTER TABLE etiqueta
ADD CONSTRAINT etiqueta_nombre_unique UNIQUE (nombre);

-- 2. Unicidad ignorando mayúsculas/minúsculas (recomendado)
-- Esto hace que "JavaScript" y "javascript" sean considerados duplicados
CREATE UNIQUE INDEX etiqueta_nombre_unique_lower
ON etiqueta (LOWER(nombre));
```

> PostgreSQL diferencia `JavaScript` de `javascript` por defecto. El índice sobre `LOWER(nombre)` resuelve esto a nivel base de datos, independientemente de bugs en el backend.

---

## 📚 Módulos disponibles

| Módulo | Nivel | Etiquetas |
|--------|-------|-----------|
| Frontend con React | Facil Intermedio avanzado | `react` `javascript` `typescript` |
| Backend con Node.js | Facil Intermedio avanzado| `node.js` `javascript` `typescript` |
| Base de datos SQL | Facil Intermedio avanzado| `sql` |
| Fullstack con React | Facil Intermedio avanzado| `react` `node.js` `typescript` `sql` `javascript` |

---

## 👨‍💻 Créditos

Proyecto creado por **Juan** y **Benjamín** 🚀
