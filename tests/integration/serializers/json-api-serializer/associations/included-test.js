import SerializerRegistry from 'ember-cli-mirage/serializer-registry';
import JsonApiSerializer from 'ember-cli-mirage/serializers/json-api-serializer';
import schemaHelper from '../../schema-helper';
import { module, test } from 'qunit';

module('Integration | Serializers | JSON API Serializer | Associations | Included', {
  beforeEach: function() {
    this.schema = schemaHelper.setup();

    const smith = this.schema.wordSmith.create();
    const post = smith.createBlogPost();
    post.createFineComment();
    post.createFineComment();
    this.schema.blogPost.create();
  },
  afterEach() {
    this.schema.db.emptyData();
  }
});

test(`model: it can include relationships specified by the include query param`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer
  });

  const post = this.schema.blogPost.find(1);
  const request = {
    queryParams: {
      include: "word-smith,fine-comments"
    }
  };
  const result = registry.serialize(post, request);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: 1,
      attributes: {},
      relationships: {
        'word-smith': {
          data: {type: 'word-smiths', id: 1}
        },
        'fine-comments': {
          data: [
            {type: 'fine-comments', id: 1},
            {type: 'fine-comments', id: 2}
          ]
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {},
        relationships: {
          'blog-posts': {
            data: [
              {type: 'blog-posts', id: 1}
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: 1,
        attributes: {},
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      },
      {
        type: 'fine-comments',
        id: 2,
        attributes: {},
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      }
    ]
  });
});

test(`model: it can include relationships specified by a combination of the include query param (hasMany) and serializer.relationships (belongsTo, ignored)`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['word-smith'],
    })
  });

  const post = this.schema.blogPost.find(1);
  const request = {
    queryParams: {
      include: "fine-comments"
    }
  };
  const result = registry.serialize(post, request);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: 1,
      attributes: {},
      relationships: {
        'word-smith': {
          data: {type: 'word-smiths', id: 1}
        },
        'fine-comments': {
          data: [
            {type: 'fine-comments', id: 1},
            {type: 'fine-comments', id: 2}
          ]
        }
      }
    },
    included: [
      {
        type: 'fine-comments',
        id: 1,
        attributes: {},
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      },
      {
        type: 'fine-comments',
        id: 2,
        attributes: {},
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      }
    ]
  });
});


test(`model: it can include relationships specified by a combination of the include query param (belongsTo) and serializer.relationships (hasMany, ignored)`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer,
    blogPost: JsonApiSerializer.extend({
      include: ['fine-comments'],
    })
  });

  const post = this.schema.blogPost.find(1);
  const request = {
    queryParams: {
      include: "word-smith"
    }
  };
  const result = registry.serialize(post, request);

  assert.propEqual(result, {
    data: {
      type: 'blog-posts',
      id: 1,
      attributes: {},
      relationships: {
        'word-smith': {
          data: {type: 'word-smiths', id: 1}
        },
        'fine-comments': {
          data: [
            {type: 'fine-comments', id: 1},
            {type: 'fine-comments', id: 2}
          ]
        }
      }
    },
    included: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {},
        relationships: {
          'blog-posts': {
            data: [
              {type: 'blog-posts', id: 1}
            ]
          }
        }
      }
    ]
  });
});


test(`collection: it can include relationships specified by the include query param`, function(assert) {
  const registry = new SerializerRegistry(this.schema, {
    application: JsonApiSerializer
  });

  const post = this.schema.blogPost.find([1, 2]);
  const request = {
    queryParams: {
      include: "word-smith,fine-comments"
    }
  };
  const result = registry.serialize(post, request);

  assert.propEqual(result, {
    data: [
      {
        type: 'blog-posts',
        id: 1,
        attributes: {},
        relationships: {
          'word-smith': {
            data: {type: 'word-smiths', id: 1}
          },
          'fine-comments': {
            data: [
              {type: 'fine-comments', id: 1},
              {type: 'fine-comments', id: 2}
            ]
          }
        }
      },
      {
        type: 'blog-posts',
        id: 2,
        attributes: {},
        relationships: {
          'fine-comments': {
            data: []
          }
        }
      }
    ],
    included: [
      {
        type: 'word-smiths',
        id: 1,
        attributes: {},
        relationships: {
          'blog-posts': {
            data: [
              {type: 'blog-posts', id: 1}
            ]
          }
        }
      },
      {
        type: 'fine-comments',
        id: 1,
        attributes: {},
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      },
      {
        type: 'fine-comments',
        id: 2,
        attributes: {},
        relationships: {
          'blog-post': {
            data: {type: 'blog-posts', id: 1}
          }
        }
      }
    ]
  });
});
