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

*(Todavía no empezamos este punto — se va a documentar acá cuando lo trabajemos.)*

---

## Punto 3 — Seleccionar un plano y graficarlo

*(Pendiente.)*

---

## Punto 4 — Servicios `apimock` y `apiclient`

*(Pendiente.)*

---

## Punto 5 — Interfaz con React (estado en Redux)

*(Pendiente.)*

---

## Punto 6 — Estilos

*(Pendiente.)*

---

## Punto 7 — Pruebas unitarias

*(Pendiente — aunque como se cuenta arriba, ya arreglamos los tests que estaban rotos desde antes de empezar con los puntos del laboratorio. Cuando lleguemos formalmente a este punto, documentamos qué se agregó de nuevo.)*
