'use strict';

var fs = require('fs'),
    path = require('path'),
    schema = require('../dist/graph'),
    graphql = require('graphql'),
    utils = require('graphql/utilities');

graphql.graphql(schema.default, utils.introspectionQuery).then(function (result) {
    fs.writeFileSync(path.join(__dirname, '../../data/schema.json'), JSON.stringify(result, null, 2));
}).catch(function (errors) {
    console.error('ERROR introspecting schema: ', JSON.stringify(errors, null, 2));
});
