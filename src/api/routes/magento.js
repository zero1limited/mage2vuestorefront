'use strict';
let express = require('express');
let kue = require('kue');

let config = require('../../config');
let AdapterFactory = require('../../adapters/factory');
let factory = new AdapterFactory(config);
let _get = require('lodash/get');

let router = express.Router();
const queue = kue.createQueue(Object.assign(config.kue, { redis: config.redis }));

// Attributes
router.post('/attributes/update', function(req, res) {
  let attributes = _get(req, 'body.attributes', null);
  if(attributes && !Array.isArray(attributes)){
    attributes = [attributes]
  }
  let removeNonExistant = _get(req, 'body.remove_non_existent', true);
  console.log('/attributes/update', {
    attributes: attributes,
    remove_non_existent: removeNonExistant
  });
  queue.createJob('attributes', {
    attributes: attributes,
    remove_non_existent: removeNonExistant,
    adapter: 'magento'
  }).save();

  if(Array.isArray(attributes)){
    return res.json({ status: 'done', message: 'Attributes ' + attributes.join(',') + ' scheduled to be refreshed'});
  }else{
    return res.json({ status: 'done', message: 'All Attributes scheduled to be refreshed'});
  }
});

// Categories
router.post('/categories/update', function(req, res) {
  let categories = _get(req, 'body.categories', null);
  if(categories && !Array.isArray(categories)){
    categories = [categories]
  }
  let removeNonExistant = _get(req, 'body.remove_non_existent', true);
  let extendedCategoryImport = _get(req, 'body.extended_category_import', true);
  let generateUniqueUrlKeys = _get(req, 'body.generate_unique_url_keys', true);
  console.log('/categories/update', {
    categories: categories,
    remove_non_existent: removeNonExistant,
    extended_category_import: extendedCategoryImport,
    generate_unique_url_keys: generateUniqueUrlKeys
  });
  queue.createJob('categories', {
    categories: categories,
    remove_non_existent: removeNonExistant,
    extended_category_import: extendedCategoryImport,
    generate_unique_url_keys: generateUniqueUrlKeys,
    adapter: 'magento' }).save();

  if(Array.isArray(categories)){
    return res.json({ status: 'done', message: 'Categories ' + categories.join(',') + ' scheduled to be refreshed'});
  }else{
    return res.json({ status: 'done', message: 'All Categories scheduled to be refreshed'});
  }
});

// Category Products
router.post('/category-products/update', function(req, res) {
  // TODO implement specific category/product update
  console.log('/category-products/update');
  queue.createJob('category-product', { adapter: 'magento' }).save();
  return res.json({ status: 'done', message: 'All Category => Product links scheduled to be refreshed'});
});

// products
router.post('/products/update', function(req, res) {
  let skus = _get(req, 'body.skus', null);

  if(!skus){
    return res.status(400)
    .json({ status: 'error', message: 'You must provide at least one SKU to update'});
  }

  if(!Array.isArray(skus)){
    skus = [skus]
  }
  console.log('/products/update', skus);
  queue.createJob('product', { skus: skus, adapter: 'magento' }).save();
  return res.json({ status: 'done', message: 'Products ' + skus.join(',') + ' scheduled to be refreshed'});
});

// Store Locator Stores
router.post('/store-locator/update', function(req, res) {
  let storeCodes = _get(req, 'body.store_codes', null);

  if(storeCodes && !Array.isArray(skus)){
    storeCodes = [storeCodes]
  }
  console.log('/store-locator/update', storeCodes);
  queue.createJob('store-locator', { storeCodes, adapter: 'magento' }).save();
  return res.json({ status: 'done', message: 'Stores ' + storeCodes.join(',') + ' scheduled to be refreshed'});
});

module.exports = router;
