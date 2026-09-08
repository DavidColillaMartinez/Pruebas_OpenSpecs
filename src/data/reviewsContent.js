// Reseñas del capítulo "Opiniones".
// Datos aportados por el propietario (área Google Business, extracción 2026-09-07):
// 13 reseñas reales de Area LRMQ Design S.L., todas de 5 estrellas.
// El export no incluye URLs por reseña, así que "Ver en Google" enlaza a la
// ficha de empresa (google_maps_url del mismo export). Laura Hernandez Parrado
// valoró sin escribir texto: se mantiene la reseña tal cual, sin inventar copia.
// Formato: { id, author, rating (1-5), date, text, image, googleUrl }
const GOOGLE_BUSINESS_URL = 'https://www.google.com/maps/place/Area+LRMQ+Design+S.L/@40.4206126,-3.6159632,17z/data=!4m18!1m9!3m8!1s0xd422f003caab64f:0x76cbbc66f12934a1!2sArea+LRMQ+Design+S.L!8m2!3d40.4206085!4d-3.6133883!9m1!1b1!16s%2Fg%2F11vptd8wqg!3m7!1s0xd422f003caab64f:0x76cbbc66f12934a1!8m2!3d40.4206085!4d-3.6133883!9m1!1b1!16s%2Fg%2F11vptd8wqg?entry=ttu';

const review = (id, author, date, text, image, googleUrl = GOOGLE_BUSINESS_URL) => ({
  id,
  author,
  rating: 5,
  date,
  text,
  image: `/reviews/${image}`,
  googleUrl,
});

export const googleReviews = [
  review('fer-diaz', 'Fer diaz', 'Hace un mes', 'Los recomiendo, sin dudarlo. Buen precio, profesionalidad, asesoramiento y diálogo. Sin duda, mi casa estaba completamente disfuncional por los años y ahora siento que es lo mejor que pude hacer. No dude en recomendarlo a familiares y amigos.', 'reviewer-04.png'),
  review('francisco-javier-morales-de-la-torre', 'Francisco Javier Morales De La Torre', 'Hace un mes', 'Me han hecho una reforma completa de la casa y la verdad no puedo estar mas satisfecho. Excelentes profesionales, desde Lucia en tienda, asesorando y dando soluciones, hasta Roberto, a pie de obra, y resto de profesionales que han trabajado en ella. 100% recomendables.', 'reviewer-05.png'),
  review('faly-zarza', 'Faly Zarza', 'Hace un mes', 'Hola recomendables 100 x 100 todos ellos, Loren Lucia Rober y todo el personal, me han hecho dos reformas, profesionales y responsables todos, el trato maravilloso y con mucha educación de precio fabuloso para nosotros como familia sin duda contaremos con ellos para nuestras próximas reformas, gracias a todos ellos por su trabajo y su trato.', 'reviewer-03.png'),
  review('soledad-parra-serradilla', 'soledad parra serradilla', 'Hace 10 meses', 'Hace apenas 15 días me han hecho una reforma en el baño, no puedo estar más contenta. Empresa sería y formal que en tiempo record, me realizaron la obra porque apenas tenía una semana de vacaciones. Desde Lucía, cara al publico, Loren y Julián con su ayudante, auténticos profesionales. De 10!!!', 'reviewer-12.png'),
  review('raul-parra', 'Raul Parra', 'Hace 11 meses', 'Increible a dia de hoy encontrar a una empresa de reformas tan seria, tan amables y tan profesionales como ellos. Lucia un encanto y nos ayudo en todo, Loren, un profesional como pocos y Rober esta encima de todo y no se le escapa nada, 100% recomendables.', 'reviewer-10.png'),
  review('virginia-donoso-montesinos', 'Virginia Donoso montesinos', 'Hace 2 años', 'Me realizaron un cuarto de baño y la obra no pudo ser mejor, personal muy profesional y amable. La chica de la tienda (lucia) no pudo asesorarme mejor, fue una gran ayuda. El cuarto de baño quedo impoluto y muy bonito. Contare con ellos sin duda de nuevo.', 'reviewer-13.png'),
  review('sandra', 'sandra', 'Hace 2 años', 'Sitio de lujo muy profesional, excelente trato. Contaré con ellos más veces', 'reviewer-11.png'),
  review('oscar-diaz', 'oscar diaz', 'Hace 2 años', 'muy buena actitud de cara al publico, trato amable y cordial y excelente servicio', 'reviewer-09.png'),
  review('beatriz-m-b', 'Beatriz M B', 'Hace 2 años', 'Trabajan muy bien, lo recomiendo', 'reviewer-01.png'),
  review('lucia-perez-corral', 'Lucia Perez Corral', 'Hace 2 años', 'excelente servicio', 'reviewer-07.png'),
  review('elena-mediavilla', 'Elena Mediavilla', 'Hace un mes', 'Me hicieron una reforma general y he quedado muy contenta y satisfecha. Muy profesionales, serios, resolutivos. No dudo en contar con ellos para la próxima reforma. Un diez sin duda', 'reviewer-02.png'),
  review('maria-gemma-soriano-vazquez', 'Maria Gemma Soriano vázquez', 'Hace 4 meses', 'He hecho 2 reformas con ellos. Repito después de tantos años por su profesionalidad, amabilidad, y precio. Son sin duda mis referentes para reformas en casa. Lucia en tienda Roberto al pie de obra El equipo que tienen y su coordinación son inmejorables. Sin duda, mis referentes para teformas en casa. Un 🥇…', 'reviewer-08.png'),
  review('laura-hernandez-parrado', 'Laura Hernandez Parrado', 'Hace 2 años', '', 'reviewer-06.png'),
];
