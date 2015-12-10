import Serializer from 'ember-cli-mirage/serializer';
import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | Base | Associations | Embedded Collections', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    let wordSmith = this.schema.wordSmith.create({name: 'Link'});
    let blogPost = wordSmith.createBlogPost({title: 'Lorem'});
    blogPost.createFineComment({text: 'pwned'});

    wordSmith.createBlogPost({title: 'Ipsum'});

    this.schema.wordSmith.create({name: 'Zelda'});

    this.BaseSerializer = Serializer.extend({
      embed: true
    });
  },

  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`it can embed a collection with a has-many relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      relationships: ['blog-posts']
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  var result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {
        id: 1,
        name: 'Link',
        blogPosts: [
          {id: 1, title: 'Lorem'},
          {id: 2, title: 'Ipsum'}
        ]
      },
      {
        id: 2,
        name: 'Zelda',
        blogPosts: []
      }
    ]
  });
});

test(`it can embed a collection with a chain of has-many relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    wordSmith: this.BaseSerializer.extend({
      relationships: ['blog-posts']
    }),
    blogPost: this.BaseSerializer.extend({
      relationships: ['fine-comments']
    })
  });

  let wordSmiths = this.schema.wordSmith.all();
  var result = registry.serialize(wordSmiths);

  assert.deepEqual(result, {
    wordSmiths: [
      {
        id: 1,
        name: 'Link',
        blogPosts: [
          {
            id: 1,
            title: 'Lorem',
            fineComments: [
              {id: 1, text: 'pwned'}
            ]
          },
          {
            id: 2,
            title: 'Ipsum',
            fineComments: []
          }
        ]
      },
      {
        id: 2,
        name: 'Zelda',
        blogPosts: []
      }
    ]
  });
});

test(`it can embed a collection with a belongs-to relationship`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    blogPost: this.BaseSerializer.extend({
      relationships: ['word-smith']
    })
  });

  let blogPosts = this.schema.blogPost.all();
  var result = registry.serialize(blogPosts);

  assert.deepEqual(result, {
    blogPosts: [
      {
        id: 1,
        title: 'Lorem',
        wordSmith: {id: 1, name: 'Link'}
      },
      {
        id: 2,
        title: 'Ipsum',
        wordSmith: {id: 1, name: 'Link'}
      }
    ]
  });
});

test(`it can embed a collection with a chain of belongs-to relationships`, function(assert) {
  let registry = new SerializerRegistry(this.schema, {
    application: this.BaseSerializer,
    fineComment: this.BaseSerializer.extend({
      relationships: ['blog-post']
    }),
    blogPost: this.BaseSerializer.extend({
      relationships: ['word-smith']
    })
  });

  let fineComments = this.schema.fineComment.all();
  var result = registry.serialize(fineComments);

  assert.deepEqual(result, {
    fineComments: [
      {
        id: 1,
        text: 'pwned',
        blogPost: {
          id: 1,
          title: 'Lorem',
          wordSmith: {id: 1, name: 'Link'}
        }
      }
    ]
  });
});
