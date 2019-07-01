'use strict';
let express = require('express');
let kue = require('kue');

let config = require('../../config');
let AdapterFactory = require('../../adapters/factory');
let factory = new AdapterFactory(config);

let router = express.Router();

router.post('/products/update', function(req, res) { // TODO: add api key middleware

  let skus_array = req.body.sku;

  console.log('Incoming pull request for', skus_array)
  if(skus_array.length > 0){
    let queue = kue.createQueue(Object.assign(config.kue, { redis: config.redis }));

    queue.createJob('product', { skus: skus_array, adapter: 'magento' }).save();
    res.json({ status: 'done', message: 'Products ' + skus_array + ' scheduled to be refreshed'});
  } else {
    res.json({ status: 'error', message: 'Please provide product SKU separated by comma'});
  }
});

router.get('/products/update/sku/:sku', function(req, res){

  let sku = req.params['sku'];
  console.log('Queuing update for sku: %s', sku);

  let queue = kue.createQueue(Object.assign(config.kue, { redis: config.redis }));

  queue.createJob('product', { skus: [sku], adapter: 'magento' }).save();
  res.json({ status: 'done', message: 'Product ' + sku + ' scheduled to be refreshed'});
});

module.exports = router;
