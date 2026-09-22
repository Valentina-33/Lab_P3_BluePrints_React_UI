# Evidencias del laboratorio – Blueprints React UI

---

## Antes de empezar: dejar todo corriendo

Para poder probar cualquier punto, primero había que levantar los backends de los labs anteriores. 

Prendimos el backend con JWT (el de la Parte 2), que es el que vamos a usar para las pruebas reales porque trae adentro tanto el login como toda la API de blueprints.

Para confirmar que de verdad funcionaba, no nos quedamos solo con que "arrancó": hicimos el flujo completo a mano con `curl`: nos logueamos, nos dieron un token, creamos un blueprint de prueba (`john/house`) y lo volvimos a consultar. Todo respondió como se esperaba.

De paso, notamos que los tests del frontend no estaban corriendo (fallaban todos por un tema de configuración de Vitest), y aprovechamos para revisarlos uno por uno. Resultó que no era solo configuración: había dos bugs reales. El mock del canvas para las pruebas no se estaba aplicando, y el formulario de crear blueprint tenía las etiquetas (`<label>`) sin conectar a sus campos, así que las pruebas no podían "encontrar" los inputs. Ya quedaron los 4 tests pasando.

📷 *Captura pendiente:* `evidencias/00-postgres-arriba.png` — el contenedor de Postgres corriendo (`docker ps`).


📷 *Captura pendiente:* `evidencias/00-tests-pasando.png` — la salida de `npm test` con los 4 archivos en verde.

---

## Punto 1. El canvas (lienzo para dibujar)

El laboratorio pide que haya un canvas en la página, que sea su propio componente (`BlueprintCanvas`), y que tenga un tamaño razonable.

Al revisar el código nos dimos cuenta de que esto ya estaba prácticamente hecho: el componente existe, dibuja una cuadrícula de fondo, y cuando hay un blueprint cargado traza las líneas entre los puntos y marca cada punto con un círculo. El tamaño por defecto es justo el que sugiere el enunciado (520×360) y no se estira para ocupar toda la pantalla.

Lo único que le faltaba era un detalle: el canvas no tenía un identificador propio en el HTML (un `id`), solo lo controlaba React por dentro. Le agregamos un `id` (`blueprint-canvas` por defecto) para que quede explícito y se pueda referenciar desde afuera si hace falta, por ejemplo desde CSS o desde una prueba automatizada.

Probamos la página con el servidor corriendo y así se ve hoy: el canvas está ahí, con su cuadrícula, esperando a que le carguemos un plano. También confirmamos "en vivo", abriendo la consola del navegador, que el `id` efectivamente quedó puesto.

📷 *Captura pendiente:* `evidencias/01-canvas-vacio.png` — la página principal con el canvas vacío (cuadrícula gris, sin blueprint cargado).

**Archivo que cambió:** [`src/components/BlueprintCanvas.jsx`](./src/components/BlueprintCanvas.jsx)

---

## Punto 2. Listar los planos de un autor

Acá el laboratorio pide poder escribir el nombre de un autor, consultarlo, y ver sus planos en una tabla, con el nombre del plano, cuántos puntos tiene, y un botón para abrirlo.

En la pantalla esto ya estaba armado: hay un campo para escribir el autor, un botón "Get blueprints" y la tabla de resultados. El problema es que por debajo no estaba hablando bien con el backend real, y nos fuimos encontrando varias cosas mientras lo probábamos:

- Le estaba preguntando a una ruta que no existe tal cual (`/blueprints/autor`). La info real está en `/v1/blueprints/autor`.
- La respuesta del backend no viene "pelada": viene envuelta en un objeto con `code`, `message` y `data`. Había que sacar los datos de ahí adentro.
- El navegador bloqueaba las peticiones por un tema de CORS: el backend no está configurado para aceptar pedidos que vengan de `localhost:5173` (el puerto donde corre el frontend). Como no queríamos meternos a tocar el backend de otro laboratorio ya entregado, lo resolvimos desde el lado del frontend: configuramos Vite para que, mientras estamos programando, reenvíe por detrás las peticiones que empiezan en `/api` directo al backend, sin que el navegador se entere. Así ya no aplica la restricción de CORS.
- De paso nos dimos cuenta de que había un pedacito de código que no servía para nada: apenas se abría la página, se disparaba sola una petición para traer "todos los autores", pero ese resultado nunca se usaba en ninguna parte de la pantalla. Y como esa petición fallaba (por las mismas rutas mal apuntadas), dejaba la página como si algo hubiera "fallado" sin que nadie se enterara ni pasara nada raro visible. Como no cumplía ningún propósito, la quitamos.

Con esos cambios ya probamos buscar los planos del autor "john" (uno que habíamos creado de prueba cuando estábamos validando que el backend funcionara) y la tabla mostró bien su plano "house", con sus 2 puntos, y el botón para abrirlo.

Repasando el README, el punto pide que la tabla tenga exactamente tres cosas, y así quedaron:

- **Nombre del plano:** columna "Blueprint name", mostró "house".
- **Número de puntos:** columna "Number of points", mostró "2".
- **Botón Open para abrirlo:** una tercera columna con el botón "Open" al lado de cada fila.

Las tres columnas están armadas en [BlueprintsPage.jsx](./src/pages/BlueprintsPage.jsx), en la tabla que se arma recorriendo los resultados (`items.map(...)`).

Una aclaración importante: para poder probar esto tuvimos que "loguearnos" a mano, pidiendo el token por fuera (con curl), porque el backend real exige ese token para consultar cualquier cosa, y la pantalla de Login del frontend todavía no está bien conectada con el backend real (eso lo vamos a resolver más adelante, en su propio punto). Por ahora simplemente pusimos el token a la fuerza para poder comprobar que la tabla sí funciona de verdad.

📷 *Captura pendiente:* `evidencias/02-listado-autor.png` — la tabla mostrando el plano "house" del autor john, con 2 puntos.

**Archivos que cambiaron:**
- [`src/features/blueprints/blueprintsSlice.js`](./src/features/blueprints/blueprintsSlice.js) (ruta correcta + lectura de la respuesta real)
- [`src/pages/BlueprintsPage.jsx`](./src/pages/BlueprintsPage.jsx) (se quitó la llamada que no servía para nada)
- [`vite.config.js`](./vite.config.js) (proxy para evitar el bloqueo de CORS mientras desarrollamos)
- [`src/services/apiClient.js`](./src/services/apiClient.js) (la URL base ahora es relativa, para aprovechar el proxy)
- [`.env.example`](./.env.example) (actualizado a la nueva URL relativa)

---

## Punto 3. Seleccionar un plano y graficarlo

*(Pendiente.)*

---

## Punto 4. Servicios `apimock` y `apiclient`

*(Pendiente.)*

---

## Punto 5. Interfaz con React (estado en Redux)

*(Pendiente.)*

---

## Punto 6. Estilos

*(Pendiente.)*

---

## Punto 7. Pruebas unitarias

*(Pendiente — aunque como se cuenta arriba, ya arreglamos los tests que estaban rotos desde antes de empezar con los puntos del laboratorio. Cuando lleguemos formalmente a este punto, documentamos qué se agregó de nuevo.)*
