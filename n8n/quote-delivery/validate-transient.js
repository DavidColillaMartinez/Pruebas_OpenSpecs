const IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]+$/;
const REQUEST_BODY_KEYS = Object.freeze([
  'customerName', 'phone', 'email', 'renovationType', 'message', 'sourcePage', 'consentPrivacy', 'items',
]);
const FORBIDDEN_ATTRIBUTE_KEY_PATTERN = /(?:price|precio|importe|cost|coste|source_page|source_price|quality|hash|publication|raw_data|internal)/i;
const MAX_ATTRIBUTE_VALUE_LENGTH = 300;

function isPlanObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isJsonContentType(contentType) {
  return typeof contentType === 'string' && /^(?:application\/(?:[\w.+-]+\+)?json)\s*(?:;|$)/.test(contentType.trim());
}

function checkItem(item, index, errors) {
  const prefix = `items.${index}`;
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    errors.push(`${prefix}.productId`);
    return;
  }
  const allowedKeys = [
    'productId', 'variantId', 'commercialOfferVariantId', 'reference', 'quantity', 'productName',
    'supplier', 'category', 'imageUrl', 'selectedAttributes', 'variantSnapshot', 'notes',
  ];
  if (Object.keys(item).some((key) => !allowedKeys.includes(key))) errors.push(`${prefix}.productId`);

  if (typeof item.productId !== 'string' || item.productId.length === 0 || item.productId.length > 128 || !IDENTIFIER_PATTERN.test(item.productId)) errors.push(`${prefix}.productId`);
  if (item.variantId !== undefined && (typeof item.variantId !== 'string' || item.variantId.length === 0 || item.variantId.length > 128 || !IDENTIFIER_PATTERN.test(item.variantId))) errors.push(`${prefix}.variantId`);
  if (item.commercialOfferVariantId !== undefined && (typeof item.commercialOfferVariantId !== 'string' || item.commercialOfferVariantId.length === 0 || item.commercialOfferVariantId.length > 128 || !IDENTIFIER_PATTERN.test(item.commercialOfferVariantId))) errors.push(`${prefix}.commercialOfferVariantId`);
  if (item.reference !== undefined && (typeof item.reference !== 'string' || item.reference.length > 128 || !IDENTIFIER_PATTERN.test(item.reference))) errors.push(`${prefix}.reference`);

  const compactDuplach = typeof item.productId === 'string'
    && item.productId.toLocaleLowerCase().startsWith('duplach-')
    && item.variantSnapshot && Object.keys(item.variantSnapshot).length > 0;
  if (!compactDuplach && item.variantId === undefined && item.commercialOfferVariantId === undefined) errors.push(`${prefix}.variantId`);

  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) errors.push(`${prefix}.quantity`);
  if (typeof item.productName !== 'string' || item.productName.trim().length === 0 || item.productName.length > 300) errors.push(`${prefix}.productName`);
  if (typeof item.supplier !== 'string' || item.supplier.trim().length === 0 || item.supplier.length > 300) errors.push(`${prefix}.supplier`);
  if (typeof item.category !== 'string' || item.category.trim().length === 0 || item.category.length > 300) errors.push(`${prefix}.category`);
  if (item.notes !== undefined && (typeof item.notes !== 'string' || item.notes.length > 2000)) errors.push(`${prefix}.notes`);
  if (item.imageUrl !== undefined && (typeof item.imageUrl !== 'string' || item.imageUrl.length > 2048)) errors.push(`${prefix}.imageUrl`);

  for (const attributeName of ['selectedAttributes', 'variantSnapshot']) {
    const attributeRecord = item[attributeName];
    if (attributeRecord === undefined) continue;
    if (!isPlanObject(attributeRecord)) {
      errors.push(`${prefix}.${attributeName}`);
      continue;
    }
    for (const [key, value] of Object.entries(attributeRecord)) {
      if (/[^a-zA-Z0-9_ ]/.test(key) || key.length > 40 || FORBIDDEN_ATTRIBUTE_KEY_PATTERN.test(key)) {
        errors.push(`${prefix}.${attributeName}`);
        break;
      }
      const valueType = typeof value;
      if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean') {
        errors.push(`${prefix}.${attributeName}`);
        break;
      }
      if (valueType === 'string' && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
        errors.push(`${prefix}.${attributeName}`);
        break;
      }
    }
  }
}

function quoteValidationErrors(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    errors.push('payload');
    return errors;
  }
  if (Object.keys(body).some((key) => !REQUEST_BODY_KEYS.includes(key))) errors.push('payload');
  if (typeof body.customerName !== 'string' || body.customerName.trim().length === 0 || body.customerName.length > 200) errors.push('customerName');
  if (body.phone !== undefined && (typeof body.phone !== 'string' || body.phone.length > 80)) errors.push('phone');
  if (body.email !== undefined && (typeof body.email !== 'string' || body.email.length > 320)) errors.push('email');
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!email && !phone) errors.push('contact');
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n\0]/.test(email))) errors.push('email');
  if (phone && (!/^[+()\d .-]+$/.test(phone) || phone.replace(/\D/g, '').length < 6 || phone.replace(/\D/g, '').length > 20)) errors.push('phone');
  if (typeof body.customerName === 'string' && /[\r\n\0]/.test(body.customerName)) errors.push('customerName');
  if (body.renovationType !== undefined && (typeof body.renovationType !== 'string' || body.renovationType.length > 120)) errors.push('renovationType');
  if (body.message !== undefined && (typeof body.message !== 'string' || body.message.length > 5000)) errors.push('message');
  if (body.sourcePage !== undefined && (typeof body.sourcePage !== 'string' || body.sourcePage.length > 500)) errors.push('sourcePage');
  if (body.consentPrivacy !== true) errors.push('consentPrivacy');
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) errors.push('items');
  else body.items.forEach((item, index) => checkItem(item, index, errors));
  return errors;
}


const input=$json.body;
const headers=$json.headers||{};
const fingerprint=headers['x-lrmq-quote-fingerprint'];
const clientKey=headers['x-lrmq-quote-client'];
const ingressErrors=quoteValidationErrors(input);
if(!/^v1:[a-f0-9]{64}$/.test(fingerprint||'')||!/^v1:[a-f0-9]{64}$/.test(clientKey||'')) ingressErrors.push('payload');
if(ingressErrors.length) return [{json:{valid:'false',status:400,body:{error:'VALIDATION_ERROR',errors:[...new Set(ingressErrors)].map(field=>({field,message:'El campo no es válido.'}))}}}];
if(typeof input!=='object'||Array.isArray(input))return[{json:{valid:'false',status:400,body:{error:'VALIDATION_ERROR',errors:[{field:'body',message:'El cuerpo debe ser un objeto.'}]}}}];
const pick=(...keys)=>{for(const key of keys)if(input[key]!==undefined&&input[key]!==null)return input[key];return'';};
const clean=(value,max)=>String(value??'').trim().slice(0,max);
const safeId=/^[A-Za-z0-9._:-]+$/;
const errors=[];
let serialized='';try{serialized=JSON.stringify(input);}catch{errors.push({field:'body',message:'El cuerpo no es válido.'});}
if(Buffer.byteLength(serialized,'utf8')>65536)errors.push({field:'body',message:'La solicitud es demasiado grande.'});
if(clean(pick('website','company_website','_gotcha'),500))errors.push({field:'form',message:'La solicitud no es válida.'});
const customerName=clean(pick('customer_name','customerName','name'),200);
const phone=clean(pick('phone','telephone'),80);
const email=clean(pick('email'),320).toLowerCase();
const renovationType=clean(pick('renovation_type','renovationType'),120);
const message=clean(pick('message','notes'),5000);
const sourcePage=clean(pick('source_page','sourcePage','page'),500);
const consent=input.consent_privacy===true||input.consentPrivacy===true;
const rawItems=Array.isArray(input.items)?input.items:input.productId||input.product_id?[{productId:input.productId||input.product_id,variantId:input.variantId||input.variant_id,productName:input.productName||input.product_name,variantSnapshot:input.variantSnapshot||input.variant_snapshot,quantity:input.quantity,notes:input.itemNotes||input.item_notes}]:[];
if(!customerName)errors.push({field:'customerName',message:'El nombre es obligatorio.'});
if(!email&&!phone)errors.push({field:'contact',message:'Debes indicar email o teléfono.'});
if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.push({field:'email',message:'El email no es válido.'});
if(!consent)errors.push({field:'consentPrivacy',message:'Debes aceptar la política de privacidad.'});
if(rawItems.length<1)errors.push({field:'items',message:'Debes incluir al menos un artículo.'});
if(rawItems.length>50)errors.push({field:'items',message:'No se pueden enviar más de 50 artículos.'});
const publicKeys=new Set(["reference","measure","dimension","finish","version","has_led","lighting_type","lighting_technology","light_temp","distribution","glass","opening","orientation","shape","furniture_finish","handle_finish","countertop_finish","presentation_type","furniture_type","module_type","type","configuration","tap_type","installation","mechanism","color","texture","grille","valve","finish_family","length_cm","width_cm","offer","finishCode"]);
const cleanSnapshot=(value,index)=>{
 if(!value||typeof value!=='object'||Array.isArray(value))return{};
 return Object.fromEntries(Object.entries(value).filter(([key,value])=>{
  if(!publicKeys.has(key)||value===null||value===undefined||value==='')return false;
  if(!['string','number','boolean'].includes(typeof value)){errors.push({field:'items['+index+'].variantSnapshot',message:'Las características deben ser valores simples.'});return false;}
  if(typeof value==='string'&&(value.length>300||/https?:\/\//i.test(value))){errors.push({field:'items['+index+'].variantSnapshot',message:'Una característica no es válida.'});return false;}
  if(typeof value==='number'&&!Number.isFinite(value)){errors.push({field:'items['+index+'].variantSnapshot',message:'Una característica no es válida.'});return false;}
  return true;
 }));
};
const items=rawItems.slice(0,50).map((item,index)=>{
 if(!item||typeof item!=='object'||Array.isArray(item)){errors.push({field:'items['+index+']',message:'El artículo debe ser un objeto.'});return{};}
 const productId=clean(item.product_id||item.productId,200);
 const variantId=clean(item.variant_id||item.variantId,200);
 const commercialOfferVariantId=clean(item.commercial_offer_variant_id||item.commercialOfferVariantId,200);
 const productName=clean(item.product_name_snapshot||item.productNameSnapshot||item.productName||item.name,300);
 const quantity=Number(item.quantity??1);
 if(!Number.isInteger(quantity)||quantity<1||quantity>999)errors.push({field:'items['+index+'].quantity',message:'La cantidad debe ser un entero entre 1 y 999.'});
 const notes=clean(item.notes,2000);
 const variantSnapshot={...cleanSnapshot(item.selected_attributes||item.selectedAttributes,index),...cleanSnapshot(item.variant_snapshot||item.variantSnapshot,index)};
 if(item.reference&&!variantSnapshot.reference)variantSnapshot.reference=clean(item.reference,128);
 const compactDuplachSelection=!variantId&&!commercialOfferVariantId&&productId.toLowerCase().startsWith('duplach-')&&Object.keys(variantSnapshot).length>0;
 if(!productId||!safeId.test(productId))errors.push({field:'items['+index+'].productId',message:'El producto no es válido.'});
 if(variantId&&!safeId.test(variantId))errors.push({field:'items['+index+'].variantId',message:'La variante no es válida.'});
 if(commercialOfferVariantId&&!safeId.test(commercialOfferVariantId))errors.push({field:'items['+index+'].commercialOfferVariantId',message:'La oferta no es válida.'});
 if(!variantId&&!commercialOfferVariantId&&!compactDuplachSelection)errors.push({field:'items['+index+'].variantId',message:'La variante completa es obligatoria.'});
 if(!productName)errors.push({field:'items['+index+'].productName',message:'El nombre del producto es obligatorio.'});
 return{product_id:productId,variant_id:variantId,commercial_offer_variant_id:commercialOfferVariantId,quantity,product_name_snapshot:productName,variant_snapshot:variantSnapshot,notes};
});
if(errors.length)return[{json:{valid:'false',status:400,body:{error:'VALIDATION_ERROR',errors}}}];
const catalogItems=items.map(({product_id,variant_id,commercial_offer_variant_id})=>({product_id,variant_id,commercial_offer_variant_id}));
const queryParams=Buffer.from(JSON.stringify(catalogItems),'utf8').toString('base64');
const quoteId='q-'+fingerprint.slice(3);
return [{json:{valid:'true',queryParams,quoteId,contact:{customerName,phone,email,renovationType,message,sourcePage},items}}];
