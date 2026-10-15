import { LRMQ_PHOTOS } from '../config/mediaAssets';

export const categories = [
  // Título aprobado; su etiqueta coincide con el título y no se renderiza para
  // evitar la repetición contigua en desktop y móvil.
  { title: 'Reformas integrales', label: 'Reformas integrales', copy: 'Renovamos viviendas y locales, coordinando los oficios para que distribución, instalaciones y acabados respondan a un mismo proyecto.', photo: LRMQ_PHOTOS.serviciosEscalera, imageAlt: 'Escalera de una reforma antes y después: en obra con fontaneros y terminada con barandilla negra' },
  { title: 'Espacios para el día a día.', label: 'Cocinas y baños', copy: 'Reformamos cocinas y baños para mejorar su funcionalidad, comodidad y estilo, cuidando la distribución, los materiales y el equipamiento.' },
  { title: 'Nuevas posibilidades.', label: 'Interiores y exteriores', copy: 'Renovamos y redistribuimos espacios para adaptarlos a tus necesidades y mejorar su aprovechamiento.' },
];
