import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Sideloading Collections', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let link = this.schema.wordSmith.create({name: 'Link'});
    let blogPost = link.createBlogPost({title: 'Lorem'});
    link.createBlogPost({title: 'Ipsum'});

    blogPost.createFineComment({text: 'pwned'});

    let zelda = this.schema.wordSmith.create({name: 'Zelda'});
    zelda.createBlogPost({title: `Zeldas blogPost`});

    this.BaseSerializer = Serializer.extend({
      embed: false
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it throws an error if embed is false and root is false`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    wordSmith: this.BaseSerializer.extend({
      root: false,
      relationships: ['blogPosts'],
    })
  });

  let wordSmiths = this.schema.wordSmith.all();

  assert.throws(function() {
    registry.serialize(wordSmiths);
  }, /disables the root/);
});

test(`it can sideload an empty collection`, function(assert) {
  this.schema.db.emptyData();
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      relationships: ['blogPosts'],
    })
  });

  var result = registry.serialize(this.schema.wordSmith.all());

  assert.deepEqual(result, {
    wordSmiths: []
  });
});

test(`it can sideload a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      embed: false,
      relationships: ['blogPosts'],
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  var result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {id: 1, name: 'Link', blogPostIds: [1, 2]},
      {id: 2, name: 'Zelda', blogPostIds: [3]},
    ],
    blogPosts: [
      {id: 1, title: 'Lorem', wordSmithId: 1},
      {id: 2, title: 'Ipsum', wordSmithId: 1},
      {id: 3, title: 'Zeldas blogPost', wordSmithId: 2}
    ]
  });
});

test(`it can sideload a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      embed: false,
      relationships: ['blogPosts'],
    }),
    blogPost: this.BaseSerializer.extend({
      relationships: ['fineComments'],
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  var result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {id: 1, name: 'Link', blogPostIds: [1, 2]},
      {id: 2, name: 'Zelda', blogPostIds: [3]}
    ],
    blogPosts: [
      {id: 1, title: 'Lorem', wordSmithId: 1, fineCommentIds: [1]},
      {id: 2, title: 'Ipsum', wordSmithId: 1, fineCommentIds: []},
      {id: 3, title: 'Zeldas blogPost', wordSmithId: 2, fineCommentIds: []}
    ],
    fineComments: [
      {id: 1, text: 'pwned', blogPostId: 1}
    ]
  });
});

test(`it avoids circularity when serializing a collection`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      embed: false,
      relationships: ['blogPosts'],
    }),
    blogPost: this.BaseSerializer.extend({
      relationships: ['wordSmith'],
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  var result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {id: 1, name: 'Link', blogPostIds: [1, 2] },
      {id: 2, name: 'Zelda', blogPostIds: [3] },
    ],
    blogPosts: [
      {id: 1, title: 'Lorem', wordSmithId: 1},
      {id: 2, title: 'Ipsum', wordSmithId: 1},
      {id: 3, title: 'Zeldas blogPost', wordSmithId: 2},
    ]
  });
});

test(`it can sideload a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    blogPost: this.BaseSerializer.extend({
      embed: false,
      relationships: ['wordSmith'],
    })
  });

  let blogPosts = this.schema.blogPost.all();
  var result = registry.serialize(blogPosts);

  assert.deepEqual(result, {
    blogPosts: [
      {id: 1, title: 'Lorem', wordSmithId: 1 },
      {id: 2, title: 'Ipsum', wordSmithId: 1 },
      {id: 3, title: 'Zeldas blogPost', wordSmithId: 2 },
    ],
    wordSmiths: [
      {id: 1, name: 'Link'},
      {id: 2, name: 'Zelda'}
    ]
  });
});

test(`it can sideload a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    fineComment: this.BaseSerializer.extend({
      embed: false,
      relationships: ['blogPost'],
    }),
    blogPost: this.BaseSerializer.extend({
      relationships: ['wordSmith'],
    })
  });

  let fineComments = this.schema.fineComment.all();
  var result = registry.serialize(fineComments);

  assert.deepEqual(result, {
    fineComments: [
      {id: 1, text: 'pwned', blogPostId: 1}
    ],
    blogPosts: [
      {id: 1, title: 'Lorem', wordSmithId: 1}
    ],
    wordSmiths: [
      {id: 1, name: 'Link'}
    ]
  });
});
