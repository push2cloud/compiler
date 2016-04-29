'use strict';

const _ = require('lodash');
const mkdirp = require('mkdirp');
const debug = require('debug')('push2cloud-compiler:prepare:createTmpDir');
const debugCb = require('./debugCb');

module.exports = _.curry(
(
  tmpDir
, cb
) => (
  mkdirp(tmpDir, debugCb(debug, (err) => {
    if (err) return cb(err);
    cb(null);
  }))
));
