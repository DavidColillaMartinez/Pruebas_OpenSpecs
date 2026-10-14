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
        `La solicitud viaja a /api/catalog/quote-requests en Vercel y se tramita con n8n alojado en la infraestructura técnica del propietario de la web. Resend envía el aviso a ${b.email}; Gmail recibe y conserva ese correo. Si facilitas un correo válido, se utiliza como Reply-To para que la empresa pueda responderte. presupuestos@avisos.arealrmq.es es un remitente técnico, no un buzón de atención.`,
        'El flujo actual no guarda solicitudes, contacto, mensajes ni artículos de presupuesto en la base de datos de la web ni en una cola de reintentos. Neon se consulta únicamente con identificadores del catálogo para resolver información de productos; el contacto y el texto libre no se envían a esa consulta. La confirmación del envío indica aceptación por Resend, no garantiza entrega en la bandeja de entrada. No hay reintentos programados ni copia de recuperación de la solicitud en ese flujo.',
      ] },
      { id: 'whatsapp', title: 'Contacto por WhatsApp', paragraphs: [
        'El formulario de Contacto prepara un texto con tu nombre, teléfono y mensaje. Esos campos permanecen en memoria durante el uso del formulario. Al pulsar «Enviar por WhatsApp» se abre el servicio externo y se transmite el texto preparado a WhatsApp en su enlace; tú decides después si envías el mensaje a la empresa. No se utiliza el endpoint de presupuestos ni se registra esa consulta en la base de la web.',
        'Cuando recibimos el mensaje, lo usamos para atender tu consulta. Si trata de un presupuesto o proyecto solicitado por ti, la base es precontractual (artículo 6.1.b RGPD). Para consultas generales, la base propuesta es el interés legítimo en responder a las comunicaciones recibidas (artículo 6.1.f RGPD). WhatsApp trata además datos conforme a su propia política. No confundas borrar el formulario con eliminar el mensaje de WhatsApp o de los sistemas de la empresa.',
      ] },
      { id: 'asistente', title: 'Asistente virtual', paragraphs: [
        'El asistente recibe el texto que escribes, un identificador de solicitud y conversación, el número de turno y el contexto de la página: ruta, producto y filtros de catálogo, incluido el término de búsqueda si lo hay, y el idioma español. Utiliza /api/chat/messages en Vercel y la infraestructura técnica con n8n para generar orientación mediante un servicio de inteligencia artificial configurado en backend.',
        'La finalidad es responder consultas sobre reformas y catálogo. La base propuesta es el interés legítimo en atender consultas y facilitar la información del sitio (artículo 6.1.f RGPD). Es un canal opcional: puedes contactar directamente con la empresa. Evita incluir documentos de identidad, datos sensibles o información personal de terceros. Sus respuestas son orientativas y no contratan servicios ni aprueban presupuestos.',
        'La conversación del navegador se mantiene en memoria mientras está abierta la web; una recarga comienza un nuevo chat y al cargar se elimina la clave de historial usada por versiones anteriores. «Nueva conversación» reinicia la conversación visible, pero no equivale a borrar registros del servidor, del servicio de IA o ejecuciones históricas de n8n.',
      ] },
      { id: 'navegacion', title: 'Navegación y recursos externos', paragraphs: [
        'Vercel aloja la web y ejecuta sus endpoints. Los servicios de infraestructura pueden tratar dirección IP, información de la petición y datos técnicos del navegador para entregar el contenido y proteger el servicio. La base propuesta para la seguridad y operación técnica es el interés legítimo en mantener el sitio disponible y prevenir abusos (artículo 6.1.f RGPD). Hostalia gestiona el registro del dominio y DNS, no aloja esta web.',
        'El navegador solicita fuentes a Google Fonts, algunas imágenes a Unsplash y medios a assets.colilladavid.es. Al cargar esos recursos, sus servidores reciben datos de conexión, como la dirección IP y la información técnica de la petición. Los enlaces a redes sociales y mapas abren servicios externos; no son formularios de presupuesto.',
        'La web no incorpora publicidad ni suscripciones comerciales. El almacenamiento funcional del navegador se explica en la página de cookies y almacenamiento. Los registros de entrega de correo de Resend no son analítica de visitas.',
      ] },
      { id: 'destinatarios', title: 'Servicios y transferencias internacionales', paragraphs: [
        'Intervienen Vercel (alojamiento y endpoints), la infraestructura técnica que ejecuta n8n, Resend (transporte del correo) y Google/Gmail (recepción del correo de la empresa). El asistente utiliza además el servicio de IA configurado en backend. n8n es autoalojado: usar su software no significa por sí solo enviar los mensajes a n8n Cloud o a su fabricante.',
        'Estos servicios pueden tratar datos fuera del Espacio Económico Europeo. En Resend, elegir Ireland afecta a la región de envío: los datos de cuenta, metadatos, logs y registros API se almacenan en Estados Unidos. La región de funciones de Vercel tampoco garantiza residencia europea de todos sus datos. Google utiliza infraestructura internacional.',
        'La documentación pública de Resend y Vercel contempla cláusulas contractuales tipo y el Marco de Privacidad de Datos UE-EE. UU.; Google publica sus marcos de transferencia. Su aplicación concreta depende del servicio y las condiciones de la cuenta. Puedes solicitar información sobre las transferencias y sus garantías al correo de privacidad de la empresa. Las políticas de los proveedores enlazadas más abajo explican sus prácticas; no implican que los datos permanezcan siempre en Europa.',
        'Para arquitectura, la empresa facilita al interesado el teléfono del profesional independiente. Este contacto no constituye por sí mismo un envío de datos del interesado al arquitecto. La contratación y el tratamiento de datos que realices directamente con ese profesional son separados.',
      ] },
      { id: 'conservacion', title: 'Conservación: web y empresa', paragraphs: [
        'Los datos de contacto de los formularios permanecen en memoria durante su uso. La selección de productos se conserva en el navegador sin notas libres; la web no mantiene una base de solicitudes tras el envío transitorio. Esto no elimina los correos recibidos por la empresa ni las retenciones técnicas de sus proveedores.',
        'En su gestión interna, la empresa numera los presupuestos y los conserva con los datos del cliente para recuperar solicitudes cuando vuelve a contactar, incluso después de un año. Actualmente no tiene un plazo de borrado ni una eliminación automática de esos presupuestos. El buzón de Gmail conserva los correos recibidos. Esta descripción de la práctica actual no establece un plazo legal de conservación ni equipara los presupuestos no contratados a facturas.',
        'La duración de registros técnicos y copias depende de los servicios utilizados y de su configuración. Reiniciar el chat o retirar datos del navegador no elimina ejecuciones históricas de n8n, registros del proveedor de IA o posibles copias históricas de la base. Para solicitar acceso o supresión, utiliza el contacto indicado en el siguiente apartado.',
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
        'Además de las cookies, un sitio puede guardar información mediante localStorage (almacenamiento local) y sessionStorage (almacenamiento de sesión de una pestaña). AREA LRMQ utiliza las claves que se detallan a continuación para la selección de productos, preferencias elegidas y continuidad de navegación. No se utilizan para publicidad ni para crear perfiles comerciales.',
        'En la revisión local del 14/10/2026 no se observaron cookies ni scripts de analítica de visitas. El almacenamiento funcional identificado responde a funciones solicitadas y no se añade un banner de consentimiento para esas funciones. Esto no significa que no existan peticiones a terceros ni describe las cookies de los sitios externos que decidas abrir.',
      ] },
      { id: 'externos', title: 'Recursos externos y enlaces', paragraphs: [
        'Google Fonts sirve las tipografías, Unsplash algunas imágenes externas y assets.colilladavid.es los medios alojados para el sitio y el catálogo. Esas conexiones transmiten datos técnicos de la petición a sus servidores; no son equivalentes al almacenamiento de selección descrito en la tabla.',
        'WhatsApp, Instagram y Google Maps tienen sus propias tecnologías y políticas cuando los abres. El enlace preparado por el formulario de WhatsApp también contiene los datos que hayas escrito. El transporte y recepción de presupuestos mediante Resend y Gmail se explican en privacidad, no son cookies de analítica del navegador.',
      ] },
      { id: 'control', title: 'Cómo gestionar el almacenamiento', paragraphs: [
        'Puedes vaciar la selección desde «Mi presupuesto», cambiar el tema con su control y borrar cookies y datos del sitio desde los ajustes de tu navegador. Al borrar esos datos puedes perder la selección, el tema o el estado de retorno al catálogo. El almacenamiento local no tiene caducidad programada: también puede ser eliminado por el propio navegador.',
        'Los formularios y la conversación actual permanecen en memoria, sin persistir contacto o historial de chat en el navegador. Borrar los datos del sitio no borra los mensajes ya enviados, los correos de Gmail ni los registros de los proveedores.',
      ] },
    ],
  },
};

export const BROWSER_STORAGE = [
  { key: 'lrmq:theme:v1', type: 'localStorage', purpose: 'Recordar el tema claro u oscuro elegido.', duration: 'Sin caducidad programada; hasta cambiarlo o borrar los datos del sitio.' },
  { key: 'lrmq:quote-selection:v2', type: 'localStorage', purpose: 'Conservar productos, cantidades y características de tu selección, sin notas libres ni contacto.', duration: 'Sin caducidad programada; se actualiza al eliminar, vaciar o enviar correctamente las líneas seleccionadas.' },
  { key: 'lrmq:assistant:welcome:v1', type: 'sessionStorage', purpose: 'Recordar que has descartado la bienvenida del asistente.', duration: 'Sesión de la pestaña.' },
  { key: 'catalog:return-state', type: 'sessionStorage', purpose: 'Recuperar filtros y posición al volver al catálogo.', duration: 'Sesión de la pestaña; se elimina al recuperar el retorno en el catálogo.' },
] as const;

export const PROVIDER_PRIVACY_LINKS = [
  { label: 'Vercel', href: 'https://vercel.com/legal/privacy-policy' },
  { label: 'Resend', href: 'https://resend.com/legal/privacy-policy' },
  { label: 'Google y Gmail', href: 'https://policies.google.com/privacy?hl=es' },
  { label: 'WhatsApp', href: 'https://www.whatsapp.com/legal/privacy-policy-eea' },
  { label: 'Unsplash', href: 'https://unsplash.com/privacy' },
] as const;
