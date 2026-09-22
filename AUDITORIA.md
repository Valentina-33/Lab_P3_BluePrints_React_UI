# Auditoría del laboratorio – Blueprints React UI

Documento de trabajo para hacer seguimiento del laboratorio paso a paso. No reemplaza al [README](./README.md) (que define los requerimientos oficiales); aquí registramos **estado real verificado**, hallazgos técnicos y el plan de avance.

> Los commits de cada punto los hace Paula manualmente. Este documento se actualiza en cada sesión de trabajo.

## Estado: los 7 requerimientos obligatorios están cerrados

Paula cerró los puntos 1 a 4 y Mariana cerró los puntos 5, 6 y 7 (ver checklist en la sección 5 y el detalle narrado en [EVIDENCIAS.md](./EVIDENCIAS.md)). Todo queda pendiente únicamente de **tu revisión y tus commits manuales** (cada punto por separado, como se ha venido haciendo). Lo único opcional que queda por fuera son las actividades sugeridas del README (loading/error por thunk, `<PrivateRoute>`, CRUD completo, etc. — sección "Recomendaciones y actividades sugeridas"), que no son obligatorias.

**Estado del entorno al cerrar esta sesión (2026-09-21):**
- `.env` quedó con `VITE_USE_MOCK=true` (no necesitas backend para trabajar en la UI/estilos/tests).
- Si necesitas probar contra el backend real: Postgres está corriendo en Docker (contenedor `blueprints-db`, si ya no está arriba: `docker run --name blueprints-db -e POSTGRES_DB=blueprints_db -e POSTGRES_USER=blueprints_user -e POSTGRES_PASSWORD=blueprints_pass -p 5432:5432 -d postgres:16`), y el backend P2 se levanta con `cd ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT && mvn -q -DskipTests spring-boot:run`. El login real (`POST /auth/login`, usuario `student`/`student123`) da un token de solo 30 segundos, así que para probar a mano hay que ser rápido.
- Todos los cambios están sin commitear todavía (cada punto se commitea manualmente al cerrarlo).

---

## 1. Resumen ejecutivo (auditoría inicial – 2026-09-21)

- El frontend (`Lab_P3_BluePrints_React_UI`) tiene ya una base funcional: Canvas, listado por autor, apertura/dibujo de un plano, Redux Toolkit, estilos propios y 4 archivos de test.
- **El requerimiento #4 (servicios `apimock`/`apiclient` intercambiables) todavía no está implementado.** Hoy solo existe `apiClient.js` (axios puro), sin mock ni `blueprintsService.js`.
- ~~Los tests no corrían~~ → **corregido en esta sesión** (ver sección 6): eran 3 bugs reales, no solo config. Los 4 test files pasan ahora.
- **El frontend y los backends de los labs anteriores no calzan en las rutas ni en el formato de respuesta**, así que la integración real fallaría en varios puntos si se conecta tal cual (detalle y evidencia verificada en la sección 4).
- **Los backends requieren PostgreSQL** (ya migrados de memoria a Postgres). Se levantó Postgres vía Docker y se arrancó y **validó end-to-end el backend P2** (login, CRUD real, endpoint stub) — ver sección 3.

---

## 2. Repos involucrados

| Carpeta | Rol | Stack | Puerto por defecto |
|---|---|---|---|
| `Lab_P1_BluePrints_Java21_API` | Backend base (CRUD blueprints, sin seguridad) | Spring Boot 3 / Java 21 / Postgres | 8080 |
| `ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT` | Backend con seguridad JWT (OAuth2 Resource Server), extiende P1 | Spring Boot 3 / Java 21 / Postgres | 8080 |
| `Lab_P3_BluePrints_React_UI` | Frontend (este laboratorio) | React + Vite + Redux Toolkit + Axios | 5173 |

Como **ambos backends escuchan en el puerto 8080**, no se pueden correr los dos al mismo tiempo sin cambiar `server.port` en uno de ellos.

> **Decisión (2026-09-21):** trabajamos la integración real contra **P2** (`ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT`), porque internamente expone también el controlador heredado de P1 (`/api/v1/blueprints`) además del suyo propio (`/api/blueprints`), y es el que trae login + rutas protegidas. Postgres se levanta con Docker Desktop (el usuario lo abre manualmente).

---

## 3. Cómo levantar los backends

### 3.1 Prerrequisito: PostgreSQL

Tanto P1 como P2 tienen configurado en su `application.properties`/`application.yml`:

```
jdbc:postgresql://localhost:5432/blueprints_db
usuario: blueprints_user
password: blueprints_pass
```

No existe un `docker-compose.yml` con Postgres en ninguno de los tres repos, así que se levantó manualmente:

```bash
docker run --name blueprints-db -e POSTGRES_DB=blueprints_db -e POSTGRES_USER=blueprints_user -e POSTGRES_PASSWORD=blueprints_pass -p 5432:5432 -d postgres:16
```

✅ Verificado el 2026-09-21: contenedor arriba y aceptando conexiones en el puerto 5432.

### 3.2 Levantar Lab P1 (backend base)

```bash
cd Lab_P1_BluePrints_Java21_API
mvn clean install
mvn spring-boot:run
```

Probado el 2026-09-21 (antes de tener Postgres arriba): **falló al iniciar** con `Unable to determine Dialect without JDBC metadata`. Es el comportamiento esperado sin base de datos, no un bug de código. No se volvió a probar después de levantar Postgres (se priorizó P2 según la decisión de la sección 2).

### 3.3 Levantar Lab P2 (backend con JWT) ✅ Verificado end-to-end

```bash
cd ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT
mvn -q -DskipTests spring-boot:run
```

Probado el 2026-09-21 con Postgres arriba: **arranca correctamente** en `http://localhost:8080` (Hibernate crea las tablas `blueprints` y `blueprint_points` automáticamente con `ddl-auto: update`). Flujo completo probado con `curl`:

1. `POST /auth/login` con `{"username":"student","password":"student123"}` → devuelve `access_token` (RS256, `token_type: Bearer`, **expira en solo 30 segundos** — `token-ttl-seconds: 30` en `application.yml`, muy corto incluso para pruebas manuales con Swagger).
2. `GET /api/v1/blueprints/john` sin token → `401`. Con token → `200` (respuesta real de la API, protegida).
3. `POST /api/v1/blueprints` con token y body `{"author":"john","name":"house","points":[...]}` → `201`.
4. `GET /api/v1/blueprints/john/house` con token → `200` con el blueprint recién creado, puntos incluidos.
5. `GET /api/blueprints` (el endpoint *stub* de P2) con o sin token distinto: sin token `401`; con token devuelve el array fijo `[{"name":"Casa de campo","id":"b1"},...]`, **sin campo `author`** — confirma H1.

El backend quedó corriendo en background para poder probar el frontend contra él en el siguiente paso.

### 3.4 Frontend

```bash
cd Lab_P3_BluePrints_React_UI
npm install
cp .env.example .env   # ya trae VITE_API_BASE_URL=http://localhost:8080/api
npm run dev
```

Probado el 2026-09-21: `npm install` OK (393 paquetes, sin errores; 4 vulnerabilidades moderadas reportadas por npm audit, no urgentes). `npm run dev` no se probó todavía end-to-end contra un backend real.

---

## 4. Hallazgos de compatibilidad Frontend ↔ Backend

Estos son los puntos que **van a romper la integración real** aunque el código de cada lado esté bien hecho por separado. Los dejamos listados para decidir juntos cómo resolverlos (¿ajustamos el frontend, el backend, o ambos?).

| # | Hallazgo | Dónde | Severidad |
|---|---|---|---|
| H1 | El frontend llama `GET /api/blueprints` esperando un array plano de `{author, name, points}` para derivar autores ([blueprintsSlice.js:4-9](Lab_P3_BluePrints_React_UI/src/features/blueprints/blueprintsSlice.js)). En **P2**, `/api/blueprints` es un endpoint *stub* didáctico que devuelve 2 objetos fijos `{id, name}` sin `author` ([BlueprintController.java](ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT/src/main/java/co/edu/eci/blueprints/api/BlueprintController.java)) y no tiene rutas `/author` ni `/author/name`. En **P1** esa ruta no existe (404): ahí la API real vive en `/api/v1/blueprints`. | Frontend vs ambos backends | Alta – bloquea el requerimiento 2 y 3 tal como está |
| H2 | El login del frontend llama `POST /api/auth/login` (porque `baseURL` ya incluye `/api`) ([LoginPage.jsx:13](Lab_P3_BluePrints_React_UI/src/pages/LoginPage.jsx)). El backend real (P2) expone `POST /auth/login` (sin `/api`) ([AuthController.java:15,39](ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT/src/main/java/co/edu/eci/blueprints/auth/AuthController.java)). Con la config actual, el login siempre daría 404. | Frontend vs P2 | Alta – bloquea JWT/creación protegida |
| H3 | El login espera `data.token` ([LoginPage.jsx:14](Lab_P3_BluePrints_React_UI/src/pages/LoginPage.jsx)), pero P2 devuelve `{ access_token, token_type, expires_in }` ([AuthController.java:29](ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT/src/main/java/co/edu/eci/blueprints/auth/AuthController.java)). | Frontend vs P2 | Alta |
| H4 | En P2, `SecurityConfig` protege **todo** `/api/**` con `hasAnyAuthority(SCOPE_blueprints.read/write)` ([SecurityConfig.java:28](ARSW_Lab_P2_BluePrints_Java21_API_Security_JWT/src/main/java/co/edu/eci/blueprints/security/SecurityConfig.java)), incluyendo `/api/v1/blueprints/**` (la API real heredada de P1). Es decir: si se usa P2, **hasta los `GET` de consulta van a necesitar JWT**, no solo el `POST` como asume el README de este lab. | P2 | Media – afecta diseño de la UI (login antes de listar) |
| H5 | No existe todavía `blueprintsService.js` ni un servicio `apimock`, por lo que hoy no es posible alternar `VITE_USE_MOCK` como pide el requerimiento 4. Sin mock, cualquier trabajo de UI queda bloqueado por la disponibilidad del backend/Postgres. | Frontend | Alta – es prerrequisito práctico para poder trabajar el resto sin depender de Postgres |
| H6 | **Confirmado con `curl` el 2026-09-21.** La API real (`/api/v1/blueprints/**`) envuelve toda respuesta en `{ code, message, data }` (ver `ApiResponse<T>` descrito en el README de P1). El frontend hoy asume que `api.get(...)` devuelve el array/objeto directamente (`data.map(...)` en `fetchAuthors`, [blueprintsSlice.js:7](Lab_P3_BluePrints_React_UI/src/features/blueprints/blueprintsSlice.js)). Si se apunta el frontend a `/api/v1/blueprints`, hay que leer `data.data`, no `data`. **Resuelto en Requerimiento 2** para `fetchByAuthor`. |
| H7 | **Confirmado en el navegador el 2026-09-21.** `SecurityConfig` en P2 no tiene configurado `.cors(...)`, así que cualquier request desde `http://localhost:5173` (el frontend) al backend en `http://localhost:8080` es bloqueada por el navegador (preflight `OPTIONS` → `403`, request real → `net::ERR_FAILED`). Con `curl` no se nota porque CORS es una restricción exclusiva del navegador. **Resuelto en Requerimiento 2** sin tocar el backend: se agregó un proxy de desarrollo en `vite.config.js` (`/api` → `http://localhost:8080`) y se cambió la baseURL de axios a relativa (`/api`), así el navegador solo le habla a `localhost:5173` y Vite reenvía por detrás. *Ojo: este proxy solo aplica en `npm run dev`; para un build de producción real (`npm run preview` o Docker) sigue haciendo falta CORS en el backend o un reverse proxy delante de ambos.* | Frontend vs P2 | Alta – sin esto, **ninguna** petición desde el navegador funciona, aunque las rutas estén bien |

**Recomendación para desbloquear el trabajo ya:** implementar primero el requerimiento 4 (`apimock` + `blueprintsService.js`) para poder avanzar y probar UI/Redux/tests sin depender de que Postgres esté arriba, y en paralelo decidir con cuál backend (P1 o P2) y qué rutas va a hablar `apiClient` cuando se use el real.

---

## 5. Checklist de requerimientos del laboratorio (estado real verificado)

| # | Requerimiento | Estado | Notas |
|---|---|---|---|
| 1 | Canvas (`BlueprintCanvas`, dimensiones ~520×360) | ✅ Cerrado (2026-09-21) | [BlueprintCanvas.jsx](Lab_P3_BluePrints_React_UI/src/components/BlueprintCanvas.jsx): dimensiones 520×360 por defecto, no ocupa toda la pantalla (`maxWidth`). Se agregó prop `id` (default `"blueprint-canvas"`) para que el `<canvas>` tenga un identificador propio explícito en el DOM, no solo el `ref` de React. |
| 2 | Listar planos de un autor (input + tabla: nombre, # puntos, botón Open) | ✅ Cerrado (2026-09-21) | [BlueprintsPage.jsx](Lab_P3_BluePrints_React_UI/src/pages/BlueprintsPage.jsx). Validado end-to-end en el navegador contra el backend P2 real (autor `john`, plano `house`, 2 puntos). Se corrigieron H1 (ruta), H6 (desempaquetar `data.data`) y H7 (CORS vía proxy de Vite) para `fetchByAuthor`. También se quitó el `dispatch(fetchAuthors())` automático al montar la página: no se usaba en ningún lado y solo generaba una petición fallida que ensuciaba el estado `status` compartido. |
| 3 | Seleccionar y graficar un plano (texto con nombre + dibujo) | ✅ Cerrado (2026-09-21) | `openBlueprint` + `fetchBlueprint` + `BlueprintCanvas`. Validado en el navegador contra P2: al abrir `john/house` se actualizó "Current blueprint: house" y el canvas dibujó la línea + los 2 puntos. Se corrigió H1/H6 en `fetchBlueprint` (mismo patrón que en el requerimiento 2). |
| 4 | Servicios `apimock`/`apiclient` intercambiables vía `VITE_USE_MOCK` | ✅ Cerrado (2026-09-21) | Nuevos `blueprintsMockClient.js`, `blueprintsApiClient.js`, `blueprintsService.js` (switch por `VITE_USE_MOCK`). `blueprintsSlice.js` migrado para usar el servicio. Validado en el navegador con `VITE_USE_MOCK=true` (autor `maria`, datos en memoria) y `VITE_USE_MOCK=false` (autor `john`, backend real) — ambos funcionan sin tocar código, solo la variable de entorno. |
| 5 | Nombre del plano actual en estado global (Redux), sin manipular el DOM | ✅ Cerrado (2026-09-21) | `current` en `blueprintsSlice.js`, leído vía `useSelector` en [BlueprintsPage.jsx](Lab_P3_BluePrints_React_UI/src/pages/BlueprintsPage.jsx). Se revisó todo `src/` buscando manipulación directa del DOM (`document.*`, `innerHTML`, `querySelector`) y lo único que aparece es el `document.getElementById('root')` estándar de `main.jsx` (el bootstrap obligatorio de React, no una violación del requisito). El canvas dibuja vía `ctx` obtenido por `ref` (API nativa necesaria para pintar), no manipulación del DOM. Ya estaba evidenciado visualmente en la Figura 5 del punto 3 (el texto "Current blueprint: house" sale del estado Redux). |
| 6 | Estilos | ✅ Cerrado (2026-09-21) | [styles.css](Lab_P3_BluePrints_React_UI/src/styles.css), tema oscuro propio (no Bootstrap, el requerimiento no lo exige específicamente). Se movieron los estilos inline de la tabla/layout en `BlueprintsPage.jsx` a clases reutilizables (`.table`, `.page-layout`, `.search-row`, `.stat-line`, `.muted`, `.error-text`), se agregaron estados `:hover`/`:focus`/`:disabled` a botones e inputs, hover en filas de tabla, y una media query para que el layout de dos columnas colapse a una en pantallas angostas (`max-width: 720px`). Tests (4/4) y lint en verde tras el cambio. Confirmado visualmente por Mariana en el navegador (capturas en [EVIDENCIAS.md](./EVIDENCIAS.md), Figuras 9-12), incluyendo el colapso responsive. De paso se detectó y corrigió que faltaba el archivo `.env` local (solo existía `.env.example`), por lo que el mock no estaba activo. |
| 7 | Pruebas unitarias (canvas, formulario, Redux) | ✅ Cerrado (2026-09-21) | Los 3 requisitos del README ya estaban cubiertos por los 4 tests originales (render de canvas, envío de formulario, dispatch de `fetchByAuthor`) — ver sección 6 para el detalle de los 3 bugs que se arreglaron primero. Se detectó un hueco real: nada cubría lo construido en los puntos 2-4 (reducers del slice más allá del estado inicial, servicios `apimock`/`apiclient`). Se agregaron 8 tests nuevos: [`tests/blueprintsSlice.test.jsx`](Lab_P3_BluePrints_React_UI/tests/blueprintsSlice.test.jsx) (3 casos nuevos: `fetchByAuthor.fulfilled`, `fetchBlueprint.fulfilled`, `createBlueprint.fulfilled`) y [`tests/blueprintsMockClient.test.jsx`](Lab_P3_BluePrints_React_UI/tests/blueprintsMockClient.test.jsx) (5 casos: `getAll`, `getByAuthor`, `getByAuthorAndName` encontrado/no encontrado, `create`). De paso se limpió un `fetchAuthors` muerto en el mock de `tests/BlueprintsPage.test.jsx` (ya no existe en el slice real desde el punto 2). Total: 5 archivos de test, 12/12 pasando, lint en verde. No se agregaron tests para `blueprintsApiClient.js` (requeriría mockear Axios) ni para el switch de `blueprintsService.js` (depende de `import.meta.env` en tiempo de carga del módulo) — quedan fuera de alcance por ahora, no bloquean el requisito. |

---

## 6. Otros hallazgos técnicos

### Bugs de tests corregidos en esta sesión (2026-09-21)

1. **`vitest.config.js` sin `globals: true`**: `tests/setup.js` y todos los tests usan `expect`/`describe`/`it` como globales, pero no estaban habilitados → `ReferenceError: expect is not defined` en los 4 archivos. *(Fix: [vitest.config.js](Lab_P3_BluePrints_React_UI/vitest.config.js))*.
2. **Mock de canvas con guarda condicional incorrecta**: `tests/setup.js` solo definía `HTMLCanvasElement.prototype.getContext` `if (!HTMLCanvasElement.prototype.getContext)`. jsdom **sí** define ese método (a diferencia de lo que asumía el código), pero al invocarlo lanza `Not implemented`, así que la condición nunca activaba el mock y el test real fallaba con `Cannot read properties of null`. *(Fix: sobrescribir siempre, sin condición — [tests/setup.js](Lab_P3_BluePrints_React_UI/tests/setup.js))*.
3. **Labels sin asociar a sus inputs en `BlueprintForm`**: los `<label>` de Autor/Nombre/Puntos no tenían `htmlFor`, así que `getByLabelText` de Testing Library no encontraba el control asociado (fallo real de accesibilidad, no solo de test). *(Fix: `htmlFor`/`id` en los 3 campos — [BlueprintForm.jsx](Lab_P3_BluePrints_React_UI/src/components/BlueprintForm.jsx))*.

### Pendientes

- **CI (`.github/workflows/node-ci.yml`)** corre `lint`, `test` y `build` en cada push/PR — con los fixes de tests aplicados debería pasar en el próximo push (no se corrió `lint`/`build` todavía en esta sesión, pendiente de verificar).
- **`docker-compose.yml`** del frontend apunta a `ghcr.io/your-org/blueprints-backend:latest`, una imagen que no existe/no aplica a este proyecto (es una plantilla genérica). Si se quiere usar Docker para todo el stack (frontend + P2 + Postgres), hay que reescribirlo.
- **`npm audit`**: 4 vulnerabilidades moderadas en dependencias de desarrollo (no bloqueante, revisar antes de la entrega final).

---

## 7. Plan de trabajo

Vamos a ir **en el orden exacto de los 7 requerimientos del README** (sección "📌 Requerimientos del laboratorio"), uno a la vez. Al cerrar cada punto, Paula (puntos 1-4) o Mariana (puntos 5 en adelante) lo revisa, aprende qué se hizo y hace el commit manualmente antes de pasar al siguiente.

- [x] **Preparación (infraestructura, no es un requerimiento del README)**: Postgres vía Docker + backend P2 arrancado y validado con `curl`; y arreglo de los 4 tests que estaban rotos (bugs reales, no solo config). Esto no bloquea nada del checklist, era necesario para poder probar cualquier punto contra un backend real. *(2026-09-21, ver bitácora)*
- [x] **Requerimiento 1 — Canvas**: cerrado. `id` propio agregado a `BlueprintCanvas`. Tests siguen pasando (4/4). *Pendiente: tu commit.* *(2026-09-21)*
- [x] **Requerimiento 2 — Listar planos de un autor**: cerrado. Se corrigieron ruta, formato de respuesta, CORS (H1/H6/H7) y se quitó código muerto. Probado en el navegador contra el backend real. Tests y lint en verde. *Pendiente: tu commit.* *(2026-09-21)*
- [x] **Requerimiento 3 — Seleccionar un plano y graficarlo**: cerrado. Se corrigió `fetchBlueprint` (misma ruta/desempaquetado que el punto 2). Probado en el navegador: al abrir `john/house` se actualizó el texto y se dibujó el plano en el canvas. Tests y lint en verde. *Pendiente: tu commit.* *(2026-09-21)*
- [x] **Requerimiento 4 — Servicios `apimock`/`apiclient`**: cerrado. Servicios nuevos + slice migrado. Probado en ambos modos (mock y real) en el navegador. Tests y lint en verde. *Pendiente: tu commit.* *(2026-09-21)*
- [x] **Requerimiento 5 — Interfaz con React (estado en Redux)**: cerrado. Ya estaba resuelto de fondo, no requirió cambios de código: se revisó todo `src/` en busca de manipulación directa del DOM y no se encontró ninguna (fuera del bootstrap estándar de React en `main.jsx`). El nombre del plano actual sale de `current` en `blueprintsSlice.js` vía `useSelector`. *Pendiente: tu commit.* *(2026-09-21)*
- [x] **Requerimiento 6 — Estilos**: cerrado. Se movieron estilos inline a clases CSS reutilizables, se agregaron estados de interacción (hover/focus/disabled) y responsive. Tests y lint en verde. Confirmado visualmente por Mariana en el navegador (capturas en EVIDENCIAS.md). *Pendiente: tu commit.* *(2026-09-21)*
- [x] **Requerimiento 7 — Pruebas unitarias**: cerrado. Los 3 casos que pide el README ya estaban cubiertos; se agregaron 8 tests nuevos para cerrar el hueco de los puntos 2-4 (reducers del slice, servicio mock). 12/12 tests y lint en verde. *Pendiente: tu commit.* *(2026-09-21)*

**Los 7 requerimientos obligatorios del README están cerrados.** El detalle de cada uno (qué ya existe, qué falta) está en la sección 5. Las actividades sugeridas/opcionales del README (loading/error por thunk, `<PrivateRoute>`, CRUD completo, etc.) quedan como posible trabajo futuro, no son obligatorias.

---

## 8. Bitácora de auditoría

### 2026-09-21 — Auditoría inicial + Pasos 0 y 1
- Revisado el código completo del frontend (componentes, slice, store, servicios, estilos, tests).
- Revisados los backends P1 y P2 (controladores, seguridad, configuración de datos).
- `npm install` y `npm test` ejecutados en el frontend → instalación OK, tests fallando.
- Intento de arrancar Lab P1 → falla por falta de Postgres (Docker Desktop no estaba corriendo en ese momento).
- Documentados 6 hallazgos de incompatibilidad frontend↔backend (H1–H6) y checklist de los 7 requerimientos del laboratorio.
- Decisión con Paula: trabajar la integración real contra **P2**; Postgres vía Docker (ella lo abrió manualmente).
- Postgres levantado con `docker run` (imagen `postgres:16`).
- Backend P2 arrancado y **validado end-to-end con `curl`**: login, CRUD real (`/api/v1/blueprints`), endpoint stub (`/api/blueprints`). Confirmado el hallazgo H6 (respuestas envueltas en `{code,message,data}`) y reconfirmados H1–H4 con evidencia real, no solo lectura de código.
- Corregidos 3 bugs reales que rompían los tests (no solo config): `vitest.config.js` sin `globals`, mock de `getContext` con guarda incorrecta, labels sin `htmlFor` en `BlueprintForm`. Los 4 test files pasan ahora.
- Backend P2 quedó corriendo en background para las próximas pruebas del frontend.
- Reordenado el plan de la sección 7 para seguir el orden exacto de los 7 requerimientos del README (a petición de Paula), en vez del orden propio que se había propuesto inicialmente.
- **Cerrado el Requerimiento 1 (Canvas)**: agregado `id` propio (default `"blueprint-canvas"`) a `BlueprintCanvas.jsx`. Verificado que los 4 tests siguen pasando. Pendiente de review y commit manual.
- **Cerrado el Requerimiento 2 (Listar planos de un autor)**: se corrigió la ruta y el desempaquetado de la respuesta en `fetchByAuthor` (`blueprintsSlice.js`), se quitó el `dispatch(fetchAuthors())` muerto en `BlueprintsPage.jsx`, y se encontró y resolvió un hallazgo nuevo (H7, CORS) agregando un proxy de desarrollo en `vite.config.js` + baseURL relativa en `apiClient.js` + `.env.example` actualizado. Probado en el navegador (con un token inyectado a mano, ya que el login real todavía no está conectado): la tabla mostró correctamente el plano `house` del autor `john` con sus 2 puntos. Tests (4/4) y lint en verde. Pendiente de review y commit manual.
- **Cerrado el Requerimiento 3 (Seleccionar un plano y graficarlo)**: se corrigió `fetchBlueprint` (mismo patrón de ruta/desempaquetado que `fetchByAuthor`). Probado en el navegador: al darle clic a "Open" en la fila de `house`, se actualizó "Current blueprint: house" y el canvas dibujó la línea entre los 2 puntos con cada uno marcado. Tests (4/4) y lint en verde. Pendiente de review y commit manual.
- **Cerrado el Requerimiento 4 (Servicios `apimock`/`apiclient`)**: se crearon `blueprintsMockClient.js` (datos de prueba en memoria: autores `maria` y `carlos`), `blueprintsApiClient.js` (misma interfaz usando Axios contra `/v1/blueprints/**`) y `blueprintsService.js` (switch por `VITE_USE_MOCK`). Se migró `blueprintsSlice.js` para usar el servicio en vez de Axios directo, y se terminó de eliminar `fetchAuthors` (dead code desde el punto 2, ahora cubierto por `getAll` en la interfaz del servicio). Nota de nombres: el servicio real no se llamó `apiclient.js` (como sugiere el README) porque en Windows colisionaría con el `apiClient.js` ya existente (filesystem case-insensitive); se llamó `blueprintsApiClient.js` en su lugar, documentado en un comentario. Validado en el navegador en ambos modos: `VITE_USE_MOCK=true` con el autor `maria` (datos en memoria, sin backend) y `VITE_USE_MOCK=false` con el autor `john` (backend real), cambiando solo la variable de entorno. Tests (4/4) y lint en verde. Pendiente de review y commit manual.
- **Cerrado el Requerimiento 5 (Interfaz con React / estado en Redux)**: no requirió cambios de código, ya estaba resuelto de fondo. Se verificó explícitamente: (1) el nombre del plano actual (`current`) vive en `blueprintsSlice.js` y se lee en `BlueprintsPage.jsx` vía `useSelector`, nunca escrito a mano en el DOM; (2) se revisó todo `src/` buscando `document.*`, `innerHTML` y `querySelector` — lo único que aparece es el `document.getElementById('root')` estándar de `main.jsx` (bootstrap obligatorio de React), y el `ctx` del canvas obtenido vía `ref` (API nativa necesaria para dibujar, no manipulación del DOM). Reinstalado `node_modules` (no estaba presente) y confirmado que los 4 tests y el lint siguen en verde antes de tocar la documentación. Pendiente de review y commit manual.
- **Cerrado el Requerimiento 6 (Estilos)**: revisado `src/styles.css` (79 líneas, tema oscuro propio) y `BlueprintsPage.jsx`, que tenía la tabla y el layout armados enteramente con estilos inline. Se agregaron clases reutilizables en `styles.css` (`.page-layout`, `.search-row`, `.table`/`.table-wrap`, `.stat-line`, `.muted`, `.error-text`, `.btn.sm`), estados de interacción que no existían (`:hover` en botones/filas de tabla, `:focus` en inputs, `:disabled` en botones) y una media query para que el layout de dos columnas de `BlueprintsPage` colapse a una sola columna en pantallas angostas (`max-width: 720px`), ya que antes era un grid fijo `1.1fr 1.4fr` sin adaptación. Se migró `BlueprintsPage.jsx` para usar las clases nuevas en vez de `style={{...}}` inline, y se limpiaron un par de `style={{ marginTop: 0 }}` redundantes en `LoginPage.jsx` y `BlueprintDetailPage.jsx` que ya cubre la regla global `.card h2, .card h3`. Se levantó el servidor de dev (`npm run dev`) y se confirmó que responde `HTTP 200` después del cambio (hot-reload), y que los 4 tests y el lint siguen en verde. Mariana lo confirmó visualmente en el navegador y tomó las capturas (ver EVIDENCIAS.md, Figuras 9-12), incluyendo el colapso responsive en DevTools. De paso encontró y corrigió algo que no era de estilos: faltaba el archivo `.env` local (solo existía `.env.example`), así que el mock no estaba activo (`VITE_USE_MOCK` quedaba sin definir) — al copiarlo y reiniciar el servidor, el mock funcionó normalmente. Pendiente de review y commit manual.
- **Cerrado el Requerimiento 7 (Pruebas unitarias)**: se revisaron los 4 tests existentes contra los 3 casos que pide el README (render de canvas, envío de formulario, dispatch de `fetchByAuthor`) — los 3 ya estaban cubiertos, no había que agregar nada para cumplir la letra del requisito. Pero se identificó un hueco real: nada probaba lo que se construyó en los puntos 2-4 (los reducers nuevos del slice más allá del estado inicial, ni los servicios `apimock`/`apiclient`). Se agregaron 8 tests nuevos: 3 en `tests/blueprintsSlice.test.jsx` (`fetchByAuthor.fulfilled`, `fetchBlueprint.fulfilled`, `createBlueprint.fulfilled`, probados con `reducer(state, action)` directo, sin mocks) y 5 en `tests/blueprintsMockClient.test.jsx` (`getAll`, `getByAuthor`, `getByAuthorAndName` encontrado y no encontrado, `create`, todos contra el servicio real en memoria, sin mockear nada). De paso se limpió un `fetchAuthors` muerto en el mock de `tests/BlueprintsPage.test.jsx` que ya no existe en el slice real desde el punto 2. Total: 5 archivos de test, 12/12 pasando, lint en verde. No se agregaron tests para `blueprintsApiClient.js` (necesitaría mockear Axios) ni para el switch de `blueprintsService.js` (depende de `import.meta.env` al cargar el módulo, más frágil de testear) — quedaron fuera de alcance por ahora. Con esto, **los 7 requerimientos obligatorios del laboratorio quedan cerrados**. Pendiente de review y commit manual.
