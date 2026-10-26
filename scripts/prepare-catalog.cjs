const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('../config/catalog-preparation.json');
const categoryOverrides = require('../config/category-overrides.json');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'public/boed_static_public/products.json');
const manifestPath = path.join(root, 'data/commerce-import-manifest.json');
const reportPath = path.join(root, 'reports/catalog-validation.json');
const sha = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const seed = value => crypto.createHash('sha256').update(value).digest().readUInt32BE(0);
const protectedFields = ['id', 'slug', 'name', 'category', 'categories', 'image', 'images', 'videos', 'sourceUrl'];
const identity = product => Object.fromEntries(protectedFields.map(key => [key, product[key]]));
function collectionFor(category, slug) {
  if (slug && categoryOverrides[slug]) return categoryOverrides[slug].collection;
  if (/Shoes/i.test(category)) return 'shoes';
  if (/Trousers|Swimwear/i.test(category)) return 'trousers';
  if (/Knitwear|Homewear/i.test(category)) return 'knitwear';
  if (/Shirts/i.test(category)) return 'shirts';
  if (/Jackets|Outerwear|Waistcoats/i.test(category)) return 'jackets';
  if (/Suits|Tuxedos/i.test(category)) return 'suits';
  return 'accessories';
}
function prepare() {
  const catalog = JSON.parse(fs.readFileSync(target, 'utf8'));
  const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
  if (previous && previous.products.length !== catalog.products.length) throw Error('Product count regression or unexpected new import; reconcile the manifest explicitly.');
  const seenIds = new Set(), seenSlugs = new Set();
  const products = [], records = [];
  for (const p of catalog.products) {
    if (seenIds.has(p.id) || seenSlugs.has(p.slug)) throw Error(`Duplicate product ${p.slug}`);
    seenIds.add(p.id); seenSlugs.add(p.slug);
    const old = previous?.products.find(item => item.frontendId === p.id);
    const fingerprint = sha(identity(p));
    if (old && old.identitySha256 !== fingerprint) throw Error(`Protected source fields changed: ${p.slug}`);
    const originalRecordSha256 = old?.originalRecordSha256 || sha(p);
    const collection = collectionFor(p.category, p.slug);
    if (categoryOverrides[p.slug]) p.requiresCategoryReview = true;
    if (p.price === null || p.price === undefined || p.priceSource === 'DEMO_ESTIMATE') {
      const nameBand = config.priceBands.find(b => new RegExp(b.nameMatch, 'i').test(p.name));
      const band = categoryOverrides[p.slug] ? nameBand : /hanger|fragrance|perfume|candle|\bpolo\b/i.test(p.name) ? nameBand : config.priceBands.find(b => new RegExp(b.categoryMatch, 'i').test(p.category));
      p.price = band.min + (seed(`price:${p.slug}`) % (Math.floor((band.max - band.min) / band.step) + 1)) * band.step;
      p.priceSource = 'DEMO_ESTIMATE';
      p.requiresPriceVerification = true;
      p.demoPriceBand = band.name;
    } else if (!Number.isFinite(p.price) || p.price <= 0) throw Error(`Invalid existing price: ${p.slug}`);
    if (p.stock === null || p.stock === undefined) {
      p.stock = config.stock.min + seed(p.slug) % (config.stock.max - config.stock.min + 1);
      p.stockSource = 'DEMO_ESTIMATE';
      p.requiresStockVerification = true;
    } else if (!Number.isSafeInteger(p.stock) || p.stock < 0) throw Error(`Invalid existing stock: ${p.slug}`);
    if (!p.description?.trim()) {
      p.description = `${p.name}. A considered addition to your wardrobe, with a distinctive look for everyday styling and special occasions.`;
      p.descriptionSource = 'GENERATED_FROM_NAME_AND_CATEGORY';
      p.requiresDescriptionReview = true;
    }
    if (!p.sizes.length) {
      p.candidateSizes = /Pocket Squares|Ties|Cufflinks|Sunglasses/.test(p.category) ? ['One size'] : config.candidateSizes[collection];
      p.requiresSizeVerification = true;
    }
    p.currency ||= config.currency;
    if (p.currency !== 'BDT') throw Error(`Currency requires explicit conversion, not relabeling: ${p.slug}`);
    const issues = [];
    if (!p.image || !p.images.length) issues.push('MISSING_IMAGES');
    for (const media of [...(p.image ? [p.image] : []), ...p.images, ...p.videos]) {
      const resolved = path.resolve(root, 'public/boed_static_public', `.${media}`);
      if (!resolved.startsWith(path.join(root, 'public/boed_static_public') + path.sep) || !fs.existsSync(resolved)) issues.push(`MISSING_MEDIA:${media}`);
    }
    if (new Set(p.images).size !== p.images.length) issues.push('SOURCE_GALLERY_HAS_DUPLICATES');
    if (p.requiresSizeVerification) issues.push('UNVERIFIED_SIZES');
    if (p.requiresPriceVerification) issues.push('DEMO_PRICE');
    if (p.requiresStockVerification) issues.push('DEMO_STOCK');
    if (p.requiresDescriptionReview) issues.push('DESCRIPTION_REVIEW');
    if (p.requiresCategoryReview) issues.push('CATEGORY_REVIEW');
    records.push({ id: p.id, slug: p.slug, collection, issues });
    products.push({ frontendId: p.id, frontendSlug: p.slug, importKey: `aura-boed:${p.id}`, sourceUrl: p.sourceUrl, sourceCategoryPaths: p.categories, sourceMedia: { mainImage: p.image, images: p.images, videos: p.videos }, collection, originalRecordSha256, identitySha256: fingerprint, backendProductId: old?.backendProductId ?? null, backendCategoryId: old?.backendCategoryId ?? null, backendVariants: old?.backendVariants ?? [], mappingStatus: old?.mappingStatus ?? 'UNMAPPED' });
  }
  const categoryPaths = [...new Set(catalog.products.flatMap(p => p.categories))].sort();
  const manifest = { version: 1, source: 'aura-boed', originalCount: previous?.originalCount ?? catalog.products.length, protectedFields, categories: categoryPaths.map(sourcePath => ({ sourcePath, collection: collectionFor(sourcePath), backendCategoryId: previous?.categories.find(c => c.sourcePath === sourcePath)?.backendCategoryId ?? null })), products };
  const report = { version: 1, productCountBefore: manifest.originalCount, productCountAfter: catalog.products.length, generatedDemoPrices: catalog.products.filter(p => p.priceSource === 'DEMO_ESTIMATE').length, generatedDemoStocks: catalog.products.filter(p => p.stockSource === 'DEMO_ESTIMATE').length, generatedDescriptions: catalog.products.filter(p => p.requiresDescriptionReview).length, unverifiedSizes: catalog.products.filter(p => p.requiresSizeVerification).length, categoryReviewProducts: catalog.products.filter(p => p.requiresCategoryReview).length, missingImageProducts: records.filter(r => r.issues.includes('MISSING_IMAGES')).length, missingMediaPaths: records.flatMap(r => r.issues.filter(i => i.startsWith('MISSING_MEDIA:'))).length, duplicateGalleryProducts: records.filter(r => r.issues.includes('SOURCE_GALLERY_HAS_DUPLICATES')).length, unresolvedProductDetails: records.filter(r => r.issues.length).length, backendMappedProducts: products.filter(p => p.mappingStatus === 'VERIFIED').length, records };
  for (const dir of ['data', 'reports']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(catalog, null, 2) + '\n');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, records: undefined }, null, 2));
  return report;
}
if (require.main === module) prepare();
module.exports = { prepare, identity, sha, seed, collectionFor };
