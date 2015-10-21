import {module, test} from 'qunit';
import { Model, Factory } from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';

module('Integration | Server with ORM', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'test',
      models: {
        'blog-post': Model
      },
      factories: {
        'blog-post': Factory
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('a single blogPost db collection is made', function(assert) {
  assert.equal(this.server.db._collections.length, 1);
  assert.equal(this.server.db._collections[0].name, 'blogPosts');
});

test('create looks up the appropriate db collection', function(assert) {
  server.create('blog-post');

  assert.equal(this.server.db.blogPosts.length, 1);
});
