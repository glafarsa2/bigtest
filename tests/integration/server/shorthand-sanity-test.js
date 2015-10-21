import {module, test} from 'qunit';
import { Factory } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server | Shorthand sanity check', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'test',
      factories: {
        contact: Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('a get shorthand works', function(assert) {
  assert.expect(1);
  var done = assert.async();

  this.server.db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  this.server.get('/contacts');

  $.ajax({
    method: 'GET',
    url: '/contacts'
  }).done(function(res) {
    assert.deepEqual(res, {contacts: [{id: 1, name: 'Link'}]});
    done();
  });
});

test('a post shorthand works', function(assert) {
  let server = this.server;
  assert.expect(1);
  let done = assert.async();

  server.post('/contacts');

  $.ajax({
    method: 'POST',
    url: '/contacts',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).done(() => {
    assert.equal(server.db.contacts.length, 1);
    done();
  });
});

test('a put shorthand works', function(assert) {
  let server = this.server;
  assert.expect(1);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  server.put('/contacts/:id');

  $.ajax({
    method: 'PUT',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).done(() => {
    assert.equal(server.db.contacts[0].name, 'Zelda');
    done();
  });
});

test('a patch shorthand works', function(assert) {
  let server = this.server;
  assert.expect(1);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  server.patch('/contacts/:id');

  $.ajax({
    method: 'PATCH',
    url: '/contacts/1',
    data: JSON.stringify({
      contact: {
        name: 'Zelda'
      }
    })
  }).done(() => {
    assert.equal(server.db.contacts[0].name, 'Zelda');
    done();
  });
});

test('a delete shorthand works', function(assert) {
  let server = this.server;
  assert.expect(1);
  let done = assert.async();

  this.server.db.loadData({
    contacts: [
      {id: 1, name: 'Link'}
    ]
  });

  server.del('/contacts/:id');

  $.ajax({
    method: 'DELETE',
    url: '/contacts/1',
  }).done(() => {
    assert.equal(server.db.contacts.length, 0);
    done();
  });
});
