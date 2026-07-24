# Catalog Publication Audit

Status: provisional local evidence. No Neon, n8n, import log, SQL view or public GET was modified or queried from this workspace.

Audit date: 2026-07-24
Package: `assets/Catalogo/catalogo_final_productos_pre_db/`
Package version: `final-pre-db-001`

## Local Evidence

The protected package was read without changing any file:

| Stage | Count | Source | Confidence |
|---|---:|---|---|
| JSONL product rows | 467 | `products.catalog.jsonl` | strong local snapshot |
| Unique product IDs | 467 | `products.catalog.jsonl:id` | strong local snapshot |
| Duplicate product IDs | 0 | read-only calculation | strong local snapshot |
| Product variants | 2,620 | `import_summary.json`, JSONL arrays | strong local snapshot |
| Unique variant references | 2,066 | JSONL `variants[].reference` | strong local snapshot |
| Repeated variant references | 202 | read-only calculation | requires business interpretation |
| `publication_status=publishable` | 439 | JSONL | strong local snapshot |
| Missing `publication_status` | 28 | JSONL | strong local snapshot |
| Rows with `main_image` | 467 | JSONL | strong local snapshot |
| Image manifest count | 463 | `import_summary.json` | strong local snapshot |
| Excluded candidates | 35 | `excluded.catalog.json` | strong local snapshot |

The package is split by category as follows:

| Category | Rows |
|---|---:|
| Accesorios de baño | 206 |
| Espejos | 44 |
| Grifería | 79 |
| Mamparas | 28 |
| Muebles y lavabos | 102 |
| Platos de ducha | 8 |

The product-kind distribution is 430 `simple_product`, 36 `configurable_product` and 1 `bundle_product`.

## Exclusion Evidence

The local excluded package contains 35 candidates, all currently labelled `royo_espejos_not_worked_by_client`. This is an import-package rule and MUST NOT be subtracted from the 467 product rows without proving that the candidate set and product rows share an import scope.

The package rules also state:

- Royo is limited to furniture and basins, not mirrors.
- GME covers screens and taps.
- Duplach is limited to shower trays.
- Products without useful images or minimum data are excluded.
- Variants remain inside a product and are not catalog cards.

These rules explain source intent, but they do not prove the public view predicates or the current API total.

## Waterfall

The only safe local equation is:

```text
467 imported JSONL rows
= 467 unique product IDs
= 439 rows marked publishable + 28 rows with missing publication status
```

Variants are a separate relation and MUST NOT be added to or subtracted from product rows:

```text
2,620 variant rows
!= additional products
```

The following values are retained as unconfirmed snapshots and are not used to change publication rules:

| Value | Current interpretation | Missing proof |
|---:|---|---|
| 465 | historical/reporting snapshot | source, version and query |
| 433 | README historical summary | import version and filtering step |
| 192 | reported API snapshot | request date, response and deployment |
| 190 | previously observed `pagination.total` | request date, filters and endpoint version |

The difference between local rows and public rows cannot yet be assigned mutually exclusively to inactive, non-publishable, image, minimum-data, supplier/family, duplicate or grouped-variant reasons. The responsible view/query and workflow are not present in this repository.

## Public GET Gate

The read-only probe on 2026-07-24 confirmed `limit=60` as the effective maximum. The unfiltered request returned four pages (`offset=0,60,120,180`) with `60,60,60,10` items and `pagination.total=190`; all 190 IDs and slugs were unique and all 190 passed the required `id/name/slug` normalization identity check. The response contained only `items` and `pagination`, including when `include_facets=1` was requested; no server facets or sort metadata are currently exposed. `search=alba` and `search=ALBA` each returned one item. `category_id=espejos` and `supplier_id=manillons-torrent` each returned 44 items. The label-style `category=Espejos` returned zero, so the client must use stable IDs rather than visible labels.

The live probes also showed `subcategory=Circular` returned 12 items while lowercase `circular` returned zero, `collection=Alba` returned one, `product_kind=simple_product` returned 182, `finish=Arena Mate` returned 47, and `limit=0` fell back to an effective page size of 24. Repeated `category_id` values are not OR semantics in the current workflow: the first value wins. Combined `category_id=espejos&supplier_id=manillons-torrent` returned 44. The client can preserve repeated URL values, but multi-select must remain a backend contract gate until OR semantics are implemented and verified.

The live probes for `sort=name_asc`, `sort=name_desc` and `order=name_asc` returned the same first item (`mt-espejos-alba`) as the default response and did not establish server-side sorting. Those options remain disabled unless a future response declares and applies them. The public item fields expose `name`, `publication_status` and `show_price`, but no confirmed public date, `is_new`, sales aggregate or editorial order field; recent, new, best-selling and featured sorting therefore have no reliable source yet.

The follow-up read-only probe on 2026-07-25 confirmed the same public contract after the cloud data was available: unfiltered pages at offsets `0,60,120,180` returned `60,60,60,10` items with `pagination.total=190`, `190` unique IDs and `190` unique slugs; a no-match search returned total `0`; `sort=name_desc` returned the same first item and no sort metadata; and repeated categories used the first value (`muebles-y-lavabos` before `espejos` returned total `84`). No facet or sort object was returned in any response.

Tasks requiring workflow definitions, import logs or a mutually exclusive publication waterfall remain pending. The required evidence is:

- every page with requested/effective `limit`, `offset`, `items.length` and `pagination.total`;
- unique IDs and slugs across pages;
- normalisation drops and their IDs;
- current default predicates;
- behavior of search, repeated filters, case sensitivity, zero results and sort probes.

No POST quote request was executed.

The deployment generated for commit `e26c792` was reported as successful by GitHub/Vercel, but unauthenticated GET probes to its preview URL returned `401 Protected deployment`, including `/`, `/productos`, `/api/catalog/config`, the public list, both verified slugs and a not-found slug. An authenticated owner review is required for the final hosted-page and cloud-proxy check.

## Owner Gate

Neon, n8n, views, publication rules and deployment configuration remain unchanged. The owner must provide or approve the read-only definitions and the reconciliation before tasks 3.9, 3.10, 4.1, 4.4 and 4.6 can be marked complete. No credentials, PII, webhook URLs or server variables belong in this document.
