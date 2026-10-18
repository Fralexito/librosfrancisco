# Francisco Daza Tananta · Web oficial

Página web del escritor Francisco Daza Tananta, autor de *Fantasías Amazónicas* y *Tras los muros de Maranguita*. Paleta grafito, marfil y champán.

Se publica con GitHub Pages desde la rama `main`.

## Cómo agregar un libro nuevo

1. Sube la portada a la carpeta `assets/img/` (formato `.jpg`, vertical).
2. Abre `index.html` y busca la línea `var LIBROS = [`.
3. Copia uno de los bloques `{ ... }`, pégalo al final de la lista y cambia sus datos:
   - `titulo` y `subtitulo`.
   - `genero`: una línea corta, por ejemplo `<b>Novela</b>. Primera edición.`
   - `portada`: la ruta de la imagen, por ejemplo `assets/img/mi-nuevo-libro.jpg`.
   - `sinopsis`: uno o dos párrafos.
   - `contenido`: los capítulos o partes (puede quedar vacío: `[]`).
   - `ficha`: los datos del libro (edición, sello, fecha, etc.).
   - `nota`: un aviso opcional (puede quedar vacío: `""`).
4. Guarda y sube el cambio. En uno o dos minutos la web se actualiza sola.

El libro aparece automáticamente como una pestaña nueva en la sección "La obra".
