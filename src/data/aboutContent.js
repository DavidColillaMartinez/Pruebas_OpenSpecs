import { LRMQ_PHOTOS } from '../config/mediaAssets';

// Contenido del capítulo "Quiénes somos" con las fotos definitivas aprobadas
// por el propietario (lote media-20261015 alojado en el VPS, consumido por URL).
// Los dos detalles desktop son adaptaciones generativas autorizadas; en móvil
// se muestran las fotos originales verticales con más contexto. Equipo es un
// proyecto con dos iluminaciones del mismo baño, no un antes/después.
export const aboutBlocks = [
  {
    label: 'Experiencia',
    title: 'Cada espacio tiene sus necesidades.',
    copy: 'Nuestra experiencia nos permite entender lo que quieres cambiar y plantear soluciones para aprovechar mejor tu vivienda o local.',
    photo: LRMQ_PHOTOS.quienesExperiencia,
    imageAlt: 'Detalle de un baño reformado: mampara de vidrio, lavabo negro sobre mueble de madera y frente estriado',
    mobileObjectPosition: 'center 42%',
  },
  {
    label: 'Equipo',
    title: 'Los oficios, coordinados.',
    copy: 'Contamos con profesionales especializados en los distintos oficios. Coordinamos cada parte del proyecto para conseguir un resultado cuidado y de calidad.',
    photo: { desktop: LRMQ_PHOTOS.quienesEquipo, mobile: LRMQ_PHOTOS.quienesEquipo },
    imageAlt: 'Fotografía del mismo baño con dos iluminaciones: luz de día y luz cálida sobre el aseo',
    mobileObjectPosition: 'center',
  },
  {
    label: 'Compromiso',
    title: 'Cercanía y atención al detalle.',
    copy: 'Trabajamos con seriedad, cuidando cada espacio y los detalles de la ejecución, con el compromiso de cumplir los plazos acordados.',
    photo: LRMQ_PHOTOS.quienesCompromiso,
    imageAlt: 'Detalle de un baño reformado: lavabo blanco con grifería negra sobre mueble de madera',
    mobileObjectPosition: 'center 45%',
  },
];
