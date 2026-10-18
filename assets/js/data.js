/* =====================================================================
   DATOS DE LA WEB
   Aquí se cambia todo el contenido sin tocar el diseño.
   Cada página lee esta información y se arma sola.
   ===================================================================== */
window.SITE = {

  /* ---------- Configuración general ---------- */
  config: {
    autor: "Francisco Daza Tananta",
    whatsapp: "51916969388",            // con código de país, sin + ni espacios
    correo: "dazatanantafrancisco@outlook.com",
    facebook: "Francisco Daza Tananta",
    facebookUrl: "",                    // pega aquí el enlace de su página de Facebook; si está vacío, abre una búsqueda
    moneda: "S/"
  },

  /* ---------- Libros ----------
     Para agregar un libro: copia un bloque { ... }, pégalo al final y cambia los datos.
     - id: nombre corto sin espacios (se usa en el enlace de su ficha).
     - precio: número, por ejemplo 35. Si es null, dice "Precio por anunciar".
     - destacado: true para que salga en la portada.
     - disponible: false muestra "Reservar" en vez de "Comprar".
  */
  libros: [
    {
      id: "fantasias-amazonicas",
      titulo: "Fantasías Amazónicas",
      subtitulo: "Cuentos y algo más…",
      genero: "Cuentos",
      edicion: "Quinta edición, revisada",
      salida: "Octubre 2026",
      precio: null,
      disponible: true,
      destacado: true,
      color: "#DCE9E0",
      lomo: { fondo: "#14506A", texto: "#FFE9A8" },   // color del lomo y de la contraportada en 3D
      portada: "assets/img/portada-fantasias-amazonicas.jpg",
      fondo: "assets/img/criatura-madre-del-agua.jpg",
      gancho: "Siete relatos donde la Runa Mula, la sirena y la Madre del Agua caminan por pueblos reales de Loreto.",
      sinopsis: [
        "Tres hombres esperan despiertos, con linternas y jugo de huito, a que pase la Runa Mula. Un pescador rema solo hasta una cocha donde dicen que algo respira bajo el agua. Una alumna deja de ir a la escuela porque, según su familia, la enfermó la Madre del Agua.",
        "Francisco Daza Tananta recoge las leyendas que escuchó durante años en las comunidades de Loreto y las cuenta con la voz cercana de quien estuvo ahí: el maestro rural que de día enseñaba a leer y de noche escuchaba historias a la luz del lamparín.",
        "Esta quinta edición llega con el texto revisado de principio a fin, corrección de estilo profesional, ilustraciones y un glosario de voces amazónicas."
      ],
      contenido: ["El reemplazo de la Runa Mula", "La decepción de la sirena", "El escape de los «pelacaras»", "Del finado su veneno", "La recompensa de los bufeos colorados", "El despertar de la anaconda", "El sueño de Adelita"],
      ficha: [["Edición", "Quinta, revisada"], ["Salida", "Octubre 2026"], ["Sello", "Ediciones Daza Mozombite"], ["Prólogo", "Jaime Vásquez Valcárcel"], ["Corrección", "Tania Simith Gómez Ríos"], ["Portada", "Frank Alexander Daza Gómez"], ["Incluye", "Glosario amazónico"], ["Ideal para", "Familias y docentes"]],
      ventajas: ["Edición revisada y corregida en 2026", "Ilustraciones y glosario de voces amazónicas", "Para leer en familia o en el aula"],
      cita: { texto: "Su obra contribuye a preservar, mediante la palabra escrita, la riqueza de una tradición oral que permanece viva.", autor: "Jaime Vásquez Valcárcel, periodista, Diario Pro y Contra" },
      nota: "",
      fragmento: "adelita",
      temas: ["Tradición oral", "Leyendas", "Educación"],
      extra: { titulo: "Explora el universo de este libro", texto: "Las criaturas de sus relatos y un glosario de palabras de la Amazonía.", url: "universo.html" }
    },
    {
      id: "tras-los-muros-de-maranguita",
      titulo: "Tras los muros de Maranguita",
      subtitulo: "Memorias de un exeducador dentro del centro juvenil más temido del Perú",
      genero: "Memorias",
      edicion: "Primera edición",
      salida: "Octubre 2026",
      precio: null,
      disponible: true,
      destacado: true,
      color: "#DFE3EC",
      lomo: { fondo: "#F4F2EC", texto: "#2B4C9B" },
      portada: "assets/img/portada-tras-los-muros-de-maranguita.jpg",
      fondo: "assets/img/maranguita-patio.jpg",
      gancho: "Un maestro rural llega al centro juvenil de Lima. El primer día le advierten: «Si ven que eres débil de carácter, te fregaste».",
      sinopsis: [
        "Un maestro rural de Iquitos llega a una Lima gris y entra a trabajar al pabellón «Bienvenida»: cabezas rapadas, miradas que miden al recién llegado y una psicóloga que le da el primer consejo: «Habla fuerte, que sientan tu voz».",
        "Motines, partidos de fútbol que valen más que un sermón, compañeros que sostienen turnos de veinticuatro horas, un chico apodado «Conejo» que sueña con ser diseñador gráfico y una acusación injusta que dejó al autor, por unas horas, del otro lado de la reja.",
        "Un testimonio sobre la dignidad en el lugar donde menos se espera encontrarla."
      ],
      contenido: ["Primera parte: El pabellón «Bienvenida»", "Segunda parte: «Domingo Savio»", "Tercera parte: Las sombras del sistema", "Cuarta parte: La salida", "Epílogo: el diseño de una nueva vida"],
      ficha: [["Edición", "Primera"], ["Salida", "Octubre 2026"], ["Sello", "ACUEDI Ediciones"], ["Tiraje", "500 ejemplares"], ["Diseño", "Emilio Dumas"], ["Cubierta", "Ailyn Alfaro Montoya"], ["Ideal para", "Adultos y educadores"]],
      ventajas: ["Testimonio real, contado en primera persona", "Tiraje limitado de 500 ejemplares", "Para educadores, psicólogos y lectores de no ficción"],
      cita: { texto: "La esperanza germina siempre que un maestro se niega a dar por perdida una vida.", autor: "Del libro" },
      nota: "Los nombres de los adolescentes son seudónimos, conforme a la Ley N.º 29733 y al Código de los Niños y Adolescentes.",
      fragmento: "bautizo",
      temas: ["Memoria", "Educación", "Justicia juvenil"],
      extra: null
    }
  ],

  /* ---------- Temas de la obra ----------
     Cada libro indica sus temas en "temas". Aquí va la descripción de cada tema.
     Si un libro nuevo trae un tema que no está aquí, igual aparece con un texto general.
  */
  temas: {
    "Tradición oral": "Historias que pasaron de boca en boca y que el autor pone por escrito para que no se pierdan.",
    "Leyendas": "Seres, misterios y creencias populares contados desde dentro de las comunidades.",
    "Educación": "La escuela, el aula y el oficio de enseñar, vistos por quien fue maestro toda su vida.",
    "Memoria": "Lo vivido en primera persona: testimonios reales, con nombres cambiados y hechos verdaderos.",
    "Justicia juvenil": "Los adolescentes en conflicto con la ley y la gente que trabaja para darles otra oportunidad."
  },

  /* ---------- Fragmentos para leer gratis ---------- */
  fragmentos: {
    adelita: {
      libro: "fantasias-amazonicas",
      titulo: "El sueño de Adelita",
      imagen: "assets/img/criatura-madre-del-agua.jpg",
      parrafos: [
        "Adelita era una de esas niñas que se recuerdan con especial cariño después de muchos años. Tranquila, amable y cariñosa, tenía una manera muy particular de acercarse a las personas: nunca llegaba haciendo ruido, sino despacito, con una sonrisa tímida y esos ojos grandes que parecían estar siempre preguntando algo. Había sido mi alumna en una pequeña escuelita rural de la Amazonía, una de aquellas escuelas donde el maestro no solamente termina enseñando a leer, escribir o resolver operaciones matemáticas, sino que, muchas veces, también acaba siendo consejero, amigo, enfermero improvisado y hasta testigo de las dificultades que atravesaban las familias.",
        "El pueblo donde vivía Adelita era pequeño y estaba rodeado de monte, quebradas y aguajales. Allí, cuando llegaba la temporada de fiestas, las comunidades se llenaban de música y alegría. El padre de Adelita era un distinguido músico. Tocaba magistralmente el pífano y tenía la habilidad de arrancarle melodías alegres a aquel sencillo instrumento. Su otro hijo, desde muy pequeño, lo acompañaba tocando un redoblante que él mismo había aprendido a confeccionar con tubos de plástico y cuero de sajino. Ambos conformaban el grupo musical Hicler Banda Show. Eran solicitados para amenizar veladas, fiestas carnavalescas, aniversarios y cualquier actividad que necesitara música. Por esa razón, algunas veces los padres de Adelita tenían que ausentarse de la comunidad durante uno o varios días.",
        "Era precisamente en esos días cuando la pequeña tenía que asumir responsabilidades que no correspondían a una niña de su edad. Cuidaba a sus hermanitos. Preparaba los alimentos. Ordenaba la casa. Y, algunas veces, dejaba de asistir a la escuela.",
        "Durante los primeros meses de aquel año, sus ausencias fueron cada vez más frecuentes. Cuando pasaba lista y llegaba a su nombre, los demás niños comentaban:",
        "—Profe, Adelita está jugando en su casa.",
        "—Yo la vi ayer corriendo por la calle.",
        "—No está enferma, profe. No quiere venir nomás.",
        "Escuchaba aquellos comentarios, pero conocía a Adelita y sabía que no era una niña que faltara a clases por simple desgano. Algo estaba ocurriendo.",
        "Después llegaron las vacaciones de medio año. Cuando regresamos a la escuela, esperaba volver a verla sentada en su lugar, como siempre. Pero pasaron los días. Una semana. Dos semanas. Y Adelita no aparecía. Cada mañana, al pasar lista, su ausencia comenzaba a preocuparme.",
        "Una mañana, justo antes de entrar al aula, se me acercó su hermano:",
        "—Profe, vengo a justificar a mi hermanita.",
        "—¿Qué pasó con Adelita? —le pregunté—. ¿Todavía está enferma?",
        "El niño bajó la mirada. Parecía tener miedo de decirme algo.",
        "—Dicen que a mi hermana le ha hecho daño la «Madre del Agua»."
      ]
    },
    bautizo: {
      libro: "tras-los-muros-de-maranguita",
      titulo: "El bautizo de hierro",
      imagen: "assets/img/maranguita-patio.jpg",
      parrafos: [
        "Ya en el interior del centro, antes de cruzar el umbral del pabellón «Bienvenida», el módulo por donde ingresan por primera vez o reinciden los adolescentes remitidos por el sistema judicial, la atmósfera cambió drásticamente. El aire se percibía cargado de un aroma penetrante a desinfectante industrial mezclado con el encierro. Me apersoné ante el personal de seguridad de turno y el equipo multidisciplinario del área. No hubo demoras ni presentaciones protocolares; solo advertencias directas.",
        "—Desde el primer segundo tiene que marcar el principio de autoridad, profesor —me indicó uno de los agentes de seguridad, evaluándome de pies a cabeza, notando quizás en mi postura la serenidad propia de un maestro de escuela rural.",
        "Una de las psicólogas del equipo técnico se acercó y me soltó la advertencia que se quedaría grabada en mi mente para el resto de la jornada:",
        "—Profesor, acá los chicos te «pulsean» de arranque. Miden tu personalidad y tu temple. Si ven que eres débil de carácter, te fregaste; aquí no hay espacio para la duda. Habla fuerte, que sientan tu voz, y no te creas lo primero que te digan. Saca tus propias conclusiones, porque en este entorno nada es lo que parece.",
        "En ese instante experimenté un frío interior que nada tenía que ver con la humedad de Lima. Mis métodos basados en la paciencia y el acompañamiento afectivo tendrían que medirse ahora contra adolescentes que conocían la dureza y los códigos de la calle mil veces mejor que yo.",
        "Aquel fue mi verdadero bautizo de hierro.",
        "¡Clac! ¡Clac! El chasquido seco de la cerradura fue el punto de no retorno. La pesada reja del pabellón «Bienvenida» cedió y sentí que el docente de aula que habitaba en mí se quedó del otro lado del umbral. Lo primero que me impactó no fue un reclamo, sino el olor: una mezcla rancia de encierro, humedad en el concreto y desinfectante barato que se adhería a la piel."
      ]
    }
  },

  /* ---------- Extra de Fantasías Amazónicas: criaturas (página universo.html) ---------- */
  criaturas: [
    { nombre: "La Runa Mula", relato: "El reemplazo de la Runa Mula", imagen: "assets/img/criatura-runa-mula.jpg",
      texto: "Bestia condenada a recorrer las noches como castigo por un pecado prohibido. Dicen que aparece pasada la medianoche, sobre todo los martes y jueves, y que se la reconoce por el galope y un jadeo casi humano." },
    { nombre: "La sirena", relato: "La decepción de la sirena", imagen: "assets/img/criatura-sirena.jpg",
      texto: "Habita en las cochas más lejanas. Los ancianos cuentan que ciertas noches el agua brilla sola bajo la luna, como si algo respirara debajo de la superficie, y recomiendan no quedarse mucho tiempo ahí." },
    { nombre: "Los pelacaras", relato: "El escape de los «pelacaras»", imagen: "assets/img/criatura-pelacaras.jpg",
      texto: "Figuras temidas que, según la creencia popular, acechan a los viajeros en la oscuridad. Su sola mención basta para que en el pueblo nadie salga de noche." },
    { nombre: "El finado", relato: "Del finado su veneno", imagen: "assets/img/criatura-finado.jpg",
      texto: "Entre curanderos, tabaco y lamparines, una historia sobre lo que los muertos dejan pendiente entre los vivos." },
    { nombre: "Los bufeos colorados", relato: "La recompensa de los bufeos colorados", imagen: "assets/img/criatura-bufeos.jpg",
      texto: "Delfines rosados del río Amazonas. En las riberas se dice que pueden tomar forma humana y que saben premiar, o castigar, a quien se cruza en su camino." },
    { nombre: "La anaconda", relato: "El despertar de la anaconda", imagen: "assets/img/criatura-anaconda.jpg",
      texto: "La gran serpiente de las aguas, madre de los ríos para muchos pueblos. Cuando despierta, el río entero cambia." },
    { nombre: "La Madre del Agua", relato: "El sueño de Adelita", imagen: "assets/img/criatura-madre-del-agua.jpg",
      texto: "Mujer hermosa que habita en las profundidades de quebradas, cochas y ríos. Puede enfermar, atraer o proteger, y en las comunidades se habla de ella con respeto." }
  ],

  /* ---------- Extra de Fantasías Amazónicas: glosario (página universo.html) ---------- */
  glosario: [
    ["Ayaymama", "Ave nocturna de canto lúgubre."],
    ["Bijao", "Planta de hojas grandes y resistentes para envolver alimentos."],
    ["Bogar", "Remar."],
    ["Boquichico", "Pez amazónico de agua dulce."],
    ["Bufeos colorados", "Delfines rosados del río Amazonas."],
    ["Carachama", "Pez amazónico blindado de río."],
    ["Casino", "Juego popular de cartas."],
    ["Chacra", "Terreno de cultivo."],
    ["Chiri-chiri", "Escalofrío o sensación de escalofrío súbito."],
    ["Cocha", "Laguna o depósito natural de agua."],
    ["Cumpita", "Compadre, en forma afectiva."],
    ["Cutipa", "Mal o daño espiritual."],
    ["Emponado", "Piso de listones de madera o caña en construcciones elevadas."],
    ["Fariña", "Harina gruesa de yuca tostada."],
    ["Gamitana", "Pez amazónico de gran tamaño."],
    ["Horcones", "Postes gruesos de madera para sostener casas."],
    ["Huito", "Fruto amazónico cuya pulpa tiñe la piel de negro."],
    ["Huambras", "Muchachas, jóvenes o chicas."],
    ["Icaros", "Cantos sagrados de los curanderos amazónicos."],
    ["Irapay", "Palmera cuyas hojas se usan para techar viviendas."],
    ["Lamparín", "Lámpara pequeña a kerosene."],
    ["Lupuna", "Uno de los árboles más gigantescos y sagrados de la Amazonía."],
    ["Llullo", "Bebé, recién nacido o niño muy pequeño."],
    ["Mal aire", "Influencia o carga dañina según el folclore."],
    ["Manchari", "Susto o pérdida del alma por un fuerte shock."],
    ["Mapacho", "Tabaco artesanal y medicinal usado en rituales."],
    ["Minga", "Trabajo comunitario no remunerado."],
    ["Monte", "Vegetación silvestre o selva densa."],
    ["Moshaco", "Hombre enamoradizo y coqueto."],
    ["Paiche", "El pez de agua dulce más grande de la cuenca amazónica."],
    ["Peque-peque", "Canoa de madera con motor fuera de borda."],
    ["Pífano", "Flauta pequeña de sonido agudo."],
    ["Quebrada", "Riachuelo o cauce menor de agua."],
    ["Sajino", "Cerdo silvestre de la selva."],
    ["Shicra", "Bolsa tejida."],
    ["Tahuampa", "Terreno inundable de forma temporal."],
    ["Tambo", "Refugio o choza temporal en la selva."],
    ["Taperiba", "Fruto amazónico agridulce."],
    ["Vaciante", "Época de estiaje, cuando baja el nivel del río."],
    ["Varado", "Encallado en un banco de arena o en el fondo del río."]
  ],

  /* ---------- Noticias ---------- */
  noticias: [
    { tipo: "Lanzamiento", fecha: "Octubre 2026", titulo: "Llega la quinta edición de Fantasías Amazónicas",
      texto: "El primer libro del autor vuelve con el texto revisado de principio a fin, corrección de estilo profesional, nueva portada y un glosario de voces amazónicas.", libro: "fantasias-amazonicas" },
    { tipo: "Lanzamiento", fecha: "Octubre 2026", titulo: "Tras los muros de Maranguita, con ACUEDI Ediciones",
      texto: "Las memorias del autor como educador en el centro juvenil de Lima salen en una primera edición de 500 ejemplares.", libro: "tras-los-muros-de-maranguita" },
    { tipo: "Presentación", fecha: "Por anunciar", titulo: "Presentación de los libros",
      texto: "La fecha y el lugar se anunciarán pronto. Los suscriptores serán los primeros en saberlo.", libro: "" }
  ]
};
