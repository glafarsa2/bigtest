import _isArray from 'lodash/lang/isArray';
import assert from 'ember-cli-mirage/assert';
import { camelize, singularize, dasherize } from 'ember-cli-mirage/utils/inflector';

const allDigitsRegex = /^\d+$/;

export default class BaseShorthandRouteHandler {

  constructor(schema, serializerOrRegistry, shorthand, path, options={}) {
    shorthand = shorthand || this.getModelClassFromPath(path);
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.shorthand = shorthand;
    this.options = options;

    let type = _isArray(shorthand) ? 'array' : typeof shorthand;
    if (type === 'string') {
      let modelClass = this.schema[camelize(singularize(shorthand))];
      this.handle = (request) => {
        return this.handleStringShorthand(request, modelClass);
      };
    } else if (type === 'array') {
      let modelClasses = shorthand.map((modelName) => this.schema[camelize(singularize(modelName))]);
      this.handle = (request) => {
        return this.handleArrayShorthand(request, modelClasses);
      };
    }
  }

  getModelClassFromPath(fullPath) {
    if (!fullPath) { return; }
    let path = fullPath.split('/');
    let lastPath;
    while (path.length > 0) {
      lastPath = path.splice(-1)[0];
      if (lastPath && lastPath !== ':id') {
        break;
      }
    }
    let modelName = dasherize(camelize(singularize(lastPath)));
    return modelName;
  }

  handleStringShorthand() { }
  handleArrayShorthand() { }

  _getIdForRequest(request) {
    let id;
    if (request && request.params && request.params.id) {
      id = request.params.id;
      // If parses, coerce to integer
      if (typeof id === "string" && allDigitsRegex.test(id)) {
        id = parseInt(request.params.id, 10);
      }
    }
    return id;
  }

  _getJsonApiDocForRequest(request, modelName) {
    let body;
    if (request && request.requestBody) {
      body = JSON.parse(request.requestBody);
    }
    return this.serializerOrRegistry.normalize(body, modelName);
  }

  _getAttrsForRequest(request, modelName) {
    let id = this._getIdForRequest(request);
    let json = this._getJsonApiDocForRequest(request, modelName);

    assert(
      json.data && json.data.attributes,
      `You're using a shorthand but your serializer's normalize function did not return a valid JSON:API document. http://www.ember-cli-mirage.com/docs/v0.2.x/serializers/#normalizejson`
    );

    let attrs = Object.keys(json.data.attributes).reduce((sum, key) => {
      sum[camelize(key)] = json.data.attributes[key];
      return sum;
    }, {});

    attrs.id = id;

    return attrs;
  }


}
