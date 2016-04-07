'use strict';
const BPromise = require('bluebird'),
  schema = require('./schema'),
  needle = BPromise.promisifyAll(require('needle')),
  humps = require('humps'),
  _ = require('lodash');

class DeepCrawl {
  constructor(cfg) {
    cfg = cfg || {};
    if (!cfg.apiId) {
      throw new Error('DeepCrawl called without required arg "apiId"');
    }
    if (!cfg.apiKey) {
      throw new Error('DeepCrawl called without required arg "apiKey"');
    }    

    this.apiId = cfg.apiId;
    this.apiKey = cfg.apiKey;
    this.getSessionToken = cfg.getSessionToken;
    this.accountId = cfg.accountId;
    this.baseUrl = cfg.baseUrl || 'https://prod-1-dc-api-oopeix3r.deepcrawl.com';
  }

  createEndpoints (schema) {
    const API = {};
    for (const endpoint in schema) {
      API[endpoint] = {};
    }

    return API;
  }

  generateRequest (url, options, method) {
    // first, get the sessionToken and generate the request options and headers
    return BPromise.resolve(options.sessionToken || this.getSessionToken())
      .then((sessionToken) => {
        const requestOpts = {
          json: true,
          headers: {
            'X-Auth-Token': sessionToken
          }
        };

        if (method === 'get') {
          return needle.getAsync(url, requestOpts)
            .then(this.handleResponse);
        }

        // convert all camelCased options to _ for deepcrawl
        const data = humps.decamelizeKeys(options);
        return needle[`${method}Async`](url, data, requestOpts)
          .then(this.handleResponse);
      });
  }

  generateMethod (requiredFields, url, requestMethod) {
    return (options) => {
      options = options || {};
      if (!options.sessionToken && !this.getSessionToken) {
        throw new Error(`"sessionToken" or "getSessionToken" method required`);
      }

      requiredFields.forEach((field) => {
        if (!options[field] && !this[field]) {
          throw new Error(`${field} is required`);
        }
        // if the url contains {field}, replace {field} with the passed
        // in value
        if (url.indexOf(`{${field}}`) > -1) {
          url = url.replace(`{${field}}`, (options[field] || this[field]));
        }
      });

      return this.generateRequest(url, options, requestMethod);     
    };
  }

  addMethodsToEndpoints (API, schema) {
    for (const endpoint in API) {
      const endpointUrl = this.baseUrl + schema[endpoint].route,
        requiredFields = _.clone(schema[endpoint].requiredFields || []),
        id = schema[endpoint].id;
      // remove the endpoint route, required fields, and id from the schema
      delete schema[endpoint].requiredFields;
      delete schema[endpoint].route;
      delete schema[endpoint].id;
      // all we have left are methods for the endpoint
      for (const method in schema[endpoint]) {
        let methodRequiredFields = requiredFields,
          methodUrl = endpointUrl;
        // check to see whether schema method has extra data associated with it
        const isString = typeof schema[endpoint][method] === 'string';
        // the following methods should all have an "id" field associated with them
        // we will append the id field to the required fields for the method, and
        // add /{id} to the url, which will be replaced later with the passed in
        // field
        if (method === 'read' || method === 'update' || method === 'delete') {
          methodRequiredFields = [id].concat(requiredFields);
          methodUrl = endpointUrl + `/{${id}}`;
        }
        // the method may still have extra requiredFields needed to append
        if (!isString && schema[endpoint][method].requiredFields) {
          methodRequiredFields = methodRequiredFields.concat(schema[endpoint][method].requiredFields);
        }
        // determine the request method ('get', 'patch', 'delete', etc)
        const requestMethod = (isString ? schema[endpoint][method] : schema[endpoint][method].type).toLowerCase();
        API[endpoint][method] = this.generateMethod(methodRequiredFields, methodUrl, requestMethod);    
      }
    }
  }

  getAPI (opts) {
    opts = opts || {};
    this.accountId = opts.accountId || this.accountId;
    // create the base API
    const API = this.createEndpoints(schema);
    this.addMethodsToEndpoints(API, schema);
    return API;
  }

  /**
   * Handle common deepCrawl response codes
   *
   */
  handleResponse (res) {
    if (res.statusCode === 401) {
      throw new Error('The request is unauthorized.  Please authenticate and try again.');
    }
    if (res.statusCode === 404) {
      throw new Error('The item was not found.  Please check the url and try again.');
    }
    return res;
  }
}

module.exports = DeepCrawl;
