'use strict';

/**
 * Webhook API to add specific products or categories to be synchronized by the service
 */
const commander = require('commander');
commander.option(
  '--port <port>', 'Port to listen to', (process.env.PORT || 8080)
).parse(process.argv);
var port = commander.port;

let logger = require('./log');
var express = require('express');
var app = express();
var body_parser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

app.use('/magento', require('./api/routes/magento'));
app.use('/setup', require('./api/routes/setup'));

app.listen(port);
logger.info('Magic happens on port ' + port);
