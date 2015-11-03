/* global requirejs, require */
/*jslint node: true */

'use strict';

import Ember from 'ember';
import _keys from 'lodash/object/keys';
import { camelize } from 'ember-cli-mirage/utils/inflector';

/*
  This function looks through all files that have been loaded by Ember CLI and
  finds the ones under /mirage/[factories, fixtures, scenarios, models]/, and exports
  a hash containing the names of the files as keys and the data as values.
*/
export default function(prefix) {
  let modules = ['factories', 'fixtures', 'scenarios', 'models', 'serializers'];
  let mirageModuleRegExp = new RegExp(`^${prefix}/mirage/(${modules.join("|")})`);
  let modulesMap = modules.reduce((memo, name) => {
    memo[name] = {};
    return memo;
  }, {});

  _keys(requirejs.entries).filter(function(key) {
    return mirageModuleRegExp.test(key);
  }).forEach(function(moduleName) {
    if (moduleName.match('.jshint')) { // ignore autogenerated .jshint files
      return;
    }
    let moduleParts = moduleName.split('/');
    let moduleType = moduleParts[moduleParts.length - 2];
    let moduleKey = camelize(moduleParts[moduleParts.length - 1]);
    Ember.assert('Subdirectories under ' + moduleType + ' are not supported',
                 moduleParts[moduleParts.length - 3] === 'mirage');
    if (moduleType === 'scenario'){
      Ember.assert('Only scenario/default.js is supported at this time.',
                   moduleKey !== 'default');
    }

    let module = require(moduleName, null, null, true);
    if (!module) { throw new Error(moduleName + ' must export a ' + moduleType); }

    let data = module['default'];

    modulesMap[moduleType][moduleKey] = data;
  });

  return modulesMap;
}
