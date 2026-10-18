# Los libros de Francisco Daza Tananta

Vitrina web de los libros del escritor Francisco Daza Tananta: carrusel de novedades, catálogo con filtros por género, ficha de cada libro, relato gratis y noticias.

Se publica con GitHub Pages desde la rama `main`.

## Cómo agregar un libro nuevo

1. Sube la portada a la carpeta `assets/img/` (formato `.jpg`, vertical).
2. Abre `index.html` y busca la línea `var LIBROS = [`.
3. Copia uno de los bloques `{ ... }`, pégalo al final de la lista y cambia sus datos:
   - `titulo`, `subtitulo`, `genero` (por ejemplo `Novela`), `etiqueta` (por ejemplo `Primera edición`), `estado` (por ejemplo `Marzo 2027`).
   - `destacado: true` para que salga en el carrusel de la portada.
   - `color`: el fondo suave de su tarjeta, por ejemplo `"#E9DFD6"`.
   - `portada`: la ruta de la imagen, por ejemplo `assets/img/mi-nuevo-libro.jpg`.
   - `gancho`: una frase corta para el carrusel.
   - `sinopsis`, `contenido` (puede quedar vacío: `[]`), `ficha` y `nota`.
   - `compra`: el enlace de venta. Si lo dejas vacío (`""`), dice "Próximamente en librerías".
4. Guarda y sube el cambio. En uno o dos minutos la web se actualiza sola.

El libro aparece solo en el catálogo, en su filtro de género, en el pie de página y, si es destacado, en el carrusel.
