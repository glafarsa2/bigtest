import { pluralize, singularize } from '../utils/inflector';
import BaseController from './base';

/*
  Shorthands for PUT requests.
*/
export default BaseController.extend({

  /*
    Update an object from the db, specifying the type.

      this.stub('put', '/contacts/:id', 'user');
  */
  stringHandler: function(type, db, request) {
    var id = this._getIdForRequest(request);
    var putData = this._getJsonBodyForRequest(request);
    var attrs = putData[type];
    var collection = pluralize(type);
    attrs.id = id;

    var data = db[collection].update(id, attrs);

    return data;
  },

  /*
    Update an object from the db based on singular version
    of the last portion of the url.

      this.stub('put', '/contacts/:id');
  */
  undefinedHandler: function(undef, db, request) {
    var id = this._getIdForRequest(request);
    var url = this._getUrlForRequest(request);
    var urlNoId = url.substr(0, url.lastIndexOf('/'));
    var type = singularize(urlNoId.substr(urlNoId.lastIndexOf('/') + 1));
    var collection = pluralize(type);
    var putData = this._getJsonBodyForRequest(request);
    var attrs = putData[type];

    var data = db[collection].update(id, attrs);

    return data;
  }

});
