/* Browser-review mocks only. Reuse trusted repository fixtures/test declarations;
 * never import this module from the application or contact upstream services. */
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const read = async (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const json = async (path) => JSON.parse(await read(path));
async function declarations(path, names) {
  const source = await read(path);
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = new Map();
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text)) found.set(node.name.text, node.getText(ast));
    if (ts.isVariableDeclaration(node) && names.includes(node.name.getText(ast))) found.set(node.name.getText(ast), `const ${node.getText(ast)};`);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (found.size !== names.length) throw new Error(`Missing fixture declaration in ${path}`);
  const code = ts.transpileModule([...found.values()].join('\n') + `\nexport {${names.join(',')}};`, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}
const [alba, royo, detailTests, ioTests, duplach] = await Promise.all([
  json('src/features/catalog/api/fixtures/product-detail.mt-espejos-alba.json'),
  json('src/features/catalog/api/fixtures/product-detail.royo-alfa-compact-100.json'),
  declarations('src/features/catalog/pages/ProductDetailPage.test.tsx', ['gmeProduct', 'royoModularProduct']),
  declarations('src/features/catalog/pages/ProductDetailPage.gmeIo.test.tsx', ['rhioDetail', 'ioDetail']),
  declarations('src/features/catalog/api/fixtures/duplach-platos-contract.ts', ['ASSET_BASE_URL', 'threeDVariant', 'duplachStone3dFixture']),
]);
// Akord route and commercial options are documented in the local inventory.
// IDs below are explicitly audit-only; they do not claim published variant IDs.
const inventory = await json('docs/catalog-inventory-ai.json');
function findProduct(value, slug) {
  if (value?.slug === slug) return value;
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) { const found = findProduct(item, slug); if (found) return found; }
  }
}
const akordInfo = findProduct(inventory, 'gme-mamparas-ducha-akord');
if (!akordInfo) throw new Error('Akord not present in local inventory');
const akord = {
  ...detailTests.gmeProduct('gme-mamparas-ducha-glass'),
  id: akordInfo.productId, slug: akordInfo.slug, name: akordInfo.name,
  description: akordInfo.description,
  variants: akordInfo.options.map((label, index) => ({ id: `audit-akord-${index}`, finish: 'Cromo', distribution: label.replace(/ - Cromo$/, ''), label })),
};
export const products = [akord, ioTests.rhioDetail, royo, detailTests.royoModularProduct(), duplach.duplachStone3dFixture(), alba];
export const ioTestProduct = ioTests.ioDetail;
export const detailProducts = [...products, ioTestProduct];
export const facets = {
  category: [{value:'mamparas',label:'Mamparas',count:1}, {value:'griferia',label:'Grifería',count:1}, {value:'muebles-y-lavabos',label:'Muebles y lavabos',count:2}, {value:'platos-de-ducha',label:'Platos de ducha',count:1}, {value:'espejos',label:'Espejos',count:1}],
  supplier: [{value:'gme',label:'GME',count:2}, {value:'royo',label:'Royo',count:2}, {value:'duplach',label:'Duplach',count:1}, {value:'manillons-torrent',label:'Manillons Torrent',count:1}],
  finish: Array.from({length:14}, (_,i) => ({value:`acabado-${i}`,label:`Acabado de revisión ${i} con nombre completo especialmente largo`,count:1})),
  measure: Array.from({length:12}, (_,i) => ({value:`${60+i*5}x80`,label:`${60+i*5} × 80 cm`,count:1})),
};
export const basketLines = products.flatMap((p) => p.variants.slice(0, 2).map((v) => ({
  productId:p.id, variantId:v.id, productName:p.name, supplier:p.supplier_name || p.supplier_id,
  category:p.category_name || p.category_id, quantity:1,
  reference:v.reference, imageUrl:p.main_image_url || p.images?.[0]?.url,
  variantSnapshot:{...(v.attributes||{}), ...(v.finish ? {finish:v.finish}:{}), ...(v.measure ? {measure:v.measure}:{}), ...(v.reference ? {reference:v.reference}:{})},
})));

export async function installMocks(context, state = {}) {
  await context.route(/https?:\/\/[^/]+\/api\//, async (route) => {
    const req = route.request(), url = new URL(req.url());
    const respond = (body, status = 200) => route.fulfill({status, contentType:'application/json', body:JSON.stringify(body)});
    if (url.pathname.endsWith('/quote-requests')) {
      state.quotePayload = req.postDataJSON();
      if (state.quoteDelay) await new Promise(resolve => setTimeout(resolve, state.quoteDelay));
      if (state.quoteError) return respond({error:'VALIDATION_ERROR',message:'Revisión local: comprueba los datos de esta solicitud antes de volver a intentarlo.',fields:['items.0.quantity']},400);
      return respond({id:'audit-local-confirmation',status:'received',item_count:state.quotePayload.items.length},201);
    }
    if (url.pathname.includes('/chat')) {
      const body = req.postDataJSON();
      state.chatRequests = (state.chatRequests || 0) + 1;
      return respond({version:1,conversationId:'audit-chat',requestId:body.requestId,message:'Respuesta mock de revisión local. '.repeat(24),products:[],actions:[]});
    }
    if (url.pathname.endsWith('/config')) return respond({catalog_version:'audit-local',api_contract_version:'catalog-api-v1',asset_base_url:'https://assets.example/catalogo',source_catalog_base_url:'https://assets.example/catalogo',database_ready_for_public_api:true});
    if (url.pathname.endsWith('/products')) {
      if (state.loadingGate) await state.loadingGate;
      if (state.loading) await new Promise(resolve => setTimeout(resolve, 2000));
      if (state.error) return respond({error:'LOCAL_TEST'},503);
      const search = url.searchParams.get('search')?.toLowerCase();
      const items = state.empty ? [] : products.filter(p => !search || p.name.toLowerCase().includes(search));
      const offset = Number(url.searchParams.get('offset') || 0);
      return respond({items:state.paginate ? (offset ? items.slice(3) : items.slice(0,3)) : items,pagination:{limit:24,offset,total:state.paginate ? null : items.length,has_more:state.paginate && offset===0},sort:{applied:'relevance',supported:['relevance','name_asc','name_desc']},facets});
    }
    const slug = decodeURIComponent(url.pathname.split('/products/')[1] || '');
    const product = [...products, ioTestProduct].find(p => p.slug===slug);
    return respond(product || {error:'PRODUCT_NOT_FOUND',message:'Producto no encontrado'},product ? 200 : 404);
  });
  // Test-domain image doubles are labelled mocks. Production media URLs remain
  // unmodified; real media success/failure is recorded by the browser runner.
  await context.route(/https:\/\/(assets\.test|assets\.example)\//, route => route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#e8e2d8"/><text x="20" y="40">Imagen fixture local</text></svg>'}));
}
