// jscs:disable disallowVar
import { Model, hasMany, Db } from '@bigtest/mirage';
import { Schema } from '@bigtest/mirage';
import {module, test} from 'qunit';

// Model classes are defined statically, just like in a typical app
var User = Model.extend({
  addresses: hasMany()
});
var Address = Model.extend();

module('Integration | ORM | reinitialize associations', {
  beforeEach() {
    this.schema = new Schema(new Db(), {
      address: Address,
      user: User
    });

    this.schema.addresses.create({ id: 1, country: 'Hyrule' });
    this.schema.users.create({ id: 1, name: 'Link', addressIds: [ 1 ] });
  }
});

// By running two tests, we force the statically-defined classes to be
// registered twice.
test('safely initializes associations', function(assert) {
  assert.equal(this.schema.users.find(1).addresses.models[0].country, 'Hyrule');
});
test('safely initializes associations again', function(assert) {
  assert.equal(this.schema.users.find(1).addresses.models[0].country, 'Hyrule');
});
