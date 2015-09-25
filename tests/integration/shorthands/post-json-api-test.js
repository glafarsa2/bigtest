import {module, test} from 'qunit';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
// import post from 'ember-cli-mirage/shorthands/post';
import JSONAPISerializer from 'ember-cli-mirage/serializers/json-api-serializer';

module('Integration | Shorthands | POST with orm, JSONAPI-style payload', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({})
      },
      serializers: {
        application: JSONAPISerializer
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
    this.schema = this.server.schema;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('undefined shorthand creates a record and returns the new model', function(assert) {
  let body = JSON.stringify({
    data: {
      type: 'authors',
      attributes: {
        'first-name': 'Ganon',
        'last-name': 'Dorf',
      }
    }
  });
  let model = post.undefined(undefined, this.schema, {requestBody: body, url: '/authors'});

  assert.equal(this.schema.db.authors.length, 1);
  assert.ok(model instanceof Model);
  assert.equal(model.type, 'author');
  assert.equal(model.firstName, 'Ganon');
});

// test('string shorthand creates a record of the specified type and returns the new model', function(assert) {
//   let body = '{"author":{"first_name":"Ganon","last_name":"Dorf"}}';
//   let model = post.string('author', this.schema, {requestBody: body, url: '/people'});

//   assert.equal(this.schema.db.authors.length, 1);
//   assert.ok(model instanceof Model);
//   assert.equal(model.type, 'author');
//   assert.equal(model.first_name, 'Ganon');
// });

// test('query params are ignored', function(assert) {
//   let body = '{"author":{"first_name":"Ganon","last_name":"Dorf"}}';
//   let model = post.undefined(undefined, this.schema, {requestBody: body, url: '/authors?foo=bar', queryParams: {foo: 'bar'}});

//   assert.equal(this.schema.db.authors.length, 1);
//   assert.ok(model instanceof Model);
//   assert.equal(model.type, 'author');
//   assert.equal(model.first_name, 'Ganon');
// });

