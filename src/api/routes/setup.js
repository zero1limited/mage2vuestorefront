'use strict';
let express = require('express');
let kue = require('kue');

let config = require('../../config');
let AdapterFactory = require('../../adapters/factory');
let factory = new AdapterFactory(config);
let mirgrate = require('migrate');
const migrateStore = '/var/www/.migrate';
const migrationsDirectory = '/var/www/migrations';
let _get = require('lodash/get');
let migrateConfig = {
  stateStore: migrateStore,
  migrationsDirectory: migrationsDirectory,
  filterFunction: (filename) => {
    return !filename.startsWith('.');
  }
}
const common = require('/var/www/migrations/.common');
const es = require('/var/www/src/lib/elastic');

let router = express.Router();

router.get('/migrate', function(req, res) {
  mirgrate.load(migrateConfig, function(err, set){
    res.status(200).json({
      status: 'ok',
      last_run: set.lastRun,
      migrations_available: set.migrations.map(migration => migration.title)
    })
  })
});

router.post('/migrate', function(req, res, next) {
  process.on('unhandledRejection', (error) => {
    next(error);
    // res.status(500).json({
    //   status: 'error',
    //   error: error.toString()
    // });
    // return
  });
  let action = _get(req, 'body.action');
  if(action != 'up' && action != 'down'){
    return res.status(400).json({
      status: 'unkown action type, must be "up" or "down"',
      request: req.body
    });
  }
  let target = _get(req, 'body.target', null);

  mirgrate.load(migrateConfig, function(err, set){
    if(action == 'up'){
      set.up(target, (err) => {
        if(err){
          return res.status(500).json({
            status: 'error',
            error: err.toString()
          });
        }
        return res.status(200).json({
          status: 'successfully migrated up',
        })
      })
    }else{
      set.down(target, (err) => {
        if(err){
          return res.status(500).json({
            status: 'error',
            error: err.toString()
          });
        }
        return res.status(200).json({
          status: 'successfully migrated down',
        })
      })
    }
  })

});

/**
 * @see scripts/db.js:18
 */
router.post('/reindex', function (req, res) {

  process.on('unhandledRejection', (error) => {
    return res.status(500).json({
      status: 'error',
      error: error.toString()
    });
  });

  const indexName = _get(req, 'body.index_name', false);
  if(!indexName){
    return res.status(400).json({
      status: 'error',
      message: 'You must define an index name'
    });
  }

  const tempIndex = indexName + '_' + Math.round(+new Date()/1000);

  try{
    console.log(`** Creating temporary index ${tempIndex}`)
    es.createIndex(common.db, tempIndex, (err) => {
      if(err){
        throw new Error(err)
      }
      console.log(`** Putting the mappings on top of ${tempIndex}`)

      es.putMappings(common.db, tempIndex, (err) => {
        if(err){
          throw new Error(err)
        }
        console.log(`** We will reindex ${indexName} with the current schema`)
        es.reIndex(common.db, indexName, tempIndex, (err) => {
          if(err){
            throw new Error(err)
          }
          console.log('** Removing the original index')
          es.deleteIndex(common.db, indexName, (err) => {
            if(err){
              throw new Error(err)
            }
            console.log('** Creating alias')
            es.putAlias(common.db, tempIndex, indexName, (err) => {
              console.log('Done! Bye!')
              return res.status(200).json({
                status: 'reindex completed',
              })
            })
          })
        })
      })

    })
  }catch(e){
    return res.status(500).json({
      status: 'error',
      error: e.toString()
    });
  }
});


module.exports = router;
