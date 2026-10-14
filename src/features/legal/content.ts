import { LEGAL_BUSINESS, LEGAL_ROUTES } from './business';

type LegalSection = { id: string; title: string; paragraphs: string[] };
type LegalDocument = { path: string; title: string; description: string; intro: string; sections: LegalSection[] };

const b = LEGAL_BUSINESS;
export const LEGAL_DOCUMENTS: Record<'notice' | 'privacy' | 'cookies', LegalDocument> = {
  notice: {
    ...LEGAL_ROUTES[0],
    description: 'Identidad y contacto del titular de AREA LRMQ, uso de la web y naturaleza informativa de su catálogo y presupuestos gratuitos.',
    intro: 'Información sobre el titular y el uso de esta web.',
    sections: [
      { id: 'titular', title: 'Titular y contacto', paragraphs: [
        `La web ${b.origin} pertenece a ${b.company}, con NIF ${b.taxId}, que utiliza la marca comercial ${b.brand}.`,
        `Domicilio de contacto: ${b.address}. Correo electrónico: ${b.email}. Teléfono: ${b.phone}.`,
      ] },
      { id: 'actividad', title: 'Información y presupuestos gratuitos', paragraphs: [
        'La web presenta reformas integrales, cocinas y baños, oficios especializados y una tienda de exposición. Su catálogo de productos de baño permite solicitar información y presupuestos gratuitos. No permite comprar, contratar ni pagar online. Enviar una solicitud no formaliza una contratación.',
        'Para proyectos de arquitectura y tramitaciones, incluidos cambios de local a vivienda, facilitamos el contacto de profesionales independientes. El interesado contrata con ellos por separado; esos profesionales gestionan proyectos, trámites y facturación bajo su propia actividad. ÁREA LRMQ realiza las obras cuando procede, una vez resueltos los trámites, y no gestiona ni factura esos servicios profesionales.',
      ] },
      { id: 'uso', title: 'Uso del sitio y sus contenidos', paragraphs: [
        'Utiliza la web de forma lícita y facilita únicamente la información necesaria para tu consulta. No intentes interferir en su funcionamiento ni enviar contenidos ilícitos o datos de otras personas sin estar legitimado para ello.',
        'Las fotografías propias de trabajos y el logotipo se utilizan con autorización de la empresa. La web también contiene imágenes externas y contenidos de proveedores de catálogo, cuyos derechos corresponden a sus respectivos titulares. La consulta del sitio no concede derechos de explotación sobre esos materiales.',
        'Los enlaces a WhatsApp, Google Maps, Instagram y otros sitios externos permiten acceder a servicios con sus propias condiciones y políticas de privacidad.',
      ] },
    ],
  },
  privacy: {
    ...LEGAL_ROUTES[1],
    description: 'Información sobre los datos de solicitudes de presupuesto, contacto por WhatsApp, asistente y navegación de AREA LRMQ, y ejercicio de derechos.',
    intro: 'Cómo se utilizan los datos en cada canal de esta web, conforme al RGPD y a la Ley Orgánica 3/2018.',
    sections: [
      { id: 'responsable', title: 'Responsable del tratamiento', paragraphs: [
        `El responsable es ${b.company}, NIF ${b.taxId}, con domicilio en ${b.address}. Para consultas de privacidad y ejercicio de derechos: ${b.email}.`,
      ] },
      { id: 'presupuestos', title: 'Solicitudes de presupuesto', paragraphs: [
        'Tratamos el nombre, el correo electrónico o teléfono de contacto, el mensaje y, según el formulario, el tipo de reforma y los artículos seleccionados, cantidades y características. También se transmite la página de origen. El nombre y al menos un medio de contacto son necesarios para atender la solicitud; los demás datos permiten concretarla. Sin un contacto no podemos responderte.',
        'La finalidad es preparar y atender el presupuesto gratuito y realizar su seguimiento. La base jurídica es la aplicación, a petición del interesado, de medidas precontractuales (artículo 6.1.b del RGPD). Si no hay respuesta, la empresa puede llamar aproximadamente a la semana para comprobar si sigue existiendo interés en esa solicitud. No utiliza estos contactos para promociones u ofertas.',
        'El formulario exige confirmar la lectura de esta información. Esa casilla acredita que se ha mostrado la información de privacidad; no es un consentimiento para publicidad ni cambia la base jurídica de la solicitud.',
        'La empresa recibe la solicitud por correo empresarial y responderá mediante los datos de contacto que facilites.',
      ] },
      { id: 'whatsapp', title: 'Contacto por WhatsApp', paragraphs: [
        'El formulario de Contacto prepara un texto con tu nombre, teléfono y mensaje. Esos campos permanecen en memoria durante el uso del formulario. Al pulsar «Enviar por WhatsApp» se abre el servicio externo y se transmite el texto preparado a WhatsApp en su enlace; tú decides después si envías el mensaje a la empresa.',
        'Cuando recibimos el mensaje, lo usamos para atender tu consulta. Si trata de un presupuesto o proyecto solicitado por ti, la base es precontractual (artículo 6.1.b RGPD). Para consultas generales, el interés legítimo es responder a las comunicaciones recibidas (artículo 6.1.f RGPD). WhatsApp trata además datos conforme a su propia política. Borrar el formulario no elimina los mensajes ya enviados a WhatsApp o a la empresa.',
      ] },
      { id: 'asistente', title: 'Asistente virtual', paragraphs: [
        'El asistente utiliza el texto que escribes, la conversación y el contexto de navegación: la página y el producto que consultas, los filtros y el término de búsqueda del catálogo, si lo hay. Un servicio de inteligencia artificial utiliza esta información para generar respuestas relacionadas con tu consulta.',
        'La finalidad es responder consultas sobre reformas y catálogo. El interés legítimo es atender consultas y facilitar la información del sitio (artículo 6.1.f RGPD). Es un canal opcional: puedes contactar directamente con la empresa. Evita incluir documentos de identidad, datos sensibles o información personal de terceros. Sus respuestas son orientativas y no contratan servicios ni aprueban presupuestos.',
        'La conversación del navegador se mantiene en memoria mientras está abierta la web; una recarga comienza un nuevo chat. «Nueva conversación» reinicia la conversación visible, pero no elimina los datos que ya hayan recibido los servicios que atienden el asistente.',
      ] },
      { id: 'navegacion', title: 'Navegación y recursos externos', paragraphs: [
        'Los servicios de alojamiento web pueden tratar la dirección IP, los datos de conexión y la información técnica del navegador para entregar el contenido y proteger el servicio. El interés legítimo es mantener el sitio disponible y prevenir abusos (artículo 6.1.f RGPD).',
        'Las tipografías, algunas imágenes y otros contenidos multimedia se cargan desde servicios externos. Al cargarlos, esos servicios reciben datos de conexión, como la dirección IP y la información técnica del navegador. Los enlaces a redes sociales y mapas abren servicios externos; no son formularios de presupuesto.',
        'La web no incorpora publicidad ni suscripciones comerciales. El almacenamiento funcional del navegador se explica en la página de cookies y almacenamiento.',
      ] },
      { id: 'destinatarios', title: 'Servicios y transferencias internacionales', paragraphs: [
        'Para prestar estos servicios intervienen proveedores de alojamiento web, gestión de solicitudes, comunicaciones electrónicas, recepción de correo empresarial y asistencia mediante inteligencia artificial. También intervienen servicios externos que suministran tipografías, imágenes y contenidos multimedia. Cada categoría recibe los datos necesarios para su función: datos de conexión para mostrar la web, solicitudes y contacto para gestionar comunicaciones, y mensajes y contexto de navegación para el asistente.',
        'Los servicios de alojamiento y comunicaciones electrónicas pueden tratar datos fuera del Espacio Económico Europeo, incluido Estados Unidos. En el servicio de envío de correo, determinados datos asociados al envío se almacenan en Estados Unidos. La recepción de correo empresarial utiliza servicios con infraestructura internacional. Utilizar esta web no implica que todos tus datos permanezcan en Europa. La asistencia mediante inteligencia artificial y la carga de recursos externos también pueden implicar tratamiento fuera del Espacio Económico Europeo.',
        `Puedes solicitar información sobre las transferencias internacionales y las garantías aplicables escribiendo a ${b.email}.`,
        'Para arquitectura, la empresa facilita al interesado el teléfono del profesional independiente. Este contacto no constituye por sí mismo un envío de datos del interesado al arquitecto. La contratación y el tratamiento de datos que realices directamente con ese profesional son separados.',
      ] },
      { id: 'conservacion', title: 'Conservación de los datos', paragraphs: [
        'Los datos de contacto de los formularios permanecen en memoria durante su uso. La selección de productos se conserva en el navegador sin notas libres ni datos de contacto, con la duración indicada en cookies y almacenamiento. Borrar los datos del navegador no elimina las solicitudes ni los mensajes ya recibidos por la empresa.',
        'La empresa conserva los presupuestos con los datos del cliente para recuperar solicitudes cuando vuelve a contactar, incluso después de un año. Actualmente no aplica un plazo de borrado ni una eliminación automática de esos presupuestos. El correo empresarial conserva los mensajes recibidos. Esta práctica no equivale a un plazo legal de conservación.',
        'Reiniciar el chat no elimina los datos ya recibidos por los servicios de asistencia mediante inteligencia artificial. Para solicitar acceso o supresión de tus datos, utiliza el contacto indicado en el siguiente apartado.',
      ] },
      { id: 'derechos', title: 'Tus derechos', paragraphs: [
        `Puedes solicitar acceso, rectificación, supresión, limitación del tratamiento, oposición y, cuando sea aplicable, portabilidad, escribiendo a ${b.email} o al domicilio ${b.address}. Indica el derecho que quieres ejercer y la información que permita localizar tu solicitud. Si existe una duda razonable sobre tu identidad, puede ser necesario pedir información adicional proporcionada para verificarla.`,
        'Puedes oponerte a los tratamientos basados en interés legítimo por motivos relacionados con tu situación particular. Si un tratamiento se basa en consentimiento específico, puedes retirarlo sin afectar a la licitud anterior; esta web no solicita consentimiento para marketing. Los derechos se ejercen en los términos del RGPD y la Ley Orgánica 3/2018.',
        'También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD). El RGPD establece, con carácter general, respuesta a las solicitudes de derechos en un mes, con posible ampliación motivada en los casos previstos por la norma.',
      ] },
    ],
  },
  cookies: {
    ...LEGAL_ROUTES[2],
    description: 'Almacenamiento funcional de AREA LRMQ: selección de catálogo, preferencia de tema, bienvenida del asistente y retorno al catálogo.',
    intro: 'Qué se guarda en tu navegador y qué recursos externos se cargan.',
    sections: [
      { id: 'tecnologias', title: 'Almacenamiento funcional', paragraphs: [
        'Además de las cookies, un sitio puede guardar información mediante localStorage (almacenamiento local) y sessionStorage (almacenamiento de sesión de una pestaña). AREA LRMQ utiliza estas tecnologías para recordar tu preferencia de tema, conservar la selección de productos, recordar que has cerrado la bienvenida del asistente y facilitar el retorno al catálogo. No se utilizan para publicidad ni para crear perfiles comerciales.',
        'El almacenamiento descrito responde a esas funciones de la web. Las conexiones con servicios externos y las tecnologías de los sitios que decidas abrir se distinguen de este almacenamiento del navegador.',
      ] },
      { id: 'externos', title: 'Recursos externos y enlaces', paragraphs: [
        'Las tipografías, algunas imágenes y otros contenidos multimedia se cargan desde servicios externos. Estas conexiones transmiten datos de conexión, como la dirección IP y la información técnica del navegador; no son equivalentes al almacenamiento de selección descrito en la tabla. La política de privacidad explica el tratamiento de estos datos y las transferencias internacionales.',
        'WhatsApp, Instagram y Google Maps tienen sus propias tecnologías y políticas cuando los abres. El enlace preparado por el formulario de WhatsApp también contiene los datos que hayas escrito.',
      ] },
      { id: 'control', title: 'Cómo gestionar el almacenamiento', paragraphs: [
        'Puedes vaciar la selección desde «Mi presupuesto», cambiar el tema con su control y borrar cookies y datos del sitio desde los ajustes de tu navegador. Al borrar esos datos puedes perder la selección, el tema o el estado de retorno al catálogo. El almacenamiento local no tiene caducidad programada: también puede ser eliminado por el propio navegador.',
        'Los formularios y la conversación actual permanecen en memoria, sin guardar los datos de contacto ni el historial del chat en el almacenamiento del navegador. Borrar los datos del sitio no borra los mensajes ya enviados ni los datos recibidos por la empresa o los servicios que atienden tus consultas.',
      ] },
    ],
  },
};

export const BROWSER_STORAGE = [
  { key: 'Preferencia de tema', type: 'localStorage', purpose: 'Recordar el tema claro u oscuro elegido.', duration: 'Sin caducidad programada; hasta cambiarlo o borrar los datos del sitio.' },
  { key: 'Selección de productos', type: 'localStorage', purpose: 'Conservar productos, cantidades y características de tu selección, sin notas libres ni contacto.', duration: 'Sin caducidad programada; se actualiza al eliminar, vaciar o enviar correctamente las líneas seleccionadas.' },
  { key: 'Bienvenida del asistente', type: 'sessionStorage', purpose: 'Recordar que has descartado la bienvenida del asistente.', duration: 'Sesión de la pestaña.' },
  { key: 'Retorno al catálogo', type: 'sessionStorage', purpose: 'Recuperar filtros y posición al volver al catálogo.', duration: 'Sesión de la pestaña; se elimina al recuperar el retorno en el catálogo.' },
] as const;

export const PROVIDER_PRIVACY_LINKS = [
  { label: 'WhatsApp', href: 'https://www.whatsapp.com/legal/privacy-policy-eea' },
] as const;
