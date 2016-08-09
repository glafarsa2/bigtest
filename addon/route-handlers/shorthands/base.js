import _isArray from 'lodash/lang/isArray';
import { toCollectionName } from 'ember-cli-mirage/utils/normalize-name';
import BaseRouteHandler from '../base';

export default class BaseShorthandRouteHandler extends BaseRouteHandler {

  constructor(schema, serializerOrRegistry, shorthand, path, options={}) {
    super();
    shorthand = shorthand || this.getModelClassFromPath(path);
    this.schema = schema;
    this.serializerOrRegistry = serializerOrRegistry;
    this.shorthand = shorthand;
    this.options = options;

    let type = _isArray(shorthand) ? 'array' : typeof shorthand;
    if (type === 'string') {
      let modelClass = this.schema[toCollectionName(shorthand)];
      this.handle = (request) => {
        return this.handleStringShorthand(request, modelClass);
      };
    } else if (type === 'array') {
      let modelClasses = shorthand.map((modelName) => this.schema[toCollectionName(modelName)]);
      this.handle = (request) => {
        return this.handleArrayShorthand(request, modelClasses);
      };
    }
  }

  handleStringShorthand() { }
  handleArrayShorthand() { }

}
