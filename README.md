# Francisco Daza Tananta · Web oficial

Página web del escritor Francisco Daza Tananta, autor de *Fantasías Amazónicas* y *Tras los muros de Maranguita*.

Se publica con GitHub Pages desde la rama `main`.

## Cómo agregar un libro nuevo

1. Sube la portada a la carpeta `assets/img/` (formato `.jpg`, vertical).
2. Abre `index.html` y busca la línea `var LIBROS = [`.
3. Copia uno de los bloques `{ ... }`, pégalo al final de la lista y cambia sus datos:
   - `titulo`, `subtitulo`, `etiqueta` (ej. `Novela · Primera edición`), `estado` (ej. `Marzo 2027`).
   - `portada`: la ruta de la imagen, ej. `assets/img/mi-nuevo-libro.jpg`.
   - `destacado: true` si quieres que salga en grande en la sección "La obra".
   - `sinopsis`, `indice` (puede quedar vacío: `[]`), `ficha` y `nota`.
4. Guarda y sube el cambio. En uno o dos minutos la web se actualiza sola.

El libro aparecerá automáticamente en el catálogo, y la web alterna sola el lado de la portada.
