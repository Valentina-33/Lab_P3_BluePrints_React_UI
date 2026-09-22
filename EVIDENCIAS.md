# Evidencias del laboratorio – Blueprints React UI

## Índice de imágenes

| # | Descripción | Punto |
|---|---|---|
| 1 | El contenedor de Postgres corriendo (`docker ps`) | [Antes de empezar](#antes-de-empezar-dejar-todo-corriendo) |
| 2 | Salida de `npm test` con los 4 archivos en verde | [Antes de empezar](#antes-de-empezar-dejar-todo-corriendo) |
| 3 | Canvas vacío, sin blueprint cargado | [Punto 1](#punto-1-el-canvas-lienzo-para-dibujar) |
| 4 | Tabla con el plano "house" del autor john (2 puntos) | [Punto 2](#punto-2-listar-los-planos-de-un-autor) |
| 5 | Canvas con el plano "house" dibujado | [Punto 3](#punto-3-seleccionar-un-plano-y-graficarlo) |
| 6 | Tabla con los planos de "maria" usando el mock | [Punto 4](#punto-4-servicios-apimock-y-apiclient) |
| 7 | Canvas con el plano "garage" (mock) dibujado | [Punto 4](#punto-4-servicios-apimock-y-apiclient) |
| 8 | Tabla con "john"/"house" otra vez, ahora con el backend real | [Punto 4](#punto-4-servicios-apimock-y-apiclient) |

---

## Antes de empezar: dejar todo corriendo

Para poder probar cualquier punto, primero había que levantar los backends de los labs anteriores.

Prendimos el backend con JWT (el de la Parte 2), que es el que vamos a usar para las pruebas reales porque trae adentro tanto el login como toda la API de blueprints.

Para confirmar que de verdad funcionaba, no nos quedamos solo con que "arrancó": hicimos el flujo completo a mano con `curl`: nos logueamos, nos dieron un token, creamos un blueprint de prueba (`john/house`) y lo volvimos a consultar. Todo respondió como se esperaba.

De paso, notamos que los tests del frontend no estaban corriendo (fallaban todos por un tema de configuración de Vitest), y aprovechamos para revisarlos uno por uno. Resultó que no era solo configuración: había dos bugs reales. El mock del canvas para las pruebas no se estaba aplicando, y el formulario de crear blueprint tenía las etiquetas (`<label>`) sin conectar a sus campos, así que las pruebas no podían "encontrar" los inputs. Ya quedaron los 4 tests pasando.

![El contenedor de Postgres corriendo](evidencias/00-postgres-arriba.png)
*Figura 1. El contenedor de Postgres corriendo (`docker ps`).*

*Figura 2. La salida de `npm test` con los 4 archivos en verde. (pendiente de agregar `evidencias/00-tests-pasando.png`)*

---

## Punto 1. El canvas (lienzo para dibujar)

El laboratorio pide que haya un canvas en la página, que sea su propio componente (`BlueprintCanvas`), y que tenga un tamaño razonable.

Al revisar el código nos dimos cuenta de que esto ya estaba prácticamente hecho: el componente existe, dibuja una cuadrícula de fondo, y cuando hay un blueprint cargado traza las líneas entre los puntos y marca cada punto con un círculo. El tamaño por defecto es justo el que sugiere el enunciado (520×360) y no se estira para ocupar toda la pantalla.

Lo único que le faltaba era un detalle: el canvas no tenía un identificador propio en el HTML (un `id`), solo lo controlaba React por dentro. Le agregamos un `id` (`blueprint-canvas` por defecto) para que quede explícito y se pueda referenciar desde afuera si hace falta, por ejemplo desde CSS o desde una prueba automatizada.

Probamos la página con el servidor corriendo y así se ve hoy: el canvas está ahí, con su cuadrícula, esperando a que le carguemos un plano. También confirmamos "en vivo", abriendo la consola del navegador, que el `id` efectivamente quedó puesto.

![Canvas vacío, sin blueprint cargado](evidencias/01-canvas-vacio.png)
*Figura 3. La página principal con el canvas vacío (cuadrícula gris, sin blueprint cargado).*

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

![Tabla con el plano house del autor john](evidencias/02-listado-autor.png)
*Figura 4. La tabla mostrando el plano "house" del autor john, con 2 puntos.*

**Archivos que cambiaron:**
- [`src/features/blueprints/blueprintsSlice.js`](./src/features/blueprints/blueprintsSlice.js) (ruta correcta + lectura de la respuesta real)
- [`src/pages/BlueprintsPage.jsx`](./src/pages/BlueprintsPage.jsx) (se quitó la llamada que no servía para nada)
- [`vite.config.js`](./vite.config.js) (proxy para evitar el bloqueo de CORS mientras desarrollamos)
- [`src/services/apiClient.js`](./src/services/apiClient.js) (la URL base ahora es relativa, para aprovechar el proxy)
- [`.env.example`](./.env.example) (actualizado a la nueva URL relativa)

---

## Punto 3. Seleccionar un plano y graficarlo

Este punto pide que, al darle clic al botón "Open" de la tabla, pasen tres cosas: que se actualice un texto con el nombre del plano que se abrió, que se traigan sus puntos, y que se dibujen en el canvas (las líneas entre los puntos, y cada punto marcado).

En estos momentos el botón sí funciona, pero llama a la ruta vieja del backend (`/blueprints/autor/nombre`), así que la petición falla calladita y no pasa nada en la pantalla.

Le hicimos el mismo ajuste que al punto 2: apuntar a la ruta real (`/v1/blueprints/autor/nombre`) y sacar los datos de donde realmente vienen (`{code, message, data}`).

Con eso ya probamos el flujo completo: buscamos los planos de "john", le dimos clic a "Open" en la fila de "house", y pasó justo lo que pedía el enunciado: arriba dice "Current blueprint: house", y el canvas dibujó la línea entre sus dos puntos, cada uno marcado con un puntico amarillo.

![Canvas con el plano house dibujado](evidencias/03-plano-abierto.png)
*Figura 5. El canvas con la línea y los puntos del plano "house", y el texto "Current blueprint: house".*

**Archivo que cambió:** [`src/features/blueprints/blueprintsSlice.js`](./src/features/blueprints/blueprintsSlice.js) (la función `fetchBlueprint`)

---

## Punto 4. Servicios `apimock` y `apiclient`

Este punto lo que pide es tener dos "servicios" que hagan lo mismo (traer todos los planos, traer los de un autor, traer uno puntual, y crear uno nuevo), uno que use datos de mentiras guardados en memoria (para poder probar la app sin depender de nada más) y otro que sí hable con el backend real. Y que se pueda cambiar de uno a otro con una sola variable en el `.env`, sin tocar código.

Armamos tres archivos nuevos en `src/services/`:

- **`blueprintsMockClient.js`**: el servicio de mentiras. Tiene unos planos inventados guardados en una lista (de "maria" y "carlos") y expone las 4 funciones que pide el enunciado (`getAll`, `getByAuthor`, `getByAuthorAndName`, `create`), todas trabajando sobre esa lista en memoria, sin llamar a ningún backend.
- **`blueprintsApiClient.js`**: el servicio real. Tiene las mismas 4 funciones, pero por debajo usan Axios para hablar con el backend de verdad (las mismas rutas que ya habíamos arreglado en los puntos 2 y 3).
- **`blueprintsService.js`**: el que decide cuál de los dos usar, mirando la variable `VITE_USE_MOCK` del `.env`. Si es `true`, usa el de mentiras; si no, usa el real. Ese es el "cambio con una sola línea" que pide el laboratorio: solo hay que tocar esa variable, nada de código.

Un detalle de nombres que vale la pena contar: el enunciado sugiere llamar al servicio real "apiclient", pero ya existía un archivo `apiClient.js` (con mayúscula) que es la configuración base de Axios. En Windows, el sistema de archivos no distingue mayúsculas de minúsculas, así que un archivo `apiclient.js` y otro `apiClient.js` serían el mismo archivo y uno se comería al otro. Por eso el servicio real se llama `blueprintsApiClient.js` en vez de `apiclient.js`, dejando esto explicado en un comentario en el código.

Después conectamos el Redux (`blueprintsSlice.js`) para que, en vez de llamarle directo a Axios con URLs escritas a mano, le pregunte a `blueprintsService`. Así el cambio de mock a real (o viceversa) se nota en toda la aplicación, no solo en un archivo suelto que nadie usa.

De paso, encontramos que había un pedazo de la interfaz (`fetchAuthors`) que ya habíamos dejado sin usar desde el punto 2, y como ahora `getAll` cumple ese mismo propósito dentro de la interfaz oficial del servicio, terminamos de quitarlo del todo.

Para comprobar que el cambio funciona de verdad y no es solo teoría, lo probamos en los dos sentidos:

1. Con `VITE_USE_MOCK=true`: buscamos el autor "maria" (que no existe en el backend real, solo en los datos de mentiras) y salieron sus dos planos, "garage" (3 puntos) y "pool" (2 puntos), sin que la app tocara el backend para nada. Abrimos "garage" y el canvas dibujó su figura correctamente.
2. Con `VITE_USE_MOCK=false`: buscamos "john" otra vez y volvió a traer "house" con 2 puntos, exactamente como en los puntos 2 y 3, esta vez sí hablando con el backend real.

Los dos casos funcionaron sin tocar ni una línea de código, solo cambiando esa variable. La pantalla se ve igual en ambos modos (mismos componentes, mismos estilos): lo único que cambia es de dónde salen los datos, que es justo lo que se estaba probando.

![Tabla con los planos de maria usando el mock](evidencias/04-mock-maria.png)
*Figura 6. La tabla mostrando los planos "garage" y "pool" de maria, usando el mock (sin backend).*

![Canvas con el plano garage dibujado](evidencias/04-mock-garage-canvas.png)
*Figura 7. El canvas dibujando el plano "garage" con sus 3 puntos (datos del mock).*

![Tabla con john/house usando el backend real](evidencias/04-real-john.png)
*Figura 8. La misma búsqueda de "john" mostrando "house" con 2 puntos, ahora con `VITE_USE_MOCK=false` (backend real).*

**Archivos nuevos:**
- [`src/services/blueprintsMockClient.js`](./src/services/blueprintsMockClient.js)
- [`src/services/blueprintsApiClient.js`](./src/services/blueprintsApiClient.js)
- [`src/services/blueprintsService.js`](./src/services/blueprintsService.js)

**Archivos que cambiaron:**
- [`src/features/blueprints/blueprintsSlice.js`](./src/features/blueprints/blueprintsSlice.js) (ahora usa `blueprintsService` en vez de Axios directo; se quitó `fetchAuthors`)
- [`.env.example`](./.env.example) (se agregó `VITE_USE_MOCK`)

---

## Punto 5. Interfaz con React (estado en Redux)

*(Pendiente.)*

---

## Punto 6. Estilos

*(Pendiente.)*

---

## Punto 7. Pruebas unitarias

*(Pendiente — aunque como se cuenta arriba, ya arreglamos los tests que estaban rotos desde antes de empezar con los puntos del laboratorio. Cuando lleguemos formalmente a este punto, documentamos qué se agregó de nuevo.)*
