# Libros de Francisco Daza Tananta

Librería en línea de los libros del escritor Francisco Daza Tananta. Muestra un libro destacado arriba, el catálogo completo con filtros por género, la ficha de cada libro y la compra por WhatsApp.

Se publica con GitHub Pages desde la rama `main`.

## Cambiar el número de WhatsApp

En `index.html`, busca `var WHATSAPP =` y escribe el número con el código de país, sin espacios ni `+`. Para Perú empieza con `51`.

## Poner o cambiar un precio

Busca el libro en la lista `var LIBROS = [` y escribe su precio en `precio`, por ejemplo `precio: "S/ 35.00"`. Si lo dejas vacío (`""`), la web dice "Precio por anunciar".

## Agregar un libro nuevo

1. Sube la portada a `assets/img/` (formato `.jpg`, vertical).
2. En `index.html`, dentro de `var LIBROS = [`, copia un bloque `{ ... }`, pégalo al final y cambia sus datos:
   - `titulo`, `subtitulo`, `genero` (por ejemplo `Novela`), `edicion`, `estado` (por ejemplo `Marzo 2027`).
   - `precio`, `disponible` (`false` muestra "Reservar" en vez de "Comprar"), `destacado` (`true` lo pone arriba).
   - `color`: fondo suave de su tarjeta, por ejemplo `"#EDE4DA"`.
   - `portada`: por ejemplo `assets/img/mi-nuevo-libro.jpg`.
   - `resumen`, `sinopsis`, `contenido`, `ficha`, `ventajas` y `nota`.
3. Guarda y sube el cambio. En uno o dos minutos la web se actualiza sola.
