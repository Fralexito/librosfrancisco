# Libros de Francisco Daza Tananta

Web oficial y librería en línea del escritor Francisco Daza Tananta. Se publica con GitHub Pages desde la rama `main`.

## Páginas

| Archivo | Página |
|---|---|
| `index.html` | Inicio: libro destacado, catálogo, lectura gratis, criaturas, autor y suscripción |
| `libros.html` | Catálogo completo con buscador, filtros y orden |
| `libro.html#id-del-libro` | Ficha de cada libro (sinopsis, contenido, ficha técnica, compra) |
| `leer.html` | Lectura gratis de fragmentos, con tamaño de letra y modo día, sepia o noche |
| `universo.html` | Criaturas de los cuentos y glosario amazónico interactivo |
| `autor.html` | Biografía y línea de tiempo del autor |
| `noticias.html` | Lanzamientos y presentaciones |
| `contacto.html` | Cómo comprar, pedidos para colegios y preguntas frecuentes |

## Dónde se cambia cada cosa

- **Todo el contenido** (libros, precios, número de WhatsApp, criaturas, glosario, noticias y fragmentos) está en `assets/js/data.js`.
- **Los colores, letras y espacios** están en `assets/css/styles.css` (al inicio, en `:root`).
- **Las funciones** (pedido, carrusel, buscador, lector, animaciones) están en `assets/js/app.js`.
- **Las imágenes** están en `assets/img/`.

## Agregar un libro nuevo

1. Sube la portada a `assets/img/`.
2. En `assets/js/data.js`, dentro de `libros: [`, copia un bloque `{ ... }`, pégalo al final y cambia los datos. El `id` debe ser corto y sin espacios, por ejemplo `mi-nuevo-libro`.
3. Pon el precio como número, por ejemplo `precio: 35`. Si lo dejas en `null`, dice "Precio por anunciar".
4. Guarda y sube el cambio. El libro aparece solo en la portada (si `destacado: true`), el catálogo, su ficha (`libro.html#mi-nuevo-libro`), la página del autor y el pie de página.

## Cómo funcionan los pedidos

El visitante agrega libros a su pedido (se guarda en su navegador) y, al tocar "Enviar pedido por WhatsApp", se abre WhatsApp con la lista escrita. El pago y la entrega se coordinan por ahí.
